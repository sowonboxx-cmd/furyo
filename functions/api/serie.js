// GET /api/serie?s=<slug> : fiche d'une série (base Séries) avec ses éditions (France / Japon) et tous leurs tomes.
// Rapide : un index slug → page (gardé en cache) évite de relire toute la base Séries à chaque fiche,
// puis la page série, ses éditions et ses tomes sont lus en parallèle.
// Les sources restent dans Notion : elles ne sont pas renvoyées.
import { text, num, date, rel, list, queryAll, cached, slugify, slugSerie } from "../../lib/notion.js";
import { estVisible, estValidee } from "../../lib/site.js";
import { isAdmin } from "../../lib/admin.js";
import { sourceName } from "../../lib/source.js";
import { categorie } from "../../lib/categories.js";
import { credits } from "../../lib/credit.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const VEILLE = { dataSource: "d748cac9-fdb0-4d44-87e8-cef34669f0b2", database: "50ef27c3205646baa1be24f4a6fc25d3" };
const PREPUB = { dataSource: "e4e66558-3cf0-41f1-afc2-5147566cbf3e", database: "f0b7c0f91f4d442597cbbb169b7abbda" };
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

// Série d'origine : d'abord le champ « Œuvre mère », sinon la « Série principale » du même « Univers ».
const souple = t => slugify(t).replace(/ou/g, "o").replace(/uu/g, "u").replace(/oo/g, "o");
const AD = ["Drama", "Film live", "Anime", "OAV", "Jeux vidéo"];
async function serieMere(token, p, id, map) {
  const mere = text(p["Œuvre mère"]), univ = text(p["Univers"]), rela = text(p["Relation"]);
  if (!mere && !univ) return null;
  if (/principale/i.test(rela) && !mere) return null;
  let m = null;
  // 1) « Œuvre mère » retrouvée dans l'index des séries (titre ou titre français, à l'orthographe près : ō/ou, uu…).
  if (mere) { const k = Object.keys(map).find(k => souple(k) === souple(mere)); if (k && nid(map[k]) !== nid(id)) m = await page(token, map[k]); }
  // 2) Sinon la « Série principale » du même univers.
  if (!m && univ) {
    const rows = await queryAll(token, { ...SERIES, body: { filter: { and: [{ property: "Univers", rich_text: { equals: univ } }, { property: "Relation", rich_text: { contains: "principale" } }] } } });
    m = rows.find(r => nid(r.id) !== nid(id)) || null;
  }
  if (!m) return null;
  const q = m.properties;
  if (!AD.some(k => /\S/.test(text(q[k])) && !/^(aucun|non|-)/i.test(text(q[k]).trim()))) return null;
  return { t: text(q["SERIES"]), fr: text(q["Titre FR"]), slug: slugSerie(q), visible: estVisible(q),
    drama: text(q["Drama"]), film: text(q["Film live"]), anime: text(q["Anime"]), oav: text(q["OAV"]), jeux: text(q["Jeux vidéo"]) };
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
  const estAdmin = await isAdmin(request, env).catch(() => false);
  const admin = estAdmin;
  const build = async () => {
    let map = await index(env, request, waitUntil, false);
    if (!map[slug]) map = await index(env, request, waitUntil, true); // série toute neuve : on relit l'index
    const id = map[slug];
    if (!id) return { error: "introuvable" };
    const row = await page(env.NOTION_TOKEN, id);
    const p = row.properties || {};
    if (!estVisible(p) && !(admin && estValidee(p))) return { error: "introuvable" };
    const edIds = rel(p["Éditions"]);
    const [eRows, tRows, nRows, bRows] = await Promise.all([
      edIds.length ? queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { property: "Série", relation: { contains: id } } } }) : [],
      edIds.length ? queryAll(env.NOTION_TOKEN, { ...TOMES, body: {
        filter: { or: edIds.map(e => ({ property: "Édition", relation: { contains: e } })) },
        sorts: [{ property: "N°", direction: "ascending" }],
      } }) : [],
      // News validées de la série (onglet News de la fiche).
      queryAll(env.NOTION_TOKEN, { ...VEILLE, body: {
        filter: { and: [
          { property: "Série", relation: { contains: id } },
          { property: "Statut", select: { equals: "Publié sur le site" } },
        ] },
        sorts: [{ property: "Date de la news", direction: "descending" }],
      } }).catch(() => []),
      // Brèves (Will, 05/10/2026) : les chapitres sortis au Japon (prépublications validées), en petit sous les vraies news.
      queryAll(env.NOTION_TOKEN, { ...PREPUB, body: {
        filter: { and: [{ property: "Série", relation: { contains: id } }, { property: "Validé", checkbox: { equals: true } }] },
        sorts: [{ property: "Date de sortie", direction: "descending" }], page_size: 12,
      } }).catch(() => []),
    ]);
    const serie = {
      id: nid(id), slug: slugSerie(p), t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]),
      resume: text(p["Résumé"]), resumeImg: text(p["Résumé image"]), scen: text(p["Scénariste"]), dess: text(p["Dessinateur"]),
      stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]), tomesJP: num(p["Tomes JP"]), tomesFR: num(p["Tomes FR"]),
      pubJP: list(p["Éditeur Japonais"]).join(", "), pubFR: list(p["Éditeur Français"]).join(", "),
      mag: text(p["Magazine"]), genres: list(p["Genre"]), type: text(p["Type"]), y1: num(p["Année Début"]), y2: num(p["Année Fin"]),
      prepub: date(p["Date début prépub JP"]), prepubFin: date(p["Date fin prépub JP"]), t1JP: date(p["Date tome 1 JP"]), t1FR: date(p["Date tome 1 FR"]),
      cover1: text(p["Couverture T1"]), extraitJP: text(p["Lecture essai (試し読み)"]), extraitFR: text(p["Extrait FR"]), drama: text(p["Drama"]), film: text(p["Film live"]), anime: text(p["Anime"]), oav: text(p["OAV"]), jeux: text(p["Jeux vidéo"]),
      // « catégorie | libellé | lien » par ligne ; seuls les liens YouTube sont gardés.
      trailers: text(p["Trailers"]).split("\n").map(l => l.split("|").map(x => x.trim())).filter(a => a.length >= 2 && /youtu/.test(a[a.length - 1]))
        .map(a => ({ cat: slugify(a[0]).replace(/^jeu.*/, "jeux").replace(/^films?$/, "film"), nom: a.length > 2 ? a[1] : "", url: a[a.length - 1] })),
    };
    // Adaptations de la série d'origine (suite, préquelle, spin-off) : on les affiche aussi sur la fiche.
    if (!estVisible(p)) serie.apercu = true;
    serie.mere = await serieMere(env.NOTION_TOKEN, p, id, map).catch(() => null);
    const editions = eRows.map(e => {
      const q = e.properties;
      return {
        id: nid(e.id), nom: text(q["Édition"]), pays: text(q["Pays"]), pub: text(q["Éditeur"]), label: text(q["Collection / Label"]),
        format: text(q["Format"]), statut: text(q["Statut"]), nb: num(q["Nb tomes"]), part: text(q["Particularités"]), tomes: [],
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
    serie.news = nRows.slice().sort((a, b) => String(b.created_time).localeCompare(String(a.created_time))).map(r => {
      const q = r.properties || {}, champ = text(q["Champ concerné"]), prop = text(q["Proposition"]);
      const c = categorie({ cat: text(q["Catégorie"]), type: text(q["Type"]), champ, prop, vp: text(q["Valeur proposée"]), src: text(q["Source officielle"]) }) || categorie({ cat: "News" });
      return { id: nid(r.id), cat: c.nom, catC: c.c, date: (r.created_time || "").slice(0, 10) || date(q["Date de la news"]), titre: prop.replace(/^\s*(licence\s*fr|news|couverture dévoilée)\s*:\s*/i, ""), texte: text(q["Résumé site"]), src: text(q["Source officielle"]), srcName: sourceName(text(q["Source officielle"])) };
    });
    const noLib = u => /bookwalker|cmoa|ebookjapan|amazon/i.test(u) ? "" : u;
    // Crédits des couvertures (Japon / France), générés à partir des auteurs et des éditeurs.
    const auRows = (await Promise.all(rel(p["Auteurs"]).slice(0, 4).map(a => page(env.NOTION_TOKEN, a).catch(() => null)))).filter(Boolean);
    serie.credit = credits(serie, auRows.map(a => ({ name: text(a.properties["Auteur"]), jp: text(a.properties["Nom japonais"]) })));
    serie.breves = bRows.slice(0, 12).map(r => { const q = r.properties || {};
      return { date: date(q["Date de sortie"]), mag: text(q["Magazine"]), num: text(q["Numéro"]), ch: num(q["Chapitre"]), statut: text(q["Statut"]),
        fin: list(q["Mise en avant"]).includes("Dernier chapitre"), read: noLib(text(q["Lecture en ligne"])), lien: noLib(text(q["Page de la série"]) || text(q["Lien du numéro"])) };
    }).filter(b => b.date);
    return { serie, editions };
  };
  // Aperçu admin (après le lancement) : réponse directe, jamais mise dans le cache partagé.
  if (admin) return new Response(JSON.stringify({ synced: new Date().toISOString(), ...(await build()) }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  // Avant le lancement, quand l'administrateur ouvre une fiche, on la reconstruit tout de suite et on met à jour
  // le cache de sa région (le cache Cloudflare est propre à chaque centre de données) : il voit toujours la dernière version.
  // Admin : la fiche prête est servie tout de suite et reconstruite en arrière-plan si elle a plus de 30 s (Will, 07/10/2026).
  return cached(request, waitUntil, "/api/serie?s=" + slug, estAdmin ? 30 : 900, build);
}
