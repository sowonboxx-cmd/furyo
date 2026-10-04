// Statistiques des news : vues, likes, favoris.
//   GET  /api/stats?ids=a,b,c        → { ok, stats: { a: { v, l, b }, … } }
//   POST /api/stats  { id, act:"view" } → compte une vue (le navigateur n'envoie qu'une vue par news et par session)
// Likes et favoris sont réservés aux membres connectés : sans compte, la fonction répond 401.
// Stockage : namespace KV lié au projet Pages sous le nom STATS. Sans lui, tout renvoie 0 sans erreur.
import { membre } from "../../lib/auth.js";
const ID = /^[a-z0-9-]{1,80}$/;
const uid = u => String(u.s || u.e || u.k || "").replace(/[^\w@.-]/g, "").slice(0, 80);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ env, request }) {
  const q = new URL(request.url).searchParams;
  const me = await membre(request, env).catch(() => null);
  // Signets du membre : GET /api/stats?mine=b → { ids: [...] } (plus récent d'abord)
  if (q.get("mine") === "b") {
    if (!me) return json({ ok: false, error: "connexion requise" }, 401);
    const list = env.STATS ? JSON.parse((await env.STATS.get(`ub:${uid(me)}`)) || "[]") : [];
    return json({ ok: true, ids: list });
  }
  const ids = (q.get("ids") || "").split(",").filter(id => ID.test(id)).slice(0, 60);
  const stats = {};
  for (const id of ids) {
    if (!env.STATS) { stats[id] = { v: 0, l: 0, b: 0 }; continue; }
    const [v, l, b] = await Promise.all(["v", "l", "b"].map(k => env.STATS.get(`${k}:${id}`)));
    stats[id] = { v: +v || 0, l: +l || 0, b: +b || 0 };
    if (me) { const [ml, mb] = await Promise.all(["l", "b"].map(k => env.STATS.get(`u${k}:${uid(me)}:${id}`))); stats[id].ml = !!ml; stats[id].mb = !!mb; }
  }
  return json({ ok: true, stored: !!env.STATS, stats });
}

export async function onRequestPost({ env, request }) {
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "JSON invalide" }, 400); }
  const { id, act } = body;
  if (!ID.test(id || "")) return json({ ok: false, error: "id invalide" }, 400);
  if (act === "like" || act === "bookmark") {
    // Réservé aux membres : un appui ajoute, un second retire. Compteur global + marque du membre.
    const me = await membre(request, env).catch(() => null);
    if (!me) return json({ ok: false, error: "connexion requise" }, 401);
    if (!env.STATS) return json({ ok: true, stored: false, on: false, n: 0 });
    const k = act === "like" ? "l" : "b", mk = `u${k}:${uid(me)}:${id}`;
    const was = !!(await env.STATS.get(mk));
    const n = Math.max(0, (+(await env.STATS.get(`${k}:${id}`)) || 0) + (was ? -1 : 1));
    await Promise.all([env.STATS.put(`${k}:${id}`, String(n)), was ? env.STATS.delete(mk) : env.STATS.put(mk, "1")]);
    if (k === "b") {
      const lk = `ub:${uid(me)}`; let list = JSON.parse((await env.STATS.get(lk)) || "[]").filter(x => x !== id);
      if (!was) list.unshift(id);
      await env.STATS.put(lk, JSON.stringify(list.slice(0, 500)));
    }
    return json({ ok: true, stored: true, on: !was, n });
  }
  if (act !== "view") return json({ ok: false, error: "action inconnue" }, 400);
  if (!env.STATS) return json({ ok: true, stored: false, v: 0 });
  const v = (+(await env.STATS.get(`v:${id}`)) || 0) + 1;
  await env.STATS.put(`v:${id}`, String(v));
  return json({ ok: true, stored: true, v });
}
