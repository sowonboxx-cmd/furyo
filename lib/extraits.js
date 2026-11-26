// Pages d'extrait d'une série (Will, 25-26/11/2026) : 5 pages du chapitre 1, choisies dans le calendrier du QG (KV fx:<id>).
// Servent au carrousel « Extrait » des fiches réseaux et à la partie Extrait de la fiche série sur le site.
// Pages posées par Claude tant que Will n'en a pas choisi d'autres.
export const DEPART_EX = {
  "3ebb5e1a634f801aa127dbe7bfbe14d6": { pages: [1, 2, 3, 4, 5].map(i => `/img/extraits/crows/${i}.jpg`), fin: "grille" },
  // Hell Dogs T.1 (Kana) : pages choisies par Will le 26/11/2026 (p. 6, 10, 13, 20 et la dernière page).
  "3ebb5e1a634f80e895d5ee07b38792c1": { pages: [1, 2, 3, 4, 5].map(i => `/img/extraits/hell-dogs/${i}.jpg`), fin: "grille" },
  // Nora wo Tsuku T.1 (Nihon Bungeisha, VO) : pages choisies par Will le 26/11/2026 (p. 1, 3, 20, 22, 28).
  "3ebb5e1a634f80398e33c23c3562a294": { pages: [1, 2, 3, 4, 5].map(i => `/img/extraits/nora-wo-tsuku/${i}.jpg`), fin: "grille" },
};
// Par adresse de la série, quand l'identifiant Notion n'est pas sous la main.
export const DEPART_EX_SLUG = {
  // A-BOUT! T.1 (Akita Shoten, VO) : pages choisies par Will le 26/11/2026, recadrées à la même taille (p. 17, 50, 100, 134, 188).
  "a-bout": { pages: [1, 2, 3, 4, 5].map(i => `/img/extraits/a-bout/${i}.jpg`), fin: "grille" },
};
export async function extraitDe(env, id, slug) {
  const k = String(id || "").replace(/-/g, "");
  const x = env.STATS ? await env.STATS.get("fx:" + k, "json").catch(() => null) : null;
  return x || DEPART_EX[k] || DEPART_EX_SLUG[slug] || null;
}
