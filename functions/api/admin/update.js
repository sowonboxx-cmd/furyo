// POST /api/admin/update {id, publier?, etat?, lot?, trouver?, coeur? (= Prochaine à traiter)} : modifie la série dans Notion (back-office, connecté seulement).
// Publier coche aussi « Avancement = Validée » et remplit la date de publication si elle est vide. Les caches publics sont vidés.
import { json, isAdmin } from "../../../lib/admin.js";

const ETATS = ["À faire", "En cours", "À valider", "Validée"];
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 1900) } }] : [] });

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  let b = {}; try { b = await request.json(); } catch (e) {}
  if (!/^[0-9a-f]{32}$/.test(b.id || "")) return json({ error: "série inconnue" }, 400);
  const props = {};
  if (typeof b.publier === "boolean") {
    props["Publier"] = { checkbox: b.publier };
    if (b.publier) {
      props["Avancement"] = { select: { name: "Validée" } };
      if (!b.date) props["Date de publication"] = { date: { start: new Date().toISOString().slice(0, 10) } };
    }
  }
  if (b.etat && ETATS.includes(b.etat)) props["Avancement"] = { select: b.etat === "À faire" ? null : { name: b.etat } };
  if (typeof b.lot === "string") props["Lot"] = rt(b.lot);
  if (typeof b.trouver === "string") props["À trouver"] = rt(b.trouver);
  if (typeof b.coeur === "boolean") props["Prochaine à traiter"] = { checkbox: b.coeur };
  // Légendes des réseaux (depuis le Studio « Nouvelle fiche »).
  if (typeof b.legIG === "string") props["Légende Instagram"] = rt(b.legIG);
  if (typeof b.legTT === "string") props["Légende TikTok"] = rt(b.legTT);
  if (typeof b.legX === "string") props["Légende X"] = rt(b.legX);
  if (!Object.keys(props).length) return json({ error: "rien à changer" }, 400);
  const r = await fetch(`https://api.notion.com/v1/pages/${b.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ properties: props }),
  });
  if (!r.ok) return json({ error: "Notion a refusé : " + (await r.text()).slice(0, 300) }, 502);
  // Le site se met à jour tout de suite : on jette les versions en cache des listes publiques.
  const c = caches.default;
  await Promise.all(["/api/series?v=3", "/api/avancement", "/api/calendrier", "/api/serie-index", ...(/^[a-z0-9-]+$/.test(b.slug || "") ? ["/api/serie?s=" + b.slug] : [])].map(k => c.delete(new Request(new URL(k, request.url).toString()))));
  const p = (await r.json()).properties || {};
  return json({ ok: true, publier: !!(p["Publier"] || {}).checkbox, etat: ((p["Avancement"] || {}).select || {}).name || "À faire", date: ((p["Date de publication"] || {}).date || {}).start || "" });
}
