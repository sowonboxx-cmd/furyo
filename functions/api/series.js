// GET /api/series : liste des séries qui ont au moins une édition, avec la couverture de leur tome 1 (France d'abord).
import { text, num, rel, list, queryAll, cached, slugify } from "../../lib/notion.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const nid = id => id.replace(/-/g, "");

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/series?v=2", 600, async () => {
    const [sRows, eRows, tRows] = await Promise.all([
      queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "Éditions", relation: { is_not_empty: true } } } }),
      queryAll(env.NOTION_TOKEN, { ...EDITIONS }),
      queryAll(env.NOTION_TOKEN, { ...TOMES, body: { sorts: [{ property: "N°", direction: "ascending" }] } }),
    ]);
    const eds = {};
    for (const e of eRows) eds[nid(e.id)] = { pays: text(e.properties["Pays"]), serie: rel(e.properties["Série"])[0] };
    // Couverture : le plus petit numéro de tome, France avant Japon.
    const pays = {};
    for (const e of Object.values(eds)) if (e.serie) (pays[e.serie] = pays[e.serie] || new Set()).add(e.pays);
    const best = {};
    for (const t of tRows) {
      const q = t.properties, ed = eds[rel(q["Édition"])[0]], cov = text(q["Couverture"]); if (!ed || !ed.serie || !cov) continue;
      const n = num(q["N°"]) ?? 999, score = n * 2 + (ed.pays === "France" ? 0 : 1);
      if (!best[ed.serie] || score < best[ed.serie].score) best[ed.serie] = { score, cover: cov };
    }
    const items = sRows.map(r => {
      const p = r.properties, id = nid(r.id), t = text(p["SERIES"]);
      return { slug: slugify(t), t, jp: text(p["Titre Original"]), stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]),
        pubFR: list(p["Éditeur Français"]).join(", "), cover: best[id]?.cover || text(p["Couverture T1"]),
        type: text(p["Type"]), genres: list(p["Genre"]), y1: num(p["Année Début"]),
        // Pays : une édition dans ce pays, ou (France) une licence en cours / terminée / annoncée.
        inFR: (pays[id]?.has("France") || /cours|termin|stopp|annonc/i.test(text(p["Statut France"]))) ? 1 : 0,
        inJP: (pays[id]?.has("Japon") || !!text(p["Statut Japon"])) ? 1 : 0,
        fr: text(p["Titre FR"]) };
    }).filter(s => s.t).sort((a, b) => (a.fr || a.t).localeCompare(b.fr || b.t, "fr"));
    return { items };
  });
}
