// Visuel « Extrait » (template validé par Will le 24/10/2026, variante « E1 ») en 1080 × 1440, comme le visuel des sorties.
// Fond : les planches en filigrane penché ; devant : la couverture et une planche en éventail ; le titre en très grand,
// l'étiquette rouge « Lis le chapitre 1 », les auteurs, puis « Extrait sur <éditeur> · tome 1 le <date> » + drapeau.
//
//   FG_EXTRAIT.png(d) → data URL PNG
//   d = { titre, auteurs, cover, planches:[url…], tag?, editeur, tome?, sortie?, pays? }
//     tag      : texte de l'étiquette rouge (défaut « Lis le chapitre 1 »)
//     editeur  : « Kana » → « Extrait sur Kana »
//     tome     : numéro du tome qui sort (défaut 1) ; sortie : « 13 novembre » (vide = pas de date)
//     pays     : "fr" (défaut) ou "jp" → petit drapeau en fin de ligne
(function () {
  var W = 1080, H = 1440;
  var CSS = [
    '.fge{width:1080px;height:1440px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 30%,#232326 0,#121214 55%,#0b0b0c 100%);color:#F5F5F7;font-family:"FGInter",sans-serif;line-height:normal;letter-spacing:normal;text-align:left}',
    '.fge .bg{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;transform:rotate(-8deg) scale(1.25);opacity:.2;filter:grayscale(1)}',
    '.fge .bg img{width:100%;display:block}',
    '.fge .logo{position:absolute;top:52px;left:50%;transform:translateX(-50%);height:66px}',
    '.fge .pl{position:absolute;width:560px;height:793px;border:10px solid #fff;box-shadow:0 30px 60px rgba(0,0,0,.6);object-fit:cover;background:#222}',
    '.fge .grad{position:absolute;left:0;right:0;top:880px;height:560px;background:linear-gradient(180deg,rgba(11,11,12,0),#0b0b0c 45%)}',
    '.fge .t{position:absolute;left:20px;right:20px;top:935px;text-align:center;font:700 240px/.9 "FGAntonio",sans-serif;text-transform:uppercase;white-space:nowrap;text-shadow:0 10px 40px rgba(0,0,0,.8)}',
    '.fge .tag{position:absolute;left:50%;transform:translateX(-50%);top:1206px;height:62px;display:flex;align-items:center;padding:0 24px 5px;background:#BC002D;border-radius:4px;font:700 40px/1 "FGAntonio",sans-serif;letter-spacing:.03em;text-transform:uppercase;white-space:nowrap}',
    '.fge .au{position:absolute;left:0;right:0;top:1290px;text-align:center;font:700 34px/1 "FGAntonio",sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#F5F5F7}',
    '.fge .cta{position:absolute;left:0;right:0;top:1350px;text-align:center;white-space:nowrap;font:600 30px "FGInter",sans-serif;color:#CFCFD4}',
    '.fge .cta b{color:#fff;font-weight:700}',
    '.fge .fl{display:inline-block;width:42px;height:28px;border-radius:4px;vertical-align:-4px;margin-left:12px}'
  ].join("\n");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var couv = function (u) { return /^https?:/.test(u || "") ? "/api/couv?u=" + encodeURIComponent(u) : (u || ""); };

  var style = document.createElement("style");
  style.textContent = '@font-face{font-family:"FGAntonio";src:url(/fonts/Antonio.ttf) format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(/fonts/Inter.ttf) format("truetype");font-weight:100 900}\n' + CSS;
  document.head.appendChild(style);

  var cache = {};
  function dataUrl(url) {
    if (!url) return Promise.resolve(null);
    if (/^data:/.test(url)) return Promise.resolve(url);
    if (!cache[url]) cache[url] = fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var f = new FileReader(); f.onload = function () { ok(f.result); }; f.readAsDataURL(b); });
    }).catch(function () { return null; });
    return cache[url];
  }
  function fonts() {
    return Promise.all([dataUrl("/fonts/Antonio.ttf"), dataUrl("/fonts/Inter.ttf")]).then(function (u) {
      return '@font-face{font-family:"FGAntonio";src:url(' + u[0] + ') format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(' + u[1] + ') format("truetype");font-weight:100 900}\n';
    });
  }
  // Titre : 240 px, réduit pour les titres longs (une seule ligne, ~1000 px de large).
  function taille(t) { var n = String(t || "").length || 1; return Math.max(110, Math.min(240, Math.floor(1000 / (n * 0.43)))); }
  function drapeau(p) { return p === "jp" ? "background:radial-gradient(circle,#BC002D 0 30%,#fff 31%)" : "background:linear-gradient(90deg,#2a52be 33%,#fff 33% 66%,#e1251b 66%)"; }

  function card(d, img) {
    var cover = img.cover, pls = img.planches.filter(Boolean);
    var bg = pls.length ? pls : [cover];
    var tuiles = ""; for (var k = 0; k < 9; k++) tuiles += '<img src="' + bg[k % bg.length] + '">';
    var devant = pls[0] || cover;
    var bas = "Extrait sur <b>" + esc(d.editeur || "l'éditeur") + "</b>" + (d.sortie ? " · tome " + esc(d.tome || 1) + " le " + esc(d.sortie) : "") + '<span class="fl" style="' + drapeau(d.pays) + '"></span>';
    return '<div class="fge">' +
      '<div class="bg">' + tuiles + '</div>' +
      '<img class="logo" src="/img/social/logo-blanc.png" alt="">' +
      '<img class="pl" src="' + devant + '" style="left:420px;top:210px;transform:rotate(7deg)">' +
      '<img class="pl" src="' + cover + '" style="left:100px;top:190px;transform:rotate(-5deg)">' +
      '<div class="grad"></div>' +
      '<div class="t" style="font-size:' + taille(d.titre) + 'px">' + esc(d.titre || "") + '</div>' +
      '<div class="tag">' + esc(d.tag || "Lis le chapitre 1") + '</div>' +
      (d.auteurs ? '<div class="au">' + esc(d.auteurs) + '</div>' : '') +
      '<div class="cta">' + bas + '</div>' +
    '</div>';
  }

  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function images(el) { return Promise.all([].map.call(el.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); })); }

  function png(d) {
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;height:1440px;overflow:hidden;pointer-events:none";
    var lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    var imgs = Promise.all([dataUrl(couv(d.cover))].concat((d.planches || []).map(function (u) { return dataUrl(couv(u)); })));
    return Promise.all([lib, imgs, fonts()]).then(function (r) {
      box.innerHTML = card(d, { cover: r[1][0] || couv(d.cover), planches: r[1].slice(1) });
      document.body.appendChild(box);
      return images(box).then(function () { return r[2]; });
    }).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '600 40px "FGInter"'];
      return Promise.all(names.map(function (f) { return document.fonts.load(f, "A"); })).then(function () {
        var opts = { width: W, height: H, pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false };
        var essai = function (k, prev) {
          return htmlToImage.toPng(box.firstChild, opts).then(function (u) {
            if (k >= 4 || (prev && Math.abs(u.length - prev.length) < 200 && k >= 2)) return u;
            return new Promise(function (ok) { setTimeout(ok, 150); }).then(function () { return essai(k + 1, u); });
          });
        };
        return essai(1, null);
      });
    }).finally(function () { box.remove(); });
  }

  window.FG_EXTRAIT = { card: card, png: png, SIZE: [W, H] };
})();
