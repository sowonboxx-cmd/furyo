// Données Notion qui changent peu, gardées dans le KV « STATS » (Will, 07/10/2026 : site rapide).
// La version gardée est servie tout de suite ; si elle est plus vieille que « ttl » secondes, elle est relue
// dans Notion en arrière-plan pour la visite suivante. Seule la toute première lecture attend Notion.
import { queryAll } from "./notion.js";

export async function memo(env, waitUntil, cle, ttl, build) {
  const k = "memo:" + cle;
  let v = null;
  if (env.STATS) { try { v = JSON.parse((await env.STATS.get(k)) || "null"); } catch (e) {} }
  const refaire = async () => { const d = await build(); if (env.STATS) await env.STATS.put(k, JSON.stringify({ t: Date.now(), d })); return d; };
  if (v && v.d) { if (Date.now() - v.t > ttl * 1000 && waitUntil) waitUntil(refaire().catch(() => {})); return v.d; }
  return refaire();
}

// Toutes les éditions (≈ 1 100 lignes, 11 lectures Notion) : seulement les propriétés utiles, au format Notion,
// pour que text(), num() et rel() marchent comme sur une requête directe. Relu toutes les 10 minutes au plus.
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const GARDER = ["Édition", "Pays", "Éditeur", "Format", "Nb tomes", "Série", "Statut", "Collection / Label"];
export const toutesEditions = (env, waitUntil) => memo(env, waitUntil, "editions-v1", 600, async () =>
  (await queryAll(env.NOTION_TOKEN, { ...EDITIONS })).map(r => ({ id: r.id, properties: Object.fromEntries(GARDER.filter(g => r.properties[g]).map(g => [g, r.properties[g]])) })));
