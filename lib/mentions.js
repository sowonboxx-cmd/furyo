// @mentions des comptes officiels dans les légendes réseaux (auteurs d'abord, puis éditeurs / magazines).
// Sert au Studio (via /api/admin/handles) et au back-office, qui remet les légendes à jour
// dès qu'un compte est ajouté ou modifié dans les bases Auteurs / Éditeurs.

// https://x.com/compte → compte (sans @), pareil pour Instagram et TikTok.
export const handle = u => { const m = String(u || "").match(/(?:x|twitter|instagram|tiktok)\.com\/@?([A-Za-z0-9_.]+)/i); return m ? m[1].replace(/\.$/, "") : ""; };

// Liste des @ pour un réseau (ig, tt, x), sans doublon, dans l'ordre auteurs puis éditeurs.
export const mentionList = (comptes, net) => [...new Set(comptes.map(c => c[net]).filter(Boolean))].map(h => "@" + h).join(" ");

// Ligne « X @… » (règle de Will, 03/10/2026) : une seule ligne visuelle (LIGNE_X caractères au plus).
// Les auteurs d'abord (ils retweetent), dans l'ordre de la relation Auteurs de la série ; l'éditeur français ensuite,
// et lui doit toujours apparaître s'il existe. Jamais l'éditeur japonais ni les magazines.
// S'il n'y a pas la place, on retire des auteurs (les derniers), jamais l'éditeur français.
export const LIGNE_X = 42;
export function choixX(aut, fr, tient = () => true) {
  const f = [...new Set((fr || []).filter(Boolean))].slice(0, 1);
  const a = [...new Set((aut || []).filter(Boolean))].filter(h => !f.includes(h));
  const ligne = hs => ("X " + hs.map(h => "@" + h).join(" · ")).length;
  for (let k = a.length; k >= 0; k--) {
    const hs = [...a.slice(0, k), ...f];
    if (!hs.length) return [];
    if (ligne(hs) <= LIGNE_X && tient(hs)) return hs;
  }
  return f;
}

// Remet la ligne de @ d'une légende à jour. Renvoie la légende telle quelle si elle est vide.
export function syncMentions(txt, net, m) {
  if (!txt) return txt;
  const L = txt.split("\n");
  if (net === "x") {
    // Format FuryoGang : « ↗ furyogang.com/series/… » puis « X @a · @b · @c » en dernière ligne.
    const i = L.findIndex(l => l.startsWith("↗ "));
    if (i >= 0) {
      const has = L[i + 1] && /^X @/.test(L[i + 1]);
      // 280 caractères maximum (X compte un lien pour 23) : on garde les comptes les plus pertinents, dans l'ordre.
      const base = L.slice(0, i + 1).concat(has ? L.slice(i + 2) : L.slice(i + 1));
      const poids = t => t.replace(/furyogang\.com\/\S*/g, "x".repeat(23)).length;
      let ats;
      if (m && typeof m === "object") {
        // { aut: [...], fr: [...] } : règle « une ligne, auteurs puis éditeur français ».
        const tient = hs => poids(base.join("\n") + "\nX " + hs.map(h => "@" + h).join(" · ")) <= 280;
        ats = choixX(m.aut, m.fr, tient).map(h => "@" + h);
      } else {
        ats = (m || "").split(/\s+/).filter(Boolean);
        let k = ats.length;
        while (k > 0 && poids(base.join("\n") + "\nX " + ats.slice(0, k).join(" · ")) > 280) k--;
        ats = ats.slice(0, k);
      }
      const ligne = ats.length ? "X " + ats.join(" · ") : "";
      if (has) { if (ligne) L[i + 1] = ligne; else L.splice(i + 1, 1); }
      else if (ligne) L.splice(i + 1, 0, ligne);
      return L.join("\n");
    }
    // Ancien format : la ligne de @ suit « Toutes les infos 👉 lien ».
    const j = L.findIndex(l => l.startsWith("Toutes les infos"));
    if (j < 0) return txt;
    if (L[j + 1] && L[j + 1].startsWith("@")) { if (m) L[j + 1] = m; else L.splice(j + 1, 1); }
    else if (m) L.splice(j + 1, 0, m);
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
