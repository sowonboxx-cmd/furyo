// QG > Premium & dons (Will, 25/10/2026) : tous les membres, qui est Premium, combien ils ont donné, jusqu'à quand.
// Les données vivent dans Notion (base Membres : « Premium jusqu'au », « Premium depuis », « Dons (€) », « Premium source »)
// et l'historique des paiements dans KV (« premium:paiements »).
//
//   GET  /api/admin/premium → { ok, membres:[…], paiements:[…] }
//   POST { action: "paiement", qui, montant, date?, source?, note? }  → enregistre un don PayPal (ou autre) :
//        calcule la durée (règles du 18/10), prolonge « Premium jusqu'au », ajoute au total, pose le badge donateur.
//   POST { action: "fin", id, fin, debut? }  → corrige la date de fin à la main (fin vide = plus Premium)
//   POST { action: "suppr", pid }            → retire une ligne de l'historique (ne touche pas au membre)
//   POST { action: "merci", id|qui }         → (r)envoie l'e-mail de remerciement + la fenêtre, d'après la fiche du membre
// À chaque don enregistré, le remerciement part tout seul (e-mail Brevo + fenêtre sur le site), sauf si « merci: false ».
import { json, isAdmin } from "../../../lib/admin.js";
import { text, num, date, queryAll } from "../../../lib/notion.js";
import { MEMBRES, numMembre, patch, jourParis } from "../../../lib/membres.js";
import { catalogue, idsBadges } from "../../../lib/badges.js";
import { oublierAcces } from "../../../lib/acces.js";
import { envoyerMerci, poserFenetre } from "../../../lib/merci.js";

const CLE = "premium:paiements";
const DEBUT_PAYANT = "2026-12-01"; // le Premium offert par un don démarre le 1er décembre (règle du 18/10/2026)
const ids0 = r => idsBadges(r).map(x => String(x).replace(/-/g, ""));
const nid = id => String(id || "").replace(/-/g, "");
const lireLog = async env => { try { return JSON.parse((await env.STATS.get(CLE)) || "[]"); } catch (e) { return []; } };

// Durée offerte par un don : < 25 € rien ; 25-49 € 1 an ; 50-99 € 2 ans ; 100 € 4 ans, puis +1 an par tranche de 25 €.
export const ansPour = m => m < 25 ? 0 : m < 50 ? 1 : m < 100 ? 2 : 4 + Math.floor((m - 100) / 25);
// Badge donateur selon le TOTAL donné : Kobun < 25 €, Bancho 25 €, Shogun 50 €, Oyabun 100 €.
const PALIERS = [["oyabun", 100], ["shogun", 50], ["bancho", 25], ["kobun", 0]];
const palier = total => (PALIERS.find(([, s]) => total >= s) || PALIERS[3])[0];
const plusJours = (iso, j) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + j); return d.toISOString().slice(0, 10); };
const plusAns = (iso, a) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCFullYear(d.getUTCFullYear() + a); return d.toISOString().slice(0, 10); };

