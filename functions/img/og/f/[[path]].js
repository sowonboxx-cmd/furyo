// Sert les cartes de partage générées par le back-office, stockées dans R2 (bucket COUV, clé « og/f/<nom> »).
// Les cartes livrées avec le site (fichiers statiques dans /img/og/f/) sont servies directement par Pages AVANT
// cette fonction ; celle-ci ne répond donc que pour les cartes générées à la volée (nouvelles news).
export async function onRequestGet({ params, env }) {
  const name = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  if (!/^[\w-]+\.(jpg|jpeg|png)$/i.test(name)) return new Response("Not found", { status: 404 });
  if (!env.COUV) return new Response("Not found", { status: 404 });
  const obj = await env.COUV.get("og/f/" + name).catch(() => null);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, { headers: {
    "content-type": (obj.httpMetadata && obj.httpMetadata.contentType) || "image/jpeg",
    "cache-control": "public, max-age=3600",
  } });
}
