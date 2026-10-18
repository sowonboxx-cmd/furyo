// Connexion Google.
//   POST /api/auth/google { credential }  : jeton renvoyé par le bouton Google (fenêtre « Ton compte »).
//   GET  /api/auth/google?r=/page         : connexion en un clic (Will, 18/10/2026) : on part directement sur l'écran Google
//                                            de choix du compte, puis Google renvoie ici (POST formulaire) et on revient sur la page.
// À la première connexion, le membre est créé dans la base Notion « Membres » (il reçoit son numéro).
import { verifierGoogle, cookiesConnexion, estAdminEmail, GOOGLE_CLIENT_ID } from "../../../lib/auth.js";
import { enregistrer } from "../../../lib/membres.js";
import { catalogue, badgeAdmin } from "../../../lib/badges.js";

async function connecter(u, env) {
  let parBadge = false;
  try {
    const m = await enregistrer(env.NOTION_TOKEN, u); u.m = m.id; u.k = m.k; u.n = m.n || u.n; u.s = m.s; if (m.p) u.p = m.p;
    if (m.b && m.b.length) parBadge = badgeAdmin(await catalogue(env.NOTION_TOKEN, true), m.b);
  } catch (e) { /* la connexion marche même si Notion ne répond pas */ }
  return { cookies: await cookiesConnexion({ m: u.m, k: u.k, s: u.s, n: u.n, p: u.p, e: u.e }, env, { badgeAdmin: parBadge }), parBadge };
}
// Retour seulement vers une page du site (jamais une autre adresse).
const retour = r => (typeof r === "string" && /^\/(?!\/)[^\s]*$/.test(r) ? r : "/").slice(0, 300);

export async function onRequestGet({ request }) {
  const url = new URL(request.url), nonce = crypto.randomUUID().replace(/-/g, "");
  const st = btoa(unescape(encodeURIComponent(JSON.stringify({ r: retour(url.searchParams.get("r")), n: nonce })))).replace(/=+$/, "");
  const q = new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: url.origin + "/api/auth/google", response_type: "id_token",
    scope: "openid email profile", nonce, state: st, response_mode: "form_post", prompt: "select_account" });
  const h = new Headers({ location: "https://accounts.google.com/o/oauth2/v2/auth?" + q, "cache-control": "no-store" });
  // SameSite=None : le retour de Google est un POST venant d'un autre site.
  h.append("set-cookie", `fg_nonce=${nonce}; Path=/api/auth/google; HttpOnly; Secure; SameSite=None; Max-Age=600`);
  return new Response(null, { status: 302, headers: h });
}

export async function onRequestPost({ request, env }) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const f = await request.formData().catch(() => null);
    let st = {}; try { st = JSON.parse(decodeURIComponent(escape(atob(String(f && f.get("state") || ""))))); } catch (e) {}
    const r = retour(st.r), ck = (request.headers.get("cookie") || "").match(/(?:^|;\s*)fg_nonce=([0-9a-f]+)/);
    const tok = f && f.get("id_token"), u = tok ? await verifierGoogle(String(tok)) : null;
    const ok = u && ck && st.n === ck[1] && u.nonce === ck[1];
    const h = new Headers({ "cache-control": "no-store", location: r + (ok ? "" : (r.includes("?") ? "&" : "?") + "connexion=echec") });
    h.append("set-cookie", "fg_nonce=; Path=/api/auth/google; HttpOnly; Secure; SameSite=None; Max-Age=0");
    if (ok) { delete u.nonce; for (const c of (await connecter(u, env)).cookies) h.append("set-cookie", c); }
    return new Response(null, { status: 303, headers: h });
  }
  const b = await request.json().catch(() => ({}));
  const u = b.credential ? await verifierGoogle(b.credential) : null;
  if (!u) return new Response(JSON.stringify({ error: "Connexion Google refusée." }), { status: 401, headers: { "content-type": "application/json" } });
  delete u.nonce;
  const { cookies, parBadge } = await connecter(u, env);
  const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(JSON.stringify({ ok: true, user: { name: u.n, picture: u.p, num: u.k }, admin: parBadge || await estAdminEmail(u.e, env) }), { headers: h });
}
