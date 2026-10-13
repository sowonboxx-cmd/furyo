// Changer le statut d'une série ou d'un film depuis le site, sans passer par le back-office (Will, 12/10/2026).
// FG_STATUT(kind, id, actuel, slug) renvoie trois boutons : À valider · Admins · Public. Réservé aux admins
// (l'API refuse les autres). Un clic enregistre dans Notion puis recharge la page.
(function () {
  var S = [["À valider", "À valider"], ["Validé · admins", "Admins"], ["En ligne · public", "Public"]];
  var css = ".fgst{display:inline-flex;gap:3px;padding:3px;border-radius:12px;background:rgba(0,0,0,.35);margin-left:auto;flex:none}" +
    ".fgst button{border:0;border-radius:9px;height:30px;padding:0 12px;font:700 12.5px Inter,sans-serif;color:#E8E1FF;background:transparent;cursor:pointer;white-space:nowrap}" +
    ".fgst button:hover{background:rgba(255,255,255,.08)}.fgst button[aria-pressed=true]{background:#6A4BC4;color:#fff;cursor:default}" +
    ".fgst button.pub[aria-pressed=false]{background:#1F9E57;color:#fff}.fgst button.pub[aria-pressed=false]:hover{background:#24B463}" +
    ".fgst.busy{opacity:.5;pointer-events:none}.fgst-msg{font:600 12px Inter,sans-serif;color:#FFB4B4;margin-left:8px}" +
    ".fgst-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px;padding:10px 14px;border-radius:12px;background:color-mix(in srgb,#6A4BC4 22%,#38383B);color:#CDBDFF;font:600 13.5px Inter,sans-serif}" +
    ".fgst-bar b{flex:none;height:22px;padding:0 8px;border-radius:6px;background:#6A4BC4;color:#fff;font:700 10.5px/22px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  window.FG_STATUT = function (kind, id, actuel, slug) {
    if (actuel === "En ligne") actuel = "En ligne · public"; if (actuel === "Validé") actuel = "Validé · admins";
    return '<span class="fgst" data-kind="' + esc(kind) + '" data-id="' + esc(id) + '" data-slug="' + esc(slug || "") + '" role="group" aria-label="Statut">' +
      S.map(function (x) { return '<button type="button" class="' + (x[0] === "En ligne · public" ? "pub" : "") + '" data-st="' + esc(x[0]) + '" aria-pressed="' + (x[0] === actuel) + '">' + x[1] + "</button>"; }).join("") + "</span>";
  };
  // Bandeau complet (pastille + texte + boutons), pour les pages qui n'en ont pas déjà un.
  window.FG_STATUT_BAR = function (kind, id, actuel, slug) {
    var t = actuel === "En ligne · public" || actuel === "En ligne" ? "En ligne, visible par tout le monde." : actuel === "À valider" ? "À valider : invisible sur le site." : "Visible seulement par les admins.";
    return '<div class="fgst-bar"><b>Admin</b>' + t + window.FG_STATUT(kind, id, actuel, slug) + "</div>";
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".fgst button"); if (!b || b.getAttribute("aria-pressed") === "true") return;
    var g = b.closest(".fgst"), stt = b.dataset.st;
    if (g.classList.contains("busy")) return;
    if (stt === "En ligne · public" && !confirm("Mettre en ligne pour tout le monde ?")) return;
    g.classList.add("busy");
    fetch("/api/admin/update", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: g.dataset.kind, id: g.dataset.id, slug: g.dataset.slug, statut: stt }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || "erreur");
        // Série : on reconstruit sa fiche Ma collection avant de recharger, pour voir le nouveau statut tout de suite.
        // Le navigateur garde /api/biblio?id=… 60 s en cache : sans le « cache: reload », la page rechargée montrait
        // encore l'ancien statut et il fallait recliquer 2-3 fois (Will, 13/10/2026).
        var u = "/api/biblio?id=" + g.dataset.id;
        return (g.dataset.kind === "serie" ? fetch(u + "&refresh=1", { cache: "no-store" }).then(function () { return fetch(u, { cache: "reload" }); }).catch(function () {}) : Promise.resolve()).then(function () { location.reload(); }); })
      .catch(function (err) { g.classList.remove("busy"); var m = g.parentNode.querySelector(".fgst-msg") || g.insertAdjacentElement("afterend", Object.assign(document.createElement("span"), { className: "fgst-msg" })); m.textContent = "Échec : " + err.message; });
  });
})();
