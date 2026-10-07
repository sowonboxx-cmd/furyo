// Base Notion « FuryoGang — Badges » : la liste des badges (nom, description, couleur, icône, règle, ordre).
// Will crée ou renomme les badges dans Notion ; les admins les attribuent sur le site (page publique du membre).
// Règle : « Manuel » = attribué à la main ; « Administrateurs » = attribué à la main ET donne l'accès admin
// (les e-mails admin l'ont d'office) ; « Accès complet » = attribué à la main, débloque tout le site gratuitement
// (statut « VIP », Will 07/10/2026) ; « 100 premiers inscrits » = automatique selon le n° de membre.
import { text, num, check, rel, queryAll } from "./notion.js";

export const BADGES = { dataSource: "f494821f-3436-440d-bf28-978cfaab6067", database: "bf28540ffa2f407c9c6ddc24fc34f531" };
const COULEURS = { Bleu: "#4C9BFF", Or: "#F2B33D", Orange: "#E0955F", Rose: "#F08AC0", Rouge: "#E54839", Vert: "#7BC67E", Violet: "#B38CFF", Gris: "#98989D" };
const ICONES = { Bouclier: "bouclier", "Étoile": "etoile", "Cœur": "coeur", Crayon: "crayon", Livre: "livre", Couronne: "couronne", Flamme: "flamme" };
const REGLES = { "Administrateurs": "admin", "100 premiers inscrits": "cent", "Manuel": "manuel", "Accès complet": "vip" };
const nid = id => String(id || "").replace(/-/g, "");

// Catalogue gardé une minute en mémoire (évite de relire Notion à chaque fiche).
let memo = null, memoT = 0;
export async function catalogue(token, frais = false) {
  if (!frais && memo && Date.now() - memoT < 60e3) return memo;
  const rows = await queryAll(token, { ...BADGES });
  memo = rows.filter(r => !check(r.properties["Masqué"]) && text(r.properties["Nom"])).map(r => {
    const p = r.properties;
    return { id: nid(r.id), n: text(p["Nom"]), d: text(p["Description"]), c: COULEURS[text(p["Couleur"])] || COULEURS.Gris,
      i: ICONES[text(p["Icône"])] || "etoile", r: REGLES[text(p["Règle"])] || "manuel", o: num(p["Ordre"]) ?? 99 };
  }).sort((a, b) => a.o - b.o || a.n.localeCompare(b.n, "fr"));
  memoT = Date.now();
  return memo;
}

// Badges obtenus par un membre : les automatiques + ceux reliés dans Notion.
export function obtenus(cat, { ids = [], num: k = null, adminEmail = false }) {
  const s = new Set(ids.map(nid));
  // « fixe » : obtenu automatiquement, on ne peut pas le retirer à la main.
  return cat.filter(b => b.r === "cent" ? !!(k && k <= 100) : b.r === "admin" ? (adminEmail || s.has(b.id)) : s.has(b.id))
    .map(b => ({ ...b, fixe: b.r === "cent" || (b.r === "admin" && adminEmail && !s.has(b.id)) }));
}
// Le membre a-t-il un badge qui donne l'accès admin ?
export const badgeAdmin = (cat, ids) => { const s = new Set((ids || []).map(nid)); return cat.some(b => b.r === "admin" && s.has(b.id)); };
// Accès complet (VIP) : badge « Accès complet » ou badge admin.
export const badgeVip = (cat, ids) => { const s = new Set((ids || []).map(nid)); return cat.some(b => (b.r === "vip" || b.r === "admin") && s.has(b.id)); };
export const idsBadges = page => rel(page.properties?.["Badges"]);
