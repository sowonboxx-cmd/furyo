// GET /api/prepub : les sorties en magazine validées par Will (base « FuryoGang — Prépublication », case Validé).
import { text, num, date, rel, list, queryAll, cached } from "../../lib/notion.js";

const PREPUB = { dataSource: "e4e66558-3cf0-41f1-afc2-5147566cbf3e", database: "f0b7c0f91f4d442597cbbb169b7abbda" };

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/prepub", 300, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...PREPUB, body: {
      filter: { property: "Validé", checkbox: { equals: true } },
      sorts: [{ property: "Date de sortie", direction: "descending" }],
      page_size: 60,
    } });
    const items = rows.slice(0, 60).map(r => {
      const p = r.properties || {};
      return {
        entry: text(p["Entrée"]), jp: text(p["Titre au sommaire"]), mag: text(p["Magazine"]), issue: text(p["Numéro"]),
        date: date(p["Date de sortie"]), status: text(p["Statut"]), ch: num(p["Chapitre"]),
        link: text(p["Lien du numéro"]), page: text(p["Page de la série"]), cover: text(p["Couverture du numéro"]),
        read: text(p["Lecture en ligne"]), series: rel(p["Série"]),
        hl: list(p["Mise en avant"]), note: text(p["Annonce du magazine"]),
      };
    });
    return { items };
  });
}
