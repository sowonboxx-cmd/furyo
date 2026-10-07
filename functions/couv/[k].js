// GET /couv/<clé> : une couverture copiée dans le stockage R2 de FuryoGang (voir functions/api/couv.js).
// Sert aussi de source au redimensionnement des vignettes.
export async function onRequestGet({ params, env }) {
  const k = String(params.k || "");
  if (!/^[0-9a-f]{64}$/.test(k) || !env.COUV) return new Response("introuvable", { status: 404 });
  const o = await env.COUV.get(k);
  if (!o) return new Response("introuvable", { status: 404 });
  return new Response(o.body, { headers: { "content-type": o.httpMetadata?.contentType || "image/jpeg", "cache-control": "public, max-age=31536000, immutable", etag: o.httpEtag } });
}
