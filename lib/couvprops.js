// Propositions « Couverture dévoilée » créées automatiquement (Will, 13/10/2026).
// Chaque tome à paraître qui a une couverture doit apparaître dans Validation (France comme Japon), pour pouvoir
// publier la news ou exporter le visuel avant la sortie, même quand la couverture a été ajoutée à la main ou par lot.
// Repère : la colonne « News couverture » du tome. Vide = pas encore proposé ; on crée la proposition puis on la passe
// à « À préparer ». Toutes les séries, en ligne ou non. Un tome déjà marqué n'est jamais reproposé (une proposition rejetée ne revient pas).
import { text, num, date, rel, queryAll } from "./notion.js";

const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const VEILLE_DB = "50ef27c3205646baa1be24f4a6fc25d3";
const nid = id => String(id || "").replace(/-/g, "");
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const dLong = d => d ? `${Number(d.slice(8, 10))}${d.slice(8, 10) === "01" ? "er" : ""} ${MOIS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : "";
const dCourt = d => d ? `${Number(d.slice(8, 10))}${d.slice(8, 10) === "01" ? "er" : ""} ${MOIS[Number(d.slice(5, 7)) - 1]}` : "";
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 1900) } }] : [] });
const MAX = 15; // par passage : chaque proposition coûte deux appels Notion
const NOTION = env => ({ Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" });

// existantes : lignes de la base Veille déjà chargées (pour ne pas doubler une proposition faite par la veille).
// Renvoie les pages Notion créées (même format que queryAll), à ajouter à la liste.
export async function proposerCouvertures(env, existantes) {
  const today = new Date().toLocaleDateString("sv", { timeZone: "Europe/Paris" });
  const tRows = await queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { and: [
    { property: "Date de sortie", date: { on_or_after: today } },
    { property: "Couverture", url: { is_not_empty: true } },
    { property: "News couverture", select: { is_empty: true } },
  ] }, sorts: [{ property: "Date de sortie", direction: "ascending" }] } });
  if (!tRows.length) return [];
  const [eRows, sRows] = await Promise.all([queryAll(env.NOTION_TOKEN, { ...EDITIONS }), queryAll(env.NOTION_TOKEN, { ...SERIES })]);
  const eds = Object.fromEntries(eRows.map(e => { const p = e.properties || {}; return [nid(e.id), { nom: text(p["Édition"]), pays: text(p["Pays"]), pub: text(p["Éditeur"]), serie: rel(p["Série"])[0] }]; }));
  const series = Object.fromEntries(sRows.map(s => { const p = s.properties || {}; return [nid(s.id), { titre: text(p["SERIES"]), fr: text(p["Titre FR"]), statut: text(p["Statut"]),
    auteurs: [...new Set([text(p["Scénariste"]), text(p["Dessinateur"])].filter(Boolean))].join(" et ") }]; }));
  // Propositions de couverture déjà présentes : « série|pays|n ».
  const deja = new Set();
  for (const r of existantes) { const p = r.properties || {}, prop = text(p["Proposition"]);
    // Seulement les vraies propositions de couverture (une news qui parle d'une « couverture alternative » ne compte pas).
    if (!/couverture/i.test(text(p["Catégorie"])) && !/^\s*couverture dévoilée/i.test(prop)) continue;
    const m = prop.match(/\bT\.?\s?0*(\d+)\b/i), pays = /japon/i.test(prop + text(p["Catégorie"])) ? "Japon" : "France";
    for (const s of rel(p["Série"])) deja.add(`${nid(s)}|${pays}|${m ? Number(m[1]) : 1}`); }
  const crees = [];
  for (const t of tRows) {
    if (crees.length >= MAX) break;
    const q = t.properties || {}, ed = eds[rel(q["Édition"])[0]];
    if (!ed || /^\[À SUPPRIMER\]/i.test(ed.nom) || /^\[À SUPPRIMER\]/i.test(text(q["Tome"]))) continue;
    const s = series[ed.serie]; if (!s || !s.titre) continue; // toutes les séries, même pas encore en ligne (Will, 13/10/2026)
    const n = num(q["N°"]) || 1, pays = ed.pays === "Japon" ? "Japon" : "France", d = date(q["Date de sortie"]), pub = (ed.pub || "").replace(/\s*\(.*$/, "");
    const marquer = () => fetch(`https://api.notion.com/v1/pages/${t.id}`, { method: "PATCH", headers: NOTION(env), body: JSON.stringify({ properties: { "News couverture": { select: { name: "À préparer" } } } }) });
    if (deja.has(`${ed.serie}|${pays}|${n}`)) { await marquer().catch(() => {}); continue; }
    const nom = pays === "France" ? (s.fr || s.titre) : s.titre, nn = String(n).padStart(2, "0");
    const ou = pays === "France" ? "en France" : "au Japon";
    const resume = `Voici la couverture du tome ${n} de ${nom}, en librairie ${ou} le ${dLong(d)}${pub ? ` chez ${pub}` : ""}.` + (s.auteurs ? ` La série est signée ${s.auteurs}.` : "");
    let accroche = `Couverture dévoilée : ${nom} T.${nn}, en librairie le ${dCourt(d)}.`;
    if (accroche.length > 90) accroche = `Couverture de ${nom} T.${nn}, le ${dCourt(d)}.`;
    if (accroche.length > 90) accroche = `${nom} T.${nn} : la couverture.`.slice(0, 90);
    const props = {
      "Proposition": { title: [{ type: "text", text: { content: `Couverture dévoilée : ${s.titre} T.${nn} (${pays})` } }] },
      "Type": { select: { name: "News" } },
      "Catégorie": { multi_select: [{ name: pays === "France" ? "Couverture française" : "Couverture japonaise" }] },
      "Série": { relation: [{ id: ed.serie }] },
      "Statut": { select: { name: "À valider" } },
      "Résumé site": rt(resume), "Accroche": rt(accroche),
      "Niveau source": { select: { name: "1 · Officielle avec lien" } },
      "Date de la news": { date: { start: today } }, "Semaine de veille": { date: { start: today } },
      ...(/^https?:\/\//.test(text(q["Source"])) ? { "Source officielle": { url: text(q["Source"]) } } : {}),
    };
    const r = await fetch("https://api.notion.com/v1/pages", { method: "POST", headers: NOTION(env), body: JSON.stringify({ parent: { database_id: VEILLE_DB }, properties: props }) });
    if (!r.ok) continue;
    crees.push(await r.json());
    deja.add(`${ed.serie}|${pays}|${n}`);
    await marquer().catch(() => {});
  }
  return crees;
}
