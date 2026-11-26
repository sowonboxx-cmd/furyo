// En-tête des légendes de fiche (Will, 26/11/2026) : plus de « Nouvelle fiche » (elles ne restent pas nouvelles),
// mais le numéro de la fiche, comme sur l'image : « FICHE N°001 · TITRE » (Instagram), « Fiche N°001 : Titre » (X, TikTok).
// Sans numéro de fiche, la légende est laissée telle quelle ; un numéro changé est mis à jour.
export const numFiche = n => "N°" + String(n).padStart(3, "0");
export function enteteFiche(txt, num) {
  if (!txt || !num) return txt;
  const n = numFiche(num);
  return String(txt)
    .replace(/^(\s*)(?:🆕\s*)?(?:NOUVELLE FICHE|FICHE N°\s*\d+)\s*·\s*/u, `$1FICHE ${n} · `)
    .replace(/^(\s*)(?:🆕\s*)?(?:Nouvelle fiche|Fiche N°\s*\d+)\s*:\s*/iu, `$1Fiche ${n} : `);
}
