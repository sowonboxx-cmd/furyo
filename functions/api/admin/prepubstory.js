// Prépublication en story (Will, 23/11/2026) : les chapitres sortis ou à paraître (7 jours avant → 7 jours après : on peut publier en retard, Will 23/11/2026),
// pour la ligne « Prépublication » du calendrier éditorial. Chaque ligne : la série, le magazine, le numéro, le chapitre,
// la couverture du DERNIER tome paru de la série (jamais la couverture du magazine) et l'état de la story (file igq).
//   GET /api/admin/prepubstory → { items: [{ id, serie, slug, magazine, numero, chapitre, date, avant, cover, story }] }
import { text, date, num, rel, list, queryAll, slugSerie } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";

const PREPUB = { dataSource: "e4e66558-3cf0-41f1-afc2-5147566cbf3e", database: "f0b7c0f91f4d442597cbbb169b7abbda" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const nid = id => String(id || "").replace(/-/g, "");
const jour = d => d.toLocaleDateString("sv", { timeZone: "Europe/Paris" });

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const debut = jour(new Date(Date.now() - 7 * 864e5)), fin = jour(new Date(Date.now() + 7 * 864e5));
  const rows = await queryAll(env.NOTION_TOKEN, { ...PREPUB, body: { filter: { and: [
    { property: "Date de sortie", date: { on_or_after: debut } }, { property: "Date de sortie", date: { on_or_before: fin } },
    { or: [{ property: "Statut", select: { equals: "Paru" } }, { property: "Statut", select: { equals: "À paraître" } }] },
    { property: "Écarté", checkbox: { equals: false } }] }, sorts: [{ property: "Date de sortie", direction: "ascending" }] } }).catch(() => []);
  const sIds = [...new Set(rows.map(r => rel(r.properties["Série"])[0]).filter(Boolean))];
  // Titres des séries
  const series = {};
  await Promise.all(sIds.map(async id => {
    const p = await (await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" } })).json().catch(() => null);
    const pr = (p && p.properties) || {};
    series[id] = { t: text(pr["Titre FR"]) || text(pr["SERIES"]), slug: slugSerie(pr), cover1: text(pr["Couverture T1"]) };
  }));
  // Dernier tome paru de chaque série (édition japonaise d'abord), avec sa couverture.
  if (sIds.length) {
    const eds = await queryAll(env.NOTION_TOKEN, { ...EDITIONS, body: { filter: { or: sIds.slice(0, 100).map(id => ({ property: "Série", relation: { contains: id } })) } } }).catch(() => []);
    const ed = eds.map(e => ({ id: nid(e.id), serie: rel(e.properties["Série"])[0], jp: /japon/i.test(text(e.properties["Pays"])) }));
    const tomes = ed.length ? await queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { and: [
      { or: ed.slice(0, 100).map(e => ({ property: "Édition", relation: { contains: e.id } })) },
      { property: "Date de sortie", date: { on_or_before: jour(new Date()) } }] } } }).catch(() => []) : [];
    const best = {};
    for (const t of tomes) {
      const e = ed.find(x => x.id === rel(t.properties["Édition"])[0]); if (!e) continue;
      const cov = text(t.properties["Couverture"]) || (t.properties["Couverture"] && t.properties["Couverture"].url) || ""; if (!cov) continue;
      const n = num(t.properties["N°"]) || 0, sc = (e.jp ? 1e6 : 0) + n, cur = best[e.serie];
      if (!cur || sc > cur.sc) best[e.serie] = { sc, cover: cov, n };
    }
    for (const id of sIds) if (series[id]) { series[id].cover = (best[id] && best[id].cover) || series[id].cover1 || ""; series[id].tome = best[id] ? best[id].n : null; }
  }
  const items = await Promise.all(rows.map(async r => {
    const p = r.properties, sid = rel(p["Série"])[0], s = series[sid] || {};
    const id = nid(r.id), story = env.STATS ? await env.STATS.get("igq:" + id, "json") : null;
    return { id, serie: s.t || text(p["Titre au sommaire"]) || text(p["Entrée"]).split(" · ")[0], slug: s.slug || "", magazine: text(p["Magazine"]), numero: text(p["Numéro"]),
      chapitre: num(p["Chapitre"]), date: date(p["Date de sortie"]), statut: text(p["Statut"]), avant: list(p["Mise en avant"]), cover: s.cover || "", tome: s.tome,
      // Will, 23/11/2026 : page couleur / couverture du prochain tome à la place du dernier tome, et une ligne d'info sous le titre.
      visuel: (p["Visuel story"] && p["Visuel story"].url) || "", sousTitre: text(p["Sous-titre story"]),
      story: story ? { quand: story.quand, fait: story.fait || "", err: story.err || "", ignore: !!story.ignore } : null };
  }));
  return json({ items });
}
