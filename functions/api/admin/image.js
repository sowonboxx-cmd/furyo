// POST /api/admin/image (corps = l'image, en-tête content-type image/*) : Will ajoute une image à une news depuis
// le back-office. Elle est gardée dans le stockage du site (KV « STATS ») et servie par /api/img/<id>.
import { json, isAdmin } from "../../../lib/admin.js";

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  if (!env.STATS) return json({ error: "stockage non branché" }, 503);
  const ct = (request.headers.get("content-type") || "").split(";")[0];
  if (!/^image\/(jpeg|png|webp|gif)$/.test(ct)) return json({ error: "Format d'image non pris en charge (JPG, PNG, WebP)." }, 400);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > 8e6) return json({ error: "Image vide ou trop lourde (8 Mo maximum)." }, 400);
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  await env.STATS.put("img:" + id, buf, { metadata: { ct } });
  return json({ ok: true, url: new URL("/api/img/" + id, request.url).toString() });
}
