// Statistiques des news : vues, likes, favoris.
//   GET  /api/stats?ids=a,b,c        → { ok, stats: { a: { v, l, b }, … } }
//   POST /api/stats  { id, act:"view" } → compte une vue (le navigateur n'envoie qu'une vue par news et par session)
// Likes et favoris sont réservés aux membres connectés : sans compte, la fonction répond 401.
// Stockage : namespace KV lié au projet Pages sous le nom STATS. Sans lui, tout renvoie 0 sans erreur.
const ID = /^[a-z0-9-]{1,80}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ env, request }) {
  const ids = (new URL(request.url).searchParams.get("ids") || "").split(",").filter(id => ID.test(id)).slice(0, 60);
  const stats = {};
  for (const id of ids) {
    if (!env.STATS) { stats[id] = { v: 0, l: 0, b: 0 }; continue; }
    const [v, l, b] = await Promise.all(["v", "l", "b"].map(k => env.STATS.get(`${k}:${id}`)));
    stats[id] = { v: +v || 0, l: +l || 0, b: +b || 0 };
  }
  return json({ ok: true, stored: !!env.STATS, stats });
}

export async function onRequestPost({ env, request }) {
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "JSON invalide" }, 400); }
  const { id, act } = body;
  if (!ID.test(id || "")) return json({ ok: false, error: "id invalide" }, 400);
  if (act === "like" || act === "bookmark") return json({ ok: false, error: "connexion requise" }, 401);
  if (act !== "view") return json({ ok: false, error: "action inconnue" }, 400);
  if (!env.STATS) return json({ ok: true, stored: false, v: 0 });
  const v = (+(await env.STATS.get(`v:${id}`)) || 0) + 1;
  await env.STATS.put(`v:${id}`, String(v));
  return json({ ok: true, stored: true, v });
}
