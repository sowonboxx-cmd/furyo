// Fenêtre « Merci, t'es Premium » (maquette validée par Will le 25/10/2026) : s'ouvre une fois, à la visite qui suit
// l'enregistrement d'un don dans le QG. Chargée par header.js quand /api/auth/me renvoie « merci ».
(function () {
  var TICK = '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="#0095F6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"/><path fill="#fff" d="m17.204 27.822-7.1-7.115 2.2-2.193 4.9 4.909 10.396-10.414 2.2 2.193Z"/></svg>';
  var CROWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>';
  var CSS = ".fmc-o{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:16px;animation:fmcIn .25s ease}" +
    "@keyframes fmcIn{from{opacity:0}to{opacity:1}}" +
    ".fmc{position:relative;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#111;border-radius:22px;color:#F5F5F7;font-family:Inter,sans-serif;text-align:left}" +
    ".fmc .top{position:relative;padding:20px 24px 22px;min-height:250px;box-sizing:border-box;background:#BC002D;color:#fff;overflow:hidden}" +
    ".fmc .top img{position:absolute;right:14px;bottom:0;height:226px;width:auto;pointer-events:none}" +
    ".fmc .top small{font:700 11.5px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.85}" +
    ".fmc h2{position:relative;z-index:1;margin:70px 0 0;font:700 46px/.95 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;max-width:280px;color:#fff}" +
    ".fmc .bul{position:absolute;z-index:2;right:175px;top:44px;background:#000;color:#F2B33D;font:700 19px/1.05 Antonio,'Arial Narrow',sans-serif;letter-spacing:.03em;text-transform:uppercase;padding:9px 13px;border-radius:16px;transform:rotate(-3deg);white-space:nowrap}" +
    ".fmc .x{position:absolute;top:12px;right:12px;z-index:3;width:34px;height:34px;border:0;border-radius:17px;background:rgba(0,0,0,.6);color:#fff;font:700 18px Inter,sans-serif;cursor:pointer}" +
    ".fmc .bd{padding:20px 24px 24px}" +
    ".fmc .st{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}" +
    ".fmc .pr{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 13px;border-radius:15px;background:#0095F61F;color:#3DB0FF;font:700 13px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase}.fmc .pr svg{width:17px;height:17px}" +
    ".fmc .bg{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:#F2B33D26;color:#F2B33D;font:700 13px Inter,sans-serif}.fmc .bg svg{width:15px;height:15px}" +
    ".fmc .cd{display:flex;gap:8px;margin:0 0 16px}.fmc .cd span{flex:1;background:#1C1C1E;border-radius:12px;padding:11px 0 9px;text-align:center}.fmc .cd b{display:block;font:700 28px/1 Antonio,sans-serif;color:#fff}.fmc .cd i{display:block;margin-top:4px;font:600 10px Inter,sans-serif;font-style:normal;letter-spacing:.06em;text-transform:uppercase;color:#8E8E93}" +
    ".fmc p{margin:0 0 10px;font:500 14px/1.5 Inter,sans-serif;color:#D8D8DC}.fmc p b{color:#fff}" +
    ".fmc .ul{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 18px}.fmc .ul span{font:600 12px Inter,sans-serif;background:#1C1C1E;color:#CFCFD4;padding:6px 10px;border-radius:12px}" +
    ".fmc .bt{display:flex;gap:10px}.fmc .bt a,.fmc .bt button{flex:1;height:46px;border:0;border-radius:23px;display:grid;place-items:center;font:700 14.5px Inter,sans-serif;text-decoration:none;cursor:pointer}.fmc .bt a{background:#F2B33D;color:#000}.fmc .bt button{background:#2C2C2E;color:#fff}" +
    "@media (max-width:520px){.fmc h2{font-size:34px;max-width:190px;margin-top:66px}.fmc .top img{height:180px;right:-6px}.fmc .bul{right:auto;left:24px;top:40px;font-size:15px}.fmc .cd b{font-size:22px}}";
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var court = function (iso) { if (!iso) return ""; var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0].slice(2); };
  var eur = function (n) { return (Math.round(n * 100) / 100).toLocaleString("fr-FR") + " €"; };

  window.FG_MERCI = function (d) {
    if (!d || document.querySelector(".fmc-o")) return;
    var P = !!d.ans;
    if (!document.getElementById("fmc-css")) { var s = document.createElement("style"); s.id = "fmc-css"; s.textContent = CSS; document.head.appendChild(s); }
    var txt = P
      ? "Ton don est bien arrivé. <b>Ton Premium est activé pour " + d.ans + " an" + (d.ans > 1 ? "s" : "") + "</b>" + (d.debut === "2026-12-01" ? ", à partir du 1er décembre (d'ici là, tout le monde est Premium)" : "") + ". Ton badge est déjà sur ton profil."
      : "Ton don est bien arrivé. <b>Ton badge de soutien</b> est déjà sur ton profil.";
    var o = document.createElement("div"); o.className = "fmc-o";
    o.innerHTML = '<div class="fmc" role="dialog" aria-label="Merci"><div class="top"><button type="button" class="x" aria-label="Fermer">×</button><span class="bul">On t\'a pas oublié.</span><img src="/img/don/duo.webp" alt=""><small>FuryoGang Premium</small>' +
      "<h2>Merci " + esc(d.pseudo || "") + ",<br>" + (P ? "t'es Premium" : "le gang te dit merci") + "</h2></div>" +
      '<div class="bd"><div class="st">' + (P ? '<span class="pr">' + TICK + "Premium</span>" : "") + (d.badge ? '<span class="bg">' + CROWN + esc(d.badge) + "</span>" : "") + "</div>" +
      '<div class="cd"><span><b>' + eur(d.montant || 0) + "</b><i>Ton soutien</i></span>" + (P ? "<span><b>" + court(d.debut) + "</b><i>Début</i></span><span><b>" + court(d.fin) + "</b><i>Fin</i></span>" : "") + "</div>" +
      "<p>" + txt + "</p>" +
      (P ? '<div class="ul"><span>Lu</span><span>Envie</span><span>Panier</span><span>Statistiques</span><span>Classements</span><span>Tirage du mois</span><span>+ tout le site</span></div>' : "") +
      '<p style="margin-bottom:18px">FuryoGang tient grâce à des gens comme toi. Le gang te dit merci.</p>' +
      '<div class="bt"><a href="' + (d.slug ? "/membres/" + encodeURIComponent(d.slug) + "/" : "/ma-collection/") + '">Voir mon profil</a><button type="button" data-fmc-x>Fermer</button></div></div></div>';
    document.body.appendChild(o);
    var vu = false;
    var lu = function () { if (vu) return; vu = true; fetch("/api/merci", { method: "POST", credentials: "same-origin" }).catch(function () {}); };
    var close = function () { lu(); o.remove(); document.removeEventListener("keydown", k); };
    var k = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", k);
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest(".x,[data-fmc-x]")) close(); else if (e.target.closest("a")) lu(); });
  };
})();
