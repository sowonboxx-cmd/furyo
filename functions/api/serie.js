// GET /api/serie?s=<slug> : fiche d'une série (base Séries) avec ses éditions (France / Japon) et tous leurs tomes.
// Rapide : un index slug → page (gardé en cache) évite de relire toute la base Séries à chaque fiche,
// puis la page série, ses éditions et ses tomes sont lus en parallèle.
// Les sources restent dans Notion : elles ne sont pas renvoyées.
import { text, num, date, rel, list, queryAll, cached, slugify } from "../../lib/notion.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const nid = id => id.replace(/-/g, "");

// Index slug → id de page, reconstruit au plus une fois par heure (en arrière-plan).
async function index(env, request, waitUntil, force) {
  const u = new URL("/api/serie-index" + (force ? "?refresh=1" : ""), request.url);
  const res = await cached(new Request(u), waitUntil, "/api/serie-index", 3600, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...SERIES });
    const map = {};
    for (const r of rows) {
      const p = r.properties || {};
      for (const t of [text(p["SERIES"]), text(p["Titre FR"])]) { const k = slugify(t); if (k && !map[k]) map[k] = r.id; }
    }
    return { map };
  });
  return (await res.json()).map || {};
}

async function page(token, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } });
  if (!r.ok) throw new Error("page " + r.status);
  return r.json();
}

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return json({ error: "NOTION_TOKEN manquant" }, 503);
  const slug = slugify(new URL(request.url).searchParams.get("s") || "");
  if (!slug) return json({ error: "série manquante" }, 400);
  return cached(request, waitUntil, "/api/serie?s=" + slug, 900, async () => {
    let map = await index(env, request, waitUntil, false);
    if (!map[slug]) map = await index(env, request, waitUntil, true); // série toute neuve : on relit l'index
    const id = map[slug];
    if (!id) return { error: "introuvable" };
    const row = await page(env.NOTION_TOKEN, id);
    const p = row.properties || {};
    const edIds = rel(p["Éditions"]);
    const [eRows, tRows] = await Promise.all([
      edIds.length ? queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { property: "Série", relation: { contains: id } } } }) : [],
      edIds.length ? queryAll(env.NOTION_TOKEN, { ...TOMES, body: {
        filter: { or: edIds.map(e => ({ property: "Édition", relation: { contains: e } })) },
        sorts: [{ property: "N°", direction: "ascending" }],
      } }) : [],
    ]);
    const serie = {
      id: nid(id), slug, t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]),
      resume: text(p["Résumé"]), scen: text(p["Scénariste"]), dess: text(p["Dessinateur"]),
      stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]), tomesJP: num(p["Tomes JP"]), tomesFR: num(p["Tomes FR"]),
      pubJP: list(p["Éditeur Japonais"]).join(", "), pubFR: list(p["Éditeur Français"]).join(", "),
      mag: text(p["Magazine"]), genres: list(p["Genre"]), type: text(p["Type"]), y1: num(p["Année Début"]), y2: num(p["Année Fin"]),
      prepub: date(p["Date début prépub JP"]), prepubFin: date(p["Date fin prépub JP"]), t1JP: date(p["Date tome 1 JP"]), t1FR: date(p["Date tome 1 FR"]),
      cover1: text(p["Couverture T1"]), fond: ((p["Fond de fiche"] || {}).files || []).length > 0, drama: text(p["Drama"]), film: text(p["Film live"]), anime: text(p["Anime"]), oav: text(p["OAV"]), jeux: text(p["Jeux vidéo"]),
      // « catégorie | libellé | lien » par ligne ; seuls les liens YouTube sont gardés.
      trailers: text(p["Trailers"]).split("\n").map(l => l.split("|").map(x => x.trim())).filter(a => a.length >= 2 && /youtu/.test(a[a.length - 1]))
        .map(a => ({ cat: slugify(a[0]).replace(/^jeu.*/, "jeux").replace(/^films?$/, "film"), nom: a.length > 2 ? a[1] : "", url: a[a.length - 1] })),
    };
    const editions = eRows.map(e => {
      const q = e.properties;
      return {
        id: nid(e.id), nom: text(q["Édition"]), pays: text(q["Pays"]), pub: text(q["Éditeur"]), label: text(q["Collection / Label"]),
        format: text(q["Format"]), statut: text(q["Statut"]), nb: num(q["Nb tomes"]), tomes: [],
      };
    });
    const byId = Object.fromEntries(editions.map(e => [e.id, e]));
    for (const r of tRows) {
      const q = r.properties, ed = byId[rel(q["Édition"])[0]];
      if (!ed) continue;
      ed.tomes.push({ n: num(q["N°"]), date: date(q["Date de sortie"]), prec: text(q["Précision date"]) || "Jour", cover: text(q["Couverture"]), titre: text(q["Titre du volume"]) });
    }
    editions.forEach(e => e.tomes.sort((a, b) => (a.n ?? 999) - (b.n ?? 999)));
    editions.sort((a, b) => (a.pays === b.pays ? b.tomes.length - a.tomes.length : a.pays === "France" ? -1 : 1));
    return { serie, editions };
  });
}
