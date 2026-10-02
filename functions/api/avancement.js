// GET /api/avancement : où en est le site. Total = toutes les séries de la base ; en ligne = celles visibles sur le site.
// Sert au module « Avancement » (Actualités), à la page /avancement/ et aux visuels « Nouvelle fiche » du Studio.
import { text, date, list, queryAll, cached, slugify } from "../../lib/notion.js";
import { estVisible } from "../../lib/site.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const ETATS = ["À faire", "En cours", "À valider", "Validée"];

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/avancement", 600, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...SERIES });
    const today = new Date(); const d7 = new Date(today - 7 * 864e5).toISOString().slice(0, 10);
    const etats = Object.fromEntries(ETATS.map(e => [e, 0]));
    const enLigne = [], prepa = [];
    for (const r of rows) {
      const p = r.properties || {}, t = text(p["SERIES"]); if (!t) continue;
      const etat = text(p["Avancement"]) || "À faire";
      if (etats[etat] !== undefined) etats[etat]++;
      if (estVisible(p)) enLigne.push({ t, fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugify(t), date: date(p["Date de publication"]), type: text(p["Type"]), genres: list(p["Genre"]).slice(0, 3) });
      else if (etat === "En cours" || etat === "À valider" || etat === "Validée") prepa.push(t);
    }
    const total = rows.filter(r => text((r.properties || {})["SERIES"])).length;
    // Rang de publication : dans l'ordre des dates (les fiches du socle, sans date, comptent en premier).
    enLigne.sort((a, b) => (a.date || "").localeCompare(b.date || "") || a.t.localeCompare(b.t, "fr"));
    enLigne.forEach((s, i) => { s.rang = i + 1; });
    const recentes = enLigne.filter(s => s.date).slice(-12).reverse();
    const semaine = enLigne.filter(s => s.date && s.date >= d7);
    // Fiches publiées par semaine (8 dernières), pour le petit graphique.
    const sem = [];
    for (let i = 7; i >= 0; i--) {
      const a = new Date(today - (i * 7 + 6) * 864e5).toISOString().slice(0, 10), b = new Date(today - i * 7 * 864e5).toISOString().slice(0, 10);
      sem.push({ du: a, au: b, n: enLigne.filter(s => s.date && s.date >= a && s.date <= b).length });
    }
    return {
      total, enLigne: enLigne.length, reste: total - enLigne.length, pct: total ? Math.round(enLigne.length / total * 1000) / 10 : 0,
      semaine: semaine.length, semaineSeries: semaine.map(s => ({ t: s.t, fr: s.fr, slug: s.slug, rang: s.rang })),
      enPreparation: prepa.length, etats, recentes, parSemaine: sem,
      series: enLigne.map(s => ({ slug: s.slug, rang: s.rang, date: s.date })),
    };
  });
}
