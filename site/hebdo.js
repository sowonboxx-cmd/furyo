/* Carrousels hebdo FuryoGang (Will, 25/11/2026), charte « News de la semaine » et « Prépublication de la semaine ».
   Mêmes images pour Instagram et X (1080 × 1440), plus une story pleine page (1080 × 1920) pour Instagram.
   - News de la semaine (le lundi, semaine précédente) : couverture rouge (« Les news de la semaine », éventail, sommaire),
     news (impair : la 1re seule en grand, puis par deux gauche / droite ; un seul passage surligné), sorties Japon / France,
     « La semaine prochaine. ». Story : fond noir manga, date en pastille jaune, « de la semaine » en rouge.
   - Prépublication de la semaine (le dimanche matin, semaine en cours) : 3 magazines par image sur fond rouge.
     Story : fond rouge, liste par magazine avec petites couvertures.
   Logo toujours sur le bandeau noir en haut. Modèles validés : /modeles/qdn-v2/ (maquettes5, prepub, storyfull).
   Utilisation : FG_HEBDO.news(lundi, reglages) / FG_HEBDO.prepub(lundi) → { slides: [jpeg dataURL], story, legende, x, infos } */
(function () {
  var SITE = "";
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var JC = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var dec = function (j, n) { var d = new Date(j + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  var jj = function (j) { return +j.slice(8, 10); };
  var periode = function (du, au) { return jj(du) + " – " + jj(au) + " " + MOIS[+au.slice(5, 7) - 1]; };
  var jm = function (j) { return j.slice(8, 10) + "/" + j.slice(5, 7); };
  var C = function (u, w) { if (!u) return ""; if (/^\//.test(u)) return u; u = u.replace(/^https?:\/\/(www\.)?(furyogang\.com|furyo\.pages\.dev)(?=\/)/, ""); return /^\//.test(u) ? u : "/api/couv?w=" + (w || 700) + "&u=" + encodeURIComponent(u); };
  var get = function (u) { return fetch(u, { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); }); };
  var nn = function (n) { return n == null || n === "" ? "" : "T." + String(n).padStart(2, "0"); };
  // Texte trop long pour la place (6 lignes) : coupé à la fin d'une phrase, sinon d'un mot.
  var coupe = function (t, n) { t = String(t || "").replace(/\s+/g, " ").trim(); if (t.length <= n) return t; var c = t.slice(0, n), p = c.lastIndexOf(". "); return p > n * .5 ? c.slice(0, p + 1) : c.replace(/\s+\S*$/, "") + "…"; };
  var KJ = { "licence-jp": "新連載", annonce: "連載決定", arc: "新章開幕", fin: "完結", "sortie-jp": "新刊", "sortie-fr": "新刊", "licence-fr": "仏国版", anime: "アニメ化", adaptation: "映像化", remake: "リメイク", hommage: "追悼", extrait: "試し読み", dedicace: "サイン会", pause: "休載" };
  var ETIQ = { "licence-jp": "Nouvelle série", "licence-fr": "Nouvelle licence", "sortie-jp": "Sortie au Japon", "sortie-fr": "Sortie en France", "couv-jp": "Couverture", "couv-fr": "Couverture" };
  var hash = function (s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

  // ——— Styles communs (copie des maquettes validées) ———
  var CSS = '.hb{position:relative;overflow:hidden;width:1080px;height:1440px;background:#0c0c0e;color:#F2EFE9;font-family:FGInter,Inter,sans-serif}' +
    '.hb.st{height:1920px}.hb *{box-sizing:border-box}' +
    '.hb .hd{position:absolute;left:0;right:0;top:0;height:136px;background:#0c0c0e;z-index:20;display:flex;align-items:center;justify-content:center}.hb .hd img{height:66px}' +
    '.hb .t{font:700 120px/.95 FGAntonio;text-transform:uppercase}' +
    '.hb .k{font:700 28px/1 FGAntonio;letter-spacing:.28em;text-transform:uppercase;color:#F2C14E}' +
    '.hb .pill{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 18px 3px;border-radius:10px;font:700 28px/1 FGAntonio;text-transform:uppercase;letter-spacing:.04em;color:#121214}' +
    '.hb .cv{position:relative;flex:none;overflow:hidden;background:#111;border:8px solid #F2EFE9;box-shadow:0 24px 60px rgba(0,0,0,.6)}.hb .cv img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top}' +
    '.hb .mz{position:absolute;inset:0;overflow:hidden}.hb .mz .g{position:absolute;left:-260px;top:-300px;width:1600px;display:grid;grid-template-columns:repeat(7,1fr);gap:18px;transform:rotate(-8deg)}' +
    '.hb .mz .g img{display:block;width:100%;aspect-ratio:7/10;object-fit:cover;filter:grayscale(1) contrast(1.2)}' +
    '.hb .mz.r{background:#CB002F}.hb .mz.r .g{opacity:.3;mix-blend-mode:multiply}' +
    '.hb .mz.r .v{position:absolute;inset:0;background:radial-gradient(ellipse 60% 45% at 50% 45%,rgba(150,0,30,.5),transparent 75%),linear-gradient(180deg,transparent 55%,rgba(110,0,22,.75))}' +
    '.hb .mz.o{background:#D9480F}.hb .mz.b{background:#1F4FD1}.hb .mz.vi{background:#6B2FC0}.hb .mz.y{background:#F2C14E}.hb .mz.o .g,.hb .mz.b .g,.hb .mz.vi .g,.hb .mz.y .g{opacity:.3;mix-blend-mode:multiply}' +
    '.hb .mz.o .v,.hb .mz.b .v,.hb .mz.vi .v{position:absolute;inset:0;background:radial-gradient(ellipse 60% 45% at 50% 45%,rgba(0,0,0,.18),transparent 75%),linear-gradient(180deg,transparent 55%,rgba(0,0,0,.45))}.hb .mz.y .v{position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(120,80,0,.35))}' +
    '.hb .pdate{display:inline-block;background:#F2C14E;color:#121214;font:700 44px/1 FGAntonio;letter-spacing:.12em;padding:12px 24px 14px;border-radius:12px;text-transform:uppercase}.hb .pdate.k{background:#121214;color:#F2C14E}' +
    '.hb .mz.n{background:#0c0c0e}.hb .mz.n .g{opacity:.2}' +
    '.hb .mz.n .v{position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 50%,rgba(12,12,14,.35),rgba(12,12,14,.85) 80%),linear-gradient(180deg,rgba(12,12,14,.7),transparent 25%,transparent 70%,rgba(12,12,14,.9))}' +
    '.hb.st .mz .g{left:-300px;width:1700px}.hb.st .mz.n .g{opacity:.22}' +
    '.hb.st .mz.r .v{background:radial-gradient(ellipse 60% 40% at 50% 40%,rgba(150,0,30,.45),transparent 75%),linear-gradient(180deg,transparent 60%,rgba(90,0,18,.9))}' +
    '.hb.st .mz.n .v{background:radial-gradient(ellipse 70% 45% at 50% 42%,rgba(12,12,14,.3),rgba(12,12,14,.85) 80%),linear-gradient(180deg,rgba(12,12,14,.6),transparent 20%,transparent 65%,rgba(12,12,14,.95))}' +
    '.hb.st .lab{font-size:36px}.hb.st .lab b{font-size:34px}.hb.st .t{font-size:150px;line-height:.92;text-align:center;text-shadow:0 6px 30px rgba(40,0,8,.6)}' +
    '.hb .lab{display:flex;justify-content:center;align-items:center;gap:24px;font:700 34px/1 FGAntonio;letter-spacing:.3em;text-transform:uppercase}' +
    '.hb .lab span{display:block;padding-top:2px;margin-right:-.3em}.hb .lab i{width:100px;height:2px;background:#fff}.hb .lab b{font:900 32px FGNotoJP;color:#F2C14E;letter-spacing:.1em}' +
    '.hb .h4{font:700 70px/.98 FGAntonio;text-transform:uppercase;margin:18px 0 0}' +
    '.hb .p{font:600 38px/1.32 FGInter;color:#F2EFE9;margin:22px 0 0}.hb .p mark{background:#F2C14E;color:#121214;padding:1px 8px 3px;line-height:1.5;-webkit-box-decoration-break:clone;box-decoration-break:clone;border-radius:3px}' +
    '.hb .jp{font:900 30px FGNotoJP;color:#E5483A;margin-top:10px}' +
    '.hb .vt{position:absolute;writing-mode:vertical-rl;font:900 96px/1 FGNotoJP;letter-spacing:.04em}' +
    '.hb .so{position:relative}.hb .so .tn{position:absolute;top:-10px;right:-12px;background:#C8102E;color:#fff;font:700 40px/1 FGAntonio;padding:8px 12px 10px;border-radius:8px;z-index:2}' +
    '.hb .so b{display:block;font:700 40px/1.02 FGAntonio;text-transform:uppercase;margin-top:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hb .so span.d{display:block;font:600 26px FGInter;color:#bdb9b1;margin-top:8px}' +
    '.hb .flag{display:inline-block;width:78px;height:52px;border-radius:4px;flex:none}' +
    '.hb .fjp{background:#fff radial-gradient(circle at 50% 50%,#BC002D 28%,#fff 29%)}.hb .ffr{background:linear-gradient(90deg,#1f4fd1 33.3%,#fff 33.3% 66.6%,#E1000F 66.6%)}' +
    '.hb .mag{display:flex;gap:26px;align-items:flex-start;background:rgba(14,14,16,.72);border-radius:20px;padding:24px}' +
    '.hb .mag h5{margin:0;font:700 44px/1 FGAntonio;text-transform:uppercase;letter-spacing:.02em}.hb .mag h5 small{display:block;font:600 22px FGInter;color:#F2C14E;letter-spacing:.06em;margin-top:8px;text-transform:none}' +
    '.hb .chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}' +
    '.hb .chip{display:inline-flex;align-items:center;gap:10px;height:54px;padding:0 16px 3px;border-radius:10px;background:#F2EFE9;color:#121214;font:700 31px/1 FGAntonio;text-transform:uppercase;letter-spacing:.02em}' +
    '.hb .chip i{font-style:normal;color:#CB002F}.hb .chip.c{background:#F2C14E}.hb .chip.p{background:transparent;border:2px dashed rgba(242,239,233,.55);color:rgba(242,239,233,.75)}.hb .chip.p i{color:rgba(242,239,233,.75);font:600 20px FGInter;text-transform:none}' +
    '.hb .bas{position:absolute;left:0;right:0;top:1560px;text-align:center;z-index:5}.hb .bas img{height:74px}' +
    '.hb .bas .l1{font:600 34px/1.25 FGInter;color:#F2EFE9;margin-top:22px}.hb .bas .l2{font:700 52px/1 FGAntonio;color:#F2C14E;letter-spacing:.04em;text-transform:uppercase;margin-top:10px}';

  var MOS = [];
  var mos = function (k, d, l, nb) { l = l && l.length ? l : MOS; var h = '<div class="mz ' + k + '"><div class="g">'; for (var j = 0; j < (nb || 63); j++) h += '<img src="' + esc(C(l[(j + d) % l.length], 260)) + '">'; return h + '</div><div class="v"></div></div>'; };
  var HD = '<div class="hd"><img src="/img/social/logo-blanc.png"></div>';
  var cvH = function (u, w, h, st) { return '<div class="cv" style="width:' + w + "px;height:" + h + "px;" + (st || "") + '"><img src="' + esc(C(u)) + '"></div>'; };
  var pill = function (n) { return '<span class="pill" style="background:' + esc(n.col) + '">' + esc(n.cat) + "</span>"; };
  var surligne = function (t, hl) { t = esc(t); hl = esc(hl || ""); if (hl && t.indexOf(hl) >= 0) t = t.replace(hl, "<mark>" + hl + "</mark>"); return t; };

  // Bandeau du bas : pages de manga noir et blanc, 不良ギャング, appel vers le site, persos de Niceguy.
  var BW = ["/img/news/boryoku-banzai/ch1-1.jpg", "/img/news/boryoku-banzai/ch1-2.jpg", "/img/news/boryoku-banzai/ch1-3.jpg"];
  var basSite = function (l1, url, perso, haut) { haut = haut || 380; return '<div style="position:absolute;left:0;right:0;bottom:0;height:' + haut + 'px;z-index:4;background:#0c0c0e"><div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:-40px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;transform:rotate(-4deg)">' + BW.concat(BW).map(function (u) { return '<img src="' + u + '" style="display:block;width:100%;height:230px;object-fit:cover;filter:grayscale(1) contrast(1.1)">'; }).join("") + '</div></div>' +
    '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,12,14,.92) 30%,rgba(12,12,14,.55))"></div><div style="position:absolute;left:0;right:0;top:0;height:8px;background:#F2C14E"></div>' +
    '<div style="position:absolute;left:60px;top:72px;z-index:3"><div style="font:900 36px FGNotoJP;color:#fff;letter-spacing:.2em">不良ギャング</div><div class="t" style="font-size:88px;margin-top:14px;line-height:1">' + l1 + '<br><span style="color:#F2C14E">' + url + '</span></div></div>' +
    (perso ? '<img src="' + perso + '" style="position:absolute;right:24px;bottom:-12px;height:370px;z-index:3">' : "") + '</div>'; };

  // ——— Rendu en JPEG (html-to-image, polices intégrées) ———
  var lib = null, polices = null, cache = {};
  function charger(src) { return new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function dataUrl(u) { if (!cache[u]) cache[u] = fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) { return new Promise(function (ok) { var f = new FileReader(); f.onload = function () { ok(f.result); }; f.readAsDataURL(b); }); }); return cache[u]; }
  function fontCSS(kanji) {
    var jp = fetch("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=" + encodeURIComponent(kanji)).then(function (r) { return r.text(); })
      .then(function (css) { var m = css.match(/url\((https:[^)]+)\)/); if (!m) throw 0; return dataUrl(m[1]); }).catch(function () { return dataUrl("/fonts/NotoSansJP.ttf"); });
    return Promise.all([dataUrl("/fonts/Antonio.ttf"), dataUrl("/fonts/Inter.ttf"), jp]).then(function (u) {
      var css = '@font-face{font-family:"FGAntonio";src:url(' + u[0] + ') format("truetype");font-weight:100 700}@font-face{font-family:"FGInter";src:url(' + u[1] + ') format("truetype");font-weight:100 900}@font-face{font-family:"FGNotoJP";src:url(' + u[2] + ');font-weight:900}';
      var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); return css; });
  }
  function petite(src, l) { return dataUrl(src).then(function (u) { return new Promise(function (ok) { var im = new Image(); im.onload = function () {
    var r = Math.min(1, l / (im.naturalWidth || l)); if (r === 1 && u.length < 500000) return ok(u);
    var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(im.naturalWidth * r)); c.height = Math.max(1, Math.round(im.naturalHeight * r));
    var x = c.getContext("2d"), png = /^data:image\/png/.test(u); if (!png) { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); } x.drawImage(im, 0, 0, c.width, c.height); ok(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", .88)); };
    im.onerror = function () { ok(""); }; im.src = u; }); }).catch(function () { return ""; }); }
  // Classes préfixées « x- » au rendu (Will, 25/11/2026) : dans le calendrier, les styles de la page (.jp, .t, .p…) se mélangeaient
  // aux images (titre japonais écrit de haut en bas, textes qui se chevauchent).
  var pref = function (h) { return h.replace(/class="([^"]*)"/g, function (m, c) { return 'class="' + c.split(/\s+/).filter(Boolean).map(function (t) { return "x-" + t; }).join(" ") + '"'; }); };
  var CSSX = CSS.replace(/\.([a-zA-Z][\w-]*)/g, ".x-$1") + ".x-hb,.x-hb *{writing-mode:horizontal-tb;text-orientation:mixed}.x-hb .x-vt{writing-mode:vertical-rl}.x-hb img{max-width:none;max-height:none}";
  function zone() { var z = document.getElementById("fg-hebdo-zone"); if (!z) { z = document.createElement("div"); z.id = "fg-hebdo-zone"; z.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;pointer-events:none"; var st = document.createElement("style"); st.textContent = CSSX; z.appendChild(st); document.body.appendChild(z); } return z; }
  function rendre(html, h, polices) {
    if (!lib) lib = window.htmlToImage ? Promise.resolve() : charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    return Promise.all([lib, polices]).then(function (r) {
      var fcss = r[1], z = zone(), d = document.createElement("div"); d.innerHTML = pref(html); var node = d.firstChild; z.appendChild(node);
      return Promise.all([].map.call(node.querySelectorAll("img"), function (im) { var w = Math.min(1080, Math.max(160, Math.round((im.getBoundingClientRect().width || 400) * 2)));
        return petite(im.getAttribute("src"), w).then(function (u) { if (u) im.src = u; else { im.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="; im.style.visibility = "hidden"; } return im.decode ? im.decode().catch(function () {}) : null; }); }))
        .then(function () { var best = "", o = { width: 1080, height: h, pixelRatio: 1, quality: .92, fontEmbedCSS: fcss, backgroundColor: "#0c0c0e", cacheBust: false };
          var essai = function (k) { return htmlToImage.toJpeg(node, o).then(function (u) { if (u.length > best.length) best = u; return k >= 3 ? best : new Promise(function (ok) { setTimeout(ok, 150); }).then(function () { return essai(k + 1); }); }); };
          return essai(1); })
        .then(function (u) { node.remove(); return u; }, function (e) { node.remove(); throw e; });
    });
  }

  // ——— Données communes ———
  var BASE = null, SLUG = {};
  function base() { if (!BASE) BASE = Promise.all([get("/api/series").catch(function () { return { items: [] }; }), get("/api/calendrier").catch(function () { return { items: [] }; })]).then(function (r) {
    var se = r[0].items || r[0] || []; se.forEach(function (x) { if (x.slug) SLUG[x.id] = x; }); MOS = se.map(function (s) { return s.cover; }).filter(Boolean); return { series: se, cal: r[1].items || [] }; }); return BASE; }
  function melange(l, graine) { l = l.slice(); var s = graine; for (var i = l.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; var j = Math.floor(s / 233280 * (i + 1)); var t = l[i]; l[i] = l[j]; l[j] = t; } return l; }

  // ——— News de la semaine ———
  function newsDonnees(du, reg) {
    var au = dec(du, 6); reg = reg || {};
    return Promise.all([base(), get("/api/news")]).then(function (r) {
      var b = r[0], news = (r[1].items || []).filter(function (n) { return n.date >= du && n.date <= au && n.cat !== "tirage"; });
      // Ordre par défaut : les grosses news d'abord (nouvelle série, annonce, nouvel arc…), les fins de série à la fin, puis par date.
      var PRIO = ["licence-jp", "licence-fr", "annonce", "arc", "remake", "anime", "adaptation", "hommage", "extrait"], rg = function (n) { var k = ((n.cats || []).filter(function (c) { return c.k !== "news"; })[0] || {}).k || n.cat, i = PRIO.indexOf(k); return k === "fin" ? 50 : i < 0 ? 20 : i; };
      news.sort(function (a, z) { return rg(a) - rg(z) || (a.date < z.date ? -1 : a.date > z.date ? 1 : 0); });
      if (reg.ordre && reg.ordre.length) news.sort(function (a, z) { var i = reg.ordre.indexOf(a.id), j = reg.ordre.indexOf(z.id); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j); });
      news = news.filter(function (n) { return !(reg.sans || []).includes(n.id); }).slice(0, 7);
      var sids = news.map(function (n) { return n.sid; }).filter(Boolean);
      return (sids.length ? get("/api/recap-semaine?du=" + du + "&sids=" + sids.join(",")).catch(function () { return {}; }) : Promise.resolve({})).then(function (rs) {
        var der = rs.derniers || {};
        news.forEach(function (n) {
          var cs = (n.cats || []).map(function (c) { return c.k; }), cat = (n.cats || []).filter(function (c) { return c.k !== "news"; })[0] || { nom: n.catNom, c: n.catC };
          n._cat = cat.nom || "News"; n._col = cat.c || "#E5483A";
          // Couverture : le dernier tome de la série ; pour un nouvel arc (page couleur) ou sans tome, l'image de la news.
          n._cv = (reg.img && reg.img[n.id]) || (cs.indexOf("arc") < 0 && n.sid && der[n.sid] && der[n.sid].cover) || n.cover || n.ig;
          n._t = (reg.titre && reg.titre[n.id]) || String(n.fr || n.titre || "").replace(/ - .*$/, ""); n._jp = String(n.jp || "").split(/\s*[-–—―~〜～]\s*|[\s\u3000]+/)[0];
          // Étiquette (Will, 25/11/2026) : ce qu'est la news en deux mots (Nouvelle série, Annonce, Nouvel arc, Réédition, Fin de série…), modifiable.
          n._k = (cat.k || n.cat || ""); n._cat = ETIQ[n._k] || n._cat; n._catDef = n._cat; if (reg.cat && reg.cat[n.id]) n._cat = reg.cat[n.id];
          n._txt = (reg.txt && reg.txt[n.id]) || coupe(n.accroche || n.texte || "", 210);
          n._hl = (reg.hl && reg.hl[n.id]) || "";
        });
        return { du: du, au: au, news: news, centre: reg.centre, pastille: reg.pastille };
      });
    });
  }
  function slidesNews(D) {
    var S = [], N = D.news, per = periode(D.du, D.au), g = hash(D.du);
    var nm = melange(MOS, g);
    // Couverture : la news au centre en plus grand (choix de Will, sinon le nouvel arc, sinon la 1re).
    if (N.length) {
      var ci = N.findIndex(function (n) { return n.id === D.centre; }); if (ci < 0) ci = N.findIndex(function (n) { return (n.cats || []).some(function (c) { return c.k === "arc"; }); }); if (ci < 0) ci = 0;
      var autres = N.filter(function (_, i) { return i !== ci; }).slice(0, 4), rang = [autres[0], autres[1], N[ci], autres[2], autres[3]];
      var fan = rang.map(function (n, i) { if (!n) return ""; var d = i - 2, f = !d, w = f ? 280 : 186, h = f ? 398 : 264;
        return '<div style="position:absolute;left:' + (540 - w / 2 + d * 196 + (d > 0 ? 40 : d < 0 ? -40 : 0)) + "px;top:" + (f ? 0 : 70) + "px;z-index:" + (5 - Math.abs(d)) + ";transform:rotate(" + d * 3 + 'deg)">' + cvH(n._cv, w, h, f ? "" : "filter:brightness(.82)") + "</div>"; }).join("");
      S.push('<div class="hb">' + mos("r", 0, nm) + HD + teteCouv(per, "Les news de la semaine", 112, D.pastille) +
        '<div style="position:absolute;left:0;right:0;top:400px;height:420px;z-index:3">' + fan + '</div>' +
        '<div style="position:absolute;left:70px;right:70px;top:860px;z-index:3;display:flex;flex-direction:column;gap:14px">' + N.slice(0, 5).map(function (n) { return '<div style="display:flex;align-items:center;gap:20px;background:rgba(18,18,20,.78);border-radius:14px;padding:15px 20px">' + pill({ col: n._col, cat: n._cat }) + '<b style="font:700 46px/1 FGAntonio;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(n._t) + "</b></div>"; }).join("") + "</div></div>");
    }
    // News : impair → la 1re seule en grand, puis par deux (gauche / droite).
    var bloc = function (n, droite, top) { return '<div style="position:absolute;left:60px;right:60px;top:' + top + 'px;display:flex;gap:46px;align-items:flex-start;flex-direction:' + (droite ? "row-reverse" : "row") + ';z-index:3">' + cvH(n._cv, 360, 511) +
      '<div style="flex:1;padding-top:10px;text-align:' + (droite ? "right" : "left") + '">' + pill({ col: n._col, cat: n._cat }) + '<div class="h4">' + esc(n._t) + "</div>" + (n._jp ? '<div class="jp">' + esc(n._jp) + "</div>" : "") + '<div class="p">' + surligne(n._txt, n._hl) + "</div></div></div>"; };
    var reste = N.slice();
    if (N.length % 2 === 1) { var a = reste.shift();
      S.push('<div class="hb">' + mos("n", 3, [a._cv].concat(nm.slice(0, 8))) + HD + (KJ[a._k] ? '<div class="vt" style="left:56px;top:190px;color:#E5483A;font-size:' + (KJ[a._k].length > 3 ? 96 : 110) + 'px;z-index:3">' + KJ[a._k] + "</div>" : "") + '<div style="position:absolute;left:50%;top:180px;transform:translateX(-50%);z-index:3">' + cvH(a._cv, 500, 710) + "</div>" +
        '<div style="position:absolute;left:70px;right:70px;top:930px;text-align:center;z-index:3">' + pill({ col: a._col, cat: a._cat }) + '<div class="h4" style="font-size:92px">' + esc(a._t) + '</div><div class="p" style="font-size:44px;margin-top:20px">' + surligne(a._txt, a._hl) + "</div></div></div>"); }
    for (var i = 0; i < reste.length; i += 2) S.push('<div class="hb">' + mos("n", 7 + i * 5, nm) + HD + bloc(reste[i], false, 176) + (reste[i + 1] ? bloc(reste[i + 1], true, 800) : "") + "</div>");
    // Fin (Will, 25/11/2026) : « À la semaine prochaine. », les jumeaux en chibi, plus de news sur le site.
    S.push('<div class="hb">' + mos("n", 19, nm) + HD +
      '<div style="position:absolute;left:60px;right:60px;top:200px;z-index:3"><div class="k">Les news continuent tous les jours</div><div class="t" style="font-size:140px;line-height:.92;margin-top:22px">À la semaine<br><span style="color:#E5483A">prochaine.</span></div></div>' +
      '<img src="/img/story/persos/08.png" style="position:absolute;right:50px;bottom:372px;height:500px;z-index:5">' + basSite("Plus de news sur", "furyogang.com/actus", "") + "</div>");
    return S;
  }
  function storyNews(D) {
    var N = D.news, ci = N.findIndex(function (n) { return n.id === D.centre; }); if (ci < 0) ci = N.findIndex(function (n) { return (n.cats || []).some(function (c) { return c.k === "arc"; }); }); if (ci < 0) ci = 0;
    var autres = N.filter(function (_, i) { return i !== ci; }).slice(0, 4), rang = [autres[0], autres[1], N[ci], autres[2], autres[3]], gros = 430;
    var fan = rang.map(function (n, i) { if (!n) return ""; var d = i - 2, f = !d, w = f ? gros : Math.round(gros * .66), h = Math.round(w * 1.42);
      return '<div style="position:absolute;left:' + (540 - w / 2 + d * Math.round(gros * .66) + (d > 0 ? 50 : d < 0 ? -50 : 0)) + "px;top:" + (f ? 0 : Math.round(gros * .3)) + "px;z-index:" + (5 - Math.abs(d)) + ";transform:rotate(" + d * 3 + 'deg)">' + cvH(n._cv, w, h, f ? "" : "filter:brightness(.85)") + "</div>"; }).join("");
    var noms = N.slice(0, 5).map(function (n) { return esc(n._t); }), l1 = noms.slice(0, 3).join(" · "), l2 = noms.slice(3).join(" · ");
    return '<div class="hb st">' + mos("n", 9, melange(MOS, hash(D.du) + 1), 70) +
      '<div style="position:absolute;left:0;right:0;top:190px;z-index:3"><div style="text-align:center"><span style="display:inline-block;background:#F2C14E;color:#121214;font:700 40px/1 FGAntonio;letter-spacing:.12em;padding:12px 22px 14px;border-radius:10px;text-transform:uppercase">' + periode(D.du, D.au) + '</span></div>' +
      '<div class="t" style="margin-top:26px;font-size:150px;line-height:.92;text-align:center;text-shadow:0 6px 30px rgba(40,0,8,.6)">Les news<br><span style="color:#E5483A">de la semaine</span></div></div>' +
      '<div style="position:absolute;left:0;right:0;top:640px;height:600px;z-index:3">' + fan + "</div>" +
      '<div style="position:absolute;left:40px;right:40px;top:1310px;text-align:center;z-index:3;font:700 46px FGAntonio;text-transform:uppercase;letter-spacing:.04em">' + l1 + (l2 ? "<br>" + l2 : "") + "</div>" +
      '<div class="bas"><img src="/img/social/logo-blanc.png"><div class="l1">Tout le détail dans notre dernier post et sur</div><div class="l2">furyogang.com/actus</div></div></div>';
  }
  function legendeNews(D) {
    var per = periode(D.du, D.au);
    return { ig: "📰 NEWS DE LA SEMAINE · " + per.toUpperCase() + "\n\n" + D.news.map(function (n) { return "▪️ " + n._t + " : " + n._txt.replace(/\s+$/, ""); }).join("\n") + "\n\n📚 Sorties, prépublication et fiches : tout est sur furyogang.com\n\n#manga #furyo #yakuza #FuryoGang",
      // X : « Les news de la semaine · dates », puis une ligne par news « Série : ce que c'est » (Will, 25/11/2026), dans les 280 caractères.
      x: (function () { var t = "Les news de la semaine · " + per + "\n"; D.news.forEach(function (n) { var l = "\n▪️ " + n._t + " : " + String(n._cat).charAt(0).toLowerCase() + String(n._cat).slice(1); if ([...(t + l)].length + 6 <= 280) t += l; }); return t; })(),
      // Post X avec les liens des fiches, à poster à la main (gratuit) en fin de semaine (Will, 25/11/2026). 280 caractères, un lien compte 23.
      liens: (function () { var t = "Les fiches des séries de la semaine, pour ceux qui veulent tout savoir 👇\n", vus = {};
        D.news.forEach(function (x) { var se = SLUG[x.sid || x.seriesId]; if (!se || vus[se.slug]) return; vus[se.slug] = 1;
          var l = "\n▪️ " + String(x._t || (x.pays === "France" ? x.fr || x.series : x.series) || se.t).replace(/ - .*$/, "") + " : furyogang.com/series/" + se.slug;
          if ((t + l).replace(/furyogang\.com\/\S*/g, "x".repeat(23)).length <= 280) t += l; });
        return t; })() };
  }

  // ——— Sorties de la semaine (Will, 25/11/2026) : séparées des news. Couverture, Japon, France (6 par image), la semaine prochaine. ———
  var titreS = function (x) { return String(x.pays === "France" ? (x.fr || x.series) : x.series).replace(/ - .*$/, ""); };
  function sortiesDonnees(du) {
    var au = dec(du, 6);
    return base().then(function (b) {
      var cal = b.cal.filter(function (x) { return x.cover; }).sort(function (a, z) { return a.date < z.date ? -1 : a.date > z.date ? 1 : 0; });
      var dans = function (x, a, z) { return x.date >= a && x.date <= z; };
      var jp = cal.filter(function (x) { return x.pays === "Japon" && dans(x, du, au); }), fr = cal.filter(function (x) { return x.pays === "France" && dans(x, du, au); });
      var vu = {}, proch = cal.filter(function (x) { return dans(x, dec(du, 7), dec(du, 13)); }).filter(function (x) { var k = x.seriesId || x.series; if (vu[k]) return false; vu[k] = 1; return true; });
      proch = proch.filter(function (x) { return x.pays === "France"; }).concat(proch.filter(function (x) { return x.pays !== "France"; })).slice(0, 4).sort(function (a, z) { return a.date < z.date ? -1 : 1; });
      return { du: du, au: au, jp: jp, fr: fr, proch: proch };
    });
  }
  // France et Japon alternés (couverture, story) : les deux pays visibles même quand l'un a beaucoup de sorties.
  var melePays = function (D) { var r = [], i = 0; while (i < Math.max(D.fr.length, D.jp.length)) { if (D.fr[i]) r.push(D.fr[i]); if (D.jp[i]) r.push(D.jp[i]); i++; } return r; };
  // Tête de couverture : date entre deux filets, ou en pastille jaune (essai du 25/11/2026).
  var teteCouv = function (per, titre, taille, pastille, fond) {
    var ombre = fond === "y" ? "none" : "0 6px 30px rgba(60,0,10,.6)", col = fond === "y" ? "#121214" : "#F2EFE9";
    return '<div style="position:absolute;left:0;right:0;top:' + (pastille ? 186 : 196) + 'px;text-align:center;z-index:3">' + (pastille ? '<span class="pdate' + (fond === "y" ? " k" : "") + '">' + per + "</span>" : '<div class="lab"><i></i><span>' + per + "</span><i></i></div>") +
      '<div class="t" style="font-size:' + taille + 'px;margin-top:' + (pastille ? 24 : 30) + 'px;white-space:nowrap;color:' + col + ';text-shadow:' + ombre + '">' + titre + "</div></div>"; };
  var drap = function (pays, w) { w = w || 46; return '<i class="flag ' + (pays === "France" ? "ffr" : "fjp") + '" style="width:' + w + "px;height:" + Math.round(w * 2 / 3) + 'px;border-radius:3px"></i>'; };
  function slidesSorties(D) {
    var S = [], per = periode(D.du, D.au), nm = melange(MOS, hash(D.du) + 11), tout = melePays(D);
    // Couverture : éventail (une sortie France au centre si possible), sommaire drapeau + série + tome.
    if (tout.length) {
      var c0 = tout[0], autres = tout.slice(1, 5), rang = [autres[0], autres[1], c0, autres[2], autres[3]];
      var fan = rang.map(function (x, i) { if (!x) return ""; var d = i - 2, f = !d, w = f ? 280 : 186, h = f ? 398 : 264;
        return '<div style="position:absolute;left:' + (540 - w / 2 + d * 196 + (d > 0 ? 40 : d < 0 ? -40 : 0)) + "px;top:" + (f ? 0 : 70) + "px;z-index:" + (5 - Math.abs(d)) + ";transform:rotate(" + d * 3 + 'deg)">' + cvH(x.cover, w, h, f ? "" : "filter:brightness(.82)") + "</div>"; }).join("");
      var lst = tout.slice(0, 5); // 5 lignes au sommaire, puis « + N autres sorties » (Will, 25/11/2026)
      S.push('<div class="hb">' + mos(D.fond || "r", 0, nm) + HD + teteCouv(per, "Les sorties de la semaine", 100, D.pastille, D.fond) +
        '<div style="position:absolute;left:0;right:0;top:400px;height:420px;z-index:3">' + fan + '</div>' +
        '<div style="position:absolute;left:70px;right:70px;top:850px;z-index:3;display:flex;flex-direction:column;gap:12px">' + lst.map(function (x) { return '<div style="display:flex;align-items:center;gap:20px;background:rgba(18,18,20,.78);border-radius:14px;padding:13px 20px">' + drap(x.pays) + '<b style="flex:1;min-width:0;font:700 46px/1 FGAntonio;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(titreS(x)) + '</b><span style="background:#C8102E;color:#fff;font:700 32px/1 FGAntonio;padding:7px 10px 9px;border-radius:7px">' + nn(x.n) + "</span></div>"; }).join("") +
        (tout.length > 5 ? '<div style="text-align:center;font:700 38px FGAntonio;text-transform:uppercase;letter-spacing:.06em;color:' + (D.fond === "y" ? "#121214" : "#F2C14E") + ';padding-top:2px">+ ' + (tout.length - 5) + " autres sorties</div>" : "") + "</div></div>");
    }
    // Japon puis France, ancien style validé (1 en grand, 2, 3, jusqu'à 6 par image).
    var tete = function (fl, nom, col, suite) { return '<div style="position:absolute;left:60px;right:60px;top:176px;z-index:3;display:flex;align-items:center;gap:26px"><i class="flag ' + fl + '"></i><div class="t" style="font-size:108px">' + nom + (suite ? '<span style="font-size:60px;color:#bdb9b1"> · suite</span>' : "") + '</div><div style="margin-left:auto;font:700 40px FGAntonio;letter-spacing:.06em;color:#bdb9b1;text-transform:uppercase">' + per + '</div></div><div style="position:absolute;left:60px;right:60px;top:320px;height:4px;background:' + col + ';z-index:3"></div>'; };
    var item = function (x, w) { return '<div class="so" style="width:' + w + 'px"><span class="tn">' + nn(x.n) + "</span>" + cvH(x.cover, w, Math.round(w * 1.42), "border-width:7px") + "<b>" + esc(titreS(x)) + '</b><span class="d">' + jm(x.date) + "</span></div>"; };
    [["jp", "fjp", "Japon", "#BC002D"], ["fr", "ffr", "France", "#1f4fd1"]].forEach(function (P) {
      var Lt = D[P[0]], fr = P[0] === "fr";
      // Deux images au plus par pays (Will, 25/11/2026) : 6 sur la 1re, 6 sur la « suite » (sans les dates, les couvertures remontent).
      for (var p0 = 0; p0 < Math.min(Lt.length, 12); p0 += 6) {
        var L = Lt.slice(p0, p0 + 6), reste = p0 ? Lt.length - 12 : 0;
        var h = '<div class="hb">' + mos("n", 11 + p0, L.map(function (x) { return x.cover; }).concat(nm.slice(0, 6))) + HD;
        if (p0) {
          h += '<div style="position:absolute;left:60px;right:60px;top:172px;z-index:3;display:flex;align-items:center;gap:20px"><i class="flag ' + P[1] + '" style="width:60px;height:40px"></i><div class="t" style="font-size:64px">' + P[2] + '<span style="color:#bdb9b1"> · la suite</span></div></div><div style="position:absolute;left:60px;right:60px;top:262px;height:4px;background:' + P[3] + ';z-index:3"></div>';
          h += '<div style="position:absolute;left:60px;right:60px;top:' + (L.length > 3 ? 318 : 360) + 'px;display:grid;grid-template-columns:repeat(3,' + (L.length > 3 ? "258px" : "294px") + ');justify-content:center;gap:' + (L.length > 3 ? "44px 56px" : "34px") + ';z-index:3">' + L.map(function (x) { return item(x, L.length > 3 ? 258 : 294); }).join("") + "</div>";
          if (L.length <= 3) h += '<div style="position:absolute;left:0;right:0;top:1060px;text-align:center;font:900 150px/1 FGNotoJP;color:rgba(255,255,255,.07);letter-spacing:.15em;z-index:2">新刊発売</div>';
          if (reste > 0) h += '<div style="position:absolute;left:0;right:0;bottom:50px;text-align:center;z-index:3;font:700 40px FGAntonio;text-transform:uppercase;letter-spacing:.06em;color:#F2C14E">+ ' + reste + " autres sur furyogang.com/calendrier</div>";
          S.push(h + "</div>"); continue;
        }
        h += tete(P[1], P[2], P[3]);
        if (L.length === 1) h += '<div class="vt" style="left:60px;top:400px;color:' + (fr ? "#1f4fd1" : "#E5483A") + ';font-size:130px;z-index:3">新刊</div><div class="vt" style="right:60px;top:400px;color:rgba(255,255,255,.12);font-size:130px;z-index:3">発売中</div><div style="position:absolute;left:50%;top:400px;transform:translateX(-50%) rotate(-2deg);z-index:3">' + item(L[0], 520).replace("<b>", '<b style="font-size:58px;text-align:center">').replace('<span class="d">', '<span class="d" style="text-align:center;font-size:32px">') + "</div>";
        else if (L.length === 2) h += '<div style="position:absolute;left:0;right:0;top:1150px;text-align:center;font:900 150px/1 FGNotoJP;color:rgba(255,255,255,.07);letter-spacing:.15em;z-index:2">新刊発売</div><div style="position:absolute;left:60px;right:60px;top:420px;display:flex;justify-content:center;gap:60px;z-index:3">' + L.map(function (x, i) { return '<div style="transform:rotate(' + (i ? 2 : -2) + 'deg)">' + item(x, 400).replace("<b>", '<b style="font-size:50px">') + "</div>"; }).join("") + "</div>";
        else if (L.length === 3) h += '<div style="position:absolute;left:0;right:0;top:1060px;text-align:center;font:900 150px/1 FGNotoJP;color:rgba(255,255,255,.07);letter-spacing:.15em;z-index:2">新刊発売</div><div style="position:absolute;left:60px;right:60px;top:410px;display:grid;grid-template-columns:repeat(3,1fr);gap:34px;z-index:3">' + L.map(function (x) { return item(x, 294); }).join("") + "</div>";
        else h += '<div style="position:absolute;left:60px;right:60px;top:380px;display:grid;grid-template-columns:repeat(3,258px);justify-content:center;gap:44px 56px;z-index:3">' + L.map(function (x) { return item(x, 258); }).join("") + "</div>";
        S.push(h + "</div>");
      }
    });
    // La semaine prochaine. (validée le 25/11/2026, passée des news aux sorties)
    if (D.proch.length) {
      S.push('<div class="hb">' + mos("n", 19, D.proch.map(function (x) { return x.cover; }).concat(nm.slice(10, 16))) + HD +
        '<div style="position:absolute;left:60px;right:60px;top:180px;z-index:3"><div class="k">Du ' + jj(dec(D.du, 7)) + " " + MOIS[+dec(D.du, 7).slice(5, 7) - 1] + " au " + jj(dec(D.du, 13)) + " " + MOIS[+dec(D.du, 13).slice(5, 7) - 1] + '</div><div class="t" style="font-size:116px;margin-top:16px;white-space:nowrap">La semaine prochaine.</div></div>' +
        '<div style="position:absolute;left:40px;right:40px;top:470px;display:flex;justify-content:center;align-items:flex-start;gap:30px;z-index:3">' + D.proch.map(function (x) { return '<div class="so" style="width:226px;text-align:center"><span class="tn" style="font-size:32px">' + nn(x.n) + "</span>" + cvH(x.cover, 226, 321, "border-width:6px") + '<b style="font-size:28px;white-space:normal">' + esc(titreS(x)) + '</b><span class="d" style="font-size:22px">' + jm(x.date) + "</span></div>"; }).join("") + "</div>" +
        basSite("Tout est sur", "furyogang.com", "/img/story/persos/12.png") + "</div>");
    }
    return S;
  }
  function storySorties(D) {
    var tout = melePays(D), autres = tout.slice(1, 5), rang = [autres[0], autres[1], tout[0], autres[2], autres[3]], gros = 430;
    var fan = rang.map(function (x, i) { if (!x) return ""; var d = i - 2, f = !d, w = f ? gros : Math.round(gros * .66), h = Math.round(w * 1.42);
      return '<div style="position:absolute;left:' + (540 - w / 2 + d * Math.round(gros * .66) + (d > 0 ? 50 : d < 0 ? -50 : 0)) + "px;top:" + (f ? 0 : Math.round(gros * .3)) + "px;z-index:" + (5 - Math.abs(d)) + ";transform:rotate(" + d * 3 + 'deg)">' + cvH(x.cover, w, h, f ? "" : "filter:brightness(.85)") + "</div>"; }).join("");
    var noms = tout.slice(0, 5).map(function (x) { return esc(titreS(x)); }), l1 = noms.slice(0, 3).join(" · "), l2 = noms.slice(3).join(" · ");
    return '<div class="hb st">' + mos("n", 9, melange(MOS, hash(D.du) + 5), 70) +
      '<div style="position:absolute;left:0;right:0;top:190px;z-index:3"><div style="text-align:center"><span style="display:inline-block;background:#F2C14E;color:#121214;font:700 40px/1 FGAntonio;letter-spacing:.12em;padding:12px 22px 14px;border-radius:10px;text-transform:uppercase">' + periode(D.du, D.au) + '</span></div>' +
      '<div class="t" style="margin-top:26px;font-size:150px;line-height:.92;text-align:center;text-shadow:0 6px 30px rgba(40,0,8,.6)">Les sorties<br><span style="color:#E5483A">de la semaine</span></div></div>' +
      '<div style="position:absolute;left:0;right:0;top:640px;height:600px;z-index:3">' + fan + "</div>" +
      '<div style="position:absolute;left:40px;right:40px;top:1310px;text-align:center;z-index:3;font:700 46px FGAntonio;text-transform:uppercase;letter-spacing:.04em">' + l1 + (l2 ? "<br>" + l2 : "") + "</div>" +
      '<div class="bas"><img src="/img/social/logo-blanc.png"><div class="l1">Tout le détail dans notre dernier post et sur</div><div class="l2">furyogang.com/calendrier</div></div></div>';
  }
  function legendeSorties(D) {
    var per = periode(D.du, D.au), l = function (x) { return "▪️ " + titreS(x) + " " + nn(x.n) + " (" + jm(x.date) + ")"; };
    return { ig: "📚 SORTIES MANGA DE LA SEMAINE · " + per.toUpperCase() + (D.jp.length ? "\n\n🇯🇵 Japon\n" + D.jp.map(l).join("\n") : "") + (D.fr.length ? "\n\n🇫🇷 France\n" + D.fr.map(l).join("\n") : "") + (D.proch.length ? "\n\n⏭️ La semaine prochaine : " + D.proch.map(titreS).join(", ") : "") + "\n\n📅 Le calendrier complet sur furyogang.com\n\n#manga #mangafr #FuryoGang",
      x: (function () { var t = "Les sorties manga de la semaine · " + per + "\n"; D.jp.concat(D.fr).forEach(function (x) { var l = "\n" + (x.pays === "France" ? "🇫🇷 " : "🇯🇵 ") + titreS(x) + " " + nn(x.n); if ([...(t + l)].length + 8 <= 280) t += l; }); return t; })(),
      liens: (function () { var t = "Les fiches des sorties de la semaine 👇\n", vus = {};
        D.fr.concat(D.jp).forEach(function (x) { var se = SLUG[x.seriesId]; if (!se || vus[se.slug]) return; vus[se.slug] = 1;
          var li = "\n▪️ " + titreS(x) + " : furyogang.com/series/" + se.slug;
          if ((t + li).replace(/furyogang\.com\/\S*/g, "x".repeat(23)).length <= 280) t += li; });
        return t; })() };
  }

  // ——— Prépublication de la semaine ———
  function prepubDonnees(du) {
    var au = dec(du, 6);
    return Promise.all([base(), get("/api/prepub")]).then(function (r) {
      var it = (r[1].items || []).filter(function (x) { return x.date >= du && x.date <= au && (x.status === "Paru" || x.status === "Pause"); });
      var G = {}, ordre = [], SER = {}; r[0].series.forEach(function (x) { SER[x.id] = x; });
      it.sort(function (a, z) { return a.date < z.date ? -1 : a.date > z.date ? 1 : 0; }).forEach(function (x) {
        var enLigne = /en ligne/i.test(x.mag), k = enLigne ? "En ligne" : x.mag;
        if (!G[k]) { G[k] = { m: enLigne ? "En ligne" : x.mag.replace(/^Weekly /, ""), cv: enLigne ? "" : (x.cover || ""), jours: [], plat: [], ch: [], pz: [], n: (x.issue || "").replace(/^\d{4}年/, "").replace(/^No\./, "N°").replace(/号$/, "") }; ordre.push(k); }
        var g = G[k], j = JC[new Date(x.date + "T12:00:00").getDay()] + " " + jj(x.date);
        if (g.jours.indexOf(j) < 0) g.jours.push(j); if (enLigne) { var pl = x.mag.replace(/ \(en ligne\)/i, ""); if (g.plat.indexOf(pl) < 0) g.plat.push(pl); }
        var se = SER[(x.series || [])[0]], nom = (se && se.inFR && se.fr) || x.entry.split(" · ")[0].replace(/\s*~.*$/, "").replace(/ - .*$/, "");
        var coul = (x.hl || []).some(function (h) { return /couleur/i.test(h); });
        if (x.status === "Pause") g.pz.push([nom, "p"]); else g.ch.push([nom, x.ch ? String(x.ch) : "", coul ? 1 : 0]);
        if (!g.cv && x.cover && !enLigne) g.cv = x.cover;
        if (enLigne && !g.cv && se && se.cover) g.cv = se.cover; // en ligne : pas de couverture de magazine → le tome de la série
      });
      var L = ordre.map(function (k) { var g = G[k]; g.sous = (g.m === "En ligne" ? g.plat.join(" · ") : (g.n ? g.n + " · " : "")) + (g.m === "En ligne" ? " · " : "") + g.jours.join(" et "); g.all = g.ch.concat(g.pz); return g; })
        .filter(function (g) { return g.ch.length; });
      return { du: du, au: au, mags: L, nch: L.reduce(function (s, g) { return s + g.ch.length; }, 0) };
    });
  }
  var chip = function (c) { return c[1] === "p" ? '<span class="chip p">' + esc(c[0]) + " <i>pause</i></span>" : '<span class="chip' + (c[2] ? " c" : "") + '">' + esc(c[0]) + (c[1] ? " <i>" + esc(c[1]) + "</i>" : "") + "</span>"; };
  function slidesPrepub(D) {
    var S = [], P = [], per = periode(D.du, D.au), m = melange(MOS, hash(D.du) + 7);
    for (var i = 0; i < D.mags.length; i += 3) P.push(D.mags.slice(i, i + 3));
    P.forEach(function (gs, i) {
      S.push('<div class="hb">' + mos("r", i * 21, m) + HD + '<div style="position:absolute;left:60px;right:60px;top:186px;z-index:3"><div class="lab"><i></i><span>Prépublication</span><b>連載</b><i></i></div>' +
        '<div class="t" style="margin-top:22px;font-size:100px;text-align:center;text-shadow:0 6px 30px rgba(60,0,10,.6)">' + (i ? "La suite" : per) + '</div><div style="display:flex;flex-direction:column;gap:22px;margin-top:40px">' +
        gs.map(function (g) { return '<div class="mag"><div class="cv" style="width:150px;height:208px;border-width:5px;box-shadow:none;border-radius:6px"><img src="' + esc(C(g.cv, 400)) + '"></div><div style="flex:1"><h5>' + esc(g.m) + "<small>" + esc(g.sous) + '</small></h5><div class="chips">' + g.all.map(chip).join("") + "</div></div></div>"; }).join("") + "</div></div>" +
        (i === P.length - 1 ? '<div style="position:absolute;left:0;right:0;bottom:60px;z-index:3;display:flex;justify-content:center;gap:28px;font:600 22px FGInter"><span style="display:inline-flex;align-items:center;gap:10px"><i style="display:inline-block;width:26px;height:18px;border-radius:4px;background:#F2C14E"></i>Pages couleurs</span><span style="display:inline-flex;align-items:center;gap:10px"><i style="display:inline-block;width:26px;height:18px;border-radius:4px;border:2px dashed rgba(242,239,233,.7)"></i>En pause</span><span>le chiffre = n° du chapitre</span></div>' : "") + "</div>");
    });
    return S;
  }
  function storyPrepub(D) {
    var L = D.mags.slice(0, 7), rows = L.length, top = Math.round(250 + Math.max(0, (7 - rows) * 60));
    return '<div class="hb st">' + mos("r", 45, melange(MOS, hash(D.du) + 3), 70) + '<div style="position:absolute;left:0;right:0;top:' + top + 'px;z-index:3"><div class="lab"><i></i><span>Prépublication</span><b>連載</b><i></i></div><div class="t" style="margin-top:22px;font-size:120px;text-align:center">' + periode(D.du, D.au) + "</div></div>" +
      '<div style="position:absolute;left:56px;right:56px;top:' + (top + 210) + 'px;z-index:3;display:flex;flex-direction:column;gap:10px">' + L.map(function (g) {
        return '<div style="display:flex;gap:20px;align-items:center;background:rgba(18,18,22,.8);border-radius:14px;padding:8px 14px"><div class="cv" style="width:80px;height:110px;border-width:4px;box-shadow:none;border-radius:5px"><img src="' + esc(C(g.cv, 200)) + '"></div><div style="flex:1;min-width:0"><div style="font:700 34px/1 FGAntonio;text-transform:uppercase;color:#F2C14E">' + esc(g.m) + '</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">' +
          g.ch.slice(0, 5).map(function (c) { return '<span class="chip" style="height:44px;font-size:27px;padding:0 12px 3px' + (c[2] ? ";background:#F2C14E" : "") + '">' + esc(c[0]) + (c[1] ? " <i>" + esc(c[1]) + "</i>" : "") + "</span>"; }).join("") + "</div></div></div>"; }).join("") + "</div>" +
      '<div class="bas"><img src="/img/social/logo-blanc.png"><div class="l1">Tout le détail dans notre dernier post et sur</div><div class="l2">furyogang.com/japon</div></div></div>';
  }
  function legendePrepub(D) {
    var per = periode(D.du, D.au);
    return { ig: "🗞️ PRÉPUBLICATION · " + per.toUpperCase() + "\n\n" + D.nch + " chapitres cette semaine dans les magazines japonais :\n\n" + D.mags.map(function (g) { return "▪️ " + g.m + " : " + g.ch.map(function (c) { return c[0] + (c[1] ? " ch. " + c[1] : ""); }).join(", "); }).join("\n") + "\n\n📚 Le planning complet sur furyogang.com\n\n#manga #prepublication #FuryoGang",
      x: "Prépublication · " + per + "\n\n" + D.nch + " chapitres cette semaine dans les magazines japonais : " + D.mags.map(function (g) { return g.m; }).join(", ") + "." };
  }

  // ——— API publique ———
  // Polices : la police japonaise est réduite aux caractères réellement affichés (titres japonais, kanji de décor).
  function tout(htmls, story, avance) {
    var res = [], i = 0, vus = {}, kanji = "";
    (htmls.join("") + story).replace(/<[^>]*>/g, "").replace(/[\u3000-\u9fff\uff00-\uffef]/g, function (c) { if (!vus[c]) { vus[c] = 1; kanji += c; } return c; });
    if (!polices || polices.k !== kanji) { polices = fontCSS(kanji || "不良"); polices.k = kanji; }
    var pol = polices;
    return htmls.reduce(function (p, h) { return p.then(function () { if (avance) avance(++i, htmls.length + 1); return rendre(h, 1440, pol).then(function (u) { res.push(u); }); }); }, Promise.resolve())
      .then(function () { if (avance) avance(htmls.length + 1, htmls.length + 1); return rendre(story, 1920, pol); }).then(function (s) { return { slides: res, story: s }; });
  }
  window.FG_HEBDO = {
    v: 1, dec: dec,
    lundi: function (j) { var d = new Date(j + "T12:00:00Z"); return dec(j, -((d.getUTCDay() + 6) % 7)); },
    news: function (du, reg, avance) { return newsDonnees(du, reg).then(function (D) { var h = slidesNews(D); return tout(h, storyNews(D), avance).then(function (r) { r.infos = D; r.legende = legendeNews(D); return r; }); }); },
    prepub: function (du, avance) { return prepubDonnees(du).then(function (D) { var h = slidesPrepub(D); return tout(h, storyPrepub(D), avance).then(function (r) { r.infos = D; r.legende = legendePrepub(D); return r; }); }); },
    sorties: function (du, avance) { return sortiesDonnees(du).then(function (D) { var h = slidesSorties(D); return tout(h, storySorties(D), avance).then(function (r) { r.infos = D; r.legende = legendeSorties(D); return r; }); }); },
    couvNews: function (D, avance) { var h = slidesNews(D); return tout(h.slice(0, 1), storyNews(D), avance).then(function (r) { r.infos = D; return r; }); },
    rendreSorties: function (D, avance) { var h = slidesSorties(D); if (D.seulCouv) h = h.slice(0, 1); return tout(h, storySorties(D), avance).then(function (r) { r.infos = D; r.legende = legendeSorties(D); return r; }); },
    donneesNews: newsDonnees, donneesPrepub: prepubDonnees, donneesSorties: sortiesDonnees
  };
})();
