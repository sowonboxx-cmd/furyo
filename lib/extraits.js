// Pages d'extrait d'une série (Will, 25-26/11/2026) : 5 pages du chapitre 1, choisies dans le calendrier du QG (KV fx:<id>).
// Servent au carrousel « Extrait » des fiches réseaux et à la partie Extrait de la fiche série sur le site.
// Pages posées par Claude tant que Will n'en a pas choisi d'autres.
export const DEPART_EX = { "3ebb5e1a634f801aa127dbe7bfbe14d6": { pages: [1, 2, 3, 4, 5].map(i => `/img/extraits/crows/${i}.jpg`), fin: "grille" } };
export async function extraitDe(env, id) {
  const k = String(id || "").replace(/-/g, "");
  const x = env.STATS ? await env.STATS.get("fx:" + k, "json").catch(() => null) : null;
  return x || DEPART_EX[k] || null;
}
