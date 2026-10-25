// Accès complet (« VIP », nom provisoire, Will 07/10/2026) : ces membres ont tout le site gratuitement,
// sans abonnement : pas de limite dans Ma collection, newsletters, et toute fonctionnalité payante à venir.
// Qui l'a : les admins (e-mail ou badge Administrateurs) et les membres avec un badge à la règle « Accès complet ».
// Pour donner / retirer l'accès : attribuer ou retirer le badge « VIP » sur la fiche du membre (back-office ou Notion).
// Toute nouvelle fonctionnalité payante doit tester acces(me, env).complet.
import { estAdminEmail } from "./auth.js";
import { lirePage, premiumActif } from "./membres.js";
import { catalogue, badgeVip, idsBadges } from "./badges.js";

// Lancement (Will, 17-18/10/2026) : tous les membres sont Premium gratuitement jusqu'au 30 novembre 2026, 23 h 59 (heure de Paris).
// À partir du 1er décembre, seuls les abonnés (et les badges VIP / admins) gardent l'accès complet.
export const PREMIUM_OFFERT_FIN = Date.parse("2026-12-01T00:00:00+01:00");
const memo = new Map(); // id membre → { v, t } (une minute, par isolat)
export function oublierAcces(id) { memo.delete(String(id || "").replace(/-/g, "")); }
export async function acces(me, env) {
  if (!me) return { admin: false, complet: false };
  if (await estAdminEmail(me.e, env)) return { admin: true, complet: true };
  const id = String(me.m || "").replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/.test(id)) return { admin: false, complet: false };
  if (Date.now() < PREMIUM_OFFERT_FIN) return { admin: false, complet: true, offert: true };
  const m = memo.get(id);
  if (m && Date.now() - m.t < 60e3) return { admin: false, complet: m.v };
  let v = false;
  try {
    const page = await lirePage(env.NOTION_TOKEN, id);
    if (page) v = premiumActif(page.properties) || badgeVip(await catalogue(env.NOTION_TOKEN), idsBadges(page));
  } catch (e) { if (m) v = m.v; }
  memo.set(id, { v, t: Date.now() });
  return { admin: false, complet: v };
}
