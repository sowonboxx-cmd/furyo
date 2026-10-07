// Commentaires des news (réservés aux membres connectés).
//   GET  /api/comments?id=<id de la news>      → { ok, stored, items: [{ n, p, t, d }] } (plus anciens d'abord)
//   GET  /api/comments?ids=a,b,c               → { ok, counts: { a: 3, … } }
//   GET  /api/comments?recent=5&ids=a,b   → { ok, items: [{ id, n, p, t, d }] } (les plus récents du site)
//   POST /api/comments { id, text }            → ajoute un commentaire (membre connecté), 1 à 600 caractères
// Stockage : namespace KV « STATS » (le même que les likes). Sans lui, la lecture renvoie une liste vide et l'écriture est refusée.
import { membre, estAdminEmail } from "../../lib/auth.js";
import { activite, uid } from "../../lib/communaute.js";
const ID = /^[a-z0-9-]{1,80}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ env, request }) {
  const q = new URL(request.url).searchParams;
  // Derniers commentaires du site (accueil) : liste « c:recent », complétée par les news demandées (commentaires d'avant cette liste).
  if (q.get("recent")) {
    const n = Math.min(10, Math.max(1, +q.get("recent") || 5));
    if (!env.STATS) return json({ ok: true, stored: false, items: [] });
    let all = JSON.parse((await env.STATS.get("c:recent")) || "[]");
    const ids = (q.get("ids") || "").split(",").filter(id => ID.test(id)).slice(0, 30);
    if (all.length < n && ids.length) {
      const lists = await Promise.all(ids.map(async id => JSON.parse((await env.STATS.get(`c:${id}`)) || "[]").map(c => ({ ...c, id }))));
      all = all.concat(lists.flat());
    }
    const seen = new Set();
    all = all.filter(c => { const k = c.id + c.d + c.n; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => (b.d || "").localeCompare(a.d || "")).slice(0, n);
    return json({ ok: true, stored: true, items: all });
  }
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
  // Limite de vitesse (Will, 07/10/2026) : un commentaire toutes les 20 secondes, 50 par jour et par membre (les admins n'ont pas de limite).
  const rk = "cr:" + uid(me), now = Date.now(), jour = new Date().toISOString().slice(0, 10);
  let rl = {}; try { rl = JSON.parse((await env.STATS.get(rk)) || "{}"); } catch (e) {}
  if (rl.j !== jour) rl = { j: jour, n: 0, t: rl.t || 0 };
  if (!(await estAdminEmail(me.e, env))) {
    const attente = Math.ceil((20e3 - (now - (rl.t || 0))) / 1000);
    if (attente > 0) return json({ ok: false, error: `Doucement : attends encore ${attente} seconde${attente > 1 ? "s" : ""} avant ton prochain commentaire.` }, 429);
    if (rl.n >= 50) return json({ ok: false, error: "Tu as atteint la limite de 50 commentaires pour aujourd'hui. Reviens demain !" }, 429);
  }
  rl.t = now; rl.n++;
  await env.STATS.put(rk, JSON.stringify(rl), { expirationTtl: 172800 });
  const list = JSON.parse((await env.STATS.get(`c:${id}`)) || "[]");
  const item = { n: String(me.n || "Membre").slice(0, 40), s: me.s || "", p: me.p || "", t: text, d: new Date().toISOString() };
  list.push(item);
  const recent = JSON.parse((await env.STATS.get("c:recent")) || "[]");
  recent.unshift({ ...item, id });
  await Promise.all([env.STATS.put(`c:${id}`, JSON.stringify(list.slice(-1000))), env.STATS.put(`cn:${id}`, String(list.length)), env.STATS.put("c:recent", JSON.stringify(recent.slice(0, 20)))]);
  await activite(env, uid(me), { k: "c", id, t: text.slice(0, 160) }).catch(() => {});
  return json({ ok: true, item, n: list.length });
}
