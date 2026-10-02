/* En-tête commun à tout le site (style Le Monde) : logo centré + menu Actualité / Séries / Calendrier, collé en haut de l'écran.
   À inclure juste après <body> : <script src="/site/header.js"></script> (le CSS est injecté ici aussi).
   La hauteur de l'en-tête est exposée en --sh-h pour que les barres collantes de chaque page se placent dessous. */
(function () {
  var css = "" +
    ".sh{position:sticky;top:0;z-index:40;background:#141416;border-bottom:1px solid #2C2C2F;margin:0 0 0;padding-top:env(safe-area-inset-top,0px)}" +
    ".sh-top{position:relative;display:flex;justify-content:center;align-items:center;height:64px;max-width:1080px;margin:0 auto;padding:0 16px}" +
    ".sh-logo{display:block;line-height:0}" +
    ".sh-logo img{height:42px;width:auto;display:block}" +
    ".sh-search{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:44px;height:44px;display:grid;place-items:center;color:#F5F5F7;text-decoration:none}" +
    ".sh-nav{display:flex;justify-content:center;gap:4px;max-width:1080px;margin:0 auto;border-top:1px solid #2C2C2F;padding:0 8px}" +
    ".sh-nav a{position:relative;padding:0 16px;height:44px;display:flex;align-items:center;text-decoration:none;color:#CFCFD4;font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:15px;letter-spacing:-.005em}" +
    ".sh-nav a:hover{color:#F5F5F7}" +
    ".sh-nav a[aria-current=page]{color:#F5F5F7}" +
    ".sh-nav a[aria-current=page]::after{content:'';position:absolute;left:16px;right:16px;bottom:-1px;height:3px;border-radius:3px;background:#4C9BFF}" +
    "@media (max-width:719px){.sh-top{height:54px}.sh-logo img{height:34px}.sh-nav{justify-content:space-around;gap:0}.sh-nav a{padding:0 10px;font-size:14px;height:42px}.sh-nav a[aria-current=page]::after{left:10px;right:10px}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var p = location.pathname;
  var cur = /^\/series/.test(p) ? "series" : /^\/calendrier/.test(p) ? "cal" : (p === "/" || p === "/index.html") ? "actu" : "";
  var a = function (k, href, label) { return '<a href="' + href + '"' + (cur === k ? ' aria-current="page"' : "") + ">" + label + "</a>"; };
  var html = '<header class="sh" id="sh">' +
    '<div class="sh-top"><a class="sh-logo" href="/" aria-label="FuryoGang, accueil"><img src="/img/logo-furyogang.png" alt="FuryoGang" width="900" height="218"></a>' +
    '<a class="sh-search" href="/series/" aria-label="Chercher une série"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></a></div>' +
    '<nav class="sh-nav" aria-label="Rubriques">' + a("actu", "/", "Actualité") + a("series", "/series/", "Séries") + a("cal", "/calendrier/", "Calendrier") + "</nav></header>";
  var me = document.currentScript;
  me.insertAdjacentHTML("beforebegin", html);
  var set = function () { var h = document.getElementById("sh"); if (h) document.documentElement.style.setProperty("--sh-h", h.offsetHeight + "px"); };
  set(); addEventListener("resize", set); addEventListener("load", set);
})();
