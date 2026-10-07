// GET /api/avancement : où en est le site. Total = toutes les séries de la base ; en ligne = celles visibles sur le site.
// Sert au module « Avancement » (Actualités), à la page /avancement/ et aux visuels « Nouvelle fiche » du Studio.
import { text, num, date, list, queryAll, cached, slugify, slugSerie } from "../../lib/notion.js";
import { estVisible, statut, STATUTS } from "../../lib/site.js";
import { chargerContexte, estPrete } from "../../lib/oblig.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/avancement", 600, async () => {
    const [rows, { ctx }] = await Promise.all([queryAll(env.NOTION_TOKEN, { ...SERIES }), chargerContexte(env.NOTION_TOKEN, env, waitUntil)]);
    const today = new Date(); const d7 = new Date(today - 7 * 864e5).toISOString().slice(0, 10);
    const etats = Object.fromEntries(STATUTS.map(e => [e, 0]));
    const enLigne = [], prepa = [];
    for (const r of rows) {
      const p = r.properties || {}, t = text(p["SERIES"]); if (!t) continue;
      const etat = statut(p);
      if (etats[etat] !== undefined) etats[etat]++;
      if (estVisible(p)) enLigne.push({ id: r.id, fixe: num(p["N° fiche"]), t, fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugSerie(p), date: date(p["Date de publication"]), type: text(p["Type"]), genres: list(p["Genre"]).slice(0, 3) });
      // Prêtes à publier : tous les éléments ★ faits, pas encore « En ligne · public » (même règle que le back-office).
      if (estPrete(p, r.id.replace(/-/g, ""), ctx)) prepa.push(t);
    }
    const total = rows.filter(r => text((r.properties || {})["SERIES"])).length;
    // Numéro de fiche (« Fiche n°001 ») :
    // 1. une série qui a un « N° fiche » dans Notion garde ce numéro (Will choisit les premières, et un numéro publié ne bouge plus) ;
    // 2. les autres prennent les numéros libres : d'abord les fiches du socle (sans date) dans un ordre mélangé mais stable,
    //    puis les fiches publiées ensuite, dans l'ordre de leur date de publication.
    const melange = id => { let h = 2166136261; for (const c of id) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
    const pris = new Set(), libres = [];
    for (const s of enLigne) { if (s.fixe > 0 && !pris.has(s.fixe)) { s.rang = s.fixe; pris.add(s.fixe); } else libres.push(s); }
    libres.sort((a, b) => (!!a.date - !!b.date) || (a.date || "").localeCompare(b.date || "") || (melange(a.id) - melange(b.id)));
    let k = 1;
    for (const s of libres) { while (pris.has(k)) k++; s.rang = k++; }
    enLigne.sort((a, b) => a.rang - b.rang);
    const recentes = enLigne.filter(s => s.date).sort((a, b) => b.date.localeCompare(a.date) || b.rang - a.rang).slice(0, 12);
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
      enPreparation: prepa.length, pretes: prepa.length, etats, recentes, parSemaine: sem,
      series: enLigne.map(s => ({ slug: s.slug, rang: s.rang, date: s.date, fixe: !!(s.fixe > 0) })),
    };
  });
}
