// « Ma collection » d'un membre (Will, 06/10/2026) : ses tomes dans 4 listes.
//   c = Collection (tomes possédés), p = Pile à lire, k = Panier, w = Wishlist ; chaque liste = { idTome: idSérie }.
//   GET  /api/collection                      → { ok, lists: {c,p,k,w}, max } (max = limite gratuite de la Collection, null pour l'admin)
//   POST /api/collection { l, on, tomes: [{t, s}] } → ajoute (on) ou retire des tomes d'une liste → { ok, lists, max }
// Gratuit : 25 tomes dans la Collection (offre payante à venir). Stockage : KV « STATS », clé bib:<membre>.
import { membre } from "../../lib/auth.js";
import { estAdminEmail } from "../../lib/auth.js";
const MAX = 25;
const ID = /^[0-9a-f]{32}$/;
const uid = u => String(u.m || u.k || u.e || "").replace(/[^\w@.-]/g, "").slice(0, 80);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const vide = () => ({ c: {}, p: {}, k: {}, w: {} });

async function lire(env, me) {
  try { return { ...vide(), ...JSON.parse((await env.STATS.get("bib:" + uid(me))) || "{}") }; } catch (e) { return vide(); }
}

export async function onRequestGet({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage indisponible" }, 503);
  const admin = await estAdminEmail(me.e, env);
  return json({ ok: true, lists: await lire(env, me), max: admin ? null : MAX });
}

export async function onRequestPost({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage indisponible" }, 503);
  let b = {}; try { b = await request.json(); } catch (e) {}
  const l = String(b.l || ""), tomes = (Array.isArray(b.tomes) ? b.tomes : []).filter(x => x && ID.test(x.t) && ID.test(x.s)).slice(0, 200);
  if (!"cpkw".includes(l) || l.length !== 1 || !tomes.length) return json({ ok: false, error: "demande invalide" }, 400);
  const admin = await estAdminEmail(me.e, env), lists = await lire(env, me);
  if (b.on) {
    const nouveaux = tomes.filter(x => !lists[l][x.t]);
    if (l === "c" && !admin && Object.keys(lists.c).length + nouveaux.length > MAX)
      return json({ ok: false, error: "quota", max: MAX, lists }, 402);
    nouveaux.forEach(x => { lists[l][x.t] = x.s; });
    // Un tome qu'on possède n'est plus dans le panier ni la wishlist.
    if (l === "c") nouveaux.forEach(x => { delete lists.k[x.t]; delete lists.w[x.t]; });
  } else tomes.forEach(x => { delete lists[l][x.t]; });
  await env.STATS.put("bib:" + uid(me), JSON.stringify(lists));
  return json({ ok: true, lists, max: admin ? null : MAX });
}
