// « Ma collection » d'un membre (Will, 06/10/2026) : ses tomes dans 4 listes.
//   c = Collection (tomes possédés), p = Pile à lire, k = Panier, w = Wishlist ; chaque liste = { idTome: idSérie }.
//   GET  /api/collection                      → { ok, lists: {c,p,k,w}, max } (max = limite gratuite de la Collection, null pour l'admin et l'accès complet / VIP)
//   POST /api/collection { l, on, tomes: [{t, s}] } → ajoute (on) ou retire des tomes d'une liste → { ok, lists, max }
// Collection illimitée pour tous les membres (Will, 08/10/2026) ; Pile à lire, Panier et Wishlist réservés au Premium.
// Stockage : KV « STATS », clé bib:<membre>.
import { membre } from "../../lib/auth.js";
import { acces } from "../../lib/acces.js";
import { activite, jourParis, decaler } from "../../lib/communaute.js";
const PREMIUM = "pkw"; // p n'est plus proposée : fusionnée dans w
const ID = /^[0-9a-f]{32}$/;
const uid = u => String(u.m || u.k || u.e || "").replace(/[^\w@.-]/g, "").slice(0, 80);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const vide = () => ({ c: {}, p: {}, k: {}, w: {}, h: {}, cp: {} });

async function lire(env, me) {
  let l; try { l = { ...vide(), ...JSON.parse((await env.STATS.get("bib:" + uid(me))) || "{}") }; } catch (e) { return vide(); }
  // « Envie de lire » (w) remplace Pile à lire (p) et Wishlist (Will, 09/10/2026) : l'ancienne pile y est fusionnée.
  if (Object.keys(l.p).length) { l.w = { ...l.p, ...l.w }; l.p = {}; }
  return l;
}

export async function onRequestGet({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage indisponible" }, 503);
  const { complet } = await acces(me, env);
  return json({ ok: true, lists: await lire(env, me), max: null, vip: complet });
}

export async function onRequestPost({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage indisponible" }, 503);
  let b = {}; try { b = await request.json(); } catch (e) {}
  const l = String(b.l || ""), tomes = (Array.isArray(b.tomes) ? b.tomes : []).filter(x => x && ID.test(x.t) && ID.test(x.s)).slice(0, 200).map(x => ({ t: x.t, s: x.s, p: x.p === "F" || x.p === "J" ? x.p : "" }));
  if (!"cpkw".includes(l) || l.length !== 1 || !tomes.length) return json({ ok: false, error: "demande invalide" }, 400);
  const { complet } = await acces(me, env);
  if (b.on && PREMIUM.includes(l) && !complet) return json({ ok: false, error: "premium" }, 402);
  const lists = await lire(env, me);
  let delta = 0;
  if (b.on) {
    const nouveaux = tomes.filter(x => !lists[l][x.t]);
    nouveaux.forEach(x => { lists[l][x.t] = x.s; });
    // Un tome qu'on possède n'est plus dans le panier ni la wishlist.
    if (l === "c") nouveaux.forEach(x => { delete lists.k[x.t]; delete lists.w[x.t]; if (x.p === "F" || x.p === "J") lists.cp[x.t] = x.p; });
    if (l === "c") delta = nouveaux.length;
  } else {
    const partis = tomes.filter(x => lists[l][x.t]);
    partis.forEach(x => { delete lists[l][x.t]; if (l === "c") delete lists.cp[x.t]; });
    if (l === "c") delta = -partis.length;
  }
  // Classements « Ce mois-ci » et « Cette semaine » : tomes ajoutés par jour (heure de Paris), retraits déduits.
  if (delta) { const j = jourParis(); lists.h[j] = (lists.h[j] || 0) + delta;
    const vieux = decaler(j, -62); for (const k of Object.keys(lists.h)) if (k < vieux) delete lists.h[k]; }
  await env.STATS.put("bib:" + uid(me), JSON.stringify(lists));
  if (delta > 0) { const s = tomes.find(x => lists.c[x.t])?.s; if (s) await activite(env, uid(me), { k: "a", s, n: delta }).catch(() => {}); }
  return json({ ok: true, lists, max: null, vip: complet });
}
