// Couverture du dernier tome paru d'une série, pour les news « Tomes en circulation » (Will, 26/10/2026) :
// la bannière se voyait mal, on montre la couverture. Une saga compte toutes ses parties (The Fable → The second contact,
// The third secret) : on prend aussi les suites dont l'« Œuvre mère » est la série, puis le tome paru le plus récent,
// édition japonaise d'abord, sinon française.
import { queryAll, text } from "./notion.js";
import { editionsParSerie } from "./memo.js";

const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
const nid = id => String(id || "").replace(/-/g, "");
const local = u => String(u || "").replace(/^https?:\/\/(www\.)?(furyogang\.com|furyo\.pages\.dev)(?=\/)/, "");
const norm = x => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");

export async function derniersTomes(env, waitUntil, sids) {
  sids = (sids || []).map(nid).filter(x => /^[0-9a-f]{32}$/.test(x)).slice(0, 20);
  if (!sids.length) return {};
  const [eds, sRows] = await Promise.all([
    editionsParSerie(env, waitUntil).catch(() => ({})),
    queryAll(env.NOTION_TOKEN, { ...SERIES }).catch(() => []),
  ]);
  const nomDe = {}, filles = {};
  for (const r of sRows) { const p = r.properties || {}, id = nid(r.id); nomDe[id] = text(p["SERIES"]);
    const m = norm(text(p["Œuvre mère"])); if (m) (filles[m] = filles[m] || []).push(id); }
  const auj = new Date().toISOString().slice(0, 10), out = {};
  for (const sid of sids) {
    const fam = [sid, ...(filles[norm(nomDe[sid])] || [])];
    for (const pays of ["Japon", "France"]) {
      let best = null;
      for (const id of fam) for (const e of (eds[id] || [])) if (e.pays === pays) for (const t of e.tomes)
        if (t.cover && (t.paru || (t.date && t.date <= auj)) && (!best || (t.date || "") > (best.date || "") || ((t.date || "") === (best.date || "") && t.n > best.n))) best = t;
      if (best) { out[sid] = { cover: local(best.cover), n: best.n, pays }; break; }
    }
  }
  return out;
}
