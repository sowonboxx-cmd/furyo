// GET /api/ogcard/actu-<id8>.jpg : sert une carte de partage (og:image) générée par le back-office, stockée dans R2
// (bucket COUV, clé « og/f/<nom> »). Sert les news dont la carte n'est pas livrée en statique dans /img/og/f/.
export async function onRequestGet({ params, env }) {
  const name = String(params.name || "");
  if (!/^[\w-]+\.(jpg|jpeg|png)$/i.test(name)) return new Response("Not found", { status: 404 });
  if (!env.COUV) return new Response("Not found", { status: 404 });
  const obj = await env.COUV.get("og/f/" + name).catch(() => null);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, { headers: {
    "content-type": (obj.httpMetadata && obj.httpMetadata.contentType) || "image/jpeg",
    "cache-control": "public, max-age=3600",
  } });
}
