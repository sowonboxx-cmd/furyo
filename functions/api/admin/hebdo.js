// Réglages des carrousels hebdo (Will, 25/11/2026) : News de la semaine (lundi) et Prépublication de la semaine (dimanche).
// Ce que Will corrige dans l'aperçu du calendrier : texte de chaque news, passage surligné, news au centre de la couverture.
//   GET  /api/admin/hebdo?k=news&du=AAAA-MM-JJ → { reglages }
//   POST /api/admin/hebdo { k, du, reglages }  → enregistre (KV « hebdo:<k>:<du> », gardé 120 jours)
import { json, isAdmin } from "../../../lib/admin.js";

const J = /^\d{4}-\d{2}-\d{2}$/, K = /^(news|prepub)$/;

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const q = new URL(request.url).searchParams;
  if (!K.test(q.get("k") || "") || !J.test(q.get("du") || "")) return json({ error: "k et du attendus" }, 400);
  let r = {}; try { r = JSON.parse((await env.STATS.get("hebdo:" + q.get("k") + ":" + q.get("du"))) || "{}") || {}; } catch (e) {}
  return json({ reglages: r });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const b = await request.json().catch(() => ({}));
  if (!K.test(b.k || "") || !J.test(b.du || "")) return json({ error: "k et du attendus" }, 400);
  const s = JSON.stringify(b.reglages || {}); if (s.length > 20000) return json({ error: "trop long" }, 400);
  await env.STATS.put("hebdo:" + b.k + ":" + b.du, s, { expirationTtl: 120 * 864e2 });
  return json({ ok: true });
}
