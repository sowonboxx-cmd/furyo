// GET /api/serie?s=<slug> : fiche d'une série (base Séries) avec ses éditions (France / Japon) et tous leurs tomes.
// Le slug vient du titre SERIES (ou du titre FR). Les sources restent dans Notion : elles ne sont pas renvoyées.
import { text, num, date, rel, list, queryAll, cached, slugify } from "../../lib/notion.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const nid = id => id.replace(/-/g, "");

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return json({ error: "NOTION_TOKEN manquant" }, 503);
  const slug = slugify(new URL(request.url).searchParams.get("s") || "");
  if (!slug) return json({ error: "série manquante" }, 400);
  return cached(request, waitUntil, "/api/serie?s=" + slug, 600, async () => {
    const sRows = await queryAll(env.NOTION_TOKEN, { ...SERIES });
    const row = sRows.find(r => slugify(text(r.properties["SERIES"])) === slug) || sRows.find(r => slugify(text(r.properties["Titre FR"])) === slug);
    if (!row) return { error: "introuvable" };
    const p = row.properties;
    const serie = {
      id: nid(row.id), slug, t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]),
      resume: text(p["Résumé"]), scen: text(p["Scénariste"]), dess: text(p["Dessinateur"]),
      stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]), tomesJP: num(p["Tomes JP"]), tomesFR: num(p["Tomes FR"]),
      pubJP: list(p["Éditeur Japonais"]).join(", "), pubFR: list(p["Éditeur Français"]).join(", "),
      mag: text(p["Magazine"]), genres: list(p["Genre"]), type: text(p["Type"]), y1: num(p["Année Début"]),
      cover1: text(p["Couverture T1"]), drama: text(p["Drama"]), film: text(p["Film live"]), anime: text(p["Anime"]),
    };
    const edIds = rel(p["Éditions"]);
    const eRows = edIds.length ? await queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { property: "Série", relation: { contains: row.id } } } }) : [];
    const tRows = eRows.length ? await queryAll(env.NOTION_TOKEN, { ...TOMES, body: {
      filter: { or: eRows.map(e => ({ property: "Édition", relation: { contains: e.id } })) },
      sorts: [{ property: "N°", direction: "ascending" }],
    } }) : [];
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
    // France d'abord, puis Japon ; à pays égal, l'édition qui a le plus de tomes.
    editions.sort((a, b) => (a.pays === b.pays ? b.tomes.length - a.tomes.length : a.pays === "France" ? -1 : 1));
    return { serie, editions };
  });
}
