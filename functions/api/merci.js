// POST /api/merci : le membre ferme sa fenêtre « Merci, t'es Premium » (Will, 25/10/2026).
//   { reseau: "x"|"instagram"|"tiktok", compte, mention } → on enregistre son @ sur sa fiche (+ « Mention OK »),
//   ce qui lui donne aussi le badge « Connecté ». Puis la fenêtre est effacée.
import { membre } from "../../lib/auth.js";
import { cleMerci } from "../../lib/merci.js";
import { patch, rt } from "../../lib/membres.js";
const CHAMP = { x: "X", instagram: "Instagram", tiktok: "TikTok" };
const propre = s => String(s || "").trim().replace(/^https?:\/\/(www\.|m\.)?(instagram\.com|x\.com|twitter\.com|tiktok\.com)\//i, "").replace(/^@+/, "").replace(/[/?#].*$/, "").replace(/[^\w.]/g, "").slice(0, 40);
export async function onRequestPost({ request, env }) {
  const u = await membre(request, env);
  const b = await request.json().catch(() => ({}));
  let enregistre = false;
  if (u && u.m) {
    const compte = propre(b.compte), champ = CHAMP[b.reseau];
    if (compte && champ) {
      const r = await patch(env.NOTION_TOKEN, u.m, { [champ]: rt(compte), "Mention OK": { checkbox: !!b.mention } }).catch(() => null);
      enregistre = !!(r && r.ok);
      try { await caches.default.delete(new Request(new URL("/api/membres", request.url).toString())); } catch (e) {}
    }
    if (!b.garder) await env.STATS.delete(cleMerci(u.m));
  }
  return new Response(JSON.stringify({ ok: true, enregistre }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
