// Back-office « Validation » : tout ce que Will doit relire dans la base Veille (statut « À valider »).
// GET /api/admin/veille            → { items: [...], counts: { cat: n } }
// GET /api/admin/veille?count=1    → { n } (pastille verte de l'en-tête du site)
// POST /api/admin/veille {id, statut, texte?, categorie?} → change le statut (voir STATUTS) et, si fournis, le texte de la news
// (« Résumé site ») et sa catégorie.
import { text, date, num, rel, list, queryAll, slugSerie } from "../../../lib/notion.js";
import { handle } from "../../../lib/mentions.js";
import { json, isAdmin } from "../../../lib/admin.js";
import { CATEGORIES, categorie } from "../../../lib/categories.js";

const AUTEURS = { dataSource: "22b1c097-0ff0-496c-9540-26953780c522", database: "bbefc8a1431247788b2445de4265d36b" };
const PREPUB = { dataSource: "e4e66558-3cf0-41f1-afc2-5147566cbf3e", database: "f0b7c0f91f4d442597cbbb169b7abbda" };
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const EDITEURS = { dataSource: "16e967fc-8e7b-4b7c-ab98-6a25cbdcd75a", database: "c9dc1efdf33d4ad09711d20d55860d52" };
const VEILLE = { dataSource: "d748cac9-fdb0-4d44-87e8-cef34669f0b2", database: "50ef27c3205646baa1be24f4a6fc25d3" };
// Statuts de la base Veille (renommés le 04/10/2026, Will) :
//   « Publié sur le site » : la news est en ligne ; « À appliquer à la fiche » : changement de fiche approuvé, Claude l'applique
//   puis passe la ligne en « Appliqué » ; « Vu » : gardé mais pas publié ; « Rejeté » : écarté.
const STATUTS = ["Publié sur le site", "À appliquer à la fiche", "Vu", "Rejeté", "À valider"];
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 1900) } }] : [] });
const nid = id => id.replace(/-/g, "");

// Catégories : celles de Notion (lib/categories.js), plus les lignes internes (mise à jour de fiche, nouvelle série
// à créer) et les prépublications.
const INTERNES = { fiche: ["Mise à jour de fiche", "#98989D"], serie: ["Nouvelle série à créer", "#C49BF0"], prepub: ["Prépublication", "#E58AD1"] };
const CATS = Object.fromEntries([...CATEGORIES.map(c => [c.k, c.nom]), ...Object.entries(INTERNES).map(([k, v]) => [k, v[0]])]);
const COLS = Object.fromEntries([...CATEGORIES.map(c => [c.k, c.c]), ...Object.entries(INTERNES).map(([k, v]) => [k, v[1]])]);

// Titre court sur une ligne : sans les préfixes « News : », « Couverture dévoilée : »…
// (le nom de la catégorie est déjà en tête des légendes : on ne le répète pas dans le titre).
const court = prop => String(prop || "").replace(/^\s*(news|annonce|licence fr|nouvelle licence[^:]*|nouvelle série|fin de série|pause|adaptation|sortie (?:française|japonaise)|couverture (?:française|japonaise))\s*:\s*/i, "").replace(/^couverture dévoilée\s*:\s*/i, "").trim();

