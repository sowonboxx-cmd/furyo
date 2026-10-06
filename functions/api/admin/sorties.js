// Back-office « Sorties du jour » (Will, 06/10/2026) : les tomes France / Japon qui sortent aujourd'hui, à poster sur les réseaux.
// GET  /api/admin/sorties          → { today, items: [...] } : aujourd'hui + les 30 jours suivants (séries en ligne, comme le calendrier)
// GET  /api/admin/sorties?count=1  → { n, fr, jp } : sorties d'aujourd'hui pas encore postées (pastille jaune de l'en-tête)
// POST /api/admin/sorties {id, poste} → coche / décoche « Sortie postée » dans la base Tomes.
import { queryAll } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";

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

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const d = await charger(env, request);
  if (new URL(request.url).searchParams.has("count")) {
    const t = d.items.filter(x => x.date === d.today && !x.poste);
    return json({ n: t.length, fr: t.filter(x => x.pays === "France").length, jp: t.filter(x => x.pays === "Japon").length });
  }
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
