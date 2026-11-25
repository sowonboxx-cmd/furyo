// Image « Nouvelle fiche » (design « Dossier »), partagée par le Studio et le back-office.
// FG_FICHE.card(d, theme, fmt) : le HTML de la carte ; FG_FICHE.polish(el) : mise en page fine ;
// FG_FICHE.png(d, { theme, fmt }) : génère le PNG (1080×1440 en post 3:4, 1080×1920 en story 9:16).
// d = { t, jp, cover, type, genres[], y1, pubs[], scen, dess, resume, n, tot }
(function () {
  var FONT_JP = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=";
  // Design validé par Will le 25/11/2026 (maquettes /modeles/fiche-v2/v12.html) : fiche qui ne vieillit jamais,
  // pastille « Fiche n° », infos en Inter, résumé dans une bulle (4 lignes en post, 5 en story, jamais coupé),
  // cases Japon / France seulement avec ce qui ne bouge plus, bas noir à trait jaune avec l'adresse de la fiche.
  // Story : pas de logo en haut (Instagram l'affiche déjà), logo blanc dans le bas noir. Post : logo centré en haut.
  var CSS = [
    '.fgc{width:1080px;height:1440px;position:relative;overflow:hidden;font-family:"FGInter",sans-serif;font-weight:500;display:flex;flex-direction:column;box-sizing:border-box;',
    '  --bg:#F2EFE9;--fg:#0c0c0e;--mut:rgba(12,12,14,.56);--track:rgba(12,12,14,.08);--bulle:#E4DED3;--res:#202024;--pil:#0c0c0e;--pilt:#fff;--bar:#000;--bas:#000;--red:#BC002D;',
    '  background:var(--bg);color:var(--fg);text-align:left;line-height:normal;letter-spacing:normal}',
    '.fgc *{box-sizing:border-box}',
    '.fgc.dark{--bg:#141416;--fg:#F5F5F7;--mut:rgba(245,245,247,.58);--track:rgba(245,245,247,.08);--bulle:#222226;--res:#E2E2E6;--pil:#F2EFE9;--pilt:#0c0c0e;--bar:#000;--bas:#000}',
    '.fgc.story{height:1920px}',
    '.fgc .fgc-A{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase}',
    '.fgc .fgc-top{flex:none;background:var(--bar);padding:26px 64px;display:flex;align-items:center;justify-content:center}',
    '.fgc .fgc-top img{width:200px;display:block}',
    '.fgc.story .fgc-top{padding:0;height:150px}.fgc.story .fgc-top img{display:none}',
    '.fgc .fgc-main{flex:1;min-height:0;display:flex;flex-direction:column;padding:46px 64px 210px}',
    '.fgc.story .fgc-main{padding:48px 64px 420px}',
    '.fgc .fgc-hero{display:flex;gap:46px;align-items:flex-start;flex:none}',
    '.fgc .fgc-cv{position:relative;flex:none}',
    '.fgc .fgc-cover{flex:none;width:380px;height:532px;object-fit:cover;border:10px solid #fff;background:#ddd;display:block}',
    '.fgc.story .fgc-cover{width:400px;height:560px}',
    '.fgc .fgc-info{flex:1;min-width:0;position:relative}',
    '.fgc .fgc-kick{display:inline-flex;align-items:center;height:56px;padding:0 22px 2px;border-radius:6px;background:var(--red);color:#fff;font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:34px;line-height:1}',
    '.fgc .fgc-t{margin:16px 0 0;font-size:96px;line-height:1.02;overflow-wrap:anywhere}',
    '.fgc .fgc-t.fgc-one{white-space:nowrap;overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em;padding-top:.14em;margin-top:calc(16px - .14em)}',
    '.fgc .fgc-t.fgc-clamp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
    '.fgc .fgc-jp{margin-top:8px;line-height:1.4;padding-bottom:4px;font-family:"FGNotoJP","FGInter",sans-serif;font-weight:700;font-size:30px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fgc .fgc-rows{margin-top:26px;display:flex;flex-direction:column;gap:12px}',
    '.fgc .fgc-row{font-size:30px;line-height:1.3}',
    '.fgc .fgc-row span{color:var(--mut);font-weight:600}',
    '.fgc .fgc-row b{font-weight:700}',
    '.fgc .fgc-row.fgc-gen{white-space:nowrap;overflow:hidden}',
    '.fgc .fgc-res{flex:none;margin-top:38px;background:var(--bulle);border-radius:22px;padding:22px 28px 26px}',
    '.fgc .fgc-res h3{display:inline-block;margin:0 0 16px;background:var(--pil);color:var(--pilt);font:700 32px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.08em;padding:12px 20px 13px;border-radius:12px}',
    '.fgc .fgc-res p{margin:0;font-size:37px;line-height:1.42;font-weight:500;color:var(--res);max-height:calc(37px * 1.42 * 4 + 2px);overflow:hidden}',
    '.fgc.story .fgc-res{margin-top:48px}.fgc.story .fgc-res p{font-size:42px;max-height:calc(42px * 1.42 * 5 + 2px)}',
    '.fgc .fgc-chif{flex:none;display:flex;gap:16px;margin-top:26px}',
    '.fgc .fgc-chif>div{flex:1;display:flex;align-items:center;gap:18px;background:var(--track);border-radius:12px;padding:14px 20px}',
    '.fgc .fgc-dr{flex:none;width:54px;height:36px;border-radius:5px;box-shadow:0 0 0 1px rgba(0,0,0,.08)}',
    '.fgc .fgc-fr{background:linear-gradient(90deg,#1f4fd1 33.3%,#fff 33.3% 66.6%,#E1000F 66.6%)}.fgc .fgc-ja{background:#fff radial-gradient(circle at 50% 50%,#BC002D 28%,#fff 29%)}',
    '.fgc .fgc-chif b{display:block;font:700 46px/1 "FGAntonio";text-transform:uppercase}.fgc.story .fgc-chif b{font-size:52px}',
    '.fgc .fgc-chif i{display:block;margin-top:5px;font:600 23px/1.2 "FGInter";font-style:normal;color:var(--mut)}',
    '.fgc .fgc-bas{position:absolute;left:0;right:0;bottom:0;height:178px;background:var(--bas);border-top:8px solid #F2C14E;text-align:center;padding-top:30px}',
    '.fgc.story .fgc-bas{height:380px;padding-top:56px}',
    '.fgc .fgc-bas img{display:none;width:420px;margin:0 auto 26px}.fgc.story .fgc-bas img{display:block}',
    '.fgc .fgc-bas small{display:block;font:600 26px "FGInter";color:rgba(255,255,255,.6)}',
    '.fgc .fgc-bas b{display:block;margin-top:10px;font:700 44px/1 "FGAntonio";text-transform:uppercase;letter-spacing:.06em;color:#fff}.fgc .fgc-bas b em{font-style:normal;color:#F2C14E}'
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

  // Auteurs : un rôle par ligne, les noms à la suite (un nom n'est jamais coupé, la suite repart à gauche).
  function auteurs(d) {
    var r = [], sc = String(d.scen || ""), sup = (sc.match(/\(supervision\s*:\s*([^)]+)\)/i) || [])[1];
    sc = sc.replace(/\s*\(supervision[^)]*\)/i, "").replace(/\s*\((original|scénario)\)/gi, "").trim();
    if (sc && d.dess && sc === d.dess) r.push(["Auteur", parts(sc)]);
    else { if (sc) r.push(["Scénario", parts(sc)]); if (sup) r.push(["Supervision", parts(sup)]); if (d.dess) r.push(["Dessin", parts(d.dess)]); }
    return r;
  }
  // Cases Japon / France : seulement ce qui ne changera plus (série terminée), sinon l'éditeur et l'année de lancement en France.
  function chiffres(d) {
    var c = [], jpFini = /termin/i.test(d.stJP || ""), frFini = /termin/i.test(d.stFR || ""), pub = (d.pubs || [])[0] || "";
    if (jpFini && d.tomesJP) c.push(["ja", d.tomesJP + (d.tomesJP > 1 ? " tomes" : " tome"), "Terminé" + (d.y1 ? " · " + d.y1 + (d.y2 && d.y2 !== d.y1 ? "-" + d.y2 : "") : "")]);
    if (frFini && d.tomesFR) c.push(["fr", d.tomesFR + (d.tomesFR > 1 ? " tomes" : " tome"), "Terminé" + (pub ? " · " + pub : "")]);
    else if (pub) c.push(["fr", pub, d.frDebut ? "Lancement · " + d.frDebut : "Édition française"]);
    return c.length ? '<div class="fgc-chif">' + c.map(function (x) { return '<div><i class="fgc-dr fgc-' + x[0] + '"></i><span><b>' + esc(x[1]) + "</b><i>" + esc(x[2]) + "</i></span></div>"; }).join("") + "</div>" : "";
  }
  // Types avec leur macron (Will, 25/11/2026) : Shōnen, Shōjo.
  var TYPES = { shonen: "Shōnen", shounen: "Shōnen", shojo: "Shōjo", shoujo: "Shōjo", seinen: "Seinen", josei: "Josei", kodomo: "Kodomo" };
  var typeJP = function (t) { return TYPES[String(t || "").toLowerCase().replace(/[ōŌ]/g, "o")] || t; };
  function card(d, theme, fmt) {
    var nom = function (n) { return esc(n).replace(/ /g, "&nbsp;"); };
    var fini = /termin/i.test(d.stJP || "");
    var rows = auteurs(d).map(function (a) { return '<div class="fgc-row"><span>' + a[0] + ' :</span> <b>' + a[1].map(nom).join(", ") + "</b></div>"; }).join("") +
      ((d.genres || []).length ? '<div class="fgc-row fgc-gen"><span>Genres :</span> <b data-items="' + esc(JSON.stringify(d.genres.slice(0, 3))) + '">' + esc(d.genres.slice(0, 3).join(", ")) + "</b></div>" : "") +
      (d.type ? '<div class="fgc-row"><span>Type :</span> <b>' + esc(typeJP(d.type) + (!fini && d.y1 ? " · depuis " + d.y1 : "")) + "</b></div>" : "");
    var jp = d.jp && String(d.jp).toLowerCase() !== String(d.t || "").toLowerCase() ? '<div class="fgc-jp" lang="ja">' + esc(d.jp) + "</div>" : "";
    return '<div class="fgc ' + theme + " " + fmt + '">' +
      '<div class="fgc-top"><img src="/img/social/logo-blanc.png" alt=""></div>' +
      '<div class="fgc-main"><div class="fgc-hero">' +
        '<div class="fgc-cv">' + (d.cover ? '<img class="fgc-cover" src="' + couv(d.cover) + '" alt="">' : '<div class="fgc-cover"></div>') + "</div>" +
        '<div class="fgc-info"><span class="fgc-kick"><span>Fiche n°' + pad(d) + "</span></span>" +
          '<p class="fgc-t fgc-A">' + esc(d.t) + "</p>" + jp + '<div class="fgc-rows">' + rows + "</div>" +
        "</div></div>" +
        (d.resume ? '<div class="fgc-res"><h3>Résumé</h3><p>' + esc(d.resume) + "</p></div>" : "") + chiffres(d) +
      "</div>" +
      '<div class="fgc-bas"><img src="/img/social/logo-blanc.png" alt=""><small>La fiche complète</small><b>furyogang.com<em>/series/' + esc(d.slug || "") + "</em></b></div>" +
    "</div>";
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
    // Genres : 3 au plus, toujours sur une seule ligne (le dernier saute s'il n'y a pas la place).
    [].forEach.call(c.querySelectorAll(".fgc-gen"), function (row) {
      var bb = row.querySelector("b"), items = JSON.parse(bb.dataset.items);
      while (items.length > 1 && row.scrollWidth > row.clientWidth + 1) { items.pop(); bb.textContent = items.join(", "); }
    });
    // Résumé : jamais coupé en silence ; s'il dépasse (4 lignes en post, 5 en story), la carte est marquée « trop long ».
    var p = c.querySelector(".fgc-res p");
    if (p) { if (p.scrollHeight > p.clientHeight + 2) c.setAttribute("data-trop", "1"); else c.removeAttribute("data-trop"); }
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
      // Safari (iPhone) dessine parfois la première image avant d'avoir intégré les polices et les photos :
      // on recommence jusqu'à ce que le résultat ne change plus (3 à 4 passes au plus).
      var opts = { width: wh[0], height: wh[1], pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false };
      var essai = function (n, prev) {
        return htmlToImage.toPng(box.firstChild, opts).then(function (u) {
          if (n >= 4 || (prev && Math.abs(u.length - prev.length) < 200 && n >= 2)) return u;
          return new Promise(function (ok) { setTimeout(ok, 150); }).then(function () { return essai(n + 1, u); });
        });
      };
      return essai(1, null);
    }).finally(function () { box.remove(); });
  }
  // Nombre de lignes du résumé sur l'image (post et story) et remplissage de la dernière ligne (0 à 1).
  // Nombre de lignes du résumé dans la bulle (post : 4 au plus, story : 5 au plus) et remplissage de la dernière ligne.
  var mes = null;
  function lignes(txt) {
    if (!mes) {
      mes = document.createElement("div");
      mes.style.cssText = "position:fixed;left:-20000px;top:0;visibility:hidden;pointer-events:none";
      mes.innerHTML = '<div class="fgc post" style="height:auto"><div class="fgc-res" style="margin:0;width:952px"><p style="max-height:none"><span></span></p></div></div>' +
        '<div class="fgc story" style="height:auto"><div class="fgc-res" style="margin:0;width:952px"><p style="max-height:none"><span></span></p></div></div>';
      document.body.appendChild(mes);
    }
    var out = {};
    [].forEach.call(mes.querySelectorAll(".fgc"), function (c) {
      var p = c.querySelector("p"), sp = p.querySelector("span"); sp.textContent = txt || "";
      var lh = parseFloat(getComputedStyle(p).lineHeight), n = Math.round(p.offsetHeight / lh);
      var r = sp.getClientRects(), last = r.length ? r[r.length - 1] : null, box = p.getBoundingClientRect();
      out[c.classList.contains("post") ? "post" : "story"] = { n: n, fill: last ? (last.right - box.left) / box.width : 0 };
    });
    return { n: out.post.n, fill: out.post.fill, post: out.post, story: out.story, ok: out.post.n <= 4 && out.story.n <= 5 };
  }
  // Champs de la fiche tirés de /api/serie (statuts, tomes, années, éditeur japonais, lancement en France).
  function depuisSerie(j) {
    var s = (j && j.serie) || {}, deb = "";
    (j && j.editions || []).forEach(function (e) { if (e.pays !== "France") return; (e.tomes || []).forEach(function (t) { if (t.date && (!deb || t.date < deb)) deb = t.date; }); });
    return { scen: s.scen || "", dess: s.dess || "", stJP: s.stJP || "", stFR: s.stFR || "", tomesJP: s.tomesJP || 0, tomesFR: s.tomesFR || 0, y1: s.y1, y2: s.y2, pubJP: s.pubJP || "", frDebut: deb ? +deb.slice(0, 4) : null };
  }
  function pret() { return Promise.all(['700 40px "FGAntonio"', '500 40px "FGInter"'].map(function (f) { return document.fonts.load(f); })); }
  window.FG_FICHE = { depuisSerie: depuisSerie, lignes: lignes, pret: pret, card: card, polish: polish, preparer: preparer, png: png, SIZE: SIZE, parts: parts };
})();
