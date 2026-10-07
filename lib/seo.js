// Référencement (Google, aperçus de liens sur X, Discord, WhatsApp…).
// Le middleware ajoute à chaque page HTML : favicon, titre et description, adresse canonique, balises de partage
// (Open Graph / Twitter) et données structurées. Les fiches séries passent leurs propres infos (titre, résumé,
// couverture du tome 1) via l'en-tête interne « x-seo », retiré avant d'envoyer la page.
export const SITE = "https://furyogang.com";
export const NOM = "FuryoGang";
export const ACCROCHE = "Au cœur des mangas les plus sombres du Japon";
export const THEMES = "Furyō • Bōsōzoku • Yakuza • Crime • Violence";
const IMAGE = SITE + "/img/og-furyogang.jpg";

// Pages fixes : titre et description pensés pour la recherche (≈ 60 et 155 caractères).
const PAGES = {
  "/": { t: "FuryoGang · Actualité manga furyō, yakuza et crime", d: "Au cœur des mangas les plus sombres du Japon : actualité manga furyō, bōsōzoku, yakuza et crime, sorties Japon et France, extraits officiels et fiches séries.", i: "/img/og/accueil.jpg" },
  "/series/": { t: "Séries manga furyō, yakuza et crime · FuryoGang", d: "Toutes les séries manga furyō, bōsōzoku, yakuza et crime suivies par FuryoGang : résumés, tomes, sorties Japon et France, extraits officiels.", i: "/img/og/series.jpg" },
  "/calendrier/": { t: "Calendrier des sorties manga furyō et yakuza · FuryoGang", d: "Les prochaines sorties de mangas furyō, yakuza et crime, tome par tome, au Japon et en France. Le planning des mangas les plus sombres du Japon.", i: "/img/og/calendrier.jpg" },
  "/auteurs/": { t: "Mangakas furyō, yakuza et crime · FuryoGang", d: "Les mangakas des mangas les plus sombres du Japon : leurs séries furyō, yakuza et crime, et leurs comptes officiels.", i: "/img/og/auteurs.jpg" },
  "/communaute/": { t: "Communauté · FuryoGang", d: "La communauté FuryoGang : nos réseaux, le classement des collections et tous les membres du gang.", i: "/img/og/communaute.jpg" },
  "/films/": { t: "À l'écran : films, dramas et animés furyō et yakuza · FuryoGang", d: "Les films, dramas et animés tirés des mangas furyō, yakuza et crime : bandes-annonces, casting, résumés et où les voir.", i: "/img/og/films.jpg" },
  "/ma-collection/": { t: "Ma collection manga · FuryoGang", d: "Range tes mangas furyō, yakuza et crime tome par tome : ta collection, ta pile à lire, ta wishlist et les tomes qui te manquent.", i: "/img/og/ma-collection.jpg" },
  "/avancement/": { t: "Avancement de la base · FuryoGang", d: "Où en est FuryoGang : les fiches séries en ligne, celles de la semaine et tout ce qui reste à faire." },
  "/crows-x-worst/": { t: "CROWS × WORST : chronologie et ordre de lecture · FuryoGang", d: "Toutes les œuvres CROWS × WORST de Hiroshi Takahashi dans l'ordre des histoires : spin-offs, tomes, auteurs et statuts.", i: "/img/og/crows-x-worst.jpg" },
};
// Pages à ne jamais référencer.
const PRIVE = /^\/(admin|studio|profil|membres-fiche)(\/|$)/;

const attr = s => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
export const couper = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, c.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "").replace(/\s+(de|du|des|la|le|les|à|au|aux|et|en|un|une|sur|pour|par|avec|d'|l')$/i, ""); };

export function infosPage(path) {
  const p = path.endsWith("/") ? path : path + "/";
  return PAGES[p] || null;
}

