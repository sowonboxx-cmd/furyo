// Communauté (Will, 07/10/2026). Réservé aux membres connectés (sinon { locked: true }).
//   GET  /api/communaute               → { classements: { g, m, s }, suivis: [ids] }
//        g = Général (tomes dans la collection), m = Ce mois-ci, s = Cette semaine (tomes ajoutés, retraits déduits)
//        chaque ligne : { id, n, mv } ; mv = places gagnées (+) ou perdues (-), null = nouveau dans le classement
//        Flèches : Général comparé à il y a 7 jours ; mois et semaine comparés à la veille (ils bougent tous les jours).
//   GET  /api/communaute?id=<membre>   → page d'un membre : { tot, fr, jp, abonnes, rang, on, recents, activite }
//   POST /api/communaute { suivre: <membre> } → suivre / ne plus suivre ce membre → { ok, on, abonnes }
import { membre } from "../../lib/auth.js";
import { uid, jourParis, debutSemaine, debutMois, decaler } from "../../lib/communaute.js";
const ID = /^[0-9a-f]{32}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const lireJ = async (env, k, def) => { try { return JSON.parse((await env.STATS.get(k)) || "null") ?? def; } catch (e) { return def; } };
const CLE = "https://furyogang.com/__cache/communaute-v1";

async function construire(env) {
  const j = jourParis(), lun = debutSemaine(j), m1 = debutMois(j);
  const rows = [];
  let cursor;
  do {
    const r = await env.STATS.list({ prefix: "bib:", cursor });
    for (const k of r.keys) rows.push(k.name);
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  const data = await Promise.all(rows.map(async k => {
    const id = k.slice(4); if (!ID.test(id)) return null;
    const b = await lireJ(env, k, {});
    const h = b.h || {}; let sem = 0, mois = 0;
    for (const [d, n] of Object.entries(h)) { if (d >= lun) sem += n; if (d >= m1) mois += n; }
    return { id, g: Object.keys(b.c || {}).length, m: Math.max(0, mois), s: Math.max(0, sem) };
  }));
  const ok = data.filter(Boolean);
  const tri = k => ok.filter(x => x[k] > 0).sort((a, b) => b[k] - a[k]).slice(0, 100).map((x, i) => ({ id: x.id, n: x[k], r: i + 1 }));
  const boards = { g: tri("g"), m: tri("m"), s: tri("s") };
  // Places du jour gardées 10 jours, pour les flèches.
  const hist = await lireJ(env, "rk:hist", {}), avantJ = JSON.stringify(hist[j] || null);
  hist[j] = Object.fromEntries(Object.entries(boards).map(([k, l]) => [k, Object.fromEntries(l.map(x => [x.id, x.r]))]));
  for (const d of Object.keys(hist)) if (d < decaler(j, -10)) delete hist[d];
  if (JSON.stringify(hist[j]) !== avantJ) await env.STATS.put("rk:hist", JSON.stringify(hist));
  const avant = (k) => {
    const cible = k === "g" ? decaler(j, -7) : decaler(j, -1);
    const d = Object.keys(hist).filter(x => x <= cible).sort().pop() || Object.keys(hist).filter(x => x < j).sort()[0];
    return d ? hist[d][k] || {} : null;
  };
  const classements = {};
  for (const [k, l] of Object.entries(boards)) {
    const ref = avant(k);
    classements[k] = l.map(x => ({ id: x.id, n: x.n, mv: !ref ? 0 : ref[x.id] ? ref[x.id] - x.r : null }));
  }
  return { classements, construit: Date.now() };
}

async function classements(env, waitUntil) {
  const hit = await caches.default.match(new Request(CLE));
  if (hit) {
    const d = await hit.json().catch(() => null);
    if (d) { if (Date.now() - d.construit > 120e3) waitUntil(garder(env).catch(() => {})); return d; }
  }
  return garder(env);
}
async function garder(env) {
  const d = await construire(env);
  await caches.default.put(new Request(CLE), new Response(JSON.stringify(d), { headers: { "content-type": "application/json", "cache-control": "public, max-age=86400" } }));
  return d;
}

// Page d'un membre : chiffres, derniers tomes ajoutés (avec couverture), activité.
async function profil(env, request, me, id) {
  const b = await lireJ(env, "bib:" + id, {});
  const c = b.c || {}, cp = b.cp || {}, ids = Object.keys(c);
  // Pays des tomes pas encore connus (ajoutés avant le 07/10/2026) : lus dans le catalogue, 15 séries par visite.
  // Collection affichée par série (Will, 07/10/2026) : une couverture par série, le plus petit tome possédé,
  // séries les plus récemment complétées d'abord, 10 séries au plus.
  const seriesOrd = [...new Set(ids.slice().reverse().map(t => c[t]))].slice(0, 12);
  const recents = seriesOrd.map(s => ids.filter(t => c[t] === s));
  const aLire = [...new Set([...seriesOrd, ...ids.filter(t => !cp[t]).map(t => c[t])])].slice(0, 15);
  const det = {};
  await Promise.all(aLire.map(async s => {
    try { const r = await fetch(new URL("/api/biblio?id=" + s, request.url)); if (r.ok) det[s] = await r.json(); } catch (e) {}
  }));
  const tomeInfo = {};
  for (const [s, d] of Object.entries(det)) for (const e of d.editions || []) for (const t of e.tomes || [])
    tomeInfo[t.id] = { p: e.pays === "France" ? "F" : "J", cover: t.cover, n: t.n, s, titre: d.serie?.fr || d.serie?.t, slug: d.serie?.fiche ? d.serie?.slug : "" };
  let change = false;
  for (const t of ids) if (!cp[t] && tomeInfo[t]) { cp[t] = tomeInfo[t].p; change = true; }
  if (change) { b.cp = cp; await env.STATS.put("bib:" + id, JSON.stringify(b)); }
  const fr = ids.filter(t => cp[t] === "F").length, jp = ids.filter(t => cp[t] === "J").length;
  // Activité d'avant le 07/10/2026 (commentaires et j'aime déjà faits) : reconstituée une fois par membre.
  if (!(await env.STATS.get("uab:" + id))) await reconstituer(env, id, new URL(request.url).searchParams.get("s") || "").catch(() => {});
  const [abonnes, suivis, act, cl] = await Promise.all([
    env.STATS.get("mn:" + id).then(x => +x || 0), lireJ(env, "um:" + uid(me), []), lireJ(env, "ua:" + id, []), classements(env, () => {}).catch(() => null)]);
  const rang = cl ? (cl.classements.g.findIndex(x => x.id === id) + 1) || null : null;
  return { ok: true, tot: ids.length, fr, jp, inconnus: ids.length - fr - jp, abonnes, on: suivis.includes(id), rang, moi: uid(me) === id,
    series: new Set(Object.values(c)).size, recents: remplir(recents, tomeInfo, c), activite: act.slice(0, 20) };
}

// Toute la collection d'un membre, visible par les autres membres (Will, 07/10/2026) : seulement la Collection
// (tomes possédés), jamais la pile à lire, le panier ni la wishlist. → { ok, tot, series: [{ s, t: [idTome], p: [F|J|""] }] }
async function collectionComplete(env, id) {
  const b = await lireJ(env, "bib:" + id, {});
  const c = b.c || {}, cp = b.cp || {}, par = {};
  for (const [t, s] of Object.entries(c)) (par[s] = par[s] || { s, t: [], p: [] }).t.push(t), par[s].p.push(cp[t] || "");
  return { ok: true, tot: Object.keys(c).length, series: Object.values(par) };
}

// 12 cases : une couverture par série d'abord, puis d'autres tomes de sa collection, au hasard, pour remplir (Will, 07/10/2026).
function remplir(groupes, info, c) {
  const out = [], pris = new Set();
  for (const l of groupes) {
    const best = l.map(t => ({ t, ...(info[t] || { s: c[l[0]] }) })).sort((a, b) => (a.cover ? 0 : 1) - (b.cover ? 0 : 1) || (a.n ?? 999) - (b.n ?? 999))[0];
    out.push({ ...best, nb: l.length }); pris.add(best.t);
  }
  const reste = groupes.flat().filter(t => !pris.has(t) && info[t] && info[t].cover).sort(() => Math.random() - .5);
  for (const t of reste) { if (out.length >= 12) break; out.push({ t, ...info[t], seul: 1 }); }
  return out.slice(0, 12);
}
async function lister(env, prefix) {
  const out = []; let cursor;
  do { const r = await env.STATS.list({ prefix, cursor }); out.push(...r.keys.map(k => k.name)); cursor = r.list_complete ? null : r.cursor; } while (cursor);
  return out;
}
async function reconstituer(env, id, slug) {
  const likes = (await lister(env, `ul:${id}:`)).map(k => k.slice(`ul:${id}:`.length));
  const cles = (await lister(env, "c:")).filter(k => k !== "c:recent");
  const coms = [];
  for (const k of cles) {
    const l = await lireJ(env, k, []);
    for (const c of l) if (c.u === id || (!c.u && slug && c.s === slug)) coms.push({ k: "c", id: k.slice(2), t: String(c.t || "").slice(0, 160), d: c.d });
  }
  const act = await lireJ(env, "ua:" + id, []);
  const deja = new Set(act.map(a => a.k + a.id + (a.d || "")));
  const tout = [...act, ...coms.filter(a => !deja.has(a.k + a.id + a.d)), ...likes.filter(x => !act.some(a => a.k === "l" && a.id === x)).map(x => ({ k: "l", id: x, d: "" }))];
  tout.sort((a, b) => (b.d || "").localeCompare(a.d || ""));
  await env.STATS.put("ua:" + id, JSON.stringify(tout.slice(0, 60)));
  await env.STATS.put("uab:" + id, "1");
}

export async function onRequestGet({ env, request, waitUntil }) {
  const me = await membre(request, env).catch(() => null);
  if (!me || !me.m) return json({ ok: false, locked: true, error: "réservé aux membres" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage indisponible" }, 503);
  const id = new URL(request.url).searchParams.get("id");
  if (id && new URL(request.url).searchParams.get("col")) return ID.test(id) ? json(await collectionComplete(env, id)) : json({ ok: false, error: "membre inconnu" }, 400);
  if (id) return ID.test(id) ? json(await profil(env, request, me, id)) : json({ ok: false, error: "membre inconnu" }, 400);
  const [cl, suivis] = await Promise.all([classements(env, waitUntil), lireJ(env, "um:" + uid(me), [])]);
  return json({ ok: true, classements: cl.classements, suivis, moi: uid(me) });
}

export async function onRequestPost({ env, request }) {
  const me = await membre(request, env).catch(() => null);
  if (!me || !me.m) return json({ ok: false, error: "connexion requise" }, 401);
  if (!env.STATS) return json({ ok: false, error: "stockage indisponible" }, 503);
  const b = await request.json().catch(() => ({}));
  const id = String(b.suivre || "");
  if (!ID.test(id) || id === uid(me)) return json({ ok: false, error: "membre inconnu" }, 400);
  const k = "um:" + uid(me), l = await lireJ(env, k, []);
  const on = !l.includes(id);
  const nl = on ? [id, ...l].slice(0, 1000) : l.filter(x => x !== id);
  const abonnes = Math.max(0, (+(await env.STATS.get("mn:" + id)) || 0) + (on ? 1 : -1));
  await Promise.all([env.STATS.put(k, JSON.stringify(nl)), env.STATS.put("mn:" + id, String(abonnes))]);
  return json({ ok: true, on, abonnes });
}
