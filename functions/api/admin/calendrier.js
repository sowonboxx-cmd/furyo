// Calendrier éditorial du QG (/hq/#calendrier), réservé aux admins (Will, 18-19/10/2026).
// Tout ce qu'il y a à publier (site + réseaux), en vue liste par semaine ou par mois, avec une pastille par type.
// Stocké dans le KV STATS, clé hq:calendrier : { sv, types:[{id,nom,couleur}], events:[...] }.
//   GET  /api/admin/calendrier                         → { ok, types, events }
//   POST { addType:{nom,couleur} }                     → crée une pastille
//   POST { ev:{id?,titre,type,date?,repeat?,jour?,lien?,note?,imp?,tirage?,visuels?,textes?} } → crée / modifie
//     jour : jour du mois (1-28) pour repeat "mois" ; lien : raccourci ouvert depuis l'événement (ex. /studio/mois/)
//   POST { id, fait }                                  → coche publié
//   POST { id, del:true }                              → supprime
// Un événement peut porter : imp (important), tirage (texte), visuels (liste d'URL), textes {ig,tw,tiktok}.
import { json, isAdmin } from "../../../lib/admin.js";
const CLE = "hq:calendrier";
const SEED_V = 6; // bump → rejoue la migration des rendez-vous de départ (garde les ajouts de Will)
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Textes prêts à publier pour le concours figurine (validés avec Will, 18/10).
const CONCOURS_TEXTES = {
  ig: "🎁 CONCOURS — GAGNE LA FIGURINE 🎁\n\nHanaki Guriko, Crows×Worst — Flash Back Generation. Neuve, scellée, importée du Japon. 38 cm. Édition limitée Regulus.\n\n✅ Membre sur furyogang.com (avant le 30/11)\n✅ Like + partage · ✅ Mentionne un pote\n🎲 Tirage le 30 novembre · 📦 envoi offert\n\nInscris-toi maintenant… ou pleure plus tard. 🥀",
  tw: "🎁 CONCOURS 🎁 Gagne la figurine Hanaki Guriko — Crows×Worst. 38 cm, neuve, scellée, édition limitée.\n✅ Membre sur furyogang.com (avant 30/11) · 🔁 RT + ❤️ · 🎲 Tirage le 30/11",
  tiktok: "🎁 CONCOURS FURYOGANG 🎁\nUne figurine Hanaki Guriko (Crows×Worst), 38 cm, neuve et scellée, à gagner.\nPour participer : abonne-toi, like, et va t'inscrire sur furyogang.com (gratuit) avant le 30/11.\nTirage le 30 novembre. 📦 envoi offert.\n#crows #worst #furyo #manga #figurine #concours",
};

// Pastilles et rendez-vous de départ (Will). Will les complète ensuite via Claude.
const DEPART = {
  sv: SEED_V,
  types: [
    { id: "qn-sem", nom: "News Hebdo", couleur: "#4C9BFF" },
    { id: "qn-mois", nom: "Sorties du mois", couleur: "#B38CFF" },
    { id: "couv", nom: "Couvertures", couleur: "#BC002D" },
    { id: "fiche", nom: "Fiches du mois", couleur: "#F2B33D" },
    { id: "maj", nom: "Fiches mises à jour", couleur: "#7BC67E" },
    { id: "mangaka", nom: "Fiche mangaka", couleur: "#C77DD6" },
    { id: "membre", nom: "Membre à l'honneur", couleur: "#F08AC0" },
    { id: "article", nom: "Article", couleur: "#E0955F" },
    { id: "concours", nom: "Concours", couleur: "#E54839" },
    { id: "video", nom: "Vidéo", couleur: "#4DAB9A" },
    { id: "autre", nom: "Autre", couleur: "#98989D" },
  ],
  events: [
    { id: "ev-qn-sem", titre: "Quoi de neuf dans le gang", type: "qn-sem", repeat: "lun", note: "News Hebdo — carrousel réseaux : tout ce qui s'est passé la semaine d'avant. Généré dans La Fabrique." },
    { id: "ev-qn-mois", titre: "Récap du mois", type: "qn-mois", repeat: "mois", jour: 10, lien: "/studio/mois/", note: "Le 10 de chaque mois : récap des sorties du mois précédent (France + Japon). Choisis la cover en avant et exporte le carrousel directement dans le studio (lien ci-dessous). Visuel noir ou crème." },
    { id: "ev-maj", titre: "Fiches mises à jour — récap", type: "maj", repeat: "jeu", note: "Les séries à aller compléter sur le site." },
    { id: "ev-cxw", titre: "Vidéo Crows×Worst", type: "video", date: "2026-10-20", imp: true, note: "Finir la version 25-30 s (téléphone, bordures) et la publier." },
    {
      id: "ev-concours", titre: "Concours figurine", type: "concours", date: "2026-10-21", imp: true,
      note: "Publier le visuel du concours (fiche prête). Lot : figurine Hanaki Guriko, Crows×Worst, édition limitée.",
      tirage: "30 novembre", visuels: ["/hq/concours/poster.jpg", "/hq/concours/car1.jpg", "/hq/concours/car2.jpg"],
      textes: CONCOURS_TEXTES,
    },
  ],
};

