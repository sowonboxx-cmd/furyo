// Back-office « Validation » : tout ce que Will doit relire dans la base Veille (statut « À valider »).
// GET /api/admin/veille            → { items: [...], counts: { cat: n } }
// GET /api/admin/veille?count=1    → { n } (pastille verte de l'en-tête du site)
// POST /api/admin/veille {id, statut, texte?} → change le statut (Validé, Vu, Rejeté) et, si fourni, le texte de la news (Résumé FR).
import { text, date, rel, queryAll, slugSerie } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";

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
    series[id] = { t: text(p["Titre FR"]) || text(p["SERIES"]), slug: slugSerie(p) };
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