// Balises à ajouter dans <head>.
export function balises({ titre, desc, url, image, type, jsonld, prive, carte }) {
  const img = image || IMAGE;
  const t = [
    `<link rel="icon" href="/favicon.ico" sizes="48x48">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
  ];
  if (prive) { t.push(`<meta name="robots" content="noindex, nofollow">`); return t.join("\n"); }
  t.push(
    `<link rel="canonical" href="${attr(url)}">`,
    `<meta property="og:site_name" content="${NOM}">`,
    `<meta property="og:locale" content="fr_FR">`,
    `<meta property="og:type" content="${type || "website"}">`,
    `<meta property="og:url" content="${attr(url)}">`,
    `<meta property="og:title" content="${attr(titre)}">`,
    `<meta property="og:description" content="${attr(desc)}">`,
    `<meta property="og:image" content="${attr(img)}">`,
    `<meta property="og:image:alt" content="${attr(titre)}">`,
    `<meta name="twitter:card" content="${carte || "summary_large_image"}">`,
    `<meta name="twitter:site" content="@FuryoGang">`,
    `<meta name="twitter:title" content="${attr(titre)}">`,
    `<meta name="twitter:description" content="${attr(desc)}">`,
    `<meta name="twitter:image" content="${attr(img)}">`,
  );
  for (const j of [].concat(jsonld || [])) t.push(`<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`);
  return t.join("\n");
}

// Données structurées du site (page d'accueil).
export const jsonSite = () => [
  { "@context": "https://schema.org", "@type": "WebSite", name: NOM, alternateName: "Furyo Gang", url: SITE + "/", description: `${ACCROCHE}. ${THEMES}.`, inLanguage: "fr-FR" },
  { "@context": "https://schema.org", "@type": "Organization", name: NOM, url: SITE + "/", logo: SITE + "/img/icon-512.png",
    sameAs: ["https://x.com/FuryoGang", "https://x.com/FuryoSquad"] },
];

// Fiche série : titre, description, image (couverture du tome 1) et données structurées.
export function seoSerie(s, eds, url) {
  const titre = s.fr || s.t;
  const parts = v => String(v || "").replace(/\s*\([^)]*\)/g, "").split(/\s*[,/&]\s*/).map(x => x.trim()).filter(Boolean);
  const auteurs = [...new Set([...parts(s.scen), ...parts(s.dess)])];
  const type = (s.type || "").replace("Manwha", "Manhwa");
  const pubFR = parts(s.pubFR), pubJP = parts(s.pubJP);
  const t1 = p => (eds || []).filter(e => e.pays === p).flatMap(e => e.tomes || []).filter(t => t.cover).sort((a, b) => (a.n ?? 999) - (b.n ?? 999))[0];
  const cover = (t1("France") || t1("Japon"))?.cover || s.cover1 || "";
  const image = cover ? SITE + "/api/couv?u=" + encodeURIComponent(cover) : "";
  const genre = (s.genres || []).slice(0, 2).join(", ").toLowerCase();
  const de = n => (/^[aeiouyhâéèêîôûAEIOUYHÂÉÈÊÎÔÛ]/.test(n) ? "d'" : "de ") + n;
  // Titre : « Hell Dogs (manga) – tomes, sorties, extraits | FuryoGang »
  const t = `${titre} (manga) – tomes, sorties, extraits | ${NOM}`;
  const intro = `${titre}, manga ${type ? type.toLowerCase() + " " : ""}${genre ? genre + " " : ""}${auteurs.length ? de(auteurs.join(" et ")) : ""}${pubFR.length ? `, en France chez ${pubFR.join(", ")}` : pubJP.length ? `, publié au Japon par ${pubJP.join(", ")}` : ""}${s.mag ? ` (prépublication : ${s.mag})` : ""}.`;
  const desc = couper(`${intro} ${s.resume || ""}`, 158);
  const jsonld = [
    { "@context": "https://schema.org", "@type": "ComicSeries", name: titre,
      ...(s.t && s.t !== titre ? { alternateName: [s.t, s.jp].filter(Boolean) } : s.jp ? { alternateName: s.jp } : {}),
      url, description: couper(s.resume || intro, 300), inLanguage: "ja",
      ...(image ? { image } : {}),
      ...(auteurs.length ? { author: auteurs.map(n => ({ "@type": "Person", name: n })) } : {}),
      ...(pubJP.length || pubFR.length ? { publisher: [...pubJP, ...pubFR].map(n => ({ "@type": "Organization", name: n })) } : {}),
      ...(s.genres && s.genres.length ? { genre: s.genres } : {}),
      ...(s.y1 ? { startDate: String(s.y1) } : {}),
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: NOM, item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Séries", item: SITE + "/series/" },
      { "@type": "ListItem", position: 3, name: titre, item: url },
    ] },
  ];
  // Texte lisible dès le chargement (remplacé ensuite par la fiche complète) : titre, infos et résumé.
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const html = `<article class="seo-pre"><h1>${esc(titre)}</h1>${s.jp ? `<p lang="ja">${esc(s.jp)}</p>` : ""}<p>${esc(intro)}</p>${s.resume ? `<p>${esc(s.resume)}</p>` : ""}<p class="empty">Chargement de la fiche…</p></article>`;
  return { titre: t, desc, image, type: "book", jsonld, html, carte: "summary" };
}

// Image absolue (les aperçus de liens n'acceptent pas les adresses relatives).
const abs = u => !u ? "" : /^https?:/.test(u) ? u : SITE + (u.startsWith("/") ? "" : "/") + u;

// News : « Nine Peaks : page couleur pour le 200e chapitre · News manga | FuryoGang », image mise en avant de la news.
export function seoNews(n, url) {
  const titre = n.fr || n.titre || "Actualité";
  const texte = String(n.accroche || n.texte || "").replace(/\s+/g, " ").trim();
  // Première phrase du texte, sans le nom de la série répété en tête.
  let phrase = texte.split(/(?<=[.!?:])\s|\s:\s/)[0].replace(/[.!?:]$/, "").replace(new RegExp("^" + titre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s,:]*", "i"), "");
  if (phrase) phrase = phrase[0].toLowerCase() + phrase.slice(1);
  const t = (phrase ? couper(`${titre} : ${phrase}`, 90) : titre) + ` · ${n.catNom || "Actu"} | ${NOM}`;
  const image = abs(n.cover);
  return { titre: t, desc: couper(texte || `${titre} : l'actualité manga sur ${NOM}.`, 158), image, type: "article", carte: image ? "summary_large_image" : "summary",
    jsonld: [{ "@context": "https://schema.org", "@type": "NewsArticle", headline: couper(`${titre} : ${texte}`, 110), url,
      ...(image ? { image: [image] } : {}), ...(n.date ? { datePublished: n.date } : {}), inLanguage: "fr-FR",
      author: { "@type": "Organization", name: NOM, url: SITE + "/" }, publisher: { "@type": "Organization", name: NOM, logo: { "@type": "ImageObject", url: SITE + "/img/icon-512.png" } },
      ...(n.srcName ? { isBasedOn: n.src || undefined } : {}) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: NOM, item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Actualités", item: SITE + "/?vue=actus" },
        { "@type": "ListItem", position: 3, name: titre, item: url }] }] };
}

