// GET /api/admin/series : toutes les séries de la base, avec leur avancement et ce qui manque (back-office, connecté seulement).
import { text, num, date, check, rel, list, queryAll, slugify } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";
import { estVisible } from "../../../lib/site.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const rows = await queryAll(env.NOTION_TOKEN, { ...SERIES });
  const items = rows.map(r => {
    const p = r.properties || {}, t = text(p["SERIES"]);
    const fr = text(p["Statut France"]), editions = rel(p["Éditions"]).length;
    const manque = [];
    if (!text(p["Résumé"])) manque.push("résumé");
    if (!text(p["Scénariste"]) && !text(p["Dessinateur"])) manque.push("auteurs");
    if (!text(p["Type"])) manque.push("type");
    if (!list(p["Genre"]).length) manque.push("genres");
    if (!num(p["Année Début"])) manque.push("année");
    if (!text(p["Magazine"])) manque.push("magazine");
    if (!text(p["Lecture essai (試し読み)"])) manque.push("extrait JP");
    if (/cours|termin|stopp/i.test(fr) && !text(p["Extrait FR"])) manque.push("extrait FR");
    if (!editions) manque.push("tomes");
    return {
      id: r.id.replace(/-/g, ""), notion: r.url, t, fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugify(t),
      etat: text(p["Avancement"]) || "À faire", publier: check(p["Publier"]), visible: estVisible(p), date: date(p["Date de publication"]),
      lot: text(p["Lot"]), trouver: text(p["À trouver"]), coeur: check(p["Coup de cœur"]), editions, manque,
      cover: text(p["Couverture T1"]), type: text(p["Type"]), y1: num(p["Année Début"]), stJP: text(p["Statut Japon"]), stFR: fr,
    };
  }).filter(s => s.t).sort((a, b) => a.t.localeCompare(b.t, "fr"));
  return json({ items });
}
