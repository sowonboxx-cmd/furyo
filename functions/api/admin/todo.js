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
// Tâches ajoutées par Claude après coup (id fixe) : glissées une seule fois en tête de liste, même si la liste existe déjà.
// « remplace » met à jour le texte d'une tâche existante devenue fausse. Une tâche supprimée par Will ne revient pas.
const AJOUTS = [
  { id: "c171001", t: "Lancement du site : prévu lundi 19 octobre 2026", cat: "Site" },
  { id: "c171002", t: "Premium : lister tout ce que donne le Premium avant d'ouvrir Stripe (reprendre la page /premium/ qui existe déjà)", cat: "Premium" },
  { id: "c171003", t: "Premium : offert à tous les membres jusqu'au 30 novembre 2026, payant à partir du 1er décembre", cat: "Premium", remplace: "Premium : 30 jours offerts à l'ouverture, données gardées, paiement vers le 15 novembre" },
  { id: "c171004", t: "Premium : surprise à annoncer — abonnement à l'année pris avant le 1er décembre = 2 mois offerts", cat: "Premium" },
  { id: "c171005", t: "Premium : après le 1er décembre, 2 € par mois", cat: "Premium" },
  { id: "c171006", t: "Stripe : créer le compte et les liens d'abonnement (mensuel 2 €, annuel avec les 2 mois offerts jusqu'au 30/11)", cat: "Premium" },
  { id: "c171007", t: "Promo : vidéo Crows × Worst (univers, carte dynamique, fiche Crows), 20-25 s, son de la BO de Crows Zero à envoyer (vérifier les droits)", cat: "Réseaux" },
  { id: "c171008", t: "Promo : enchaîner les vidéos par page (accueil, calendrier, collection…) pour le lancement", cat: "Réseaux" },
];
async function lire(env) {
  let l = null; try { l = JSON.parse((await env.STATS.get(CLE)) || "null"); } catch (e) {}
  if (!Array.isArray(l)) { const d = new Date().toISOString().slice(0, 10); l = DEPART.map(([t, cat]) => ({ id: uid(), t, cat, done: false, d })); await env.STATS.put(CLE, JSON.stringify(l)); }
  let vus = []; try { vus = JSON.parse((await env.STATS.get(CLE + ":ajouts")) || "[]"); } catch (e) {}
  const neufs = AJOUTS.filter(a => !vus.includes(a.id));
  if (neufs.length) {
    const d = new Date().toISOString().slice(0, 10);
    for (const a of neufs.slice().reverse()) {
      const old = a.remplace ? l.find(x => x.t === a.remplace) : null;
      if (old) { old.t = a.t; old.cat = a.cat; } else if (!l.some(x => x.id === a.id)) l.unshift({ id: a.id, t: a.t, cat: a.cat, done: false, d });
    }
    await env.STATS.put(CLE, JSON.stringify(l));
    await env.STATS.put(CLE + ":ajouts", JSON.stringify(vus.concat(neufs.map(a => a.id))));
  }
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
