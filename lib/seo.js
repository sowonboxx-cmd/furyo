// Référencement (Google, aperçus de liens sur X, Discord, WhatsApp…).
// Le middleware ajoute à chaque page HTML : favicon, titre et description, adresse canonique, balises de partage
// (Open Graph / Twitter) et données structurées. Les fiches séries passent leurs propres infos (titre, résumé,
// couverture du tome 1) via l'en-tête interne « x-seo », retiré avant d'envoyer la page.
export const SITE = "https://furyogang.com";
export const NOM = "FuryoGang";
export const ACCROCHE = "Le média des mangas les plus sombres du Japon";
export const THEMES = "Furyō • Yakuza • Crime • Pègre";
// Carte de partage validée par Will le 17/10/2026 (« Les mangas les plus sombres du Japon », mur de couvertures).
const IMAGE = SITE + "/img/og/furyogang-2026-10.jpg";

// Pages fixes : titre et description pensés pour la recherche (≈ 60 et 155 caractères).
const PAGES = {
  "/": { t: "FuryoGang · Les mangas les plus sombres du Japon", d: "Furyō, yakuza, crime et pègre : l'actualité des mangas les plus sombres du Japon, les séries, les films, les sorties au Japon et en France, et ta collection.", i: "/img/og/furyogang-2026-10.jpg" },
  "/series/": { t: "Séries manga furyō, yakuza et crime · FuryoGang", d: "Toutes les séries manga furyō, bōsōzoku, yakuza et crime suivies par FuryoGang : résumés, tomes, sorties Japon et France, extraits officiels.", i: "/img/og/series-2026-10.jpg" },
  "/calendrier/": { t: "Calendrier des sorties manga furyō et yakuza · FuryoGang", d: "Les prochaines sorties de mangas furyō, yakuza et crime, tome par tome, au Japon et en France. Le planning des mangas les plus sombres du Japon.", i: "/img/og/calendrier-2026-10.jpg" },
  "/auteurs/": { t: "Mangakas furyō, yakuza et crime · FuryoGang", d: "Les mangakas des mangas les plus sombres du Japon : leurs séries furyō, yakuza et crime, et leurs comptes officiels.", i: "/img/og/auteurs-2026-10.jpg" },
  "/communaute/": { t: "Communauté manga furyō et yakuza · FuryoGang", d: "La communauté FuryoGang : nos réseaux, le classement des plus grosses collections de mangas furyō et yakuza, et tous les membres du gang.", i: "/img/og/communaute-2026-10.jpg" },
  "/films/": { t: "À l'écran : films, dramas et animés furyō et yakuza · FuryoGang", d: "Les films, dramas et animés tirés des mangas furyō, yakuza et crime : bandes-annonces, casting, résumés et où les voir.", i: "/img/og/films-2026-10.jpg" },
  "/ma-collection/": { t: "Ma collection manga furyō et yakuza · FuryoGang", d: "Gère ta collection de mangas furyō, yakuza et crime tome par tome : tomes possédés, lus, envies de lecture et panier, en VF et en VO.", i: "/img/og/ma-collection-2026-10.jpg" },
  "/avancement/": { t: "Avancement de la base · FuryoGang", d: "Où en est FuryoGang : les fiches séries en ligne, celles de la semaine et tout ce qui reste à faire." },
  // Page « Au Japon » (Will, 12/10/2026) : prépublications ; « j » = données structurées (page + FAQ pour la recherche et les IA).
  "/japon/": { t: "Actualité manga au Japon : magazines et prépublications · FuryoGang", d: "L'actualité manga en direct du Japon : les chapitres de nos séries furyō, yakuza et crime dans Young Champion, Young King, Goraku et Young Magazine.", i: "/img/og/japon-2026-10.jpg",
    j: [
      { "@context": "https://schema.org", "@type": "CollectionPage", name: "L'actualité manga au Japon", url: "https://furyogang.com/japon/", inLanguage: "fr-FR",
        description: "Les derniers numéros des magazines de prépublication japonais et les chapitres des séries furyō, yakuza et crime suivies par FuryoGang.",
        isPartOf: { "@type": "WebSite", name: "FuryoGang", url: "https://furyogang.com/" },
        about: ["Weekly Shōnen Champion", "Monthly Shōnen Champion", "Young Champion", "Bessatsu Young Champion", "Young King", "Young King BULL", "Weekly Young Magazine", "Weekly Manga Goraku", "Big Comic Spirits"].map(n => ({ "@type": "Periodical", name: n })) },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: "Qu'est-ce que la prépublication d'un manga ?", acceptedAnswer: { "@type": "Answer", text: "Au Japon, un manga paraît d'abord chapitre par chapitre dans un magazine, chaque semaine, deux fois par mois ou chaque mois. Quand assez de chapitres sont sortis, l'éditeur les réunit en tome relié, qui arrive ensuite en librairie, puis parfois en France." } },
        { "@type": "Question", name: "Dans quels magazines paraissent les mangas furyō et yakuza ?", acceptedAnswer: { "@type": "Answer", text: "Surtout chez Akita Shoten (Weekly et Monthly Shōnen Champion, Young Champion, Bessatsu Young Champion), Shōnen Gahōsha (Young King, Young King BULL), Kodansha (Weekly Young Magazine), Nihon Bungeisha (Weekly Manga Goraku) et Shōgakukan (Big Comic Spirits)." } },
        { "@type": "Question", name: "Quand sortent les magazines japonais ?", acceptedAnswer: { "@type": "Answer", text: "Weekly Shōnen Champion le jeudi, Weekly Young Magazine et Big Comic Spirits le lundi, Weekly Manga Goraku le vendredi, Young King les 2e et 4e lundis, Young Champion les 2e et 4e mardis, Bessatsu Young Champion le 1er mardi du mois et Monthly Shōnen Champion le 6 du mois." } },
      ] },
    ] },
  "/crows-x-worst/": { t: "CROWS × WORST : chronologie et ordre de lecture · FuryoGang", d: "Toutes les œuvres CROWS × WORST de Hiroshi Takahashi dans l'ordre des histoires : spin-offs, tomes, auteurs et statuts.", i: "/img/og/crows-x-worst-2026-10.jpg" },
};
// /?vue=actus : carte « L'actu des mangas les plus sombres » (Will, 17/10/2026).
export const OG_ACTUS = "/img/og/actualites-2026-10.jpg";
// Cartes de partage des fiches (séries, films, actus), générées à l'avance dans /img/og/f/ (Will, 17/10/2026).
// Si la carte d'une fiche n'existe pas encore, on garde l'ancienne image (couverture, affiche, image de la news).
export const ogFiche = (k, id) => `/img/og/f/${k}-${id}.jpg`;
// Pages à ne jamais référencer.
const PRIVE = /^\/(admin|studio|profil|membres-fiche)(\/|$)/;

