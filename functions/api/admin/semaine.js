// GET /api/admin/semaine?du=AAAA-MM-JJ&au=AAAA-MM-JJ : les chiffres privés du récap « Quoi de neuf dans le gang ? »
// (Studio /studio/semaine/, Will, 15/10/2026). Le reste (sorties, prépub, news, fiches) vient des API publiques.
//   membres   : total, nouveaux de la période (pseudos)
//   gang      : tomes ajoutés aux collections pendant la période, total de tomes possédés, top 3 de la période
//   films     : films / dramas / anime ajoutés dans Notion pendant la période et déjà en ligne
//   derniers  : ?sids=a,b → couverture du dernier tome paru de chaque série (édition japonaise d'abord), pour les news
//               « Tomes en circulation » : la bannière se voyait mal, Will préfère la couverture (26/10/2026)
// Réservé aux admins. Les membres « Masqué » ne sont jamais cités.
import { json, isAdmin } from "../../../lib/admin.js";
import { queryAll, check, text, num } from "../../../lib/notion.js";
import { MEMBRES } from "../../../lib/membres.js";
import { editionsParSerie } from "../../../lib/memo.js";

const FILMS = { dataSource: "dfca009b-7891-49a4-8a1d-fd665dcacd77", database: "fe4b3db3d00c411ca3c1a25aff6bfadb" };
const nid = id => String(id || "").replace(/-/g, "");
const J = /^\d{4}-\d{2}-\d{2}$/;
const local = u => String(u || "").replace(/^https?:\/\/(www\.)?(furyogang\.com|furyo\.pages\.dev)(?=\/)/, "");

export async function onRequestGet({ request, env, waitUntil }) {
  try {
    if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
    const q = new URL(request.url).searchParams, du = q.get("du"), au = q.get("au");
    if (!J.test(du || "") || !J.test(au || "")) return json({ error: "dates du / au attendues" }, 400);
    const dans = d => d && d.slice(0, 10) >= du && d.slice(0, 10) <= au;

    const sids = (q.get("sids") || "").split(",").map(nid).filter(x => /^[0-9a-f]{32}$/.test(x)).slice(0, 20);
    const [mRows, fRows, eds] = await Promise.all([
      queryAll(env.NOTION_TOKEN, { ...MEMBRES }).catch(() => []),
      queryAll(env.NOTION_TOKEN, { ...FILMS, body: { filter: { and: [
        { timestamp: "created_time", created_time: { on_or_after: du } },
        { timestamp: "created_time", created_time: { on_or_before: au + "T23:59:59+02:00" } },
      ] } } }).catch(() => []),
      sids.length ? editionsParSerie(env, waitUntil).catch(() => ({})) : {},
    ]);
    const auj = new Date().toISOString().slice(0, 10), derniers = {};
    for (const sid of sids) {
      const l = (eds[sid] || []).slice().sort((a, b) => (a.pays === "Japon" ? 0 : 1) - (b.pays === "Japon" ? 0 : 1));
      for (const e of l) { const t = e.tomes.filter(t => t.cover && (t.paru || (t.date && t.date <= auj))).sort((a, b) => b.n - a.n)[0];
        if (t) { derniers[sid] = { cover: local(t.cover), n: t.n, pays: e.pays }; break; } }
    }
    const membres = {};
    for (const r of mRows) { const p = r.properties || {}; if (check(p["Masqué"])) continue;
      membres[nid(r.id)] = { pseudo: text(p["Pseudo"]), photo: text(p["Photo"]), inscrit: r.created_time }; }
    const tous = Object.values(membres);
    const nouveaux = tous.filter(m => dans(m.inscrit)).map(m => ({ pseudo: m.pseudo, photo: m.photo }));

    // Collections : historique jour par jour de chaque membre (bib:<membre>.h), voir lib/communaute.js.
    let ajoutes = 0, possedes = 0; const top = [];
    if (env.STATS) {
      const keys = []; let cursor;
      do { const r = await env.STATS.list({ prefix: "bib:", cursor }); keys.push(...r.keys.map(k => k.name)); cursor = r.list_complete ? null : r.cursor; } while (cursor);
      await Promise.all(keys.map(async k => {
        let b = {}; try { b = JSON.parse((await env.STATS.get(k)) || "{}") || {}; } catch (e) {}
        possedes += Object.keys(b.c || {}).length;
        let n = 0; for (const [d, x] of Object.entries(b.h || {})) if (dans(d)) n += x;
        if (n > 0) { ajoutes += n; const m = membres[k.slice(4)]; if (m && m.pseudo) top.push({ pseudo: m.pseudo, photo: m.photo, n }); }
      }));
    }
    top.sort((a, b) => b.n - a.n);

    const films = fRows.filter(r => /En ligne/.test(text((r.properties || {})["Statut"]))).map(r => { const p = r.properties || {};
      return { t: text(p["Titre FR"]) || text(p["Titre"]), type: text(p["Type"]) || "Film", y: num(p["Année"]), img: local(text(p["Affiche"])) }; });

    return json({ ok: true, du, au, membres: { total: tous.length, nouveaux }, gang: { ajoutes, possedes, top: top.slice(0, 3) }, films, derniers });
  } catch (e) {
    return json({ error: "erreur serveur : " + String(e && e.message || e).slice(0, 200) }, 500);
  }
}
