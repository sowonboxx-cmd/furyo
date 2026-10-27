/* Accès rapide admin (Will, 20/10/2026) : le même pop-up centré « grille 2 par 2 » que sur le site,
   réutilisable partout où Will est admin (back-office, HQ, calendrier éditorial…), déclenché par son avatar.
   Autonome : récupère lui-même l'utilisateur (/api/auth/me) et les compteurs, injecte son propre CSS (.fgq-*).
   Usage : <script src="/site/quickaccess.js?v=1"></script> puis FGQuick.mount(elAvatar). */
(function () {
  if (window.FGQuick) return;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var ME = null, SJ = { n: 0 }, VN = 0, CV = 0, loaded = false, cssDone = false;

  function css() {
    if (cssDone) return; cssDone = true;
    var s = document.createElement("style");
    s.textContent = '@font-face{font-family:"FGAntonio";src:url(/fonts/Antonio.ttf) format("truetype");font-weight:100 700}@font-face{font-family:"FGInter";src:url(/fonts/Inter.ttf) format("truetype");font-weight:100 900}' +
      ".fgq-pop{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);font-family:FGInter,Inter,system-ui,sans-serif}.fgq-pop[hidden]{display:none}" +
      ".fgq-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,calc(100% - 28px));box-sizing:border-box;padding:26px;background:#0c0c0e;border:1px solid #242428;border-radius:28px;box-shadow:0 40px 100px rgba(0,0,0,.6);color:#F5F5F7}" +
      ".fgq-h{position:relative;display:flex;align-items:center;justify-content:flex-end;min-height:42px;margin-bottom:20px}" +
      ".fgq-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;line-height:0}.fgq-logo img{height:30px;width:auto;display:block}" +
      ".fgq-h .x{width:42px;height:42px;border-radius:50%;background:#2a2a2e;color:#98989D;display:grid;place-items:center;font-size:26px;border:0;cursor:pointer;line-height:1}" +
      ".fgq-srch{display:flex;align-items:center;gap:12px;width:100%;height:54px;margin:0 0 12px;padding:0 18px;border:0;border-radius:16px;background:#1e1e22;color:#9a9aa0;font:500 16px Inter,system-ui,sans-serif;text-align:left;cursor:pointer;box-sizing:border-box}.fgq-srch svg{width:20px;height:20px;flex:none;color:#F5F5F7}.fgq-srch span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media (min-width:601px){.fgq-srch{display:none!important}}@media (max-width:600px){.fgq-srch{height:46px;margin-bottom:9px;padding:0 14px;border-radius:13px;font-size:15px}}" +
      ".fgq-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}" +
      ".fgq-qt{position:relative;display:flex;align-items:center;gap:16px;background:#1e1e22;border:0;border-radius:18px;padding:18px 20px;text-decoration:none;color:inherit}.fgq-qt.wide{grid-column:1/3}" +
      ".fgq-qt .ic{width:54px;height:54px;border-radius:16px;background:#305887;display:grid;place-items:center;flex:none}.fgq-qt .ic svg{width:28px;height:28px;color:#fff}" +
      ".fgq-qt h3{margin:0;font:700 24px/1 FGAntonio,sans-serif;text-transform:uppercase;letter-spacing:.01em;color:#fff}.fgq-qt small{display:block;color:#9a9aa0;font-size:15px;margin-top:4px}" +
      ".fgq-qt .bdg{position:absolute;top:20px;right:18px;min-width:28px;height:28px;padding:0 8px;box-sizing:border-box;border-radius:7px;background:#BC002D;color:#fff;font:700 15px FGAntonio,sans-serif;display:flex;align-items:center;justify-content:center;line-height:1}.fgq-qt .bdg span{display:block;transform:translateY(-1px)}" +
      ".fgq-out{margin-top:16px;width:100%;height:58px;border:0;border-radius:16px;background:#2a2a2e;color:#98989D;font:600 16px Inter,sans-serif;cursor:pointer}" +
      ".fgq-av{width:34px;height:34px;border-radius:50%;background:#38383B;border:0;padding:0;cursor:pointer;overflow:hidden;display:grid;place-items:center;color:#CFCFD4;flex:none}.fgq-av img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".fgq-av svg{width:20px;height:20px}" +
      // Mobile : liste dense (une entrée par ligne, petite icône, sans sous-titre) — le pop-up « bureau » ne tient pas sur téléphone (Will, 20/10/2026).
      "@media (max-width:600px){.fgq-card{padding:16px;border-radius:22px;max-height:calc(100vh - 24px);overflow-y:auto}.fgq-grid{grid-template-columns:1fr;gap:9px}.fgq-qt{padding:10px 13px;gap:11px;border-radius:13px}.fgq-qt.wide{grid-column:auto}.fgq-qt .ic{width:32px;height:32px;border-radius:9px}.fgq-qt .ic svg{width:18px;height:18px}.fgq-qt h3{font-size:19px}.fgq-qt small{display:none}.fgq-qt .bdg{position:static;margin-left:auto;top:auto;right:auto}.fgq-out{height:50px;font-size:15px}}";
    document.head.appendChild(s);
  }

  var I = {
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h11v15H5a1 1 0 0 1-1-1z"/><path d="M15 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2"/><path d="M7 8.5h5M7 11.5h5M7 14.5h3"/></svg>',
    sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/></svg>',
    db: '<svg viewBox="0 0 24 24"><g fill="#fff"><rect x="3.3" y="6" width="3.1" height="13" rx="0.7"/><rect x="7.1" y="4.3" width="3.1" height="14.7" rx="0.7"/><rect x="14.9" y="7" width="3.1" height="12" rx="0.7"/><rect x="2" y="19" width="20" height="2.5" rx="1.25"/></g><rect x="10.9" y="5.2" width="3.3" height="13.8" rx="0.7" fill="#E54839"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    comm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/><circle cx="18" cy="7" r="3"/><path d="M18 13c2.6.2 4 2.3 4 4.8"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
    couv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>',
    srch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    hq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8l8-4 8 4v12"/><path d="M3 20h18M9.5 20v-4h5v4M8.5 11h2M13.5 11h2"/></svg>'
  };

  function qt(ic, title, sub, href, badge, wide) {
    return '<a class="fgq-qt' + (wide ? " wide" : "") + '" href="' + href + '"><span class="ic">' + I[ic] + '</span><div><h3>' + title + '</h3><small>' + sub + '</small></div>' + (badge ? '<span class="bdg"><span>' + esc(String(badge)) + '</span></span>' : '') + '</a>';
  }

  function render() {
    css();
    var pop = document.getElementById("fgq-pop");
    if (!pop) { pop = document.createElement("div"); pop.className = "fgq-pop"; pop.id = "fgq-pop"; pop.hidden = true; document.body.appendChild(pop); pop.addEventListener("click", function (e) { if (e.target === pop) pop.hidden = true; }); }
    var n = VN ? (VN > 99 ? "99+" : String(VN)) : "";
    var sjSub = SJ && SJ.n ? (SJ.n + " à poster") : "France + Japon";
    pop.innerHTML = '<div class="fgq-card" role="dialog" aria-label="Accès rapide admin">' +
      '<div class="fgq-h"><a class="fgq-logo" href="/" aria-label="Retour au site"><img src="/img/logo-furyogang.png" alt="FuryoGang"></a><button class="x" type="button" aria-label="Fermer">×</button></div>' +
      // Recherche au-dessus d'Actualités (Will, 21/10/2026) : ouvre la recherche du site.
      '<button type="button" class="fgq-srch">' + I.srch + '<span>Rechercher sur le site</span></button>' +
      '<div class="fgq-grid">' +
        qt("news", "Actualités", "à relire", "/admin/#validation", n) +
        qt("sort", "Sorties", sjSub, "/admin/#sorties", SJ && SJ.n ? SJ.n : "") +
        qt("cal", "Calendrier", "la semaine", "/hq/#calendrier", "") +
        qt("db", "Mangas Database", "toutes les séries", "/admin/#mangas", "") +
        // Couvertures manquantes, nombre en direct, juste sous Mangas Database (Will, 21/10/2026).
        qt("couv", "Couvertures manquantes", CV ? CV + " à remplir" : "tout est rempli", "/admin/#couvertures", CV || "", true) +
        qt("admin", "Admin", "le back-office", "/admin/", "") +
        qt("stats", "Statistiques", "clics Google", "/admin/#stats", "") +
        qt("comm", "Communauté", "les membres", "/communaute/", "") +
        qt("user", "Mon compte", "profil, préférences", "/profil/", "") +
        qt("hq", "HQ", "ressources, promo", "/hq/", "") +
      '</div>' +
      '<button class="fgq-out" type="button">Se déconnecter</button></div>';
    pop.querySelector(".x").onclick = function () { pop.hidden = true; };
    pop.querySelector(".fgq-srch").onclick = function () { pop.hidden = true; if (window.FG_SEARCH) window.FG_SEARCH(); else location.href = "/#recherche"; };
    pop.querySelector(".fgq-out").onclick = function () {
      fetch("/api/auth/me", { method: "DELETE" }).catch(function () {}).then(function () { fetch("/api/admin/login", { method: "DELETE" }).catch(function () {}).then(function () { location.reload(); }); });
    };
    pop.hidden = false;
  }

  function loadData(done) {
    if (loaded) { done(); return; }
    var pending = 4, go = function () { if (--pending <= 0) { loaded = true; done(); } };
    fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { ME = j || ME; go(); }).catch(go);
    fetch("/api/admin/veille?count=1", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) VN = j.n || 0; go(); }).catch(go);
    fetch("/api/admin/couvertures?count=1", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) CV = j.n || 0; go(); }).catch(go);
    fetch("/api/admin/sorties?count=1", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) SJ = { n: j.n || 0 }; go(); }).catch(go);
  }

  // Admin : le nouveau menu H1 (le même que sur le site, Will 25/10/2026). Sinon l'ancien accès rapide.
  function openPop() {
    if (!ME) { fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { ME = j || { admin: false }; openPop(); }).catch(function () { loadData(render); }); return; }
    if (ME && ME.admin) {
      if (window.FG_ADMPOP) return window.FG_ADMPOP(ME, null);
      var sc = document.createElement("script"); sc.src = "/site/admin-pop.js?v=5";
      sc.onload = function () { window.FG_ADMPOP(ME, null); }; sc.onerror = function () { loadData(render); };
      document.head.appendChild(sc); return;
    }
    loadData(render);
  }

  // Transforme un élément (ou en crée un) en bouton avatar qui ouvre l'accès rapide.
  function mount(el) {
    if (!el) return;
    css();
    el.classList.add("fgq-av");
    el.setAttribute("type", "button");
    el.setAttribute("aria-label", "Accès rapide");
    el.innerHTML = I.user;
    fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      ME = j || ME;
      if (ME && ME.user && ME.user.picture) el.innerHTML = '<img src="' + esc(ME.user.picture) + '" alt="" referrerpolicy="no-referrer">';
    }).catch(function () {});
    el.addEventListener("click", function (e) { e.preventDefault(); openPop(); });
    return el;
  }

  window.FGQuick = { open: openPop, mount: mount };
})();
