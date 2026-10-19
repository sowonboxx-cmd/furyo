// Bannière « Tomes en circulation » pour le site (format 16/8.6, 1600 × 860) — validé par Will le 19/10/2026 (VB, ESP2).
// Même donnée que circ-card.js (l'affiche 4:5 des réseaux) ; ici en paysage : éventail des tomes à gauche,
// filet rouge, puis le chiffre en gros (Antonio) à droite. Pas de logo (c'est l'image de la news sur le site).
//
//   FG_CIRC_BANNER.png(d) → data URL PNG
//   d = { serie, nombre, plus?, covers:[url…], hero? }  (identique à FG_CIRC)
(function () {
  var SIZE = [1600, 860];
  var CSS = [
    '.fgb{width:1600px;height:860px;position:relative;overflow:hidden;background:#0c0c0e;color:#F2EFE9;font-family:"FGInter",sans-serif;line-height:normal;letter-spacing:normal;text-align:left}',
    '.fgb .fan{position:absolute;left:0;top:0;width:100%;height:100%}',
    '.fgb .fan img{position:absolute;border:4px solid #fff;border-radius:9px;object-fit:cover;box-shadow:0 26px 54px rgba(0,0,0,.72);background:#222;transform-origin:50% 92%}',
    '.fgb .div{position:absolute;left:52%;top:112px;bottom:112px;width:3px;background:#BC002D;z-index:2;border-radius:2px}',
    '.fgb .block{position:absolute;right:60px;top:50%;transform:translateY(-50%);z-index:3;text-align:right}',
    '.fgb .eyebrow{font:800 30px "FGAntonio",sans-serif;letter-spacing:.11em;text-transform:uppercase;color:#FF2E43}',
    '.fgb .big{font-family:"FGAntonio",sans-serif;font-weight:700;letter-spacing:.01em;color:#F2B33D;line-height:.82;white-space:nowrap}',
    '.fgb .big .u{color:#BC002D;vertical-align:top}',
    '.fgb .lab{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.015em;color:#F2EFE9}',
    '.fgb .jp{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#F2EFE9}'
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

  // Éventail à gauche : le hero au centre (devant, plus grand), les autres tomes répartis symétriquement
  // autour (slots entiers ±1, ±2… jamais 0, pour qu'aucun ne soit caché), puis remis dans l'ordre des tomes.
  function fanHTML(imgs, heroIdx) {
    var cx = 440, cy = 440, heroW = 348, otherW = 260, HH = Math.round(heroW * 1.5), OH = Math.round(otherW * 1.5), step = 132;
    var others = [], hero = null;
    imgs.forEach(function (src, i) { if (i === heroIdx) hero = src; else others.push(src); });
    var slots = []; for (var i = 1; slots.length < others.length; i++) { slots.push(-i); if (slots.length < others.length) slots.push(i); }
    slots.sort(function (a, b) { return a - b; });
    var html = "";
    others.forEach(function (src, k) {
      var slot = slots[k], dx = slot * step, dy = Math.round(Math.abs(slot) * 28), ang = Math.max(-26, Math.min(26, slot * 12)), z = Math.round(10 - Math.abs(slot));
      var x = cx + dx - otherW / 2, y = cy + dy - OH / 2;
      html += '<img src="' + src + '" style="left:' + x + 'px;top:' + y + 'px;width:' + otherW + 'px;height:' + OH + 'px;transform:rotate(' + ang + 'deg);z-index:' + z + '">';
    });
    if (hero) html += '<img src="' + hero + '" style="left:' + (cx - heroW / 2) + 'px;top:' + (cy - Math.round(HH * 0.04) - HH / 2) + 'px;width:' + heroW + 'px;height:' + HH + 'px;transform:rotate(0deg);z-index:20">';
    return html;
  }

  // Bloc chiffre : « 30 MILLIONS » → « +30 » puis « MILLIONS » (empilé) ; un nombre seul (« 100 000 ») reste sur une ligne.
  function bigHTML(nombre, plus) {
    var u = plus === false ? "" : '<span class="u">+</span>';
    var m = String(nombre || "").match(/^(.+?)\s+(MILLIONS?|MILLIARDS?)$/i);
    if (m) {
      return '<div class="big" style="font-size:200px">' + u + esc(m[1]) + '</div>' +
             '<div class="big" style="font-size:146px;margin-top:34px">' + esc(m[2].toUpperCase()) + '</div>';
    }
    return '<div class="big" style="font-size:150px">' + u + esc(nombre || "") + '</div>';
  }

  function card(d, embedded) {
    var covers = embedded || (d.covers || []).map(couv);
    var hero = (d.hero != null && d.hero >= 0 && d.hero < covers.length) ? d.hero : (covers.length - 1);
    return '<div class="fgb">' +
      '<div class="fan">' + fanHTML(covers, hero) + '</div>' +
      '<div class="div"></div>' +
      '<div class="block">' +
        '<div class="eyebrow">' + esc(d.serie || "") + '</div>' +
        '<div style="margin-top:14px">' + bigHTML(d.nombre, d.plus) + '</div>' +
        '<div class="lab" style="font-size:46px;margin-top:26px">de tomes en circulation</div>' +
        '<div class="jp" style="font-size:32px;margin-top:10px">Au Japon</div>' +
      '</div></div>';
  }

  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function images(el) { return Promise.all([].map.call(el.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); })); }

  function png(d) {
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-30000px;top:0;width:1600px;height:860px;overflow:hidden;pointer-events:none";
    var lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    var covs = Promise.all((d.covers || []).map(function (u) { return dataUrl(couv(u)); }));
    return Promise.all([lib, covs, fonts()]).then(function (r) {
      box.innerHTML = card(d, r[1].map(function (u, i) { return u || couv(d.covers[i]); }));
      document.body.appendChild(box);
      return images(box).then(function () { return r[2]; });
    }).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '800 40px "FGAntonio"', '500 40px "FGInter"'];
      return Promise.all(names.map(function (f) { return document.fonts.load(f, "A"); })).then(function () {
        var opts = { width: 1600, height: 860, pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false };
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

  window.FG_CIRC_BANNER = { card: card, png: png, SIZE: SIZE };
})();
