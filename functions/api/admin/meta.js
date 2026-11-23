// Connexion Instagram (app Meta « FuryoGang Publication », 23/11/2026).
// Le jeton est le secret Cloudflare META_IG_TOKEN (jeton system-user, sans expiration) ; il ne quitte jamais le serveur.
//   GET /api/admin/meta → vérifie le jeton en lisant le profil @furyogang (aucune publication).
import { json, isAdmin } from "../../../lib/admin.js";

export const IG_ID = "17841407727732400"; // @furyogang (pas secret)
const V = "v24.0";

// Essaie l'API Graph Facebook puis l'API Instagram : le jeton « unified login » passe par l'une des deux.
export async function igGet(env, chemin, params = {}) {
  const tok = env.META_IG_TOKEN;
  if (!tok) return { ok: false, err: "META_IG_TOKEN absent" };
  const essais = [];
  for (const base of ["https://graph.facebook.com/" + V, "https://graph.instagram.com/" + V]) {
    const u = new URL(base + chemin);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    u.searchParams.set("access_token", tok);
    const r = await fetch(u.toString());
    const d = await r.json().catch(() => ({}));
    if (r.ok && !d.error) return { ok: true, base, data: d };
    essais.push({ base, status: r.status, err: d.error ? d.error.message : "HTTP " + r.status });
  }
  return { ok: false, essais };
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "admin" }, 401);
  const r = await igGet(env, "/" + IG_ID, { fields: "username,name,followers_count,media_count" });
  return json(r.ok ? { ok: true, api: r.base, profil: r.data } : { ok: false, essais: r.essais || r.err });
}
