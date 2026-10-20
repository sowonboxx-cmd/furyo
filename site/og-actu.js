// Carte de partage (og:image) des actualités — format paysage 1200×630 pour les aperçus de liens (X, Discord, WhatsApp…).
// Design « dossier » : à gauche le logo, un badge catégorie + date, le titre et l'accroche ; à droite la couverture.
// Validé par Will le 20/10/2026 (même style que Hell Dogs / Bumpoor). Source unique, utilisée par le back-office.
//   FG_OGACTU.card(d, embedded?) → HTML de la carte
//   FG_OGACTU.png(d) → data URL PNG 1200×630
//   d = { titre, cat, date, desc, cover }   (cat = libellé du badge ; date = ISO "2026-10-19")
(function () {
  var SIZE = [1200, 630];
  var CSS = [
    '.oga{width:1200px;height:630px;position:relative;overflow:hidden;background:#000;font-family:"FGInter",sans-serif;line-height:normal;letter-spacing:normal;text-align:left;color:#fff}',
    '.oga *{box-sizing:border-box}',
    '.oga .oga-glow{position:absolute;right:-120px;top:50%;transform:translateY(-50%);width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,0) 62%)}',
    '.oga .oga-cover{position:absolute;right:74px;top:50%;height:548px;transform:translateY(-50%) rotate(2.4deg);border:9px solid #fff;border-radius:6px;box-shadow:0 30px 72px rgba(0,0,0,.65);object-fit:cover;background:#222;z-index:2}',
    '.oga .oga-left{position:absolute;left:64px;top:50%;transform:translateY(-50%);width:600px;z-index:3}',
    '.oga .oga-logo{width:250px;display:block;margin-bottom:30px}',
    '.oga .oga-badge{display:inline-block;background:#E0123F;color:#fff;font-family:"FGAntonio",sans-serif;font-weight:700;font-size:30px;line-height:1;text-transform:uppercase;letter-spacing:.07em;padding:11px 20px 9px;border-radius:8px}',
    '.oga .oga-title{font-family:"FGAntonio",sans-serif;font-weight:700;font-size:96px;line-height:.96;letter-spacing:.01em;color:#fff;text-transform:uppercase;margin:22px 0 0;overflow-wrap:anywhere}',
    '.oga .oga-title.oga-s{font-size:76px}.oga .oga-title.oga-xs{font-size:60px}',
    '.oga .oga-desc{font-family:"FGInter",sans-serif;font-weight:500;font-size:34px;line-height:1.4;color:#e9e9ec;margin-top:22px;max-width:560px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}'
  ].join("\n");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var couv = function (u) { return /^https?:/.test(u || "") ? "/api/couv?u=" + encodeURIComponent(u) : (u || ""); };
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var dateFR = function (iso) { if (!iso) return ""; var p = String(iso).split("-"); if (p.length < 3) return ""; return Number(p[2]) + " " + (MOIS[Number(p[1]) - 1] || "") + " " + p[0]; };

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

  function card(d, embedded) {
    var cover = embedded || couv(d.cover);
    var t = String(d.titre || "");
    var cls = t.length > 22 ? " oga-xs" : t.length > 15 ? " oga-s" : "";
    var badge = [String(d.cat || "News").toUpperCase(), dateFR(d.date)].filter(Boolean).join(" · ");
    return '<div class="oga">' +
      '<div class="oga-glow"></div>' +
      (cover ? '<img class="oga-cover" src="' + cover + '" alt="">' : '') +
      '<div class="oga-left">' +
        '<img class="oga-logo" src="/img/social/logo-blanc.png" alt="FuryoGang">' +
        '<span class="oga-badge">' + esc(badge) + '</span>' +
        '<div class="oga-title' + cls + '">' + esc(t) + '</div>' +
        (d.desc ? '<div class="oga-desc">' + esc(d.desc) + '</div>' : '') +
      '</div></div>';
  }

  function charger(src) { return window.htmlToImage ? Promise.resolve() : new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function images(el) { return Promise.all([].map.call(el.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); })); }

  function png(d) {
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:1200px;height:630px;overflow:hidden;pointer-events:none";
    var lib = charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    var cov = dataUrl(couv(d.cover));
    return Promise.all([lib, cov, fonts()]).then(function (r) {
      box.innerHTML = card(d, r[1] || couv(d.cover));
      document.body.appendChild(box);
      return images(box).then(function () { return r[2]; });
    }).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '500 40px "FGInter"'];
      return Promise.all(names.map(function (f) { return document.fonts.load(f, "A"); })).then(function () {
        var opts = { width: 1200, height: 630, pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false };
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

  window.FG_OGACTU = { card: card, png: png, SIZE: SIZE };
})();
