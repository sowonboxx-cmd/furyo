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
    // Accueil téléphone : Haruyama, Murota « Psst » ou Murota « Toi, là » tirés au hasard (Will, 18/10/2026).
    // Les personnages restent entiers, au-dessus des pastilles.
    mobile: function () {
      var V = [
        { ch: "haru", h: 184, tag: "Message du gang", l1: "Toi.", l2: "Rejoins le gang.", sub: "Fais pas genre t’as rien vu.<br>Inscris-toi, c’est gratuit.", g: 1 },
        { ch: "murota", h: 168, tag: "Psst", l1: "J’ai gardé", l2: "des nouilles pour toi.", sub: "Un compte gratuit,<br>et t’es des nôtres." },
        { ch: "murota", h: 168, tag: "Toi, là", l1: "Viens manger", l2: "avec le gang.", sub: "C’est gratuit et y a du rab.<br>C’est moi qui régale.", bul: "Slurp. Assieds-toi." }
      ];
      var f = /[?&]v=(\d)/.exec(location.search);
      if (MO == null) MO = f ? +f[1] % V.length : Math.floor(Math.random() * V.length);
      var v = V[MO];
      return '<div class="fgm mo"><div class="mh" style="min-height:' + (v.h + (v.bul ? 30 : 0)) + 'px">' + (v.bul ? '<span class="bul" style="right:96px;top:0;font-size:15px">' + v.bul + "</span>" : "") +
        img(v.ch, "right:0;bottom:0;height:" + v.h + "px") + '<div class="tx"' + (v.bul ? ' style="padding-top:40px"' : "") + '><span class="tag">' + v.tag + '</span><p class="msg">' + v.l1 + "<br><em>" + v.l2 + '</em></p><p class="sub">' + v.sub + "</p></div></div>" +
        '<div class="grid">' + chips() + "</div>" + bouton(v.g ? "Rejoindre le gang" : "Rejoindre", !!v.g, "w") + "</div>";
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
        '<div class="grid">' + chips(1) + "</div>" + bouton("Rejoindre", false, "w") + "</div>";
    },
    // Ma collection, visiteur non connecté : Murota « Toi, là » dans la colonne de gauche (Will, 18/10/2026).
    collection: function () {
      return '<div class="fgm fgm-c"><div class="top"><span class="bul">Slurp. Assieds-toi.</span>' + img("murota", "position:relative;display:block;margin:0 auto;height:150px") + "</div>" +
        '<span class="tag" style="position:static;margin:0">Toi, là</span><p class="msg">Viens manger<br><em>avec le gang.</em></p><p class="sub">C’est gratuit et y a du rab.<br>C’est moi qui régale.</p>' +
        '<div class="grid">' + chips(1) + "</div>" + bouton("Rejoindre", false, "w") + "</div>";
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
  window.FG_GANG.encart = function () {
    if (!OFFERT) return "";
    return '<button type="button" class="fge no-sk" data-fgp-open aria-label="Premium offert jusqu’au 30 novembre : ce que ça change"><span class="bu">On t’attend le 1er déc.</span><img src="/img/don/duo.webp" alt=""><b>Jusqu’au 30 novembre, c’est open bar</b><span class="cta">Ce que ça change ' + ARR + "</span></button>";
  };
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-fgp-open]")) window.FG_GANG.premium(true); });

  /* Membre ou pas ? On retire les blocs « Rejoindre » pour les membres. */
  var clean = function () { if (MEMBRE) document.querySelectorAll("[data-fgm]").forEach(function (e) { e.remove(); }); };
  if (/^https?:$/.test(location.protocol)) fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    MEMBRE = !!(j && j.user) && !/[?&]apercu=gang/.test(location.search); clean();
    if (MEMBRE) new MutationObserver(clean).observe(document.body, { childList: true, subtree: true });
    if (j && j.user && window.FG_GANG_PREMIUM) window.FG_GANG.premium(/[?&]apercu=premium/.test(location.search));
  }).catch(function () { MEMBRE = false; });
  window.FG_GANG.membre = function () { return MEMBRE; };
})();
