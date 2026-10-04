// GET /api/prepub : les sorties en magazine validées par Will (base « FuryoGang — Prépublication », case Validé).
import { isAdmin } from "../../lib/admin.js";
import { text, num, date, rel, list, queryAll, cached } from "../../lib/notion.js";

const PREPUB = { dataSource: "e4e66558-3cf0-41f1-afc2-5147566cbf3e", database: "f0b7c0f91f4d442597cbbb169b7abbda" };

// Sites officiels des magazines (repli quand « Lien du numéro » est vide).
const MAG_LINK = {
  "Weekly Young Magazine": "https://magazine.yanmaga.jp/ym/",
  "Young Champion": "https://youngchampion.jp/",
  "Champion Cross": "https://championcross.jp/",
  "Weekly Shōnen Champion": "https://www.akitashoten.co.jp/w-champion",
  "Monthly Shōnen Champion": "https://www.akitashoten.co.jp/m-champion",
  "Tonari no Young Jump": "https://tonarinoyj.jp/",
  "Comic Zenon": "https://comic-zenon.com/",
  "Big Comics": "https://bigcomics.jp/",
};

export async function onRequestGet({ env, request, waitUntil }) {
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503 });
  // Quand Will (connecté au back-office) ouvre le site, on reconstruit tout de suite : il voit toujours ses dernières validations.
  if (await isAdmin(request, env).catch(() => false)) request = new Request(new URL(request.url.replace(/[?&]refresh(=[^&]*)?/, "") + (request.url.includes("?") ? "&" : "?") + "refresh=1"), request);
  return cached(request, waitUntil, "/api/prepub", 300, async () => {
    const rows = await queryAll(env.NOTION_TOKEN, { ...PREPUB, body: {
      filter: { property: "Validé", checkbox: { equals: true } },
      sorts: [{ property: "Date de sortie", direction: "descending" }],
      page_size: 60,
    } });
    const items = rows.slice(0, 60).map(r => {
      const p = r.properties || {};
      return {
        entry: text(p["Entrée"]), jp: text(p["Titre au sommaire"]), mag: text(p["Magazine"]), issue: text(p["Numéro"]),
        date: date(p["Date de sortie"]), status: text(p["Statut"]), ch: num(p["Chapitre"]),
        link: text(p["Lien du numéro"]), page: text(p["Page de la série"]), cover: text(p["Couverture du numéro"]),
        read: text(p["Lecture en ligne"]), series: rel(p["Série"]),
        hl: list(p["Mise en avant"]), note: text(p["Annonce du magazine"]),
      };
    });
    // Lien de lecture et page officielle d'une série : repris d'un numéro précédent s'il manque sur le nouveau (la base garde l'historique).
    const k = it => (it.entry || "").split(" · ")[0].toLowerCase();
    const keep = {};
    for (const it of items) { const c = keep[k(it)] = keep[k(it)] || {}; if (it.read && !c.read) c.read = it.read; if (it.page && !c.page) c.page = it.page; }
    for (const it of items) { const c = keep[k(it)] || {}; if (!it.read) it.read = c.read || ""; if (!it.page) it.page = c.page || ""; }
    // Page officielle du magazine quand le numéro n'a pas de lien (Will, 05/10/2026).
    for (const it of items) if (!it.link) { const m = Object.keys(MAG_LINK).find(n => (it.mag || "").toLowerCase().startsWith(n.toLowerCase())); if (m) it.link = MAG_LINK[m]; }
    return { items };
  });
}
