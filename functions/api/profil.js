// GET /api/profil : la fiche complète du membre connecté (badges, points, réseaux).
// POST /api/profil { instagram, x, discord, public } : le membre met à jour ses réseaux et choisit s'ils sont publics.
import { membre, estAdminEmail } from "../../lib/auth.js";
import { json } from "../../lib/admin.js";
import { lirePage, fiche, patch, rt } from "../../lib/membres.js";
const propre = s => String(s || "").trim().replace(/^https?:\/\/(www\.)?(instagram\.com|x\.com|twitter\.com)\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").slice(0, 60);
export async function onRequestGet({ request, env }) {
  const u = await membre(request, env);
  if (!u || !u.m) return json({ error: "connexion requise" }, 401);
  const page = await lirePage(env.NOTION_TOKEN, u.m);
  if (!page) return json({ error: "membre introuvable" }, 404);
  return json({ membre: fiche(page, { admin: await estAdminEmail(u.e, env), prive: true }) });
}
export async function onRequestPost({ request, env }) {
  const u = await membre(request, env);
  if (!u || !u.m) return json({ error: "connexion requise" }, 401);
  const b = await request.json().catch(() => ({}));
  const r = await patch(env.NOTION_TOKEN, u.m, {
    "Instagram": rt(propre(b.instagram)), "X": rt(propre(b.x)), "Discord": rt(String(b.discord || "").trim().slice(0, 60)),
    "Réseaux publics": { checkbox: !!b.public },
  });
  return r.ok ? json({ ok: true }) : json({ error: "Enregistrement impossible" }, 502);
}
