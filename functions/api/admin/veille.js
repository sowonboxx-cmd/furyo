// Back-office « Validation » : tout ce que Will doit relire dans la base Veille (statut « À valider »).
// GET /api/admin/veille            → { items: [...], counts: { cat: n } }
// GET /api/admin/veille?count=1    → { n } (pastille verte de l'en-tête du site)
// POST /api/admin/veille {id, statut, texte?} → change le statut (Validé, Vu, Rejeté) et, si fourni, le texte de la news (Résumé FR).
import { text, date, num, rel, list, queryAll, slugSerie } from "../../../lib/notion.js";
import { handle } from "../../../lib/mentions.js";
import { json, isAdmin } from "../../../lib/admin.js";

const AUTEURS = { dataSource: "22b1c097-0ff0-496c-9540-26953780c522", database: "bbefc8a1431247788b2445de4265d36b" };
const EDITEURS = { dataSource: "16e967fc-8e7b-4b7c-ab98-6a25cbdcd75a", database: "c9dc1efdf33d4ad09711d20d55860d52" };
const VEILLE = { dataSource: "d748cac9-fdb0-4d44-87e8-cef34669f0b2", database: "50ef27c3205646baa1be24f4a6fc25d3" };
const STATUTS = ["Validé", "Vu", "Rejeté", "À valider"];
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 1900) } }] : [] });
const nid = id => id.replace(/-/g, "");

// Catégories affichées en pastille (ordre des filtres dans le back-office).
const CATS = {
  couvJP: "Couverture JP", couvFR: "Couverture FR", sortieJP: "Sortie JP", sortieFR: "Sortie FR",
  annFR: "Annonce FR", annJP: "Annonce JP", fin: "Fin de série", serie: "Nouvelle série", fiche: "Fiche", news: "News",
};

// Pays d'une proposition : mention explicite, sinon le site de la source officielle.
function pays(prop, src) {
  if (/\(France\)|\bFR\b|VF/.test(prop)) return "FR";
  if (/\(Japon\)|\bJP\b/.test(prop)) return "JP";
  let h = ""; try { h = new URL(src).hostname; } catch (e) {}
  if (/\.jp$|bookwalker|prtimes/.test(h)) return "JP";
  if (/\.fr$|kana|akata|pika|meian|ki-oon|kioon|delcourt|panini|mangetsu|kazemanga|glenat|kurokawa/.test(h)) return "FR";
  return "JP";
}

function categorie(type, champ, prop, vp, src) {
  const p = pays(prop, src), all = `${champ} ${prop}`;
  if (type === "Nouvelle série") return "serie";
  if (type === "Mise à jour fiche") return /termin|final|完結/i.test(`${prop} ${vp}`) ? "fin" : "fiche";
  if (type === "Nouvelle édition / tome") return /couverture/i.test(all) ? "couv" + p : "sortie" + p;
  if (type === "News") {
    if (/couverture/i.test(prop)) return "couv" + p;
    if (/annonce fr|licence/i.test(champ)) return "annFR";
    if (/annonce jp/i.test(champ)) return "annJP";
    if (/termin|final|完結/i.test(prop)) return "fin";
    return "news";
  }
  return "news";
}

// Titre court sur une ligne : sans les préfixes « News : », « Couverture dévoilée : »…
const court = prop => String(prop || "").replace(/^\s*(news|licence fr|nouvelle série)\s*:\s*/i, "").replace(/^couverture dévoilée\s*:\s*/i, "").trim();

