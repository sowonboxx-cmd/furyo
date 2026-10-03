// Éléments ★ obligatoires d'une fiche série. Une fiche est « prête » quand tout est fait.
// Partagé par le back-office (/api/admin/series) et l'avancement public (/api/avancement), pour que les deux comptent pareil.
import { text, num, date, check, rel, list, queryAll } from "./notion.js";

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
  for (const e of eRows) eds[nid(e.id)] = { pays: text(e.properties["Pays"]), serie: rel(e.properties["Série"])[0] };
  // Tomes parus par série et par pays : numéros distincts, et ceux sans couverture.
  const parus = {};
  for (const t of tRows) {
    const q = t.properties, ed = eds[rel(q["Édition"])[0]]; if (!ed || !ed.serie) continue;
    const d = date(q["Date de sortie"]), n = num(q["N°"]); if (!d || d > today || n == null) continue;
    const k = ed.serie + "|" + (ed.pays === "France" ? "FR" : "JP");
    const o = parus[k] = parus[k] || { n: new Set(), sansCouv: new Set() };
    o.n.add(n); if (!text(q["Couverture"])) o.sansCouv.add(n);
  }
  return { auteurOk, eds, parus };
}

export async function chargerContexte(token) {
  const [e, t, a] = await Promise.all([queryAll(token, { ...BASES.EDITIONS }), queryAll(token, { ...BASES.TOMES }), queryAll(token, { ...BASES.AUTEURS })]);
  return { ctx: contexte(e, t, a), eRows: e, tRows: t, aRows: a };
}

// Liste [libellé, fait ?] des éléments obligatoires, dans l'ordre où on les remplit.
export function obligatoires(p, id, ctx) {
  const vide = { n: new Set(), sansCouv: new Set() };
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
    [tJP ? `Tomes JP ${jp.n.size}/${tJP}` : "Tomes JP (total ?)", !!tJP && jp.n.size >= tJP],
    [jp.sansCouv.size ? `Couvertures JP (${jp.sansCouv.size} manq.)` : "Couvertures JP", jp.n.size > 0 && jp.sansCouv.size === 0],
  ];
  const aut = rel(p["Auteurs"]);
  o.push([aut.length ? `SNS des auteurs ${aut.filter(a => ctx.auteurOk[a]).length}/${aut.length}` : "SNS des auteurs (aucun relié)", aut.length > 0 && aut.every(a => ctx.auteurOk[a])]);
  o.push(["Légende Instagram", !!text(p["Légende Instagram"])], ["Légende TikTok", !!text(p["Légende TikTok"])], ["Légende X", !!text(p["Légende X"])]);
  if (enFrance) o.push(
    ["Extrait FR", !!text(p["Extrait FR"]) || check(p["Pas d'extrait FR"])],
    [tFR ? `Tomes FR ${fr.n.size}/${tFR}` : "Tomes FR (total ?)", !!tFR && fr.n.size >= tFR],
    [fr.sansCouv.size ? `Couvertures FR (${fr.sansCouv.size} manq.)` : "Couvertures FR", fr.n.size > 0 && fr.sansCouv.size === 0],
  );
  return o;
}

// Prête = tous les ★ faits et pas encore cochée « Publier ».
export const estPrete = (p, id, ctx) => !check(p["Publier"]) && obligatoires(p, id, ctx).every(x => x[1]);
