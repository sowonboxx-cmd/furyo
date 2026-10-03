// Comptes membres : connexion « Continuer avec Google », sans base de données.
// Google vérifie l'identité ; le site garde seulement un cookie signé (nom, photo, e-mail) pendant 30 jours.
// L'administrateur est reconnu par son e-mail (empreinte SHA-256 ci-dessous, ou variable ADMIN_EMAILS dans Cloudflare).
import { makeCookie } from "./admin.js";

export const GOOGLE_CLIENT_ID = "923817714860-h88lmvr2bnvninn41ioa19iv2lrd2ed5.apps.googleusercontent.com";
const ADMIN_HASHES = ["5c6ffdd7c619869149d38294bebe010837e6cf5c19c2b2216ec1e7821f1d97f3"];
const enc = new TextEncoder();
const b64u = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = s => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
const secret = env => env.SESSION_SECRET || env.ADMIN_PASSWORD || "";
async function hmac(key, msg) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}
export async function estAdminEmail(email, env) {
  const e = String(email || "").trim().toLowerCase(); if (!e) return false;
  if ((env.ADMIN_EMAILS || "").toLowerCase().split(/[\s,;]+/).includes(e)) return true;
  return ADMIN_HASHES.includes(hex(await crypto.subtle.digest("SHA-256", enc.encode(e))));
}
// Vérifie le jeton Google (signature, destinataire, expiration) auprès de Google.
export async function verifierGoogle(credential) {
  const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential));
  if (!r.ok) return null;
  const t = await r.json();
  if (t.aud !== GOOGLE_CLIENT_ID || !/accounts\.google\.com$/.test(t.iss || "") || Number(t.exp) * 1000 < Date.now()) return null;
  if (t.email_verified !== "true" && t.email_verified !== true) return null;
  return { e: t.email, n: t.given_name || t.name || "", p: t.picture || "" };
}
export async function cookieMembre(u, env) {
  const exp = Date.now() + 30 * 864e5, v = b64u(JSON.stringify({ ...u, x: exp }));
  return `fg_user=${v}.${await hmac(secret(env), "fg-user:" + v)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}`;
}
export async function membre(request, env) {
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)fg_user=([\w-]+)\.([0-9a-f]+)/);
  if (!m || !secret(env) || (await hmac(secret(env), "fg-user:" + m[1])) !== m[2]) return null;
  try { const u = JSON.parse(unb64u(m[1])); return u.x > Date.now() ? u : null; } catch (e) { return null; }
}
export async function cookiesConnexion(u, env) {
  const c = [await cookieMembre(u, env)];
  if (env.ADMIN_PASSWORD && await estAdminEmail(u.e, env)) c.push(await makeCookie(env));
  return c;
}
