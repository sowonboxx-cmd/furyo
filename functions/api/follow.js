// Séries suivies par un membre (Will, 05/10/2026) : sert au bouton « + » des fiches et à l'onglet « Mon fil ».
//   GET  /api/follow             → { ok, slugs: [...] } (membre connecté), sinon { ok:false } 401
//   GET  /api/follow?s=<slug>    → { ok, on, n } (n = nombre de membres qui suivent la série, visible par tous)
//   POST /api/follow { s }       → bascule suivre / ne plus suivre → { ok, on, n }
// Stockage : namespace KV « STATS » (clés uf:<membre> = liste de slugs, fn:<slug> = compteur).
import { membre } from "../../lib/auth.js";
const SLUG = /^[a-z0-9-]{1,90}$/;
const uid = u => String(u.m || u.k || u.e || "").replace(/[^\w@.-]/g, "").slice(0, 80);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ env, request }) {
  const s = new URL(request.url).searchParams.get("s");
  const me = await membre(request, env).catch(() => null);
  if (s) {
    if (!SLUG.test(s)) return json({ ok: false, error: "série invalide" }, 400);
    const n = env.STATS ? (+(await env.STATS.get(`fn:${s}`)) || 0) : 0;
    const list = me && env.STATS ? JSON.parse((await env.STATS.get(`uf:${uid(me)}`)) || "[]") : [];
    return json({ ok: true, stored: !!env.STATS, on: list.includes(s), n, membre: !!me });
  }
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  const list = env.STATS ? JSON.parse((await env.STATS.get(`uf:${uid(me)}`)) || "[]") : [];
  return json({ ok: true, stored: !!env.STATS, slugs: list });
}

export async function onRequestPost({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: true, stored: false, on: false, n: 0 });
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "JSON invalide" }, 400); }
  const s = String(body.s || "");
  if (!SLUG.test(s)) return json({ ok: false, error: "série invalide" }, 400);
  const key = `uf:${uid(me)}`, list = JSON.parse((await env.STATS.get(key)) || "[]");
  const on = !list.includes(s);
  const next = on ? [s, ...list].slice(0, 500) : list.filter(x => x !== s);
  const n = Math.max(0, (+(await env.STATS.get(`fn:${s}`)) || 0) + (on ? 1 : -1));
  await Promise.all([env.STATS.put(key, JSON.stringify(next)), env.STATS.put(`fn:${s}`, String(n))]);
  return json({ ok: true, stored: true, on, n });
}
