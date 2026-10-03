// GET /api/auth/me : membre connecté (nom, photo) et droits admin. DELETE : déconnexion.
// Admin nommé par badge (cookie membre a:1) : le badge est revérifié dans Notion à chaque appel ;
// le cookie admin (12 h) est renouvelé s'il l'a toujours, supprimé sinon.
import { membre, cookieMembre } from "../../../lib/auth.js";
import { isAdmin, adminExp, makeCookie, ADMIN_BADGE_MS, json } from "../../../lib/admin.js";
import { lirePage } from "../../../lib/membres.js";
import { catalogue, badgeAdmin, idsBadges } from "../../../lib/badges.js";
export async function onRequestGet({ request, env }) {
  const u = await membre(request, env);
  let admin = await isAdmin(request, env);
  const h = {};
  if (u && u.a && u.m) {
    const page = await lirePage(env.NOTION_TOKEN, u.m).catch(() => null);
    if (page) {
      const garde = badgeAdmin(await catalogue(env.NOTION_TOKEN).catch(() => []), idsBadges(page));
      const c = [];
      if (garde) { if ((await adminExp(request, env)) - Date.now() < ADMIN_BADGE_MS / 2) c.push(await makeCookie(env, ADMIN_BADGE_MS)); admin = true; }
      else { const { a, x, ...reste } = u; c.push("fg_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0", await cookieMembre(reste, env)); admin = false; }
      if (c.length) h["set-cookie"] = c;
    }
  }
  const body = { user: u ? { name: u.n, picture: u.p, num: u.k || null, slug: u.s || null, member: !!u.m } : null, admin };
  if (!h["set-cookie"]) return json(body);
  const hd = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const c of h["set-cookie"]) hd.append("set-cookie", c);
  return new Response(JSON.stringify(body), { headers: hd });
}
export async function onRequestDelete() {
  const h = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  h.append("set-cookie", "fg_user=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  h.append("set-cookie", "fg_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  return new Response(JSON.stringify({ ok: true }), { headers: h });
}
