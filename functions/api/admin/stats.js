// GET /api/admin/stats : statistiques Google Search Console de furyogang.com, pour Will seulement (Will, 07/10/2026).
// Compte de service Google (secret GSC_KEY, accès « Restreint » en lecture sur la propriété). Résultat gardé 1 h.
//   → { maj, periode: {du, au}, total: {clics, impressions, ctr, position}, avant: {…}, jours: [{d, c, i}],
//       requetes: [{k, c, i, ctr, pos}], pages: [...], pays: [...], appareils: [...] }
// Les données de Google ont 2 à 3 jours de retard.
import { json, isAdmin } from "../../../lib/admin.js";
import { cached } from "../../../lib/notion.js";

const SITE = "sc-domain:furyogang.com";
const b64u = s => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64uBuf = buf => b64u(String.fromCharCode(...new Uint8Array(buf)));

async function jeton(key) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const c = b64u(JSON.stringify({ iss: key.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: key.token_uri, iat: now, exp: now + 3600 }));
  const pem = key.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), ch => ch.charCodeAt(0));
  const k = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", k, new TextEncoder().encode(h + "." + c));
  const r = await fetch(key.token_uri, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${h}.${c}.${b64uBuf(sig)}` }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("Google refuse la clé : " + (j.error_description || j.error || r.status));
  return j.access_token;
}

const jour = d => d.toISOString().slice(0, 10);
const decal = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

async function construire(env) {
  const key = JSON.parse(env.GSC_KEY);
  const tok = await jeton(key);
  const q = async body => {
    const r = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
      method: "POST", headers: { Authorization: "Bearer " + tok, "content-type": "application/json" }, body: JSON.stringify({ dataState: "all", ...body }) });
    const j = await r.json();
    if (j.error) throw new Error(j.error.message || "Search Console indisponible");
    return j.rows || [];
  };
  const fin = decal(new Date(), -1), debut = decal(fin, -27), avFin = decal(debut, -1), avDebut = decal(avFin, -27);
  const p = { startDate: jour(debut), endDate: jour(fin) };
  const tot = rows => { const r = rows[0] || {}; return { clics: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }; };
  const ligne = r => ({ k: r.keys[0], c: r.clicks, i: r.impressions, ctr: r.ctr, pos: r.position });
  const [t, ta, jours, requetes, pages, pays, appareils] = await Promise.all([
    q(p), q({ startDate: jour(avDebut), endDate: jour(avFin) }),
    q({ startDate: jour(decal(fin, -89)), endDate: jour(fin), dimensions: ["date"], rowLimit: 100 }),
    q({ ...p, dimensions: ["query"], rowLimit: 50 }),
    q({ ...p, dimensions: ["page"], rowLimit: 50 }),
    q({ ...p, dimensions: ["country"], rowLimit: 10 }),
    q({ ...p, dimensions: ["device"], rowLimit: 5 }),
  ]);
  return { maj: new Date().toISOString(), periode: { du: p.startDate, au: p.endDate }, total: tot(t), avant: tot(ta),
    jours: jours.map(r => ({ d: r.keys[0], c: r.clicks, i: r.impressions })),
    requetes: requetes.map(ligne), pages: pages.map(r => ({ ...ligne(r), k: r.keys[0].replace(/^https?:\/\/(www\.)?furyogang\.com/, "") || "/" })),
    pays: pays.map(ligne), appareils: appareils.map(ligne) };
}

export async function onRequestGet({ request, env, waitUntil }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé à l'admin" }, 401);
  if (!env.GSC_KEY) return json({ error: "Clé Search Console absente" }, 503);
  try {
    const r = await cached(request, waitUntil, "/__cache/admin-stats-v1", 3600, () => construire(env));
    return new Response(r.body, { status: r.status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch (e) { return json({ error: String(e.message || e) }, 502); }
}
