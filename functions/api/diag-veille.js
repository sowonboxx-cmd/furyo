// Diagnostic temporaire (27/10/2026) : étapes des derniers enregistrements du studio (aucun contenu, juste les étapes et les temps).
export async function onRequestGet({ env }) {
  const l = await env.STATS.list({ prefix: "dbg:v:" });
  const out = {};
  for (const k of l.keys.slice(-60)) { const [, , id, n] = k.name.split(":"); (out[id] = out[id] || []).push(n + " " + (await env.STATS.get(k.name))); }
  return new Response(JSON.stringify(out, null, 1), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
