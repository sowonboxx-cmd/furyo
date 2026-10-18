# Faire vivre le site — les rendez-vous récurrents

Décidé avec Will le 15/10/2026. Va avec `calendrier-editorial.md` (rythme des fiches), `reseaux-sociaux.md` (visuels et légendes), `lancement.md` et `ressources.md`.

**Visible aussi dans le QG** : https://furyogang.com/hq/#vivre (réservé aux admins). Quand un rendez-vous avance, on met à jour ce document et la page du QG.

## L'idée

Tout ce qui bouge sur le site doit se voir sur les réseaux. Les gens doivent se dire « ça vit là-dedans, autant participer ».

Ces posts sont faits avec des données que le site a déjà. Ils peuvent donc sortir tout le temps, automatiquement, avec des templates. Ça ne coûte rien à Will et ça montre aux gens que ça bouge à l'intérieur.

Chaque post finit par un appel à l'action :
- « Tu l'as dans ta collection ? »
- « Inscris-toi pour avoir ta collection FuryoGang. »
- « Vote pour la prochaine fiche. »

## Ce qui est en place (15/10/2026)

### Studio « Quoi de neuf dans le gang ? »
- Adresse : /studio/semaine/, avec une tuile dans le back-office et un lien dans le QG.
- **Validé par Will** : un carrousel Instagram chaque fin de semaine. On le fait évoluer au fur et à mesure.
- **Les 8 images** (format 3:4, 1080 × 1440) :
  1. Couverture
  2. Japon
  3. France
  4. Actus
  5. À l'écran
  6. Nouvelles fiches
  7. Le gang
  8. Fin
- **Remplissage automatique** avec les données de la semaine choisie. Par défaut :
  - à partir du jeudi, la semaine en cours ;
  - avant le jeudi, la semaine précédente.
- **Règles de Will** :
  - une catégorie vide n'apparaît pas ;
  - une catégorie trop pleine garde l'essentiel : 3 tomes + « + N autres », 4 à 6 titres de prépub, les 2 actus les plus vues ;
  - seulement les titres et les visuels, la suite est sur le site (lien en bio).
- **Avant de télécharger** :
  - chaque texte se modifie d'un clic ;
  - chaque image peut être décochée ;
  - une case « Citer les pseudos du top » permet de les masquer ;
  - une couverture introuvable (« NOW PRINTING ») est retirée toute seule.
- **Légende Instagram** générée, avec un bouton Copier.
- **Chiffres privés** : /api/admin/semaine, réservé aux admins.
  - Il donne les membres, les nouveaux de la semaine, les tomes ajoutés aux collections, le top 3 de la semaine, et les films ajoutés et en ligne.
  - Les membres « Masqué » ne sont jamais cités.
- **À ajouter quand il y a de la place** (idées de Will) :
  - les news les plus populaires ;
  - les séries les plus populaires ;
  - les séries les plus ajoutées aux collections.

### Carrousel et reel collection « FuryoGang — Gère. Classe. Domine. »
- Proposition du 15/10/2026, à valider par Will.
- Le slogan vient de son ancien projet, The Manga Squad.
- **Le carrousel, 5 images, en 3 versions (noir, crème, rouge)** :
  1. Couverture avec un mur de couvertures.
  2. **Gère** : ajouter ses tomes.
  3. **Classe** : Possédés, Lus, Envie de lire, Panier, et les stats.
  4. **Domine** : le classement.
  5. « Les bas-fonds du Japon dans ta collection » (Furyō, Yakuza, Bōsōzoku, Crime, Meurtre, Drogue, Alcool, Prison…) + lien en bio.
- **Le reel** : 9:16, aux couleurs de Ma collection.
  - Will l'a trouvé génial, mais trop rapide.
  - Il existe une version ralentie (21,6 s).
  - Will doit encore demander des modifications.
  - Ensuite, on ajoute la musique de sa vidéo Riku-Do (piste déjà extraite, gardée par Claude).

## Les rendez-vous voulus par Will

### Les sorties du mois
- Toutes les sorties du mois à venir, France et Japon.
- Exemple : « Toutes les sorties de novembre ».
- Données : le calendrier (/api/calendrier).

### La semaine du gang
- Bilan hebdo, avec aussi une version mensuelle.
- Ce qu'il contient :
  - le nombre de news publiées ;
  - le nombre de nouveaux membres ;
  - le nombre de chapitres sortis dans les magazines japonais (prépublication) ;
  - le nombre de nouvelles fiches et l'avancement de la base ;
  - les tomes ajoutés aux collections par toute la communauté.
- **C'est le studio « Quoi de neuf dans le gang ? », en place.**

