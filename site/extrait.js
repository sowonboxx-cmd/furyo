// Carrousel « Extrait » d'une fiche série (Will, 25/11/2026, maquettes /modeles/extrait/maquettes.html, mise en page F validée).
// Après l'image de la fiche : les pages choisies (« EXTRAIT » en jaune, logo au centre, compteur, barre de progression,
// crédits dans le bandeau noir du bas, sans trait jaune), puis une image de fin qui renvoie vers la fiche :
//   fin « grille »   : « Chez <éditeur> depuis <année> », tome 1 en grand et les tomes suivants (défaut) ;
//   fin « eventail » : « La suite dans le tome 1 », tomes en éventail.
// FG_EXTRAIT.slides(d, prog) → Promise<[dataURL JPEG 1080 × 1440]>
// d = { titre, credit, pages:[url], tomes:[url], fin:"grille"|"eventail", sous, slug }
// Nécessite /site/fiche-card.js (polices) ; charge html-to-image si besoin.
(function () {
  var CSS = [
    '.fx{position:relative;overflow:hidden;width:1080px;height:1440px;background:#000;color:#fff;font-family:"FGInter",sans-serif;text-align:left;line-height:normal;letter-spacing:normal}',
    '.fx *{box-sizing:border-box}',
    '.fx .fx-top{position:absolute;left:0;right:0;top:0;height:110px;background:#000;display:flex;align-items:center;justify-content:center;z-index:5}',
    '.fx .fx-top img{width:200px;display:block}',
    '.fx .fx-g,.fx .fx-d{position:absolute;top:50%;transform:translateY(-50%);font:700 34px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.12em}',
    '.fx .fx-g{left:56px;color:#F2C14E}.fx .fx-d{right:56px;color:#fff}.fx .fx-d span{color:rgba(255,255,255,.45)}',
    '.fx .fx-bas{position:absolute;left:0;right:0;bottom:0;height:90px;background:#000;display:flex;align-items:center;justify-content:center;z-index:5;font:600 24px "FGInter";color:rgba(255,255,255,.75);letter-spacing:.01em;padding:0 40px;white-space:nowrap}',
    '.fx .fx-bas b{color:#fff;font-weight:700;margin-right:10px}',
    '.fx .fx-prog{position:absolute;left:56px;right:56px;top:126px;display:flex;gap:10px;z-index:5}.fx .fx-prog i{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.22)}.fx .fx-prog i.on{background:#F2C14E}',
    '.fx .fx-pg{position:absolute;left:50%;transform:translateX(-50%);top:150px;height:1180px;width:830px;object-fit:contain;display:block}',
    '.fx .fx-mz{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;transform:rotate(-4deg) scale(1.15);opacity:.22}',
    '.fx .fx-mz img{width:100%;height:480px;object-fit:cover;filter:grayscale(1) contrast(1.1)}',
    '.fx .fx-vl{position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 45%,rgba(0,0,0,.2),rgba(0,0,0,.85) 80%)}',
    '.fx .fx-tt{position:absolute;left:0;right:0;top:170px;text-align:center;z-index:3}',
    '.fx .fx-tt small{display:block;font:700 30px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.3em;color:#F2C14E}',
    '.fx .fx-tt h2{margin:18px 0 0;font:700 120px/.95 "FGAntonio";text-transform:uppercase;color:#fff}',
    '.fx .fx-fan{position:absolute;left:0;right:0;top:470px;height:560px;z-index:3}',
    '.fx .fx-fan img{position:absolute;border:8px solid #F2EFE9;object-fit:cover}',
    '.fx .fx-url{position:absolute;left:0;right:0;bottom:150px;text-align:center;z-index:4}',
    '.fx .fx-url small{display:block;font:600 30px "FGInter";color:rgba(255,255,255,.7)}',
    '.fx .fx-url b{display:block;margin-top:14px;font:700 64px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.04em;color:#fff}.fx .fx-url b em{font-style:normal;color:#F2C14E}',
    '.fx .fx-grille{position:absolute;left:150px;right:150px;top:430px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px;z-index:3}',
    '.fx .fx-grille img{width:100%;aspect-ratio:7/10;object-fit:cover;border:6px solid #F2EFE9;display:block}',
    '.fx .fx-grille img.un{grid-column:span 2;grid-row:span 2;height:100%}'
  ].join("\n");
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var LOGO = '<img src="/img/social/logo-blanc.png" alt="">';
  function top(g, d) { return '<div class="fx-top">' + (g || "") + LOGO + (d || "") + "</div>"; }
  function bas(d) { return '<div class="fx-bas"><b>' + esc(d.titre) + "</b>" + esc(d.credit || "") + "</div>"; }
  function page(d, i) {
    var n = d.pages.length, pr = "";
    for (var k = 0; k < n; k++) pr += '<i class="' + (k <= i ? "on" : "") + '"></i>';
    return '<div class="fx">' + top('<span class="fx-g">Extrait</span>', '<span class="fx-d">' + (i + 1) + "<span> / " + n + "</span></span>") +
      '<div class="fx-prog">' + pr + '</div><img class="fx-pg" src="' + esc(d.pages[i]) + '" alt="">' + bas(d) + "</div>";
  }
  function fan(l) {
    var n = l.length, pos = [], o = { gros: 340, petit: 230, pas: 230, ecart: 40, haut: 80 };
    for (var i = 0; i < n; i++) pos.push(i - (n - 1) / 2);
    var ordre = pos.slice().sort(function (a, b) { return Math.abs(a) - Math.abs(b) || a - b; });
    return l.map(function (u, k) {
      var dd = ordre[k], ad = Math.abs(dd), c = ad < .6, w = c ? o.gros : o.petit, h = Math.round(w * 1.42);
      return '<img src="' + esc(u) + '" style="left:' + Math.round(540 - w / 2 + dd * o.pas + (ad >= 1 ? Math.sign(dd) * o.ecart : 0)) + "px;top:" + (c ? 0 : o.haut) + "px;width:" + w + "px;height:" + h + "px;z-index:" + Math.round(10 - ad * 2) + ";transform:rotate(" + dd * 4 + "deg)" + (c ? "" : ";filter:brightness(.8)") + '">';
    }).join("");
  }
  function fin(d) {
    var mz = ""; for (var j = 0; j < 12; j++) mz += '<img src="' + esc(d.pages[j % d.pages.length]) + '" alt="">';
    var url = '<div class="fx-url"' + (d.fin === "eventail" ? "" : ' style="bottom:130px"') + '><small>La fiche complète, les tomes et l\'extrait</small><b>furyogang.com<em>/series/' + esc(d.slug) + "</em></b></div>";
    var t = d.tomes.slice(0, 5), corps;
    if (d.fin === "eventail") corps = '<div class="fx-fan">' + fan(t) + "</div>";
    else corps = '<div class="fx-grille">' + t.map(function (u, i) { return '<img' + (i ? "" : ' class="un"') + ' src="' + esc(u) + '" alt="">'; }).join("") + "</div>";
    return '<div class="fx"><div class="fx-mz">' + mz + '</div><div class="fx-vl"></div>' + top() + '<div class="fx-tt"><small>' + esc(d.sous || (d.fin === "eventail" ? "La suite dans le tome 1" : "")) + "</small><h2>" + esc(d.titre) + "</h2></div>" + corps + url + bas(d) + "</div>";
  }
  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function rendre(html, fcss) {
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;height:1440px;overflow:hidden;pointer-events:none";
    box.innerHTML = html; document.body.appendChild(box);
    var imgs = [].map.call(box.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); });
    var opts = { width: 1080, height: 1440, pixelRatio: 1, quality: .92, fontEmbedCSS: fcss, cacheBust: false, includeQueryParams: true, backgroundColor: "#000" };
    return Promise.all(imgs).then(function () {
      var essai = function (n, prev) {
        return htmlToImage.toJpeg(box.firstChild, opts).then(function (u) {
          if (n >= 4 || (prev && Math.abs(u.length - prev.length) < 400 && n >= 2)) return u;
          return new Promise(function (ok) { setTimeout(ok, 150); }).then(function () { return essai(n + 1, u); });
        });
      };
      return essai(1, null);
    }).finally(function () { box.remove(); });
  }
  function slides(d, prog) {
    if (!d || !d.pages || !d.pages.length) return Promise.resolve([]);
    var lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    var tmp = document.createElement("div"); tmp.style.cssText = "position:fixed;left:-20000px;top:0"; document.body.appendChild(tmp);
    // Polices intégrées : celles de la fiche (FG_FICHE.preparer renvoie la feuille @font-face en data URL).
    var polices = window.FG_FICHE ? FG_FICHE.preparer(tmp, {}) : Promise.resolve(undefined);
    var html = d.pages.map(function (_, i) { return page(d, i); }); if (d.tomes && d.tomes.length) html.push(fin(d));
    var out = [];
    return lib.then(function () { return polices; }).then(function (fcss) {
      tmp.remove();
      return html.reduce(function (p, h, i) { return p.then(function () { if (prog) prog(i + 1, html.length); return rendre(h, fcss).then(function (u) { out.push(u); }); }); }, Promise.resolve());
    }).then(function () { return out; });
  }
  window.FG_EXTRAIT = { slides: slides, page: page, fin: fin };
})();