// À l'écran : « Crows Zero (film, 2007) – bande-annonce, casting, résumé | FuryoGang », affiche du film ou de la série.
export function seoFilm(f, url) {
  const titre = f.fr || f.t;
  const type = String(f.type || "Film").toLowerCase();
  const t = `${titre} (${type}${f.y ? ", " + f.y : ""}) – bande-annonce, casting, résumé | ${NOM}`;
  const intro = `${titre}, ${type}${f.y ? " de " + f.y : ""}${f.real ? " réalisé par " + f.real : ""}${(f.cast || []).length ? ", avec " + f.cast.slice(0, 3).join(", ") : ""}.`;
  const image = abs(f.img);
  const film = /film/i.test(f.type || "Film");
  return { titre: t, desc: couper(`${intro} ${f.res || ""}`, 158), image, type: film ? "video.movie" : "video.tv_show", carte: "summary_large_image",
    jsonld: [{ "@context": "https://schema.org", "@type": film ? "Movie" : "TVSeries", name: titre, url,
      ...(f.jp && f.jp !== titre ? { alternateName: f.jp } : {}), ...(image ? { image } : {}), ...(f.y ? { dateCreated: String(f.y) } : {}),
      ...(f.real ? { director: { "@type": "Person", name: f.real } } : {}), ...((f.cast || []).length ? { actor: f.cast.slice(0, 6).map(n => ({ "@type": "Person", name: n })) } : {}),
      description: couper(f.res || intro, 300) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: NOM, item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "À l'écran", item: SITE + "/films/" },
        { "@type": "ListItem", position: 3, name: titre, item: url }] }] };
}