### Les nouvelles fiches de la semaine
- En fin de semaine, un visuel avec les nouvelles fiches publiées.
- Texte : « Tu les as dans ta collection ? Inscris-toi pour avoir ta collection FuryoGang. »
- C'est l'image « Nouvelles fiches » du studio.

### Le classement du mois
- Qui a le plus de mangas : la compétition entre membres.
- Variantes possibles : par éditeur (Kana, Pika, Akita Shoten…), Japon / France, par série.
- Données : /api/communaute (Général, Ce mois-ci, Cette semaine, avec les flèches de progression).
- Les variantes par éditeur et par série sont **à construire**.

### Mettre des membres en avant
- **Le plus gros collectionneur** du mois.
- **Le plus gros contributeur** : celui qui a signalé des infos, proposé des corrections ou commenté le plus.
- **Les nouveaux arrivés** : on les remercie (« Bienvenue à … »).
- **Les anciens** : on les remercie pour leur fidélité.
- **Pseudos publics uniquement.** Un membre doit pouvoir refuser d'apparaître.
  - Il faut une case « Ne pas me citer sur les réseaux » dans le profil : **à construire**.

### Les présentations manga en vidéo (Will, 15/10/2026)
- **Quand** : en 2027, ou quand Will a le temps.
- **Rythme** : une présentation vidéo par semaine, basée sur les fiches. À terme, chaque fiche a sa vidéo, qui explique ce qu'est le manga.
- **Fabrication** : par Will, avec l'IA, sans staff.
- **Formats** : surtout du mobile, car c'est pour Instagram et X.
  - 9:16 pour Instagram, TikTok et X ;
  - 16:9 pour le site et YouTube.
- **Modèle** : la vidéo Riku-Do de Will, dans le QG > Ressources.
  - Durée : 1 minute, en 4K 16:9.
  - Ouverture : le logo FuryoGang.
  - Titre et auteur en bandeau bleu et rouge en bas à gauche.
  - Illustrations couleur et planches en mouvements lents.
  - Crédit © auteur/éditeur en bas, logo FuryoGang en haut à droite.
  - Musique.

## Idées en plus (proposées par Claude, à trier par Will)

**Pour les collections**
1. **Le tome le plus ajouté de la semaine** : « Le tome que le gang a le plus acheté cette semaine ».
2. **La série la plus suivie** (bouton « + » des fiches) : « La série que vous suivez le plus ».
3. **Le pourcentage du gang qui a une série** : « 34 % du gang a CROWS dans sa collection. Et toi ? »
4. **La série complète la plus rare** : la moins souvent complétée dans les collections.
5. **Le compteur global** : « Le gang possède 12 480 tomes au total », avec un palier fêté à chaque cap.

**Pour les sorties**
6. **Le compte à rebours** : « J-3 avant CROWS T.09 », pour les grosses sorties.
7. **Il y a X ans** : l'anniversaire de la sortie d'un tome 1 ou de la fin d'une série (voir la chronologie dans ressources.md).
8. **Le planning prépub de la semaine** : les magazines japonais de la semaine, avec les séries du gang dedans.
9. **Les couvertures dévoilées de la semaine** : un collage des couvertures validées.

**Pour la communauté**
10. **Le vote de la semaine** : déjà prévu dans calendrier-editorial.md.
11. **La question du gang** : un sondage simple (« Ton furyō préféré ? »), avec la réponse sur le site.
12. **Les stats d'un membre en carte partageable** : sa collection en visuel, qu'il poste lui-même.
13. **Les badges débloqués** : « 3 membres ont eu le badge … cette semaine ».
14. **Les paliers du site** : « 100 fiches en ligne », « 500 membres ».

**Pour le Premium (plus tard)**
15. **Le mur des Soutiens fondateurs** : les remercier publiquement, avec leur accord.
16. **FuryoGang Magazine** : le magazine du mois réservé aux Premium (voir le QG > FuryoGang Magazine).

## Ce qu'il reste à construire

- Les autres rendez-vous dans le même style : sorties du mois, classement du mois, bienvenue aux nouveaux membres, paliers.
- Les légendes X et TikTok du récap. La légende Instagram est déjà faite.
- La case « Ne pas me citer » dans le profil membre.
- Plus tard : une tâche programmée qui prépare les visuels chaque vendredi et les met dans Validation.

## Rythme conseillé (interne, jamais annoncé au public)

| Quand | Quoi |
|---|---|
| Début de mois | Les sorties du mois, le classement du mois précédent, les membres mis en avant, plus tard FuryoGang Magazine |
| Chaque semaine | Une présentation manga en vidéo, à partir de 2027 |
| Chaque fin de semaine | « Quoi de neuf dans le gang ? » (carrousel), le vote de la semaine |
| Au fil de l'eau | Les nouveaux membres remerciés, les paliers, les comptes à rebours, les anniversaires |
