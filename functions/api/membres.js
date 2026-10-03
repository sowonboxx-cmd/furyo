// GET /api/membres : la liste publique des membres (sans e-mail ; réseaux seulement si le membre les a rendus publics).
import { queryAll, check, cached } from "../../lib/notion.js";
import { MEMBRES, fiche } from "../../lib/membres.js";
import { estAdminEmail } from "../../lib/auth.js";
export async function onRequestGet({ request, env, waitUntil }) {
  // ?u=<identifiant> : un seul membre (page publique furyogang.com/membres/<identifiant>).
  const one = new URL(request.url).searchParams.get("u");
  if (one) {
    const rows = await queryAll(env.NOTION_TOKEN, { ...MEMBRES, body: { filter: { property: "Identifiant", rich_text: { equals: one.toLowerCase() } } } });
    const r = rows[0];
    if (!r || check(r.properties["Masqué"])) return new Response(JSON.stringify({ error: "introuvable" }), { status: 404, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ membre: fiche(r, { admin: await estAdminEmail(r.properties["Email"]?.email, env) }) }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
  }
  return cached(request, waitUntil, "/api/membres", 120, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...MEMBRES });
    const items = [];
    for (const r of rows) {
      if (check(r.properties["Masqué"])) continue;
      items.push(fiche(r, { admin: await estAdminEmail(r.properties["Email"]?.email, env) }));
    }
    items.sort((a, b) => (a.num || 1e9) - (b.num || 1e9));
    return { items, total: items.length };
  });
}
