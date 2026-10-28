// GET /api/admin/tableau : tout ce qu'affiche le menu admin (maquette H1 validée par Will le 25/10/2026), en un seul appel.
//   veille (news à relire), couvertures manquantes, Mangas Database (en ligne / promo), la famille du gang (membres, du jour,
//   de la semaine, Premium), les news du jour avec leur heure de publication, la to-do.
// Les morceaux viennent des API existantes (appelées avec le cookie admin) ; le résultat est gardé 60 s.
import { json, isAdmin } from "../../../lib/admin.js";

const jourParis = d => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(d);
const heureParis = d => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(d);

export async function onRequestGet({ request, env, waitUntil }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const url = new URL(request.url), CLE = new Request(url.origin + "/__cache/admin-tableau-v2");
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
  const [veille, couv, series, membres, todo, calEd, calPub, sx] = await Promise.all([
    get("/api/admin/veille"), get("/api/admin/couvertures?count=1"), get("/api/admin/series"), get("/api/membres"), get("/api/admin/todo"),
    get("/api/admin/calendrier"), get("/api/calendrier?tout=1"), get("/api/admin/sorties?passe=1"),
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

  // Calendrier éditorial (Will, 27/10/2026, maquette cal 2) : 5 semaines autour d'aujourd'hui, mêmes sources que le calendrier du QG.
  // État : p = publié (vert), a = à publier (orange), r = en retard (rouge : la date est passée et ce n'est pas publié).
  const cal = calendrier({ auj, lundi, calEd, calPub, sx, veille: items, todo: T });

  const d = {
    t: Date.now(), aujourdhui: auj, cal,
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

const EV_KJ = { "qn-sem": "毎週", "qn-mois": "毎月", maj: "更新", concours: "抽選", couv: "表紙", fiche: "新作", mangaka: "作家", membre: "仲間", article: "記事", video: "動画", autre: "予定" };
const NEWS_KJ = { "licence-fr": "仏版", "licence-jp": "連載", "couv-fr": "表紙", "couv-jp": "表紙", "sortie-fr": "発売", "sortie-jp": "発売", fin: "完結", pause: "休載", anime: "放送", adaptation: "実写", "bande-annonce": "予告", tirage: "部数", extrait: "試読", hommage: "追悼", dedicace: "サイン会", news: "速報", prepub: "連載" };
const REPJ = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 };
function calendrier({ auj, lundi, calEd, calPub, sx, veille, todo }) {
  const add = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const du = add(lundi, -14), au = add(lundi, 27), jours = {};
  for (let d = du; d <= au; d = add(d, 1)) jours[d] = [];
  const etat = (fait, date) => fait ? "p" : date < auj ? "r" : "a";
  const types = {}; ((calEd && calEd.types) || []).forEach(t => { types[t.id] = t.nom; });
  // Événements du calendrier (datés ou récurrents).
  ((calEd && calEd.events) || []).forEach(e => {
    Object.keys(jours).forEach(d => {
      const x = new Date(d + "T12:00:00Z"), ok = e.date ? e.date === d : (e.repeat === "mois" ? x.getUTCDate() === (e.jour || 1) : (e.repeat in REPJ && REPJ[e.repeat] === x.getUTCDay()));
      if (ok) jours[d].push({ k: "ev", t: e.titre, s: types[e.type] || "Rendez-vous", kj: EV_KJ[e.type] || "予定", st: etat(!!e.fait && (!!e.date || d <= auj), d), u: e.lien && /^\/studio\//.test(e.lien) ? e.lien : "/hq/#calendrier" });
    });
  });
  // Sorties de tomes (postée = publiée sur les réseaux).
  const poste = {}; ((sx && sx.items) || []).forEach(x => { if (x && x.id) poste[x.id] = !!x.poste; });
  ((calPub && calPub.items) || []).forEach(x => { if (!x.date || !jours[x.date]) return;
    jours[x.date].push({ k: "so", kj: "発売", t: (x.series || x.fr || x.jp || "Tome") + (x.n != null && x.n !== "" ? " T." + x.n : ""), s: x.pub || (x.pays === "Japon" ? "Japon" : "France"), img: x.cover || "", st: etat(poste[x.id], x.date), u: "/hq/#calendrier" }); });
  // News : publiées le jour de leur mise en ligne, planifiées au jour prévu.
  const jp = t => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(new Date(t));
  const hp = t => /T/.test(t) ? new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(t)) : "";
  (veille || []).forEach(i => {
    const c = i.carte || {}, img = c.ig || c.tt || c.couv || (i.imageChoisie && !/\/api\/ogcard\//.test(i.imageChoisie) ? i.imageChoisie : "") || c.og || i.image || (i.serie && i.serie.cover) || ""; // le visuel de la publication d'abord (Will, 28/10/2026)
    const base = { k: "news", t: (i.carte && i.carte.titre) || i.titre || i.prop || "News", s: i.label || "News", kj: NEWS_KJ[i.cat] || "速報", img: img && /^\//.test(img) ? img : img, u: "/hq/news/#" + i.id };
    if (i.enLigne && i.publie) { const d = jp(i.publie); if (jours[d]) jours[d].push({ ...base, h: hp(i.publie), st: "p" }); }
    else if (!i.enLigne && !i.vu && i.planif) { const d = jp(i.planif.length > 10 ? i.planif : i.planif + "T12:00:00"); if (jours[d]) jours[d].push({ ...base, h: hp(i.planif), st: etat(false, d) }); }
  });
  // Tâches datées de la to-do.
  (todo || []).forEach(t => { if (t.dt && !t.done && jours[t.dt]) jours[t.dt].push({ k: "todo", t: t.t, s: "To-do" + (t.cat ? " · " + t.cat : ""), kj: "課題", st: etat(false, t.dt), u: "/hq/#todo" }); });
  // Tri : heure, puis news, événements, sorties.
  const ordre = { news: 0, ev: 1, todo: 2, so: 3 };
  Object.keys(jours).forEach(d => jours[d].sort((a, b) => (a.h || "99").localeCompare(b.h || "99") || ordre[a.k] - ordre[b.k]));
  return { du, au, jours };
}
