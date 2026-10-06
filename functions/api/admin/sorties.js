// Back-office « Sorties du jour » (Will, 06/10/2026) : les tomes France / Japon qui sortent aujourd'hui, à poster sur les réseaux.
// GET  /api/admin/sorties          → { today, items: [...] } : aujourd'hui + les 30 jours suivants (séries en ligne, comme le calendrier)
// GET  /api/admin/sorties?count=1  → { n, fr, jp } : sorties d'aujourd'hui pas encore postées (pastille jaune de l'en-tête)
// POST /api/admin/sorties {id, poste} → coche / décoche « Sortie postée » dans la base Tomes.
import { text, num, rel, list, queryAll, slugSerie } from "../../../lib/notion.js";
import { handle } from "../../../lib/mentions.js";
import { json, isAdmin } from "../../../lib/admin.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const AUTEURS = { dataSource: "22b1c097-0ff0-496c-9540-26953780c522", database: "bbefc8a1431247788b2445de4265d36b" };
const EDITEURS = { dataSource: "16e967fc-8e7b-4b7c-ab98-6a25cbdcd75a", database: "c9dc1efdf33d4ad09711d20d55860d52" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const nid = id => id.replace(/-/g, "");
// Date du jour à Paris (le serveur est en UTC).
const jour = (d = new Date()) => d.toLocaleDateString("sv", { timeZone: "Europe/Paris" });

async function charger(env, request) {
  const today = jour(), fin = jour(new Date(Date.now() + 30 * 864e5));
  const [cal, posted] = await Promise.all([
    fetch(new URL("/api/calendrier", request.url).toString()).then(r => r.ok ? r.json() : {}).catch(() => ({})),
    queryAll(env.NOTION_TOKEN, { ...TOMES, body: { filter: { and: [
      { property: "Date de sortie", date: { on_or_after: today } },
      { property: "Sortie postée", checkbox: { equals: true } },
    ] } } }).catch(() => []),
  ]);
  const ok = new Set(posted.map(r => nid(r.id)));
  const items = (cal.items || []).filter(x => x.date >= today && x.date <= fin && (x.prec || "Jour") === "Jour")
    .map(x => ({ ...x, poste: ok.has(x.id) ? 1 : 0 }));
  return { today, items };
}

// Légendes X / Instagram / TikTok (Will, 06/10/2026) : chaque sortie reçoit la série et les comptes à citer,
// au même format que l'écran Validation, pour que le back-office écrive les mêmes légendes « Sortie d'un tome ».
async function ajouterComptes(env, items) {
  const ids = new Set(items.map(x => x.seriesId).filter(Boolean));
  if (!ids.size) return;
  const [sRows, auRows, edRows] = await Promise.all([
    queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "Statut", select: { equals: "En ligne · public" } } } }).catch(() => []),
    queryAll(env.NOTION_TOKEN, { ...AUTEURS }).catch(() => []),
    queryAll(env.NOTION_TOKEN, { ...EDITEURS }).catch(() => []),
  ]);
  const series = {};
  for (const r of sRows) { const id = nid(r.id); if (!ids.has(id)) continue; const p = r.properties || {};
    series[id] = { id, t: text(p["Titre FR"]) || text(p["SERIES"]), tjp: text(p["SERIES"]), slug: slugSerie(p), jp: text(p["Titre Original"]), genres: list(p["Genre"]),
      resume: text(p["Résumé"]), resumeImg: text(p["Résumé image"]), resumeSortie: text(p["Résumé sortie"]),
      stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]), tomesJP: num(p["Tomes JP"]), tomesFR: num(p["Tomes FR"]),
      editeurs: rel(p["Éditeurs (fiches)"]), auteurs: rel(p["Auteurs"]),
      twX: [text(p["Twitter Author"]), text(p["Twitter Artist"]), text(p["Twitter Serie"])].map(handle).filter(Boolean) }; }
  const auteurs = {}; for (const a of auRows) { const q = a.properties || {}; auteurs[nid(a.id)] = { x: handle(text(q["X (Twitter)"])), ig: handle(text(q["Instagram"])), tt: handle(text(q["TikTok"])) }; }
  const editeurs = {}; for (const e of edRows) { const q = e.properties || {}; editeurs[nid(e.id)] = { nom: text(q["Nom"]), type: text(q["Type"]), x: handle(text(q["X (Twitter)"])), ig: handle(text(q["Instagram"])), tt: handle(text(q["TikTok"])) }; }
  const norm = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const uniq = l => [...new Set(l.filter(Boolean))];
  for (const x of items) {
    const s = series[x.seriesId]; if (!s) continue;
    const pays = x.pays === "France" ? "France" : "Japon", pub = String(x.pub || "").replace(/\s*\(.*$/, "");
    const total = pays === "France" ? s.tomesFR : s.tomesJP, statut = pays === "France" ? s.stFR : s.stJP;
    const cand = s.editeurs.map(k => editeurs[k]).filter(Boolean).filter(e => pays === "France" ? /FR/.test(e.type) : /JP/.test(e.type));
    const ed = cand.find(e => norm(e.nom) && norm(pub).includes(norm(e.nom))) || cand.find(e => norm(e.nom) && norm(e.nom).includes(norm(pub).slice(0, 5))) || cand[0];
    const frs = s.editeurs.map(k => editeurs[k]).filter(e => e && /FR/.test(e.type));
    const fr = (pays === "France" && ed && /FR/.test(ed.type)) ? ed : frs[0];
    const aut = s.auteurs.map(k => auteurs[nid(k)]).filter(Boolean);
    x.serie = { ...s, t: pays === "France" ? s.t : (s.tjp || s.t) };
    x.cat = pays === "France" ? "sortie-fr" : "sortie-jp";
    x.titre = `${x.serie.t} T.${String(x.n ?? "").padStart(2, "0")}`;
    x.sortie = x.date;
    x.tome = { n: x.n, pays, pub, flag: x.n === 1 ? "premier" : (/termin/i.test(statut || "") && x.n && total && x.n === total) ? "dernier" : "" };
    x.comptes = { x: uniq([...aut.map(c => c.x), ...(s.twX || [])]), xFR: fr && fr.x ? [fr.x] : [], ig: uniq([...aut.map(c => c.ig), fr && fr.ig]), tt: uniq([...aut.map(c => c.tt), fr && fr.tt]) };
  }
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const d = await charger(env, request);
  if (new URL(request.url).searchParams.has("count")) {
    const t = d.items.filter(x => x.date === d.today && !x.poste);
    return json({ n: t.length, fr: t.filter(x => x.pays === "France").length, jp: t.filter(x => x.pays === "Japon").length });
  }
  await ajouterComptes(env, d.items).catch(() => {});
  return json(d);
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  let b = {}; try { b = await request.json(); } catch (e) {}
  if (!/^[0-9a-f]{32}$/.test(b.id || "")) return json({ error: "tome inconnu" }, 400);
  const r = await fetch(`https://api.notion.com/v1/pages/${b.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { "Sortie postée": { checkbox: !!b.poste } } }),
  });
  if (!r.ok) return json({ error: "Notion a refusé : " + (await r.text()).slice(0, 300) }, 502);
  return json({ ok: true, poste: !!b.poste });
}
