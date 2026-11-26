// Réglages communs du site.
import { text } from "./notion.js";

// Visibilité des séries : colonne « Statut » de la base Séries (Will, 06/10/2026), comme pour « FuryoGang — À l'écran ».
// « À valider » (ou vide) = pas encore relue, invisible ; « Validé · admins » = prête, visible seulement par les admins
// (pastille violette « Admins ») ; « En ligne · public » = visible par tout le monde. Remplace les anciennes colonnes Avancement + Publier.
export const PUBLIC = "En ligne · public", ADMINS = "Validé · admins", A_VALIDER = "À valider";
export const STATUTS = [A_VALIDER, ADMINS, PUBLIC];
export const statut = p => text(p && p["Statut"]) || A_VALIDER;

// Filtre Notion des séries visibles par le public.
export const filtreVisible = () => ({ property: "Statut", select: { equals: PUBLIC } });
// La même règle pour une page déjà lue.
export const estVisible = p => statut(p) === PUBLIC;

// Aperçu administrateur : l'admin connecté voit toutes les séries, quel que soit leur statut (marquées « apercu »).
// Will (26/11/2026) : il n'utilise pas Notion, « À valider » ne doit plus rien bloquer pour lui.
// Ses réponses ne passent jamais par le cache partagé.
export const filtreApercu = () => undefined;
export const estValidee = p => statut(p) !== PUBLIC;
