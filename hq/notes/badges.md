# Badges, points et classement — membres FuryoGang

Décidé avec Will le 03/10/2026. À compléter au fur et à mesure.

## Principe

- Connexion « Continuer avec Google », sans mot de passe à stocker.
- Chaque membre a une page **Profil** (/profil/, privée) et une **page publique** furyogang.com/membres/<pseudo>.
- Le pseudo est modifiable sur /profil/ et unique (si déjà pris, le site demande d'en choisir un autre).
- On démarre avec peu de badges. On en ajoute quand la communauté grandit.

## Où se gèrent les badges

- **La liste des badges** : base Notion « FuryoGang — Badges » (dans la page Mangas). Une ligne = un badge : Nom, Description, Couleur, Icône, Règle, Ordre, Masqué. Ajouter une ligne crée un badge ; on peut renommer à tout moment (ex. « Fondateur »).
- **Règle** :
  - *Manuel* : attribué à la main.
  - *Administrateurs* : attribué à la main **et** donne l'accès admin (back-office + gestion des badges). L'e-mail de Will l'a d'office, on ne peut pas le lui retirer.
  - *100 premiers inscrits* : automatique selon le n° de membre.
- **Attribuer un badge** : soit dans Notion (base Membres, colonne « Badges », relation vers la base Badges), soit **sur le site** : un admin ouvre la page publique d'un membre → bloc « Gérer les badges · admin » → touche les badges → Enregistrer. (Les points ne sont plus sur cet écran depuis le 18/10.)
- Un nouvel admin nommé par badge doit se déconnecter / reconnecter une fois. Si on lui retire le badge, l'accès est coupé dès qu'il recharge une page (au plus tard 12 h).

## Badges de départ

| Badge | Règle | Couleur |
|---|---|---|
| Administrateur | Administrateurs | Bleu |
| Fondateur | 100 premiers inscrits | Or |
| Modérateur | Manuel | Violet |
| Contributeur | Manuel | Vert |
| Donateur | Manuel | Rouge |
| Ancien | Manuel | Orange |
| Ami | Manuel | Rose |

Idées pour plus tard : **Collectionneur** par paliers (10, 50, 100 séries lues ou possédées, automatique), badge « Votant » (vote de la semaine), badge événement (concours d'ouverture).

## Points et classement

- Points modifiables par les admins sur la page publique du membre (ou dans Notion, colonne Points).
- Barème indicatif : +5 lien d'extrait officiel, +5 compte d'auteur trouvé, +10 couverture officielle, +2 correction.
- Plus tard : classement (« Top contributeurs », « Top collectionneurs ») quand la collection existera.

## Ce qui est en place (03/10/2026)

- Base Notion Membres (création à la première connexion, n° auto) et base Badges reliée.
- /profil/ : pseudo modifiable, réseaux (publics ou non), badges obtenus + badges à débloquer grisés.
- /membres/ : liste avec filtres (ordre d'inscription, récents, avec badges, un filtre par badge présent), chaque carte mène au profil public.
- /membres/<pseudo> : profil public + gestion des badges et points pour les admins.
- Accueil : module « Derniers membres » (5 derniers inscrits) avec bouton « Voir tous les membres ».


## Écran Badges du QG (18/10/2026)

- QG > Badges : tous les badges, avec icône, description, ce qu'ils font (règle) et le nombre de membres qui les ont. Bouton « Nouveau badge » et « Modifier » sur chaque badge (aperçu en direct). Tout est enregistré dans la base Notion « Badges ».
- L'attribution reste sur la fiche du membre (« Gérer les badges · admin »).

## Badges donateurs (Will, 18/10/2026)

Attribués à la main pour l'instant (pas de calcul automatique du montant cumulé). Seuils sur le total des dons, sans chevauchement.

| Badge | Total des dons | Icône | Couleur |
|---|---|---|---|
| Donateur — Kobun | 1 € à 24,99 € | Bouclier | Gris |
| Donateur — Bancho | 25 € à 49,99 € | Épées | Orange |
| Donateur — Shogun | 50 € à 99,99 € | Couronne | Violet |
| Donateur — Oyabun | 100 € et plus | Flamme | Rouge |
| Donateur — Légende du Gang | honorifique, critère à définir | Couronne | Or |

- Icônes et couleurs provisoires, modifiables dans QG > Badges.
- Plus tard : calcul automatique du niveau à partir des dons enregistrés dans l'écran Premium du back-office.
