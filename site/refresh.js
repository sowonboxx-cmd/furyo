/* Bouton « recharger l'application » (Will, 23/11/2026) : sur iPhone, le site ajouté à l'écran d'accueil n'a pas de
   bouton d'actualisation. Ce rond vert coché vide les caches (données gardées sur le téléphone, caches du navigateur)
   et recharge tout. Visible dans le back-office (admin, HQ, studios) et, sur le site, seulement en mode application. */
(function () {
  if (window.__fgRefresh) return; window.__fgRefresh = true;
  var admin = /^\/(admin|hq|studio)(\/|$)/.test(location.pathname);
  var appli = (window.navigator && navigator.standalone) || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  var CACHES = ["fg-news", "av-data", "hq-cal-v1"];
  function vider() {
    try { CACHES.forEach(function (k) { localStorage.removeItem(k); }); Object.keys(localStorage).forEach(function (k) { if (/^qdn:/.test(k)) localStorage.removeItem(k); }); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    var p = [];
    if (window.caches && caches.keys) p.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }).catch(function () {}));
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) p.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }).catch(function () {}));
    return Promise.all(p);
  }
  function recharger(b) {
    b.classList.add("on");
    vider().then(function () {
      var u = new URL(location.href); u.searchParams.set("_r", Date.now().toString(36));
      location.replace(u.toString());
    });
  }
  // Utilisé aussi par le panneau admin (avatar) : window.fgRecharger(bouton).
  window.fgRecharger = function (b) { recharger(b || document.createElement("i")); };
  if (!admin && !appli) return;
  var css = document.createElement("style");
  css.textContent =
    ".fg-rl{width:30px;height:30px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;background:#2FB56A;color:#fff;cursor:pointer;flex:none;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.35)}" +
    ".fg-rl svg{width:17px;height:17px}.fg-rl.on svg{animation:fgrl .8s linear infinite}@keyframes fgrl{to{transform:rotate(360deg)}}" +
    ".fg-rl.fx{position:fixed;z-index:99998;top:calc(env(safe-area-inset-top,0px) + 12px);right:calc(env(safe-area-inset-right,0px) + 12px)}" +
    ".sh .fg-rl{margin:0 6px 0 2px;box-shadow:none}";
  document.head.appendChild(css);
  var OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var TOUR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg>';
  function bouton() {
    var b = document.createElement("button"); b.type = "button"; b.className = "fg-rl"; b.innerHTML = OK;
    b.setAttribute("aria-label", "Recharger l'application"); b.title = "Recharger l'application";
    b.onclick = function () { b.innerHTML = TOUR; recharger(b); };
    return b;
  }
  function placer() {
    if (document.querySelector(".fg-rl")) return;
    var me = document.getElementById("sh-me");
    // Sur téléphone, pas de rond vert dans l'en-tête du site (trop de place) : il est dans le panneau admin (Will, 23/11/2026).
    if (me && !admin && matchMedia("(max-width: 820px)").matches) return;
    if (me && me.parentNode) { var b = bouton(); b.style.order = getComputedStyle(me).order; me.parentNode.insertBefore(b, me); return; }
    var f = bouton(); f.classList.add("fx"); document.body.appendChild(f);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", placer); else placer();
  // Nettoie le paramètre ajouté au rechargement.
  if (/[?&]_r=/.test(location.search)) { try { var u = new URL(location.href); u.searchParams.delete("_r"); history.replaceState(history.state, "", u.pathname + u.search + u.hash); } catch (e) {} }
})();
