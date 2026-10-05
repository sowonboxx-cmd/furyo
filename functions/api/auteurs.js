// GET /api/auteurs : la base Notion « FuryoGang — Auteurs » et les séries reliées.
// Les réseaux d'un auteur marqué « Réseaux réservés aux membres » ne sont pas envoyés.
import { text, num, date, check, rel, list, queryAll, cached, slugify } from "../../lib/notion.js";

const AUTEURS = { dataSource: "22b1c097-0ff0-496c-9540-26953780c522", database: "bbefc8a1431247788b2445de4265d36b" };
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };

// Photo : les liens vers nos propres fichiers (furyo.pages.dev, furyogang.com) deviennent des chemins du site, sans redirection.
const photoPath = u => (u || "").replace(/^https?:\/\/(www\.)?(furyo\.pages\.dev|furyogang\.com)(?=\/)/i, "");

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/auteurs", 300, async () => {
    const [aRows, sRows] = await Promise.all([
      queryAll(env.NOTION_TOKEN, { ...AUTEURS, body: { sorts: [{ property: "Auteur", direction: "ascending" }] } }),
      queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "Auteurs", relation: { is_not_empty: true } } } }),
    ]);
    const series = {};
    for (const r of sRows) {
      const p = r.properties || {};
      series[r.id.replace(/-/g, "")] = {
        t: text(p["SERIES"]), jp: text(p["Titre Original"]), fr: text(p["Titre FR"]),
        img: text(p["Couverture T1"]), stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]),
        vol: num(p["Tomes JP"]), volFr: num(p["Tomes FR"]), mag: text(p["Magazine"]),
        y1: num(p["Année Début"]), y2: num(p["Année Fin"]), univers: text(p["Univers"]),
      };
    }
    const authors = aRows.map(r => {
      const p = r.properties || {};
      const name = text(p["Auteur"]);
      const members = check(p["Réseaux réservés aux membres"]);
      const links = members ? {} : { x: text(p["X (Twitter)"]), ig: text(p["Instagram"]), site: text(p["Site officiel"]) };
      return {
        id: r.id.replace(/-/g, ""), slug: slugify(name), name, jp: text(p["Nom japonais"]), photo: photoPath(text(p["Photo"])), roles: list(p["Rôle"]),
        members, ...links, mu: text(p["MangaUpdates"]), anilist: text(p["AniList"]), checked: date(p["Réseaux vérifiés le"]),
        series: rel(p["Séries"]).map(id => series[id]).filter(Boolean),
      };
    }).filter(a => a.name);
    return { authors };
  });
}
