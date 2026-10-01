// GET /api/meian?licence=<id>   (id de la licence, le même sur meian-editions.fr et anime-store.fr)
// Le site de Meian ne s'affiche qu'en JavaScript ; sa boutique officielle anime-store.fr, si.
// Renvoie les tomes de la série : numéro, id produit, ISBN et image de couverture officielle.
// Utilisé par la tâche « Couvertures à venir » (ex. /api/meian?licence=2198 pour Star: Strike It Rich).
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" } });
const UA = { "user-agent": "Mozilla/5.0 (FuryoGang couvertures)" };

export async function onRequestGet({ request }) {
  const id = new URL(request.url).searchParams.get("licence") || "";
  if (!/^\d{1,6}$/.test(id)) return json({ error: "licence invalide" }, 400);
  const r = await fetch(`https://www.anime-store.fr/as/x-produits-${id}.html`, { headers: UA });
  if (!r.ok) return json({ error: "licence introuvable", status: r.status }, 404);
  const html = await r.text();
  const seen = new Map();
  for (const m of html.matchAll(/href="(?:\/as\/)?([^"]*?Tome-(\d+)[^"]*?-produit-manga-(\d+)\.html)"/gi)) {
    const pid = m[3];
    if (!seen.has(pid)) seen.set(pid, { n: +m[2], id: +pid, page: `https://www.anime-store.fr/as/${m[1].replace(/^\/?as\//, "")}`, meian: `https://www.meian-editions.fr/meian/produit/x/${pid}` });
  }
  const tomes = [...seen.values()].sort((a, b) => a.n - b.n);
  await Promise.all(tomes.map(async t => {
    t.image = `https://www.anime-store.fr/as/images/visuels/produit_derive/facebook/${t.id}.jpg`;
    try { const p = await (await fetch(t.page, { headers: UA })).text(); t.isbn = (p.match(/97[89]\d{10}/) || [])[0] || null; } catch (e) { t.isbn = null; }
  }));
  return json({ licence: +id, tomes });
}
