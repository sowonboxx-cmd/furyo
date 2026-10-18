# Lancement du site — annonce, teasing et inscriptions

Décidé avec Will le 03/10/2026, à compléter. Va avec `calendrier-editorial.md` (rythme des fiches) et `reseaux-sociaux.md` (visuels et légendes).

## Le message à faire passer
- Les comptes Instagram et X de FuryoGang repartent à fond (« on reboost le compte »).
- Le problème qu'on règle : beaucoup d'abonnés veulent depuis toujours les **liens de lecture en ligne** (extraits officiels, VO), et chercher dans les anciens tweets était une galère.
- La solution : **un site**. Chaque news renvoie vers la fiche de la série : on clique et on a tout au même endroit (lecture en ligne, tomes, dates de sortie JP et FR, couvertures, auteurs, news).
- En une phrase : « Tout ce que vous cherchiez dans nos tweets, maintenant au même endroit. »

## Semaine de teasing (avant l'ouverture)
- Will poste au fil de la semaine les visuels déjà faits ensemble (Studio : Nouvelle fiche, Sortie, Extrait).
- **Vidéo motion design** du site sur téléphone (le public sera surtout sur mobile) : accueil → calendrier → une fiche série → lien de lecture → « Connecte-toi en 1 clic ». 15 à 30 s, format 9:16 pour Reels, TikTok et X.
- Idée de déroulé (à ajuster) :
  1. Jour 1 : « Quelque chose arrive » + capture floutée.
  2. Jour 2 : le problème (« Vous nous demandez toujours où lire… »).
  3. Jour 3 : une fiche série en vidéo.
  4. Jour 4 : le calendrier des sorties.
  5. Jour 5 : la date d'ouverture + annonce du concours.
  6. Ouverture : vidéo complète + lien + concours.

## Mentionner les éditeurs
- Mentionner (@) les éditeurs FR et JP des séries de la base (Kana, Kurokawa, Akita Shoten, Kodansha, Shogakukan…) dans les posts qui parlent de leurs titres.
- Ton : **mettre leurs séries en avant**, jamais de comparaison (« mieux que chez vous »). Un éditeur qui se voit valorisé repartage, un éditeur qui se sent critiqué ignore ou bloque. L'objectif est que ça reste de la promo pour tout le monde.
- Les comptes officiels sont dans la base Notion « Éditeurs & magazines » ; les légendes du Studio ajoutent déjà leurs @ automatiquement.

## Concours d'ouverture
- Idée de Will : faire gagner une figurine pour fêter le lancement.
- Mécanique conseillée : **RT/partage + inscription gratuite sur le site** (connexion Google en 1 clic). Le concours sert alors aussi à recruter des membres, pas seulement à faire des RT.
- La figurine est offerte à FuryoGang : le concours ne coûte rien.
- **Vérifier sans galérer** (validé avec Will le 03/10/2026) :
  - on ne contrôle pas tout le monde, seulement le gagnant ;
  - la participation se fait sur le site : un membre connecté clique « Je participe » et renseigne son compte X ou Instagram (champ optionnel du profil, obligatoire seulement pour le concours) ;
  - le site tire au sort parmi les participants ;
  - Will vérifie à la main que ce compte a bien fait le RT (onglet Reposts de son profil). Si non, on retire au sort ;
  - le règlement le dit clairement : « participation valable si RT + inscription, vérifiée au tirage ».
  - Pas besoin de l'API X (payante et limitée pour lister les RT).
- À prévoir (je ne suis pas juriste, à vérifier) :
  - en France, un jeu-concours doit rester gratuit et sans obligation d'achat, avec un règlement accessible (une page du site suffit) : dates, lot, tirage au sort, comment le gagnant est contacté ;
  - Instagram demande d'indiquer que le jeu n'est ni organisé ni sponsorisé par Instagram ;
  - X interdit d'exiger plusieurs comptes ou des publications en double.

## Faire s'inscrire un maximum de monde (sans payer)
Principe : la connexion Google en un clic, aucun formulaire, et des petits « bonus membres ». **Les liens de lecture restent visibles par tout le monde** : c'est la promesse de l'annonce, les cacher casserait la confiance.

Bonus pour les membres connectés (idées à trier) :
1. **Suivre une série** (bouton ★ sur la fiche) → alerte à chaque nouveau tome, news ou couverture. C'est le meilleur levier : ça donne une raison de revenir.
2. **Mon calendrier** : les sorties uniquement des séries suivies.
3. **Ma collection** : cocher les tomes qu'on possède (comme un mini Mangacollec, spécialisé furyō / yakuza).
4. **Réseaux des auteurs** visibles aux membres (le champ « Réseaux réservés aux membres » existe déjà dans la base Auteurs).
5. **Couvertures HD et fonds d'écran** téléchargeables.
6. **Badge « Membre fondateur » numéroté** (« Fondateur n°042 ») pour les 500 premiers inscrits, affiché sur leur profil : la rareté pousse à s'inscrire tôt. Will trouve 500 ambitieux mais jouable ; on peut afficher le compteur « 137 / 500 places » pour créer l'urgence.
7. **Voter** pour la prochaine série ajoutée ou le coup de cœur du mois, et **proposer une série** manquante.
8. **Avant-première** : les nouvelles fiches visibles par les membres un jour avant les réseaux.
9. **Récap hebdo** par e-mail des sorties de la semaine (désinscription en un clic).
10. **Concours réservés aux membres**, à commencer par la figurine du lancement.

Règles anti-friction :
- montrer le début du contenu, puis « Connecte-toi pour voir la suite » (porte douce), jamais une page vide ;
- un seul bouton « Continuer avec Google », retour au même endroit après la connexion ;
- jamais de connexion demandée pour lire une fiche ou ouvrir un lien de lecture.

## À construire côté site (avant l'ouverture)
- Comptes membres : connexion Google (déjà prévu), lien magique par e-mail en option.
- Bouton « Suivre » + page « Mes séries » + alertes.
- Page règlement du concours.
- Activer le filtre Publier (`FILTRE_PUBLIER`) et cocher Publier sur les séries du Socle le jour J (choix entre les deux options à confirmer par Will).
