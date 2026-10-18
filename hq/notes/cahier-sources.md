# Cahier de sources — veille Furyō / Urashakai

Sources utilisées par la veille hebdomadaire (séries en cours, nouveautés, licences FR).
Colonne « Accès » : ce que Claude peut lire automatiquement aujourd'hui (testé le 30/09/2026).
À compléter par Will : ajouter une ligne par source, avec ce qu'on y surveille.
Voir aussi « couvertures-officielles.md » pour les couvertures éditeur par éditeur.

## Japon — actualité générale

| Source | URL | Ce qu'on y surveille | Accès |
|---|---|---|---|
| Comic Natalie | https://natalie.mu/comic | Lancements, fins de série, adaptations | Accueil lisible ; articles et RSS (https://natalie.mu/comic/feed/news) bloqués pour Claude (403). Le RSS marche dans le navigateur de Will : à tester depuis le Worker Cloudflare du site. |
| Anime News Network | https://www.animenewsnetwork.com | Annonces relayées en anglais (suites, adaptations). RSS : https://www.animenewsnetwork.com/newsfeed/rss.xml | Articles OK ; RSS bloqué pour Claude (403), à tester depuis le Worker |

**Règle des sources primaires :** aucun site de news n'est une référence, ils servent seulement de radar. Seule la source officielle compte : éditeur, magazine, communiqué, compte officiel. Chaque news reçoit un niveau :

1. **Source officielle avec lien** : le lien officiel est enregistré en « Source 1 », l'intermédiaire en source secondaire. Publiable après validation.
2. **Magazine cité sans lien** (cas fréquent chez ANN) : statut « À vérifier dans le magazine », avec le nom et le numéro du magazine. Will vérifie dans le numéro. Généralement fiable, mais jamais publié sans ce contrôle.
3. **Aucune source citée** (fréquent sur Manga News et les sites tiers) : statut « À vérifier », confiance basse, pas de publication tant qu'une source officielle n'est pas trouvée.

## Japon — éditeurs et plateformes de prépublication

| Source | URL | Éditeur | Accès |
|---|---|---|---|
| Champion Cross (ex-Manga Cross) | https://championcross.jp | Akita Shoten (Crows/WORST, Nine Peaks…) | À tester |
| Yanmaga Web | https://yanmaga.jp | Kodansha (Young Magazine) | À tester |
| Comic Days | https://comic-days.com | Kodansha | À tester |
| Ura Sunday | https://urasunday.com | Shogakukan (Ushijima…) | À tester |
| Kurage Bunch | https://kuragebunch.com | Shinchosha | À tester |
| Comic Zenon | https://comic-zenon.com | Coamix | À tester |
| Tonari no Young Jump | https://tonarinoyj.jp | Shueisha | À tester |

## Japon — sorties et tomes

| Source | URL | Usage | Accès |
|---|---|---|---|
| Alert Bell (liste de Will) | — | Nouvelles couvertures, dates de sortie JP et FR | Connexion requise, Claude n'y a pas accès. **Rituel hebdo :** Will envoie des captures de sa liste chaque semaine (voir ci-dessous). |
| BookWalker | https://bookwalker.jp | Fiches tomes, lecture d'essai | OK |
| MangaUpdates | https://www.mangaupdates.com | Statut, tomes, licences par pays | Pages OK ; recherche et API bloquées |
| Mangapedia (マンガペディア) | https://mangapedia.com | Bibliothèque japonaise : toutes les éditions d'une série (tankōbon, shinsōban, kanzenban, wide, rééditions) avec la date de chaque tome | OK |
| **Hikarinagi** | https://www.hikarinagi.org | Base de mangas japonais : une page par série (ex. SHOUT! d'Hiromasa Okushima : https://www.hikarinagi.org/mangas/48438) et une page par tome (`/manga-volumes/<id>`) avec **date de sortie au jour et ISBN**. Bonne source pour les dates des fiches tomes JP. Ajouté à la demande de Will le 10/10/2026. | Pages lisibles ; les images de couverture ne se chargent pas pour Claude (Will les voit dans son navigateur) |
| Book Off | https://shopping.bookoff.co.jp | Couvertures des vieilles éditions JP (voir couvertures-officielles.md) | OK |

### Rituel Alert Bell (chaque semaine)