async function lister(env) {
  return queryAll(env.NOTION_TOKEN, { ...VEILLE, body: {
    filter: { property: "Statut", select: { equals: "À valider" } },
    sorts: [{ property: "Date de la news", direction: "descending" }],
  } });
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const rows = await lister(env);
  if (new URL(request.url).searchParams.has("count")) return json({ n: rows.length });
  // Titre et adresse des séries liées (une lecture par série).
  const ids = [...new Set(rows.flatMap(r => rel(r.properties["Série"])))];
  const series = {};
  await Promise.all(ids.map(async id => {
    const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" } }).catch(() => null);
    if (!r || !r.ok) return;
    const p = (await r.json()).properties || {};
    series[id] = {
      id, t: text(p["Titre FR"]) || text(p["SERIES"]), slug: slugSerie(p), jp: text(p["Titre Original"]), genres: list(p["Genre"]),
      resume: text(p["Résumé"]), resumeImg: text(p["Résumé image"]), resumeSortie: text(p["Résumé sortie"]),
      stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]), tomesJP: num(p["Tomes JP"]), tomesFR: num(p["Tomes FR"]),
      editeurs: rel(p["Éditeurs (fiches)"]), auteurs: rel(p["Auteurs"]),
    };
  }));
  const items = rows.map(r => {
    const p = r.properties || {};
    const type = text(p["Type"]), champ = text(p["Champ concerné"]), prop = text(p["Proposition"]);
    const vp = text(p["Valeur proposée"]), src = text(p["Source officielle"]);
    const cat = categorie(type, champ, prop, vp, src);
    const s = series[rel(p["Série"])[0]] || null;
    return {
      id: nid(r.id), notion: r.url, cat, label: CATS[cat], type, champ, titre: court(prop), prop,
      date: date(p["Date de la news"]), cree: (r.created_time || "").slice(0, 10),
      actuel: text(p["Valeur actuelle"]), propose: vp, texte: text(p["Résumé FR"]),
      src, relais: text(p["Source relais"]), niveau: text(p["Niveau source"]),
      image: (vp.match(/https?:\/\/\S+?(?:\.(?:jpe?g|png|webp)|\/cover|snsbooks\/\d+)(?=[\s,)]|$)/i) || [])[0] || "",
      serie: s, news: type === "News",
    };
  });
  // Couvertures et sorties : la couverture et la date viennent de la base Tomes (comme le calendrier),
  // via la fiche série en cache. Titre court : « Série T.03 ».
  const tomeItems = items.filter(i => /^(couv|sortie)/.test(i.cat) && i.serie);
  const slugs = [...new Set(tomeItems.map(i => i.serie.slug))];
  const fiches = {};
  await Promise.all(slugs.map(async sl => {
    const r = await fetch(new URL("/api/serie?s=" + encodeURIComponent(sl), request.url).toString(), { headers: { cookie: "" } }).catch(() => null);
    if (r && r.ok) fiches[sl] = await r.json().catch(() => null);
  }));
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
    const m = i.prop.match(/\bT\.?\s?0*(\d+)\b|\btome\s+0*(\d+)/i);
    const n = m ? Number(m[1] || m[2]) : null;
    const pays = /FR$/.test(i.cat) ? "France" : "Japon";
    if (n != null) i.titre = `${i.serie.t} T.${String(n).padStart(2, "0")}`;
    const eds = ((fiches[i.serie.slug] || {}).editions || []).filter(e => e.pays === pays);
    let t = null, pub = "";
    for (const e of eds) { const x = e.tomes.find(y => y.n === n && y.cover) || e.tomes.find(y => y.n === n); if (x && (!t || (!t.cover && x.cover))) { t = x; pub = e.pub; } }
    if (t) { if (t.cover) i.image = t.cover; i.sortie = t.date || ""; }
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
  const counts = {};
  items.forEach(i => { counts[i.cat] = (counts[i.cat] || 0) + 1; });
  return json({ items, counts, cats: CATS });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  let b = {}; try { b = await request.json(); } catch (e) {}
  if (!/^[0-9a-f]{32}$/.test(b.id || "")) return json({ error: "élément inconnu" }, 400);
  const props = {};
  if (b.statut) {
    if (!STATUTS.includes(b.statut)) return json({ error: "statut inconnu" }, 400);
    props["Statut"] = { select: { name: b.statut } };
  }
  if (typeof b.texte === "string") props["Résumé FR"] = rt(b.texte.trim());
  if (!Object.keys(props).length) return json({ error: "rien à changer" }, 400);
  const r = await fetch(`https://api.notion.com/v1/pages/${b.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ properties: props }),
  });
  if (!r.ok) return json({ error: "Notion a refusé : " + (await r.text()).slice(0, 300) }, 502);
  // Une news validée apparaît tout de suite sur le site.
  const c = caches.default;
  await Promise.all(["/api/news", ...(/^[a-z0-9-]+$/.test(b.slug || "") ? ["/api/serie?s=" + b.slug] : [])].map(k => c.delete(new Request(new URL(k, request.url).toString()))));
  return json({ ok: true });
}
