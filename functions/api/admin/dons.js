// QG > Dons (Will, 18/10/2026) : les membres qui ont cliqué « Je soutiens » sur la page Premium avant d'aller sur PayPal.
//   GET  /api/admin/dons               → { ok, dons: [{ id, t, n, s, e, k, code, montant, fait }] }
//   POST /api/admin/dons { id, fait }  → coche « traité » (badge et Premium posés)
//   POST /api/admin/dons { id, del }   → supprime la ligne
import { json, isAdmin } from "../../../lib/admin.js";
const CLE = "dons:clics";
const lire = async env => { try { return JSON.parse((await env.STATS.get(CLE)) || "[]"); } catch (e) { return []; } };
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  return json({ ok: true, dons: await lire(env) });
}
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  const b = await request.json().catch(() => ({}));
  let l = await lire(env);
  const x = l.find(d => d.id === b.id);
  if (!x) return json({ error: "introuvable" }, 404);
  if (b.del) l = l.filter(d => d.id !== b.id); else x.fait = !!b.fait;
  await env.STATS.put(CLE, JSON.stringify(l));
  return json({ ok: true });
}
