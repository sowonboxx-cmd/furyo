/* Stories Instagram automatiques — v2 (Will, 24/11/2026, charte : /hq/charte/ « Stories »).
   Plus de persos ni de cadre crème. Le bas (logo + furyogang.com, trait jaune à y = 1600) ne bouge jamais.
   News (post + story) : fond noir, visuel du post en plein cadre (1080 de large), sans fondu ni étiquette.
     Si le visuel a une version story sans logo du haut (…/story.jpg à côté de …/reseaux.jpg), c'est elle qui sert.
   Prépublication : fond rouge + mosaïque noir et blanc des tomes de la série, « Prépublication 連載 » entre deux filets
     et le titre en haut, la couverture au centre (bordure noire sans ombre), en bas le chapitre (+ « Pages couleurs »).
     Annonce d'arc (« En route vers l'arc final ») en jaune sous le titre. Pas de magazine.
   API (inchangée pour les appelants) :
   FG_STORY.tirage(graine, prepub) → { style }
   FG_STORY.html(t, srcPost[, srcSecours]) → aperçu news (1080 × 1920, à réduire avec transform)
   FG_STORY.canvas(t, imagePost)   → Promise<canvas 1080 × 1920> (imagePost : canvas, ImageBitmap ou <img>)
   FG_STORY.canvasPrepub(t, d)     → Promise<canvas 1080 × 1920> ; d = { cover, titre, sousTitre, chapitre, couleur, slug } */