const attr = s => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
export const couper = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, c.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "").replace(/\s+(de|du|des|la|le|les|à|au|aux|et|en|un|une|sur|pour|par|avec|d'|l')$/i, ""); };

export function infosPage(path) {
  const p = path.endsWith("/") ? path : path + "/";
  // Récap du mois (/recap/AAAA-MM/) : titre, description et image de partage générés depuis le mois.
  const r = p.match(/^\/recap\/(?:mois\/)?(\d{4})-(\d{2})\/$/);
  if (r) {
    const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const nom = MOIS[+r[2] - 1] || "";
    return {
      t: `Sorties de ${nom} ${r[1]} — Le récap du mois · FuryoGang`,
      d: `Toutes les sorties manga de ${nom} ${r[1]}, France et Japon : furyō, yakuza, combat, crime. Clique sur une couverture pour l'ajouter à ta collection FuryoGang.`,
      i: `/img/og/recap-${r[1]}-${r[2]}.jpg?v=2`,
    };
  }
  // Récap de la semaine (/recap/semaine/AAAA-SS/) : « Quoi de neuf dans le gang ? » (Will, 26/10/2026).
  const w = p.match(/^\/recap\/semaine\/(\d{4})-(\d{2})\/$/);
  if (w) {
    return {
      t: `Quoi de neuf dans le gang ? Semaine ${+w[2]} — Le récap de la semaine · FuryoGang`,
      d: `Le récap de la semaine ${+w[2]} (${w[1]}) : les sorties manga au Japon et en France, les chapitres en magazine, les actus à ne pas rater et les nouvelles fiches FuryoGang.`,
      i: `/api/ogcard/semaine-${w[1]}-${w[2]}.jpg`, // générée par le studio Quoi de neuf (maquette A), sinon l'image du site
    };
  }
  return PAGES[p] || null;
}

