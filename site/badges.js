// Rendu des badges (cartes et pastilles), partagé par /profil/, /membres/ et /membres/<pseudo>.
// Les badges viennent de la base Notion « Badges » : { id, n (nom), d (description), c (couleur), i (icône), r (règle), fixe }.
(function () {
  var A = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  var I = {
    bouclier: '<svg ' + A + '><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/></svg>',
    etoile: '<svg ' + A + '><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/></svg>',
    coeur: '<svg ' + A + '><path d="M12 20.5S3 15 3 8.8C3 6 5.1 4 7.7 4c1.8 0 3.3 1 4.3 2.4C13 5 14.5 4 16.3 4 18.9 4 21 6 21 8.8 21 15 12 20.5 12 20.5z"/></svg>',
    crayon: '<svg ' + A + '><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    livre: '<svg ' + A + '><path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/></svg>',
    couronne: '<svg ' + A + '><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
    flamme: '<svg ' + A + '><path d="M12 21c-3.9 0-7-2.8-7-6.6 0-3.1 2.2-5.3 3.6-7.2.4 1.6 1.4 2.8 2.6 3.3C11 7 12.5 4.6 15 3c-.3 2.6.8 4.4 2.2 6 1.1 1.3 1.8 2.9 1.8 4.6C19 18 15.9 21 12 21z"/></svg>'
  };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  window.FG_BADGES = {
    icone: function (b) { return I[b.i] || I.etoile; },
    // Carte (profil) ; on = obtenu.
    carte: function (b, on) {
      return '<div class="bd ' + (on ? "" : "off") + '"><i style="background:' + b.c + '22;color:' + b.c + '">' + (I[b.i] || I.etoile) + '</i><b>' + esc(b.n) + '</b><small>' + esc(b.d) + (on ? "" : " · pas encore") + '</small></div>';
    },
    // Pastille (liste des membres).
    pastille: function (b) { return '<span class="b" style="background:' + b.c + '26;color:' + b.c + '">' + esc(b.n) + '</span>'; }
  };
})();
