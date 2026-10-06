// GET /api/films : tous les films, dramas, OAV et anime de la base Notion « FuryoGang — Films »,
// avec, pour chaque série liée, de quoi afficher le lien « D'après le manga » (nom, adresse, couverture).
// La page /films/ s'en sert pour la liste et pour chaque fiche (la saga = les titres qui partagent une série liée).
// Les sources et les notes restent dans Notion : elles ne sont pas renvoyées.
import { text, num, check, rel, queryAll, cached, slugify } from "../../lib/notion.js";

const FILMS = { dataSource: "dfca009b-7891-49a4-8a1d-fd665dcacd77", database: "fe4b3db3d00c411ca3c1a25aff6bfadb" };
// Fiches affichées sur le site, selon la colonne « Statut » : seulement « Validé » et « En ligne » (Will, 06/10/2026).
const STATUTS = new Set(["Validé", "En ligne"]);
const nid = id => id.replace(/-/g, "");

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/films?v=2", 600, () => build(env, request));
}

// Une affiche du site (https://furyogang.com/affiches/…) est servie depuis le même domaine.
const local = u => String(u || "").replace(/^https?:\/\/(www\.)?(furyogang\.com|furyo\.pages\.dev)(?=\/)/, "");

async function build(env, request) {
  const [rows, series] = await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...FILMS, body: { sorts: [{ property: "Année", direction: "descending" }] } }),
    fetch(new URL("/api/series", request.url).toString()).then(r => r.ok ? r.json() : {}).catch(() => ({})),
  ]);
  const enLigne = Object.fromEntries((series.items || []).map(s => [s.id, s]));
  const items = [], ids = new Set(), pris = new Set();
  for (const r of rows) {
    const p = r.properties || {};
    const t = text(p["Titre"]);
    if (!t || !STATUTS.has(text(p["Statut"]))) continue;
    let slug = slugify(t);
    if (pris.has(slug)) slug += "-" + (num(p["Année"]) || nid(r.id).slice(0, 6));
    pris.add(slug);
    const sr = rel(p["Série liée"]);
    sr.forEach(i => ids.add(i));
    items.push({
      id: nid(r.id), slug, t, fr: text(p["Titre FR"]), jp: text(p["Titre original"]),
      type: text(p["Type"]) || "Film", y: num(p["Année"]), d: num(p["Durée (min)"]),
      real: text(p["Réalisateur"]), cast: text(p["Acteurs principaux"]).split(/\s*,\s*/).filter(Boolean),
      res: text(p["Résumé"]), img: local(text(p["Affiche"])), ba: text(p["Bande-annonce"]),
      must: check(p["À voir absolument"]) ? 1 : 0, manga: check(p["D'après un manga"]) ? 1 : 0, series: sr,
    });
  }
  // Séries liées : celles en ligne viennent de /api/series (adresse + couverture) ; les autres, seulement leur nom.
  const out = {};
  await Promise.all([...ids].map(async id => {
    const s = enLigne[id];
    if (s) { out[id] = { t: s.t, fr: s.fr, slug: s.slug, cover: s.cover, on: 1 }; return; }
    try {
      const res = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" } });
      if (!res.ok) return;
      const q = (await res.json()).properties || {};
      out[id] = { t: text(q["SERIES"]), fr: text(q["Titre FR"]), on: 0 };
    } catch (e) {}
  }));
  return { items, series: out };
}
