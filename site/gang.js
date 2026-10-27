/* Blocs « Rejoindre le gang » et fenêtre Premium (maquettes validées par Will le 18/10/2026).
   FG_GANG("bandeau")  : accueil ordinateur, le duo (« On t'attend à la sortie »).
   FG_GANG("mobile")   : accueil téléphone, Haruyama en haut, pastilles en grille (A3).
   FG_GANG("widget")   : colonne de droite, Murota (« Toi, là. Viens manger avec le gang »).
   Ces trois blocs ne s'affichent qu'aux visiteurs : dès qu'on sait que la personne est membre, ils disparaissent.
   FG_GANG.premium()   : fenêtre Premium (7F, rouge à plat), une seule fois par membre, jusqu'au 30 novembre. */
(function () {
  var FIN = new Date("2026-12-01T00:00:00+01:00"), OFFERT = Date.now() < FIN.getTime();
  var G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  var P = { c: '<path d="M4 5h16v11H9l-5 4z"/>', s: '<path d="M6 4h12v16l-6-4-6 4z"/>', f: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', m: '<path d="M4 5v14M9 5v14M14 5l5 14"/>', p: '<path d="M12 3l2.6 5.6 6 .7-4.5 4 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.5-4 6-.7z"/>' };
  var ic = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#F2B33D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + "</svg>"; };
  var BEN = [["c", "Commenter"], ["s", "Signets"], ["f", "Feed perso"], ["m", "Ma collection"]];
  var chips = function (court) { return BEN.map(function (b) { return "<span>" + ic(b[0]) + (court && b[0] === "m" ? "Collection" : b[1]) + "</span>"; }).join(""); };
  var css = document.createElement("style");
  css.textContent =
    ".fgm{position:relative;background:#000;color:#F5F5F7;border-radius:22px;text-align:left;font-family:Inter,sans-serif}" +
    ".fgm .ch{position:absolute;pointer-events:none;width:auto;filter:drop-shadow(0 10px 18px rgba(0,0,0,.55))}" +
    ".fgm .tag{display:inline-block;transform:rotate(-4deg);background:#BC002D;color:#fff;font:800 11px Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:5px 10px;border-radius:4px;white-space:nowrap}" +
    ".fgm .msg{margin:12px 0 0;font:700 32px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}.fgm .msg em{font-style:normal;color:#F2B33D}" +
    ".fgm .sub{margin:10px 0 0;font:500 14px/1.45 Inter,sans-serif;color:#D8D8DC}" +
    ".fgm .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.fgm .chips span{display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;background:#1C1C1E;font:700 13px Inter,sans-serif}" +
    ".fgm .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.fgm .grid span{display:flex;align-items:center;gap:8px;padding:11px 12px;border-radius:14px;background:#1C1C1E;font:700 13.5px Inter,sans-serif;white-space:nowrap;min-width:0}" +
    ".fgm svg{width:18px;height:18px;flex:none}" +
    ".fgm .go{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:46px;padding:0 22px;border:0;border-radius:23px;background:#305887;color:#fff;font:800 15px Inter,sans-serif;white-space:nowrap;cursor:pointer}" +
    ".fgm .go:hover{filter:brightness(1.12)}.fgm .go.w{width:100%;margin-top:14px}" +
    ".fgm .go svg{background:#fff;border-radius:50%;padding:3px;width:18px;height:18px}" +
    ".fgm .pr{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:10px;background:rgba(242,179,61,.14);color:#F2B33D;font:700 13px Inter,sans-serif}" +
    ".fgm .bul,.fgp .bul{position:absolute;z-index:2;background:#F2B33D;color:#000;font:400 17px/1.05 Bangers,cursive;letter-spacing:.04em;padding:8px 12px;border-radius:16px;transform:rotate(-3deg);white-space:nowrap}" +
    ".fgm.bn{margin:70px 0 0;min-height:210px;padding:26px 26px 26px 250px}" +
    ".fgm.mo{padding:20px}.fgm.mo .mh{position:relative}.fgm.mo .tx{position:relative;z-index:2;width:62%}.fgm.mo .msg{font-size:30px}" +
    ".fgm .go.y{background:#F2B33D;color:#000}.fgm-b{text-align:center;padding:16px 14px}.fgm-b .ci{width:170px;height:170px;margin:0 auto;border-radius:50%;background:#F2B33D;position:relative;overflow:hidden}.fgm-b .ci img{position:absolute;left:50%;bottom:6px;height:162px;width:auto;transform:translateX(-50%)}" +
    ".fgm-b .tag{position:relative;margin-top:-10px}.fgm-b .msg{font-size:25px;line-height:1.02;margin-top:10px}.fgm-b .sub{font-size:12.5px;margin-top:8px}.fgm-b .grid{text-align:left}" +
    ".fgm-c{padding:14px;border:1px solid #2C2C2E;border-radius:14px}.fgm-c .top{position:relative;padding-top:30px;margin-bottom:6px}.fgm-c .bul{left:50%;top:0;transform:translateX(-50%) rotate(-3deg);font-size:14px}" +
    ".fgm-c .msg{font-size:24px;margin-top:10px}.fgm-c .sub{font-size:12.5px}.fgm-c .grid{gap:6px}.fgm-c .grid span{padding:9px 8px;font-size:12px;gap:6px}.fgm-c .grid svg{width:15px;height:15px}.fgm-c .go{height:40px;font-size:14px}" +
    ".fgm.wd{padding:18px}.fgm.wd .hd{position:relative;min-height:220px}.fgm.wd .tx{position:relative;z-index:2;width:58%;padding-top:38px}.fgm.wd .msg{font-size:27px}.fgm.wd .sub{font-size:13px}.fgm.wd .bul{right:110px;top:0;font-size:15px}" +
    /* Fenêtre Premium */
    ".fgp-o{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:16px;animation:fgpIn .25s ease}" +
    "@keyframes fgpIn{from{opacity:0}}" +
    ".fgp{position:relative;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#111;border-radius:22px;color:#F5F5F7;font-family:Inter,sans-serif}" +
    ".fgp .top{position:relative;padding:20px 24px 22px;min-height:240px;box-sizing:border-box;background:#BC002D;color:#fff;overflow:hidden}" +
    ".fgp .top img{position:absolute;right:6px;bottom:0;height:228px;width:auto;pointer-events:none}" +
    ".fgp .bul{right:165px;top:48px;font-size:16px;background:#000;color:#F2B33D}" +
    ".fgp small{font:700 11.5px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.85}" +
    ".fgp h2{position:relative;z-index:1;margin:74px 0 0;font:700 40px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;max-width:290px;color:#fff}" +
    ".fgp .bd{padding:18px 24px 22px}.fgp .bd p{margin:0 0 10px;font:500 14px/1.5 Inter,sans-serif;color:#D8D8DC}.fgp .bd b{color:#fff}" +
    ".fgp .cd{display:flex;gap:8px;margin:6px 0 16px}.fgp .cd span{flex:1;background:#1C1C1E;border-radius:12px;padding:9px 0 7px;text-align:center}.fgp .cd b{display:block;font:700 30px/1 Antonio,sans-serif}.fgp .cd i{font:600 10px Inter,sans-serif;font-style:normal;letter-spacing:.06em;text-transform:uppercase;color:#8E8E93}" +
    ".fgp .bt{display:flex;gap:10px}.fgp .bt a,.fgp .bt button{flex:1;height:44px;border:0;border-radius:22px;display:grid;place-items:center;font:700 14.5px Inter,sans-serif;text-decoration:none;cursor:pointer}" +
    ".fgp .bt a{background:#F2B33D;color:#000}.fgp .bt button{background:#2C2C2E;color:#fff}" +
    ".fgp .x{position:absolute;top:12px;right:12px;z-index:3;width:34px;height:34px;border:0;border-radius:17px;background:rgba(0,0,0,.35);color:#fff;font:700 18px Inter;cursor:pointer}" +
    "@media (max-width:520px){.fgp h2{font-size:32px;max-width:200px;margin-top:70px}.fgp .top img{height:190px;right:-10px}.fgp .bul{right:auto;left:24px;top:44px;font-size:14px}}";
  document.head.appendChild(css);
  if (!document.querySelector('link[href*="family=Bangers"]')) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Bangers&display=swap"; document.head.appendChild(l); }

  var MEMBRE = null, WD = null, MO = null; // null = on ne sait pas encore
  var img = function (k, st) { return '<img class="ch no-sk" src="/img/don/' + k + '.webp" alt="" loading="lazy" style="' + st + '">'; };
  var bouton = function (lab, google, cls) { return '<button type="button" class="go' + (cls ? " " + cls : "") + '" onclick="window.FG_LOGIN && FG_LOGIN()">' + (google ? G : "") + lab + "</button>"; };
  var pr = function () { return OFFERT ? '<span class="pr">' + ic("p") + "Premium offert jusqu’au 30 novembre</span>" : ""; };
  var B = {
    bandeau: function () {
      return '<div class="fgm bn"><span class="bul" style="left:24px;top:12px">On t’attend à la sortie.</span>' + img("duo", "left:14px;bottom:0;height:230px") +
        '<span class="tag">Message du gang</span><p class="msg">Tes potes sont déjà dedans.<br><em>Et toi, tu fais quoi ?</em></p><div class="chips">' + chips() + "</div>" +
        '<div style="display:flex;align-items:center;gap:14px;margin-top:16px;flex-wrap:wrap">' + bouton("Rejoindre le gang", true) + pr() + "</div></div>";
    },
    // Accueil téléphone : Haruyama ou Murota « Psst » tirés au hasard (« Toi, là » retiré sur téléphone, Will 18/10/2026) (Will, 18/10/2026).
    // Les personnages restent entiers, au-dessus des pastilles.
    mobile: function () {
      var V = [
        { ch: "haru", h: 184, tag: "Message du gang", l1: "Toi.", l2: "Rejoins le gang.", sub: "Fais pas genre t’as rien vu.<br>Inscris-toi, c’est gratuit.", g: 1 },
        { ch: "murota", h: 168, tag: "Psst", l1: "J’ai gardé", l2: "des nouilles pour toi.", sub: "Un compte gratuit,<br>et t’es des nôtres." }
      ];
      var f = /[?&]v=(\d)/.exec(location.search);
      if (MO == null) MO = f ? +f[1] % V.length : Math.floor(Math.random() * V.length);
      var v = V[MO];
      return '<div class="fgm mo"><div class="mh" style="min-height:' + (v.h + (v.bul ? 30 : 0)) + 'px">' + (v.bul ? '<span class="bul" style="right:96px;top:0;font-size:15px">' + v.bul + "</span>" : "") +
        img(v.ch, "right:0;bottom:0;height:" + v.h + "px") + '<div class="tx"' + (v.bul ? ' style="padding-top:40px"' : "") + '><span class="tag">' + v.tag + '</span><p class="msg">' + v.l1 + "<br><em>" + v.l2 + '</em></p><p class="sub">' + v.sub + "</p></div></div>" +
        '<div class="grid">' + chips() + "</div>" + bouton(v.g ? "Rejoindre le gang" : "Rejoindre", true, "w") + "</div>";
    },
    // Trois versions Murota tirées au hasard à chaque chargement (Will, 18/10/2026).
    widget: function (force) {
      var V = [
        { tag: "Message pour toi", l1: "Y a encore", l2: "une place à table.", sub: "C’est gratuit.<br>Installe-toi." },
        { tag: "Psst", l1: "J’ai gardé", l2: "des nouilles pour toi.", sub: "Un compte gratuit,<br>et t’es des nôtres." },
        { tag: "Toi, là", l1: "Viens manger", l2: "avec le gang.", sub: "C’est gratuit et y a du rab.<br>C’est moi qui régale.", bul: "Slurp. Assieds-toi." }
      ];
      if (WD == null) WD = Math.floor(Math.random() * V.length);
      var v = V[force != null ? force : WD];
      return '<div class="fgm wd"><div class="hd">' + (v.bul ? '<span class="bul">' + v.bul + "</span>" : "") + img("murota", "right:-4px;bottom:0;height:220px") +
        '<div class="tx"' + (v.bul ? "" : ' style="padding-top:0"') + '><span class="tag">' + v.tag + '</span><p class="msg">' + v.l1 + "<br><em>" + v.l2 + '</em></p><p class="sub">' + v.sub + "</p></div></div>" +
        '<div class="grid">' + chips(1) + "</div>" + bouton("Rejoindre", true, "w") + "</div>";
    },
    // Ma collection, visiteur non connecté : Murota « Toi, là » dans la colonne de gauche (Will, 18/10/2026).
    // Ma collection, visiteur non connecté : Busō dans le rond jaune, version 1 validée le 18/10/2026 (remplace Murota).
    collection: function () {
      var P = [['<path d="M4 5v14M9 5v14M14 5l5 14"/>', "Possédés"], ['<path d="M5 12l4 4 10-10"/>', "Lu"], ['<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11z"/>', "Envie"], ['<path d="M4 7h16l-2 12H6zM9 7V5h6v2"/>', "Panier"]];
      return '<div class="fgm fgm-c fgm-b"><div class="ci"><img src="/img/don/buso.webp" alt="" class="no-sk"></div>' +
        '<span class="tag">Rejoins le gang</span><p class="msg">Ta collection,<br><em>c’est gratuit.</em></p><p class="sub">Range tes tomes, coche ce que t’as lu, note ce qui te manque.</p>' +
        '<div class="grid">' + P.map(function (b) { return '<span><svg viewBox="0 0 24 24" fill="none" stroke="#F2B33D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + b[0] + "</svg>" + b[1] + "</span>"; }).join("") + "</div>" +
        bouton("Rejoindre", true, "w y") + "</div>";
    }
  };
  window.FG_GANG = function (k) { if (MEMBRE || !B[k]) return ""; return '<div class="fgm-w" data-fgm>' + B[k]() + "</div>"; };

  /* Fenêtre Premium */
  var cd = function () {
    var s = Math.max(0, Math.floor((FIN - Date.now()) / 1000)), j = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return "<span><b>" + j + "</b><i>jour" + (j > 1 ? "s" : "") + "</i></span><span><b>" + h + "</b><i>heure" + (h > 1 ? "s" : "") + "</i></span><span><b>" + m + "</b><i>min</i></span>";
  };
  window.FG_GANG.premium = function (force) {
    if (!OFFERT || document.querySelector(".fgp-o")) return;
    if (matchMedia("(max-width:860px)").matches || location.pathname === "/") { if (force) location.href = "/premium/"; return; }
    var K = "fg_pp7";
    try { if (!force && localStorage.getItem(K)) return; localStorage.setItem(K, String(Date.now())); } catch (e) {}
    var o = document.createElement("div"); o.className = "fgp-o"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "FuryoGang Premium");
    o.innerHTML = '<div class="fgp"><div class="top"><button type="button" class="x" aria-label="Fermer">×</button><span class="bul">On t’attend le 1er décembre.</span><img src="/img/don/duo.webp" alt=""><small>FuryoGang Premium</small><h2>Jusqu’au 30 novembre, c’est open bar</h2></div>' +
      '<div class="bd"><p>Pour le lancement, <b>tout le monde est Premium</b> : Lu, Envie, Panier, statistiques, classements, tirage au sort du mois.</p>' +
      "<p>Abonnements ouverts le <b>15 novembre</b>, avec <b>2 mois offerts</b> jusqu’au 30. À partir du <b>1er décembre</b>, c’est <b>2 € par mois</b>. Tes tomes possédés restent gratuits.</p>" +
      '<div class="cd">' + cd() + '</div><div class="bt"><a href="/premium/">Voir Premium</a><button type="button" data-fgp-x>Plus tard</button></div></div></div>';
    document.body.appendChild(o);
    var t = setInterval(function () { var c = o.querySelector(".cd"); if (c) c.innerHTML = cd(); }, 30000);
    var close = function () { clearInterval(t); o.remove(); document.removeEventListener("keydown", esc); };
    var esc = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest(".x,[data-fgp-x]")) close(); });
  };

  /* Encart Ma collection (colonne de gauche, ordinateur), version 2 validée le 18/10/2026 : un clic ouvre la fenêtre Premium. */
  var ARR = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var c2 = document.createElement("style");
  c2.textContent = ".fge{position:relative;display:block;width:100%;box-sizing:border-box;min-height:164px;padding:14px;border:0;border-radius:14px;background:#BC002D;color:#fff;text-align:left;cursor:pointer;overflow:hidden;font-family:Inter,sans-serif}" +
    ".fge:hover{filter:brightness(1.06)}.fge .bu{position:absolute;right:10px;top:10px;background:#000;color:#F2B33D;font:400 12px/1 Bangers,cursive;letter-spacing:.04em;padding:5px 8px;border-radius:10px;transform:rotate(-3deg);white-space:nowrap}" +
    ".fge img{position:absolute;right:10px;bottom:10px;height:112px;width:auto;pointer-events:none}" +
    ".fge b{display:block;position:relative;width:60%;padding-top:22px;font:700 20px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}" +
    ".fge .cta{position:absolute;left:14px;bottom:12px;display:inline-flex;align-items:center;gap:6px;background:#F2B33D;color:#000;padding:5px 10px;border-radius:999px;font:700 11.5px Inter,sans-serif}";
  document.head.appendChild(c2);
  // À partir du 1er décembre (plus d'open bar) : Murota « Passe à table Premium » pour les membres non Premium (Will, 18/10/2026).
  var LU = '<path d="M5 12l4 4 10-10"/>', EN = '<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11z"/>', PA = '<path d="M4 7h16l-2 12H6zM9 7V5h6v2"/>', ST = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
  var icP = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#F2B33D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  window.FG_GANG.encart = function (vip) {
    if (!OFFERT) {
      if (vip) return "";
      return '<div class="fgm fgm-c"><div class="top"><span class="bul">2 €, le prix d’un bol.</span>' + img("murota", "position:relative;display:block;margin:0 auto;height:150px") + "</div>" +
        '<span class="tag" style="position:static;margin:0">Réservé Premium</span><p class="msg">Passe à table<br><em>Premium.</em></p>' +
        '<div class="grid">' + [[LU, "Lu"], [EN, "Envie"], [PA, "Panier"], [ST, "Stats"]].map(function (b) { return "<span>" + icP(b[0]) + b[1] + "</span>"; }).join("") + "</div>" +
        '<a class="go w" href="/premium/" style="background:#F2B33D;color:#000;text-decoration:none">Devenir Premium</a></div>';
    }
    if (Date.now() < Date.parse("2026-11-15T00:00:00+01:00") || /[?&]apercu=pap/.test(location.search))
      return '<button type="button" class="fge d2 no-sk" data-fgx-open aria-label="Premium avant tout le monde : soutiens le gang"><span class="bu">On t’attend le 1er déc.</span><img src="/img/don/duo.webp" alt=""><b>Premium avant <span>tout le monde</span></b><p>Un don, et t’es Premium dès le 1er décembre.</p><span class="cta">Je soutiens le gang ' + ARR + "</span></button>";
    return '<button type="button" class="fge no-sk" data-fgp-open aria-label="Premium offert jusqu’au 30 novembre : ce que ça change"><span class="bu">On t’attend le 1er déc.</span><img src="/img/don/duo.webp" alt=""><b>Jusqu’au 30 novembre, c’est open bar</b><span class="cta">Ce que ça change ' + ARR + "</span></button>";
  };
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-fgp-open]")) window.FG_GANG.premium(true); });

  /* « Premium avant Premium » (maquettes v2-v4 validées par Will le 18/10/2026), jusqu'au 14 novembre inclus.
     Membres connectés seulement. Accueil ordinateur : widget Jinnai (→ page Premium). Accueil téléphone : Busō en grand
     la première fois (→ page Premium), puis la petite barre B (→ fenêtre d'explications). Ma collection : D2 sur ordinateur,
     barre collante T3 sur téléphone (→ fenêtre d'explications). La fenêtre mène à la page Premium, bloc dons. */
  var PAP = Date.now() < Date.parse("2026-11-15T00:00:00+01:00") || /[?&]apercu=pap/.test(location.search), PAPVU = false, DONS = "/premium/";
  try { PAPVU = !!localStorage.getItem("fg_pap_vu") && !/[?&]apercu=pap1/.test(location.search); } catch (e) {}
  var c3 = document.createElement("style");
  c3.textContent =
    ".fci{display:inline-block;flex:none;border-radius:50%;background:#F2B33D;position:relative;overflow:hidden}.fci img{position:absolute;left:50%;top:50%;height:84%;width:auto;transform:translate(-50%,-50%);pointer-events:none}" +
    ".fgm .tag.y,.fgx .tag.y{background:#F2B33D;color:#000}" +
    ".fgm .ti3,.fgx .ti3{display:flex;gap:6px;margin-top:12px}.fgm .ti3 span{flex:1;text-align:center;background:#1C1C1E;border-radius:10px;padding:8px 4px;font:600 11px Inter,sans-serif;color:#BDBDC2}.fgm .ti3 b{display:block;font:700 20px/1.1 Antonio,sans-serif;color:#fff}" +
    ".fgm .cy,.fgx .cy{display:flex;align-items:center;justify-content:center;gap:8px;height:46px;border-radius:23px;background:#F2B33D;color:#000;font:800 15px Inter,sans-serif;text-decoration:none;margin-top:12px;border:0;width:100%;cursor:pointer}.fgm .cy:hover,.fgx .cy:hover{filter:brightness(1.06)}" +
    ".fgm .ppl,.fgx .fx-b>p.ppl{margin:8px 0 0;text-align:center!important;font:600 11.5px Inter,sans-serif;color:#9A9AA0}.ppw{font-style:italic;font-weight:900;color:#fff}.ppw span{color:#009CDE}" +
    ".fgm .ch2,.fgx .ch2{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.fgm .ch2 span,.fgx .ch2 span{display:inline-flex;align-items:center;gap:5px;background:#1C1C1E;border-radius:999px;padding:6px 10px;font:600 12px Inter,sans-serif;color:#E4E4E8}.fgm .ch2 svg,.fgx .ch2 svg{width:14px;height:14px}.fgm .ch2 .pl,.fgx .ch2 .pl{background:rgba(188,0,45,.22);color:#fff}" +
    ".fgm.pw .hd{min-height:210px}.fgm.pw .tx{padding-top:96px}.fgm.pw .bul{background:#BC002D;color:#fff}" +
    ".fgm.pb{padding:20px}.fgm.pb .rw{display:flex;gap:10px;align-items:flex-end}.fgm.pb .msg{font-size:28px}" +
    ".fgs{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:10px 12px;border-radius:16px;background:linear-gradient(90deg,#2a1c05,#000 75%);border:1px solid #3a2a0a;color:#F5F5F7;text-align:left;cursor:pointer;font-family:Inter,sans-serif}" +
    ".fgs b{flex:1;font:700 16px/1.05 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}.fgs b em{font-style:normal;color:#F2B33D}" +
    ".fgs .cta{flex:none;background:#F2B33D;color:#000;padding:8px 12px;border-radius:999px;font:700 12.5px Inter,sans-serif;white-space:nowrap}" +
    ".fgpap-st{position:relative;z-index:1;margin:-22px -16px 20px;padding:0}.fgpap-st .fgs{border-radius:0;border-width:0 0 1px}@media (min-width:980px){.fgpap-st{display:none}}" +
    ".fge.d2 b{width:58%;padding-top:24px}.fge.d2 b span{color:#F2B33D}.fge.d2 p{position:relative;width:58%;margin:8px 0 0;font:600 12px/1.35 Inter,sans-serif;color:#fff}.fge.d2 img{height:120px}.fge.d2{min-height:190px}" +
    /* Fenêtre d'explications */
    ".fgx,.fgx *{text-align:left;text-transform:none;letter-spacing:normal;box-sizing:border-box}.fgx h2,.fgx h2 *,.fgx small{text-transform:uppercase}.fgx small,.fgx h3{letter-spacing:.12em}.fgx h3{text-transform:uppercase}" +
    ".fgx-o{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:16px;animation:fgpIn .25s ease}" +
    ".fgx{position:relative;width:min(600px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#0B0B0C;border:1px solid #2A2A2D;border-radius:24px;color:#F5F5F7;font-family:Inter,sans-serif;text-align:left}" +
    ".fgx .fx-t{position:relative;background:#BC002D;padding:20px 28px 18px;min-height:150px;box-sizing:border-box;overflow:hidden}" +
    ".fgx .fx-t .fci{position:absolute;right:34px;bottom:14px;width:140px;height:140px}" +
    ".fgx .fx-t .bul{position:absolute;z-index:2;right:150px;top:16px;background:#000;color:#F2B33D;font:400 16px/1.05 Bangers,cursive;letter-spacing:.04em;padding:7px 11px;border-radius:14px;transform:rotate(-3deg);white-space:nowrap}" +
    ".fgx small{font:700 11px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.85}" +
    ".fgx h2{position:relative;margin:30px 0 0;font:700 32px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;max-width:62%;color:#fff}.fgx h2 span{color:#F2B33D}" +
    ".fgx .x{position:absolute;right:14px;top:12px;z-index:3;width:32px;height:32px;border:0;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;font:400 20px Inter;cursor:pointer}" +
    ".fgx .fx-b{padding:0 28px 20px}.fgx h3{margin:22px 0 6px;font:700 12px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8E8E93}" +
    ".fgx .fx-b>p{margin:0;font:500 14px/1.5 Inter,sans-serif;color:#D8D8DC}.fgx b{color:#fff}" +
    ".fgx .fx-s{display:flex;gap:12px;margin-top:12px}.fgx .fx-s i{flex:none;width:26px;height:26px;border-radius:50%;background:#BC002D;color:#fff;font:700 15px Antonio,sans-serif;font-style:normal;display:flex;align-items:center;justify-content:center}.fgx .fx-s p{margin:0;font:500 13.5px/1.45 Inter,sans-serif;color:#D8D8DC}" +
    ".fgx .fx-tb{background:#141416;border-radius:14px;margin-top:8px;overflow:hidden}.fgx .fx-tr{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #222;font:500 13.5px Inter,sans-serif;color:#D8D8DC}.fgx .fx-tr:last-child{border:0}.fgx .fx-tr b{font:700 19px Antonio,sans-serif;white-space:nowrap}.fgx .fx-tr em{font-style:normal;font-weight:700;color:#F2B33D}" +
    ".fgx .fx-b>p.fx-nt{margin:8px 0 0;font:500 12.5px Inter,sans-serif;color:#9A9AA0}.fgx .fx-l{display:block;margin:10px auto 0;text-align:center!important;background:none;border:0;font:600 13px Inter,sans-serif;color:#8E8E93;cursor:pointer}" +
    "@media (max-width:600px){.fgx-o{place-items:end center;padding:0}.fgx{width:100%;max-height:92vh;border-radius:24px 24px 0 0;border-width:1px 0 0}.fgx .fx-t{padding:18px 18px 16px;min-height:128px}.fgx .fx-t .fci{right:22px;width:110px;height:110px}.fgx .fx-t .bul{right:60px;top:14px;font-size:15px}.fgx small{visibility:hidden}.fgx h2{font-size:28px;margin-top:22px}.fgx .fx-b{padding:0 18px 22px}}";
  document.head.appendChild(c3);
  var busoRond = function (d) { return '<span class="fci" style="width:' + d + "px;height:" + d + 'px"><img src="/img/don/buso.webp" alt="" class="no-sk"></span>'; };
  var PPW = '<i class="ppw">Pay<span>Pal</span></i>';
  var TI3 = '<div class="ti3"><span><b>25 €</b>1 an</span><span><b>50 €</b>2 ans</span><span><b>100 €</b>4 ans</span></div>';
  // 11 avantages réservés au Premium sur la page /premium/ : Lu et Panier sont montrés, il en reste 9.
  var CH2 = '<div class="ch2"><span>' + icP(LU) + "Lu</span><span>" + icP(PA) + 'Panier</span><span class="pl">+ 9 autres avantages Premium</span></div>';
  var CYA = function (lab) { return '<a class="cy" href="' + DONS + '">' + lab + " " + ARR + "</a>"; };
  var PB = {
    widget: function () {
      return '<div class="fgm wd pw"><div class="hd"><span class="bul">On rackette pas. On propose.</span>' + img("jinnai", "right:-6px;bottom:0;height:210px") +
        '<div class="tx"><span class="tag y">Premium avant Premium</span><p class="msg">Un don,<br><em>et t’es Premium.</em></p></div></div>' +
        '<p class="sub">Un seul don PayPal, sans abonnement. Ton Premium démarre le 1er décembre : d’ici là, c’est offert à tout le monde.</p>' + CH2 + TI3 + CYA("Je soutiens le gang") +
        '<p class="ppl">Don via ' + PPW + " · montant libre</p></div>";
    },
    mobile: function () {
      if (PAPVU) return '<div style="padding:0 16px;margin:24px 0">' + petite() + "</div>";
      try { localStorage.setItem("fg_pap_vu", String(Date.now())); } catch (e) {}
      return '<div style="padding:0 16px;margin:24px 0"><div class="fgm pb"><div class="rw"><div style="flex:1"><span class="tag y">Premium avant Premium</span><p class="msg">Soutiens le gang.<br><em>Sois Premium avant tout le monde.</em></p></div>' + busoRond(116) + "</div>" +
        '<p class="sub">Un don, et ton Premium démarre le 1er décembre. Pas d’abonnement, pas de surprise.</p>' + TI3 + CYA("Je soutiens le gang") +
        '<p class="ppl">Don via ' + PPW + " · Premium dès le 1er décembre</p></div></div>";
    }
  };
  var petite = function () { return '<button type="button" class="fgs no-sk" data-fgx-open>' + busoRond(42) + "<b>Premium<br><em>avant tout le monde</em></b><span class=\"cta\">Devenir Premium</span></button>"; };
  var remplir = function () {
    if (!MEMBRE || !PAP) return;
    document.querySelectorAll("[data-fgpap]").forEach(function (e) { if (!e.firstChild && PB[e.dataset.fgpap]) e.innerHTML = PB[e.dataset.fgpap](); });
    if (window.FG_GANG_PREMIUM && !document.querySelector(".fgpap-st")) {
      var pg = document.querySelector(".page"), sh = document.querySelector(".sh");
      if (pg) { var d = document.createElement("div"); d.className = "fgpap-st"; /* plus collant (Will, 21/10/2026) : en haut de la page, part au défilement */ d.innerHTML = petite(); pg.insertBefore(d, pg.firstChild); }
    }
  };
  // Plus de fenêtre sur téléphone ni sur l'accueil (Will, 27/10/2026) : on va directement à la page Premium, qui dit déjà tout.
  var sansFenetre = function () { return matchMedia("(max-width:860px)").matches || location.pathname === "/"; };
  window.FG_GANG.pap = function () {
    if (sansFenetre()) { location.href = DONS; return; }
    if (document.querySelector(".fgx-o")) return;
    var o = document.createElement("div"); o.className = "fgx-o"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Premium avant Premium");
    var tr = function (a, b) { return '<div class="fx-tr"><b>' + a + "</b><span>" + b + "</span></div>"; };
    o.innerHTML = '<div class="fgx"><div class="fx-t"><button type="button" class="x" aria-label="Fermer">×</button>' + busoRond(140) + '<span class="bul">On vole personne, promis.</span>' +
      "<small>Premium avant Premium</small><h2>Soutiens le gang,<br><span>sois Premium avant tout le monde.</span></h2></div><div class=\"fx-b\">" +
      "<h3>C’est quoi ?</h3><p>FuryoGang, c’est un passionné, pas une boîte. Pour lancer le site, <b>tout le monde est Premium gratuitement jusqu’au 30 novembre</b>. Après, ce sera 2 € par mois. Si tu veux nous aider dès maintenant, tu peux faire un don : en échange, <b>on te garde le Premium</b>.</p>" +
      "<h3>Comment ça marche</h3>" +
      '<div class="fx-s"><i>1</i><p><b>Tu fais un don sur PayPal</b> (carte bancaire, Apple Pay ou compte PayPal), du montant que tu veux. Un seul paiement, pas d’abonnement, rien ne sera prélevé ensuite.</p></div>' +
      '<div class="fx-s"><i>2</i><p><b>Tu écris ton pseudo FuryoGang sur PayPal</b> (un champ est prévu), pour qu’on te retrouve.</p></div>' +
      '<div class="fx-s"><i>3</i><p><b>Ton Premium démarre le 1er décembre</b>, à la fin de la période offerte. Tu ne perds pas un jour. Ton badge apparaît sur ton profil.</p></div>' +
      '<h3>Ce que ton don te donne</h3><div class="fx-tb">' + tr("Moins de 25 €", "Un grand merci + badge Donateur") + tr("25 €", "<em>1 an</em> de Premium") + tr("50 €", "<em>2 ans</em> de Premium") + tr("100 €", "<em>4 ans</em> de Premium") + "</div>" +
      '<p class="fx-nt">Et 1 an de plus par tranche de 25 € au-dessus.</p><h3>Ce que tu débloques</h3>' + CH2 +
      '<a class="cy" style="margin-top:18px" href="' + DONS + '">Je soutiens le gang ' + ARR + '</a><p class="ppl">Tu arrives sur la page Premium, puis le don se fait sur ' + PPW + '.</p><button type="button" class="fx-l" data-fgx-x>Plus tard</button></div></div>';
    document.body.appendChild(o);
    var close = function () { o.remove(); document.removeEventListener("keydown", esc); };
    var esc = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest(".x,[data-fgx-x]")) close(); });
  };
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-fgx-open]")) window.FG_GANG.pap(); });

  /* Membre ou pas ? On retire les blocs « Rejoindre » pour les membres. */
  var clean = function () { if (MEMBRE) { document.querySelectorAll("[data-fgm]").forEach(function (e) { e.remove(); }); remplir(); } };
  if (/^https?:$/.test(location.protocol)) fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    MEMBRE = !!(j && j.user) && !/[?&]apercu=gang/.test(location.search); clean();
    if (MEMBRE) new MutationObserver(clean).observe(document.body, { childList: true, subtree: true });
    if (j && j.user && window.FG_GANG_PREMIUM) window.FG_GANG.premium(/[?&]apercu=premium/.test(location.search));
  }).catch(function () { MEMBRE = false; });
  window.FG_GANG.membre = function () { return MEMBRE; };
})();
