// GET /api/news : news validées par Will dans la base Veille (Statut « Validé » ou « Appliqué », Type « News »).
// Rien n'apparaît sur le site sans validation. Seule la source officielle est publiée (décision de Will, 02/10/2026).
import { text, date, rel, queryAll, cached } from "../../lib/notion.js";
import { sourceName } from "../../lib/source.js";

const VEILLE = { dataSource: "d748cac9-fdb0-4d44-87e8-cef34669f0b2", database: "50ef27c3205646baa1be24f4a6fc25d3" };

async function page(token, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } });
  return r.ok ? r.json() : null;
}

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/news", 600, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...VEILLE, body: {
      filter: { and: [
        { property: "Type", select: { equals: "News" } },
        { or: [{ property: "Statut", select: { equals: "Validé" } }, { property: "Statut", select: { equals: "Appliqué" } }] },
      ] },
      sorts: [{ property: "Date de la news", direction: "descending" }],
    } });
    const ids = [...new Set(rows.flatMap(r => rel(r.properties["Série"])))];
    const series = {};
    await Promise.all(ids.map(async id => {
      const p = (await page(env.NOTION_TOKEN, id))?.properties || {};
      series[id] = { t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), editeurFR: text(p["Éditeur Français"]) };
    }));
    const items = rows.map(r => {
      const p = r.properties || {};
      const champ = text(p["Champ concerné"]), prop = text(p["Proposition"]), val = text(p["Valeur proposée"]);
      const s = series[rel(p["Série"])[0]] || {};
      const licence = /licence/i.test(champ + " " + prop);
      const pubFull = s.editeurFR || (prop.match(/chez ([^,(]+?)(?: \(|,|$)/) || [])[1] || "";
      const pub = pubFull.replace(/\s*\(.*$/, "").trim();
      const label = (pubFull.match(/\(([^)]+)\)/) || prop.match(/\(([^)]+)\)/) || [])[1] || "";
      const t1 = (prop.match(/tome 1 le (\d{2}\/\d{2}\/\d{4})/i) || [])[1] || "";
      const cover = (val.match(/https?:\/\/\S+?\.(?:jpe?g|png|webp)/i) || [])[0] || "";
      return {
        id: r.id.replace(/-/g, ""), type: licence ? "licence" : "news", date: date(p["Date de la news"]),
        titre: s.t || prop, fr: s.fr, jp: s.jp, pub, label, t1, cover, texte: text(p["Résumé FR"]),
        // Source officielle (éditeur, magazine…) affichée sous la news ; la source relais reste dans Notion.
        src: text(p["Source officielle"]), srcName: sourceName(text(p["Source officielle"])),
      };
    });
    return { items };
  });
}
