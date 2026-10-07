// POST /api/admin/membre { id, badges: [id de badge], points } : un admin change les badges (et les points) d'un membre.
// Seuls les badges « Manuel » et « Administrateurs » s'attribuent à la main ; les automatiques ne bougent pas.
import { json, isAdmin } from "../../../lib/admin.js";
import { estAdminEmail } from "../../../lib/auth.js";
import { oublierAcces } from "../../../lib/acces.js";
import { lirePage, patch, fiche } from "../../../lib/membres.js";
import { catalogue } from "../../../lib/badges.js";
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const b = await request.json().catch(() => ({}));
  const id = String(b.id || "").replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/.test(id)) return json({ error: "membre inconnu" }, 400);
  const cat = await catalogue(env.NOTION_TOKEN, true);
  const permis = new Set(cat.filter(x => x.r !== "cent").map(x => x.id));
  const ids = [...new Set((Array.isArray(b.badges) ? b.badges : []).map(String))].filter(x => permis.has(x));
  const props = { "Badges": { relation: ids.map(x => ({ id: x })) } };
  if (b.points !== undefined && b.points !== "") { const n = Math.round(Number(b.points)); if (Number.isFinite(n)) props["Points"] = { number: Math.max(0, Math.min(n, 1e6)) }; }
  const r = await patch(env.NOTION_TOKEN, id, props);
  if (!r.ok) return json({ error: "Enregistrement impossible" }, 502);
  oublierAcces(id);
  // La liste publique est en cache : on la vide pour qu'elle suive tout de suite.
  try { await caches.default.delete(new Request(new URL("/api/membres", request.url).toString())); } catch (e) {}
  const page = await lirePage(env.NOTION_TOKEN, id);
  return json({ ok: true, membre: page ? fiche(page, { admin: await estAdminEmail(page.properties["Email"]?.email, env), cat }) : null });
}
