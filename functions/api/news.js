// GET /api/news : news publiées par Will depuis la base Veille (Statut « Publié sur le site »).
// Catégorie : propriété « Catégorie » (mêmes noms et couleurs que dans Notion, voir lib/categories.js).
// Image : lien d'image de « Valeur proposée », sinon la couverture du tome concerné dans la base Tomes.
// Rien n'apparaît sur le site sans validation. Seule la source officielle est publiée (décision de Will, 02/10/2026).
import { text, date, rel, num, queryAll, cached } from "../../lib/notion.js";
import { categorie, categoriesDe } from "../../lib/categories.js";
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
  // Pas de reconstruction forcée pour Will (elle rendait les pages news lentes) : le back-office vide le cache à chaque changement.
  return cached(request, waitUntil, "/api/news?v=4", 600, async () => {
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
      const cat = categorie({ cat: text(p["Catégorie"]), type: text(p["Type"]), champ, prop, vp: val, src }) || categorie({ cat: "News" });
      const autres = categoriesDe(text(p["Catégorie"])).filter(c => c !== cat).map(c => ({ k: c.k, nom: c.nom, c: c.c }));
      const pubFull = s.editeurFR || (prop.match(/chez ([^,(]+?)(?: \(|,|$)/) || [])[1] || "";
      // Une série passée d'un éditeur à l'autre (« J'ai lu, Pika ») : la news ne cite que l'éditeur actuel,
      // celui de la source officielle s'il en fait partie, sinon le dernier de la liste.
      const pubs = pubFull.replace(/\s*\([^)]*\)/g, "").split(",").map(x => x.trim()).filter(Boolean);
      const srcPub = sourceName(src);
      const pub = pubs.find(x => srcPub && x.toLowerCase() === srcPub.toLowerCase()) || pubs[pubs.length - 1] || "";
      const label = (pubFull.match(/\(([^)]+)\)/) || prop.match(/\(([^)]+)\)/) || [])[1] || "";
      const t1 = (prop.match(/tome 1 le (\d{2}\/\d{2}\/\d{4})/i) || [])[1] || "";
      // Image : fichier .jpg/.png/.webp, ou adresse de couverture officielle sans extension (Shōgakukan snsbooks, Akita Shoten /cover).
      const cover = text(p["Image"]) || (val.match(/https?:\/\/\S+?(?:\.(?:jpe?g|png|webp)|\/cover|snsbooks\/\d+)(?=[\s,)]|$)/i) || [])[0] || "";
      const m = prop.match(/\bT\.?\s?0*(\d+)\b|\btome\s+0*(\d+)/i);
      return {
        // Date affichée : le jour où la veille a repéré l'info (ordre chronologique, Will 04/10/2026) ;
        // la date de sortie d'un tome reste dans le texte de la news.
        id: r.id.replace(/-/g, ""), cat: cat.k, catNom: cat.nom, catC: cat.c, cats: [{ k: cat.k, nom: cat.nom, c: cat.c }, ...autres], date: (r.created_time || "").slice(0, 10) || date(p["Date de la news"]), _t: r.created_time || "",
        titre: s.t || prop, fr: s.fr, jp: s.jp, pub, label, t1, cover, pos: p["Cadrage"] && p["Cadrage"].number != null ? p["Cadrage"].number : null, texte: text(p["Résumé site"]),
        // Source officielle (éditeur, magazine…) affichée sous la news ; la source relais reste dans Notion.
        src, srcName: sourceName(src),
        // Vidéo (trailer, PV) jouée dans la page de la news : propriété « Vidéo », sinon un lien YouTube de « Valeur proposée ».
        video: text(p["Vidéo"]) || (val.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}\S*/) || [])[0] || "",
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
    items.sort((a, b) => b._t.localeCompare(a._t));
    items.forEach(i => { delete i._sid; delete i._n; delete i._pays; delete i._t; });
    return { items };
  });
}
