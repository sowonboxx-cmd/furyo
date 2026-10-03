// Image « Nouvelle fiche » (design « Dossier »), partagée par le Studio et le back-office.
// FG_FICHE.card(d, theme, fmt) : le HTML de la carte ; FG_FICHE.polish(el) : mise en page fine ;
// FG_FICHE.png(d, { theme, fmt }) : génère le PNG (1080×1440 en post 3:4, 1080×1920 en story 9:16).
// d = { t, jp, cover, type, genres[], y1, pubs[], scen, dess, resume, n, tot }
(function () {
  var FONT_JP = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=";
  var CSS = [
    '.fgc{width:1080px;height:1440px;position:relative;overflow:hidden;font-family:"FGInter",sans-serif;font-weight:500;display:flex;flex-direction:column;box-sizing:border-box;',
    '  --bg:#F2EFE9;--fg:#0c0c0e;--muted:rgba(12,12,14,.58);--track:rgba(12,12,14,.12);--on:#0c0c0e;--res:#26262a;--bar:#0c0c0e;--red:#BC002D;',
    '  --safe-top:0px;--safe-bot:0px;background:var(--bg);color:var(--fg);text-align:left;line-height:normal;letter-spacing:normal}',
    '.fgc *{box-sizing:border-box}',
    '.fgc.dark{--bg:#121214;--fg:#F5F5F7;--muted:rgba(245,245,247,.58);--track:rgba(245,245,247,.13);--on:#F5F5F7;--res:#D9D9DE;--bar:#000}',
    '.fgc.story{height:1920px;--safe-top:200px;--safe-bot:250px}',
    '.fgc .fgc-A{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase}',
    '.fgc .fgc-top{flex:none;background:var(--bar);padding:calc(var(--safe-top) + 36px) 64px 36px;display:flex;align-items:center;justify-content:space-between}',
    '.fgc.dark .fgc-top{border-bottom:1px solid rgba(255,255,255,.08)}',
    '.fgc .fgc-top img{width:250px;display:block}',
    '.fgc .fgc-top .fgc-A{color:#fff;font-size:52px;letter-spacing:.06em;line-height:1}',
    '.fgc .fgc-top .fgc-A span{color:#E0123F}',
    '.fgc .fgc-main{flex:1;min-height:0;display:flex;flex-direction:column;padding:56px 64px calc(var(--safe-bot) + 60px)}',
    '.fgc .fgc-hero{display:flex;gap:46px;align-items:flex-start;flex:none}',
    '.fgc .fgc-cover{flex:none;width:400px;height:560px;object-fit:cover;border:10px solid #fff;box-shadow:0 24px 60px rgba(0,0,0,.28);background:#222;display:block}',
    '.fgc.story .fgc-cover{width:410px;height:574px}',
    '.fgc.post .fgc-cover{width:420px;height:588px}',
    '.fgc.post dt,.fgc.post dd{font-size:31px}',
    '.fgc.post dl{gap:14px 20px}',
    '.fgc.post .fgc-res{margin-top:56px}',
    '.fgc.post .fgc-res p{font-size:38px}',
    '.fgc.story .fgc-main{padding-top:64px}',
    '.fgc.story .fgc-t{font-size:108px}',
    '.fgc.story .fgc-jp{font-size:32px}',
    '.fgc.story dt,.fgc.story dd{font-size:32px}',
    '.fgc.story dl{gap:16px 20px;margin-top:30px}',
    '.fgc.story .fgc-res{margin-top:56px}',
    '.fgc.story .fgc-res p{font-size:39px}',
    '.fgc.story .fgc-row .fgc-A{font-size:50px}',
    '.fgc.story .fgc-seg i{height:40px}',
    '.fgc.story .fgc-cap{font-size:32px}',
    '.fgc .fgc-info{flex:1;min-width:0;position:relative}',
    '.fgc .fgc-kick{display:inline-flex;align-items:center;height:56px;padding:0 22px;border-radius:6px;background:var(--red);color:#fff;font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:34px;line-height:1}',
    '.fgc .fgc-kick span{display:block;transform:translateY(-1px)}',
    '.fgc .fgc-t{margin:20px 0 0;font-size:96px;line-height:.92;overflow-wrap:anywhere}',
    '.fgc .fgc-t.fgc-one{white-space:nowrap;overflow:hidden}',
    '.fgc .fgc-t.fgc-clamp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
    '.fgc .fgc-jp{margin-top:10px;line-height:1.4;padding-bottom:4px;font-family:"FGNotoJP","FGInter",sans-serif;font-weight:700;font-size:30px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fgc dl{margin:26px 0 0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px 20px;align-items:baseline}',
    '.fgc dt{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-size:30px;line-height:1.15;white-space:nowrap}',
    '.fgc dd{margin:0;font-weight:700;font-size:30px;line-height:1.15;white-space:nowrap;overflow:hidden}',
    '.fgc .fgc-cv{position:relative;flex:none}',
    '.fgc .fgc-res{flex:1;min-height:0;margin:52px 0 0;overflow:hidden}',
    '.fgc .fgc-res p{margin:0;font-size:36px;line-height:1.42;color:var(--res);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--lines,5);overflow:hidden}',
    '.fgc .fgc-res b{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--red);margin-right:12px}',
    '.fgc .fgc-prog{flex:none;margin-top:24px}',
    '.fgc .fgc-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px}',
    '.fgc .fgc-row .fgc-A{font-size:46px;letter-spacing:.03em;line-height:1}',
    '.fgc .fgc-row .fgc-A span{color:var(--muted)}',
    '.fgc .fgc-seg{display:grid;grid-template-columns:repeat(20,1fr);gap:6px}',
    '.fgc .fgc-seg i{height:36px;border-radius:4px;background:var(--track)}',
    '.fgc .fgc-seg i.fgc-on{background:var(--on)}',
    '.fgc .fgc-seg i.fgc-part{background:linear-gradient(90deg,var(--red) var(--p),var(--track) var(--p))}',
    '.fgc .fgc-cap{margin-top:16px;font-size:30px;color:var(--muted);font-weight:700}'
  ].join("\n");
  var SIZE = { post: [1080, 1440], story: [1080, 1920] };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var parts = function (s) { return String(s || "").split(/\s*[,&/]\s*|\s+et\s+/).map(function (x) { return x.trim(); }).filter(Boolean); };
  var pad = function (d) { return String(d.n).padStart(Math.max(3, String(d.tot).length), "0"); };
  var pct = function (d) { return (Math.round(d.n / d.tot * 1000) / 10).toLocaleString("fr-FR") + " %"; };
  var couv = function (u) { return u ? "/api/couv?u=" + encodeURIComponent(u) : ""; };

  // Polices : Antonio et Inter depuis le site ; le japonais seulement pour les caractères du titre (léger sur téléphone).
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
  function fontsFor(jp) {
    var txt = Array.from(new Set(String(jp || "").split(""))).join("");
    var base = Promise.all([dataUrl("/fonts/Antonio.ttf"), dataUrl("/fonts/Inter.ttf")]).then(function (u) {
      return '@font-face{font-family:"FGAntonio";src:url(' + u[0] + ') format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(' + u[1] + ') format("truetype");font-weight:100 900}\n';
    });
    var jpCss = !txt ? Promise.resolve("") : (jpDone[txt] || (jpDone[txt] = fetch(FONT_JP + encodeURIComponent(txt)).then(function (r) { return r.text(); }).then(function (css) {
      var m = css.match(/url\((https:[^)]+)\)/); if (!m) throw new Error("police");
      return dataUrl(m[1]).then(function (u) { return '@font-face{font-family:"FGNotoJP";src:url(' + u + ');font-weight:700}\n'; });
    }).catch(function () { return dataUrl("/fonts/NotoSansJP.ttf").then(function (u) { return '@font-face{font-family:"FGNotoJP";src:url(' + u + ') format("truetype");font-weight:100 900}\n'; }); })));
    return Promise.all([base, jpCss]).then(function (c) {
      // Les mêmes polices servent à la mise en page à l'écran et à l'image.
      var id = "fgc-jp"; var el = document.getElementById(id); if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
      if (c[1]) el.textContent = c[1];
      return c[0] + c[1];
    });
  }

  function card(d, theme, fmt) {
    var p = d.n / d.tot * 20;
    var rows = [
      ["Histoire", d.scen ? parts(d.scen) : []],
      ["Dessin", d.dess && d.dess !== d.scen ? parts(d.dess) : []],
      ["Type", d.type ? [d.type] : []],
      ["Genres", d.genres || []],
      ["Début", d.y1 ? [String(d.y1)] : []],
      ["En France", d.pubs || []]
    ].filter(function (r) { return r[1].length; });
    var seg = ""; for (var i = 0; i < 20; i++) seg += i + 1 <= Math.floor(p) ? '<i class="fgc-on"></i>' : i < p ? '<i class="fgc-part" style="--p:' + Math.round((p - i) * 100) + '%"></i>' : "<i></i>";
    return '<div class="fgc ' + theme + " " + fmt + '">' +
      '<div class="fgc-top"><img src="/img/social/logo-blanc.png" alt=""><span class="fgc-A">Fiche <span>n°' + pad(d) + '</span></span></div>' +
      '<div class="fgc-main"><div class="fgc-hero">' +
        '<div class="fgc-cv">' + (d.cover ? '<img class="fgc-cover" src="' + couv(d.cover) + '" alt="">' : '<div class="fgc-cover"></div>') + '</div>' +
        '<div class="fgc-info"><span class="fgc-kick"><span>Nouvelle fiche</span></span>' +
          '<p class="fgc-t fgc-A">' + esc(d.t) + '</p>' + (d.jp ? '<div class="fgc-jp" lang="ja">' + esc(d.jp) + '</div>' : "") +
          '<dl>' + rows.map(function (r) { return "<dt>" + r[0] + '</dt><dd data-items="' + esc(JSON.stringify(r[1])) + '">' + esc(r[1].join(", ")) + "</dd>"; }).join("") + '</dl>' +
        '</div></div>' +
        '<div class="fgc-res">' + (d.resume ? "<p><b>Résumé</b>" + esc(d.resume) + "</p>" : "") + '</div>' +
        '<div class="fgc-prog"><div class="fgc-row"><span class="fgc-A">La base FuryoGang · ' + d.n + ' <span>/ ' + d.tot + '</span></span><span class="fgc-A">' + pct(d) + '</span></div>' +
          '<div class="fgc-seg">' + seg + '</div><div class="fgc-cap">De nouvelles fiches chaque semaine</div></div>' +
      '</div></div>';
  }

  // Titre : d'abord sur une ligne en réduisant un peu la police, sinon sur deux lignes,
  // et en dernier recours deux lignes terminées par « … ». Jamais trois lignes, et le bloc de droite
  // ne dépasse jamais la hauteur de la couverture.
  function polish(c) {
    var t = c.querySelector(".fgc-t"), info = c.querySelector(".fgc-info"), cover = c.querySelector(".fgc-cover");
    var big = c.classList.contains("story") ? 108 : 96, one = Math.round(big * 0.8), min = Math.round(big * 0.6);
    var lh = function (s) { return s * 0.92; };
    var tient = function () { return !cover || info.offsetHeight <= cover.offsetHeight + 2; };
    var ok = false, s;
    t.classList.remove("fgc-clamp"); t.classList.add("fgc-one");
    for (s = big; s >= one; s -= 2) { t.style.fontSize = s + "px"; if (t.scrollWidth <= t.clientWidth + 1 && tient()) { ok = true; break; } }
    if (!ok) {
      t.classList.remove("fgc-one");
      for (s = one; s >= min; s -= 2) { t.style.fontSize = s + "px"; if (t.offsetHeight <= lh(s) * 2 + 4 && tient()) { ok = true; break; } }
    }
    if (!ok) {
      // Toujours trop long : on coupe au dernier mot qui tient sur deux lignes et on ajoute « … » (écrit en dur, pour l'image).
      t.style.fontSize = min + "px"; var w = (t.dataset.full || (t.dataset.full = t.textContent)).split(" ");
      while (w.length > 1 && (t.offsetHeight > lh(min) * 2 + 4 || !tient())) { w.pop(); t.textContent = w.join(" ").replace(/[\s\-–:·,]+$/, "") + "…"; }
    }
    [].forEach.call(c.querySelectorAll("dd[data-items]"), function (dd) {
      var items = JSON.parse(dd.dataset.items);
      for (var k = items.length; k >= 1; k--) {
        dd.textContent = items.slice(0, k).join(", ");
        if (dd.scrollWidth <= dd.clientWidth + 1) break;
        if (k === 1) dd.style.textOverflow = "ellipsis";
      }
    });
    var res = c.querySelector(".fgc-res"), p = res.querySelector("p");
    if (p) { var l = parseFloat(getComputedStyle(p).lineHeight); p.style.setProperty("--lines", Math.max(2, Math.floor(res.clientHeight / l))); }
  }

  function charger(src) {
    return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  function images(el) {
    return Promise.all([].map.call(el.querySelectorAll("img"), function (im) {
      return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; });
    }));
  }
  // Prépare une carte (polices, images, mise en page) dans un élément donné.
  function preparer(el, d) {
    return fontsFor(d.jp).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '700 40px "FGInter"', '500 40px "FGInter"'].concat(d.jp ? ['700 40px "FGNotoJP"'] : []);
      return Promise.all(names.map(function (f) { return document.fonts.load(f, d.jp || "A"); }))
        .then(function () { return images(el); })
        .then(function () { [].forEach.call(el.querySelectorAll(".fgc"), polish); return fcss; });
    });
  }
  // PNG d'une carte, généré hors écran.
  function png(d, o) {
    o = o || {}; var theme = o.theme || "creme", fmt = o.fmt || "post", wh = SIZE[fmt];
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:" + wh[0] + "px;height:" + wh[1] + "px;overflow:hidden;pointer-events:none";
    box.innerHTML = card(d, theme, fmt); document.body.appendChild(box);
    var lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    return lib.then(function () { return preparer(box, d); }).then(function (fcss) {
      return htmlToImage.toPng(box.firstChild, { width: wh[0], height: wh[1], pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false });
    }).finally(function () { box.remove(); });
  }
  // Nombre de lignes du résumé sur l'image (post et story) et remplissage de la dernière ligne (0 à 1).
  var mes = null;
  function lignes(txt) {
    if (!mes) {
      mes = document.createElement("div");
      mes.style.cssText = "position:fixed;left:-20000px;top:0;visibility:hidden;pointer-events:none";
      mes.innerHTML = '<div class="fgc post" style="height:auto"><div class="fgc-res" style="margin:0;width:952px"><p style="display:block"><b>Résumé</b><span></span></p></div></div>' +
        '<div class="fgc story" style="height:auto"><div class="fgc-res" style="margin:0;width:952px"><p style="display:block"><b>Résumé</b><span></span></p></div></div>';
      document.body.appendChild(mes);
    }
    var out = {};
    [].forEach.call(mes.querySelectorAll(".fgc"), function (c) {
      var p = c.querySelector("p"), sp = p.querySelector("span"); sp.textContent = txt || "";
      var lh = parseFloat(getComputedStyle(p).lineHeight), n = Math.round(p.offsetHeight / lh);
      var r = sp.getClientRects(), last = r.length ? r[r.length - 1] : null, box = p.getBoundingClientRect();
      out[c.classList.contains("post") ? "post" : "story"] = { n: n, fill: last ? (last.right - box.left) / box.width : 0 };
    });
    var pire = out.post.n >= out.story.n ? out.post : out.story;
    return { n: Math.max(out.post.n, out.story.n), fill: pire.fill, post: out.post, story: out.story };
  }
  function pret() { return Promise.all(['700 40px "FGAntonio"', '500 40px "FGInter"'].map(function (f) { return document.fonts.load(f); })); }
  window.FG_FICHE = { lignes: lignes, pret: pret, card: card, polish: polish, preparer: preparer, png: png, SIZE: SIZE, parts: parts };
})();
