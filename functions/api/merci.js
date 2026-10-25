// POST /api/merci : le membre a vu sa fenêtre « Merci, t'es Premium », on l'efface (Will, 25/10/2026).
import { membre } from "../../lib/auth.js";
import { cleMerci } from "../../lib/merci.js";
export async function onRequestPost({ request, env }) {
  const u = await membre(request, env);
  if (u && u.m) await env.STATS.delete(cleMerci(u.m));
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
