// Base Notion « FuryoGang — Membres » : un membre est créé à sa première connexion Google.
// Badges : relation vers la base « Badges » (voir lib/badges.js), modifiables dans Notion ou sur le site par un admin.
import { text, num, check, date, queryAll, slugify } from "./notion.js";
import { obtenus, idsBadges } from "./badges.js";

export const MEMBRES = { dataSource: "4671631b-8909-436d-ab87-d9c8d1feea3b", database: "15d2f7193ae64d01a09ae93f471196e6" };
const H = token => ({ Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" });
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 200) } }] : [] });
const nid = id => String(id || "").replace(/-/g, "");
export const numero = p => (p && p.unique_id ? p.unique_id.number : null);

// Identifiant public (furyogang.com/membres/<identifiant>) : tiré du pseudo, unique. Mots réservés interdits.
const RESERVES = new Set(["fiche", "admin", "profil", "membres", "api", "moi"]);
export const identifiant = pseudo => slugify(pseudo).slice(0, 30);
export async function prisPar(token, slug) {
  const rows = await queryAll(token, { ...MEMBRES, body: { filter: { property: "Identifiant", rich_text: { equals: slug } } } });
  return rows[0] ? nid(rows[0].id) : null;
}
export async function identifiantLibre(token, base, selfId) {
  let s = identifiant(base) || "membre", i = 1, cand = s;
  while (RESERVES.has(cand) || ((await prisPar(token, cand)) || selfId) !== selfId) { i++; cand = `${s}-${i}`; }
  return cand;
}
export const estReserve = s => RESERVES.has(s);

// Crée le membre s'il n'existe pas (identifiant Google), sinon met à jour sa dernière connexion et sa photo.
export async function enregistrer(token, u) {
  const now = new Date().toISOString();
  const rows = await queryAll(token, { ...MEMBRES, body: { filter: { property: "Google ID", rich_text: { equals: u.g } } } });
  if (rows[0]) {
    const p = rows[0].properties;
    const props = { "Dernière connexion": { date: { start: now } } };
    // Photo choisie par le membre (envoyée sur le site) : la connexion Google ne la remplace plus (Will, 07/10/2026).
    const perso = /^https:\/\/furyogang\.com\/av\//.test(text(p["Photo"]));
    if (!perso && u.p && text(p["Photo"]) !== u.p) props["Photo"] = { url: u.p };
    let slug = text(p["Identifiant"]);
    if (!slug) { slug = await identifiantLibre(token, text(p["Pseudo"]) || u.n, nid(rows[0].id)); props["Identifiant"] = rt(slug); }
    await fetch(`https://api.notion.com/v1/pages/${rows[0].id}`, { method: "PATCH", headers: H(token), body: JSON.stringify({ properties: props }) });
    return { id: nid(rows[0].id), k: numero(p["N°"]), n: text(p["Pseudo"]) || u.n, s: slug, b: idsBadges(rows[0]), p: perso ? text(p["Photo"]) : "" };
  }
  const slug = await identifiantLibre(token, u.n, "nouveau");
  const r = await fetch("https://api.notion.com/v1/pages", { method: "POST", headers: H(token), body: JSON.stringify({
    parent: { database_id: MEMBRES.database },
    properties: {
      "Pseudo": { title: [{ type: "text", text: { content: (u.n || "Membre").slice(0, 80) } }] },
      "Google ID": rt(u.g), "Identifiant": rt(slug), "Email": { email: u.e || null }, "Photo": { url: u.p || null },
      "Dernière connexion": { date: { start: now } },
    } }) });
  if (!r.ok) throw new Error("création membre " + r.status);
  const j = await r.json();
  return { id: nid(j.id), k: numero(j.properties && j.properties["N°"]), n: u.n, s: slug, b: [] };
}

export async function lirePage(token, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: H(token) });
  return r.ok ? r.json() : null;
}

// Fiche d'un membre telle qu'on peut la montrer (sans e-mail). cat = catalogue des badges.
export function fiche(page, { admin = false, prive = false, cat = [] } = {}) {
  const p = page.properties || {}, k = numero(p["N°"]);
  const badges = obtenus(cat, { ids: idsBadges(page), num: k, adminEmail: admin });
  const pub = check(p["Réseaux publics"]);
  const res = { instagram: text(p["Instagram"]), x: text(p["X"]), discord: text(p["Discord"]), youtube: text(p["YouTube"]), tiktok: text(p["TikTok"]) };
  return {
    id: nid(page.id), num: k, pseudo: text(p["Pseudo"]), slug: text(p["Identifiant"]), photo: text(p["Photo"]), inscrit: page.created_time,
    badges, points: num(p["Points"]) || 0,
    ...(prive ? { reseaux: res, public: pub } : pub ? { reseaux: res } : {}),
  };
}
export const patch = (token, id, properties) => fetch(`https://api.notion.com/v1/pages/${id}`, { method: "PATCH", headers: H(token), body: JSON.stringify({ properties }) });
export { rt };
