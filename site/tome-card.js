// Visuel « Sortie d'un tome » (design « Soleil » du Studio, standard validé par Will le 03/10/2026 :
// couverture 652 × 912, soit +20 %, qui cache le haut et le bas du cercle ; drapeau juste sous les auteurs) en post 3:4 (1080×1440) et story 9:16 (1080×1920),
// thème sombre ou crème. Utilisé par l'écran Validation du back-office.
// FG_TOME.png(d, { theme: "sombre" | "creme", fmt: "post" | "story" }) → data URL PNG.
// d = { titre, n, jp, date (AAAA-MM-JJ), prec ("Jour" | "Mois"), cover (URL officielle), auteurs: [noms], pays ("France" | "Japon") }
(function () {
  var FONT_JP = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=";
  var SIZE = { post: [1080, 1440], story: [1080, 1920] };
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var FLAG = {
    Japon: '<svg viewBox="0 0 22 15"><rect width="22" height="15" fill="#fff"/><circle cx="11" cy="7.5" r="4.4" fill="#BC002D"/></svg>',
    France: '<svg viewBox="0 0 22 15"><rect width="7.34" height="15" fill="#2F5DA8"/><rect x="7.33" width="7.34" height="15" fill="#fff"/><rect x="14.66" width="7.34" height="15" fill="#E5483A"/></svg>'
  };
  var CSS = [
    '.fgt{width:1080px;height:1440px;position:relative;overflow:hidden;font-family:"FGInter",sans-serif;--fg:#fff;--bg:#0c0c0e;--muted:rgba(255,255,255,.62);--cream:#F2EFE9;--red:#BC002D;',
    '  --top:48px;--cy:606px;--r:400px;background:var(--bg);color:var(--fg);line-height:normal;letter-spacing:normal;text-align:left}',
    '.fgt.creme{--fg:#0c0c0e;--bg:#F2EFE9;--muted:rgba(12,12,14,.6)}',
    // Story : 200 px libres en haut, 250 px en bas (sticker lien), tout est descendu d'autant.
    '.fgt.story{height:1920px;--top:250px;--cy:850px}',
    '.fgt .blur{position:absolute;inset:-80px;background-size:cover;background-position:center;filter:blur(60px) saturate(1.3);opacity:.5}',
    '.fgt.creme .blur{opacity:.28}',
    '.fgt .shade{position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--bg) 35%,transparent) 0%,color-mix(in srgb,var(--bg) 70%,transparent) 48%,var(--bg) 76%)}',
    '.fgt .sun{position:absolute;width:calc(var(--r) * 2);height:calc(var(--r) * 2);border-radius:50%;background:var(--red);left:50%;top:calc(var(--cy) - var(--r));transform:translateX(-50%)}',
    '.fgt .logo{position:absolute;left:50%;top:var(--top);transform:translateX(-50%);width:290px}',
    '.fgt .cover{position:absolute;left:50%;top:calc(var(--cy) - 456px);width:652px;height:912px;transform:translateX(-50%);object-fit:cover;box-sizing:border-box;border:12px solid #fff;box-shadow:0 40px 90px rgba(0,0,0,.55)}',
    '.fgt .num{position:absolute;left:72px;top:var(--cy);transform:translate(-50%,-50%);font-family:"FGAntonio",sans-serif;font-weight:700;font-size:124px;line-height:.8;letter-spacing:-.02em;color:var(--fg)}',
    '.fgt .jpw{position:absolute;left:calc(50% + var(--r));right:0;top:var(--cy);transform:translateY(-50%);display:flex;justify-content:center}',
    '.fgt .jp{writing-mode:vertical-rl;font-family:"FGNotoJP",sans-serif;font-weight:900;font-size:var(--js,56px);line-height:1;letter-spacing:.06em;color:var(--fg);max-height:720px;overflow:hidden;white-space:nowrap}',
    '.fgt .info{position:absolute;left:64px;right:64px;top:calc(var(--cy) + 482px);display:flex;flex-direction:column;align-items:center;text-align:center}',
    '.fgt .date{font-family:"FGAntonio",sans-serif;font-weight:700;font-size:36px;letter-spacing:.06em;text-transform:uppercase;background:var(--red);color:#fff;padding:6px 20px;border-radius:6px}',
    '.fgt .title{margin-top:18px;font-family:"FGAntonio",sans-serif;font-weight:700;font-size:108px;line-height:.92;text-transform:uppercase;letter-spacing:.005em}',
    '.fgt .title.s{font-size:88px}.fgt .title.xs{font-size:68px}',
    '.fgt .who{margin-top:16px;font-family:"FGAntonio",sans-serif;font-weight:700;font-size:30px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}',
    '.fgt .who i{font-style:normal;margin:0 14px;opacity:.5}',
    '.fgt .flag{margin-top:26px;width:60px;height:41px;border-radius:5px;overflow:hidden}',
    '.fgt .flag svg{display:block;width:100%;height:100%}'
  ].join("\n");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var couv = function (u) { return u ? "/api/couv?u=" + encodeURIComponent(u) : ""; };
  var CJK = /[぀-ヿ㐀-鿿]/;
  // Titre japonais vertical : sans la partie entre parenthèses ; si le titre est en lettres latines, on prend la lecture entre parenthèses.
  function jpOf(j) { j = j || ""; var out = j.replace(/[（(].*?[)）]/g, "").trim(); if (CJK.test(out)) return out; var m = j.match(/[（(](.*?)[)）]/); return m && CJK.test(m[1]) ? m[1] : ""; }
  function dateLong(d, prec) { if (!d) return ""; var o = new Date(d + "T12:00:00"); return (prec === "Mois" ? "" : o.getDate() + " ") + MOIS[o.getMonth()] + " " + o.getFullYear(); }

  var style = document.createElement("style");
  style.textContent = '@font-face{font-family:"FGAntonio";src:url(/fonts/Antonio.ttf) format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(/fonts/Inter.ttf) format("truetype");font-weight:100 900}\n' + CSS;
  document.head.appendChild(style);
  var cache = {};
  function dataUrl(url) {
    if (!cache[url]) cache[url] = fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var f = new FileReader(); f.onload = function () { ok(f.result); }; f.readAsDataURL(b); });
    });
    return cache[url];
  }
  var jpDone = {};
  function fonts(jp) {
    var txt = Array.from(new Set(String(jp || "").split(""))).join("");
    var base = Promise.all([dataUrl("/fonts/Antonio.ttf"), dataUrl("/fonts/Inter.ttf")]).then(function (u) {
      return '@font-face{font-family:"FGAntonio";src:url(' + u[0] + ') format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(' + u[1] + ') format("truetype");font-weight:100 900}\n';
    });
    var jpCss = !txt ? Promise.resolve("") : (jpDone[txt] || (jpDone[txt] = fetch(FONT_JP + encodeURIComponent(txt)).then(function (r) { return r.text(); }).then(function (css) {
      var m = css.match(/url\((https:[^)]+)\)/); if (!m) throw new Error("police");
      return dataUrl(m[1]).then(function (u) { return '@font-face{font-family:"FGNotoJP";src:url(' + u + ');font-weight:900}\n'; });
    }).catch(function () { return dataUrl("/fonts/NotoSansJP.ttf").then(function (u) { return '@font-face{font-family:"FGNotoJP";src:url(' + u + ') format("truetype");font-weight:100 900}\n'; }); })));
    return Promise.all([base, jpCss]).then(function (c) {
      var el = document.getElementById("fgt-jp"); if (!el) { el = document.createElement("style"); el.id = "fgt-jp"; document.head.appendChild(el); }
      if (c[1]) el.textContent = c[1];
      return c[0] + c[1];
    });
  }

  function card(d, theme, fmt) {
    var t = d.titre || "", j = jpOf(d.jp), n = d.n != null ? String(d.n).padStart(2, "0") : "";
    var size = t.length > 26 ? "xs" : t.length > 16 ? "s" : "";
    var js = Math.min(56, Math.floor(640 / (Math.max(1, Array.from(j).length) * 1.12))) + "px";
    var who = (d.auteurs || []).filter(Boolean).slice(0, 2).map(esc).join("<i>·</i>");
    var c = couv(d.cover);
    return '<div class="fgt ' + (theme === "creme" ? "creme" : "sombre") + " " + fmt + '">' +
      (c ? '<div class="blur" style="background-image:url(\'' + c + '\')"></div>' : "") + '<div class="shade"></div><div class="sun"></div>' +
      '<img class="logo" src="/img/social/logo-' + (theme === "creme" ? "noir" : "blanc") + '.png" alt="">' +
      (c ? '<img class="cover" src="' + c + '" alt="">' : "") +
      (n ? '<div class="num">' + n + "</div>" : "") +
      (j ? '<div class="jpw"><div class="jp" lang="ja" style="--js:' + js + '">' + esc(j) + "</div></div>" : "") +
      '<div class="info">' + (d.date ? '<span class="date">' + esc(dateLong(d.date, d.prec)) + "</span>" : "") +
      '<div class="title ' + size + '">' + esc(t) + "</div>" + (who ? '<div class="who">' + who + "</div>" : "") +
      (FLAG[d.pays] ? '<div class="flag">' + FLAG[d.pays] + "</div>" : "") + "</div></div>";
  }
  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function images(el) {
    return Promise.all([].map.call(el.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); }));
  }
  function png(d, o) {
    o = o || {}; var theme = o.theme || "sombre", fmt = o.fmt || "post", wh = SIZE[fmt];
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:" + wh[0] + "px;height:" + wh[1] + "px;overflow:hidden;pointer-events:none";
    box.innerHTML = card(d, theme, fmt); document.body.appendChild(box);
    var lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    return lib.then(function () { return fonts(d.jp); }).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '500 40px "FGInter"'].concat(jpOf(d.jp) ? ['900 40px "FGNotoJP"'] : []);
      return Promise.all(names.map(function (f) { return document.fonts.load(f, jpOf(d.jp) || "A"); })).then(function () { return images(box); }).then(function () { return fcss; });
    }).then(function (fcss) {
      // Safari dessine parfois avant d'avoir intégré polices et photos : on recommence jusqu'à ce que le résultat ne change plus.
      var opts = { width: wh[0], height: wh[1], pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false };
      var essai = function (k, prev) {
        return htmlToImage.toPng(box.firstChild, opts).then(function (u) {
          if (k >= 4 || (prev && Math.abs(u.length - prev.length) < 200 && k >= 2)) return u;
          return new Promise(function (ok) { setTimeout(ok, 150); }).then(function () { return essai(k + 1, u); });
        });
      };
      return essai(1, null);
    }).finally(function () { box.remove(); });
  }
  window.FG_TOME = { card: card, png: png, SIZE: SIZE };
})();