const RJ = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim", "mois", "sem"];
function nettEv(e, old) {
  old = old || {};
  const rep = RJ.includes(e.repeat) ? e.repeat : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : null;
  const textes = e.textes && typeof e.textes === "object"
    ? { ig: String(e.textes.ig || "").slice(0, 2000), tw: String(e.textes.tw || "").slice(0, 2000), tiktok: String(e.textes.tiktok || "").slice(0, 2000) }
    : (old.textes || null);
  const visuels = Array.isArray(e.visuels) ? e.visuels.map(u => String(u || "").slice(0, 300)).filter(Boolean).slice(0, 8) : (old.visuels || null);
  // Jour du mois pour une récurrence mensuelle (1 à 28, défaut 1). Lien direct (studio, page…) ouvert depuis l'événement.
  const jourIn = Number.isInteger(e.jour) && e.jour >= 1 && e.jour <= 28 ? e.jour : null;
  const jour = jourIn != null ? jourIn : (old.jour || null);
  const lien = typeof e.lien === "string" ? (/^(\/|https?:\/\/)/.test(e.lien) ? e.lien.slice(0, 300) : (e.lien === "" ? null : (old.lien || null))) : (old.lien || null);
  return {
    id: old.id || uid(),
    titre: String(e.titre).slice(0, 160),
    type: e.type || old.type || "autre",
    date, repeat: date ? null : rep,
    jour: (!date && rep === "mois") ? jour : null,
    lien,
    note: String(e.note != null ? e.note : (old.note || "")).slice(0, 600),
    imp: "imp" in e ? !!e.imp : !!old.imp,
    tirage: String(e.tirage != null ? e.tirage : (old.tirage || "")).slice(0, 80),
    visuels, textes,
    fait: "fait" in e ? !!e.fait : !!old.fait,
  };
}

// Migration NON DESTRUCTIVE (Will, 20/10/2026) : on garde TOUT ce que Will a réglé sur un rendez-vous
// existant (date, jour de répétition, jour du mois, « publié », notes…). On ajoute seulement les nouveaux
// rendez-vous manquants et les NOUVEAUX champs (lien, jour) encore absents. Un bump de SEED_V ne doit plus
// jamais remettre ses déplacements en place.
function migrer(d) {
  const parId = new Map(d.events.map(e => [e.id, e]));
  for (const seed of DEPART.events) {
    const ex = parId.get(seed.id);
    if (!ex) { d.events.push(JSON.parse(JSON.stringify(seed))); continue; }
    if (ex.lien == null && seed.lien != null) ex.lien = seed.lien;
    if (ex.jour == null && seed.jour != null && ex.repeat === "mois") ex.jour = seed.jour;
  }
  // « Récap du mois » : titre et note alignés tant que Will ne les a pas personnalisés (ancienne note « vers le 15 »).
  const rm = parId.get("ev-qn-mois"), seedRm = DEPART.events.find(e => e.id === "ev-qn-mois");
  if (rm && seedRm && /vers le 15/.test(rm.note || "")) { rm.titre = seedRm.titre; rm.note = seedRm.note; }
  // Types : ajoute les manquants + met à jour les noms (cosmétique, aucune donnée de Will).
  const typById = new Map(d.types.map(t => [t.id, t]));
  for (const t of DEPART.types) { const ex = typById.get(t.id); if (ex) ex.nom = t.nom; else d.types.push(JSON.parse(JSON.stringify(t))); }
  d.sv = SEED_V;
  return d;
}

async function lire(env) {
  let d = null; try { d = JSON.parse((await env.STATS.get(CLE)) || "null"); } catch (e) {}
  if (!d || !Array.isArray(d.types) || !Array.isArray(d.events)) {
    d = JSON.parse(JSON.stringify(DEPART));
    await env.STATS.put(CLE, JSON.stringify(d));
    return d;
  }
  if (d.sv !== SEED_V) { d = migrer(d); await env.STATS.put(CLE, JSON.stringify(d)); }
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
    const e = b.ev, old = e.id ? d.events.find(x => x.id === e.id) : null;
    const o = nettEv(e, old);
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
