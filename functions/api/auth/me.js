// GET /api/auth/me : membre connecté (nom, photo) et droits admin. DELETE : déconnexion.
import { membre } from "../../../lib/auth.js";
import { isAdmin, json } from "../../../lib/admin.js";
export async function onRequestGet({ request, env }) {
  const u = await membre(request, env), admin = await isAdmin(request, env);
  return json({ user: u ? { name: u.n, picture: u.p } : null, admin });
}
export async function onRequestDelete() {
  const h = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  h.append("set-cookie", "fg_user=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  h.append("set-cookie", "fg_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  return new Response(JSON.stringify({ ok: true }), { headers: h });
}
