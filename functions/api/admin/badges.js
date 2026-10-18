// Badges du QG (/hq/#badges), réservé aux admins (Will, 18/10/2026) : la liste complète des badges, avec leur icône,
// ce qu'ils font et le nombre de membres qui les ont. On peut en ajouter et les modifier ; ils restent dans la base Notion « Badges ».
//   GET  /api/admin/badges                                   → { ok, badges: [{ id, n, d, c, couleur, icone, i, regle, r, o, masque, nb }], couleurs, icones, regles }
//   POST /api/admin/badges { id?, n, d, couleur, icone, regle, o, masque } → crée (sans id) ou modifie un badge
// L'attribution aux membres se fait sur la fiche du membre (« Gérer les badges · admin »).
import { json, isAdmin } from "../../../lib/admin.js";
import { text, num, check, rel, queryAll } from "../../../lib/notion.js";
import { BADGES, COULEURS, ICONES, REGLES, oublierCatalogue } from "../../../lib/badges.js";
import { MEMBRES, numMembre } from "../../../lib/membres.js";
const nid = id => String(id || "").replace(/-/g, "");
const H = t => ({ Authorization: `Bearer ${t}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" });

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const [rows, membres] = await Promise.all([queryAll(env.NOTION_TOKEN, { ...BADGES }), queryAll(env.NOTION_TOKEN, { ...MEMBRES }).catch(() => [])]);
  const nb = {};
  for (const m of membres) for (const b of rel(m.properties["Badges"])) nb[b] = (nb[b] || 0) + 1;
  const badges = rows.filter(r => text(r.properties["Nom"])).map(r => {
    const p = r.properties, couleur = text(p["Couleur"]) || "Gris", icone = text(p["Icône"]) || "Étoile", regle = text(p["Règle"]) || "Manuel";
    return { id: nid(r.id), n: text(p["Nom"]), d: text(p["Description"]), couleur, c: COULEURS[couleur] || COULEURS.Gris, icone, i: ICONES[icone] || "etoile",
      regle, r: REGLES[regle] || "manuel", o: num(p["Ordre"]) ?? 99, masque: check(p["Masqué"]), nb: nb[nid(r.id)] || 0 };
  }).sort((a, b) => a.o - b.o || a.n.localeCompare(b.n, "fr"));
  // « 100 premiers inscrits » est automatique : on compte les membres n° 1 à 100.
  const cent = membres.filter(m => { const k = numMembre(m.properties); return k && k <= 100; }).length;
  for (const b of badges) if (b.r === "cent") b.nb = cent;
  return json({ ok: true, badges, membres: membres.length, couleurs: COULEURS, icones: Object.keys(ICONES), regles: Object.keys(REGLES) });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const b = await request.json().catch(() => ({}));
  const n = String(b.n || "").trim().slice(0, 80);
  if (!n) return json({ error: "Il faut un nom" }, 400);
  if (b.couleur && !COULEURS[b.couleur]) return json({ error: "Couleur inconnue" }, 400);
  if (b.icone && !ICONES[b.icone]) return json({ error: "Icône inconnue" }, 400);
  if (b.regle && !REGLES[b.regle]) return json({ error: "Règle inconnue" }, 400);
  const props = {
    "Nom": { title: [{ text: { content: n } }] },
    "Description": { rich_text: [{ text: { content: String(b.d || "").trim().slice(0, 300) } }] },
    "Couleur": { select: { name: b.couleur || "Gris" } },
    "Icône": { select: { name: b.icone || "Étoile" } },
    "Règle": { select: { name: b.regle || "Manuel" } },
    "Masqué": { checkbox: !!b.masque },
  };
  const o = Number(b.o); if (b.o !== "" && b.o != null && Number.isFinite(o)) props["Ordre"] = { number: Math.round(o) };
  const id = nid(b.id);
  const r = id ? await fetch(`https://api.notion.com/v1/pages/${id}`, { method: "PATCH", headers: H(env.NOTION_TOKEN), body: JSON.stringify({ properties: props }) })
    : await fetch("https://api.notion.com/v1/pages", { method: "POST", headers: H(env.NOTION_TOKEN), body: JSON.stringify({ parent: { database_id: BADGES.database }, properties: props }) });
  if (!r.ok) return json({ error: "Enregistrement impossible" }, 502);
  oublierCatalogue();
  try { await caches.default.delete(new Request(new URL("/api/membres", request.url).toString())); } catch (e) {}
  return json({ ok: true, id: nid((await r.json()).id) });
}
