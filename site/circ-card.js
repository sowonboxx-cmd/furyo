// Visuel « Tomes en circulation » (template validé par Will le 19/10/2026, format « F3 ») en post 4:5 (1080 × 1350).
// Éventail des tomes de la série, le tome mis en avant au centre et plus grand (par défaut le dernier dispo),
// nom de la série (rouge), le chiffre en gros (jaune), « DE TOMES EN CIRCULATION » qui déborde un peu sur le chiffre,
// puis « AU JAPON ». Même esprit que tome-card.js : couvertures via /api/couv, polices embarquées, rendu html-to-image.
//
//   FG_CIRC.png(d) → data URL PNG
//   d = { serie, nombre, mot?, plus?, covers:[url…], hero? }
//     serie   : nom affiché (ex. "The Fable · La saga")
//     nombre  : le chiffre en gros, déjà formaté (ex. "30 MILLIONS", "100 000")
//     plus    : true (défaut) → préfixe "+" rouge devant le chiffre
//     covers  : URLs des couvertures, dans l'ordre des tomes (croissant)
//     hero    : index du tome mis en avant (défaut : le dernier = le plus récent)
(function () {
  var SIZE = [1080, 1350];
  var CSS = [
    '.fgc{width:1080px;height:1350px;position:relative;overflow:hidden;background:#0c0c0e;color:#F2EFE9;font-family:"FGInter",sans-serif;line-height:normal;letter-spacing:normal;text-align:left}',
    '.fgc .logo{position:absolute;left:50%;top:82px;transform:translateX(-50%);height:88px}',
    '.fgc .fan{position:absolute;left:0;right:0;top:238px;height:470px}',
    '.fgc .fan img{position:absolute;left:50%;bottom:0;border:4px solid #fff;border-radius:7px;object-fit:cover;box-shadow:0 20px 46px rgba(0,0,0,.66);background:#222;transform-origin:50% 95%}',
    '.fgc .block{position:absolute;left:0;right:0;top:782px;text-align:center}',
    '.fgc .eyebrow{font:800 36px "FGAntonio",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FF2E43}',
    '.fgc .big{font:700 196px/.82 "FGAntonio",sans-serif;letter-spacing:.01em;color:#F2B33D;margin-top:14px;white-space:nowrap}',
    '.fgc .big .u{font-size:88px;color:#BC002D;vertical-align:top}',
    '.fgc .lab{font:700 64px/1 "FGAntonio",sans-serif;text-transform:uppercase;letter-spacing:.015em;color:#F2EFE9;margin-top:4px;position:relative;z-index:3;text-shadow:0 2px 10px #0c0c0e,0 0 22px #0c0c0e,0 0 22px #0c0c0e}',
    '.fgc .jp{font:700 46px "FGAntonio",sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#F2EFE9;margin-top:16px}'
  ].join("\n");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var couv = function (u) { return /^https?:/.test(u || "") ? "/api/couv?u=" + encodeURIComponent(u) : (u || ""); };

  var style = document.createElement("style");
  style.textContent = '@font-face{font-family:"FGAntonio";src:url(/fonts/Antonio.ttf) format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(/fonts/Inter.ttf) format("truetype");font-weight:100 900}\n' + CSS;
  document.head.appendChild(style);

  var cache = {};
  function dataUrl(url) {
    if (!url) return Promise.resolve(null);
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

  // Éventail : le hero au centre, devant et plus grand ; les autres tomes répartis symétriquement derrière,
  // dans l'ordre des tomes (moitié à gauche, moitié à droite). Fonctionne pour 3, 4, 5+ tomes.
  function fanHTML(imgs, heroIdx) {
    var W = 224, H = 318, HW = 276, HH = 392, STEP = 138;
    var others = [], hero = null;
    imgs.forEach(function (src, i) { if (i === heroIdx) hero = src; else others.push(src); });
    // Le hero est au centre (slot 0). Les autres prennent les slots entiers ±1, ±2… (jamais 0),
    // pour qu'aucun tome ne soit caché derrière le hero, puis on les classe par ordre de tome.
    var slots = []; for (var i = 1; slots.length < others.length; i++) { slots.push(-i); if (slots.length < others.length) slots.push(i); }
    slots.sort(function (a, b) { return a - b; });
    var html = "";
    others.forEach(function (src, k) {
      var slot = slots[k];
      var dx = slot * STEP, dy = Math.round(Math.abs(slot) * 22), ang = Math.max(-26, Math.min(26, slot * 14)), z = Math.round(10 - Math.abs(slot));
      html += '<img src="' + src + '" style="width:' + W + 'px;height:' + H + 'px;transform:translateX(calc(-50% + ' + dx + 'px)) translateY(' + dy + 'px) rotate(' + ang + 'deg);z-index:' + z + '">';
    });
    if (hero) html += '<img src="' + hero + '" style="width:' + HW + 'px;height:' + HH + 'px;transform:translateX(-50%) translateY(-14px);z-index:20">';
    return html;
  }

  function card(d, embedded) {
    var covers = embedded || (d.covers || []).map(couv);
    var hero = (d.hero != null && d.hero >= 0 && d.hero < covers.length) ? d.hero : (covers.length - 1);
    var plus = d.plus === false ? "" : '<span class="u">+</span>';
    return '<div class="fgc">' +
      '<img class="logo" src="/img/social/logo-blanc.png" alt="">' +
      '<div class="fan">' + fanHTML(covers, hero) + '</div>' +
      '<div class="block">' +
        '<div class="eyebrow">' + esc(d.serie || "") + '</div>' +
        '<div class="big">' + plus + esc(d.nombre || "") + '</div>' +
        '<div class="lab">de tomes en circulation</div>' +
        '<div class="jp">Au Japon</div>' +
      '</div></div>';
  }

  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function images(el) { return Promise.all([].map.call(el.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); })); }

  function png(d) {
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;height:1350px;overflow:hidden;pointer-events:none";
    var lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    // Couvertures intégrées en data URL avant le dessin (évite qu'un export réutilise l'image précédente, cf. tome-card.js).
    var covs = Promise.all((d.covers || []).map(function (u) { return dataUrl(couv(u)); }));
    return Promise.all([lib, covs, fonts()]).then(function (r) {
      box.innerHTML = card(d, r[1].map(function (u, i) { return u || couv(d.covers[i]); }));
      document.body.appendChild(box);
      return images(box).then(function () { return r[2]; });
    }).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '800 40px "FGAntonio"', '500 40px "FGInter"'];
      return Promise.all(names.map(function (f) { return document.fonts.load(f, "A"); })).then(function () {
        var opts = { width: 1080, height: 1350, pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false };
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

  window.FG_CIRC = { card: card, png: png, SIZE: SIZE };
})();
