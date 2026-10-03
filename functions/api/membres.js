// GET /api/membres : la liste publique des membres (sans e-mail ; réseaux seulement si le membre les a rendus publics).
import { queryAll, check, cached } from "../../lib/notion.js";
import { MEMBRES, fiche } from "../../lib/membres.js";
import { estAdminEmail } from "../../lib/auth.js";
export async function onRequestGet({ request, env, waitUntil }) {
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
