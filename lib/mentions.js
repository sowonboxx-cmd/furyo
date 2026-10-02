// @mentions des comptes officiels dans les légendes réseaux (auteurs d'abord, puis éditeurs / magazines).
// Sert au Studio (via /api/admin/handles) et au back-office, qui remet les légendes à jour
// dès qu'un compte est ajouté ou modifié dans les bases Auteurs / Éditeurs.

// https://x.com/compte → compte (sans @), pareil pour Instagram et TikTok.
export const handle = u => { const m = String(u || "").match(/(?:x|twitter|instagram|tiktok)\.com\/@?([A-Za-z0-9_.]+)/i); return m ? m[1].replace(/\.$/, "") : ""; };

// Liste des @ pour un réseau (ig, tt, x), sans doublon, dans l'ordre auteurs puis éditeurs.
export const mentionList = (comptes, net) => [...new Set(comptes.map(c => c[net]).filter(Boolean))].map(h => "@" + h).join(" ");

// Remet la ligne de @ d'une légende à jour. Renvoie la légende telle quelle si elle est vide.
export function syncMentions(txt, net, m) {
  if (!txt) return txt;
  const L = txt.split("\n");
  if (net === "x") {
    // X : la ligne de @ suit directement « Toutes les infos 👉 lien ».
    const i = L.findIndex(l => l.startsWith("Toutes les infos"));
    if (i < 0) return txt;
    if (L[i + 1] && L[i + 1].startsWith("@")) { if (m) L[i + 1] = m; else L.splice(i + 1, 1); }
    else if (m) L.splice(i + 1, 0, m);
    return L.join("\n");
  }
  // Instagram / TikTok : ligne « 📣 @… » entourée de lignes vides, juste après la ligne « 📖 … » (et l'éventuelle ligne membres).
  const j = L.findIndex(l => l.startsWith("📣"));
  if (j >= 0) {
    if (m) L[j] = "📣 " + m;
    else { L.splice(j, 1); if (L[j - 1] === "" && L[j] === "") L.splice(j, 1); }
    return L.join("\n");
  }
  if (!m) return txt;
  let k = L.findIndex(l => l.startsWith("📖")); if (k < 0) return txt;
  if (L[k + 1] && L[k + 1].startsWith("👉")) k++;
  // Après le bloc : ligne vide, @, (ligne vide si la suite n'en a pas déjà une).
  const add = ["", "📣 " + m]; if (L[k + 1] !== "") add.push("");
  L.splice(k + 1, 0, ...add);
  return L.join("\n");
}
