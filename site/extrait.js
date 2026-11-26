// Carrousel « Extrait » d'une fiche série (Will, 25/11/2026, maquettes /modeles/extrait/maquettes.html, mise en page F validée).
// Après l'image de la fiche : les pages choisies (« EXTRAIT » en jaune, logo au centre, compteur, barre de progression,
// crédits dans le bandeau noir du bas, sans trait jaune), puis une image de fin qui renvoie vers la fiche :
//   fin « grille »   : tome 1 en grand et les tomes suivants (défaut) ; fin « eventail » : tomes en éventail.
//   Seulement le nom de la série au-dessus, pas d'éditeur ni d'année (le post reste, Will 26/11/2026).
// FG_EXTRAIT.slides(d, prog) → Promise<[dataURL JPEG 1080 × 1440]> (1080 × 1920 si d.story : stories à la suite)
// d = { titre, jp, credit, pages:[url], tomes:[url], fin:"grille"|"eventail", slug, story }
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
    '.fx .fx-tt h2{margin:0;font:700 120px/.95 "FGAntonio";text-transform:uppercase;color:#fff}',
    '.fx .fx-fan{position:absolute;left:0;right:0;top:470px;height:560px;z-index:3}',
    '.fx .fx-fan img{position:absolute;border:8px solid #F2EFE9;object-fit:cover}',
    '.fx .fx-url{position:absolute;left:0;right:0;bottom:150px;text-align:center;z-index:4}',
    '.fx .fx-url small{display:block;font:600 30px "FGInter";color:rgba(255,255,255,.7)}',
    '.fx .fx-url b{display:block;white-space:nowrap;margin-top:14px;font:700 64px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.04em;color:#fff}.fx .fx-url b em{font-style:normal;color:#F2C14E}',
    '.fx .fx-grille{position:absolute;left:150px;right:150px;top:430px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px;z-index:3}',
    '.fx .fx-grille img{width:100%;aspect-ratio:7/10;object-fit:cover;border:6px solid #F2EFE9;display:block}',
    '.fx .fx-grille img.un{grid-column:span 2;grid-row:span 2;height:100%}',
    // Image de fin : bandes reprises de la fiche (/site/fiche-card.js).
    '.fx-fin .fx-fb{position:absolute;left:0;right:0;bottom:0;height:178px;background:#000;border-top:8px solid #F2C14E;text-align:center;padding-top:30px;z-index:5}',
    '.fx-fin .fx-fb img{display:none;width:420px;margin:0 auto 26px}',
    '.fx-fin .fx-fb small{display:block;font:600 26px "FGInter";color:rgba(255,255,255,.6)}',
    '.fx-fin .fx-fb b{display:block;white-space:nowrap;margin-top:10px;font:700 44px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.06em;color:#fff}.fx-fin .fx-fb b em{font-style:normal;color:#F2C14E}',
    '.fx-fin .fx-tt{top:190px}.fx-fin .fx-jp{display:block;margin-top:14px;font:700 46px/1.3 "FGNotoJP","FGInter",sans-serif;color:#F2C14E}',
    '.fx-fin .fx-grille{top:470px;left:140px;right:140px}.fx-fin .fx-fan{top:500px}',
    '.fx.fx-fin.st .fx-top{top:0;height:150px}.fx-fin.st .fx-fb{height:380px;padding-top:56px}.fx-fin.st .fx-fb img{display:block}',
    '.fx.fx-fin.st .fx-tt{top:320px}.fx.fx-fin.st .fx-grille{top:605px;left:60px;right:60px}.fx.fx-fin.st .fx-fan{top:700px}',
    // Format story 9:16 (Will, 26/11/2026) : mêmes images, rien sous les barres d'Instagram (haut et bas).
    '.fx.st{height:1920px}',
    // Crédits juste au-dessus de la barre de réponse d'Instagram (250 px du bas), page agrandie au maximum entre les deux.
    '.fx.st .fx-top{top:128px}.fx.st .fx-prog{top:250px}',
    '.fx.st .fx-pg{top:278px;height:1352px;width:1040px}',
    '.fx.st .fx-bas{height:290px;align-items:flex-start;padding-top:8px}',
    '.fx.st .fx-mz{grid-template-rows:repeat(4,1fr)}',
    '.fx.st .fx-tt{top:400px}.fx.st .fx-fan{top:760px}.fx.st .fx-grille{top:700px}',
    '.fx.st .fx-url{bottom:330px!important}'
  ].join("\n");
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var LOGO = '<img src="/img/social/logo-blanc.png" alt="">';
  function top(g, d) { return '<div class="fx-top">' + (g || "") + LOGO + (d || "") + "</div>"; }
  function bas(d) { return '<div class="fx-bas"><b>' + esc(d.titre) + "</b>" + esc(d.credit || "") + "</div>"; }
  var cl = function (d) { return d.story ? "fx st" : "fx"; };
  function page(d, i) {
    var n = d.pages.length, pr = "";
    for (var k = 0; k < n; k++) pr += '<i class="' + (k <= i ? "on" : "") + '"></i>';
    return '<div class="' + cl(d) + '">' + top('<span class="fx-g">Extrait</span>', '<span class="fx-d">' + (i + 1) + "<span> / " + n + "</span></span>") +
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
  // Image de fin (Will, 26/11/2026) : mêmes bandes que l'image de la fiche (haut noir, bas noir à trait jaune avec
  // « La fiche complète » et l'adresse ; logo dans le bas en story, en haut en post), pas de crédits ;
  // au milieu le titre, le titre japonais en jaune dessous, et les tomes.
  function fin(d) {
    var mz = ""; for (var j = 0; j < (d.story ? 15 : 12); j++) mz += '<img src="' + esc(d.pages[j % d.pages.length]) + '" alt="">';
    var t = d.tomes.slice(0, 5), corps;
    if (d.fin === "eventail") corps = '<div class="fx-fan">' + fan(t) + "</div>";
    else corps = '<div class="fx-grille">' + t.map(function (u, i) { return '<img' + (i ? "" : ' class="un"') + ' src="' + esc(u) + '" alt="">'; }).join("") + "</div>";
    var jp = d.jp && String(d.jp).toLowerCase() !== String(d.titre || "").toLowerCase() ? '<span class="fx-jp" lang="ja">' + esc(d.jp) + "</span>" : "";
    return '<div class="' + cl(d) + ' fx-fin"><div class="fx-mz">' + mz + '</div><div class="fx-vl"></div>' + (d.story ? '<div class="fx-top"></div>' : top()) +
      '<div class="fx-tt"><h2>' + esc(d.titre) + "</h2>" + jp + "</div>" + corps +
      '<div class="fx-fb"><img src="/img/social/logo-blanc.png" alt=""><small>La fiche complète</small><b>furyogang.com<em>/series/' + esc(d.slug) + "</em></b></div></div>";
  }
  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function rendre(html, fcss, h) {
    h = h || 1440;
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;height:" + h + "px;overflow:hidden;pointer-events:none";
    box.innerHTML = html; document.body.appendChild(box);
    // Titre de l'image de fin : sur une ligne, la police rétrécit si besoin (sinon il chevauche les tomes).
    var h2 = box.querySelector(".fx-tt h2");
    if (h2) { h2.style.whiteSpace = "nowrap"; var lh2 = function () { var r = document.createRange(); r.selectNodeContents(h2); return r.getBoundingClientRect().width; }, f2 = 120; while (f2 > 56 && lh2() > 980) { f2 -= 4; h2.style.fontSize = f2 + "px"; } }
    // Adresse : toujours sur une ligne (Will, 26/11/2026).
    var ub = box.querySelector(".fx-fb b");
    if (ub) { var lg = function () { var r = document.createRange(); r.selectNodeContents(ub); return r.getBoundingClientRect().width; }, fz = 44; while (fz > 22 && lg() > 980) { fz -= 2; ub.style.fontSize = fz + "px"; } }
    var imgs = [].map.call(box.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); });
    var opts = { width: 1080, height: h, pixelRatio: 1, quality: .92, fontEmbedCSS: fcss, cacheBust: false, includeQueryParams: true, backgroundColor: "#000" };
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
    var polices = window.FG_FICHE ? FG_FICHE.preparer(tmp, { jp: d.jp }) : Promise.resolve(undefined);
    var html = d.pages.map(function (_, i) { return page(d, i); }); if (d.tomes && d.tomes.length) html.push(fin(d));
    var out = [];
    return lib.then(function () { return polices; }).then(function (fcss) {
      tmp.remove();
      return html.reduce(function (p, h, i) { return p.then(function () { if (prog) prog(i + 1, html.length); return rendre(h, fcss, d.story ? 1920 : 1440).then(function (u) { out.push(u); }); }); }, Promise.resolve());
    }).then(function () { return out; });
  }
  window.FG_EXTRAIT = { slides: slides, page: page, fin: fin };
})();
