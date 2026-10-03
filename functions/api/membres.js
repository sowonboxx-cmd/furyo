// GET /api/membres : la liste publique des membres (sans e-mail ; réseaux seulement si le membre les a rendus publics).
import { queryAll, check, cached } from "../../lib/notion.js";
import { MEMBRES, fiche } from "../../lib/membres.js";
import { estAdminEmail, membre } from "../../lib/auth.js";
import { catalogue } from "../../lib/badges.js";
// Il faut être membre pour voir les membres : sans connexion, on ne donne que le nombre d'inscrits.
const J = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
export async function onRequestGet(ctx) {
  const u = await membre(ctx.request, ctx.env);
  if (u && u.m) { const r = await liste(ctx); const out = new Response(r.body, r); out.headers.set("cache-control", "private, no-store"); return out; }
  if (new URL(ctx.request.url).searchParams.get("u")) return J({ locked: true, error: "réservé aux membres" }, 401);
  const r = await liste(ctx); const j = await r.json().catch(() => ({}));
  return J({ locked: true, total: j.total || 0 });
}
async function liste({ request, env, waitUntil }) {
  // ?u=<identifiant> : un seul membre (page publique furyogang.com/membres/<identifiant>).
  const one = new URL(request.url).searchParams.get("u");
  if (one) {
    const rows = await queryAll(env.NOTION_TOKEN, { ...MEMBRES, body: { filter: { property: "Identifiant", rich_text: { equals: one.toLowerCase() } } } });
    const r = rows[0], cat = await catalogue(env.NOTION_TOKEN).catch(() => []);
    if (!r || check(r.properties["Masqué"])) return new Response(JSON.stringify({ error: "introuvable" }), { status: 404, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ membre: fiche(r, { admin: await estAdminEmail(r.properties["Email"]?.email, env), cat }), catalogue: cat }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  }
  return cached(request, waitUntil, "/api/membres", 120, async () => {
    const [rows, cat] = await Promise.all([queryAll(env.NOTION_TOKEN, { ...MEMBRES }), catalogue(env.NOTION_TOKEN, true).catch(() => [])]);
    const items = [];
    for (const r of rows) {
      if (check(r.properties["Masqué"])) continue;
      items.push(fiche(r, { admin: await estAdminEmail(r.properties["Email"]?.email, env), cat }));
    }
    items.sort((a, b) => (a.num || 1e9) - (b.num || 1e9));
    return { items, total: items.length, catalogue: cat };
  });
}
