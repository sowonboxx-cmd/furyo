// File d'attente Instagram (Will, 23/11/2026) : posts et stories programmés à l'avance hors news (sorties de tomes…).
// Rangée dans le KV « STATS », clé igq:<id>. La tâche planifiée (/api/cron/reseaux) envoie à l'heure prévue.
//   GET  /api/admin/igq            → { items: [...] } (toutes les programmations, envoyées ou non)
//   GET  /api/admin/igq?id=<id>    → { item | null }
//   POST /api/admin/igq { id, quand, legende, post: [url], story: url, titre, type: "sortie" } → programme
//   … + x: { texte, images: [url] } → le même envoi part aussi sur X (post seul, pas de story) — carrousels hebdo, Will 25/11/2026
//   POST /api/admin/igq { id, del: true } → annule (si pas encore parti)
//   POST /api/admin/igq { id, ignore: true, titre, type } → « Ne pas publier » (Will, 23/11/2026) : rien ne part, la ligne est marquée ignorée
import { json, isAdmin } from "../../../lib/admin.js";

const cle = id => "igq:" + String(id).replace(/[^0-9a-zA-Z_-]/g, "").slice(0, 64);

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (id) return json({ item: await env.STATS.get(cle(id), "json") });
  const l = await env.STATS.list({ prefix: "igq:" });
  const items = (await Promise.all(l.keys.map(k => env.STATS.get(k.name, "json")))).filter(Boolean);
  return json({ items });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const b = await request.json().catch(() => ({}));
  if (!b.id) return json({ error: "id manquant" }, 400);
  const k = cle(b.id), cur = await env.STATS.get(k, "json");
  if (b.del) {
    if (cur && cur.fait) return json({ error: "déjà parti sur Instagram" }, 400);
    // Marque d'annulation dans R2 (cohérent partout) : la tournée ignore toute programmation créée avant (Will, 27/11/2026).
    if (env.COUV) await env.COUV.put("igq/" + String(b.id).replace(/[^0-9a-zA-Z_-]/g, "") + "/annule", new Date().toISOString()).catch(() => {});
    await env.STATS.delete(k); return json({ ok: true });
  }
  if (cur && cur.fait) return json({ error: "déjà parti sur Instagram" }, 400);
  if (b.ignore) {
    const item = { id: String(b.id), type: String(b.type || "").slice(0, 20), titre: String(b.titre || "").slice(0, 160), ignore: true, quand: new Date().toISOString(), cree: new Date().toISOString() };
    await env.STATS.put(k, JSON.stringify(item), { expirationTtl: 60 * 864e2 });
    return json({ ok: true, item });
  }
  const quand = new Date(b.quand); if (isNaN(quand)) return json({ error: "date invalide" }, 400);
  const u = x => (/^https:\/\/\S+$/.test(String(x || "")) ? String(x) : "");
  const post = (Array.isArray(b.post) ? b.post : []).map(u).filter(Boolean).slice(0, 20), story = u(b.story);
  const x = b.x && typeof b.x === "object" ? { texte: String(b.x.texte || "").slice(0, 4000), images: (Array.isArray(b.x.images) ? b.x.images : []).map(u).filter(Boolean).slice(0, 20) } : null;
  if (!post.length && !story && !x) return json({ error: "rien à envoyer (ni post ni story)" }, 400);
  const item = { id: String(b.id), type: String(b.type || "").slice(0, 20), titre: String(b.titre || "").slice(0, 160), quand: quand.toISOString(),
    legende: String(b.legende || "").slice(0, 2200), post, story, ...(x ? { x } : {}), cree: new Date().toISOString() };
  await env.STATS.put(k, JSON.stringify(item), { expirationTtl: 60 * 864e2 }); // gardé 60 jours
  return json({ ok: true, item });
}