// Texte lisible sans JavaScript (Google, aperçus, IA) pour les pages de liste, et leurs données structurées
// (Will, 17/10/2026). Le texte est placé en fin de page, masqué à l'écran : il décrit exactement ce que la page affiche.
const ex = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MCOURT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const RUBRIQUES = `<ul><li><a href="/?vue=actus">Actualités</a> : nouveaux tomes, couvertures, nouvelles licences françaises, fins de série et chiffres de vente.</li><li><a href="/series/">Séries</a> : la fiche de chaque manga, avec les tomes français et japonais et les extraits officiels.</li><li><a href="/films/">À l'écran</a> : les films, dramas et animés tirés de ces mangas.</li><li><a href="/calendrier/">Calendrier des sorties</a> : les prochains tomes, au Japon et en France.</li><li><a href="/japon/">Au Japon</a> : les chapitres en prépublication dans les magazines japonais.</li><li><a href="/ma-collection/">Ma collection</a> : tes tomes possédés, lus, tes envies et ton panier.</li><li><a href="/crows-x-worst/">CROWS × WORST</a> : la chronologie de l'univers d'Hiroshi Takahashi.</li></ul>`;
async function api(origin, path) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), 1500);
  try { const r = await fetch(origin + path, { signal: c.signal, headers: { cookie: "" } }); return r.ok ? await r.json() : null; } catch (e) { return null; } finally { clearTimeout(t); }
}
const page = (url, name, description, extra) => ({ "@context": "https://schema.org", "@type": "CollectionPage", name, url, description, inLanguage: "fr-FR",
  isPartOf: { "@type": "WebSite", name: NOM, url: SITE + "/" }, ...(extra || {}) });
