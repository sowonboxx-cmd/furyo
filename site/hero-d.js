/* Bannière ordinateur des news (Will, 27/10/2026) : toujours au format 21:8, sans texte sur l'image (le titre du site passe dessus).
   - N.coverD : image toute faite pour l'ordinateur (ex. hommage Tetsuya Chiba).
   - Gabarit « Extrait » (standard pour tous les extraits) : image de fond (N.fond, sinon une planche), couverture du tome 1 bien droite
     à droite (bordure blanche 3 px), puis les auteurs, « Extrait sur <éditeur> » et la date du tome.
   Utilisé par la page news (actus/) et par l'aperçu « Site ordinateur » du studio (hq/news/), pour que les deux soient identiques.
   FG_HEROD(N, couv, esc) → le contenu HTML de la bannière (sans le titre), ou "" si la news garde l'image classique. */
(function () {
  if (!document.getElementById("hd-css")) {
    var st = document.createElement("style"); st.id = "hd-css";
    st.textContent = ".nd-hero.hd{aspect-ratio:21/8}" +
      ".hd-bg{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}" +
      ".hd-gr{position:absolute;inset:0;background:linear-gradient(270deg,rgba(0,0,0,.8),transparent 30%)}" +
      ".hd-cv,.nd-hero>img.hd-cv{position:absolute;inset:auto;height:auto;z-index:1;right:3.4%;top:26%;width:10.8%;aspect-ratio:130/192;object-fit:cover;border:3px solid #fff;box-sizing:border-box;border-radius:3px;box-shadow:0 20px 44px rgba(0,0,0,.8)}" +
      ".hd-au{position:absolute;z-index:3;right:3.4%;bottom:6.5%;text-align:right;color:#F5F5F7;text-shadow:0 1px 10px rgba(0,0,0,.6)}" +
      ".hd-au b{display:block;font:700 21px/1.1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.05em}" +
      ".hd-au span{display:block;margin-top:8px;font:500 14px/1.4 Inter,sans-serif;color:#cfcbc4}.hd-au span em{font-style:normal;font-weight:700;color:#fff}" +
      ".hd-im{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}";
    document.head.appendChild(st);
  }
  var maj = function (t) { t = String(t || "").trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ""; };
  window.FG_HEROD = function (N, couv, esc) {
    couv = couv || function (u) { return u; }; esc = esc || function (s) { return String(s == null ? "" : s); };
    if (!N) return "";
    if (N.coverD) return '<img class="hd-im" src="' + esc(couv(N.coverD, 2000)) + '" alt="">';
    var ext = (N.cats || []).some(function (c) { return c && c.k === "extrait"; }) || N.cat === "extrait";
    var fond = N.fond || N.planche || "";
    if (!ext || !fond || !N.vignette) return "";
    var aut = String(N.aut || "").split(/\s*[·,&]\s*/).filter(Boolean);
    var ed = N.ed || N.pub || "", q = maj(N.quand || "");
    return '<div class="hd-bg" style="background-image:url(\'' + esc(couv(fond, 2000)) + '\');background-position:' + esc(N.fondPos || "50% 70%") + (N.fond ? "" : ";filter:grayscale(1) brightness(.6)") + '"></div><div class="hd-gr"></div>' +
      '<img class="hd-cv" src="' + esc(couv(N.vignette, 400)) + '" alt="">' +
      (aut.length || ed || q ? '<div class="hd-au">' + (aut.length ? "<b>" + aut.map(esc).join("<br>") + "</b>" : "") + "<span>" + (ed ? "Extrait sur <em>" + esc(ed) + "</em>" : "Extrait") + (q ? "<br>" + esc(q) + (N.paysC === "Japon" ? " 🇯🇵" : N.paysC ? " 🇫🇷" : "") : "") + "</span></div>" : "");
  };
})();
