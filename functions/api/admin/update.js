// POST /api/admin/update {id, statut?, coeur? (= Prochaine à traiter), resume?, legIG?, legTT?, legX?} : modifie la série dans Notion (back-office, connecté seulement).
// statut = « À valider » | « Validé · admins » | « En ligne · public » (colonne Statut). Passer « En ligne · public » remplit
// la date de publication si elle est vide. Les caches publics sont vidés.
import { json, isAdmin } from "../../../lib/admin.js";
import { STATUTS, PUBLIC, A_VALIDER } from "../../../lib/site.js";
const rt = s => ({ rich_text: s ? [{ type: "text", text: { content: String(s).slice(0, 1900) } }] : [] });

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  let b = {}; try { b = await request.json(); } catch (e) {}
  if (!/^[0-9a-f]{32}$/.test(b.id || "")) return json({ error: "série inconnue" }, 400);
  const props = {};
  if (STATUTS.includes(b.statut)) {
    props["Statut"] = { select: { name: b.statut } };
    if (b.statut === PUBLIC && !b.date) props["Date de publication"] = { date: { start: new Date().toISOString().slice(0, 10) } };
  }
  if (typeof b.resume === "string") props["Résumé"] = rt(b.resume);
  // N° de fiche choisi par Will (vide = numéro attribué automatiquement).
  if ("num" in b) { const n = Number(b.num); props["N° fiche"] = { number: b.num === "" || b.num === null || !(n > 0) ? null : Math.round(n) }; }
  if (typeof b.resumeImg === "string") props["Résumé image"] = rt(b.resumeImg);
  // Résumé court commun à tous les posts de sortie de tome de la série (écran Validation).
  if (typeof b.resumeSortie === "string") props["Résumé sortie"] = rt(b.resumeSortie.trim());
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
  await Promise.all(["/api/series?v=5", "/api/avancement", "/api/calendrier", "/api/serie-index", ...(/^[a-z0-9-]+$/.test(b.slug || "") ? ["/api/serie?s=" + b.slug] : [])].map(k => c.delete(new Request(new URL(k, request.url).toString()))));
  const p = (await r.json()).properties || {};
  const st = ((p["Statut"] || {}).select || {}).name || A_VALIDER;
  return json({ ok: true, statut: st, publier: st === PUBLIC, date: ((p["Date de publication"] || {}).date || {}).start || "" });
}
