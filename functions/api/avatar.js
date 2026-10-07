// POST /api/avatar : le membre connecté change sa photo de profil (Will, 07/10/2026).
// La page envoie l'image déjà recadrée en carré (1:1, 512 px, JPEG). Elle est rangée dans le stockage R2
// (clé av/<membre>-<horodatage>.jpg), servie par /av/<…>, et son adresse est écrite dans la colonne « Photo » de Notion.
// La connexion Google ne remplace plus cette photo. L'ancienne photo envoyée sur le site est supprimée.
import { membre, cookieMembre } from "../../lib/auth.js";
import { lirePage, patch } from "../../lib/membres.js";
const json = (o, status = 200, h = {}) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...h } });
const TYPES = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };
export async function onRequestPost({ request, env }) {
  const u = await membre(request, env).catch(() => null);
  if (!u || !u.m) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.COUV) return json({ ok: false, error: "stockage indisponible" }, 503);
  const type = (request.headers.get("content-type") || "").split(";")[0].trim(), ext = TYPES[type];
  if (!ext) return json({ ok: false, error: "Image JPEG, PNG ou WebP seulement." }, 415);
  const buf = await request.arrayBuffer();
  if (buf.byteLength < 500 || buf.byteLength > 2_000_000) return json({ ok: false, error: "Image trop lourde (2 Mo maximum)." }, 413);
  const id = String(u.m).replace(/-/g, ""), nom = `${id}-${Date.now()}.${ext}`;
  await env.COUV.put("av/" + nom, buf, { httpMetadata: { contentType: type } });
  const url = "https://furyogang.com/av/" + nom;
  const page = await lirePage(env.NOTION_TOKEN, id).catch(() => null);
  const avant = page?.properties?.["Photo"]?.url || "";
  const r = await patch(env.NOTION_TOKEN, id, { "Photo": { url } });
  if (!r.ok) { await env.COUV.delete("av/" + nom).catch(() => {}); return json({ ok: false, error: "Enregistrement impossible, réessaie." }, 502); }
  const m = avant.match(/^https:\/\/furyogang\.com\/av\/([0-9a-f]{32}-\d+\.(?:jpg|webp|png))$/);
  if (m && m[1].startsWith(id)) await env.COUV.delete("av/" + m[1]).catch(() => {});
  // Le cookie suit la nouvelle photo (avatar de l'en-tête).
  const c = await cookieMembre({ ...u, p: url, x: undefined }, env);
  return json({ ok: true, photo: url }, 200, { "set-cookie": c });
}
