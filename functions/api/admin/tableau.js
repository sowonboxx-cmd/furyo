// GET /api/admin/tableau : tout ce qu'affiche le menu admin (maquette H1 validée par Will le 25/10/2026), en un seul appel.
//   veille (news à relire), couvertures manquantes, Mangas Database (en ligne / promo), la famille du gang (membres, du jour,
//   de la semaine, Premium), les news du jour avec leur heure de publication, la to-do.
// Les morceaux viennent des API existantes (appelées avec le cookie admin) ; le résultat est gardé 60 s.
import { json, isAdmin } from "../../../lib/admin.js";

const jourParis = d => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(d);
const heureParis = d => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(d);

export async function onRequestGet({ request, env, waitUntil }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const url = new URL(request.url), CLE = new Request(url.origin + "/__cache/admin-tableau-v1");
  // Servi tout de suite depuis le cache ; reconstruit en arrière-plan s'il a plus d'une minute (la base mangas met quelques secondes).
  if (!url.searchParams.has("frais")) {
    const hit = await caches.default.match(CLE);
    if (hit) { const d = await hit.json().catch(() => null); if (d) { if (Date.now() - d.t > 60e3) waitUntil(construire(request, env, url, CLE).catch(() => {})); return json(d); } }
  }
  return json(await construire(request, env, url, CLE, waitUntil));
}

async function construire(request, env, url, CLE, waitUntil) {
  const h = { cookie: request.headers.get("cookie") || "" };
  const get = p => fetch(new URL(p, url.origin), { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null);
  const [veille, couv, series, membres, todo] = await Promise.all([
    get("/api/admin/veille"), get("/api/admin/couvertures?count=1"), get("/api/admin/series"), get("/api/membres"), get("/api/admin/todo"),
  ]);
  const now = new Date(), auj = jourParis(now);
  const dow = (new Date(auj + "T12:00:00Z").getUTCDay() + 6) % 7, lundi = jourParis(new Date(now.getTime() - dow * 864e5));

  // Veille : même compte que la tuile du back-office ; news du jour = publiées aujourd'hui (heure de Paris).
  const items = (veille && veille.items) || [];
  const nVeille = veille && veille.n != null ? veille.n : items.filter(i => !i.vu && !i.enLigne && i.cat !== "fiche" && !/^(couv|sortie)/.test(i.cat || "")).length;
  const duJour = items.filter(i => i.publie && jourParis(new Date(i.publie)) === auj).map(i => ({
    id: i.id, titre: i.titre || i.prop || "News", cat: i.cat, label: i.label || "", image: i.imageChoisie || i.image || (i.serie && i.serie.cover) || "",
    heure: /T/.test(i.publie) ? heureParis(new Date(i.publie)) : "", t: Date.parse(i.publie) || 0, statut: "publiee",
  })).sort((a, b) => a.t - b.t);

  // Mangas Database : fiches en ligne / total, promo faite / en ligne, ajoutées cette semaine.
  const S = (series && (series.items || series.series)) || [];
  const enLigne = S.filter(s => s.publier).length, promo = S.filter(s => s.publier && s.promo).length;
  const semaine = S.filter(s => s.publier && s.date && s.date >= lundi).length;

  // La famille du gang.
  const M = (membres && membres.items) || [];
  const dates = M.filter(x => x.inscrit).map(x => jourParis(new Date(x.inscrit)));
  const recents = M.filter(x => x.inscrit).sort((a, b) => String(b.inscrit).localeCompare(String(a.inscrit))).slice(0, 7)
    .map(x => ({ pseudo: x.pseudo || "Membre", photo: x.photo || "", slug: x.slug || "" }));
  const premium = membres && membres.premium != null ? membres.premium : M.filter(x => (x.badges || []).some(b => b.r === "premium")).length;

  // To-do : les tâches pas faites d'abord (échéance la plus proche, puis priorité haute), puis les 2 dernières faites.
  const T = (todo && todo.items) || [];
  const aFaire = T.filter(x => !x.done).sort((a, b) => (a.dt || "9999").localeCompare(b.dt || "9999") || ((b.prio === "haut") - (a.prio === "haut")));
  const faites = T.filter(x => x.done).sort((a, b) => String(b.fait || "").localeCompare(String(a.fait || ""))).slice(0, 2);
  const fin = jourParis(new Date(now.getTime() + (6 - dow) * 864e5));
  const semTodo = aFaire.filter(x => x.dt && x.dt <= fin).length;

  const d = {
    t: Date.now(), aujourdhui: auj,
    veille: { n: nVeille }, couvertures: { n: couv && couv.n != null ? couv.n : null },
    base: { total: S.length, enLigne, promo, semaine },
    famille: { total: M.length || (membres && membres.total) || 0, auj: dates.filter(x => x === auj).length, sem: dates.filter(x => x >= lundi).length, premium, recents },
    jour: duJour,
    todo: { total: aFaire.length, semaine: semTodo, items: aFaire.slice(0, 40).concat(faites).map(x => ({ id: x.id, t: x.t, cat: x.cat || "", dt: x.dt || "", prio: x.prio || "", done: !!x.done })) },
  };
  const put = caches.default.put(CLE, new Response(JSON.stringify(d), { headers: { "content-type": "application/json", "cache-control": "max-age=86400" } }));
  if (waitUntil) waitUntil(put); else await put;
  return d;
}
