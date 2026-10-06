// Éléments ★ obligatoires d'une fiche série. Une fiche est « prête » quand tout est fait.
// Partagé par le back-office (/api/admin/series) et l'avancement public (/api/avancement), pour que les deux comptent pareil.
import { text, num, date, check, rel, list, queryAll } from "./notion.js";
import { statut, PUBLIC } from "./site.js";

export const BASES = {
  EDITIONS: { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" },
  TOMES: { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" },
  AUTEURS: { dataSource: "22b1c097-0ff0-496c-9540-26953780c522", database: "bbefc8a1431247788b2445de4265d36b" },
};
const nid = id => id.replace(/-/g, "");

// Prépare ce qu'il faut pour juger toutes les séries d'un coup (à partir des lignes Éditions, Tomes et Auteurs).
export function contexte(eRows, tRows, aRows) {
  // Un auteur compte comme fait s'il a au moins un compte, ou si « Pas de réseaux » est coché, ou si la recherche est datée.
  const auteurOk = {};
  for (const a of aRows) { const q = a.properties;
    auteurOk[nid(a.id)] = ["X (Twitter)", "Instagram", "TikTok", "Facebook", "YouTube", "Site officiel"].some(k => !!text(q[k])) || check(q["Pas de réseaux"]) || !!date(q["Réseaux vérifiés le"]); }
  const today = new Date().toISOString().slice(0, 10);
  const eds = {};
  for (const e of eRows) eds[nid(e.id)] = { pays: text(e.properties["Pays"]), serie: rel(e.properties["Série"])[0], prepub: /prépub/i.test(text(e.properties["Format"])) };
  // Séries sorties en France uniquement en prépublication numérique (aucun tome) : pas de tomes ni de couvertures FR à exiger.
  const frEds = {};
  for (const e of Object.values(eds)) if (e.pays === "France" && e.serie) (frEds[e.serie] = frEds[e.serie] || []).push(e.prepub);
  const prepubFR = new Set(Object.entries(frEds).filter(([, v]) => v.length && v.every(Boolean)).map(([k]) => k));
  // Tomes parus par série et par pays : numéros distincts, et ceux sans couverture.
  const parus = {};
  for (const t of tRows) {
    const q = t.properties, ed = eds[rel(q["Édition"])[0]]; if (!ed || !ed.serie) continue;
    const d = date(q["Date de sortie"]), n = num(q["N°"]); if (n == null) continue;
    const k = ed.serie + "|" + (ed.pays === "France" ? "FR" : "JP");
    const o = parus[k] = parus[k] || { n: new Set(), tous: new Set(), sansCouv: new Set() };
    // « tous » : tomes présents dans la base, sortis ou annoncés ; les couvertures ne sont exigées que pour les tomes sortis.
    o.tous.add(n);
    if (!d || d > today) continue;
    o.n.add(n); if (!text(q["Couverture"])) o.sansCouv.add(n);
  }
  return { auteurOk, eds, parus, prepubFR };
}

export async function chargerContexte(token) {
  const [e, t, a] = await Promise.all([queryAll(token, { ...BASES.EDITIONS }), queryAll(token, { ...BASES.TOMES }), queryAll(token, { ...BASES.AUTEURS })]);
  return { ctx: contexte(e, t, a), eRows: e, tRows: t, aRows: a };
}

// Tomes d'un pays. Total connu : tous les tomes doivent être dans la base. Série en cours sans total
// (ex. réédition dont on ne connaît pas la fin) : c'est bon si tous les tomes parus sont là, du 1 au dernier, sans trou.
function tomesOk(pays, o, total, statut) {
  if (total) return [`Tomes ${pays} ${Math.min(o.tous.size, total)}/${total}`, o.tous.size >= total];
  if (/cours/i.test(statut) && o.n.size) {
    const max = Math.max(...o.n);
    const complet = Array.from({ length: max }, (_, i) => i + 1).every(k => o.n.has(k));
    return [complet ? `Tomes ${pays} ${o.n.size} parus (en cours)` : `Tomes ${pays} : il manque des tomes parus avant le ${max}`, complet];
  }
  return [`Tomes ${pays} (total ?)`, false];
}

// Liste [libellé, fait ?] des éléments obligatoires, dans l'ordre où on les remplit.
export function obligatoires(p, id, ctx) {
  const vide = { n: new Set(), tous: new Set(), sansCouv: new Set() };
  const jp = ctx.parus[id + "|JP"] || vide, fr = ctx.parus[id + "|FR"] || vide;
  const tJP = num(p["Tomes JP"]), tFR = num(p["Tomes FR"]);
  const enFrance = /cours|termin|stopp/i.test(text(p["Statut France"]));
  const o = [
    ["Résumé", !!text(p["Résumé"])],
    ["Auteurs", !!(text(p["Scénariste"]) || text(p["Dessinateur"]))],
    ["Type", !!text(p["Type"])],
    ["Genres", list(p["Genre"]).length > 0],
    ["Année de début", !!num(p["Année Début"])],
    ["Magazine", !!text(p["Magazine"])],
    ["Statut Japon", !!text(p["Statut Japon"])],
    ["Extrait JP", !!text(p["Lecture essai (試し読み)"]) || check(p["Pas d'extrait JP"])],
    tomesOk("JP", jp, tJP, text(p["Statut Japon"])),
    [jp.sansCouv.size ? `Couvertures JP (${jp.sansCouv.size} manq.)` : "Couvertures JP", jp.n.size > 0 && jp.sansCouv.size === 0],
  ];
  // Les réseaux des auteurs ne sont plus obligatoires (introuvables pour la plupart) : voir reseaux() plus bas.
  o.push(["Légende Instagram", !!text(p["Légende Instagram"])], ["Légende TikTok", !!text(p["Légende TikTok"])], ["Légende X", !!text(p["Légende X"])]);
  // L'extrait FR n'est plus obligatoire (souvent introuvable) : voir extraitFR() plus bas.
  if (enFrance && !(ctx.prepubFR && ctx.prepubFR.has(id))) o.push(
    tomesOk("FR", fr, tFR, text(p["Statut France"])),
    [fr.sansCouv.size ? `Couvertures FR (${fr.sansCouv.size} manq.)` : "Couvertures FR", fr.n.size > 0 && fr.sansCouv.size === 0],
  );
  return o;
}

// Prête = tous les ★ faits et pas encore « En ligne · public ».
// Réseaux des auteurs (facultatif) : combien d'auteurs reliés ont leurs comptes trouvés (ou « Pas de réseaux » coché).
export function reseaux(p, ctx) { const aut = rel(p["Auteurs"]); return { ok: aut.filter(a => ctx.auteurOk[a]).length, tot: aut.length }; }

// Extrait FR (facultatif) : null si la série n'est pas sortie en France ; sinon fait = lien trouvé, ou « Pas d'extrait FR » coché.
export function extraitFR(p) {
  if (!/cours|termin|stopp/i.test(text(p["Statut France"]))) return null;
  const lien = !!text(p["Extrait FR"]), aucun = check(p["Pas d'extrait FR"]);
  return { ok: lien || aucun, lien, aucun };
}

export const estPrete = (p, id, ctx) => statut(p) !== PUBLIC && obligatoires(p, id, ctx).every(x => x[1]);
