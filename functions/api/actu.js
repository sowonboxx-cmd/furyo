// GET /api/actu?id=<id de la news> : ce qui accompagne une news sur ordinateur (maquette A3 validée par Will le 05/10/2026).
// - la série : résumé, genres, mangaka, éditeurs, statuts, tomes, anime, et si sa fiche est en ligne ;
// - le dernier chapitre sorti au Japon (base Prépublication) pour la série ou une autre partie du même univers ;
// - le ou les mangakas (base Auteurs) avec leur compte X et leurs séries.
// Seules les news publiées sont acceptées. Résultat gardé en cache 10 minutes.
import { text, num, date, rel, list, queryAll, cached, slugify, slugSerie } from "../../lib/notion.js";
import { estVisible } from "../../lib/site.js";
import { credits } from "../../lib/credit.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const PREPUB = { dataSource: "e4e66558-3cf0-41f1-afc2-5147566cbf3e", database: "f0b7c0f91f4d442597cbbb169b7abbda" };
const EDITIONS = { dataSource: "ab76d47e-6580-4eab-abb5-87012c3b81a9", database: "c87f41f89f8142e5b45bb21f66416f6f" };
const TOMES = { dataSource: "bb621014-699d-4209-b488-18f5e53dd3df", database: "8bebb5bd70554da9b2801c132181a521" };
const AUTEURS = { dataSource: "22b1c097-0ff0-496c-9540-26953780c522", database: "bbefc8a1431247788b2445de4265d36b" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const nid = id => String(id || "").replace(/-/g, "");

async function page(token, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } });
  return r.ok ? r.json() : null;
}
const clean = v => String(v || "").replace(/\s*\([^)]*\)/g, "").split(/\s*,\s*|\s+&\s+|\s+et\s+/).map(x => x.trim()).filter(Boolean);

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return json({ error: "NOTION_TOKEN manquant" }, 503);
  const id = nid(new URL(request.url).searchParams.get("id"));
  if (!/^[0-9a-f]{32}$/.test(id)) return json({ error: "id invalide" }, 400);
  return cached(request, waitUntil, "/api/actu?v=4&id=" + id, 600, async () => {
    const T = env.NOTION_TOKEN;
    const n = await page(T, id);
    if (!n || text(n.properties["Statut"]) !== "Publié sur le site") return { serie: null, dernier: null, auteurs: [] };
    const sid = rel(n.properties["Série"])[0];
    const sp = sid ? await page(T, sid) : null;
    if (!sp) return { serie: null, dernier: null, auteurs: [] };
    const p = sp.properties || {};
    const univ = text(p["Univers"]);
    // Les autres parties du même univers (ex. The Fable → The second contact, The third secret).
    const freres = univ ? await queryAll(T, { ...SERIES, body: { filter: { property: "Univers", rich_text: { equals: univ } } } }).catch(() => []) : [];
    const ids = [...new Set([nid(sid), ...freres.map(r => nid(r.id))])].slice(0, 20);
    const titres = [...new Set([text(p["SERIES"]), text(p["Titre FR"])].filter(Boolean))];
    const enCours = freres.map(r => r.properties).filter(q => /en cours/i.test(text(q["Statut Japon"]))).map(q => text(q["SERIES"]));

    // Image de la série : son tome 1 (France, sinon Japon), comme sur la fiche ; l'image de la news seulement en dernier recours (Will, 05/10/2026).
    const edIds = rel(p["Éditions"]);
    const t1P = edIds.length ? Promise.all([
      queryAll(T, { ...EDITIONS, body: { filter: { property: "Série", relation: { contains: nid(sid) } } } }).catch(() => []),
      queryAll(T, { ...TOMES, body: { filter: { or: edIds.map(e => ({ property: "Édition", relation: { contains: e } })) }, sorts: [{ property: "N°", direction: "ascending" }] } }).catch(() => []),
    ]) : Promise.resolve([[], []]);
    const [prepubRel, prepubNom, auteursRows] = await Promise.all([
      queryAll(T, { ...PREPUB, body: { filter: { and: [{ property: "Validé", checkbox: { equals: true } }, { or: ids.map(x => ({ property: "Série", relation: { contains: x } })) }] }, sorts: [{ property: "Date de sortie", direction: "descending" }], page_size: 5 } }).catch(() => []),
      queryAll(T, { ...PREPUB, body: { filter: { and: [{ property: "Validé", checkbox: { equals: true } }, { or: titres.map(t => ({ property: "Entrée", title: { starts_with: t } })) }] }, sorts: [{ property: "Date de sortie", direction: "descending" }], page_size: 5 } }).catch(() => []),
      (async () => {
        const relA = rel(p["Auteurs"]);
        if (relA.length) return (await Promise.all(relA.slice(0, 4).map(a => page(T, a)))).filter(Boolean);
        const noms = [...new Set([...clean(text(p["Scénariste"])), ...clean(text(p["Dessinateur"]))])];
        if (!noms.length) return [];
        return queryAll(T, { ...AUTEURS, body: { filter: { or: noms.map(x => ({ property: "Auteur", title: { equals: x } })) } } }).catch(() => []);
      })(),
    ]);
    const pr = [...prepubRel, ...prepubNom].sort((a, b) => (date(b.properties["Date de sortie"]) || "").localeCompare(date(a.properties["Date de sortie"]) || ""))
      .find(r => /paru/i.test(text(r.properties["Statut"])) || num(r.properties["Chapitre"]) != null);
    let dernier = null;
    if (pr) {
      const q = pr.properties;
      dernier = { entry: text(q["Entrée"]).split(" · ")[0], mag: text(q["Magazine"]), issue: text(q["Numéro"]), date: date(q["Date de sortie"]), ch: num(q["Chapitre"]), status: text(q["Statut"]),
        cover: text(q["Couverture du numéro"]), link: text(q["Lien du numéro"]), page: text(q["Page de la série"]), read: text(q["Lecture en ligne"]), fin: list(q["Mise en avant"]).includes("Dernier chapitre") };
    }
    // Séries des mangakas (titres) : relation « Séries » de la base Auteurs.
    const sIds = [...new Set(auteursRows.flatMap(a => rel(a.properties["Séries"])))].slice(0, 24);
    const sMap = {};
    for (const r of freres) sMap[nid(r.id)] = r.properties;
    await Promise.all(sIds.filter(x => !sMap[x]).map(async x => { const g = await page(T, x); if (g) sMap[x] = g.properties; }));
    const auteurs = auteursRows.map(a => {
      const q = a.properties || {}, name = text(q["Auteur"]);
      const membres = !!(q["Réseaux réservés aux membres"] && q["Réseaux réservés aux membres"].checkbox);
      return { name, slug: slugify(name), jp: text(q["Nom japonais"]), photo: text(q["Photo"]), x: membres ? "" : text(q["X (Twitter)"]), ig: membres ? "" : text(q["Instagram"]),
        series: rel(q["Séries"]).map(x => sMap[x]).filter(Boolean).map(s => ({ t: text(s["SERIES"]), fr: text(s["Titre FR"]), slug: slugSerie(s), visible: estVisible(s) })) };
    }).filter(a => a.name);
    // Comptes X de la série (Twitter Serie) en secours si le mangaka n'en a pas.
    const [edRows, tRows] = await t1P;
    const pays = Object.fromEntries(edRows.map(e => [nid(e.id), text(e.properties["Pays"])]));
    const tomes = tRows.map(r => ({ pays: pays[rel(r.properties["Édition"])[0]] || "", n: num(r.properties["N°"]), cover: text(r.properties["Couverture"]) })).filter(t => t.cover).sort((a, b) => (a.n ?? 999) - (b.n ?? 999));
    const tome1 = ((tomes.find(t => t.pays === "France") || tomes.find(t => t.pays === "Japon") || tomes[0]) || {}).cover || "";
    const twSerie = text(p["Twitter Serie"]);
    const serie = {
      t: text(p["SERIES"]), fr: text(p["Titre FR"]), jp: text(p["Titre Original"]), slug: slugSerie(p), visible: estVisible(p),
      resume: text(p["Résumé"]), genres: list(p["Genre"]), scen: text(p["Scénariste"]), dess: text(p["Dessinateur"]),
      pubJP: text(p["Éditeur Japonais"]), mag: text(p["Magazine"]), stJP: text(p["Statut Japon"]), stFR: text(p["Statut France"]),
      volJP: num(p["Tomes JP"]), volFR: num(p["Tomes FR"]), pubFR: text(p["Éditeur Français"]), anime: text(p["Anime"]), cover: tome1 || text(p["Couverture T1"]),
      univers: univ, enCours: enCours.filter(t => t !== text(p["SERIES"])), relation: text(p["Relation"]),
      x: /x\.com|twitter\.com/.test(twSerie) ? twSerie : "",
    };
    serie.credit = credits(serie, auteurs);
    return { serie, dernier, auteurs };
  });
}
