// GET /api/img/<id> : image ajoutée par Will depuis le back-office (voir /api/admin/image).
export async function onRequestGet({ env, params }) {
  const id = String(params.id || "");
  if (!/^[a-f0-9]{20}$/.test(id) || !env.STATS) return new Response("introuvable", { status: 404 });
  const { value, metadata } = await env.STATS.getWithMetadata("img:" + id, { type: "arrayBuffer" });
  if (!value) return new Response("introuvable", { status: 404 });
  return new Response(value, { headers: { "content-type": (metadata && metadata.ct) || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
}
