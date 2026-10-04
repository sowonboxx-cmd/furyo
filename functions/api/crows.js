// GET /api/crows : lit la base Notion « FuryoGang — Séries » (Univers = CROWS X WORST)
// et renvoie les champs affichés par la chronologie. Mis en cache 5 minutes.
// Secret requis dans Cloudflare Pages : NOTION_TOKEN (clé d'intégration Notion).

const DATA_SOURCE_ID = "3ebb5e1a-634f-8051-9faf-000be2dabb16";
const DATABASE_ID = "3ebb5e1a634f80f998e3c0fe5b75b6ea";
const FILTER = { property: "Univers", rich_text: { equals: "CROWS X WORST" } };
const CACHE_SECONDS = 300;

const text = p => {
  if (!p) return "";
  const arr = p.title || p.rich_text;
  if (arr) return arr.map(t => t.plain_text).join("").trim();
  if (p.select) return p.select.name || "";
  if (p.multi_select) return p.multi_select.map(o => o.name).join(", ");
  if (p.url !== undefined) return p.url || "";
  if (p.number !== undefined) return p.number;
  return "";
};
const num = p => (p && typeof p.number === "number" ? p.number : null);

async function queryAll(token) {
  const attempts = [
    { url: `https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, version: "2025-09-03" },
    { url: `https://api.notion.com/v1/databases/${DATABASE_ID}/query`, version: "2022-06-28" },
  ];
  let lastErr = "";
  for (const a of attempts) {
    const rows = [];
    let cursor, ok = true;
    do {
      const res = await fetch(a.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": a.version, "Content-Type": "application/json" },
        body: JSON.stringify({ filter: FILTER, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      });
      if (!res.ok) { ok = false; lastErr = `${res.status} ${await res.text()}`; break; }
      const j = await res.json();
      rows.push(...j.results);
      cursor = j.has_more ? j.next_cursor : undefined;
    } while (cursor);
    if (ok) return rows;
  }
  throw new Error(lastErr);
}

function mapRow(r) {
  const p = r.properties || {};
  return {
    nid: r.id,
    edited: r.last_edited_time,
    t: text(p["SERIES"]),
    jp: text(p["Titre Original"]),
    fr: text(p["Titre FR"]),
    frPub: text(p["Éditeur Français"]),
    vol: num(p["Tomes JP"]),
    volFr: num(p["Tomes FR"]),
    stJP: text(p["Statut Japon"]),
    stFR: text(p["Statut France"]),
    story: text(p["Scénariste"]),
    art: text(p["Dessinateur"]),
    mag: text(p["Magazine"]),
    syn: text(p["Résumé"]),
    img: text(p["Couverture T1"]),
    o: num(p["Ordre chrono"]),
    epoque: text(p["Époque"]),
    relation: text(p["Relation"]),
    // Doublons (tomes créés comme des séries) : repérés par « Doublon » dans Relation (la colonne Vérification a été supprimée le 04/10/2026).
    check: /doublon/i.test(text(p["Relation"])) ? "Doublon" : "",
  };
}

export async function onRequestGet({ env, request, waitUntil }) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=60, s-maxage=${CACHE_SECONDS}` };
  if (!env.NOTION_TOKEN) return new Response(JSON.stringify({ error: "NOTION_TOKEN manquant" }), { status: 503, headers });

  const cache = caches.default;
  const key = new Request(new URL("/api/crows", request.url).toString());
  const fresh = new URL(request.url).searchParams.has("refresh");
  if (!fresh) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  try {
    // Une série ajoutée par Claude n'entre dans la chronologie qu'une fois validée par Will
    // (élément « Nouvelle série » encore « À valider » dans la Veille → la série est mise de côté).
    const attente = await fetch("https://api.notion.com/v1/data_sources/d748cac9-fdb0-4d44-87e8-cef34669f0b2/query", {
      method: "POST", headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" },
      body: JSON.stringify({ page_size: 100, filter: { and: [{ property: "Type", select: { equals: "Nouvelle série" } }, { property: "Statut", select: { equals: "À valider" } }] } }),
    }).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }));
    const enAttente = new Set((attente.results || []).flatMap(v => ((v.properties || {})["Série"] || {}).relation || []).map(x => x.id.replace(/-/g, "")));
    const rows = (await queryAll(env.NOTION_TOKEN)).filter(r => !enAttente.has(r.id.replace(/-/g, ""))).map(mapRow);
    const res = new Response(JSON.stringify({ synced: new Date().toISOString(), works: rows }), { headers });
    waitUntil(cache.put(key, res.clone()));
    return res;
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e).slice(0, 400) }), { status: 502, headers });
  }
}