const liste = (items, url) => ({ "@type": "ItemList", numberOfItems: items.length, itemListElement: items.slice(0, 200).map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: x.url })) });
export async function texteFixe(path, origin) {
  const p = path.endsWith("/") ? path : path + "/", info = PAGES[p]; if (!info) return null;
  const url = SITE + p, wrap = h => `<section class="seo-txt" style="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:normal">${h}</section>`;
  if (p === "/") return { html: wrap(`<h2>FuryoGang, le média des mangas les plus sombres du Japon</h2><p>FuryoGang suit les mangas furyō (voyous et yankees japonais), bōsōzoku, yakuza, crime et pègre, au Japon comme en France. Les informations viennent des éditeurs, des magazines de prépublication et des plateformes officielles.</p>${RUBRIQUES}`) };
  if (p === "/series/") {
    const d = await api(origin, "/api/series"), it = ((d && d.items) || []).filter(x => x.slug).map(x => ({ name: x.fr || x.t, url: SITE + "/series/" + x.slug, jp: x.jp, type: x.type, y: x.y1, fr: x.inFR == 1 }));
    return { jsonld: [page(url, "Séries manga furyō, yakuza et crime", info.d, it.length ? { mainEntity: liste(it) } : {})],
      html: wrap(`<h2>Toutes les séries suivies par FuryoGang</h2><p>${it.length || "Les"} séries manga furyō, yakuza, crime et pègre, avec pour chacune les auteurs, l'éditeur japonais et français, le magazine de prépublication, la liste des tomes et leurs dates de sortie, les extraits officiels et les adaptations.</p><ul>${it.map(x => `<li><a href="${ex(x.url)}">${ex(x.name)}</a>${x.jp ? ` (${ex(x.jp)})` : ""}${x.type ? `, ${ex(x.type).toLowerCase()}` : ""}${x.y ? `, depuis ${ex(x.y)}` : ""}${x.fr ? ", disponible en français" : ""}</li>`).join("")}</ul>`) };
  }
  if (p === "/films/") {
    const d = await api(origin, "/api/films"), it = ((d && d.items) || []).map(x => ({ name: x.fr || x.t, url: SITE + "/films/" + x.slug, type: x.type, y: x.y, real: x.real }));
    return { jsonld: [page(url, "Films, dramas et animés furyō et yakuza", info.d, it.length ? { mainEntity: liste(it) } : {})],
      html: wrap(`<h2>À l'écran : les adaptations des mangas furyō et yakuza</h2><p>Les films en prises de vues réelles, dramas et animés tirés des mangas furyō, yakuza et crime, avec bande-annonce, casting, résumé et lien vers le manga d'origine.</p><ul>${it.map(x => `<li><a href="${ex(x.url)}">${ex(x.name)}</a>${x.type ? ` (${ex(x.type).toLowerCase()}${x.y ? ", " + ex(x.y) : ""})` : ""}${x.real ? `, réalisé par ${ex(x.real)}` : ""}</li>`).join("")}</ul>`) };
  }
  if (p === "/auteurs/") {
    const d = await api(origin, "/api/auteurs"), it = ((d && d.authors) || []).filter(x => x.slug).map(x => ({ name: x.name, url: SITE + "/auteurs/" + x.slug, jp: x.jp, s: (x.series || []).map(s => s.fr || s.t).filter(Boolean) }));
    return { jsonld: [page(url, "Mangakas furyō, yakuza et crime", info.d, it.length ? { mainEntity: liste(it) } : {})],
      html: wrap(`<h2>Les mangakas des mangas les plus sombres du Japon</h2><p>Pour chaque mangaka : nom japonais, rôle (scénario ou dessin), séries et comptes officiels.</p><ul>${it.map(x => `<li><a href="${ex(x.url)}">${ex(x.name)}</a>${x.jp ? ` (${ex(x.jp)})` : ""}${x.s.length ? ` : ${ex(x.s.slice(0, 4).join(", "))}` : ""}</li>`).join("")}</ul>`) };
  }
  if (p === "/calendrier/") {
    const d = await api(origin, "/api/calendrier"), today = new Date().toISOString().slice(0, 10);
    const it = ((d && d.items) || []).filter(x => x.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 40);
    const dt = s => { const x = new Date(s + "T12:00:00"); return `${x.getDate()} ${MCOURT[x.getMonth()]} ${x.getFullYear()}`; };
    return { jsonld: [page(url, "Calendrier des sorties manga furyō et yakuza", info.d)],
      html: wrap(`<h1>Prochaines sorties de mangas furyō, yakuza et crime</h1><p>Les tomes à paraître au Japon et en France, avec la date, l'éditeur et le numéro de tome. Mis à jour chaque jour.</p><ul>${it.map(x => `<li>${dt(x.date)} : ${ex(x.fr || x.series)}${x.n != null && x.n !== "" ? ` tome ${ex(x.n)}` : ""}${x.pub ? `, ${ex(x.pub)}` : ""} (${x.pays === "France" ? "France" : "Japon"})</li>`).join("")}</ul>`) };
  }
  if (p === "/ma-collection/") return { jsonld: [page(url, "Ma collection manga", info.d), { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Comment gérer sa collection de mangas sur FuryoGang ?", acceptedAnswer: { "@type": "Answer", text: "Cherche une série, ouvre-la et coche les tomes que tu as. Chaque tome peut être marqué possédé, lu, envie de lire ou au panier, en version française comme en version japonaise." } },
      { "@type": "Question", name: "La collection est-elle gratuite ?", acceptedAnswer: { "@type": "Answer", text: "Oui : les tomes possédés sont illimités pour tous les membres. Les listes Lu, Envie de lire et Panier sont réservées aux membres Premium." } }] }],
    html: wrap(`<h2>Gère ta collection de mangas furyō et yakuza</h2><p>Range tes mangas tome par tome : possédés, lus, envies de lecture et panier, en VF et en VO. Toute la base FuryoGang est disponible, y compris les séries pas encore licenciées en France.</p>`) };
  if (p === "/communaute/") return { jsonld: [page(url, "Communauté FuryoGang", info.d)], html: wrap(`<h2>La communauté FuryoGang</h2><p>Les réseaux FuryoGang, le classement des collections de mangas des membres et la liste des membres du gang.</p>${RUBRIQUES}`) };
  if (p === "/crows-x-worst/") return { jsonld: [page(url, "CROWS × WORST : chronologie et ordre de lecture", info.d, { about: [{ "@type": "ComicSeries", name: "CROWS" }, { "@type": "ComicSeries", name: "WORST" }, { "@type": "Person", name: "Hiroshi Takahashi" }] })] };
  return null;
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
  { "@context": "https://schema.org", "@type": "WebSite", name: NOM, alternateName: "Furyo Gang", url: SITE + "/", description: `${ACCROCHE} : furyō, yakuza, crime et pègre. Actualité, séries, films, calendrier des sorties et collection.`, inLanguage: "fr-FR" },
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
  const genre = (s.genres || []).slice(0, 2).join(" et ").toLowerCase();
  const de = n => (/^[aeiouyhâéèêîôûAEIOUYHÂÉÈÊÎÔÛ]/.test(n) ? "d'" : "de ") + n;
  // Titre : « Hell Dogs (manga) – tomes, sorties, extraits | FuryoGang »
  const t = `${titre} (manga) – tomes, sorties, extraits | ${NOM}`;
  const intro = `${titre}, ${/global/i.test(type) ? "global manga " : "manga " + (type ? type.toLowerCase() + " " : "")}${genre ? genre + " " : ""}${auteurs.length ? de(auteurs.join(" et ")) : ""}${pubFR.length ? `, en France chez ${pubFR.join(", ")}` : pubJP.length ? `, publié au Japon par ${pubJP.join(", ")}` : ""}${s.mag ? ` (prépublication : ${s.mag})` : ""}.`;
  // Phrases entières du résumé tant qu'elles tiennent dans 158 caractères (Will, 12/10/2026) ; sinon coupe au mot.
  let desc = intro;
  for (const ph of String(s.resume || "").match(/[^.!?]+[.!?]+/g) || []) { const n = desc + " " + ph.trim(); if (n.length > 158) break; desc = n; }
  if (desc === intro) desc = couper(`${intro} ${s.resume || ""}`, 158);
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