async function lister(env) {
  return queryAll(env.NOTION_TOKEN, { ...VEILLE, body: {
    // « Vu » : news gardées de côté (pas publiées), qu'on peut encore publier plus tard depuis le back-office.
    filter: { or: [{ property: "Statut", select: { equals: "À valider" } }, { property: "Statut", select: { equals: "Vu" } }] },
    sorts: [{ property: "Date de la news", direction: "descending" }],
  } });
}
// Prépublications (sorties en magazine) pas encore validées ni écartées.
async function listerPrepub(env) {
  return queryAll(env.NOTION_TOKEN, { ...PREPUB, body: {
    filter: { and: [{ property: "Validé", checkbox: { equals: false } }, { property: "Écarté", checkbox: { equals: false } }] },
    sorts: [{ property: "Date de sortie", direction: "descending" }],
  } }).catch(() => []);
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const [all, pRows] = await Promise.all([lister(env), listerPrepub(env)]);
  const vu = r => text(r.properties["Statut"]) === "Vu";
  // Gardées de côté : seulement les news (une mise à jour de fiche « Vu, rien à faire » est classée pour de bon).
  const rows = all.filter(r => !vu(r) || text(r.properties["Catégorie"]) || text(r.properties["Type"]) === "News");
  if (new URL(request.url).searchParams.has("count")) return json({ n: rows.filter(r => !vu(r)).length + pRows.length });
  // Séries liées : une seule requête sur la base Séries (pas une lecture par série : Cloudflare limite
  // le nombre de requêtes par appel, et au-delà les comptes des auteurs / éditeurs sautaient en silence).
  const ids = new Set([...rows, ...pRows].flatMap(r => rel(r.properties["Série"])));
  const series = {};
  if (ids.size) for (const r of await queryAll(env.NOTION_TOKEN, { ...SERIES }).catch(() => [])) {
    const id = nid(r.id); if (!ids.has(id)) continue;
    const p = r.properties || {};
    series[id] = {
      id, t: text(p["Titre FR"]) || text(p["SERIES"]), slug: slugSerie(p), jp: text(p["Titre Original"]), genres: list(p["Genre"]),
      resume: text(p["Résumé"]), resumeImg: text(p["Résumé image"]), resumeSortie: text(p["Résumé sortie"]),
      stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]), tomesJP: num(p["Tomes JP"]), tomesFR: num(p["Tomes FR"]),
      editeurs: rel(p["Éditeurs (fiches)"]), auteurs: rel(p["Auteurs"]), scen: text(p["Scénariste"]), dess: text(p["Dessinateur"]),
    };
  }
  const items = rows.map(r => {
    const p = r.properties || {};
    const type = text(p["Type"]), champ = text(p["Champ concerné"]), prop = text(p["Proposition"]);
    const vp = text(p["Valeur proposée"]), src = text(p["Source officielle"]);
    // News : une catégorie choisie dans Notion, ou une proposition de type « News ». Le reste est interne (fiche à mettre à jour).
    const catN = text(p["Catégorie"]), c = categorie({ cat: catN, type, champ, prop, vp, src });
    const news = !!catN || type === "News";
    const cat = c ? c.k : type === "Nouvelle série" ? "serie" : "fiche";
    const s = series[rel(p["Série"])[0]] || null;
    return {
      id: nid(r.id), notion: r.url, cat, label: CATS[cat], type, champ, titre: court(prop), prop,
      date: date(p["Date de la news"]), cree: (r.created_time || "").slice(0, 10), creeT: r.created_time || "",
      actuel: text(p["Valeur actuelle"]), propose: vp, texte: text(p["Résumé site"]),
      src, relais: text(p["Source relais"]), niveau: text(p["Niveau source"]),
      image: (vp.match(/https?:\/\/\S+?(?:\.(?:jpe?g|png|webp)|\/cover|snsbooks\/\d+)(?=[\s,)]|$)/i) || [])[0] || "",
      serie: s, news, vu: vu(r),
    };
  });
  // Couvertures et sorties : la couverture et la date viennent de la base Tomes (comme le calendrier).
  // Titre court : « Série T.03 ». Deux requêtes en tout : les éditions des séries concernées, puis leurs tomes.
  const tomeItems = items.filter(i => /^(couv|sortie)-/.test(i.cat) && i.serie);
  for (const i of tomeItems) { const m = i.prop.match(/\bT\.?\s?0*(\d+)\b|\btome\s+0*(\d+)/i); i._n = m ? Number(m[1] || m[2]) : null; }
  const sIds = [...new Set(tomeItems.map(i => i.serie.id))];
  const eRows = sIds.length ? await queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { or: sIds.slice(0, 100).map(id => ({ property: "Série", relation: { contains: id } })) } } }).catch(() => []) : [];
  const eds = eRows.map(e => ({ id: nid(e.id), serie: rel(e.properties["Série"])[0], pays: text(e.properties["Pays"]), pub: text(e.properties["Éditeur"]), tomes: [] }));
  const edById = Object.fromEntries(eds.map(e => [e.id, e]));
  const besoins = [];
  for (const i of tomeItems) if (i._n != null) for (const e of eds) if (e.serie === i.serie.id) besoins.push({ e: e.id, n: i._n });
  const tRows = besoins.length ? await queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { or: besoins.slice(0, 100).map(b => ({ and: [{ property: "Édition", relation: { contains: b.e } }, { property: "N°", number: { equals: b.n } }] })) } } }).catch(() => []) : [];
  for (const t of tRows) { const q = t.properties || {}, e = edById[rel(q["Édition"])[0]]; if (e) e.tomes.push({ n: num(q["N°"]), date: date(q["Date de sortie"]), prec: text(q["Précision date"]) || "Jour", cover: text(q["Couverture"]) }); }
  // Comptes des éditeurs (pour la ligne « X @… » et le 📣 d'Instagram / TikTok).
  const [edRows, auRows] = tomeItems.length ? await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...EDITEURS }).catch(() => []),
    queryAll(env.NOTION_TOKEN, { ...AUTEURS }).catch(() => []),
  ]) : [[], []];
  const auteurs = {};
  for (const a of auRows) { const q = a.properties || {};
    auteurs[nid(a.id)] = { x: handle(text(q["X (Twitter)"])), ig: handle(text(q["Instagram"])), tt: handle(text(q["TikTok"])) }; }
  const editeurs = {};
  for (const e of edRows) { const q = e.properties || {};
    editeurs[nid(e.id)] = { nom: text(q["Nom"]), type: text(q["Type"]), x: handle(text(q["X (Twitter)"])), ig: handle(text(q["Instagram"])), tt: handle(text(q["TikTok"])) }; }
  const norm = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const i of tomeItems) {
    const n = i._n; delete i._n;
    const pays = /-fr$/.test(i.cat) ? "France" : "Japon";
    if (n != null) i.titre = `${i.serie.t} T.${String(n).padStart(2, "0")}`;
    let t = null, pub = "";
    for (const e of eds.filter(e => e.serie === i.serie.id && e.pays === pays)) { const x = e.tomes.find(y => y.n === n && y.cover) || e.tomes.find(y => y.n === n); if (x && (!t || (!t.cover && x.cover))) { t = x; pub = e.pub; } }
    if (t) { if (t.cover) i.image = t.cover; i.sortie = t.date || ""; i.prec = t.prec; }
    // Premier ou dernier tome : seules infos ajoutées au post de sortie.
    const total = pays === "France" ? i.serie.tomesFR : i.serie.tomesJP, statut = pays === "France" ? i.serie.stFR : i.serie.stJP;
    const fin = /final|dernier|完結|termin/i.test(`${i.prop} ${i.champ} ${i.propose} ${i.texte}`) || (/termin/i.test(statut || "") && n && total && n === total);
    i.tome = { n, pays, pub: (pub || "").replace(/\s*\(.*$/, ""), flag: n === 1 ? "premier" : fin ? "dernier" : "" };
    // Éditeur du pays concerné (France → éditeur français, Japon → éditeur japonais).
    const cand = i.serie.editeurs.map(k => editeurs[k]).filter(Boolean).filter(e => pays === "France" ? /FR/.test(e.type) : /JP/.test(e.type));
    const ed = cand.find(e => norm(e.nom) && norm(pub).includes(norm(e.nom))) || cand.find(e => norm(e.nom) && norm(e.nom).includes(norm(pub).slice(0, 5))) || cand[0];
    // Comptes cités en fin de post : les auteurs d'abord, puis l'éditeur français s'il existe (jamais l'éditeur japonais).
    const frs = i.serie.editeurs.map(k => editeurs[k]).filter(e => e && /FR/.test(e.type));
    const fr = (pays === "France" && ed && /FR/.test(ed.type)) ? ed : frs[0];
    const aut = i.serie.auteurs.map(k => auteurs[nid(k)]).filter(Boolean);
    const uniq = l => [...new Set(l.filter(Boolean))];
    i.comptes = {
      x: uniq(aut.map(c => c.x)), xFR: fr && fr.x ? [fr.x] : [],
      ig: uniq([...aut.map(c => c.ig), fr && fr.ig]), tt: uniq([...aut.map(c => c.tt), fr && fr.tt]),
    };
  }
  // Prépublications : une carte par entrée de magazine (numéro, chapitre, mise en avant).
  for (const r of pRows) {
    const p = r.properties || {};
    items.push({
      id: nid(r.id), notion: r.url, cat: "prepub", label: CATS.prepub, base: "prepub", type: "Prépublication",
      titre: text(p["Entrée"]), prop: text(p["Entrée"]), date: date(p["Date de sortie"]), cree: (r.created_time || "").slice(0, 10), creeT: r.created_time || "",
      texte: text(p["Annonce du magazine"]), tweet: text(p["Tweet"]), src: text(p["Lien du numéro"]), relais: text(p["Page de la série"]),
      image: text(p["Couverture du numéro"]), serie: series[rel(p["Série"])[0]] || null, news: false,
      prepub: { mag: text(p["Magazine"]), num: text(p["Numéro"]), statut: text(p["Statut"]), ch: num(p["Chapitre"]), hl: list(p["Mise en avant"]), jp: text(p["Titre au sommaire"]), lire: text(p["Lecture en ligne"]) },
    });
  }
  // Ordre chronologique de repérage (date où la veille a trouvé l'info), jamais la date de sortie (Will, 04/10/2026).
  items.sort((a, b) => String(b.creeT || b.cree).localeCompare(String(a.creeT || a.cree)));
  const counts = {};
  items.forEach(i => { counts[i.cat] = (counts[i.cat] || 0) + 1; });
  return json({ items, counts, cats: CATS, cols: COLS });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  let b = {}; try { b = await request.json(); } catch (e) {}
  if (!/^[0-9a-f]{32}$/.test(b.id || "")) return json({ error: "élément inconnu" }, 400);
  // Prépublication : « Validé » coche la case Validé, « Vu » ou « Rejeté » coche Écarté.
  if (b.base === "prepub") {
    if (!["Validé", "Vu", "Rejeté"].includes(b.statut)) return json({ error: "statut inconnu" }, 400);
    const pp = b.statut === "Validé" ? { "Validé": { checkbox: true } } : { "Écarté": { checkbox: true } };
    if (typeof b.texte === "string") pp["Annonce du magazine"] = rt(b.texte.trim());
    const r = await fetch(`https://api.notion.com/v1/pages/${b.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({ properties: pp }),
    });
    if (!r.ok) return json({ error: "Notion a refusé : " + (await r.text()).slice(0, 300) }, 502);
    await caches.default.delete(new Request(new URL("/api/prepub", request.url).toString()));
    return json({ ok: true });
  }
  const props = {};
  if (b.statut) {
    if (!STATUTS.includes(b.statut)) return json({ error: "statut inconnu" }, 400);
    props["Statut"] = { select: { name: b.statut } };
  }
  if (typeof b.texte === "string") props["Résumé site"] = rt(b.texte.trim());
  if (b.categorie) {
    if (!CATEGORIES.some(c => c.nom === b.categorie)) return json({ error: "catégorie inconnue" }, 400);
    props["Catégorie"] = { select: { name: b.categorie } };
  }
  if (!Object.keys(props).length) return json({ error: "rien à changer" }, 400);
  const r = await fetch(`https://api.notion.com/v1/pages/${b.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ properties: props }),
  });
  if (!r.ok) return json({ error: "Notion a refusé : " + (await r.text()).slice(0, 300) }, 502);
  // Une news validée apparaît tout de suite sur le site.
  const c = caches.default;
  await Promise.all(["/api/news?v=2", "/api/crows", ...(/^[a-z0-9-]+$/.test(b.slug || "") ? ["/api/serie?s=" + b.slug] : [])].map(k => c.delete(new Request(new URL(k, request.url).toString()))));
  return json({ ok: true });
}
