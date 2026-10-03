// GET /api/admin/series : toutes les séries de la base, avec leur avancement et la liste des éléments obligatoires (back-office, connecté seulement).
// Une fiche n'est jamais déclarée « complète » toute seule : la liste dit ce qui est fait, Will valide.
import { text, num, date, check, rel, list, queryAll, slugify } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";
import { estVisible } from "../../../lib/site.js";
import { handle, mentionList, syncMentions } from "../../../lib/mentions.js";
import { BASES, contexte, obligatoires } from "../../../lib/oblig.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const { EDITIONS, TOMES, AUTEURS } = BASES;
const EDITEURS = { dataSource: "16e967fc-8e7b-4b7c-ab98-6a25cbdcd75a", database: "c9dc1efdf33d4ad09711d20d55860d52" };
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 1900) } }] : [] });
const nid = id => id.replace(/-/g, "");

export async function onRequestGet({ request, env, waitUntil }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const [rows, eRows, tRows, aRows, pRows] = await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...SERIES }),
    queryAll(env.NOTION_TOKEN, { ...EDITIONS }),
    queryAll(env.NOTION_TOKEN, { ...TOMES }),
    queryAll(env.NOTION_TOKEN, { ...AUTEURS }),
    queryAll(env.NOTION_TOKEN, { ...EDITEURS }).catch(() => []),
  ]);
  // Comptes officiels (X, Instagram, TikTok) des auteurs et des éditeurs / magazines, pour les @ des légendes.
  const acc = q => ({ x: handle(text(q["X (Twitter)"])), ig: handle(text(q["Instagram"])), tt: handle(text(q["TikTok"])) });
  const comptes = {};
  for (const a of aRows) comptes[nid(a.id)] = acc(a.properties);
  for (const e of pRows) comptes[nid(e.id)] = acc(e.properties);
  const aMettreAJour = [];
  const ctx = contexte(eRows, tRows, aRows), eds = ctx.eds;
  // Couverture d'illustration : le plus petit tome qui en a une, France avant Japon (parus ou à paraître).
  const best = {};
  for (const t of tRows) {
    const q = t.properties, ed = eds[rel(q["Édition"])[0]], c = text(q["Couverture"]); if (!ed || !ed.serie || !c) continue;
    const sc = (num(q["N°"]) ?? 999) * 2 + (ed.pays === "France" ? 0 : 1);
    if (!best[ed.serie] || sc < best[ed.serie].sc) best[ed.serie] = { sc, c };
  }
  const items = rows.map(r => {
    const p = r.properties || {}, t = text(p["SERIES"]), id = nid(r.id);
    const stFR = text(p["Statut France"]);
    const oblig = obligatoires(p, id, ctx);
    const aut = rel(p["Auteurs"]);
    // Légendes : la ligne de @ suit toujours les comptes actuels des auteurs puis des éditeurs.
    // Si un compte a été ajouté ou changé depuis, la légende est corrigée ici et réenregistrée dans Notion.
    const cs = [...aut, ...rel(p["Éditeurs (fiches)"])].map(k => comptes[k]).filter(Boolean);
    const leg = { ig: text(p["Légende Instagram"]), tt: text(p["Légende TikTok"]), x: text(p["Légende X"]) };
    const NOMS = { ig: "Légende Instagram", tt: "Légende TikTok", x: "Légende X" }, maj = {};
    for (const k of ["ig", "tt", "x"]) { const n = syncMentions(leg[k], k, mentionList(cs, k)); if (n !== leg[k]) { leg[k] = n; maj[NOMS[k]] = rt(n); } }
    if (Object.keys(maj).length) aMettreAJour.push([r.id, maj]);
    return {
      id, notion: r.url, t, fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugify(t),
      etat: text(p["Avancement"]) || "À faire", publier: check(p["Publier"]), visible: estVisible(p), date: date(p["Date de publication"]),
      leg,
      lot: text(p["Lot"]), trouver: text(p["À trouver"]), coeur: check(p["Prochaine à traiter"]), editions: rel(p["Éditions"]).length,
      oblig: oblig.map(([k, ok]) => ({ k, ok })), manque: oblig.filter(o => !o[1]).map(o => o[0]),
      cover: best[id]?.c || text(p["Couverture T1"]), type: text(p["Type"]), y1: num(p["Année Début"]), stJP: text(p["Statut Japon"]), stFR,
    };
  }).filter(s => s.t).sort((a, b) => a.t.localeCompare(b.t, "fr"));
  if (aMettreAJour.length) {
    const save = Promise.all(aMettreAJour.map(([id, properties]) => fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH", headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "content-type": "application/json" },
      body: JSON.stringify({ properties }) }).catch(() => null)));
    waitUntil ? waitUntil(save) : await save;
  }
  return json({ items });
}
