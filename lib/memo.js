// Données Notion qui changent peu, gardées dans R2 (dossier idx/) pour un site rapide (Will, 07-08/10/2026).
// La version gardée est servie tout de suite ; si elle est plus vieille que « ttl » secondes, elle est relue
// dans Notion en arrière-plan pour la visite suivante. Seule la toute première lecture attend Notion.
import { queryAll } from "./notion.js";

// Stockage des index (Will, 08/10/2026) : dans R2 (bucket COUV, dossier idx/) et non plus dans le KV.
// Le KV gratuit n'accepte que 1 000 écritures par jour, partagées avec les collections et les commentaires des membres ;
// R2 en accepte un million par mois. Repli sur le KV si R2 n'est pas branché.
const lire = async (env, k) => {
  try {
    if (env.COUV) { const o = await env.COUV.get("idx/" + k); return o ? JSON.parse(await o.text()) : null; }
    return env.STATS ? JSON.parse((await env.STATS.get(k)) || "null") : null;
  } catch (e) { return null; }
};
const ecrire = async (env, k, v) => {
  const t = JSON.stringify(v);
  if (env.COUV) return env.COUV.put("idx/" + k, t, { httpMetadata: { contentType: "application/json" } });
  if (env.STATS) return env.STATS.put(k, t);
};
const effacer = async (env, k) => { if (env.COUV) return env.COUV.delete("idx/" + k); if (env.STATS) return env.STATS.delete(k); };

export async function memo(env, waitUntil, cle, ttl, build) {
  const k = "memo:" + cle;
  let v = null;
  v = await lire(env, k);
  const refaire = async () => { const d = await build(); await ecrire(env, k, { t: Date.now(), d }); return d; };
  if (v && v.d) { if (Date.now() - v.t > ttl * 1000 && waitUntil) waitUntil(refaire().catch(() => {})); return v.d; }
  return refaire();
}

// Toutes les éditions (≈ 1 100 lignes, 11 lectures Notion) : seulement les propriétés utiles, au format Notion,
// pour que text(), num() et rel() marchent comme sur une requête directe. Relu toutes les 10 minutes au plus.
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const GARDER = ["Édition", "Pays", "Éditeur", "Format", "Nb tomes", "Série", "Statut", "Collection / Label"];
export const toutesEditions = (env, waitUntil) => memo(env, waitUntil, "editions-v1", 180, async () =>
  (await queryAll(env.NOTION_TOKEN, { ...EDITIONS })).map(r => ({ id: r.id, properties: Object.fromEntries(GARDER.filter(g => r.properties[g]).map(g => [g, r.properties[g]])) })));

