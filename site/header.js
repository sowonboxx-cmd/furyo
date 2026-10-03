/* En-tête commun à tout le site (style Le Monde) : avatar à gauche, logo centré, recherche à droite, menu Actualités / Séries / Calendrier.
   À inclure juste après <body> : <script src="/site/header.js"></script> (le CSS est injecté ici aussi).
   La hauteur de l'en-tête est exposée en --sh-h pour que les barres collantes de chaque page se placent dessous.
   La loupe ouvre une recherche instantanée sur tout le site (séries, mangakas, sorties, actualités, pages). */
(function () {
  var css = "" +
    ".sh{position:sticky;top:0;z-index:40;background:#141416;border-bottom:1px solid #2C2C2F;margin:0 0 0;padding-top:env(safe-area-inset-top,0px)}" +
    ".sh-top{position:relative;display:flex;justify-content:center;align-items:center;height:64px;max-width:1080px;margin:0 auto;padding:0 16px}" +
    ".sh-logo{display:block;line-height:0}" +
    ".sh-logo img{height:42px;width:auto;display:block}" +
    ".sh-btn{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;display:grid;place-items:center;color:#F5F5F7;text-decoration:none;border:0;background:transparent;cursor:pointer;padding:0}" +
    ".sh-search{right:8px}.sh-me{left:8px}" +
    ".sh-bo{position:absolute;top:50%;left:56px;transform:translateY(-50%);height:28px;padding:0 11px;border-radius:14px;background:#4C9BFF;color:#fff;font:600 12.5px Inter,system-ui,sans-serif;text-decoration:none;display:flex;align-items:center}" +
    ".sh-me span{width:30px;height:30px;border-radius:50%;background:#38383B;display:grid;place-items:center;color:#CFCFD4}" +
    ".sh-nav{display:flex;justify-content:center;gap:4px;max-width:1080px;margin:0 auto;border-top:1px solid #2C2C2F;padding:0 8px}" +
    ".sh-nav a{position:relative;padding:0 16px;height:44px;display:flex;align-items:center;text-decoration:none;color:#CFCFD4;font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:15px;letter-spacing:-.005em}" +
    ".sh-nav a:hover{color:#F5F5F7}" +
    ".sh-nav a[aria-current=page]{color:#F5F5F7}" +
    ".sh-nav a[aria-current=page]::after{content:'';position:absolute;left:16px;right:16px;bottom:-1px;height:3px;border-radius:3px;background:#4C9BFF}" +
    "@media (max-width:719px){.sh-top{height:54px}.sh-logo img{height:34px}.sh-nav{justify-content:space-around;gap:0}.sh-nav a{padding:0 10px;font-size:14px;height:42px}.sh-nav a[aria-current=page]::after{left:10px;right:10px}}" +
    /* Recherche */
    ".fs{position:fixed;inset:0;z-index:80;background:rgba(8,8,10,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:flex-start;padding:calc(env(safe-area-inset-top,0px) + 10vh) 16px 16px;font-family:Inter,'Noto Sans JP',system-ui,sans-serif}" +
    ".fs[hidden]{display:none}" +
    ".fs-box{width:100%;max-width:640px;max-height:76vh;display:flex;flex-direction:column;background:#1B1B1D;border:1px solid #2C2C2F;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}" +
    ".fs-in{display:flex;align-items:center;gap:10px;padding:0 10px 0 16px;border-bottom:1px solid #2C2C2F;color:#98989D}" +
    ".fs-in input{flex:1;height:56px;border:0;background:transparent;color:#F5F5F7;font:inherit;font-size:17px!important;outline:none;min-width:0;-webkit-appearance:none;appearance:none}" +
    ".fs-in input::placeholder{color:#7A7A80}" +
    ".fs-in input::-webkit-search-cancel-button{display:none}" +
    ".fs-x{border:0;background:#2C2C2F;color:#CFCFD4;font:inherit;font-size:12px;font-weight:600;height:28px;padding:0 10px;border-radius:8px;cursor:pointer}" +
    ".fs-res{overflow-y:auto;overscroll-behavior:contain;padding:6px 0 10px}" +
    ".fs-g{padding:10px 16px 4px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7A7A80;display:flex;justify-content:space-between}" +
    ".fs-g a{color:#6FA8F5;text-decoration:none;letter-spacing:0;text-transform:none;font-size:12px}" +
    ".fs-r{display:flex;align-items:center;gap:12px;padding:8px 16px;text-decoration:none;color:#F5F5F7;min-height:52px}" +
    ".fs-r[aria-selected=true]{background:#2A2A2D}" +
    ".fs-r .ic{width:34px;height:48px;flex:none;border-radius:6px;background:#38383B;overflow:hidden;display:grid;place-items:center;color:#98989D;font-size:12px;font-weight:700}" +
    ".fs-r .ic.sq{height:34px;border-radius:9px}.fs-r .ic.rd{height:34px;border-radius:50%}" +
    ".fs-r .ic img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".fs-r .tx{min-width:0;flex:1}" +
    ".fs-r b{display:block;font-weight:600;font-size:15px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fs-r b mark{background:none;color:#6FA8F5}" +
    ".fs-r small{display:block;font-size:12.5px;color:#98989D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fs-e{padding:26px 16px;text-align:center;color:#98989D;font-size:14px}" +
    ".fs-h{display:flex;gap:14px;justify-content:flex-end;padding:8px 16px;border-top:1px solid #2C2C2F;font-size:11.5px;color:#7A7A80}" +
    ".fs-h kbd{font:inherit;background:#2C2C2F;border-radius:4px;padding:1px 5px;color:#CFCFD4}" +
    "@media (max-width:719px){.fs{padding:calc(env(safe-area-inset-top,0px) + 8px) 8px 8px;background:rgba(8,8,10,.86)}.fs-box{max-height:none;height:100%;border-radius:16px}.fs-h{display:none}}" +
    "body.fs-open{overflow:hidden}" +
    /* Compte (brouillon) */
    ".me{position:fixed;inset:0;z-index:80;background:rgba(8,8,10,.72);display:flex;align-items:flex-end;justify-content:center;font-family:Inter,system-ui,sans-serif}" +
    ".me[hidden]{display:none}" +
    ".me-box{width:100%;max-width:440px;background:#1B1B1D;border:1px solid #2C2C2F;border-radius:22px 22px 0 0;padding:22px 20px calc(env(safe-area-inset-bottom,0px) + 22px);color:#F5F5F7}" +
    "@media (min-width:720px){.me{align-items:center}.me-box{border-radius:22px}}" +
    ".me-box h3{margin:0 0 6px;font-size:20px}.me-box p{margin:0 0 14px;color:#CFCFD4;font-size:14.5px;line-height:1.5}" +
    ".me-box ul{margin:0 0 18px;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:14.5px}" +
    ".me-box li{display:flex;gap:10px;align-items:center}.me-box li i{width:30px;height:30px;border-radius:9px;background:#2C2C2F;display:grid;place-items:center;font-style:normal;flex:none}" +
    ".me-box button{width:100%;height:46px;border:0;border-radius:23px;font:inherit;font-weight:700;cursor:pointer}" +
    ".me-box .go{background:#2D74D2;color:#fff;opacity:.55;cursor:default}.me-box .no{margin-top:8px;background:transparent;color:#98989D}" +
    ".me-g{display:flex;justify-content:center;min-height:44px;margin-top:6px;color-scheme:light}.me-err{color:#F08A7E;font-size:13px;min-height:0;margin:6px 0 0}" +
    ".me-u{display:flex;align-items:center;gap:12px;margin:4px 0 14px}.me-u img{width:52px;height:52px;border-radius:50%}.me-u b{display:block;font-size:17px}.me-u small{color:#98989D}" +
    ".me-box a.go2{display:flex;align-items:center;justify-content:center;height:46px;border-radius:23px;background:#2D74D2;color:#fff;font-weight:700;text-decoration:none;margin-bottom:8px}" +
    ".me-box .out{background:#38383B;color:#F5F5F7}" +
    ".me-mb{display:block;text-align:center;margin-top:12px;color:#4C9BFF;font-weight:600;font-size:14px;text-decoration:none}" +
    ".sh-me img{width:30px;height:30px;border-radius:50%;display:block}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var p = location.pathname;
  var cur = /^\/series/.test(p) ? "series" : /^\/calendrier/.test(p) ? "cal" : (p === "/" || p === "/index.html") ? "actu" : "";
  var a = function (k, href, label) { return '<a href="' + href + '"' + (cur === k ? ' aria-current="page"' : "") + ">" + label + "</a>"; };
  var ICON_S = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  var html = '<header class="sh" id="sh">' +
    '<div class="sh-top"><button class="sh-btn sh-me" id="sh-me" aria-label="Mon compte"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c.8-4.3 4.2-7 8.5-7s7.7 2.7 8.5 7z"/></svg></span></button>' +
    '<a class="sh-logo" href="/" aria-label="FuryoGang, accueil"><img src="/img/logo-furyogang.png" alt="FuryoGang" width="900" height="218"></a>' +
    '<a class="sh-btn sh-search" id="sh-search" href="/series/" aria-label="Rechercher sur le site">' + ICON_S + '</a></div>' +
    '<nav class="sh-nav" aria-label="Rubriques">' + a("actu", "/", "Actualités") + a("series", "/series/", "Séries") + a("cal", "/calendrier/", "Calendrier") + "</nav></header>";
  var me = document.currentScript;
  me.insertAdjacentHTML("beforebegin", html);
  var set = function () { var h = document.getElementById("sh"); if (h) document.documentElement.style.setProperty("--sh-h", h.offsetHeight + "px"); };
  set(); addEventListener("resize", set); addEventListener("load", set);

  /* ---------- Recherche instantanée ---------- */
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9぀-ヿ㐀-鿿]+/g, " ").trim(); };
  var tn = function (n) { return (Number.isInteger(n) && n >= 0 && n < 10) ? "0" + n : String(n); };
  var MC = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var dc = function (s) { if (!s) return ""; var d = new Date(s + "T12:00:00"); return d.getDate() + " " + MC[d.getMonth()] + " " + d.getFullYear(); };
  var couv = function (u) { return "/api/couv?u=" + encodeURIComponent(u); };
  var shown = function (s) { return (s.t && s.fr && s.t === s.t.toUpperCase() && /[A-Z]/.test(s.t) && s.t.toLowerCase() === s.fr.toLowerCase()) ? s.t : (s.fr || s.t); };
  var PAGES = [
    { t: "Actualités", d: "Les dernières news furyō, yakuza et crime", u: "/", ic: "◉" },
    { t: "Séries", d: "Toutes les fiches séries", u: "/series/", ic: "▦" },
    { t: "Calendrier", d: "Les prochaines sorties", u: "/calendrier/", ic: "31" },
    { t: "Calendrier Japon", d: "Les sorties au Japon", u: "/calendrier/#japon", ic: "日", k: "japon jp" },
    { t: "Calendrier France", d: "Les sorties en France", u: "/calendrier/#france", ic: "FR", k: "france fr" },
    { t: "Mangakas", d: "Les auteurs et leurs séries", u: "/auteurs/", ic: "筆", k: "auteurs auteur dessinateur scenariste" },
    { t: "Avancement", d: "Les fiches en ligne et celles à venir", u: "/avancement/", ic: "%", k: "progression fiches" },
    { t: "CROWS × WORST", d: "La chronologie de l'univers", u: "/crows-x-worst/", ic: "鴉", k: "crows worst chronologie chrono" },
  ];
  var DATA = null, loading = null, sel = 0, flat = [];
  function load() {
    if (DATA || loading) return loading;
    var j = function (u) { return fetch(u).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }); };
    loading = Promise.all([j("/api/series"), j("/api/auteurs"), j("/api/calendrier"), j("/api/news")]).then(function (r) {
      var today = new Date().toISOString().slice(0, 10), from = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
      DATA = {
        series: (r[0].items || []).map(function (s) { return { t: shown(s), alt: [s.t, s.fr, s.jp].join(" "), d: [s.jp, s.type, s.y1].filter(Boolean).join(" · "), u: "/series/" + s.slug, img: s.cover }; }),
        auteurs: (r[1].authors || []).map(function (a) { return { t: a.name, alt: [a.name, a.jp].join(" "), d: [a.jp, (a.series || []).map(function (x) { return x.t; }).slice(0, 3).join(", ")].filter(Boolean).join(" · "), u: "/auteurs/" + a.slug, ini: (a.jp || a.name || "?").charAt(0) }; }),
        sorties: (r[2].items || []).filter(function (it) { return it.date >= from; }).map(function (it) {
          var t = it.fr && !(it.series && it.series === it.series.toUpperCase() && /[A-Z]/.test(it.series) && it.series.toLowerCase() === it.fr.toLowerCase()) ? it.fr : it.series;
          return { t: t + (it.n != null ? " T." + tn(it.n) : ""), alt: [it.series, it.fr, it.jp, it.pub].join(" "), d: [it.pays, it.pub, (it.date < today ? "sorti le " : "") + dc(it.date)].filter(Boolean).join(" · "), u: "/calendrier/#t-" + it.id, img: it.cover, date: it.date };
        }),
        news: (r[3].items || []).map(function (n) { return { t: n.fr || n.titre, alt: [n.titre, n.fr, n.jp, n.pub, n.texte].join(" "), d: [n.type === "licence" ? "Licence FR" : "News", n.pub, dc(n.date)].filter(Boolean).join(" · "), u: "/#n-" + n.id, ini: n.type === "licence" ? "FR" : "!" }; }),
      };
      return DATA;
    });
    return loading;
  }
  // Score : début du titre > début d'un mot du titre > dans le titre > autres champs (japonais, éditeur…).
  function score(item, q) {
    var t = norm(item.t), o = norm(item.alt);
    if (t.indexOf(q) === 0) return 100 - t.length / 100;
    if ((" " + t).indexOf(" " + q) >= 0) return 80 - t.length / 100;
    if (t.indexOf(q) >= 0) return 60;
    if ((" " + o).indexOf(" " + q) >= 0) return 40;
    if (o.indexOf(q) >= 0) return 20;
    return 0;
  }
  function find(list, q, max) {
    return list.map(function (x) { return [score(x, q), x]; }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, max).map(function (x) { return x[1]; });
  }
  // Surligne le début tapé quand il correspond au début du titre ou d'un mot.
  function hl(t, q) {
    if (!q) return esc(t);
    var words = t.split(/(\s+)/), out = "", done = false;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!done && norm(w).indexOf(q) === 0 && q.indexOf(" ") < 0) { out += "<mark>" + esc(w.slice(0, q.length)) + "</mark>" + esc(w.slice(q.length)); done = true; }
      else out += esc(w);
    }
    return out;
  }
  function row(x, q, kind) {
    var ic = x.img ? '<span class="ic"><img src="' + couv(x.img) + '" alt="" loading="lazy"></span>'
      : '<span class="ic ' + (kind === "auteurs" ? "rd" : "sq") + '">' + esc(x.ic || x.ini || "") + "</span>";
    return '<a class="fs-r" href="' + esc(x.u) + '" role="option">' + ic + '<span class="tx"><b>' + hl(x.t, q) + "</b>" + (x.d ? "<small>" + esc(x.d) + "</small>" : "") + "</span></a>";
  }
  var GROUPS = [["series", "Séries", 6, "/series/"], ["auteurs", "Mangakas", 4, "/auteurs/"], ["sorties", "Sorties", 5, "/calendrier/"], ["news", "Actualités", 4, "/"]];
  function draw() {
    var raw = inp.value.trim(), q = norm(raw), out = "";
    if (!q) {
      out += '<div class="fs-g">Raccourcis</div>' + PAGES.slice(0, 7).map(function (x) { return row(x, "", "pages"); }).join("");
      if (DATA) {
        var today = new Date().toISOString().slice(0, 10);
        var next = DATA.sorties.filter(function (s) { return s.date >= today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, 4);
        if (next.length) out += '<div class="fs-g">Prochaines sorties <a href="/calendrier/">Tout voir</a></div>' + next.map(function (x) { return row(x, "", "sorties"); }).join("");
      }
    } else {
      var pages = find(PAGES.map(function (x) { return { t: x.t, alt: x.t + " " + (x.k || "") + " " + x.d, d: x.d, u: x.u, ic: x.ic }; }), q, 3);
      if (pages.length) out += '<div class="fs-g">Pages</div>' + pages.map(function (x) { return row(x, q, "pages"); }).join("");
      if (DATA) GROUPS.forEach(function (g) {
        var r = find(DATA[g[0]], q, g[2]);
        if (r.length) out += '<div class="fs-g">' + g[1] + '<a href="' + g[3] + '">Tout voir</a></div>' + r.map(function (x) { return row(x, q, g[0]); }).join("");
      });
      if (!out) out = DATA ? '<div class="fs-e">Rien trouvé pour « ' + esc(raw) + " ».<br>Essaie le titre japonais, français ou le nom du mangaka.</div>" : '<div class="fs-e">Chargement…</div>';
    }
    res.innerHTML = out;
    flat = [].slice.call(res.querySelectorAll(".fs-r")); sel = 0; mark(true);
  }
  function mark(quiet) { flat.forEach(function (el, i) { el.setAttribute("aria-selected", i === sel ? "true" : "false"); }); if (!quiet && flat[sel]) flat[sel].scrollIntoView({ block: "nearest" }); }
  document.body.insertAdjacentHTML("beforeend",
    '<div class="fs" id="fs" hidden role="dialog" aria-modal="true" aria-label="Recherche"><div class="fs-box">' +
    '<div class="fs-in">' + ICON_S + '<input id="fs-q" type="search" placeholder="Série, mangaka, sortie, actu…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label="Rechercher"><button class="fs-x" id="fs-x">Fermer</button></div>' +
    '<div class="fs-res" id="fs-res" role="listbox"></div>' +
    '<div class="fs-h"><span><kbd>↑</kbd> <kbd>↓</kbd> naviguer</span><span><kbd>Entrée</kbd> ouvrir</span><span><kbd>Échap</kbd> fermer</span></div></div></div>' +
    '<div class="me" id="me" hidden role="dialog" aria-modal="true" aria-label="Compte"><div class="me-box"><h3>Ton compte FuryoGang</h3>' +
    "<p>Connecte-toi en un clic avec Google. Ton compte gratuit te permettra bientôt de :</p>" +
    "<ul><li><i>❤️</i>Liker les actus et les séries</li><li><i>🔖</i>Garder tes séries préférées en favoris</li><li><i>⬆️</i>Voter pour les séries populaires</li></ul>" +
    '<div id="me-g" class="me-g"></div><p class="me-err" id="me-err"></p><a class="me-mb" href="/membres/">Voir les membres</a><button class="no" id="me-x">Fermer</button></div></div>');
  var fs = document.getElementById("fs"), inp = document.getElementById("fs-q"), res = document.getElementById("fs-res"), meBox = document.getElementById("me");
  function open() {
    fs.hidden = false; document.body.classList.add("fs-open"); inp.value = ""; draw(); inp.focus();
    var l = load(); if (l) l.then(function () { if (!fs.hidden) draw(); });
  }
  function close() { fs.hidden = true; document.body.classList.remove("fs-open"); }
  document.getElementById("sh-search").addEventListener("click", function (e) { e.preventDefault(); open(); });
  document.getElementById("fs-x").addEventListener("click", close);
  fs.addEventListener("click", function (e) { if (e.target === fs) close(); });
  res.addEventListener("click", function (e) { if (e.target.closest(".fs-r, .fs-g a")) close(); });
  inp.addEventListener("input", draw);
  inp.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(flat.length - 1, sel + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === "Enter" && flat[sel]) { e.preventDefault(); var u = flat[sel].getAttribute("href"); close(); location.href = u; }
  });
  addEventListener("keydown", function (e) {
    var typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || "");
    if (e.key === "Escape") { if (!fs.hidden) close(); if (!meBox.hidden) meBox.hidden = true; }
    else if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && fs.hidden)) { e.preventDefault(); open(); }
  });
  // Préchargement discret des données quand le doigt ou la souris approche de la loupe.
  ["pointerenter", "touchstart", "focus"].forEach(function (ev) { document.getElementById("sh-search").addEventListener(ev, load, { passive: true }); });
  /* ---------- Compte : connexion « Continuer avec Google » ---------- */
  var GCID = "923817714860-h88lmvr2bnvninn41ioa19iv2lrd2ed5.apps.googleusercontent.com", ME = null;
  var meInner = meBox.querySelector(".me-box"), meDefault = meInner.innerHTML;
  function bindClose() { var x = document.getElementById("me-x"); if (x) x.onclick = function () { meBox.hidden = true; }; }
  function drawAvatar() {
    var btn = document.getElementById("sh-me");
    if (ME && ME.user && ME.user.picture) btn.innerHTML = '<img src="' + esc(ME.user.picture) + '" alt="" referrerpolicy="no-referrer">';
    var old = document.querySelector(".sh-bo"); if (old) old.remove();
    if (ME && ME.admin) { var a = document.createElement("a"); a.className = "sh-bo"; a.href = "/admin/"; a.textContent = "Back-office"; document.querySelector(".sh-top").appendChild(a); }
  }
  function gis(cb) {
    if (window.google && google.accounts && google.accounts.id) return cb();
    var sc = document.createElement("script"); sc.src = "https://accounts.google.com/gsi/client"; sc.async = true; sc.onload = cb; document.head.appendChild(sc);
  }
  function openMe() {
    if (ME && ME.user) { location.href = "/profil/"; return; }
    if (false) {
      meInner.innerHTML = '<div class="me-u">' + (ME.user.picture ? '<img src="' + esc(ME.user.picture) + '" alt="" referrerpolicy="no-referrer">' : "") + '<div><b>' + esc(ME.user.name || "Membre") + '</b><small>' + (ME.admin ? "Administrateur" : "Membre FuryoGang") + "</small></div></div>" +
        (ME.admin ? '<a class="go2" href="/admin/">Ouvrir le back-office</a>' : "") +
        '<button class="out" id="me-out">Se déconnecter</button><button class="no" id="me-x">Fermer</button>';
      document.getElementById("me-out").onclick = function () { fetch("/api/auth/me", { method: "DELETE" }).then(function () { location.reload(); }); };
    } else {
      meInner.innerHTML = meDefault;
      gis(function () {
        google.accounts.id.initialize({ client_id: GCID, callback: function (r) {
          fetch("/api/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential: r.credential }) })
            .then(function (x) { return x.json(); }).then(function (j) {
              if (j.ok) { ME = { user: j.user, admin: j.admin }; drawAvatar(); meBox.hidden = true; if (j.admin) location.reload(); }
              else document.getElementById("me-err").textContent = j.error || "Connexion impossible.";
            }).catch(function () { document.getElementById("me-err").textContent = "Connexion impossible."; });
        } });
        google.accounts.id.renderButton(document.getElementById("me-g"), { theme: "filled_black", shape: "pill", size: "large", text: "continue_with", locale: "fr", width: 280 });
      });
    }
    bindClose(); meBox.hidden = false;
  }
  document.getElementById("sh-me").addEventListener("click", openMe);
  if (/^https?:$/.test(location.protocol)) fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) { ME = j; drawAvatar(); } }).catch(function () {});
  bindClose();
  meBox.addEventListener("click", function (e) { if (e.target === meBox) meBox.hidden = true; });
  // Retour en haut (mobile) : même flèche que la chronologie CROWS x WORST, qui a déjà la sienne.
  function toTop() {
    if (document.getElementById("toTop")) return;
    var st = document.createElement("style");
    st.textContent = ".sh-up{position:fixed;z-index:35;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:48px;height:48px;border-radius:50%;border:0;background:#38383B;color:#F5F5F7;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);padding:0}" +
      ".sh-up[hidden]{display:none}@media (min-width:980px){.sh-up{display:none!important}}";
    document.head.appendChild(st);
    var b = document.createElement("button");
    b.className = "sh-up"; b.hidden = true; b.setAttribute("aria-label", "Revenir en haut");
    b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(b);
    addEventListener("scroll", function () { b.hidden = scrollY < 700; }, { passive: true });
    b.addEventListener("click", function () { scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", toTop); else toTop();

  /* ---------- Cookies (RGPD) : seuls les cookies nécessaires sont posés d'office ----------
     Contenus tiers (vidéos YouTube) : seulement après accord. Le choix est gardé 6 mois et modifiable via « Gérer les cookies ». */
  var CK = "fg_consent";
  function choix() { try { var v = JSON.parse(localStorage.getItem(CK) || "null"); return v && v.t > Date.now() - 182 * 864e5 ? v.v : null; } catch (e) { return null; } }
  function garder(v) { try { localStorage.setItem(CK, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {} }
  window.FG_CONSENT = { video: function () { return choix() === "oui"; }, accepter: function () { garder("oui"); }, ouvrir: function () { banniere(true); } };
  function ckCss() {
    var st = document.getElementById("ck-css");
    if (!st) { st = document.createElement("style"); st.id = "ck-css"; st.textContent =
      ".ck{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:95;max-width:560px;margin:0 auto;background:#1B1B1D;border:1px solid #2C2C2F;border-radius:18px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.55);font-family:Inter,system-ui,sans-serif;color:#F5F5F7}" +
      ".ck b{display:block;font-size:15px;margin-bottom:4px}.ck p{margin:0 0 12px;font-size:13.5px;line-height:1.5;color:#CFCFD4}.ck p a{color:#4C9BFF}" +
      ".ck-b{display:flex;gap:8px}.ck-b button{flex:1;height:42px;border:0;border-radius:21px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}" +
      ".ck-b .y{background:#2D74D2;color:#fff}.ck-b .n{background:#38383B;color:#F5F5F7}" +
      ".sh-legal{max-width:1080px;margin:28px auto 0;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 90px);display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;border-top:1px solid #2C2C2F;font:500 12.5px Inter,system-ui,sans-serif}" +
      ".sh-legal a,.sh-legal button{color:#98989D;text-decoration:none;background:none;border:0;padding:0;font:inherit;cursor:pointer}.sh-legal a:hover,.sh-legal button:hover{color:#F5F5F7}";
      document.head.appendChild(st); }
  }
  function banniere(force) {
    ckCss();
    if (!force && choix()) return;
    var old = document.getElementById("ck"); if (old) old.remove();
    var d = document.createElement("div"); d.className = "ck"; d.id = "ck"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Cookies");
    d.innerHTML = "<b>Cookies</b><p>FuryoGang n'utilise aucun cookie publicitaire ni de mesure d'audience. Les bandes-annonces sont hébergées par YouTube, qui dépose ses propres cookies : on ne les charge qu'avec ton accord. <a href=\"/cookies/\">En savoir plus</a></p>" +
      '<div class="ck-b"><button class="n" data-ck="non">Refuser</button><button class="y" data-ck="oui">Accepter</button></div>';
    d.addEventListener("click", function (e) { var b = e.target.closest("[data-ck]"); if (b) { garder(b.dataset.ck); d.remove(); } });
    document.body.appendChild(d);
  }
  function pied() {
    ckCss();
    if (document.getElementById("sh-legal")) return;
    var f = document.createElement("nav"); f.className = "sh-legal"; f.id = "sh-legal"; f.setAttribute("aria-label", "Informations légales");
    f.innerHTML = '<a href="/mentions-legales/">Mentions légales</a><a href="/conditions/">Conditions d\'utilisation</a><a href="/confidentialite/">Confidentialité</a><a href="/cookies/">Cookies</a><button type="button" id="ck-open">Gérer les cookies</button>';
    document.body.appendChild(f);
    document.getElementById("ck-open").onclick = function () { banniere(true); };
  }
  function legal() { pied(); banniere(false); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", legal); else legal();
})();
