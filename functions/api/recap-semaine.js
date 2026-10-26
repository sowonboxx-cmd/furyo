// GET /api/recap-semaine?du=AAAA-MM-JJ[&sids=a,b] : pour la page publique /recap/semaine/ et le studio Quoi de neuf.
//   choix    : ce que Will a mis en avant dans le studio (KV « qdn:<lundi> »), vide sinon (= choix automatique)
//   derniers : couverture du dernier tome paru pour les news « Tomes en circulation » (sids des séries liées)
// Gardé 10 minutes (le studio redemande avec ?frais=1 après un changement).
import { derniersTomes } from "../../lib/derniers.js";
const J = /^\d{4}-\d{2}-\d{2}$/;
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", ...h } });

export async function onRequestGet({ request, env, waitUntil }) {
  const u = new URL(request.url), du = u.searchParams.get("du") || "";
  if (!J.test(du)) return json({ error: "du attendu" }, 400);
  const sids = (u.searchParams.get("sids") || "").split(",").filter(Boolean).sort();
  const cle = new Request(u.origin + "/__cache/recap-semaine-v1?du=" + du + "&sids=" + sids.join(","));
  if (!u.searchParams.has("frais")) { const hit = await caches.default.match(cle); if (hit) return new Response(hit.body, hit); }
  let choix = {}; try { choix = JSON.parse((await env.STATS.get("qdn:" + du)) || "{}") || {}; } catch (e) {}
  const derniers = await derniersTomes(env, waitUntil, sids).catch(() => ({}));
  const res = json({ du, choix, derniers }, 200, { "cache-control": "public, max-age=600" });
  waitUntil(caches.default.put(cle, res.clone()));
  return res;
}
