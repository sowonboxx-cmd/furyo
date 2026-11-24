// Tâche planifiée des réseaux (Will, 23/11/2026), appelée toutes les 10 minutes par GitHub Actions (.github/workflows/reseaux.yml).
// Sans secret : elle ne fait que ce qui est déjà prévu (news planifiées dont l'heure est passée, case Instagram cochée),
// avec un verrou par news, donc l'appeler en plus ne publie jamais rien de nouveau ni en double.
import { tourneeReseaux } from "../../../lib/meta.js";

export async function onRequest({ request, env }) {
  // Appel « doux » (relais depuis les pages du site) : ignoré si une tournée a eu lieu dans les 2 dernières minutes.
  const doux = new URL(request.url).searchParams.has("doux");
  if (doux && env.STATS && await env.STATS.get("cron:dernier")) return new Response(JSON.stringify({ ok: true, recent: true }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  if (env.STATS) { if (await env.STATS.get("cron:reseaux")) return new Response(JSON.stringify({ ok: true, occupe: true }), { headers: { "content-type": "application/json" } }); await env.STATS.put("cron:reseaux", "1", { expirationTtl: 120 }); }
  try {
    if (env.STATS) await env.STATS.put("cron:dernier", "1", { expirationTtl: 120 });
    const r = await tourneeReseaux(env);
    if (r.length) { const c = caches.default; await Promise.all(["/api/news?v=21", "/api/calendrier"].map(k => c.delete(new Request("https://furyogang.com" + k)))); }
    return new Response(JSON.stringify({ ok: true, traitees: r, vus: tourneeReseaux.vus, err: tourneeReseaux.err || "" }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } finally { if (env.STATS) await env.STATS.delete("cron:reseaux").catch(() => {}); }
}
