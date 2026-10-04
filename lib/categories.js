// Catégories des news : les mêmes noms et les mêmes couleurs dans Notion (propriété « Catégorie » de la base Veille),
// sur le site, dans le back-office et sur X / Instagram / TikTok. Couleurs : celles de Notion (thème sombre).
export const CATEGORIES = [
  { k: "licence-fr", nom: "Nouvelle licence (France)", c: "#529CCA" },
  { k: "licence-jp", nom: "Nouvelle série (Japon)", c: "#FF7369" },
  { k: "couv-fr", nom: "Couverture française", c: "#9A6DD7" },
  { k: "couv-jp", nom: "Couverture japonaise", c: "#4DAB9A" },
  { k: "sortie-fr", nom: "Sortie française", c: "#E255A1" },
  { k: "sortie-jp", nom: "Sortie japonaise", c: "#FFA344" },
  { k: "fin", nom: "Fin de série", c: "#BA856F" },
  { k: "pause", nom: "Pause", c: "#9B9A97" },
  { k: "anime", nom: "Anime", c: "#FFDC49" },
  { k: "adaptation", nom: "Adaptation", c: "#9B9A97" },
  { k: "bande-annonce", nom: "Bande Annonce", c: "#9A6DD7" },
  { k: "tirage", nom: "Tomes en circulation", c: "#529CCA" },
  { k: "news", nom: "News", c: "#D4D4D8" },
];
export const PAR_NOM = Object.fromEntries(CATEGORIES.map(c => [c.nom, c]));
PAR_NOM["Annonce"] = CATEGORIES.find(c => c.k === "news"); // ancien nom (« Annonce » renommée « News » le 04/10/2026)
export const PAR_CLE = Object.fromEntries(CATEGORIES.map(c => [c.k, c]));
PAR_CLE["annonce"] = PAR_CLE["news"];
// « Catégorie » est un choix multiple dans Notion (« News, Tomes en circulation ») : toutes les catégories connues, dans l'ordre.
export const categoriesDe = cat => String(cat || "").split(/\s*,\s*/).map(n => PAR_NOM[n]).filter(Boolean).filter((c, i, a) => a.indexOf(c) === i);

// Pays d'une proposition : mention explicite, sinon le site de la source officielle.
export function pays(prop, src) {
  if (/\(France\)|\bFR\b|VF/.test(prop)) return "fr";
  if (/\(Japon\)|\bJP\b/.test(prop)) return "jp";
  let h = ""; try { h = new URL(src).hostname; } catch (e) {}
  if (/\.jp$|bookwalker|prtimes/.test(h)) return "jp";
  if (/\.fr$|kana|akata|pika|meian|ki-oon|kioon|delcourt|panini|mangetsu|kazemanga|glenat|kurokawa/.test(h)) return "fr";
  return "jp";
}

// Catégorie d'une ligne de veille : la propriété « Catégorie » si elle est remplie, sinon une proposition déduite
// du type et du titre (null = proposition interne, une simple mise à jour de fiche qui n'est pas une news).
export function categorie({ cat, type, champ = "", prop = "", vp = "", src = "" }) {
  const choisies = categoriesDe(cat);
  if (choisies.length) return choisies[0];
  const p = pays(prop, src), all = `${champ} ${prop}`;
  const k = (() => {
    if (/nouvelle série|新連載/i.test(all) && type === "News") return "licence-jp";
    if (/licence/i.test(all)) return /japon|\bJP\b/i.test(all) ? "licence-jp" : "licence-fr";
    if (/couverture/i.test(prop)) return "couv-" + p;
    if (/termin|final|完結/i.test(`${prop} ${type === "Mise à jour fiche" ? vp : ""}`)) return "fin";
    if (/\bpause\b|hiatus|休載/i.test(prop)) return "pause";
    if (/anime|アニメ/i.test(prop)) return "anime";
    if (/film|drama|oav|adaptation/i.test(prop)) return "adaptation";
    if (type === "Nouvelle édition / tome") return /couverture/i.test(all) ? "couv-" + p : "sortie-" + p;
    if (type === "News") return "news";
    return null;
  })();
  return k ? PAR_CLE[k] : null;
}
