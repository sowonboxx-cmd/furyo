// Contenu régulier du site (QG, /hq/#vivre), réservé aux admins (Will, 27/10/2026).
// Tout ce qu'on publie régulièrement pour faire vivre le site : récaps, sorties, fiches, membres, communauté, stats,
// et la promo de chaque page du site en rotation. Remplace l'ancienne liste « Faire vivre le site » (gardée en local sur l'appareil).
// Stocké dans le KV « STATS », clé hq:contenus : { v, items: [...] }.
//   GET  /api/admin/contenus              → { ok, items }
//   POST { item }                         → crée ou remplace (par id)
//   POST { id, del: true }                → supprime
// Un contenu : { id, nm, kj, fq (h hebdo | m mensuel | f au fil de l'eau | r rotation | p sans rythme), cat, st (ok | ko | pr | id),
//   last (AAAA-MM-JJ), next, ds, montre[], pages[], rythme, assets[{nm, st, url}], hist[{d, note}], gagnants[{d, qui, lot, prem}] }
import { json, isAdmin } from "../../../lib/admin.js";
const CLE = "hq:contenus";
const V = 1;
const c = (id, nm, kj, fq, cat, st, ds, x = {}) => ({ id, nm, kj, fq, cat, st, ds, last: "", next: "", montre: [], pages: [], rythme: "", assets: [], hist: [], gagnants: [], ...x });
// Liste de départ : tout « Faire vivre le site » (liste, En place, Rendez-vous voulus, Idées en plus) + les pages dictées par Will le 27/10.
const DEPART = [
  // Récap
  c("qdn", "Quoi de neuf dans le gang", "週報", "h", "recap", "ok", "Le carrousel Instagram de fin de semaine (8 images 3:4), rempli tout seul : Japon, France, actus, À l'écran, nouvelles fiches, le gang, la semaine prochaine. Les catégories vides n'apparaissent pas. Plutôt le dimanche. Aussi en page web.",
    { pages: ["/recap/semaine/"], assets: [{ nm: "Studio Quoi de neuf (carrousel)", st: "ok", url: "/studio/semaine/" }, { nm: "Page web de la semaine", st: "ok", url: "/recap/semaine/" }], rythme: "Chaque fin de semaine." }),
  c("recap-mois", "Récap du mois (sorties)", "月報", "m", "recap", "ok", "Le 10 de chaque mois : toutes les sorties du mois précédent, France puis Japon. Carrousel en noir ou crème, et la page publique à partager.",
    { pages: ["/recap/mois/2026-09/"], assets: [{ nm: "Studio Récap du mois", st: "ok", url: "/studio/mois/" }, { nm: "Récap du mois · vidéo (draft)", st: "ko", url: "/studio/mois-video/" }], rythme: "Le 10 de chaque mois." }),
  // Sorties
  c("sorties-jp", "Sorties du mois · Japon", "発売", "m", "sorties", "ko", "Toutes les sorties du mois à venir au Japon (« Toutes les sorties de novembre »). Les données du calendrier sont prêtes, il manque le gabarit.", { pages: ["/calendrier/#japon"] }),
  c("sorties-fr", "Sorties du mois · France", "仏版", "m", "sorties", "ko", "Toutes les sorties du mois à venir en France. Les données du calendrier sont prêtes, il manque le gabarit.", { pages: ["/calendrier/"] }),
  c("rebours", "Compte à rebours", "秒読", "f", "sorties", "id", "« J-3 avant CROWS T.09 » : avant une grosse sortie."),
  c("il-y-a", "Il y a X ans", "記念", "f", "sorties", "id", "Les anniversaires de tome 1 ou de fin de série (voir la chronologie dans Ressources)."),
  c("prepub-sem", "Le planning prépub de la semaine", "連載", "h", "sorties", "id", "Les chapitres qui sortent cette semaine dans les magazines japonais."),
  c("couv-sem", "Les couvertures dévoilées de la semaine", "表紙", "h", "sorties", "id", "Le collage des couvertures dévoilées dans la semaine."),
  // Fiches
  c("nouvelles-fiches", "Nouvelles fiches", "新規", "h", "fiches", "ok", "En fin de semaine : « Tu les as dans ta collection ? Inscris-toi pour avoir ta collection FuryoGang. » C'est une image du studio Quoi de neuf.", { assets: [{ nm: "Image du Quoi de neuf", st: "ok", url: "/studio/semaine/" }] }),
  c("fiche-mangaka", "Fiche mangaka", "作家", "f", "fiches", "ko", "Une catégorie à part entière, comme les fiches séries : dès qu'une fiche mangaka est créée ou mise à jour, on la poste sur le site et les réseaux (portrait, séries de l'auteur, infos)."),
  c("video-manga", "Présentations manga en vidéo", "動画", "h", "fiches", "id", "Une présentation vidéo par semaine, basée sur les fiches : ce qu'est le manga, l'auteur, l'ambiance, en illustrations animées avec musique (modèle : la vidéo Riku-Do dans Ressources). 2027, ou quand il y a le temps."),
  // Membres
  c("nouveaux-membres", "Nouveaux membres", "新顔", "f", "membres", "ko", "Bienvenue aux nouveaux arrivés, et combien ont rejoint le gang. Bon à poster à chaque palier."),
  c("collectionneurs", "Plus gros collectionneurs", "王者", "m", "membres", "ko", "Qui a le plus de mangas : la compétition du gang. Variantes possibles par éditeur, Japon / France ou par série. Le classement général existe déjà. Il faut d'abord la case « Ne pas me citer sur les réseaux » dans le profil."),
  c("membres-avant", "Membres mis en avant", "推し", "m", "membres", "ko", "Le plus gros contributeur, les nouveaux à remercier, les anciens fidèles. Pseudos publics seulement."),
  c("membres-dons", "Membres qui ont donné", "感謝", "f", "membres", "ko", "Remercier ceux qui ont soutenu ou donné (avec leur accord)."),
  c("actif", "Membre le plus actif", "常連", "h", "membres", "id", "Celui qui a le plus commenté cette semaine."),
  c("badges-sem", "Badges de la semaine", "紋章", "h", "membres", "id", "Le membre qui a gagné le plus de badges, et les badges débloqués dans la semaine."),
  // Communauté
  c("cadeau", "Cadeau du mois", "景品", "m", "commu", "ko", "Chaque mois, un tirage : une figurine ou un manga. Un lot pour un membre Premium, un contenu Furyo (figurine, manga, fascicule ou pièce spéciale) pour un membre non-Premium. Annonce du gagnant. Historique des gagnants plus bas : ne jamais faire gagner deux fois la même personne.",
    { next: "30 nov. (tirage du concours figurine)", rythme: "Tirage chaque fin de mois, annonce le 1er.", assets: [{ nm: "Concours figurine Hanaki Guriko (visuels)", st: "ok", url: "/hq/concours/poster.jpg" }] }),
  c("rejoins", "Rejoins le gang", "入会", "m", "commu", "ok", "Post d'incitation à s'inscrire : chaque mois une figurine à gagner pour les membres Premium et un contenu Furyo pour un membre non-Premium."),
  c("interview", "Interview mangaka", "取材", "m", "commu", "ko", "Interview d'un mangaka par FuryoGang. Appel à questions avant : les membres proposent leurs questions via un formulaire réservé aux inscrits. Une semaine en avant-première pour les Premium, puis tous les membres. Jamais visible sans compte."),
  c("vote", "Le vote de la semaine", "投票", "h", "commu", "id", "Le choix de la prochaine fiche, voté par le gang."),
  c("question", "La question du gang", "質問", "h", "commu", "id", "Un sondage simple."),
  c("carte-membre", "La carte collection d'un membre", "名刺", "f", "commu", "id", "La carte collection qu'un membre poste lui-même."),
  c("paliers", "Les paliers du site", "節目", "f", "commu", "id", "100 fiches, 500 membres, le total de tomes du gang fêté à chaque cap."),
  c("fondateurs", "Le mur des Soutiens fondateurs", "創設", "p", "commu", "id", "Plus tard, avec leur accord."),
  // Stats
  c("populaires", "Les plus populaires", "人気", "m", "stats", "id", "Les news les plus lues, les séries les plus populaires, les plus ajoutées aux collections. À glisser dans le récap quand il y a de la place."),
  c("collec-sem", "Les plus collectionnés · semaine", "週間", "h", "stats", "id", "Les séries les plus ajoutées aux collections cette semaine, et le tome le plus ajouté."),
  c("collec-mois", "Les plus collectionnés · mois", "月間", "m", "stats", "id", "Les séries les plus ajoutées aux collections ce mois-ci."),
  c("possedes", "Les plus possédés et les plus lus", "所有", "p", "stats", "id", "Les séries les plus présentes dans les collections, les plus lues, la plus suivie. « 34 % du gang a CROWS dans sa collection. Et toi ? », la série complète la plus rare."),
  c("ressources", "Puisés dans les Ressources", "資料", "p", "stats", "id", "« 40 ans de manga furyō » (chronologie 1980-2003), « Les 100 mangas yankee de BUBKA : combien tu en as ? », « Les OAV yankee des années 90 ».", { pages: ["/hq/#ressources"] }),
  // Contenu du site : la promo des pages, en rotation (une ou deux par mois)
  c("p-actus", "Actualités : le fil", "速報", "r", "site", "pr", "Expliquer le fil d'actualités : un feed, les catégories, les signets pour garder une news.", { pages: ["/?vue=actus"] }),
  c("p-series", "Séries : le catalogue", "連載", "r", "site", "pr", "Toutes les fiches séries, avec les filtres.", { pages: ["/series/"] }),
  c("p-magazines", "Magazines au Japon : la prépublication", "雑誌", "r", "site", "pr", "Expliquer comment marche la prépublication au Japon : les séries sortent d'abord chapitre par chapitre dans des magazines (Young Magazine, Champion, Young King…), puis en tomes. Sur FuryoGang, on suit chaque numéro. Prochain chantier.",
    { pages: ["/japon/"], next: "nov. · prochain chantier", rythme: "Une fois tous les 4 à 6 mois, pas plus.", montre: ["Les derniers numéros sortis, avec leurs couvertures", "Nos séries dans chaque numéro (chapitre, page couleur…)", "Les liens pour lire en ligne (Manga One, Champion Cross…)", "Pourquoi un chapitre sort avant le tome, et quand le tome arrive"],
      assets: [{ nm: "Carrousel Instagram", st: "ko", url: "" }, { nm: "Reel / TikTok", st: "id", url: "" }, { nm: "News sur le site", st: "ko", url: "" }] }),
  c("p-sorties-jp", "Prochaines sorties au Japon", "発売", "r", "site", "pr", "Les prochains tomes japonais, mois par mois, avec les couvertures. À ne pas confondre avec la page des magazines.", { pages: ["/calendrier/#japon"] }),
  c("p-calendrier", "Calendrier", "暦", "r", "site", "pr", "Toutes les sorties France et Japon, mois par mois, avec les couvertures.", { pages: ["/calendrier/"] }),
  c("p-ecran", "À l'écran", "映像", "r", "site", "pr", "Les films, dramas et animes tirés des mangas furyō, avec les bandes-annonces.", { pages: ["/films/"] }),
  c("p-collection", "Ma collection", "収集", "r", "site", "ok", "Coche tes tomes, suis ce que tu possèdes et ce que tu as lu. Le meilleur argument pour s'inscrire.",
    { pages: ["/ma-collection/"], assets: [{ nm: "Carrousel « Gère. Classe. Domine. » (validé le 15/10)", st: "ok", url: "" }, { nm: "Reel collection (en attente des modifs de Will)", st: "ko", url: "" }] }),
  c("p-crows", "Crows × Worst : la carte", "地図", "r", "site", "ok", "La carte interactive de l'univers de Hiroshi Takahashi. Le reel existe déjà : à reposter de temps en temps.", { pages: ["/crows-x-worst/"], assets: [{ nm: "Reel Crows × Worst (oct. 2026)", st: "ok", url: "" }] }),
  c("p-mangakas", "Mangakas", "作家", "r", "site", "pr", "Les fiches des auteurs, leurs séries et leurs réseaux.", { pages: ["/auteurs/"] }),
  c("p-communaute", "Communauté", "仲間", "r", "site", "pr", "Les membres du gang, les classements et les collections.", { pages: ["/communaute/"] }),
  c("p-premium", "Premium", "会員", "r", "site", "pr", "Ce que donne le Premium (offert à tous jusqu'au 30/11).", { pages: ["/premium/"] }),
  c("p-avancement", "La base FuryoGang", "進捗", "r", "site", "pr", "Combien de fiches sont en ligne et ce qui arrive. Bon pour un post « palier ».", { pages: ["/avancement/"] }),
];
const k = (nom, oeuvre, note = "", x = "") => ({ nom, oeuvre, note, x, st: "att" });
const CONTACTS = [
  k("Dai Suzuki", "Drop OG, Gokusatsudō Gregor", "Ami de Will", "guregooal"),
  k("Ryū Itō", "King of Ants (dessin)"),
  k("Masami Nobe", "Gorilla"),
  k("Shinsuke Takahashi", "Shōnan Seven", "Déjà rencontré"),
  k("Yōsuke Ueki", "Gabu", "Il suit FuryoGang"),
  k("Shinobu Seguchi", "Prisoner Riku", "Plutôt dans le furyō maintenant"),
  k("Hiroshi Takahashi", "Crows, Worst", "Soyons fous"),
  k("Daisuke Watanabe", "Zenaku no Kuzu, Konno Chika (scénario)", "M'a déjà répondu une fois, assez actif"),
  k("Hiromasa Okushima", "SHOUT!", "Sur un malentendu"),
  k("Daiki Yanauchi", "Gang King"),
];
async function lire(env) {
  let d = null; try { d = await env.STATS.get(CLE, "json"); } catch (e) {}
  if (!d || !Array.isArray(d.items)) d = { v: V, items: DEPART };
  // Interview mangaka : liste de départ des mangakas à contacter (Will, 27/10/2026), ajoutée une fois si absente.
  const itw = d.items.find(x => x.id === "interview"); if (itw && !Array.isArray(itw.contacts)) itw.contacts = CONTACTS;
  return d;
}
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  return json({ ok: true, items: (await lire(env)).items });
}
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "connexion requise" }, 401);
  const b = await request.json().catch(() => ({}));
  const d = await lire(env);
  if (b.item && typeof b.item === "object") {
    const it = JSON.parse(JSON.stringify(b.item)); if (!it.nm) return json({ error: "nom manquant" }, 400);
    it.id = String(it.id || ("c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5))).slice(0, 40);
    const i = d.items.findIndex(x => x.id === it.id); if (i >= 0) d.items[i] = it; else d.items.push(it);
    if (JSON.stringify(d).length > 200000) return json({ error: "liste trop longue" }, 400);
    await env.STATS.put(CLE, JSON.stringify(d));
    return json({ ok: true, item: it });
  }
  if (b.id && b.del) { d.items = d.items.filter(x => x.id !== b.id); await env.STATS.put(CLE, JSON.stringify(d)); return json({ ok: true }); }
  return json({ error: "rien à faire" }, 400);
}
