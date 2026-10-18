// Calendrier éditorial du QG (/hq/#calendrier), réservé aux admins (Will, 18/10/2026).
// Tous les contenus réguliers à publier (site + réseaux), par semaine et par mois, avec des pastilles par type.
// Stocké dans le KV STATS, clé hq:calendrier : { types:[{id,nom,couleur}], events:[...] }.
//   GET  /api/admin/calendrier                         → { ok, types, events }
//   POST { addType:{nom,couleur} }                     → crée une pastille
//   POST { ev:{id?,titre,type,date?,repeat?,note?} }   → crée ou modifie un événement
//   POST { id, fait }                                  → coche publié
//   POST { id, del:true }                              → supprime
import { json, isAdmin } from "../../../lib/admin.js";
const CLE = "hq:calendrier";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
// Pastilles et rendez-vous de départ (Will, 18/10/2026). Will les complète ensuite via Claude.
const DEPART = {
  types: [
    { id: "qn-sem", nom: "Quoi de neuf (semaine)", couleur: "#4C9BFF" },
    { id: "qn-mois", nom: "Quoi de neuf (mois)", couleur: "#B38CFF" },
    { id: "couv", nom: "Couvertures", couleur: "#BC002D" },
    { id: "fiche", nom: "Fiches du mois", couleur: "#F2B33D" },
    { id: "maj", nom: "Fiches mises à jour", couleur: "#7BC67E" },
    { id: "membre", nom: "Membre à l'honneur", couleur: "#F08AC0" },
    { id: "article", nom: "Article", couleur: "#E0955F" },
    { id: "concours", nom: "Concours", couleur: "#E54839" },
    { id: "video", nom: "Vidéo", couleur: "#4DAB9A" },
    { id: "autre", nom: "Autre", couleur: "#98989D" },
  ],
  events: [
    { id: "ev-qn-sem", titre: "Quoi de neuf dans le gang — la semaine (carrousel)", type: "qn-sem", repeat: "lun", note: "Tout ce qui s'est passé la semaine d'avant." },
    { id: "ev-qn-mois", titre: "Quoi de neuf — le mois (studio)", type: "qn-mois", repeat: "mois", note: "Résumé du mois, carrousel studio." },
    { id: "ev-maj", titre: "Fiches mises à jour — récap (studio)", type: "maj", repeat: "jeu", note: "Les séries à aller compléter sur le site." },
    { id: "ev-cxw", titre: "Vidéo Crows×Worst à finir et publier", type: "video", date: "2026-10-19", note: "À finir absolument." },
    { id: "ev-concours", titre: "Publier le concours figurine (fiche prête)", type: "concours", date: "2026-10-21", note: "Mardi ou mercredi." },
  ],
};
async function lire(env) {
  let d = null; try { d = JSON.parse((await env.STATS.get(CLE)) || "null"); } catch (e) {}
  if (!d || !Array.isArray(d.types) || !Array.isArray(d.events)) { d = DEPART; await env.STATS.put(CLE, JSON.stringify(d)); }
  return d;
}
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  if (!env.STATS) return json({ error: "stockage indisponible" }, 503);
  const d = await lire(env);
  return json({ ok: true, types: d.types, events: d.events });
}
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "réservé aux admins" }, 401);
  if (!env.STATS) return json({ error: "stockage indisponible" }, 503);
  const b = await request.json().catch(() => ({}));
  const d = await lire(env);
  if (b.addType && b.addType.nom) {
    d.types.push({ id: uid(), nom: String(b.addType.nom).slice(0, 40), couleur: /^#[0-9a-fA-F]{6}$/.test(b.addType.couleur) ? b.addType.couleur : "#98989D" });
  } else if (b.ev && b.ev.titre) {
    const e = b.ev, rep = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim", "mois", "sem"].includes(e.repeat) ? e.repeat : null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : null;
    const o = { id: e.id && d.events.find(x => x.id === e.id) ? e.id : uid(), titre: String(e.titre).slice(0, 160), type: e.type || "autre", date, repeat: date ? null : rep, note: String(e.note || "").slice(0, 300), fait: !!e.fait };
    const i = d.events.findIndex(x => x.id === o.id);
    if (i >= 0) d.events[i] = o; else d.events.push(o);
  } else if (b.id && b.del) {
    d.events = d.events.filter(x => x.id !== b.id);
  } else if (b.id && "fait" in b) {
    const x = d.events.find(y => y.id === b.id); if (x) x.fait = !!b.fait;
  } else return json({ error: "requête vide" }, 400);
  await env.STATS.put(CLE, JSON.stringify(d));
  return json({ ok: true });
}
