// Lexique FuryoGang public (Will, 02/11/2026) : seuls les mots que Will a validés (statut « Validé ») sont servis.
// Les données complètes (planches, pages, légendes réseaux, vidéo, affiche) restent dans R2 « prive/lexique/ », lisibles par l'admin seulement
// (voir /api/admin/prive). Ici, on ne renvoie que ce qui peut être public.
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=120" } });
export async function onRequestGet({ env }) {
  if (!env.COUV) return json({ series: [], mots: [] });
  const o = await env.COUV.get("prive/lexique/lexique.json");
  if (!o) return json({ series: [], mots: [] });
  let d; try { d = JSON.parse(await o.text()); } catch (e) { return json({ series: [], mots: [] }); }
  const mots = (d.mots || []).filter(m => m.statut === "Validé").map(m => {
    const { planches, pages, x, ig, tiktok, video, affiche, notes, ...pub } = m;
    return { ...pub, video: !!video, occ: (m.occ || []).map(({ page, pages, ...r }) => r) };
  });
  return json({ series: d.series || [], mots });
}
