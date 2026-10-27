// Diagnostic temporaire (27/10/2026) : titres et dates des rendez-vous du calendrier éditorial (rien d'autre).
export async function onRequestGet({ env }) {
  let d = null; try { d = JSON.parse((await env.STATS.get("hq:calendrier")) || "null"); } catch (e) {}
  const ev = ((d && d.events) || []).map(e => [e.id, e.titre, e.date || e.repeat || "", e.fait ? "fait" : ""]);
  return new Response(JSON.stringify(ev, null, 1), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
