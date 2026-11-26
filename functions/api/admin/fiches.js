// Planning des fiches séries (Will, 25/11/2026) : partagé entre Mangas Database (vue Ordre / Calendrier) et le calendrier du QG.
// Les séries qui ont un « N° fiche » passent dans l'ordre des numéros, sur les jours de publication choisis.
//   GET  /api/admin/fiches          → { ok, cal:{jours,depart,heure}, items:[{id,slug,t,jp,num,promo,promoLe,cover,leg:{ig,x,tt}}] }
//   POST { cal:{jours,depart,heure} } → enregistre les réglages (KV STATS, clé hq:fiches-cal-v2)
//   POST { extrait:{ id, pages:[url], fin:"grille"|"eventail" } } → pages d'extrait choisies pour le carrousel de la fiche (KV fx:<id>)
// Chaque item porte aussi son extrait : { pages, fin } ou null.
import { json, isAdmin } from "../../../lib/admin.js";
import { text, num, date, check, queryAll, slugSerie } from "../../../lib/notion.js";
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const CLE = "hq:fiches-cal-v2"; // v2 : mardi, jeudi, samedi (Will, 25/11/2026)
// Mardi, jeudi et samedi à 18 h (Will, 25/11/2026) ; jours et heure réglables dans Mangas Database (vue Calendrier).
// Jours sautés (sauf) : 24 et 31 décembre, veilles de fête (Will, 26/11/2026).
const DEFAUT = { jours: [2, 4, 6], depart: "2026-12-01", heure: "18 h", sauf: ["2026-12-24", "2026-12-31"] };

// CROWS T.1 (Kana), pages 1 à 5 du chapitre 1 envoyées par Will le 25/11/2026.
const DEPART_EX = { "3ebb5e1a634f801aa127dbe7bfbe14d6": { pages: [1, 2, 3, 4, 5].map(i => `/img/extraits/crows/${i}.jpg`), fin: "grille" } };

function nettCal(c) {
  c = c || {};
  const jours = Array.isArray(c.jours) ? [...new Set(c.jours.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 6))] : DEFAUT.jours;
  const depart = /^\d{4}-\d{2}-\d{2}$/.test(c.depart || "") ? c.depart : DEFAUT.depart;
  const heure = /^\d{1,2} h( \d{2})?$/.test(c.heure || "") ? c.heure : DEFAUT.heure;
  const sauf = Array.isArray(c.sauf) ? [...new Set(c.sauf.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort().slice(-200) : DEFAUT.sauf;
  return { jours, depart, heure, sauf };
}
async function lireCal(env) { try { return nettCal(JSON.parse((await env.STATS.get(CLE)) || "null") || DEFAUT); } catch (e) { return { ...DEFAUT }; } }

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const cal = env.STATS ? await lireCal(env) : { ...DEFAUT };
  const rows = await queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "N° fiche", number: { is_not_empty: true } } } }).catch(() => []);
  const items = rows.map(r => {
    const p = r.properties || {};
    return { id: r.id.replace(/-/g, ""), slug: slugSerie(p), t: text(p["Titre FR"]) || text(p["SERIES"]), jp: text(p["Titre Original"]), num: num(p["N° fiche"]),
      promo: check(p["Promo"]), promoLe: date(p["Promo faite le"]), cover: text(p["Couverture T1"]),
      resume: text(p["Résumé image"]) || text(p["Résumé"]),
      leg: { ig: text(p["Légende Instagram"]), x: text(p["Légende X"]), tt: text(p["Légende TikTok"]) } };
  }).filter(s => s.num).sort((a, b) => a.num - b.num);
  if (env.STATS) await Promise.all(items.map(async s => { s.extrait = await env.STATS.get("fx:" + s.id, "json").catch(() => null); }));
  // Pages déjà fournies par Will (posées par Claude), tant qu'il n'en a pas choisi d'autres dans le calendrier.
  for (const s of items) if (!s.extrait && DEPART_EX[s.id]) s.extrait = DEPART_EX[s.id];
  return json({ ok: true, cal, items });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  if (!env.STATS) return json({ error: "stockage indisponible" }, 503);
  const b = await request.json().catch(() => ({}));
  if (b.extrait && /^[0-9a-f]{32}$/.test(b.extrait.id || "")) {
    const pages = (Array.isArray(b.extrait.pages) ? b.extrait.pages : []).map(String).filter(u => /^(https:\/\/[^\s]+|\/[^\s]*)$/.test(u)).slice(0, 8);
    const x = { pages, fin: b.extrait.fin === "eventail" ? "eventail" : "grille" };
    if (pages.length) await env.STATS.put("fx:" + b.extrait.id, JSON.stringify(x)); else await env.STATS.delete("fx:" + b.extrait.id);
    return json({ ok: true, extrait: pages.length ? x : null });
  }
  if (!b.cal) return json({ error: "requête vide" }, 400);
  const cal = nettCal(b.cal);
  await env.STATS.put(CLE, JSON.stringify(cal));
  return json({ ok: true, cal });
}
