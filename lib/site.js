// Réglages communs du site.
import { check, rel } from "./notion.js";

// Publication au compte-gouttes : tant que c'est « false », le site montre toutes les séries qui ont une édition (comme avant).
// Le jour du lancement, passer à « true » : seules les séries cochées « Publier » dans Notion (ou depuis le back-office) apparaissent.
export const FILTRE_PUBLIER = false;

// Filtre Notion des séries visibles sur le site.
export const filtreVisible = () => FILTRE_PUBLIER
  ? { property: "Publier", checkbox: { equals: true } }
  : { property: "Éditions", relation: { is_not_empty: true } };

// La même règle pour une page déjà lue.
export const estVisible = p => FILTRE_PUBLIER ? check(p["Publier"]) : rel(p["Éditions"]).length > 0;
