// Petits outils partagés pour lire les bases Notion depuis les fonctions Cloudflare Pages.
export const text = p => {
  if (!p) return "";
  const arr = p.title || p.rich_text;
  if (arr) return arr.map(t => t.plain_text).join("").trim();
  if (p.select) return p.select.name || "";
  if (p.multi_select) return p.multi_select.map(o => o.name).join(", ");
  if (p.url !== undefined) return p.url || "";
  if (p.number !== undefined) return p.number;
  return "";
};
export const num = p => (p && typeof p.number === "number" ? p.number : null);
export const date = p => (p && p.date && p.date.start) || "";
export const check = p => !!(p && p.checkbox);
export const rel = p => (p && p.relation ? p.relation.map(r => r.id.replace(/-/g, "")) : []);
export const list = p => (p && p.multi_select ? p.multi_select.map(o => o.name) : []);

// Interroge une base (API data_sources récente, sinon ancienne API databases), toutes les pages.
export async function queryAll(token, { dataSource, database, body = {} }) {
  const attempts = [
    { url: `https://api.notion.com/v1/data_sources/${dataSource}/query`, version: "2025-09-03" },
    { url: `https://api.notion.com/v1/databases/${database}/query`, version: "2022-06-28" },
  ];
  let lastErr = "";
  for (const a of attempts) {
    const rows = [];
    let cursor, ok = true;
    do {
      const res = await fetch(a.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": a.version, "Content-Type": "application/json" },
        body: JSON.stringify({ page_size: 100, ...body, ...(cursor ? { start_cursor: cursor } : {}) }),
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

// Réponse JSON mise en cache à la périphérie (5 min par défaut, ?refresh pour forcer).
export async function cached(request, waitUntil, key, seconds, build) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=60, s-maxage=${seconds}` };
  const cache = caches.default;
  const k = new Request(new URL(key, request.url).toString());
  if (!new URL(request.url).searchParams.has("refresh")) {
    const hit = await cache.match(k);
    if (hit) return hit;
  }
  try {
    const data = await build();
    const res = new Response(JSON.stringify({ synced: new Date().toISOString(), ...data }), { headers });
    waitUntil(cache.put(k, res.clone()));
    return res;
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e).slice(0, 400) }), { status: 502, headers });
  }
}

export const slugify = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
