// Publication Instagram automatique (app Meta « FuryoGang Publication », Will 23/11/2026).
// Jeton : secret Cloudflare META_IG_TOKEN (system-user, sans expiration), passe par graph.facebook.com.
// Une news de la veille avec la case « Instagram » cochée part sur @furyogang (post + story) dès qu'elle est en ligne :
// tout de suite avec « À la une » / « Brève », à l'heure prévue pour une news planifiée (tâche /api/cron/reseaux).
import { text, date, check, queryAll } from "./notion.js";

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
  if (!check(p["Instagram"])) return { ok: false, skip: "case Instagram non cochée" };
  if (date(p["Instagram posté"])) return { ok: true, deja: true, lien: (p["Instagram lien"] && p["Instagram lien"].url) || "" };
  if (text(p["Statut"]) !== "Publié sur le site") return { ok: false, skip: "pas encore en ligne" };
  const cle = "ig:lock:" + id;
  if (env.STATS) { if (await env.STATS.get(cle)) return { ok: false, skip: "envoi déjà en cours" }; await env.STATS.put(cle, "1", { expirationTtl: 900 }); }
  const c = carteDe(p);
  const imgs = (Array.isArray(c.igPub) ? c.igPub : [c.igPub || c.ig || (p["Image"] && p["Image"].url) || ""]).filter(Boolean);
  const cap = (text(p["Légende Instagram"]) || text(p["Proposition"])).slice(0, 2200);
  const maj = props => fetch(`https://api.notion.com/v1/pages/${id}`, { method: "PATCH", headers: NH(env), body: JSON.stringify({ properties: props }) });
  try {
    const post = await igPost(env, imgs, cap);
    let story = null; try { story = await igStory(env, c.igStory || imgs[0]); } catch (e) { story = { err: String(e.message || e) }; }
    await maj({ "Instagram posté": { date: { start: new Date().toISOString() } }, "Instagram lien": { url: post.lien || null },
      "Instagram erreur": { rich_text: story && story.err ? [{ type: "text", text: { content: ("Post OK, story refusée : " + story.err).slice(0, 1900) } }] : [] } });
    return { ok: true, lien: post.lien, story: !(story && story.err), storyErr: story && story.err };
  } catch (e) {
    const err = String((e && e.message) || e).slice(0, 1900);
    await maj({ "Instagram erreur": { rich_text: [{ type: "text", text: { content: err } }] } }).catch(() => {});
    if (env.STATS) await env.STATS.delete(cle).catch(() => {});
    return { ok: false, err };
  }
}

// Tâche planifiée : met en ligne les news planifiées dont l'heure est passée, puis envoie sur Instagram celles qui doivent l'être.
export async function tourneeReseaux(env) {
  const maintenant = new Date().toISOString();
  const rows = await queryAll(env.NOTION_TOKEN, { ...VEILLE, body: { filter: { and: [
    { property: "Instagram", checkbox: { equals: true } }, { property: "Instagram posté", date: { is_empty: true } },
    { or: [{ property: "Statut", select: { equals: "Publié sur le site" } },
      { and: [{ property: "Statut", select: { equals: "À valider" } }, { property: "Planifiée le", date: { on_or_before: maintenant } }] }] }] } } }).catch(() => []);
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
  return res;
}