(function () {
  var B = "/img/story/styles/", FN = B + "v2-noir.jpg?v=1", FR = B + "v2-rouge.jpg?v=1";
  var LIGNE = 1600, HAUT = 150;                        // HAUT : début du bloc prépub, sous l'interface Instagram (barres, avatar, croix)                                     // trait jaune : tout le contenu tient au-dessus
  function tirage(graine, prepub) { return { style: prepub ? "v2-rouge" : "v2-noir" }; }
  // Place du visuel d'une news : 1080 de large ; un grand visuel est posé sur le trait jaune (un post 1440 commence à 160 px,
  // son logo passe sous l'avatar Instagram sinon — Will, 25/11/2026), un petit est centré.
  function place(pw, ph) { var h = Math.round(ph * 1080 / pw), top = h >= 1440 ? Math.max(0, LIGNE - h) : Math.round((LIGNE - h) / 2); return { top: top, h: Math.min(h, LIGNE - top) }; }
  function html(t, src, secours) {
    var err = secours ? ' onerror="this.onerror=null;this.src=\'' + secours + '\'"' : "";
    return '<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#0c0c0e"><img src="' + FN + '" style="position:absolute;inset:0;width:100%;height:100%">' +
      (src ? '<div style="position:absolute;left:0;top:0;width:1080px;height:' + LIGNE + 'px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden"><img src="' + src + '"' + err + ' style="width:1080px;height:auto;max-height:' + LIGNE + 'px;object-fit:cover;object-position:top"></div>' : "") + '</div>';
  }
  function charger(u) { return new Promise(function (ok, ko) { var i = new Image(); i.crossOrigin = "anonymous"; i.onload = function () { ok(i); }; i.onerror = function () { ko(new Error("image introuvable : " + u)); }; i.src = u; }); }
  function canvas(t, post) {
    return charger(FN).then(function (fond) {
      var c = document.createElement("canvas"); c.width = 1080; c.height = 1920; var x = c.getContext("2d");
      x.drawImage(fond, 0, 0, 1080, 1920);
      if (post) { var p = place(post.width, post.height), sh = p.h * post.width / 1080; x.drawImage(post, 0, 0, post.width, sh, 0, p.top, 1080, p.h); }
      return c;
    });
  }
  var POLICES = null;
  function polices() {
    if (POLICES) return POLICES;
    var f = [new FontFace("FGStA", "url(/fonts/Antonio.ttf)", { weight: "700" }), new FontFace("FGStI", "url(/fonts/Inter.ttf)", { weight: "800" }), new FontFace("FGStJ", "url(/fonts/NotoSansJP.ttf)", { weight: "900" })];
    POLICES = Promise.all(f.map(function (x) { return x.load().then(function (y) { document.fonts.add(y); }); })).catch(function () {});
    return POLICES;
  }
  function esp(x, v) { if ("letterSpacing" in x) x.letterSpacing = v; }
  function couvU(u, w) { return !u ? "" : /^\/api\/couv|^data:/.test(u) ? u : "/api/couv?u=" + encodeURIComponent(u) + "&w=" + w; }
  // Tomes de la série pour la mosaïque du fond (toutes éditions), sans la couverture affichée.
  function tomes(slug, sauf) {
    if (!slug) return Promise.resolve([]);
    return fetch("/api/serie?s=" + encodeURIComponent(slug)).then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) {
      var l = []; ((j && j.editions) || []).forEach(function (e) { (e.tomes || []).forEach(function (tm) { if (tm.cover && l.indexOf(tm.cover) < 0) l.push(tm.cover); }); });
      var s = String(sauf || ""); l = l.filter(function (u) { return s.indexOf(encodeURIComponent(u)) < 0 && s !== u; });
      return Promise.all(l.slice(0, 12).map(function (u) { return charger(couvU(u, 320)).catch(function () { return null; }); }));
    }).then(function (L) { return L.filter(Boolean); }).catch(function () { return []; });
  }
  function rr(x, X, Y, W, H, r) { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, W, H, r); else x.rect(X, Y, W, H); }
  function canvasPrepub(t, d) {
    d = d || {};
    return Promise.all([polices(), charger(FR), d.cover ? charger(d.cover).catch(function () { return null; }) : null, tomes(d.slug, d.cover)]).then(function (L) {
      var fond = L[1], cv = L[2], mos = L[3].length ? L[3] : (cv ? [cv] : []);
      var c = document.createElement("canvas"); c.width = 1080; c.height = 1920; var x = c.getContext("2d");
      x.drawImage(fond, 0, 0, 1080, 1920);
      // Fond rouge + mosaïque des tomes (noir et blanc, en produit), puis assombrissement au centre et en bas.
      x.save(); x.beginPath(); x.rect(0, 0, 1080, LIGNE - 1); x.clip();
      x.fillStyle = "#CB002F"; x.fillRect(0, 0, 1080, LIGNE);
      if (mos.length) {
        x.save(); x.translate(540, 1140); x.rotate(-8 * Math.PI / 180); x.globalAlpha = .34; x.globalCompositeOperation = "multiply";
        if ("filter" in x) x.filter = "grayscale(1) contrast(1.25) brightness(1.05)";
        var cw = (1600 - 6 * 18) / 7, ch = cw * 10 / 7;
        for (var j = 0; j < 63; j++) { var im = mos[(j * 5 + (j / 7 | 0)) % mos.length], gx = -800 + (j % 7) * (cw + 18), gy = -1440 + (j / 7 | 0) * (ch + 18), k = Math.max(cw / im.width, ch / im.height), sw = cw / k, sh = ch / k;
          x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, gx, gy, cw, ch); }
        x.restore();
      }
      x.save(); x.translate(540, 720); x.scale(648 / 720, 1); var g = x.createRadialGradient(0, 0, 0, 0, 0, 720); g.addColorStop(0, "rgba(150,0,30,.55)"); g.addColorStop(.75, "rgba(150,0,30,0)"); x.fillStyle = g; x.fillRect(-900, -900, 1800, 1800); x.restore();
      g = x.createLinearGradient(0, 0, 0, LIGNE); g.addColorStop(.6, "rgba(120,0,25,0)"); g.addColorStop(1, "rgba(120,0,25,.65)"); x.fillStyle = g; x.fillRect(0, 0, 1080, LIGNE);
      x.restore();
      // Texte du haut dessiné sur un calque, posé après la couverture pour s'en rapprocher (Will, 25/11/2026).
      var X0 = x, T = document.createElement("canvas"); T.width = 1080; T.height = 1920; x = T.getContext("2d");
      x.textAlign = "left"; x.textBaseline = "alphabetic";
      // « PRÉPUBLICATION 連載 » entre deux filets, à 150 px du haut : sous l'avatar et « Votre story » d'Instagram (Will, 25/11/2026).
      var y = HAUT, lab = "PRÉPUBLICATION";
      x.font = "700 34px FGStA"; esp(x, "11px"); var wl = x.measureText(lab).width; esp(x, "0px");
      x.font = "900 30px FGStJ"; esp(x, "3px"); var wk = x.measureText("連載").width; esp(x, "0px");
      var tot = 110 + 24 + wl + 16 + wk + 24 + 110, X = (1080 - tot) / 2;
      x.fillStyle = "rgba(255,255,255,.85)"; x.fillRect(X, y + 16, 110, 2); x.fillRect(X + tot - 110, y + 16, 110, 2);
      x.fillStyle = "#fff"; x.font = "700 34px FGStA"; esp(x, "11px"); x.fillText(lab, X + 134, y + 30); esp(x, "0px");
      x.fillStyle = "#F2C14E"; x.font = "900 30px FGStJ"; esp(x, "3px"); x.fillText("連載", X + 134 + wl + 16, y + 29); esp(x, "0px");
      y += 34 + 22;
      // Titre : réduit jusqu'à 80 px, puis sur deux lignes.
      // « Shisei-dō ~Sankyōdai no Kizuna~ », « The Fable - The third secret » : la 2e partie passe en sous-titre crème.
      var brut = String(d.titre || "").trim(), mt = brut.match(/^(.+?)\s*~\s*(.+?)\s*~\s*$/) || brut.match(/^(.+?)\s+[-–:]\s+(.+)$/), sous2 = "";
      if (mt) { brut = mt[1]; sous2 = mt[2]; if (/~/.test(d.titre)) sous2 = "~ " + sous2 + " ~"; }
      var tt = brut.toUpperCase(), fs = 120; x.font = "700 " + fs + "px FGStA";
      while (x.measureText(tt).width > 980 && fs > 80) { fs -= 2; x.font = "700 " + fs + "px FGStA"; }
      var lignes = [tt];
      if (x.measureText(tt).width > 980) { var m = tt.split(" "), best = 1, ecart = 1e9; for (var i = 1; i < m.length; i++) { var a = x.measureText(m.slice(0, i).join(" ")).width, b = x.measureText(m.slice(i).join(" ")).width; if (Math.max(a, b) < ecart) { ecart = Math.max(a, b); best = i; } } lignes = [m.slice(0, best).join(" "), m.slice(best).join(" ")]; }
      x.textAlign = "center"; x.fillStyle = "#fff"; x.shadowColor = "rgba(60,0,10,.6)"; x.shadowBlur = 30; x.shadowOffsetY = 6;
      lignes.forEach(function (l) { x.fillText(l, 540, y + fs * .88); y += fs; });
      x.shadowColor = "transparent"; x.shadowBlur = 0; x.shadowOffsetY = 0;
      if (sous2) { var s2 = sous2.toUpperCase(), f2 = 40; x.font = "700 " + f2 + "px FGStA"; esp(x, "1.6px");
        while (x.measureText(s2).width > 980 && f2 > 24) { f2 -= 2; x.font = "700 " + f2 + "px FGStA"; }
        x.fillStyle = "rgba(242,239,233,.9)"; x.fillText(s2, 540, y + 12 + f2 * .88); esp(x, "0px"); y += 12 + f2; }
      // Annonce d'arc (sous-titre) : jaune, italique, pour ne pas la confondre avec le titre.
      if (d.sousTitre) { var st = "« " + String(d.sousTitre).replace(/^«\s*|\s*»$/g, "").toUpperCase() + " »", sf = 40; x.font = "italic 700 " + sf + "px FGStA"; esp(x, "1.6px");
        while (x.measureText(st).width > 980 && sf > 24) { sf -= 2; x.font = "italic 700 " + sf + "px FGStA"; }
        x.fillStyle = "#F2C14E"; x.fillText(st, 540, y + 12 + sf * .88); esp(x, "0px"); y += 12 + sf; }
      x = X0; x.textAlign = "center"; var finTexte = y;
      // Bas : chapitre (+ « Pages couleurs »), posé à 44 px du trait jaune.
      var pills = [{ t: d.chapitre ? "CHAPITRE " + d.chapitre : "NOUVEAU CHAPITRE", f: "700 46px FGStA", plein: true }];
      if (d.couleur) pills.push({ t: "PAGES COULEURS", f: "700 40px FGStA", plein: false });
      var py = LIGNE - 44 - 72; esp(x, "1.4px");
      pills.forEach(function (p) { x.font = p.f; p.w = x.measureText(p.t).width + (p.plein ? 48 : 44); });
      var pw = pills.reduce(function (s, p) { return s + p.w; }, 0) + 16 * (pills.length - 1), px = (1080 - pw) / 2;
      x.textBaseline = "middle";
      pills.forEach(function (p) { x.font = p.f;
        if (p.plein) { x.fillStyle = "#F2C14E"; rr(x, px, py, p.w, 72, 10); x.fill(); x.fillStyle = "#121214"; }
        else { x.strokeStyle = "#fff"; x.lineWidth = 3; rr(x, px + 1.5, py + 1.5, p.w - 3, 69, 10); x.stroke(); x.fillStyle = "#fff"; }
        x.fillText(p.t, px + p.w / 2, py + 37); px += p.w + 16; });
      esp(x, "0px"); x.textBaseline = "alphabetic";
      // Couverture : remplit l'espace entre le haut et le chapitre, bordure noire 8 px sans ombre.
      var dy = 0;
      if (cv) { var y0 = y + 46, y1 = py - 46, r = cv.height / cv.width, h = Math.min(y1 - y0 - 16, 1080 * r), w = h / r;
        if (w > 840) { w = 840; h = w * r; }
        var top = y0 + (y1 - y0 - h - 16) / 2, left = (1080 - w - 16) / 2;
        x.fillStyle = "#121214"; x.fillRect(left, top, w + 16, h + 16); x.drawImage(cv, left + 8, top + 8, w, h);
        // Le bloc du haut descend jusqu'à 34 px de la couverture (80 px au plus), pour ne pas laisser de vide (Will, 25/11/2026, maquettes 8).
        dy = Math.max(0, Math.min(80, top - finTexte - 34)); }
      x.drawImage(T, 0, dy);
      return c;
    });
  }
  window.FG_STORY = { tirage: tirage, html: html, canvas: canvas, canvasPrepub: canvasPrepub, v: 2 };
})();
