/* Miniatures et bouton lecture des bandes-annonces YouTube (Will, 06/10/2026).
   FG_YT.img(id) : la miniature en haute définition (repli sur hqdefault), recadrée pour retirer les bandes noires
   qui ne font pas partie de l'image, afin qu'elle remplisse tout le cadre 16:9.
   FG_YT.play : bouton lecture classique (rectangle arrondi gris foncé semi-transparent, triangle blanc). */
(function () {
  var css = document.createElement("style");
  css.textContent =
    ".yt .ytp{position:absolute;inset:auto;display:grid;left:50%;top:50%;:absolute;left:50%;top:50%;width:72px;height:50px;margin:-25px 0 0 -36px;border-radius:14px;background:rgba(28,28,30,.72);" +
    "-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 0 0 1px rgba(255,255,255,.12) inset;display:grid;place-items:center;transition:background .15s,transform .15s;z-index:2}" +
    ".yt .ytp svg{width:26px;height:26px;fill:#fff;margin-left:2px}" +
    ".yt:hover .ytp,.yt:focus-visible .ytp{background:rgba(0,0,0,.88);transform:scale(1.05)}" +
    ".yt img.yti{transform-origin:50% 50%}";
  document.head.appendChild(css);
  var PLAY = '<span class="ytp" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span>';
  function fallback(im) { if (/maxresdefault/.test(im.src)) { im.src = im.src.replace("maxresdefault", "hqdefault"); return true; } return false; }
  // Lignes presque noires en haut et en bas : bandes à retirer.
  function crop(im) {
    if (im.naturalWidth && im.naturalWidth < 200 && fallback(im)) return;
    try {
      var W = 160, H = Math.round(W * im.naturalHeight / im.naturalWidth), c = document.createElement("canvas");
      c.width = W; c.height = H;
      var x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, W, H);
      var d = x.getImageData(0, 0, W, H).data;
      var dark = function (y) { var s = 0, mx = 0; for (var i = 0; i < W; i++) { var k = (y * W + i) * 4, l = (d[k] * 3 + d[k + 1] * 6 + d[k + 2]) / 10; s += l; if (l > mx) mx = l; } return s / W < 16 && mx < 48; };
      var t = 0, b = 0;
      while (t < H / 2 && dark(t)) t++;
      while (b < H / 2 && dark(H - 1 - b)) b++;
      var h = H - t - b, vis = W * 9 / 16; // hauteur visible dans le cadre 16:9 (object-fit:cover)
      if (h < H * 0.25 || h >= vis - 1) { im.style.transform = ""; return; }
      var s = vis / h, off = (t + h / 2) - H / 2;
      im.style.transform = "translateY(" + (-off * s / vis * 100).toFixed(2) + "%) scale(" + s.toFixed(3) + ")";
    } catch (e) {}
  }
  window.FG_YT = {
    play: PLAY,
    img: function (id) { return '<img class="yti" src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" crossorigin="anonymous" alt="" loading="lazy" onload="FG_YT.crop(this)" onerror="FG_YT.err(this)">'; },
    crop: crop,
    err: function (im) { fallback(im); }
  };
})();
