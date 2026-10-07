// GET /api/profil : la fiche complète du membre connecté (badges, points, réseaux).
// POST /api/profil { instagram, x, discord, public } : le membre met à jour ses réseaux et choisit s'ils sont publics.
import { membre, estAdminEmail, cookieMembre } from "../../lib/auth.js";
import { json } from "../../lib/admin.js";
import { catalogue } from "../../lib/badges.js";
import { lirePage, fiche, patch, rt, identifiant, prisPar, estReserve } from "../../lib/membres.js";
const propre = s => String(s || "").trim().replace(/^https?:\/\/(www\.|m\.)?(instagram\.com|x\.com|twitter\.com|youtube\.com|tiktok\.com)\//i, "").replace(/^@/, "").replace(/^@/, "").replace(/[/?#].*$/, "").slice(0, 60);
export async function onRequestGet({ request, env }) {
  const u = await membre(request, env);
  if (!u || !u.m) return json({ error: "connexion requise" }, 401);
  const [page, cat] = await Promise.all([lirePage(env.NOTION_TOKEN, u.m), catalogue(env.NOTION_TOKEN).catch(() => [])]);
  if (!page) return json({ error: "membre introuvable" }, 404);
  // catalogue : tous les badges, pour montrer aussi ceux qu'on n'a pas encore (grisés).
  return json({ membre: fiche(page, { admin: await estAdminEmail(u.e, env), prive: true, cat }), catalogue: cat });
}
export async function onRequestPost({ request, env }) {
  const u = await membre(request, env);
  if (!u || !u.m) return json({ error: "connexion requise" }, 401);
  const b = await request.json().catch(() => ({}));
  // Chaque formulaire n'envoie que ses champs : le pseudo seul ne touche pas aux réseaux, et inversement.
  const props = {};
  if ("instagram" in b) props["Instagram"] = rt(propre(b.instagram));
  if ("x" in b) props["X"] = rt(propre(b.x));
  if ("youtube" in b) props["YouTube"] = rt(propre(b.youtube));
  if ("tiktok" in b) props["TikTok"] = rt(propre(b.tiktok));
  if ("discord" in b) props["Discord"] = rt(String(b.discord || "").trim().slice(0, 60));
  if ("public" in b) props["Réseaux publics"] = { checkbox: !!b.public };
  // Pseudo : 3 à 20 caractères ; son identifiant (adresse du profil) doit être libre.
  let pseudo = typeof b.pseudo === "string" ? b.pseudo.trim().replace(/\s+/g, " ") : "", slug = u.s;
  if (pseudo) {
    if (pseudo.length < 3 || pseudo.length > 20 || !/^[\p{L}\p{N} ._-]+$/u.test(pseudo)) return json({ error: "Pseudo : 3 à 20 caractères (lettres, chiffres, espace, point, tiret)." }, 400);
    slug = identifiant(pseudo);
    if (!slug || estReserve(slug)) return json({ error: "Ce pseudo n'est pas disponible." }, 409);
    const pris = await prisPar(env.NOTION_TOKEN, slug);
    if (pris && pris !== u.m) return json({ error: "Ce pseudo est déjà pris, choisis-en un autre." }, 409);
    props["Pseudo"] = { title: [{ type: "text", text: { content: pseudo } }] };
    props["Identifiant"] = rt(slug);
  }
  if (!Object.keys(props).length) return json({ ok: true, slug });
  const r = await patch(env.NOTION_TOKEN, u.m, props);
  if (!r.ok) return json({ error: "Enregistrement impossible" }, 502);
  // Le cookie suit le nouveau pseudo (affiché dans l'en-tête et le menu).
  const c = pseudo ? await cookieMembre({ ...u, n: pseudo, s: slug, x: undefined }, env) : null;
  return json({ ok: true, slug }, 200, c ? { "set-cookie": c } : {});
}
