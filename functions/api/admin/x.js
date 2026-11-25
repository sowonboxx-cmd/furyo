// X (Twitter) depuis le back-office (Will, 25/11/2026).
//   GET  /api/admin/x                         → { pret } : les 4 clés sont-elles dans Cloudflare ?
//   POST /api/admin/x { texte, images: [url] } → publie tout de suite sur X (test, ou envoi manuel)
import { json, isAdmin } from "../../../lib/admin.js";
import { xPret, xPost } from "../../../lib/x.js";

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  return json({ pret: xPret(env) });
}
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const b = await request.json().catch(() => ({}));
  const texte = String(b.texte || "").slice(0, 4000), images = (Array.isArray(b.images) ? b.images : []).map(String).filter(u => /^(https:\/\/|\/)\S+$/.test(u)).slice(0, 20);
  if (!texte && !images.length) return json({ error: "rien à publier" }, 400);
  try { return json({ ok: true, ...(await xPost(env, texte, images)) }); }
  catch (e) { return json({ error: String((e && e.message) || e), status: (e && e.status) || 0 }, 502); }
}
