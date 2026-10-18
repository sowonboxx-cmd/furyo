# Couvertures officielles — où les prendre

Règles :
- L'image vient toujours de l'éditeur (ou de sa boutique officielle). Les libraires et Manga News servent seulement à trouver un ISBN, jamais pour l'image. **Exception décidée par Will le 04/10/2026 : Rakuten Books pour les couvertures japonaises en HD** (voir plus bas). **Exception décidée par Will le 09/10/2026 : BDthèque pour les couvertures françaises introuvables chez l'éditeur** (voir plus bas).
- **Images plates uniquement** : une couverture vue de face, à plat. Jamais de photo de livre en 3D, de livre ouvert ou de mise en scène (c'est le cas des images de la boutique Meian).
- Si la couverture n'est pas disponible proprement, la tâche « Couvertures à venir » le signale dans « À récupérer par toi » et Will fournit l'image. Elle est déposée sur le site dans /couvertures/<ISBN13>.jpg (bordures blanches retirées si besoin).
- Sur le site, toutes les couvertures passent par /api/couv (cache Cloudflare 7 jours).
- **Images provisoires « NOW PRINTING »** : avant le Japon, l'éditeur affiche souvent une image provisoire à la même adresse. /api/couv?check=1&u=<url> les reconnaît (BookWalker, Akita Shoten, Shogakukan) et répond « refuser ». La vraie couverture arrive en général 2 à 4 semaines avant la sortie : la tâche repasse lundi, mercredi et vendredi.
- **Sans ISBN, pas de couverture** : sur le calendrier, un tome JP sans ISBN s'affiche avec un cadre noir et le titre japonais. Constat du 01/10 : les 17 tomes JP de septembre 2026 n'avaient pas d'ISBN. Corrigé le 01/10 (ISBN remplis).
- **Règle ISBN (décidée par Will le 01/10/2026)** : l'ISBN d'un tome est rempli directement dans la base Tomes, sans passer par la Veille, quand il est lu sur une fiche officielle de l'éditeur (somme de contrôle vérifiée). Tout le reste (couverture, statut, dates, auteurs…) passe toujours par la Veille.
- **Type d'image** (corrigé le 02/10) : /api/couv lit le type réel dans les premiers octets du fichier (JPEG, PNG, WebP, GIF) au lieu du type annoncé par le serveur. Les images c.bookwalker.jp envoyées en `binary/octet-stream` passent donc désormais le check.
- **Récupération quand un site bloque Claude** : la branche GitHub `recup-couvertures` télécharge les fichiers listés dans recup/liste.txt et, pour chaque page `pg-*.html`, extrait og:image et télécharge l'image (`og-*.jpg`). Utile pour Kodansha (403 direct) et les fiches dont l'image n'est pas déductible.
- **Complément manuel (validé par Will le 02/10/2026)** : Claude fait l'essentiel ; quand Will voit une couverture que Claude n'a pas trouvée (par exemple sur Alert Bell, avant l'éditeur) ou de mauvaise qualité, il envoie l'image. Claude la dépose dans /couvertures/<ISBN13>-hd.jpg et met https://furyo.pages.dev/couvertures/<ISBN13>-hd.jpg dans « Couverture ».
- **Lien à surveiller = « Source » de l'Édition** : pour chaque édition FR, le lien officiel de l'éditeur (page série, ou fiche du T.01 quand elle liste les tomes suivants) est rangé dans « Source » de la fiche Édition. C'est cette page que la veille relit chaque semaine pour repérer les nouveaux tomes, dates, ISBN et couvertures.

## Couvertures françaises introuvables : BDthèque (Will, 09/10/2026)
- **Ordre de recherche pour une couverture VF** : 1) éditeur ; 2) **BDthèque** (https://www.bedetheque.com) ; 3) BubbleBD (https://www.bubblebd.com) ou PlaneteBD (https://www.planetebd.com) ; 4) sinon, Will l'envoie (il la trouve sur Manga News ou ailleurs).
- BDthèque est la meilleure source pour les séries anciennes ou les éditeurs disparus (Tokebi, Kabuto, Akuma, Paquet, J'ai lu, 12 bis, Média Système…).
- Méthode : la page série (`serie-<id>-BD-<titre>.html`) liste les tomes avec leur couverture `https://www.bedetheque.com/media/Couvertures/...`. Les longues séries sont paginées : ouvrir la vue « Tout » (`...__10000.html`). Les rééditions d'un tome (ex. Glénat puis Kabuto) sont sur la fiche album du tome. Les images se téléchargent directement (en-tête Referer bedetheque.com).
- Vérifier l'éditeur et l'édition avant de prendre l'image (BDthèque mélange parfois plusieurs éditions sur une page), puis contrôle visuel sur planche.
- Fichiers : `/couvertures/<slug-serie>-<editeur>-NN.jpg` (ex. `worst-panini-01.jpg`), puis « Couverture » du tome = `https://furyogang.com/couvertures/...`.
- Qualité : 250 à 650 px de large en général (correct). PlaneteBD donne parfois du 200 px : à remplacer si Will trouve mieux.
- Fait le 09/10/2026 : 250 couvertures VF sur 44 éditions (277 manquaient), plus Monkey Peak T.11-12 fournis par Will. Restent : Angry T.5-6, B-BoY BomB T.3-6, Gewalt T.3, Murder Murder T.2, Golgo 13 Glénat T.1-2, Graffitti T.1-2, Hero (Booken) T.1-4, Brutal et Joker (Piccoma, numérique).

## Couvertures japonaises introuvables : Book Off (Will, 09/10/2026)
- Pour les vieilles séries japonaises absentes de Rakuten, de BookWalker et des sites éditeurs (pas de version numérique), **Book Off Online** (https://shopping.bookoff.co.jp) a souvent toute la série. Une page « set » (`/s/<id>`, ex. Tokko Artemis https://shopping.bookoff.co.jp/s/8800007082, Shin Yankee Reppuutai https://shopping.bookoff.co.jp/s/8800030906) liste chaque tome avec son image.
- Image d'un tome : `https://content.bookoff.co.jp/goodsimages/LL/<6 chiffres>/<10 chiffres>LL.jpg` (300 px de large environ : petit mais correct). Téléchargeable directement.
- Ce sont des photos de livres d'occasion : vérifier sur planche que l'image est plate et nette, remplacer si Will trouve mieux.
- Ordre de recherche JP : éditeur, puis Rakuten (HD), puis BookWalker, puis Book Off, sinon Will.
- Fait le 09/10/2026 : Tokko Artemis (21 tomes), Shin Yankee Reppuutai (23 tomes).

## Couvertures japonaises en HD : Rakuten Books (Will, 04/10/2026)
- **Règle par défaut** : dès qu'une couverture **japonaise** est de qualité moyenne (petite, floue), Claude la remplace sans attendre par la version Rakuten. Les couvertures françaises sont en général correctes à la source : on ne touche pas, sauf si Will fournit mieux.
- **Batchs de séries (à partir de la semaine du 05/10/2026, 20 séries par 20)** : pour chaque série japonaise, on prend d'abord nos sources habituelles (éditeur) ; si l'image n'est pas bonne ou introuvable, on la prend sur Rakuten. Will en fera aussi certaines à la main quand une source bloque.
- Les images Akita Shoten (231 × 330) sont trop petites et moches sur téléphone et sur les visuels. Rakuten Books a la même couverture officielle, plate, en **~820 × 1200**.
- Adresse directe depuis l'ISBN-13 : `https://shop.r10s.jp/book/cabinet/<4 derniers chiffres de l'ISBN>/<ISBN13>_1_2.jpg` (ex. BUBBLE T.11 : https://shop.r10s.jp/book/cabinet/9729/9784253019729_1_2.jpg). Fiche : https://books.rakuten.co.jp/rb/<id>/.
- Si l'adresse `_1_2` répond 404 (vieux tomes) : chercher l'ISBN sur https://books.rakuten.co.jp/search?sitem=<ISBN13> ; la page donne le nom exact du fichier (`<ISBN13>.jpg`, `_1_3`…), souvent en 640 px de haut seulement.
- Méthode : l'image est téléchargée, vérifiée à l'œil (vraie couverture, pas « NOW PRINTING »), déposée dans /couvertures/<ISBN13>-hd.jpg, et « Couverture » du tome pointe vers https://furyo.pages.dev/couvertures/<ISBN13>-hd.jpg. Elle sert alors partout : fiche, calendrier, Validation, visuels réseaux.
- **Côté droits (dit clairement à Will le 04/10/2026)** : techniquement rien n'empêche de télécharger ces images. Mais l'illustration appartient à l'éditeur japonais, pas à Rakuten : la prendre chez Rakuten ou chez l'éditeur ne change rien à son statut. Afficher la couverture d'un livre pour en parler (fiche, annonce de sortie) est une pratique courante des sites et médias manga, et la couverture est montrée telle quelle, sans retouche. Ce n'est pas un avis juridique. Si un éditeur ou Rakuten le demande, on retire l'image. On cite toujours la source officielle (éditeur) dans les news, jamais Rakuten.
- Fait le 04/10/2026 : BUBBLE T.11 (image fournie par Will, identique à Rakuten), puis 32 tomes qui avaient une image Akita : CROWS nouvelle édition (22 tomes : 11 en 1200 px, 11 en 640 px), Retsu Kaiō T.17, Chicano Kei T.20, Guriko T.39 et T.40, Gregor T.06, NINE PEAKS T.20 et T.21, Zange T.07, Brother Jingi T.06, Hakobi no Inu T.16.
- Pas trouvé sur Rakuten : CROWS Kanzenban (19 tomes, ISBN 9784253211xxx, épuisés) : ils restent en image Akita.

## Statut par éditeur

| Éditeur | Automatique ? | Comment | Page de référence |
|---|---|---|---|
| Kana, Dark Kana, Vega-Dupuis, Dupuis, Dargaud (Média-Participations) | ✅ Oui | Image calculée depuis l'ISBN : https://bdi.dlpdomain.com/album/<ISBN13>-couv-M480x680.jpg (qualité parfois moyenne : Will peut fournir mieux) | https://www.kana.fr/series/tokyo-cannabis/ |
| Mangetsu | ✅ Oui | https://mangetsu-manga.fr/media/cache/w460/<2 derniers chiffres de l'ISBN>/<ISBN13>.jpg | https://mangetsu-manga.fr/catalogue/9782382812051-red-blue-t10/ |
| Delcourt / Tonkam | ✅ Oui | https://www.editions-delcourt.fr/sites/default/files/product/<ISBN13>.jpg | https://www.editions-delcourt.fr/series/serie-tough-edition-double-l-aube-d-une-legende |
| Kazé (Crunchyroll) | ✅ Oui (à confirmer sur d'autres tomes) | https://kazemanga.fr/cdn/shop/files/<ISBN13>_1024x1024.jpg | https://kazemanga.fr/products/rappa-t01 |
| Panini | ✅ Oui (testé le 03/10) | Fiche tome https://www.panini.fr/shp_fra_fr/<slug>-t0N-<code>-fr02.html (code produit, ex. fnezu004). Sur la fiche : date (« Date de sortie »), ISBN (`"gtin13"` dans les données de la page), et en bas la liste des autres tomes avec leur date. Image plate 727×1000 : https://www.panini.fr/media/catalog/product/F/N/<CODE>_0.jpg (le T.01 peut être en minuscules : f/n/fnezu001_min_a.jpg). Le site a une file d'attente (queue-it) qui bloque certaines pages au hasard : réessayer plus tard, ou prendre l'ISBN chez un libraire. | Le Premier Amour de Nezumi : https://www.panini.fr/shp_fra_fr/le-premier-amour-de-nezumi-t01-fnezu001-fr02.html (lien fourni par Will) |
| Pika (groupe Hachette) | 🟡 Presque | Image Hachette : https://media.hachette.fr/fit-in/500x500/imgArticle/PIKA/<année>/<ISBN13>-001-X.jpeg?source=web. L'année du dossier n'est pas toujours celle qu'on croit : la tâche lit la fiche tome (https://www.pika.fr/livre/<slug>-<ISBN13>/), listée sur la page série. Il faut donc le lien de la page série dans « Source » de l'Édition. | https://www.pika.fr/livres-series-jumbo-max/ |
| Meian | 🟠 Données oui, images non | https://furyo.pages.dev/api/meian?licence=<id> donne tous les tomes, ISBN et nouveaux tomes (lu sur la boutique officielle anime-store.fr). Mais les images de la boutique sont en 3D / livre ouvert : **Will fournit les couvertures plates**. Lien de licence à mettre dans « Source » de l'Édition. | Licences notées : Star: Strike It Rich 2198, Oni Goroshi 1775, Gannibal Deluxe 2284 |
| Akata | ❓ À tester | un lien de fiche tome suffit | https://www.akata.fr |
| Ki-oon, Glénat, Kurokawa, naBan, Soleil, Noeve, Komikku… | ❓ À tester | un lien de fiche tome suffit | — |
| **France : tous éditeurs, en secours** | ✅ Oui | **BDthèque** (voir section plus haut), puis BubbleBD / PlaneteBD | Worst Panini, PK Tokebi, Heat Kabuto… (09/10) |
| Japon : **tous éditeurs, en HD** | ✅ Oui | **Rakuten Books** (voir section plus haut) : https://shop.r10s.jp/book/cabinet/<4 derniers chiffres>/<ISBN13>_1_2.jpg | BUBBLE T.11 (04/10) |
| Japon : Akita Shoten | ✅ Oui (petite taille) | https://www.akitashoten.co.jp/comics/<ISBN-10>/cover (page HTML tant que la fiche n'existe pas, puis NOW PRINTING, puis la vraie). 231 × 330 seulement : **remplacer par Rakuten dès que possible**. Certaines couvertures sont en webp (BUBBLE T.11). Listing des sorties de l'année : https://www.akitashoten.co.jp/comics/2026?page=N | NINE PEAKS T.21, Guriko T.40 OK le 01/10 ; Dokuro T.23 et Santa T.14 encore NOW PRINTING le 01/10. Brother Jingi T.07 : fournie par Will le 02/10 |
| Japon : Shogakukan | ✅ Oui | https://www.shogakukan.co.jp/thumbnail/snsbooks/<8 chiffres> où les 8 chiffres = ISBN-13 sans « 9784 » ni la clé (9784098548477 → 09854847). Fiche : https://www.shogakukan.co.jp/books/<8 chiffres>. Pour la date, le label et l'ISBN : https://shogakukan-comic.jp/book?isbn=<ISBN13> et pages séries https://shogakukan-comic.jp/book-series?cd=<n> | Ushijima-kun T.08 OK le 01/10 ; Kengan Omega T.34, YOSHIO T.08, Red Blue T.19, Bumpoor T.05 OK le 01/10. Juillet : Kujou no Taizai T.17, Nikumamushi Densetsu T.26 OK le 02/10 |
| Japon : Shinchōsha | ✅ Oui | https://www.shinchosha.co.jp/images_v2/book/cover/<code>/<code>_xl.jpg où <code> = chiffres 7 à 12 de l'ISBN-13 (9784107728579 → 772857). Fiche : https://www.shinchosha.co.jp/book/<code>/ | Drug Hunter T.02 OK le 01/10 |
| Japon : Hakusensha | 🟡 Presque | Image /wp_hakusensha/postimage/<AAAA>/<MM>/<ISBN13>.jpg, mais <AAAA>/<MM> = mois de mise en ligne (pas de sortie). Fiche trouvée via la recherche du site https://www.hakusensha.co.jp/?s=<titre> → /comicslist/<id>/ ; l'image exacte est dans og:image de la fiche | D.Diver T.06 OK le 01/10 (dossier 2026/07) ; Kenkazakari T.01 OK le 02/10 (dossier 2026/05) |
| Japon : Shōnen Gahōsha | 🟠 Non déductible | Fiche https://www.shonengahosha.co.jp/book_Info.php?id=<n> ; image https://www.shonengahosha.co.jp/images/Book/Book_<jeton aléatoire 32 car.>_1.png (lire la fiche, pas d'og:image). Le paramètre ?dt= est inutile | Barefaced T.08, Donketsu ch.2 T.18, Match Mondo OK le 01/10 ; Saru Lock Reboot T.10 OK le 02/10 |
| Japon : Kodansha | 🟡 Via la branche de récupération | Fiche https://www.kodansha.co.jp/book/products/<ISBN13> (bloque Claude en 403 en direct, mais passe par GitHub Actions) ; og:image = https://dvs-cover.kodansha.co.jp/<id>/<jeton>.jpg, image plate 640×909 | Amateur Vigilante T.08 OK le 02/10 ; Golden Drop T.15, Nezumi T.11, JIN T.03 : couvertures BookWalker seulement (01/10) |
| Japon : Shueisha | 🟡 Probable | Fiche https://www.shueisha.co.jp/books/items/contents.html?isbn=<ISBN avec tirets> ; l'image est dans og:image (cloudfront). « noimage » = pas encore publiée | Saigo no Furyou T.11 pas encore publiée |
| Japon : Nihon Bungeisha | 🟡 Via la fiche tome | Fiche tome https://www.nihonbungeisha.co.jp/book/b<id>.html (id non déductible de l'ISBN). **Ne pas prendre /ogpimage/<id>** (bannière 1200×630 avec la couverture en vignette). La vraie couverture plate est sur la fiche : https://hondana-image.s3.amazonaws.com/book/image/<id>/<uuid>.jpeg (sans préfixe normal_/middle_) | Kinoko Brothers T.04 OK le 02/10 ; Golden Guy T.15 pas encore publiée ; Matsuoka T.04 à reprendre avec cette méthode |
| Japon : autres éditeurs | 🟡 Au cas par cas | Rakuten en HD d'abord, sinon pages produit éditeur, sinon BookWalker, sinon **Book Off** (séries anciennes) | à documenter au fil des passages |

## Couvertures fournies par Will (sur le site)

| Tome | Fichier |
|---|---|
| Gannibal Deluxe T.01 | /couvertures/9782386586446.jpg |
| Gannibal Deluxe T.02 | /couvertures/9782386586453.jpg |
| Gannibal (Meian) T.01 à T.13 | /couvertures/<ISBN13>-hd.jpg (03/10) |
| Kengan Omega (Meian) T.01 à T.28 | /couvertures/<ISBN13>-hd.jpg (03/10) |
| Oni Goroshi (Meian) T.01 à T.08 | /couvertures/<ISBN13>-hd.jpg (03/10) |
| Oni Goroshi T.09 | /couvertures/9782385032579.jpg |
| Oni Goroshi T.10 | /couvertures/9782385032586.jpg |
| ST✰R: Strike It Rich T.01 et T.02 | /couvertures/<ISBN13>-hd.jpg (03/10) |
| ST✰R: Strike It Rich T.03 | /couvertures/9782385039646.jpg |
| ST✰R: Strike It Rich T.04 | /couvertures/9782385039653.jpg |
| Hell Dogs T.01 (meilleure qualité que l'image Kana) | /couvertures/9782505128496.jpg |
| Brother Jingi T.07 (vue sur Alert Bell, pas encore chez Akita) | /couvertures/9784253020626.jpg |
| BUBBLE T.11 (HD, 04/10) | /couvertures/9784253019729-hd.jpg |
| Monkey Peak (Komikku) T.11 et T.12 (09/10) | /couvertures/monkey-peak-komikku-11.jpg, -12.jpg |
