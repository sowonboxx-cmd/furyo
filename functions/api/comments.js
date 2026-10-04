// Commentaires des news (réservés aux membres connectés).
//   GET  /api/comments?id=<id de la news>      → { ok, stored, items: [{ n, p, t, d }] } (plus anciens d'abord)
//   GET  /api/comments?ids=a,b,c               → { ok, counts: { a: 3, … } }
//   POST /api/comments { id, text }            → ajoute un commentaire (membre connecté), 1 à 600 caractères
// Stockage : namespace KV « STATS » (le même que les likes). Sans lui, la lecture renvoie une liste vide et l'écriture est refusée.
import { membre } from "../../lib/auth.js";
const ID = /^[a-z0-9-]{1,80}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ env, request }) {
  const q = new URL(request.url).searchParams;
  if (q.get("ids")) {
    const ids = q.get("ids").split(",").filter(id => ID.test(id)).slice(0, 60), counts = {};
    for (const id of ids) counts[id] = env.STATS ? (+(await env.STATS.get(`cn:${id}`)) || 0) : 0;
    return json({ ok: true, stored: !!env.STATS, counts });
  }
  const id = q.get("id") || "";
  if (!ID.test(id)) return json({ ok: false, error: "id invalide" }, 400);
  const items = env.STATS ? JSON.parse((await env.STATS.get(`c:${id}`)) || "[]") : [];
  return json({ ok: true, stored: !!env.STATS, items });
}

export async function onRequestPost({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage non branché" }, 503);
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "JSON invalide" }, 400); }
  const id = String(body.id || ""), text = String(body.text || "").replace(/\s+\n/g, "\n").trim();
  if (!ID.test(id)) return json({ ok: false, error: "id invalide" }, 400);
  if (!text || text.length > 600) return json({ ok: false, error: "Commentaire vide ou trop long (600 caractères maximum)." }, 400);
  const list = JSON.parse((await env.STATS.get(`c:${id}`)) || "[]");
  const item = { n: String(me.n || "Membre").slice(0, 40), s: me.s || "", p: me.p || "", t: text, d: new Date().toISOString() };
  list.push(item);
  await Promise.all([env.STATS.put(`c:${id}`, JSON.stringify(list.slice(-1000))), env.STATS.put(`cn:${id}`, String(list.length))]);
  return json({ ok: true, item, n: list.length });
}
