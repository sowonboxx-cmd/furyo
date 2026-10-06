// Bibliothèque « Ma collection » (Will, 06/10/2026) : le catalogue des mangas qu'on peut collectionner.
// Mêmes bases que les fiches séries (Éditions, Tomes) : rien n'est dupliqué. Une série se collectionne dès qu'elle a
// une édition, même si sa fiche n'est pas encore en ligne (« fiche » dit si le lien « Voir la fiche » existe).
//   GET /api/biblio          → { items: [{ id, t, fr, jp, slug, cover, genres, type, y1, pays, fiche }] }
//   GET /api/biblio?id=<id>  → { serie, editions: [{ id, nom, pays, pub, label, nb, statut, tomes: [{ id, n, date, cover, paru }] }] }
import { text, num, date, rel, list, queryAll, cached, slugSerie } from "../../lib/notion.js";
import { estVisible } from "../../lib/site.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const nid = id => id.replace(/-/g, "");
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const PAYS_ORDRE = p => (p === "France" ? 0 : 1);
// Les éditions marquées « [À SUPPRIMER] » dans Notion ne comptent pas.
const ok = e => !/^\[À SUPPRIMER\]/i.test(text(e.properties["Édition"]));

async function catalogue(env) {
  const [sRows, eRows, t1] = await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "Éditions", relation: { is_not_empty: true } } } }),
    queryAll(env.NOTION_TOKEN, { ...EDITIONS }),
    queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { property: "N°", number: { equals: 1 } } } }),
  ]);
  const cov = {};
  for (const t of t1) { const c = text(t.properties["Couverture"]); if (c) rel(t.properties["Édition"]).forEach(e => { cov[e] = cov[e] || c; }); }
  const parSerie = {};
  for (const e of eRows.filter(ok)) { const p = e.properties; for (const s of rel(p["Série"])) (parSerie[s] = parSerie[s] || []).push({ id: nid(e.id), pays: text(p["Pays"]) }); }
  const items = [];
  for (const r of sRows) {
    const p = r.properties || {}, id = nid(r.id), eds = (parSerie[id] || []).sort((a, b) => PAYS_ORDRE(a.pays) - PAYS_ORDRE(b.pays));
    if (!eds.length || !text(p["SERIES"])) continue;
    const cover = (eds.map(e => cov[e.id]).find(Boolean)) || text(p["Couverture T1"]);
    items.push({ id, t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugSerie(p), cover,
      genres: list(p["Genre"]), type: text(p["Type"]), y1: num(p["Année Début"]), pays: [...new Set(eds.map(e => e.pays))], fiche: estVisible(p) ? 1 : 0 });
  }
  items.sort((a, b) => (a.fr || a.t).localeCompare(b.fr || b.t, "fr"));
  return { items };
}

async function detail(env, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" } });
  if (!r.ok) return { error: "introuvable" };
  const p = (await r.json()).properties || {};
  const eRows = (await queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { property: "Série", relation: { contains: id } } } })).filter(ok);
  if (!eRows.length) return { error: "introuvable" };
  const editions = await Promise.all(eRows.map(async e => {
    const q = e.properties, tRows = await queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { property: "Édition", relation: { contains: nid(e.id) } }, sorts: [{ property: "N°", direction: "ascending" }] } });
    const today = new Date().toISOString().slice(0, 10);
    return { id: nid(e.id), nom: text(q["Édition"]), pays: text(q["Pays"]), pub: text(q["Éditeur"]), label: text(q["Collection / Label"]), nb: num(q["Nb tomes"]), statut: text(q["Statut"]),
      tomes: tRows.map(t => { const x = t.properties, d = date(x["Date de sortie"]); return { id: nid(t.id), n: num(x["N°"]), date: d, cover: text(x["Couverture"]),
        paru: text(x["Statut"]) === "Paru" || (!!d && d <= today) ? 1 : 0 }; }).filter(t => t.n != null) };
  }));
  editions.sort((a, b) => PAYS_ORDRE(a.pays) - PAYS_ORDRE(b.pays));
  return { serie: { id, t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugSerie(p), fiche: estVisible(p) ? 1 : 0,
    auteurs: [...new Set([text(p["Scénariste"]), text(p["Dessinateur"])].filter(Boolean))].join(" & "), cover1: text(p["Couverture T1"]) }, editions };
}

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return json({ error: "NOTION_TOKEN manquant" }, 503);
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    if (!/^[0-9a-f]{32}$/.test(id)) return json({ error: "série inconnue" }, 400);
    return cached(request, waitUntil, "/api/biblio?v=1&id=" + id, 120, () => detail(env, id));
  }
  return cached(request, waitUntil, "/api/biblio?v=1", 600, () => catalogue(env));
}
