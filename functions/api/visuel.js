// GET /api/visuel?s=<id de la page série>&p=main|news|fond&i=<n>
// Sert une image déposée dans Notion (colonnes « Visuel principal » / « Visuels news » de la base Séries).
// Notion garde les fichiers, mais ses liens de téléchargement expirent au bout d'une heure :
// cette fonction redemande un lien frais à Notion puis met l'image en cache chez Cloudflare (1 jour).
const PROPS = { main: "Visuel principal", news: "Visuels news", fond: "Fond de fiche" };

export async function onRequestGet({ env, request, waitUntil }) {
  const u = new URL(request.url);
  const s = (u.searchParams.get("s") || "").replace(/-/g, "");
  const prop = PROPS[u.searchParams.get("p") || "main"];
  const i = Math.max(0, parseInt(u.searchParams.get("i") || "0", 10) || 0);
  if (!/^[0-9a-f]{32}$/.test(s) || !prop) return new Response("Paramètres invalides", { status: 400 });
  if (!env.NOTION_TOKEN) return new Response("NOTION_TOKEN manquant", { status: 503 });

  const cache = caches.default;
  const key = new Request(`${u.origin}/api/visuel?s=${s}&p=${u.searchParams.get("p") || "main"}&i=${i}`);
  if (!u.searchParams.has("refresh")) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  const page = await fetch(`https://api.notion.com/v1/pages/${s}`, {
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" },
  });
  if (!page.ok) return new Response("Série introuvable", { status: 404 });
  const files = ((await page.json()).properties?.[prop]?.files) || [];
  if (!files.length) return new Response("Pas d'image", { status: 404 });
  const f = files[i % files.length];
  const src = (f.file && f.file.url) || (f.external && f.external.url);
  const img = await fetch(src);
  if (!img.ok) return new Response("Image indisponible", { status: 502 });
  const res = new Response(img.body, {
    headers: {
      "Content-Type": img.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Visuels": String(files.length),
    },
  });
  waitUntil(cache.put(key, res.clone()));
  return res;
}
