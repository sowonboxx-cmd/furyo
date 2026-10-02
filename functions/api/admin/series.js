// GET /api/admin/series : toutes les séries de la base, avec leur avancement et la liste des éléments obligatoires (back-office, connecté seulement).
// Une fiche n'est jamais déclarée « complète » toute seule : la liste dit ce qui est fait, Will valide.
import { text, num, date, check, rel, list, queryAll, slugify } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";
import { estVisible } from "../../../lib/site.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const nid = id => id.replace(/-/g, "");

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const [rows, eRows, tRows] = await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...SERIES }),
    queryAll(env.NOTION_TOKEN, { ...EDITIONS }),
    queryAll(env.NOTION_TOKEN, { ...TOMES }),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  // Tomes parus par série et par pays : numéros distincts, et ceux sans couverture.
  const eds = {};
  for (const e of eRows) eds[nid(e.id)] = { pays: text(e.properties["Pays"]), serie: rel(e.properties["Série"])[0] };
  const parus = {};
  for (const t of tRows) {
    const q = t.properties, ed = eds[rel(q["Édition"])[0]]; if (!ed || !ed.serie) continue;
    const d = date(q["Date de sortie"]), n = num(q["N°"]); if (!d || d > today || n == null) continue;
    const k = ed.serie + "|" + (ed.pays === "France" ? "FR" : "JP");
    const o = parus[k] = parus[k] || { n: new Set(), sansCouv: new Set() };
    o.n.add(n); if (!text(q["Couverture"])) o.sansCouv.add(n);
  }
  const items = rows.map(r => {
    const p = r.properties || {}, t = text(p["SERIES"]), id = nid(r.id);
    const stFR = text(p["Statut France"]), enFrance = /cours|termin|stopp/i.test(stFR);
    const jp = parus[id + "|JP"] || { n: new Set(), sansCouv: new Set() }, fr = parus[id + "|FR"] || { n: new Set(), sansCouv: new Set() };
    const tJP = num(p["Tomes JP"]), tFR = num(p["Tomes FR"]);
    // Les éléments obligatoires d'une fiche, dans l'ordre où on les remplit.
    const oblig = [
      ["Résumé", !!text(p["Résumé"])],
      ["Auteurs", !!(text(p["Scénariste"]) || text(p["Dessinateur"]))],
      ["Type", !!text(p["Type"])],
      ["Genres", list(p["Genre"]).length > 0],
      ["Année de début", !!num(p["Année Début"])],
      ["Magazine", !!text(p["Magazine"])],
      ["Statut Japon", !!text(p["Statut Japon"])],
      ["Extrait JP", !!text(p["Lecture essai (試し読み)"]) || check(p["Pas d'extrait JP"])],
      [tJP ? `Tomes JP ${jp.n.size}/${tJP}` : "Tomes JP (nombre total à remplir)", !!tJP && jp.n.size >= tJP],
      [`Couvertures JP${jp.sansCouv.size ? " (" + jp.sansCouv.size + (jp.sansCouv.size > 1 ? " manquantes)" : " manquante)") : ""}`, jp.n.size > 0 && jp.sansCouv.size === 0],
    ];
    // Légendes des réseaux pour le post « Nouvelle fiche » (X facultatif tant que le compte n'est pas lancé).
    oblig.push(["Légende Instagram", !!text(p["Légende Instagram"])], ["Légende TikTok", !!text(p["Légende TikTok"])]);
    if (enFrance) oblig.push(
      ["Extrait FR", !!text(p["Extrait FR"]) || check(p["Pas d'extrait FR"])],
      [tFR ? `Tomes FR ${fr.n.size}/${tFR}` : "Tomes FR (nombre total à remplir)", !!tFR && fr.n.size >= tFR],
      [`Couvertures FR${fr.sansCouv.size ? " (" + fr.sansCouv.size + (fr.sansCouv.size > 1 ? " manquantes)" : " manquante)") : ""}`, fr.n.size > 0 && fr.sansCouv.size === 0],
    );
    return {
      id, notion: r.url, t, fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugify(t),
      etat: text(p["Avancement"]) || "À faire", publier: check(p["Publier"]), visible: estVisible(p), date: date(p["Date de publication"]),
      lot: text(p["Lot"]), trouver: text(p["À trouver"]), coeur: check(p["Prochaine à traiter"]), editions: rel(p["Éditions"]).length,
      oblig: oblig.map(([k, ok]) => ({ k, ok })), manque: oblig.filter(o => !o[1]).map(o => o[0]),
      cover: text(p["Couverture T1"]), type: text(p["Type"]), y1: num(p["Année Début"]), stJP: text(p["Statut Japon"]), stFR,
    };
  }).filter(s => s.t).sort((a, b) => a.t.localeCompare(b.t, "fr"));
  return json({ items });
}
