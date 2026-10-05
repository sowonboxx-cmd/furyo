/* Descriptions sur téléphone (Will, 05/10/2026) : toujours 2 lignes au plus, jamais de « … ».
   1. Les phrases entières qui tiennent en 2 lignes.
   2. Sinon la première phrase coupée à un endroit naturel (une virgule, ou juste avant « sur », « de », « au »…), terminée par un point.
      Ex. « Bumpoor, le thriller de Keisuke Senoo sur un tueur à gages fauché. » ; « La saison 2 de l'anime The Fable sera diffusée à partir de janvier 2027. »
   Utilisation : <p data-full="texte complet">, puis FG_FIT2(racine). */
(function () {
  var BRK = /^(sur|de|du|des|d'|d’|à|au|aux|pour|dans|avec|qui|que|qu'|qu’|par|en|et|est|sont|chez|sous|lié|liée|liés|dont|où|après|avant|depuis|entre|vers|contre|sans|mais|car|ou|grâce|selon|lors|via|comme)$/i;
  var STOP = /^(le|la|les|l'|l’|un|une|des|du|de|d'|d’|à|au|aux|sur|pour|dans|avec|par|en|et|ou|qui|que|son|sa|ses|leur|leurs|ce|cette|ces|est|a|partir|près|cours|travers|lors|auprès|afin|fin|début|suite|jusqu'|jusqu’|plus|moins|très|tout|toute)$/i;
  // Expressions qu'on ne coupe pas : « tueur à gages », « à partir de », « à cause de »…
  var LIE = /^(gages|partir|cause|propos|travers|peine|nouveau|venir|suivre|côté|part|fond|jour|main|mort|vie|feu|bout)$/i;
  function sent(t) {
    var raw = String(t || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?…]["»”)]?)\s+(?=[A-ZÀ-ÖØ-Þ«"0-9])/), out = [];
    raw.forEach(function (x) { if (out.length && out[out.length - 1].length < 25) out[out.length - 1] += " " + x; else out.push(x); });
    return out.map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function fit(p) {
    var full = p.dataset.full || p.textContent, max = 2, s = sent(full);
    if (!s.length) return;
    p.dataset.full = full;
    p.style.webkitLineClamp = "unset"; p.style.display = "block"; p.style.maxHeight = "none";
    var lh = parseFloat(getComputedStyle(p).lineHeight) || 20;
    var fits = function (t) { p.textContent = t; return Math.round(p.scrollHeight / lh) <= max; };
    var best = "";
    for (var k = 1; k <= s.length; k++) { var t = s.slice(0, k).join(" "); if (fits(t)) best = t; else break; }
    if (!best) {
      var w = s[0].replace(/[.!?…]+$/, "").split(" ");
      for (var i = w.length - 1; i >= 3 && !best; i--) {
        var last = w[i - 1].replace(/[,;:]+$/, ""), nat = /,$/.test(w[i - 1]) || (BRK.test(w[i]) && !(/^(à|de)$/i.test(w[i]) && LIE.test(w[i + 1] || "")));
        if (!nat || STOP.test(last)) continue;
        var c = w.slice(0, i).join(" ").replace(/[\s,;:—–-]+$/, "") + ".";
        if (fits(c)) best = c;
      }
      // Dernier recours : couper au dernier mot qui tient.
      for (var j = w.length - 1; j >= 2 && !best; j--) { if (STOP.test(w[j - 1].replace(/[,;:]+$/, ""))) continue; var c2 = w.slice(0, j).join(" ").replace(/[\s,;:—–-]+$/, "") + "."; if (fits(c2)) best = c2; }
    }
    p.textContent = best || s[0];
  }
  function all(root) { (root || document.getElementById("mh") || document.getElementById("na") || document).querySelectorAll("p[data-full]").forEach(fit); }
  window.FG_FIT2 = all;
  var tm; addEventListener("resize", function () { clearTimeout(tm); tm = setTimeout(function () { if (innerWidth < 980) all(); }, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (innerWidth < 980) all(); });
})();
