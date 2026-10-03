// GET /api/admin/me : l'utilisateur est-il connecté en administrateur ? (sert au bouton « Back-office » de l'en-tête du site)
import { json, isAdmin } from "../../../lib/admin.js";
export async function onRequestGet({ request, env }) {
  return json({ admin: await isAdmin(request, env) });
}
