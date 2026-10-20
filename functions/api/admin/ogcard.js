// POST /api/admin/ogcard { id, data } : enregistre la carte de partage (og:image) d'une news dans R2.
// data = data URL PNG/JPEG générée côté back-office par le module /site/og-actu.js. Clé R2 = « og/f/actu-<id8>.jpg ».
// La carte est ensuite servie par /functions/img/og/f/[[path]].js et reprise automatiquement comme og:image de l'article.
import { json, isAdmin } from "../../../lib/admin.js";

export async function onRequestPost(ctx) {
  try { return await up(ctx); } catch (e) { return json({ error: "erreur serveur : " + String(e && e.message || e).slice(0, 200) }, 500); }
}
async function up({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  if (!env.COUV) return json({ error: "stockage indisponible" }, 500);
  let b = {}; try { b = await request.json(); } catch (e) {}
  const id8 = String(b.id || "").replace(/-/g, "").slice(-8);
  if (!/^[0-9a-f]{8}$/.test(id8)) return json({ error: "news inconnue" }, 400);
  const m = String(b.data || "").match(/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return json({ error: "image invalide" }, 400);
  const bin = atob(m[2]); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bytes.length > 4_000_000) return json({ error: "image trop lourde" }, 400);
  await env.COUV.put("og/f/actu-" + id8 + ".jpg", bytes, { httpMetadata: { contentType: m[1] } });
  return json({ ok: true, url: "/img/og/f/actu-" + id8 + ".jpg" });
}
