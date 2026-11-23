/* Stories Instagram automatiques (Will, 23/11/2026).
   Un style tiré au hasard (fonds validés : trait droit, logo rond blanc 不良ギャング rouge, pas de fond crème)
   + deux persos de Studio Niceguy tirés au hasard en bas, à gauche et à droite.
   Le tirage dépend d'une « graine » (l'identifiant de la news ou du tome) : l'aperçu et l'image envoyée sont identiques.
   Le visuel du post est posé dans le cadre clair (même emplacement sur tous les styles).
   FG_STORY.tirage(graine, prepub) → { style, g, d }
   FG_STORY.html(t, srcPost)       → aperçu (1080 × 1920, à réduire avec transform)
   FG_STORY.canvas(t, imagePost)   → Promise<canvas 1080 × 1920> (imagePost : canvas, ImageBitmap ou <img>) */
(function () {
  var B = "/img/story/";
  var NEWS = ["rouge", "jaune", "noir-kanji", "rouge-couv", "bleu", "diagonale", "noir-couv"];
  var PREPUB = ["prepub-rouge", "prepub-noir", "prepub-jaune"];
  var PERSOS = ["01", "02", "03", "04", "05", "06", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
  var ZONE = { x: 140, y: 405, w: 814, h: 1104 };     // cadre clair (112,377 → 982,1537) moins 28 px de marge
  var PB = { w: 290, h: 380, m: 14 };                  // boîte d'un perso, collée en bas
  function hash(s) { var h = 2166136261; s = String(s || ""); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function tirage(graine, prepub) {
    var r = rng(hash(graine)), st = (prepub ? PREPUB : NEWS), g = PERSOS[Math.floor(r() * PERSOS.length)], d;
    do { d = PERSOS[Math.floor(r() * PERSOS.length)]; } while (d === g);
    return { style: st[Math.floor(r() * st.length)], g: g, d: d };
  }
  function html(t, src) {
    var boite = function (n, cote) { return '<img src="' + B + 'persos/' + n + '.png" style="position:absolute;bottom:0;' + cote + ':' + PB.m + 'px;width:' + PB.w + 'px;height:' + PB.h + 'px;object-fit:contain;object-position:' + cote + ' bottom">'; };
    return '<div style="position:relative;width:1080px;height:1920px;overflow:hidden"><img src="' + B + 'styles/' + t.style + '.jpg" style="position:absolute;inset:0;width:100%;height:100%">' +
      (src ? '<img src="' + src + '" style="position:absolute;left:' + ZONE.x + 'px;top:' + ZONE.y + 'px;width:' + ZONE.w + 'px;height:' + ZONE.h + 'px;object-fit:contain">' : "") + boite(t.g, "left") + boite(t.d, "right") + '</div>';
  }
  function charger(u) { return new Promise(function (ok, ko) { var i = new Image(); i.crossOrigin = "anonymous"; i.onload = function () { ok(i); }; i.onerror = function () { ko(new Error("image introuvable : " + u)); }; i.src = u; }); }
  function canvas(t, post) {
    return Promise.all([charger(B + "styles/" + t.style + ".jpg"), charger(B + "persos/" + t.g + ".png"), charger(B + "persos/" + t.d + ".png")]).then(function (L) {
      var c = document.createElement("canvas"); c.width = 1080; c.height = 1920; var x = c.getContext("2d");
      x.drawImage(L[0], 0, 0, 1080, 1920);
      if (post) { var pw = post.width, ph = post.height, k = Math.min(ZONE.w / pw, ZONE.h / ph), w = pw * k, h = ph * k, px = ZONE.x + (ZONE.w - w) / 2, py = ZONE.y + (ZONE.h - h) / 2;
        x.save(); x.beginPath(); if (x.roundRect) x.roundRect(px, py, w, h, 14); else x.rect(px, py, w, h); x.clip(); x.drawImage(post, px, py, w, h); x.restore(); }
      [[L[1], "g"], [L[2], "d"]].forEach(function (p) { var im = p[0], k = Math.min(PB.w / im.width, PB.h / im.height), w = im.width * k, h = im.height * k;
        x.drawImage(im, p[1] === "g" ? PB.m : 1080 - PB.m - w, 1920 - h, w, h); });
      return c;
    });
  }
  // Prépublication : couverture du dernier tome, magazine et numéro, titre de la série, chapitre (Will, 23/11/2026).
  var POLICES = null;
  function polices() {
    if (POLICES) return POLICES;
    var f = [new FontFace("FGStA", "url(/fonts/Antonio.ttf)", { weight: "700" }), new FontFace("FGStI", "url(/fonts/Inter.ttf)", { weight: "800" })];
    POLICES = Promise.all(f.map(function (x) { return x.load().then(function (y) { document.fonts.add(y); }); })).catch(function () {});
    return POLICES;
  }
  function canvasPrepub(t, d) {
    return Promise.all([polices(), d.cover ? charger(d.cover).catch(function () { return null; }) : null]).then(function (L) {
      var cv = L[1], c = document.createElement("canvas"); c.width = 870; c.height = 1160; var x = c.getContext("2d");
      x.fillStyle = "#F4ECDD"; x.fillRect(0, 0, 870, 1160);
      if (cv) { var w = 470, h = 672, k = Math.max(w / cv.width, h / cv.height), sw = w / k, sh = h / k;
        x.save(); x.translate(435, 70 + h / 2); x.rotate(-3 * Math.PI / 180); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 50; x.shadowOffsetY = 24;
        x.fillStyle = "#fff"; x.fillRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16); x.shadowColor = "transparent";
        x.drawImage(cv, (cv.width - sw) / 2, (cv.height - sh) / 2, sw, sh, -w / 2, -h / 2, w, h); x.restore(); }
      x.textAlign = "center"; x.fillStyle = "#6b665e"; x.font = "800 26px FGStI"; if ("letterSpacing" in x) x.letterSpacing = "4px";
      x.fillText(String([d.magazine, d.numero].filter(Boolean).join(" · ")).toUpperCase(), 435, 816);
      if ("letterSpacing" in x) x.letterSpacing = "0px";
      x.fillStyle = "#111"; var fs = 96, tt = String(d.titre || "").toUpperCase(); x.font = "700 " + fs + "px FGStA";
      while (x.measureText(tt).width > 790 && fs > 50) { fs -= 4; x.font = "700 " + fs + "px FGStA"; }
      x.fillText(tt, 435, 820 + 22 + fs * .82);
      var ch = d.chapitre ? "CHAPITRE " + d.chapitre : "NOUVEAU CHAPITRE"; x.font = "700 54px FGStA"; var cw = x.measureText(ch).width + 60, cy = 820 + 22 + fs * .82 + 34;
      x.fillStyle = "#BC002D"; x.beginPath(); if (x.roundRect) x.roundRect(435 - cw / 2, cy, cw, 74, 14); else x.rect(435 - cw / 2, cy, cw, 74); x.fill();
      x.fillStyle = "#fff"; x.fillText(ch, 435, cy + 58);
      return canvas(t, c);
    });
  }
  window.FG_STORY = { tirage: tirage, html: html, canvas: canvas, canvasPrepub: canvasPrepub, ZONE: ZONE };
})();
