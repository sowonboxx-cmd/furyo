// POST /api/admin/login {password} → cookie de session. DELETE → déconnexion. GET → connecté ou non.
import { json, makeCookie, isAdmin, samePassword } from "../../../lib/admin.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ error: "ADMIN_PASSWORD n'est pas encore défini dans Cloudflare." }, 503);
  let body = {}; try { body = await request.json(); } catch (e) {}
  await new Promise(r => setTimeout(r, 400)); // freine les essais en rafale
  if (!(await samePassword(body.password, env.ADMIN_PASSWORD))) return json({ error: "Mot de passe incorrect." }, 401);
  return json({ ok: true }, 200, { "set-cookie": await makeCookie(env) });
}
export async function onRequestGet({ request, env }) {
  return json({ ok: await isAdmin(request, env), configured: !!env.ADMIN_PASSWORD });
}
export async function onRequestDelete() {
  return json({ ok: true }, 200, { "set-cookie": "fg_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
}