1. Will fait des captures d'écran de sa liste Alert Bell et les envoie à Claude dans le projet.
2. Claude transcrit chaque sortie dans la base Notion **Tomes** : titre, n° de tome, date (et précision), éditeur, pays (JP / FR), statut « À paraître ». La fiche **Édition** est créée si elle manque et reliée à la **Série**.
3. Une couverture visible sur la capture n'est jamais reprise telle quelle : la tâche « Couvertures à venir » (lun/mer/ven) va chercher la couverture officielle chez l'éditeur ou sur BookWalker, puis prépare la news (pas de couverture = pas de news).
4. Le calendrier (furyo.pages.dev/calendrier) se met à jour tout seul à partir de Tomes (cache de 10 minutes ; furyo.pages.dev/api/calendrier?refresh force la mise à jour).
5. Doublons : si le tome existe déjà dans Tomes, Claude met seulement la date à jour.
6. Si la série a aussi une édition française connue (fiche Série), Claude ajoute le prochain tome VF quand la date est connue (ex. JUMBO MAX chez Pika, Zange chez Akata).
7. **À ignorer** (lecture perso de Will, hors FuryoGang) : Ōsama Ranking (王様ランキング).
8. **Titres :** toujours reprendre le titre exact de la fiche Série (colonne SERIES), jamais le titre d'Alert Bell. Chercher la série par son titre japonais (Titre Original) avant d'en créer une nouvelle : 惨家 = Zange, ジン 格斗破王伝 = JIN, 蜜を追う = Drug Hunter, etc.
9. **Numéros :** deux chiffres sous 10 (T.07, T.08), puis T.10, T.40…
10. Nommage : Tome = « <SERIES> T.NN — <Éditeur> » ; Édition = « <SERIES> — Tankōbon (<collection>) » pour le Japon, « <SERIES> — <Éditeur FR> » pour la France. Tome unique ou hors-série : pas de N°, le nom va dans « Titre du volume » (le site et le calendrier l'affichent à la place de « Tome »).

## Résumés des fiches séries (décision de Will, 02/10/2026)

- **Claude rédige lui-même tous les résumés**, avec ses propres mots, à partir des faits trouvés dans les sources (éditeur, magazine, Manga News, MangaUpdates…).
- On ne reprend jamais le texte d'un éditeur, même crédité. Un résumé d'éditeur est un texte protégé, et un crédit n'est pas une autorisation. Avec un texte réécrit, aucun crédit n'est nécessaire.
- Le texte doit être vraiment reformulé (pas une paraphrase collée à l'original) et sans erreur : noms, chiffres et intrigue vérifiés dans les sources. Si un détail diffère selon les sources, on ne le met pas (ex. le nom de famille du héros de Zange).
- Will relit et valide comme le reste de la fiche.

## Extraits (onglet « Info & Extraits » des fiches séries)

Deux liens par série, affichés en bas de l'onglet ; sans lien, le site écrit « Non disponible ».

- **Extrait japonais** → champ « Lecture essai (試し読み) » de la fiche Série. Plateforme officielle japonaise, toujours la même si possible : ebookjapan en priorité, sinon BookWalker.
- **Extrait en français** → champ « Extrait FR ». Lien officiel de l'éditeur FR. Les liens changent souvent : Kana garde ses extraits (ex. https://www.kana.fr/kujo-limplacable-extrait-chapitre-1/), Mangetsu et Akata aussi en général ; chez les autres éditeurs, vérifier régulièrement. Will met à jour quand il trouve un extrait officiel.
- **Aucun extrait officiel** : cocher « Pas d'extrait JP » ou « Pas d'extrait FR ». L'élément compte alors comme fait dans le back-office.

## Adaptations (anime, OAV, films, dramas)

Décidé avec Will le 03/10/2026.

| Source | URL | Usage | Accès |
|---|---|---|---|
| **AsianWiki** (source par défaut) | https://asianwiki.com | **Dramas et films live** : titre, plateforme ou chaîne, nombre d'épisodes, date de sortie, saisons, suites. Tout y est, expliqué simplement. | OK |
| **MyAnimeList** (lien affiché) | https://myanimelist.net | **Anime, OAV, films d'animation** : c'est le lien « Source » montré aux visiteurs. Les données ne sont pas aspirées sur le site (ses conditions l'interdisent). | Lien uniquement |
| **AniList** (données anime) | https://anilist.co | Données anime / OAV (format, épisodes, dates, studio) via son API publique et gratuite. Chaque fiche AniList donne aussi l'identifiant MyAnimeList, d'où le lien. | OK (API) |
| MyDramaList | https://mydramalist.com | Vérification si AsianWiki n'a pas la page | OK |
| Drama Wiki (D-Addicts) | https://wiki.d-addicts.com | Vérification des dramas anciens | À tester |

**Format dans Notion (fiche Série)** : un champ par catégorie (Anime, Drama, Film live, OAV, Jeux vidéo). Une œuvre par ligne, sous la forme « Titre (année, détails) <lien source> ». Exemples :
- `Gannibal saison 2 (2025, Disney+, 7 épisodes, à partir du 19/03/2025) <https://asianwiki.com/Gannibal_Season_2>`
- `BADBOYS (1993, 5 épisodes, de 1993 à 1995, Toei Video) <https://myanimelist.net/anime/6096/Bad_Boys>`

Le titre reste le titre officiel (japonais romanisé, ou le titre français s'il existe), jamais une traduction maison.

**Sur le site** (onglet Adaptations) : une liste simple par catégorie. Titre, année en gris, détails, puis une pastille « Source : AsianWiki ↗ » (ou MyAnimeList…) qui ouvre la page source. **Pas de vidéo intégrée** (trop lourd, lent à charger) : la bande-annonce est un simple lien « ▶ Bande-annonce ↗ ».

**Bandes-annonces** : champ « Trailers » de la fiche Série, une par ligne : « catégorie | libellé | lien YouTube » (catégories : anime, drama, film, oav, jeux). **Chaîne officielle uniquement** (plateforme, studio, distributeur), jamais un réupload.

## Presse et magazines

| Source | URL | Ce qu'on y surveille | Accès |
|---|---|---|---|
| ATOM | https://www.atom-mag.com | Chaque nouveau numéro (sommaire, dossiers, interviews), à relayer dès la sortie. Manga News relaie aussi les annonces de numéros. | OK (boutique lisible) |

## France

| Source | URL | Usage | Accès |
|---|---|---|---|
| Manga News | https://www.manga-news.com | Actus, planning, fiches séries FR/VO. **Données uniquement (dates, ISBN), jamais les images.** | OK |
| **BDGest — sorties manga** | https://www.bdgest.com/sorties_manga | **Calendrier des sorties manga FR** (parus récemment et à paraître), groupé par jour : éditeur, titre, n° de tome. Mois par mois avec `?DL=MM%2FAAAA` (ex. `?DL=11%2F2026`). Sert de **deuxième référence après le planning Manga News** pour repérer les sorties des séries suivies et les nouveautés qui pourraient intéresser Will. Ajouté à la demande de Will le 09/10/2026. Données uniquement, pas les images. | OK (lu le 09/10) |
| **BDthèque** | https://www.bedetheque.com | **Couvertures VF quand l'éditeur ne les a plus** (séries anciennes, éditeurs disparus : Tokebi, Kabuto, Akuma, Paquet…). Exception validée par Will le 09/10/2026 ; méthode dans couvertures-officielles.md. Aussi utile pour vérifier le nombre de tomes parus d'une édition FR. | OK (pages et images) |
| BubbleBD / PlaneteBD | https://www.bubblebd.com · https://www.planetebd.com | Secours si BDthèque n'a pas une couverture VF | OK |
| Manga Sanctuary | https://www.manga-sanctuary.com | Fins de séries et nouvelles séries du mois, fiches séries | OK |
| Nautiljon | https://www.nautiljon.com | Actus, annonces de licences, fiches séries et tomes | OK |
| Éditeurs FR | voir couvertures-officielles.md | Couvertures, fiches tomes, dates | selon l'éditeur |

### Actus des éditeurs FR (source officielle des news « Annonce FR »)

Ajouté le 03/10/2026, après l'annonce de Rokudenashi Mini Blues par Pika (29/09/2026) repérée par Will et pas par la veille. Ces pages sont relues à chaque veille hebdo : toute annonce qui touche une série de la base (nouveau tome, tome unique, hors-série, réédition, coffret) devient une news « Annonce FR » (Type News, source niveau 1) et, si une date est donnée, un tome dans le calendrier.

| Éditeur | Page d'actus | Accès |
|---|---|---|
| Pika | https://www.pika.fr/actualite/ | OK (lu le 03/10) |
| Kana | https://www.kana.fr/actualites/ | À tester |
| Ki-oon | https://ki-oon.com/news | À tester |
| Delcourt / Tonkam | https://www.editions-delcourt.fr/actualites | À tester |
| Meian | https://www.meian-editions.fr (actus) | À tester |
| Panini | https://www.panini.fr (actus manga) | File d'attente fréquente |
| Mangetsu, Kazé, Akata, Glénat, Kurokawa… | à compléter | — |

### Rituel planning Manga News (tous les 15 jours)

Décidé avec Will le 08/10/2026 : c'est le seul travail manuel côté France, et le planning Manga News reste une des meilleures références (mis à jour en continu).

1. Le 1er et le 15 de chaque mois, la tâche programmée « Rappel planning Manga News » rappelle à Will d'ouvrir https://www.manga-news.com/index.php/planning et d'envoyer l'export CSV (les 2 mois affichés : colonnes Date, Titre, Éditeur, EAN) dans une session du projet. Claude ne peut pas le télécharger lui-même.
2. Claude garde les sorties des séries déjà dans la base Séries (recherche par Titre FR, SERIES et variantes, y compris « Titre (Le) » = « Le Titre ») et crée l'Édition française si elle manque, puis le Tome (date au jour, Précision « Jour », ISBN = EAN, Statut « À paraître » ou « Paru », Source = la page du planning).
3. Tome déjà présent : Claude met la date à jour si elle a bougé (les dates FR changent souvent) et ajoute l'ISBN s'il manque.
4. Couverture : si l'éditeur l'a déjà (ex. Kana via bdi.dlpdomain.com), Claude l'ajoute après vérification ; sinon la tâche « Couvertures à venir » s'en charge.
5. Les titres qui pourraient concerner le gang mais absents de la base sont listés à Will, qui choisit. **Quand Will accepte une série, Claude remplit toute la fiche automatiquement** (décision du 08/10/2026), sans attendre qu'il le demande : résumé avec ses mots, auteurs, type, genres, magazine, dates, statuts, nombres de tomes, liens (extrait JP/FR, Manga News, MangaUpdates, Wikipedia, éditeurs), adaptations et bandes-annonces officielles, éditions JP et FR avec tous les tomes (date, ISBN, couverture officielle vérifiée). La fiche reste « À valider » : Will vérifie seulement. Refusés le 01/10/2026 (ne plus proposer) : Ippo, Under Ninja, Kill Blue, Battle Royale Enforcers, Mafia Nanny, Veux-tu que je tue pour toi ?, Murciélago, The Yakuza's Guide to Babysitting, Yakuza Reincarnation, Usogui, Love of Kill.
6. Manga News n'est jamais une source pour les images.
7. Une date trouvée chez l'éditeur ou donnée par Will l'emporte sur le planning.
8. **Complément BDGest (Will, 09/10/2026)** : à chaque rituel, Claude relit aussi https://www.bdgest.com/sorties_manga (mois en cours et mois suivant, `?DL=MM%2FAAAA`) pour rattraper ce qui manque au CSV : tomes de séries suivies absents du planning, et nouveautés susceptibles d'intéresser Will (proposées comme au point 5). Contrairement au CSV Manga News, Claude peut lire BDGest lui-même.

## X — comptes officiels (auteurs, séries, éditeurs)

Lecture automatique impossible sans l'API X payante. En attendant : liste X privée suivie par Will, et tweets collés à Claude pour traduction.
Les comptes vérifiés sont stockés dans la base Auteurs (colonne « X (Twitter) ») et dans les fiches séries (« Twitter Author », « Twitter Serie »).

| Compte | Série / auteur |
|---|---|
| https://x.com/hirakawa7x | Tetsuhiro Hirakawa (Nine Peaks) |
| https://x.com/ninepeaks_wc | Nine Peaks (compte officiel) |
| https://x.com/BAREFACED_03 | Hayato Komainu (Barefaced) |
| https://x.com/EneWTIVOjJrjQPO | Masaaki Ninomiya (Gannibal), confirmé par Will |
| https://x.com/maskawabe | Masamichi Kawabe (Onigoroshi) |

## Archives FuryoGang

Colonne « Source FuryoGang » de la base : le premier tweet de @FuryoGang sur une série (souvent le jour du lancement ou une présentation). Le tweet officiel qu'il relaie (auteur, éditeur) va dans une colonne « Source 1–4 », car c'est lui qui fait foi.
Exemple : Hell Dogs, lancement annoncé par Iizuka Keita le 4 avril 2020 (https://x.com/iizuka_k_/status/1246281276828422144), relayé par https://x.com/FuryoGang/status/1246383801586126848.

## Sources exclues

Scantrad, sites pirates, comptes fans : jamais utilisés, jamais cités. Manga News, Amazon, Fnac et autres libraires : jamais pour les images (BDthèque, BubbleBD et PlaneteBD sont l'exception de secours pour les couvertures VF introuvables chez l'éditeur, validée par Will le 09/10/2026).
