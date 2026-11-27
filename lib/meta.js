// Publication Instagram automatique (app Meta « FuryoGang Publication », Will 23/11/2026).
// Jeton : secret Cloudflare META_IG_TOKEN (system-user, sans expiration), passe par graph.facebook.com.
// Une news de la veille avec la case « Instagram » cochée part sur @furyogang (post + story) dès qu'elle est en ligne :
// tout de suite avec « À la une » / « Brève », à l'heure prévue pour une news planifiée (tâche /api/cron/reseaux).
import { text, date, check, queryAll } from "./notion.js";
import { xPost } from "./x.js";

export const IG_ID = "17841407727732400"; // @furyogang
const G = "https://graph.facebook.com/v24.0";
const VEILLE = { dataSource: "d748cac9-fdb0-4d44-87e8-cef34669f0b2", database: "50ef27c3205646baa1be24f4a6fc25d3" };
const SITE = "https://furyogang.com";
const NH = env => ({ Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" });
const pause = ms => new Promise(r => setTimeout(r, ms));
const abs = u => (/^\//.test(u || "") ? SITE + u : u || "");

async function gPost(env, chemin, params) {
  const body = new URLSearchParams({ ...params, access_token: env.META_IG_TOKEN });
  const r = await fetch(G + chemin, { method: "POST", body });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error((d.error && (d.error.error_user_msg || d.error.message)) || "Instagram a répondu " + r.status);
  return d;
}
async function gGet(env, chemin, fields) {
  const r = await fetch(`${G}${chemin}?fields=${fields}&access_token=${encodeURIComponent(env.META_IG_TOKEN)}`);
  return r.json().catch(() => ({}));
}
// Instagram prépare l'image avant de pouvoir la publier : on attend que le conteneur soit prêt (30 s max).
async function pret(env, id) {
  for (let i = 0; i < 15; i++) {
    const s = await gGet(env, "/" + id, "status_code");
    if (s.status_code === "FINISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error("Instagram n'a pas accepté l'image (" + s.status_code + ")");
    await pause(2000);
  }
}
async function publier(env, creation_id) {
  const p = await gPost(env, `/${IG_ID}/media_publish`, { creation_id });
  const d = await gGet(env, "/" + p.id, "permalink");
  return { id: p.id, lien: d.permalink || "" };
}

// Post (une image ou un carrousel de 2 à 20 images, en JPEG à une adresse publique) + légende.
export async function igPost(env, images, caption) {
  images = images.map(abs).filter(Boolean).slice(0, 20);
  if (!images.length) throw new Error("pas d'image pour Instagram");
  let id;
  if (images.length === 1) id = (await gPost(env, `/${IG_ID}/media`, { image_url: images[0], caption })).id;
  else {
    const kids = [];
    for (const u of images) kids.push((await gPost(env, `/${IG_ID}/media`, { image_url: u, is_carousel_item: "true" })).id);
    for (const k of kids) await pret(env, k);
    id = (await gPost(env, `/${IG_ID}/media`, { media_type: "CAROUSEL", children: kids.join(","), caption })).id;
  }
  await pret(env, id);
  return publier(env, id);
}
// Story sans lien (Will, 23/11/2026 : objectif notoriété, le lien ne vaut pas l'effort).
export async function igStory(env, image) {
  const id = (await gPost(env, `/${IG_ID}/media`, { media_type: "STORIES", image_url: abs(image) })).id;
  await pret(env, id);
  return publier(env, id);
}

function carteDe(p) { const t = (text(p["Carte"]) || "null").replace(/\\([{}\[\]])/g, "$1"); try { return JSON.parse(t) || {}; } catch (e) { return {}; } }

// Publie une news de la veille sur Instagram si elle doit l'être (case cochée, en ligne, pas encore postée).
// Verrou dans le KV STATS pour ne jamais poster deux fois (bouton + tâche planifiée en même temps).
export async function publierNewsIG(env, id) {
  id = String(id).replace(/-/g, "");
  if (!env.META_IG_TOKEN) return { ok: false, err: "jeton Instagram absent" };
  const pg = await (await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: NH(env) })).json().catch(() => null);
  const p = pg && pg.properties; if (!p) return { ok: false, err: "news introuvable" };
  const fairePost = check(p["Instagram"]), faireStory = check(p["Instagram story"]);
  if (!fairePost && !faireStory) return { ok: false, skip: "cases Instagram non cochées" };
  if (date(p["Instagram posté"])) return { ok: true, deja: true, lien: (p["Instagram lien"] && p["Instagram lien"].url) || "" };
  if (text(p["Statut"]) !== "Publié sur le site") return { ok: false, skip: "pas encore en ligne" };
  const cle = "ig:lock:" + id;
  // Verrou R2 (cohérent partout, Will 27/11/2026) : deux tournées lancées en même temps depuis deux serveurs ne postent
  // jamais la même news deux fois. Valable 15 min ; libéré en cas d'échec pour une nouvelle tentative.
  const R = env.COUV, rk = "ig-news/" + id + "/verrou";
  const prendre = async () => { try { return await R.put(rk, new Date().toISOString(), { onlyIf: new Headers({ "If-None-Match": "*" }) }); }
    catch (x) { return (await R.head(rk).catch(() => null)) ? null : await R.put(rk, new Date().toISOString()).catch(() => null); } };
  if (R) {
    let pris = await prendre();
    if (!pris) { const o = await R.get(rk).catch(() => null), t = o ? new Date(await o.text()).getTime() : 0;
      if (o && Date.now() - t > 15 * 6e4) { await R.delete(rk).catch(() => {}); pris = await prendre(); } }
    if (!pris) return { ok: false, skip: "envoi déjà en cours" };
  } else if (env.STATS) { if (await env.STATS.get(cle)) return { ok: false, skip: "envoi déjà en cours" }; await env.STATS.put(cle, "1", { expirationTtl: 900 }); }
  const c = carteDe(p);
  const imgs = (Array.isArray(c.igPub) ? c.igPub : [c.igPub || c.ig || (p["Image"] && p["Image"].url) || ""]).filter(Boolean);
  const cap = (text(p["Légende Instagram"]) || text(p["Proposition"])).slice(0, 2200);
  const maj = props => fetch(`https://api.notion.com/v1/pages/${id}`, { method: "PATCH", headers: NH(env), body: JSON.stringify({ properties: props }) });
  try {
    const post = fairePost ? await igPost(env, imgs, cap) : { lien: "" };
    let story = null;
    if (faireStory) { try { story = await igStory(env, c.igStory || imgs[0]); } catch (e) { story = { err: String(e.message || e) }; if (!fairePost) throw e; } }
    await maj({ "Instagram posté": { date: { start: new Date().toISOString() } }, "Instagram lien": { url: post.lien || null },
      "Instagram erreur": { rich_text: story && story.err ? [{ type: "text", text: { content: ("Post OK, story refusée : " + story.err).slice(0, 1900) } }] : [] } });
    return { ok: true, lien: post.lien, post: fairePost, story: !!(story && !story.err), storyErr: story && story.err };
  } catch (e) {
    const err = String((e && e.message) || e).slice(0, 1900);
    await maj({ "Instagram erreur": { rich_text: [{ type: "text", text: { content: err } }] } }).catch(() => {});
    if (R) await R.delete(rk).catch(() => {}); else if (env.STATS) await env.STATS.delete(cle).catch(() => {});
    return { ok: false, err };
  }
}

// Tâche planifiée : met en ligne les news planifiées dont l'heure est passée, puis envoie sur Instagram celles qui doivent l'être.
// Posts X automatiques sans aucun lien (Will, 25/11/2026) : un post avec lien coûte ~0,20 $ contre 0,015 $ sans.
// X transforme aussi « furyogang.com/… » en lien : on retire les lignes d'adresse et l'annonce « Plus d'infos sur le site ».
export function sansLien(t) {
  return String(t || "").split("\n").filter(l => !/^\s*(↗\s*)?(https?:\/\/|www\.|furyogang\.com)\S*\s*$/i.test(l) && !/plus d'infos sur le site/i.test(l))
    .map(l => l.replace(/\s*(↗\s*)?(https?:\/\/\S+|(www\.)?furyogang\.com\/\S*)/gi, "")).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
export async function tourneeReseaux(env) {
  const maintenant = new Date().toISOString();
  // Filtre Notion à deux niveaux au plus (Will, 24/11/2026) : un « et » dans un « ou » dans un « et » était refusé par Notion,
  // la requête échouait en silence et aucun post Instagram ne partait. Le tri « en ligne » / « planifiée et passée » se fait ici.
  const brut = await queryAll(env.NOTION_TOKEN, { ...VEILLE, body: { filter: { and: [
    { or: [{ property: "Instagram", checkbox: { equals: true } }, { property: "Instagram story", checkbox: { equals: true } }] }, { property: "Instagram posté", date: { is_empty: true } },
    { or: [{ property: "Statut", select: { equals: "Publié sur le site" } }, { property: "Planifiée le", date: { on_or_before: maintenant } }] }] } } }).catch(() => []);
  // Garde-fou : on n'envoie que les news mises en ligne depuis moins de 2 heures (pas de rattrapage en masse d'anciennes news).
  const limite = Date.now() - 2 * 36e5;
  const rows = brut.filter(r => { const p = r.properties, st = text(p["Statut"]);
    if (st === "Publié sur le site") { const pub = date(p["Publiée le"]) || date(p["Planifiée le"]); return !pub || new Date(pub).getTime() >= limite; }
    return st === "À valider"; });
  const res = [];
  for (const r of rows.slice(0, 3)) {
    const p = r.properties;
    if (text(p["Statut"]) !== "Publié sur le site") {
      const pl = date(p["Planifiée le"]);
      await fetch(`https://api.notion.com/v1/pages/${r.id}`, { method: "PATCH", headers: NH(env), body: JSON.stringify({ properties: {
        "Statut": { select: { name: "Publié sur le site" } }, ...(date(p["Publiée le"]) ? {} : { "Publiée le": { date: { start: pl || maintenant } } }) } }) });
    }
    res.push({ id: r.id, ...(await publierNewsIG(env, r.id)) });
  }
  // File d'attente hors news (sorties de tomes…), programmée depuis le calendrier : /api/admin/igq.
  if (env.STATS) {
    const l = await env.STATS.list({ prefix: "igq:" }).catch(() => ({ keys: [] }));
    for (const k of l.keys) {
      const it = await env.STATS.get(k.name, "json"); if (!it || it.fait || it.ignore || new Date(it.quand) > new Date()) continue;
      // Anti-doublon (Will, 27/11/2026 : un post est parti 4 fois). Le KV n'est pas cohérent d'un point de présence à l'autre
      // (jusqu'à ~60 s de retard), et la tournée est lancée par plusieurs appelants à la fois (GitHub Actions + visiteurs du site).
      // R2, lui, est cohérent partout : chaque programmation (id + date de création) se réserve par un verrou R2 créé
      // « seulement s'il n'existe pas », et chaque étape envoyée (X, post, story) y est notée : rien ne repart deux fois,
      // même après une erreur ou une nouvelle tentative. Une annulation y laisse une marque que la tournée respecte.
      const R = env.COUV, base = "igq/" + String(it.id).replace(/[^0-9a-zA-Z_-]/g, "") + "/";
      const lot = base + String(it.cree || it.quand).replace(/[^0-9TZ]/g, "") + "/";
      let etat = {};
      if (R) {
        const an = await R.get(base + "annule").catch(() => null);
        if (an && new Date(await an.text()) >= new Date(it.cree || 0)) continue;
        // Création « seulement si absent » (null si le verrou existe déjà). Si R2 refusait la condition, repli : vérifier puis écrire.
        let pris; try { pris = await R.put(lot + "verrou", new Date().toISOString(), { onlyIf: new Headers({ "If-None-Match": "*" }) }); }
        catch (x) { pris = (await R.head(lot + "verrou").catch(() => null)) ? null : await R.put(lot + "verrou", new Date().toISOString()).catch(() => null); }
        if (!pris) continue;
        const e = await R.get(lot + "etat").catch(() => null); if (e) { try { etat = JSON.parse(await e.text()); } catch (x) {} }
        if (etat.fait) { it.fait = etat.fait; await env.STATS.put(k.name, JSON.stringify(it), { expirationTtl: 60 * 864e2 }); continue; }
      } else { if (it.encours) continue; it.encours = true; await env.STATS.put(k.name, JSON.stringify(it), { expirationTtl: 60 * 864e2 }); }
      const noter = () => R ? R.put(lot + "etat", JSON.stringify(etat)).catch(() => {}) : Promise.resolve();
      const r = { id: it.id, type: it.type };
      try {
        // X (carrousels hebdo) : envoyé une seule fois, même si Instagram échoue ensuite.
        if (it.x && !it.xLien && !etat.x) { try { const xr = await xPost(env, sansLien(it.x.texte), it.x.images); it.xLien = etat.x = xr.lien || "ok"; await noter(); delete it.xErr; } catch (e) { it.xErr = String(e.message || e).slice(0, 300); if (!(it.post && it.post.length) && !it.story) throw e; } }
        if (it.post && it.post.length && !etat.post) { etat.postEnvoi = new Date().toISOString(); await noter(); const p = await igPost(env, it.post, it.legende || it.titre || ""); it.lien = etat.post = p.lien || "ok"; await noter(); }
        if (it.story && !etat.story) { try { etat.storyEnvoi = new Date().toISOString(); await noter(); await igStory(env, it.story); it.storyOk = etat.story = true; await noter(); } catch (e) { it.err = "story refusée : " + String(e.message || e); if (!(it.post && it.post.length)) throw e; } }
        it.fait = etat.fait = new Date().toISOString(); await noter(); r.ok = true;
        // Sortie de tome : coche « Sortie postée » dans la base Tomes (elle quitte les Sorties du jour).
        if (it.type === "sortie" && /^[0-9a-f]{32}$/.test(it.id)) { await fetch(`https://api.notion.com/v1/pages/${it.id}`, { method: "PATCH", headers: NH(env), body: JSON.stringify({ properties: { "Sortie postée": { checkbox: true } } }) }).catch(() => {});
          try { await caches.default.delete(new Request("https://furyogang.com/__cache/admin-sorties-passe-v2")); } catch (e) {} }
        // Fiche série (Will, 25/11/2026) : coche « Promo » avec la date du jour dans la base Séries (Mangas Database : « Postée »).
        if (it.type === "fiche" && /^fiche-[0-9a-f]{32}$/.test(it.id)) await fetch(`https://api.notion.com/v1/pages/${it.id.slice(6)}`, { method: "PATCH", headers: NH(env), body: JSON.stringify({ properties: { "Promo": { checkbox: true }, "Promo faite le": { date: { start: new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(new Date()) } }, "Statut": { select: { name: "En ligne · public" } } } }) }).then(() => {
          // Fiche publiée sur les réseaux = « Promo réseaux » + « Sur le site » (Will, 26/11/2026) ; la Manga Database se met à jour tout de suite.
          try { const c = caches.default, o = "https://furyogang.com"; return Promise.all(["/api/series?v=6", "/api/series?v=6&admin=1", "/__cache/admin-series-v2", "/api/avancement", "/api/serie-index"].map(k => c.delete(new Request(o + k)))); } catch (e) {} }).catch(() => {});
      } catch (e) {
        it.err = String((e && e.message) || e).slice(0, 500); it.essais = (it.essais || 0) + 1; if (it.essais >= 3) it.fait = etat.fait = "échec"; r.ok = false; r.err = it.err;
        // Post Instagram peut-être parti malgré l'erreur (réponse perdue) : on ne le renvoie jamais automatiquement.
        if (etat.postEnvoi && !etat.post) { etat.post = "incertain"; it.err += " · post peut-être parti : vérifier Instagram"; }
        if (etat.storyEnvoi && !etat.story) etat.story = "incertain";
        await noter();
        // Le verrou est libéré pour une nouvelle tentative : les étapes déjà notées ne repartiront pas.
        if (R && !etat.fait) await R.delete(lot + "verrou").catch(() => {});
      }
      delete it.encours; await env.STATS.put(k.name, JSON.stringify(it), { expirationTtl: 60 * 864e2 });
      res.push(r); if (res.length >= 4) break;
    }
  }
  return res;
}
