// POST /api/auth/google { credential } : connexion avec le jeton renvoyé par le bouton Google.
// À la première connexion, le membre est créé dans la base Notion « Membres » (il reçoit son numéro).
import { verifierGoogle, cookiesConnexion, estAdminEmail } from "../../../lib/auth.js";
import { enregistrer } from "../../../lib/membres.js";
export async function onRequestPost({ request, env }) {
  const b = await request.json().catch(() => ({}));
  const u = b.credential ? await verifierGoogle(b.credential) : null;
  if (!u) return new Response(JSON.stringify({ error: "Connexion Google refusée." }), { status: 401, headers: { "content-type": "application/json" } });
  try { const m = await enregistrer(env.NOTION_TOKEN, u); u.m = m.id; u.k = m.k; } catch (e) { /* la connexion marche même si Notion ne répond pas */ }
  const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const c of await cookiesConnexion({ m: u.m, k: u.k, n: u.n, p: u.p, e: u.e }, env)) h.append("set-cookie", c);
  return new Response(JSON.stringify({ ok: true, user: { name: u.n, picture: u.p, num: u.k }, admin: await estAdminEmail(u.e, env) }), { headers: h });
}
