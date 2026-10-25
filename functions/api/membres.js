// GET /api/membres : la liste publique des membres (sans e-mail ; réseaux seulement si le membre les a rendus publics).
import { queryAll, check, cached } from "../../lib/notion.js";
import { MEMBRES, fiche } from "../../lib/membres.js";
import { estAdminEmail, membre } from "../../lib/auth.js";
import { catalogue } from "../../lib/badges.js";
// Il faut être membre pour voir les membres : sans connexion, on ne donne que le nombre d'inscrits.
const J = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
export async function onRequestGet(ctx) {
  const u = await membre(ctx.request, ctx.env);
  if (u && u.m) { const r = await liste(ctx); const out = new Response(r.body, r); out.headers.set("cache-control", "private, no-store"); return out; }
  if (new URL(ctx.request.url).searchParams.get("u")) return J({ locked: true, error: "réservé aux membres" }, 401);
  const r = await liste(ctx); const j = await r.json().catch(() => ({}));
  // Sans connexion : le nombre d'inscrits et les têtes des 8 derniers (pseudo et photo seulement, jamais les membres masqués),
  // pour l'accueil (Will, 17/10/2026).
  const recents = (j.items || []).slice().sort((a, b) => String(b.inscrit || "").localeCompare(String(a.inscrit || ""))).slice(0, 8)
    .map(x => ({ pseudo: x.pseudo || "Membre", photo: x.photo || "", inscrit: x.inscrit || "" }));
  // Arrivées du jour et de la semaine (depuis lundi), à l'heure de Paris, pour le widget « La famille du gang » (Will, 22/10/2026).
  const jour = d => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(d);
  const now = new Date(), auj = jour(now), dow = (new Date(auj + "T12:00:00Z").getUTCDay() + 6) % 7, lundi = jour(new Date(now.getTime() - dow * 864e5));
  const dates = (j.items || []).filter(x => x.inscrit).map(x => jour(new Date(x.inscrit)));
  return J({ locked: true, total: j.total || 0, premium: j.premium || 0, recents, auj: dates.filter(d => d === auj).length, sem: dates.filter(d => d >= lundi).length });
}
async function liste({ request, env, waitUntil }) {
  // ?u=<identifiant> : un seul membre (page publique furyogang.com/membres/<identifiant>).
  const one = new URL(request.url).searchParams.get("u");
  if (one) {
    // Page d'un membre : lue dans la liste gardée en cache (2 min), sans requête Notion (Will, 07/10/2026).
    try { const l = await (await liste({ request: new Request(new URL("/api/membres", request.url)), env, waitUntil })).json();
      const m = (l.items || []).find(x => (x.slug || "").toLowerCase() === one.toLowerCase());
      if (m) return new Response(JSON.stringify({ membre: m, catalogue: l.catalogue || [] }), { headers: { "content-type": "application/json; charset=utf-8" } });
    } catch (e) {}
    const rows = await queryAll(env.NOTION_TOKEN, { ...MEMBRES, body: { filter: { property: "Identifiant", rich_text: { equals: one.toLowerCase() } } } });
    const r = rows[0], cat = await catalogue(env.NOTION_TOKEN).catch(() => []);
    if (!r || check(r.properties["Masqué"])) return new Response(JSON.stringify({ error: "introuvable" }), { status: 404, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ membre: fiche(r, { admin: await estAdminEmail(r.properties["Email"]?.email, env), cat }), catalogue: cat }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  }
  return cached(request, waitUntil, "/api/membres", 120, async () => {
    const [rows, cat] = await Promise.all([queryAll(env.NOTION_TOKEN, { ...MEMBRES }), catalogue(env.NOTION_TOKEN, true).catch(() => [])]);
    const items = [];
    for (const r of rows) {
      if (check(r.properties["Masqué"])) continue;
      items.push(fiche(r, { admin: await estAdminEmail(r.properties["Email"]?.email, env), cat }));
    }
    items.sort((a, b) => (a.num || 1e9) - (b.num || 1e9));
    // Membres Premium payés (badge Premium automatique, date de fin pas passée), affichés à côté du nombre de membres (Will, 25/10/2026).
    const premium = items.filter(x => (x.badges || []).some(b => b.r === "premium")).length;
    return { items, total: items.length, premium, catalogue: cat };
  });
}
