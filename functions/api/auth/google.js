// POST /api/auth/google { credential } : connexion avec le jeton renvoyé par le bouton Google.
import { verifierGoogle, cookiesConnexion, estAdminEmail } from "../../../lib/auth.js";
export async function onRequestPost({ request, env }) {
  const b = await request.json().catch(() => ({}));
  const u = b.credential ? await verifierGoogle(b.credential) : null;
  if (!u) return new Response(JSON.stringify({ error: "Connexion Google refusée." }), { status: 401, headers: { "content-type": "application/json" } });
  const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const c of await cookiesConnexion(u, env)) h.append("set-cookie", c);
  return new Response(JSON.stringify({ ok: true, user: { name: u.n, picture: u.p }, admin: await estAdminEmail(u.e, env) }), { headers: h });
}