function ligne(r, cat) {
  const p = r.properties || {}, ids = new Set(idsBadges(r));
  return {
    id: nid(r.id), num: numMembre(p), pseudo: text(p["Pseudo"]), slug: text(p["Identifiant"]), email: (p["Email"] && p["Email"].email) || "",
    photo: text(p["Photo"]), inscrit: r.created_time, fin: date(p["Premium jusqu'au"]), debut: date(p["Premium depuis"]),
    dons: num(p["Dons (€)"]) || 0, source: text(p["Premium source"]), notes: text(p["Notes"]),
    badges: cat.filter(b => ids.has(b.id)).map(b => b.n),
  };
}
async function tous(env) {
  const [rows, cat] = await Promise.all([queryAll(env.NOTION_TOKEN, { ...MEMBRES }), catalogue(env.NOTION_TOKEN, true)]);
  return { rows, cat };
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const { rows, cat } = await tous(env);
  const membres = rows.map(r => ligne(r, cat)).sort((a, b) => (a.num || 1e9) - (b.num || 1e9));
  return json({ ok: true, aujourdhui: jourParis(), debutPayant: DEBUT_PAYANT, membres, paiements: await lireLog(env) });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const b = await request.json().catch(() => ({}));
  let log = await lireLog(env);

  if (b.action === "suppr") {
    log = log.filter(x => x.id !== b.pid); await env.STATS.put(CLE, JSON.stringify(log));
    return json({ ok: true });
  }

  const { rows, cat } = await tous(env);
  // Retrouver le membre : n° (65), e-mail, pseudo ou identifiant Notion.
  const q = String(b.qui || b.id || "").trim().toLowerCase().replace(/^#/, "");
  const r = rows.find(x => nid(x.id) === nid(q)) || rows.find(x => String(numMembre(x.properties)) === q)
    || rows.find(x => ((x.properties["Email"] || {}).email || "").toLowerCase() === q) || rows.find(x => text(x.properties["Pseudo"]).toLowerCase() === q);
  if (!r) return json({ error: "membre introuvable (n°, e-mail ou pseudo)" }, 404);
  const m = ligne(r, cat), auj = jourParis();

  if (b.action === "fin") {
    const fin = /^\d{4}-\d{2}-\d{2}$/.test(b.fin || "") ? b.fin : null, debut = /^\d{4}-\d{2}-\d{2}$/.test(b.debut || "") ? b.debut : null;
    const props = { "Premium jusqu'au": { date: fin ? { start: fin } : null } };
    if (debut || b.debut === "") props["Premium depuis"] = { date: debut ? { start: debut } : null };
    const res = await patch(env.NOTION_TOKEN, r.id, props);
    if (!res.ok) return json({ error: "Notion a refusé : " + (await res.text()).slice(0, 200) }, 502);
    oublierAcces(m.id);
    return json({ ok: true });
  }

  if (b.action === "merci") {
    // Depuis la fiche : montant = total donné, durée = de « Premium depuis » à « Premium jusqu'au ».
    const ans = m.debut && m.fin ? Math.max(0, Math.round((new Date(m.fin + "T12:00:00Z") - new Date(m.debut + "T12:00:00Z")) / (365.25 * 864e5))) : 0;
    const donneur = cat.find(x => ids0(r).includes(x.id) && /donateur/i.test(x.n));
    const d = { email: m.email, pseudo: m.pseudo, num: m.num, slug: m.slug, montant: m.dons, total: m.dons, ans, debut: ans ? m.debut : "", fin: ans ? m.fin : "", badge: donneur ? donneur.n : "" };
    if (!(d.montant > 0) && !ans) return json({ error: "ce membre n'a ni don ni Premium payé" }, 400);
    await poserFenetre(env, m.id, d).catch(() => {});
    const mail = await envoyerMerci(env, d);
    for (const x of log) if (x.m === m.id && !x.mail) x.mail = mail.ok ? "ok" : mail.error;
    await env.STATS.put(CLE, JSON.stringify(log));
    return json({ ok: true, mail });
  }

  if (b.action !== "paiement") return json({ error: "action inconnue" }, 400);
  const montant = Math.round(Number(String(b.montant).replace(",", ".")) * 100) / 100;
  if (!(montant > 0)) return json({ error: "montant invalide" }, 400);
  const jour = /^\d{4}-\d{2}-\d{2}$/.test(b.date || "") ? b.date : auj;
  const source = ["Don PayPal", "Abonnement Stripe", "Offert"].includes(b.source) ? b.source : "Don PayPal";
  const ans = ansPour(montant);
  // Départ : le 1er décembre (ou le jour du don s'il est après), ou le lendemain de la fin actuelle si le membre est encore Premium.
  let debut = jour > DEBUT_PAYANT ? jour : DEBUT_PAYANT;
  if (m.fin && m.fin >= debut) debut = plusJours(m.fin, 1);
  const fin = ans ? plusJours(plusAns(debut, ans), -1) : m.fin;
  const total = Math.round((m.dons + montant) * 100) / 100;

  // Badge donateur : on garde un seul badge (le palier du total), les autres paliers sont retirés.
  const nomBadge = n => cat.find(x => x.n.toLowerCase().includes(n)); // « Donateur — Bancho »…
  const donneurs = PALIERS.map(([n]) => nomBadge(n)).filter(Boolean).map(x => x.id);
  const cible = nomBadge(palier(total));
  const ids = idsBadges(r).filter(id => !donneurs.includes(id)).concat(cible ? [cible.id] : []);

  const props = { "Dons (€)": { number: total }, "Badges": { relation: ids.map(id => ({ id })) } };
  if (ans) {
    props["Premium jusqu'au"] = { date: { start: fin } };
    if (!m.debut || !m.fin || m.fin < auj) props["Premium depuis"] = { date: { start: debut } };
    props["Premium source"] = { select: { name: source } };
  }
  const res = await patch(env.NOTION_TOKEN, r.id, props);
  if (!res.ok) return json({ error: "Notion a refusé : " + (await res.text()).slice(0, 200) }, 502);
  oublierAcces(m.id);

  // Remerciement automatique (Will, 25/10/2026) : fenêtre sur le site + e-mail.
  const d = { email: m.email, pseudo: m.pseudo, num: m.num, slug: m.slug, montant, total, ans, debut: ans ? debut : "", fin: ans ? fin : "", badge: cible ? cible.n : "" };
  let mail = { ok: false, error: "désactivé" };
  if (b.merci !== false) { await poserFenetre(env, m.id, d).catch(() => {}); mail = await envoyerMerci(env, d); }

  const entree = { mail: mail.ok ? "ok" : mail.error, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), jour, m: m.id, k: m.num, n: m.pseudo, e: m.email,
    montant, source, ans, debut: ans ? debut : "", fin: ans ? fin : "", badge: cible ? cible.n : "", note: String(b.note || "").slice(0, 200) };
  log.unshift(entree); await env.STATS.put(CLE, JSON.stringify(log.slice(0, 2000)));
  return json({ ok: true, paiement: entree, total, mail });
}
