// GET /api/admin/couvertures : les tomes sans couverture, regroupés par série puis par édition (Will, 07/10/2026).
//   → { total, fr, jp, aParaitre, series: [{ id, t, slug, ligne, eds: [{ id, nom, pays, pub, nb, manque: [{ n, id, vue, futur }], toute }] }],
//       verifier: [{ type, texte, id }] }
// « toute » : l'édition n'a aucune couverture. « futur » : tome pas encore sorti (couverture souvent pas dévoilée).
// verifier : séries en double (même titre), éditions marquées « [À SUPPRIMER] », éditions sans aucun tome.
// ?count=1 → { n } (tomes parus sans couverture) pour la tuile du back-office.
import { json, isAdmin } from "../../../lib/admin.js";
import { text, num, date, rel, queryAll, cached } from "../../../lib/notion.js";
import { toutesEditions } from "../../../lib/memo.js";
import { estVisible } from "../../../lib/site.js";

const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const nid = id => String(id || "").replace(/-/g, "");
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

async function construire(env, waitUntil) {
  const today = new Date().toISOString().slice(0, 10);
  const [tRows, eRows, sRows] = await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { property: "Couverture", url: { is_empty: true } }, sorts: [{ property: "N°", direction: "ascending" }] } }),
    toutesEditions(env, waitUntil),
    queryAll(env.NOTION_TOKEN, { ...SERIES }),
  ]);
  const series = {};
  for (const r of sRows) { const p = r.properties || {}; series[nid(r.id)] = { id: nid(r.id), t: text(p["Titre FR"]) || text(p["SERIES"]), titre: text(p["SERIES"]), slug: "", ligne: estVisible(p) ? 1 : 0 }; }
  const eds = {};
  for (const e of eRows) { const p = e.properties || {}; eds[nid(e.id)] = { id: nid(e.id), nom: text(p["Édition"]), pays: text(p["Pays"]), pub: text(p["Éditeur"]), nb: num(p["Nb tomes"]), serie: rel(p["Série"])[0] }; }
  const parEd = {};
  let fr = 0, jp = 0, futurs = 0;
  for (const r of tRows) {
    const p = r.properties || {}, e = rel(p["Édition"])[0], ed = eds[e];
    if (!ed || /^\[À SUPPRIMER\]/i.test(ed.nom)) continue;
    const d = date(p["Date de sortie"]), futur = text(p["Statut"]) === "À paraître" || (!!d && d > today) ? 1 : 0;
    (parEd[e] = parEd[e] || []).push({ id: nid(r.id), n: num(p["N°"]), vue: text(p["Couverture vue sur"]), futur, d: d || "" });
    if (futur) futurs++; else if (ed.pays === "France") fr++; else jp++;
  }
  const parSerie = {};
  for (const [e, l] of Object.entries(parEd)) {
    const ed = eds[e], s = series[ed.serie] || { id: ed.serie || "", t: "(série inconnue)", ligne: 0 };
    const parus = l.filter(x => !x.futur).length;
    (parSerie[s.id] = parSerie[s.id] || { ...s, eds: [] }).eds.push({ id: e, nom: ed.nom, pays: ed.pays, pub: ed.pub, nb: ed.nb, manque: l, toute: !!ed.nb && parus >= ed.nb });
  }
  const liste = Object.values(parSerie).map(s => ({ ...s, n: s.eds.reduce((a, e) => a + e.manque.filter(x => !x.futur).length, 0) }))
    .sort((a, b) => b.ligne - a.ligne || b.n - a.n || a.t.localeCompare(b.t, "fr"));
  // Points à vérifier dans la base
  const verifier = [];
  const titres = {};
  for (const s of Object.values(series)) { const k = norm(s.titre || s.t); if (k) (titres[k] = titres[k] || []).push(s); }
  for (const l of Object.values(titres)) if (l.length > 1) verifier.push({ type: "Série en double", texte: `${l[0].t} : ${l.length} fiches dans la base Séries`, id: l[0].id, ids: l.map(x => x.id) });
  for (const e of Object.values(eds)) if (/^\[À SUPPRIMER\]/i.test(e.nom)) verifier.push({ type: "Édition à supprimer", texte: `${e.nom} (${(series[e.serie] || {}).t || "série inconnue"})`, id: e.id });
  return { total: fr + jp, fr, jp, aParaitre: futurs, series: liste, verifier };
}

export async function onRequestGet({ request, env, waitUntil }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const r = await cached(request, waitUntil, "/__cache/admin-couvertures-v1", 120, () => construire(env, waitUntil));
  if (!new URL(request.url).searchParams.has("count")) return new Response(r.body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  const d = await r.json().catch(() => ({}));
  return json({ n: d.total || 0 });
}
