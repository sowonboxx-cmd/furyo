// Back-office : alerte visible quand une action admin échoue (Will, 19/11/2026 : « ça se grise et il ne se passe rien »).
// Toute réponse 401 de /api/admin/* = session admin expirée → bandeau avec lien de reconnexion.
// Les autres échecs (Notion, serveur) s'affichent aussi au lieu de passer inaperçus.
(function () {
  if (window.__fgAdminSession) return; window.__fgAdminSession = true;
  var css = document.createElement("style");
  css.textContent = ".fg-alerte{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99999;max-width:min(560px,calc(100vw - 32px));background:#1c1c1e;color:#fff;border:1px solid #E5483A;border-radius:14px;padding:12px 14px 12px 16px;font:500 14px/1.4 Inter,system-ui,sans-serif;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.5)}.fg-alerte a{color:#fff;background:#E5483A;border-radius:999px;padding:7px 14px;text-decoration:none;font-weight:700;white-space:nowrap}.fg-alerte button{background:none;border:0;color:#aaa;font-size:20px;cursor:pointer;padding:0 2px}";
  document.head.appendChild(css);
  var el = null;
  window.fgAlerte = function (msg, lien) {
    if (el) el.remove();
    el = document.createElement("div"); el.className = "fg-alerte"; el.setAttribute("role", "alert");
    var t = document.createElement("span"); t.textContent = msg; el.appendChild(t);
    if (lien) { var a = document.createElement("a"); a.href = lien; a.textContent = "Se reconnecter"; el.appendChild(a); }
    var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Fermer"); x.textContent = "×"; x.onclick = function () { el.remove(); el = null; }; el.appendChild(x);
    document.body.appendChild(el);
    if (!lien) setTimeout(function () { if (el && el.contains(t)) { el.remove(); el = null; } }, 7000);
  };
  var base = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var u = typeof input === "string" ? input : (input && input.url) || "";
    var ecrit = init && init.method && init.method !== "GET";
    return base(input, init).then(function (r) {
      if (/\/api\/admin\//.test(u)) {
        if (r.status === 401) window.fgAlerte("Votre session admin a expiré : l'action n'a pas été enregistrée.", "/admin/");
        else if (ecrit && !r.ok) r.clone().text().then(function (t) { var m = ""; try { m = JSON.parse(t).error || ""; } catch (e) { m = t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140); } window.fgAlerte("Échec de l'enregistrement (" + r.status + ")" + (m ? " : " + m : "")); });
      }
      return r;
    }, function (e) {
      if (/\/api\/admin\//.test(u) && ecrit) window.fgAlerte("Pas de connexion au serveur : l'action n'a pas été enregistrée.");
      throw e;
    });
  };
})();