// Ma collection d'une série (Will, 09/10/2026) : « Slam Dunk : ma collection manga | FuryoGang » + texte avec les éditions.
export function seoCollection(s, eds, item, url) {
  const titre = s.fr || s.t || (item && (item.fr || item.t)) || "";
  const fr = (eds || []).filter(e => e.pays === "France"), jp = (eds || []).filter(e => e.pays === "Japon");
  const ed = e => [e.pub, e.label].filter(Boolean).join(" ") + (e.nb ? ` (${e.nb} tome${e.nb > 1 ? "s" : ""})` : "");
  const nbEd = (eds || []).length;
  const t = `${titre} : ma collection manga | ${NOM}`;
  const pubs = [...new Set(fr.map(e => e.pub).filter(Boolean))].join(", ");
  const vers = [fr.length ? `VF${pubs ? ` (${pubs})` : ""}` : "", jp.length ? "VO japonaise" : ""].filter(Boolean).join(" et ");
  const desc = couper(`Ta collection ${titre} avec ${NOM} : coche tes tomes${vers ? `, ${vers}` : ""}${nbEd > 1 ? `, toutes les éditions` : ""}. Collectionne tes mangas et vois ceux qui te manquent.`, 160);
  const cover = (item && item.cover) || s.cover1 || "";
  const image = cover ? SITE + "/api/couv?u=" + encodeURIComponent(cover) : "";
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const liste = (eds || []).map(e => `<li>${e.pays === "France" ? "Version française" : "Version japonaise"} : ${esc(ed(e))}${e.statut ? ` · ${esc(e.statut)}` : ""}</li>`).join("");
  const html = `<article class="seo-pre"><h1>${esc(titre)} : ma collection</h1>${s.jp ? `<p lang="ja">${esc(s.jp)}</p>` : ""}<p>${esc(desc)}</p>${liste ? `<ul>${liste}</ul>` : ""}</article>`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "WebPage", name: t, url, description: desc, about: { "@type": "ComicSeries", name: titre, ...(s.jp ? { alternateName: s.jp } : {}), ...(s.auteurs ? { author: s.auteurs.split(/\s*[,&]\s*/).map(n => ({ "@type": "Person", name: n })) } : {}) } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: NOM, item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Ma collection", item: SITE + "/ma-collection/" },
      { "@type": "ListItem", position: 3, name: titre, item: url },
    ] },
  ];
  return { titre: t, desc, image, type: "website", jsonld, html, carte: "summary" };
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
  const e = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const html = `<article class="seo-pre"><h1>${e(titre)}</h1>${n.date ? `<p><time datetime="${e(n.date)}">${e(n.date.split("-").reverse().join("/"))}</time> · ${e(n.catNom || "Actualité")}</p>` : ""}${String(n.texte || "").split(/\n+/).filter(Boolean).map(x => `<p>${e(x)}</p>`).join("")}</article>`;
  return { titre: t, desc: couper(texte || `${titre} : l'actualité manga sur ${NOM}.`, 158), image, type: "article", carte: image ? "summary_large_image" : "summary", html,
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
  const e = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const html = `<article class="seo-pre"><h1>${e(titre)}</h1>${f.jp && f.jp !== titre ? `<p lang="ja">${e(f.jp)}</p>` : ""}<p>${e(intro)}</p>${f.res ? `<p>${e(f.res)}</p>` : ""}</article>`;
  return { titre: t, desc: couper(`${intro} ${f.res || ""}`, 158), image, type: film ? "video.movie" : "video.tv_show", carte: "summary_large_image", html,
    jsonld: [{ "@context": "https://schema.org", "@type": film ? "Movie" : "TVSeries", name: titre, url,
      ...(f.jp && f.jp !== titre ? { alternateName: f.jp } : {}), ...(image ? { image } : {}), ...(f.y ? { dateCreated: String(f.y) } : {}),
      ...(f.real ? { director: { "@type": "Person", name: f.real } } : {}), ...((f.cast || []).length ? { actor: f.cast.slice(0, 6).map(n => ({ "@type": "Person", name: n })) } : {}),
      description: couper(f.res || intro, 300) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: NOM, item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "À l'écran", item: SITE + "/films/" },
        { "@type": "ListItem", position: 3, name: titre, item: url }] }] };
}

