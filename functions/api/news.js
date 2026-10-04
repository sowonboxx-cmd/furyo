// GET /api/news : news publiées par Will depuis la base Veille (Statut « Publié sur le site »).
// Catégorie : propriété « Catégorie » (mêmes noms et couleurs que dans Notion, voir lib/categories.js).
// Image : lien d'image de « Valeur proposée », sinon la couverture du tome concerné dans la base Tomes.
// Rien n'apparaît sur le site sans validation. Seule la source officielle est publiée (décision de Will, 02/10/2026).
import { isAdmin } from "../../lib/admin.js";
import { text, date, rel, num, queryAll, cached } from "../../lib/notion.js";
import { categorie } from "../../lib/categories.js";
import { sourceName } from "../../lib/source.js";

const VEILLE = { dataSource: "d748cac9-fdb0-4d44-87e8-cef34669f0b2", database: "50ef27c3205646baa1be24f4a6fc25d3" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };

async function page(token, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } });
  return r.ok ? r.json() : null;
}

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  // Quand Will (connecté au back-office) ouvre le site, on reconstruit tout de suite : il voit toujours ses dernières validations.
  if (await isAdmin(request, env).catch(() => false)) request = new Request(new URL(request.url.replace(/[?&]refresh(=[^&]*)?/, "") + (request.url.includes("?") ? "&" : "?") + "refresh=1"), request);
  return cached(request, waitUntil, "/api/news?v=2", 600, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...VEILLE, body: {
      filter: { property: "Statut", select: { equals: "Publié sur le site" } },
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
      const champ = text(p["Champ concerné"]), prop = text(p["Proposition"]), val = text(p["Valeur proposée"]), src = text(p["Source officielle"]);
      const sid = rel(p["Série"])[0], s = series[sid] || {};
      const cat = categorie({ cat: text(p["Catégorie"]), type: text(p["Type"]), champ, prop, vp: val, src }) || categorie({ cat: "Annonce" });
      const pubFull = s.editeurFR || (prop.match(/chez ([^,(]+?)(?: \(|,|$)/) || [])[1] || "";
      // Une série passée d'un éditeur à l'autre (« J'ai lu, Pika ») : la news ne cite que l'éditeur actuel,
      // celui de la source officielle s'il en fait partie, sinon le dernier de la liste.
      const pubs = pubFull.replace(/\s*\([^)]*\)/g, "").split(",").map(x => x.trim()).filter(Boolean);
      const srcPub = sourceName(src);
      const pub = pubs.find(x => srcPub && x.toLowerCase() === srcPub.toLowerCase()) || pubs[pubs.length - 1] || "";
      const label = (pubFull.match(/\(([^)]+)\)/) || prop.match(/\(([^)]+)\)/) || [])[1] || "";
      const t1 = (prop.match(/tome 1 le (\d{2}\/\d{2}\/\d{4})/i) || [])[1] || "";
      const cover = (val.match(/https?:\/\/\S+?\.(?:jpe?g|png|webp)/i) || [])[0] || "";
      const m = prop.match(/\bT\.?\s?0*(\d+)\b|\btome\s+0*(\d+)/i);
      return {
        id: r.id.replace(/-/g, ""), cat: cat.k, catNom: cat.nom, catC: cat.c, date: date(p["Date de la news"]),
        titre: s.t || prop, fr: s.fr, jp: s.jp, pub, label, t1, cover, texte: text(p["Résumé site"]),
        // Source officielle (éditeur, magazine…) affichée sous la news ; la source relais reste dans Notion.
        src, srcName: sourceName(src),
        _sid: sid, _n: m ? Number(m[1] || m[2]) : null, _pays: /-jp$/.test(cat.k) ? "Japon" : "France",
      };
    });
    // Pas d'image dans la proposition : couverture du tome concerné (base Tomes), comme le back-office.
    const manque = items.filter(i => !i.cover && i._sid && i._n != null);
    if (manque.length) {
      const sIds = [...new Set(manque.map(i => i._sid))];
      const eds = (await queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { or: sIds.map(id => ({ property: "Série", relation: { contains: id } })) } } }).catch(() => []))
        .map(e => ({ id: e.id.replace(/-/g, ""), serie: rel(e.properties["Série"])[0], pays: text(e.properties["Pays"]) }));
      const want = [];
      for (const i of manque) for (const e of eds) if (e.serie === i._sid && e.pays === i._pays) want.push({ e: e.id, n: i._n });
      const tomes = want.length ? await queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { or: want.slice(0, 100).map(w => ({ and: [{ property: "Édition", relation: { contains: w.e } }, { property: "N°", number: { equals: w.n } }] })) } } }).catch(() => []) : [];
      for (const i of manque) {
        const mine = new Set(eds.filter(e => e.serie === i._sid && e.pays === i._pays).map(e => e.id));
        const t = tomes.find(t => mine.has(rel(t.properties["Édition"])[0]) && num(t.properties["N°"]) === i._n && text(t.properties["Couverture"]));
        if (t) i.cover = text(t.properties["Couverture"]);
      }
    }
    items.forEach(i => { delete i._sid; delete i._n; delete i._pays; });
    return { items };
  });
}
