// Communauté (Will, 07/10/2026) : classements des collections, activité des membres, membres suivis.
// Tout est dans le KV « STATS » :
//   bib:<membre>   → la collection (voir functions/api/collection.js), avec h = { "AAAA-MM-JJ": tomes ajoutés ce jour-là (net) }
//                    et cp = { idTome: "F" | "J" } (pays de l'édition, pour le détail FR / JP de la page du membre)
//   ua:<membre>    → activité récente : [{ k: "c" commentaire | "l" j'aime | "a" ajout à la collection, d, … }]
//   um:<membre>    → membres suivis (liste d'identifiants) ; mn:<membre> → nombre d'abonnés
//   rk:hist        → places des classements jour par jour (10 derniers jours), pour les flèches ▲ ▼
export const uid = u => String(u.m || u.k || u.e || "").replace(/[^\w@.-]/g, "").slice(0, 80);

// Date du jour à Paris (AAAA-MM-JJ) : la semaine commence le lundi, le mois le 1er, heure française.
export function jourParis(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function debutSemaine(j = jourParis()) {
  const d = new Date(j + "T12:00:00Z"), w = (d.getUTCDay() + 6) % 7; // lundi = 0
  d.setUTCDate(d.getUTCDate() - w); return d.toISOString().slice(0, 10);
}
export const debutMois = (j = jourParis()) => j.slice(0, 8) + "01";
export function decaler(j, n) { const d = new Date(j + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

// Ajoute une ligne à l'activité d'un membre (60 dernières). Deux ajouts à la collection de la même série
// le même jour sont fusionnés ; un j'aime retiré disparaît de l'activité.
export async function activite(env, id, e) {
  if (!env.STATS || !id) return;
  const k = "ua:" + id;
  let l = []; try { l = JSON.parse((await env.STATS.get(k)) || "[]"); } catch (x) {}
  const d = new Date().toISOString();
  if (e.k === "l-" ) l = l.filter(x => !(x.k === "l" && x.id === e.id));
  else if (e.k === "a" && l[0] && l[0].k === "a" && l[0].s === e.s && l[0].d.slice(0, 10) === d.slice(0, 10)) { l[0].n += e.n; l[0].d = d; }
  else l.unshift({ ...e, d });
  await env.STATS.put(k, JSON.stringify(l.slice(0, 60)));
}