// Fiche mangaka (Will, 12/10/2026) : « Victor Dermo (mangaka) : Diamond Little Boy, biographie et réseaux | FuryoGang ».
export function seoAuteur(a, url) {
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const series = (a.series || []).slice().sort((x, y) => (y.y1 || 0) - (x.y1 || 0)).map(s => s.fr || s.t).filter(Boolean);
  const liste = n => series.length <= n ? series.join(", ").replace(/, ([^,]*)$/, " et $1") : series.slice(0, n).join(", ") + " et " + (series.length - n) + " autre" + (series.length - n > 1 ? "s" : "");
  const roles = (a.roles || []).map(r => r.toLowerCase());
  const role = roles.includes("histoire et dessin") || (roles.includes("scénario") && roles.includes("dessin")) ? "auteur" : roles.includes("scénario") ? "scénariste" : roles.includes("dessin") ? "dessinateur" : "auteur";
  // Plus de deux séries : le titre donne le nombre (sinon il dépasse ce que Google affiche).
  const t = `${a.name} (mangaka) : ${series.length > 2 ? `ses ${series.length} séries, ` : series.length ? liste(2) + ", " : ""}biographie et réseaux | ${NOM}`;
  const intro = `${a.name}${a.jp ? ` (${a.jp})` : ""}, mangaka, ${role} de ${series.length ? liste(3) : "mangas"}.`;
  // Description : l'intro puis les phrases entières de la bio qui tiennent dans 158 caractères (pas de phrase coupée).
  let desc = intro;
  for (const ph of String(a.bio || "").match(/[^.!?]+[.!?]+/g) || []) { const n = (desc + " " + ph.trim()); if (n.length > 158) break; desc = n; }
  if (desc === intro) desc = couper((intro + " Ses séries et ses réseaux officiels sur " + NOM + ".").length <= 158 ? intro + " Ses séries et ses réseaux officiels sur " + NOM + "." : intro, 158);
  const image = a.photo ? (a.photo.startsWith("http") ? a.photo : SITE + a.photo) : "";
  const sameAs = [a.x, a.ig, a.site, a.edit].filter(Boolean);
  const jsonld = [
    { "@context": "https://schema.org", "@type": "ProfilePage", url, name: `${a.name}, mangaka`, inLanguage: "fr-FR",
      mainEntity: { "@type": "Person", name: a.name, ...(a.jp ? { alternateName: a.jp } : {}), jobTitle: "Mangaka",
        ...(image ? { image } : {}), ...(a.bio ? { description: couper(a.bio, 300) } : {}), ...(sameAs.length ? { sameAs } : {}),
        ...(series.length ? { workExample: series.map(n => ({ "@type": "ComicSeries", name: n })) } : {}) } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: NOM, item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Mangakas", item: SITE + "/auteurs/" },
      { "@type": "ListItem", position: 3, name: a.name, item: url },
    ] },
  ];
  const html = `<article class="seo-pre"><h1>${esc(a.name)}</h1>${a.jp ? `<p lang="ja">${esc(a.jp)}</p>` : ""}<p>${esc(intro)}</p>${a.bio ? `<p>${esc(a.bio)}</p>` : ""}${series.length ? `<ul>${series.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}</article>`;
  return { titre: t, desc, image, type: "profile", jsonld, html, carte: "summary" };
}
