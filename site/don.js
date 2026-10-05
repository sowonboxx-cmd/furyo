/* Blocs « don » du gang (Will, 06/10/2026) : personnages détourés + phrases, bouton PayPal.
   FG_DON(kind) renvoie le HTML d'un bloc : "haru" (Haruyama, « Toi. Oui, toi. »), "jinnai" (« On rackette pas. On propose. »),
   "duo" (Maruyama et Kadosumi, « La cotisation, c'est maintenant. »), "bandeau" (ordinateur, le duo : « Tes potes lisent gratos. »).
   FG_DON.hasard(["haru","jinnai","duo"]) en tire un au hasard à chaque chargement.
   PAYPAL : le lien PayPal de Will (vide = bouton « Bientôt dispo »). */
(function () {
  var PAYPAL = "";
  var ARR = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 16 16 8M9.5 8H16v6.5"/></svg>';
  var css = document.createElement("style");
  css.textContent =
    ".fgd{position:relative;margin:86px 0 8px;padding:20px;border-radius:22px;background:#000;color:#F5F5F7;text-align:left;min-height:240px}" +
    ".fgd .ch{position:absolute;bottom:0;z-index:2;filter:drop-shadow(0 10px 18px rgba(0,0,0,.55));pointer-events:none;width:auto}" +
    ".fgd .tx{position:relative;z-index:3;width:56%;display:flex;flex-direction:column;align-items:flex-start;gap:12px}" +
    ".fgd .tag{align-self:flex-start;display:inline-block;transform:rotate(-4deg);background:#BC002D;color:#fff;font:800 11px Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:5px 10px;border-radius:4px;white-space:nowrap}" +
    ".fgd .msg{margin:0;font:700 30px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}.fgd .msg em{font-style:normal;color:#F2B33D}" +
    ".fgd .sub{margin:0;font:500 14px/1.45 Inter,sans-serif;color:#D8D8DC;letter-spacing:-.005em}" +
    ".fgd .pp{display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 18px;border:0;border-radius:22px;background:#305887;color:#fff;font:800 14.5px Inter,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap}" +
    ".fgd .pp.y{background:#F2B33D;color:#000}.fgd .pp .arr{width:15px;height:15px}" +
    ".fgd .bul{position:absolute;z-index:1;background:#F2B33D;color:#000;font:400 16px/1.05 Bangers,cursive;letter-spacing:.04em;padding:8px 12px;border-radius:16px;transform:rotate(-3deg);white-space:nowrap}" +
    /* Bandeau ordinateur : sur la largeur du fil, le duo à gauche */
    ".fgd.bn{min-height:190px;margin:70px 0 0;padding:22px 26px 22px 236px;display:flex;align-items:center;gap:22px}" +
    ".fgd.bn .tx{width:auto;flex:1}.fgd.bn .msg{font-size:32px}";
  document.head.appendChild(css);
  if (!document.querySelector('link[href*="family=Bangers"]')) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Bangers&display=swap"; document.head.appendChild(l); }
  function bouton(lab, jaune) {
    var c = "pp" + (jaune ? " y" : "");
    return PAYPAL ? '<a class="' + c + '" href="' + PAYPAL + '" target="_blank" rel="noopener">' + lab + ARR + "</a>"
      : '<button type="button" class="' + c + '" onclick="this.firstChild.textContent=\'Bientôt dispo \'">' + lab + ARR + "</button>";
  }
  var img = function (k, style) { return '<img class="ch no-sk" src="/img/don/' + k + '.webp" alt="" loading="lazy" style="' + style + '">'; };
  var tag = '<span class="tag">Message du gang</span>';
  var B = {
    haru: function () { return '<div class="fgd">' + img("haru", "right:4px;height:300px") + '<div class="tx">' + tag + '<p class="msg">Toi.<br>Oui, <em>toi.</em></p><p class="sub">Le gang a besoin de 2 €.</p>' + bouton("Filer 2 € ") + "</div></div>"; },
    jinnai: function () { return '<div class="fgd">' + img("jinnai", "right:-6px;height:290px") + '<div class="tx">' + tag + '<p class="msg">On rackette pas.<br><em>On propose.</em></p><p class="sub">Mais on insiste.</p>' + bouton("PayPal ") + "</div></div>"; },
    duo: function () { return '<div class="fgd"><span class="bul" style="right:16px;top:-46px">On t’attend à la sortie.</span>' + img("duo", "right:-6px;height:250px") + '<div class="tx" style="width:48%">' + tag + '<p class="msg">La <em>cotisation</em>, c’est maintenant.</p>' + bouton("Cotiser ") + "</div></div>"; },
    bandeau: function () { return '<div class="fgd bn">' + img("duo", "left:16px;height:240px") + '<div class="tx">' + tag + '<p class="msg">Tes potes lisent gratos.<br>Sois pas <em>comme tes potes.</em></p></div>' + bouton("Filer 2 € ", true) + "</div>"; }
  };
  window.FG_DON = function (k) { return B[k] ? B[k]() : ""; };
  window.FG_DON.hasard = function (l) { return window.FG_DON(l[Math.floor(Math.random() * l.length)]); };
})();
