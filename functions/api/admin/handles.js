// GET /api/admin/handles?id=<id série> : comptes officiels des auteurs et des éditeurs / magazines d'une série,
// pour mettre les @mentions dans les légendes du Studio (connecté au back-office seulement).
import { text, rel } from "../../../lib/notion.js";
import { json, isAdmin } from "../../../lib/admin.js";

async function page(token, id) {
  const r = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } });
  return r.ok ? r.json() : null;
}
// https://x.com/compte → compte (sans @), pareil pour Instagram et TikTok.
const handle = u => { const m = String(u || "").match(/(?:x|twitter|instagram|tiktok)\.com\/@?([A-Za-z0-9_.]+)/i); return m ? m[1] : ""; };

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[0-9a-f]{32}$/.test(id)) return json({ error: "série inconnue" }, 400);
  const s = await page(env.NOTION_TOKEN, id);
  if (!s) return json({ error: "série introuvable" }, 404);
  const p = s.properties || {};
  const [auteurs, editeurs] = await Promise.all([
    Promise.all(rel(p["Auteurs"]).map(a => page(env.NOTION_TOKEN, a))),
    Promise.all(rel(p["Éditeurs (fiches)"]).map(e => page(env.NOTION_TOKEN, e))),
  ]);
  const acc = q => ({ x: handle(text(q["X (Twitter)"])), ig: handle(text(q["Instagram"])), tt: handle(text(q["TikTok"])) });
  return json({
    auteurs: auteurs.filter(Boolean).map(a => ({ nom: text(a.properties["Auteur"]), role: text(a.properties["Rôle"]), ...acc(a.properties) })),
    editeurs: editeurs.filter(Boolean).map(e => ({ nom: text(e.properties["Nom"]), type: text(e.properties["Type"]), ...acc(e.properties) })),
  });
}
