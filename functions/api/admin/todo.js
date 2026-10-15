// To-do du QG (/hq/todo/), réservée aux admins (Will, 15/10/2026). Stockée dans le KV « STATS », clé hq:todo.
//   GET  /api/admin/todo                      → { ok, items: [{ id, t, cat, done, d, fait }] }
//   POST /api/admin/todo { add: { t, cat } }  → ajoute une tâche
//   POST /api/admin/todo { id, done }         → coche / décoche
//   POST /api/admin/todo { id, t?, cat? }     → modifie
//   POST /api/admin/todo { id, del: true }    → supprime
import { json, isAdmin } from "../../../lib/admin.js";
const CLE = "hq:todo";
// Première liste (15/10/2026), reprise des chantiers en cours. Will l'édite ensuite depuis le QG.
const DEPART = [
  ["FuryoGang Magazine : trouver le design (inspiration ATOM), format e-mail d'aperçu + version en ligne façon magazine", "Magazine"],
  ["FuryoGang Magazine : choisir le rythme (mensuel prévu) et le jour d'envoi", "Magazine"],
  ["Premium : retravailler la page /premium/ au plus vite", "Premium"],
  ["Premium : mettre le lien de paiement (abonnement 2 €/mois et soutiens 25 / 50 / 100 €)", "Premium"],
  ["Premium : 30 jours offerts à l'ouverture, données gardées, paiement vers le 15 novembre", "Premium"],
  ["Séries avec des tomes à paraître : passer les fiches en public (11 séries, voir la liste de Claude)", "Base"],
  ["Han-Gure / Hangure : fusionner le doublon (T.16 le 19/11 en double)", "Base"],
  ["Carrousel collection « Gère. Classe. Domine. » : choisir noir, crème ou rouge", "Réseaux"],
  ["Reel collection : valider la version lente ou demander un entre-deux", "Réseaux"],
  ["Profil membre : case « Ne pas me citer sur les réseaux » avant de publier le top collectionneurs", "Site"],
  ["Ressources : croiser le mur d'affiches et les VHS avec la base Films (rubrique À l'écran)", "Ressources"],
  ["Ressources : croiser la chronologie 1980-2003 et BUBKA avec la base Séries", "Ressources"],
];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
async function lire(env) {
  let l = null; try { l = JSON.parse((await env.STATS.get(CLE)) || "null"); } catch (e) {}
  if (!Array.isArray(l)) { const d = new Date().toISOString().slice(0, 10); l = DEPART.map(([t, cat]) => ({ id: uid(), t, cat, done: false, d })); await env.STATS.put(CLE, JSON.stringify(l)); }
  return l;
}
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  if (!env.STATS) return json({ error: "stockage indisponible" }, 503);
  return json({ ok: true, items: await lire(env) });
}
export async function onRequestPost({ request, env }) {
  try {
    if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
    if (!env.STATS) return json({ error: "stockage indisponible" }, 503);
    let b = {}; try { b = await request.json(); } catch (e) {}
    const l = await lire(env), now = new Date().toISOString().slice(0, 10);
    const txt = s => String(s || "").trim().slice(0, 500);
    if (b.add && txt(b.add.t)) l.unshift({ id: uid(), t: txt(b.add.t), cat: txt(b.add.cat).slice(0, 40) || "Divers", done: false, d: now });
    else {
      const i = l.findIndex(x => x.id === b.id); if (i < 0) return json({ error: "tâche introuvable" }, 404);
      if (b.del) l.splice(i, 1);
      else {
        if (typeof b.done === "boolean") { l[i].done = b.done; l[i].fait = b.done ? now : ""; }
        if (typeof b.t === "string" && txt(b.t)) l[i].t = txt(b.t);
        if (typeof b.cat === "string") l[i].cat = txt(b.cat).slice(0, 40) || "Divers";
      }
    }
    await env.STATS.put(CLE, JSON.stringify(l));
    return json({ ok: true, items: l });
  } catch (e) { return json({ error: "erreur serveur : " + String(e && e.message || e).slice(0, 200) }, 500); }
}
