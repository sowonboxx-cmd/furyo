// GET /api/calendrier : tomes à paraître (et sortis depuis 45 jours) avec pays, éditeur, série et couverture.
// Sources Notion : Tomes → Édition (pays, éditeur) → Série (titres, visuel).
import { text, num, date, rel, queryAll, cached } from "../../lib/notion.js";
import { estVisible } from "../../lib/site.js";

const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  return cached(request, waitUntil, "/api/calendrier", 600, async () => {
    // Fenêtre normale : 45 derniers jours. TEST (oct. 2026) : on affiche aussi depuis le 1er juillet pour vérifier les couvertures ; supprimer SHOW_FROM pour revenir à la normale.
    const SHOW_FROM = "2026-07-01";
    const d45 = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
    const since = SHOW_FROM < d45 ? SHOW_FROM : d45;
    const [tRows, eRows, sRows] = await Promise.all([
      queryAll(env.NOTION_TOKEN, { ...TOMES, body: {
        filter: { or: [
          { property: "Date de sortie", date: { on_or_after: since } },
          { property: "Statut", select: { equals: "À paraître" } },
        ] },
        sorts: [{ property: "Date de sortie", direction: "ascending" }],
      } }),
      queryAll(env.NOTION_TOKEN, { ...EDITIONS }),
      queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "Éditions", relation: { is_not_empty: true } } } }),
    ]);
    const series = {};
    for (const r of sRows) {
      const p = r.properties || {};
      series[r.id.replace(/-/g, "")] = {
        id: r.id.replace(/-/g, ""), t: text(p["SERIES"]), jp: text(p["Titre Original"]), fr: text(p["Titre FR"]),
        cover1: text(p["Couverture T1"]), resume: text(p["Résumé"]), scen: text(p["Scénariste"]), dess: text(p["Dessinateur"]), auteurs: [text(p["Scénariste"]), text(p["Dessinateur"])].filter((v, i, a) => v && a.indexOf(v) === i).join(" & "), hasVisual: ((p["Visuel principal"] || {}).files || []).length > 0, finiJP: text(p["Statut Japon"]) === "Terminé", tomesJP: num(p["Tomes JP"]), fiche: estVisible(p),
      };
    }
    const eds = {};
    for (const r of eRows) {
      const p = r.properties || {};
      eds[r.id.replace(/-/g, "")] = { pays: text(p["Pays"]), pub: text(p["Éditeur"]), name: text(p["Édition"]), format: text(p["Format"]), nb: num(p["Nb tomes"]), series: rel(p["Série"]) };
    }
    const items = tRows.map(r => {
      const p = r.properties || {};
      const ed = eds[rel(p["Édition"])[0]] || {};
      const s = series[(ed.series || [])[0]] || {};
      return {
        id: r.id.replace(/-/g, ""), tome: text(p["Tome"]), n: num(p["N°"]), vtitle: text(p["Titre du volume"]),
        date: date(p["Date de sortie"]), prec: text(p["Précision date"]) || "Jour", status: text(p["Statut"]),
        cover: text(p["Couverture"]), isbn: text(p["ISBN"]),
        pays: ed.pays || "", pub: ed.pub || "", format: ed.format || "",
        // Nombre de tomes connu : celui de l'édition, sinon (Japon) celui de la série si elle est terminée.
        nb: ed.nb || (ed.pays === "Japon" && s.finiJP ? s.tomesJP : null),
        series: s.t || "", seriesId: s.id || "", jp: s.jp || "", fr: s.fr || "", visual: !!s.hasVisual, cover1: s.cover1 || "", resume: s.resume || "", scen: s.scen || "", dess: s.dess || "", auteurs: s.auteurs || "", fiche: s.fiche !== false,
      };
    }).filter(it => it.date);
    return { items };
  });
}
