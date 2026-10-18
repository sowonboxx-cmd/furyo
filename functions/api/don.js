// Dons PayPal « Premium avant Premium » (Will, 18/10/2026) : avant d'ouvrir PayPal, le site note qui clique,
// pour que Will retrouve le donateur (QG > Dons). Membres connectés seulement.
//   POST /api/don { montant: "libre" | 25 | 50 | 100 } → { ok, code: "FG-123" }
import { membre } from "../../lib/auth.js";
const CLE = "dons:clics", MAX = 1000;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
export async function onRequestPost({ request, env }) {
  const u = await membre(request, env);
  if (!u || !u.m) return json({ error: "connexion" }, 401);
  const b = await request.json().catch(() => ({}));
  const montant = [25, 50, 100].includes(Number(b.montant)) ? Number(b.montant) : "libre";
  const code = "FG-" + (u.k || String(u.m).replace(/-/g, "").slice(0, 6).toUpperCase());
  let l = []; try { l = JSON.parse((await env.STATS.get(CLE)) || "[]"); } catch (e) {}
  const now = Date.now(), id = String(u.m).replace(/-/g, "");
  // Même membre, même montant, moins de 10 minutes : on ne double pas la ligne.
  const prev = l.find(x => x.m === id && x.montant === montant && now - x.t < 600e3);
  if (prev) prev.t = now;
  else l.unshift({ id: now.toString(36) + Math.random().toString(36).slice(2, 5), t: now, m: id, n: u.n || "", s: u.s || "", e: u.e || "", k: u.k || null, code, montant, fait: false });
  await env.STATS.put(CLE, JSON.stringify(l.slice(0, MAX)));
  return json({ ok: true, code });
}
