// GET /av/<membre>-<horodatage>.jpg : photo de profil envoyée par un membre (stockage R2, voir functions/api/avatar.js).
export async function onRequestGet({ params, env }) {
  const k = String(params.k || "");
  if (!/^[0-9a-f]{32}-\d+\.(jpg|webp|png)$/.test(k) || !env.COUV) return new Response("introuvable", { status: 404 });
  const o = await env.COUV.get("av/" + k);
  if (!o) return new Response("introuvable", { status: 404 });
  return new Response(o.body, { headers: { "content-type": o.httpMetadata?.contentType || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
}