// Index de toute la base Tomes (≈ 8 000 lignes, 80 lectures Notion : trop pour un seul appel de fonction).
// Il est construit par morceaux de 20 pages, à chaque appel, en arrière-plan ; on sert toujours le dernier index
// complet. Lignes au format Notion réduit, pour que text(), num(), date() et rel() marchent comme d'habitude.
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df" };
const H = token => ({ Authorization: `Bearer ${token}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" });
const compact = r => { const p = r.properties || {};
  return [r.id.replace(/-/g, ""), (p["Édition"]?.relation || []).map(x => x.id.replace(/-/g, "")).join(","), p["N°"]?.number ?? null,
    p["Date de sortie"]?.date?.start || "", p["Couverture"]?.url || "", p["Statut"]?.select?.name || ""]; };
export const ligneTome = c => ({ id: c[0], properties: { "Édition": { relation: c[1] ? c[1].split(",").map(id => ({ id })) : [] }, "N°": { number: c[2] },
  "Date de sortie": { date: c[3] ? { start: c[3] } : null }, "Couverture": { url: c[4] || null }, "Statut": { select: c[5] ? { name: c[5] } : null } } });

async function avancer(env) {
  let st = await lire(env, "idx:tomes:build");
  if (!st || Date.now() - (st.debut || 0) > 15 * 60e3) st = { debut: Date.now(), cursor: null, rows: [] };
  // Un seul constructeur à la fois : un autre appel a avancé il y a moins de 20 s, on le laisse faire.
  if (st.vu && Date.now() - st.vu < 20e3) return false;
  st.vu = Date.now(); await ecrire(env, "idx:tomes:build", st);
  // Morceaux courts, état sauvé après chaque page : une fonction coupée en route (limite de temps) ne perd plus son avancée.
  for (let i = 0; i < 8; i++) {
    let r;
    for (let k = 0; k < 3; k++) {
      r = await fetch(`https://api.notion.com/v1/data_sources/${TOMES.dataSource}/query`, { method: "POST", headers: H(env.NOTION_TOKEN), body: JSON.stringify({ page_size: 100, ...(st.cursor ? { start_cursor: st.cursor } : {}) }) });
      if (r.status !== 429 && r.status < 500) break;
      await new Promise(t => setTimeout(t, 1500));
    }
    if (!r.ok) break;
    const j = await r.json();
    st.rows.push(...j.results.map(compact));
    st.cursor = j.has_more ? j.next_cursor : null;
    if (!st.cursor) { await ecrire(env, "idx:tomes", { t: Date.now(), rows: st.rows }); await effacer(env, "idx:tomes:build"); return true; }
    st.vu = Date.now(); await ecrire(env, "idx:tomes:build", st);
  }
  st.vu = 0;
  await ecrire(env, "idx:tomes:build", st);
  return false;
}
// Toutes les lignes Tomes (dernier index complet). Relancé en arrière-plan s'il a plus de 3 minutes
// (Will, 08/10/2026 : les couvertures ajoutées dans Notion doivent apparaître vite dans Ma collection).
// Tout premier appel (pas encore d'index) : on construit en plusieurs fois dans la même requête.
export async function tousTomes(env, waitUntil) {
  let idx = await lire(env, "idx:tomes");
  if (idx && idx.rows) {
    if (Date.now() - idx.t > 3 * 60e3 && waitUntil) waitUntil(avancer(env).catch(() => {}));
    return idx.rows.map(ligneTome);
  }
  for (let i = 0; i < 12; i++) if (await avancer(env)) break;
  idx = await lire(env, "idx:tomes");
  return idx ? idx.rows.map(ligneTome) : [];
}

// Éditions et tomes regroupés par série, à partir des deux index ci-dessus : sert « Ma collection » sans lire Notion
// (Will, 07/10/2026 : la page attendait une lecture Notion par série de la collection). Gardé une minute par isolat.
let parSerieMemo = null, parSerieT = 0;
export async function editionsParSerie(env, waitUntil) {
  if (parSerieMemo && Date.now() - parSerieT < 60e3) return parSerieMemo;
  const [eds, tomes] = await Promise.all([toutesEditions(env, waitUntil), tousTomes(env, waitUntil)]);
  const today = new Date().toISOString().slice(0, 10);
  const t = (p, k) => { const v = p[k]; if (!v) return ""; if (v.title || v.rich_text) return (v.title || v.rich_text).map(x => x.plain_text).join("").trim(); if (v.select) return v.select.name || ""; return ""; };
  const parEd = {};
  for (const r of tomes) {
    const p = r.properties, e = (p["Édition"].relation[0] || {}).id; if (!e || p["N°"].number == null) continue;
    const d = p["Date de sortie"].date ? p["Date de sortie"].date.start : "";
    (parEd[e] = parEd[e] || []).push({ id: r.id, n: p["N°"].number, date: d, cover: p["Couverture"].url || "", paru: (p["Statut"].select && p["Statut"].select.name === "Paru") || (!!d && d <= today) ? 1 : 0 });
  }
  const out = {};
  for (const e of eds) {
    const p = e.properties || {}, nom = t(p, "Édition");
    if (/^\[À SUPPRIMER\]/i.test(nom)) continue;
    const s = ((p["Série"] && p["Série"].relation) || [])[0]; if (!s) continue;
    const id = e.id.replace(/-/g, "");
    (out[s.id.replace(/-/g, "")] = out[s.id.replace(/-/g, "")] || []).push({ id, nom, pays: t(p, "Pays"), pub: t(p, "Éditeur"), label: t(p, "Collection / Label"),
      nb: p["Nb tomes"] && typeof p["Nb tomes"].number === "number" ? p["Nb tomes"].number : null, statut: t(p, "Statut"),
      tomes: (parEd[id] || []).sort((a, b) => a.n - b.n) });
  }
  for (const l of Object.values(out)) l.sort((a, b) => (a.pays === "France" ? 0 : 1) - (b.pays === "France" ? 0 : 1));
  parSerieMemo = out; parSerieT = Date.now();
  return out;
}
