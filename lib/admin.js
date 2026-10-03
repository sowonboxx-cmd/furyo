// Back-office : connexion par mot de passe (variable secrète ADMIN_PASSWORD dans Cloudflare) et cookie signé 30 jours.
const enc = new TextEncoder();
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function sign(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
export const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
// ms : durée de validité (30 jours par défaut ; 12 h pour un admin nommé par badge, revérifié à chaque page).
export async function makeCookie(env, ms = 30 * 864e5) {
  const exp = Date.now() + ms;
  const v = `${exp}.${await sign(env.ADMIN_PASSWORD, "fg-admin:" + exp)}`;
  return `fg_admin=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.round(ms / 1000)}`;
}
export const ADMIN_BADGE_MS = 12 * 3600e3;
// Expiration du cookie admin (0 si absent ou invalide).
export async function adminExp(request, env) {
  if (!env.ADMIN_PASSWORD) return 0;
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)fg_admin=(\d+)\.([\w-]+)/);
  if (!m || Number(m[1]) < Date.now()) return 0;
  return (await sign(env.ADMIN_PASSWORD, "fg-admin:" + m[1])) === m[2] ? Number(m[1]) : 0;
}
export async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)fg_admin=(\d+)\.([\w-]+)/);
  if (!m || Number(m[1]) < Date.now()) return false;
  return (await sign(env.ADMIN_PASSWORD, "fg-admin:" + m[1])) === m[2];
}
// Comparaison à temps constant (le mot de passe ne se devine pas au chronomètre).
export async function samePassword(a, b) {
  const [x, y] = await Promise.all([sign("fg", String(a || "")), sign("fg", String(b || ""))]);
  let d = x.length ^ y.length; for (let i = 0; i < Math.min(x.length, y.length); i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}
