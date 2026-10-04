/* Accueil FuryoGang sur téléphone (≤ 719 px) : fil d'actus façon X + sections (sorties FR / JP, direct du Japon,
   CROWS × WORST, avancement, membres, mangakas). Vues : accueil, ?vue=actus (toutes les actus), ?cat=<type> (une catégorie),
   ?vue=magazines (tous les magazines). Les données viennent des mêmes API que la version ordinateur. */
(function () {
  var MQ = matchMedia("(max-width:719px)");
  var root = document.getElementById("mh");
  if (!root) return;
  // Catégories : mêmes noms et couleurs que la propriété « Catégorie » de Notion (voir lib/categories.js).
  var TYPES = [["licence-fr", "Nouvelle licence (France)", "#529CCA"], ["licence-jp", "Nouvelle licence (Japon)", "#FF7369"], ["couv-fr", "Couverture française", "#9A6DD7"], ["couv-jp", "Couverture japonaise", "#4DAB9A"], ["sortie-fr", "Sortie française", "#E255A1"], ["sortie-jp", "Sortie japonaise", "#FFA344"], ["fin", "Fin de série", "#BA856F"], ["pause", "Pause", "#9B9A97"], ["adaptation", "Adaptation", "#FFDC49"], ["annonce", "Annonce", "#D4D4D8"]];
  var TL = {}; TYPES.forEach(function (t) { TL[t[0]] = t; });
  var esc = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var slug = function (t) { return String(t || "").replace(/œ/g, "oe").replace(/Œ/g, "OE").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); };
  var couv = function (u, w) { return u ? (/^https?:/.test(u) ? "/api/couv?u=" + encodeURIComponent(u) + "&w=" + (w || 320) : u) : ""; };
  var MC = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var dd = function (d) { if (!d) return ""; var x = new Date(d + "T12:00:00"); return x.getDate() + " " + MC[x.getMonth()]; };
  var nf = function (n) { return n >= 1000 ? (n / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " k" : String(n || 0); };
  var D = { cn: {}, news: null, cal: null, prepub: null, av: null, mbr: null, aut: null, stats: {}, me: null };
  var get = function (u) { return fetch(u, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
  var newsId = function (it) { return it.id; };

  var I = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5S3 15 3 8.8C3 6 5.1 4 7.7 4c1.8 0 3.3 1 4.3 2.4C13 5 14.5 4 16.3 4 18.9 4 21 6 21 8.8 21 15 12 20.5 12 20.5z"/></svg>',
    com: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4A8 8 0 1 1 20 12z"/></svg>',
    stat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 20V12M12 20V5M19 20v-9"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    fr: '<svg class="fl" viewBox="0 0 22 15" aria-label="France"><rect width="7.34" height="15" fill="#2F5DA8"/><rect x="7.33" width="7.34" height="15" fill="#F5F5F7"/><rect x="14.66" width="7.34" height="15" fill="#E5483A"/></svg>',
    jp: '<svg class="fl" viewBox="0 0 22 15" aria-label="Japon"><rect width="22" height="15" fill="#F5F5F7"/><circle cx="11" cy="7.5" r="4.2" fill="#E5483A"/></svg>'
  };

  // ---------- Actions d'une news (sans l'ouvrir) ----------
  function acts(it) {
    var id = newsId(it), st = D.stats[id] || {};
    return '<div class="mh-acts" data-id="' + esc(id) + '">' +
      '<button type="button" class="a-like' + (st.ml ? " on" : "") + '" data-act="like" aria-label="J\'aime">' + I.heart + "<b>" + nf(st.l || 0) + "</b></button>" +
      '<a class="a-com" href="' + esc(link(it)) + '#commentaires" aria-label="Commentaires">' + I.com + "<b>" + nf((D.cn || {})[id] || 0) + "</b></a>" +
      '<span class="a-v" aria-label="Vues">' + I.stat + "<b>" + nf(st.v || 0) + "</b></span>" +
      '<button type="button" class="a-book' + (st.mb ? " on" : "") + '" data-act="bookmark" aria-label="Signet">' + I.book + "</button></div>";
  }
  function link(it) { return "/actus/" + slug(it.fr || it.titre) + "-" + String(it.id).slice(0, 8); }
  function meta(it) {
    var t = TL[it.cat] || TL.annonce;
    return '<div class="mh-meta"><span style="color:' + t[2] + '">' + esc(t[1]) + "</span>· " + esc(dd(it.date)) + "</div>";
  }
  // Carte « O » : texte à gauche, image à droite
  function cardO(it) {
    return '<article class="mh-o"><a class="mh-hit" href="' + esc(link(it)) + '"><div class="mh-ot">' + meta(it) + '<h3>' + esc(it.fr || it.titre) + '</h3><p>' + esc(it.texte) + "</p></div>" +
      (it.cover ? '<img src="' + esc(couv(it.cover, 240)) + '" alt="" loading="lazy">' : "") + "</a>" + acts(it) + "</article>";
  }
  // Carte de liste (toutes les actus / catégorie) : image à gauche, même détail
  function cardR(it) {
    return '<article class="mh-r"><a class="mh-hit" href="' + esc(link(it)) + '">' + (it.cover ? '<img src="' + esc(couv(it.cover, 240)) + '" alt="" loading="lazy">' : '<span class="mh-noimg"></span>') +
      '<div class="mh-rt">' + meta(it) + "<h3>" + esc(it.fr || it.titre) + "</h3><p>" + esc(it.texte) + "</p></div></a>" + acts(it) + "</article>";
  }
  // La plus récente en grand
  function hero(it) {
    var t = TL[it.cat] || TL.annonce;
    return '<article class="mh-hero"><a class="mh-hit" href="' + esc(link(it)) + '">' + (it.cover ? '<img src="' + esc(couv(it.cover, 720)) + '" alt="">' : "") +
      '<span class="mh-hv"><span class="mh-pill" style="background:' + t[2] + '">' + esc(t[1]) + "</span><em>" + esc(dd(it.date)) + "</em></span>" +
      "<h2>" + esc(it.fr || it.titre) + "</h2><p>" + esc(it.texte) + "</p></a>" + acts(it) + "</article>";
  }

  // ---------- Barre d'onglets façon X ----------
  var TAB = "toutes";
  function xtabs() {
    return '<nav class="mh-x" aria-label="Fil d\'actualités">' + [["toutes", "Toutes"], ["feed", "Mon feed"], ["signets", "Signets"]].map(function (t) {
      return '<button type="button" data-tab="' + t[0] + '" aria-pressed="' + (TAB === t[0]) + '">' + t[1] + "</button>";
    }).join("") + '<button type="button" class="mh-catb" aria-haspopup="listbox" aria-expanded="false">Catégories' + I.chev + "</button></nav>";
  }
  function catMenu(cur) {
    var n = function (k) { return (D.news || []).filter(function (it) { return it.cat === k; }).length; };
    return '<div class="mh-menu" role="listbox" aria-label="Catégories" hidden>' +
      '<button role="option" data-cat="" aria-selected="' + !cur + '"><i style="background:#F5F5F7"></i>Toutes les catégories</button>' +
      TYPES.map(function (t) { return '<button role="option" data-cat="' + t[0] + '" aria-selected="' + (cur === t[0]) + '"' + (n(t[0]) ? "" : ' class="vide"') + '><i style="background:' + t[2] + '"></i>' + t[1] + "<small>" + n(t[0]) + "</small></button>"; }).join("") + "</div>";
  }

  // ---------- Sections ----------
  function semaine() { var d = new Date(), j = (d.getDay() + 6) % 7, a = new Date(d); a.setDate(d.getDate() - j); var b = new Date(a); b.setDate(a.getDate() + 6); var f = function (x) { return x.toISOString().slice(0, 10); }; return [f(a), f(b), a, b]; }
  function head2(t, sub, href, lab) {
    return '<div class="mh-h2"><div>' + (sub ? "<small>" + sub + "</small>" : "") + "<h2>" + t + "</h2></div>" + (href ? '<a href="' + href + '">' + (lab || "Tout voir") + "</a>" : "") + "</div>";
  }
  function sortiesFR() {
    var w = semaine(), it = (D.cal || []).filter(function (x) { return x.pays === "France" && x.date >= w[0] && x.date <= w[1]; });
    var titre = "Sorties de la semaine", sous = I.fr + "En France · " + w[2].getDate() + " – " + w[3].getDate() + " " + MC[w[3].getMonth()];
    if (!it.length) { var t = new Date().toISOString().slice(0, 10); it = (D.cal || []).filter(function (x) { return x.pays === "France" && x.date >= t; }).slice(0, 8); titre = "Prochaines sorties"; sous = I.fr + "En France"; }
    if (!it.length) return "";
    return '<section class="mh-sec" aria-label="Sorties en France">' + head2(titre, sous, "/calendrier/#france", "Calendrier") + '<div class="mh-car">' + it.map(function (x) {
      var t = (x.fr || x.series) + (x.n != null ? " T." + String(x.n).padStart(2, "0") : "");
      return '<a class="mh-cov" data-tome="' + esc(x.id) + '" href="' + (x.fiche ? "/series/" + slug(x.fr || x.series) : "/calendrier/") + '"><span>' + (x.cover ? '<img src="' + esc(couv(x.cover, 260)) + '" alt="" loading="lazy">' : "") + "<em>" + esc(dd(x.date)) + "</em></span><b>" + esc(t) + "</b><small>" + esc(x.pub || "") + "</small></a>";
    }).join("") + "</div></section>";
  }
  function sortiesJP() {
    var w = semaine(), it = (D.cal || []).filter(function (x) { return x.pays === "Japon" && x.date >= w[0] && x.date <= w[1]; });
    var titre = "Sorties de la semaine";
    if (!it.length) { var t = new Date().toISOString().slice(0, 10); it = (D.cal || []).filter(function (x) { return x.pays === "Japon" && x.date >= t; }).slice(0, 5); titre = "Prochaines sorties"; }
    if (!it.length) return "";
    var J = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    return '<section class="mh-jpbox" aria-label="Sorties au Japon">' + head2(titre, I.jp + "Au Japon", "/calendrier/#japon", "Calendrier") + it.slice(0, 6).map(function (x) {
      var d = new Date(x.date + "T12:00:00"), t = (x.series) + (x.n != null ? " T." + String(x.n).padStart(2, "0") : "");
      return '<a class="mh-jprow" data-tome="' + esc(x.id) + '" href="' + (x.fiche ? "/series/" + slug(x.fr || x.series) : "/calendrier/#japon") + '"><span class="d"><b>' + String(d.getDate()).padStart(2, "0") + "</b>" + J[d.getDay()] + "</span>" + (x.cover ? '<img src="' + esc(couv(x.cover, 120)) + '" alt="" loading="lazy">' : '<span class="mh-noimg s"></span>') + '<span class="t"><b>' + esc(t) + "</b><small>" + esc(x.pub || "") + "</small></span></a>";
    }).join("") + "</section>";
  }
  function mags() {
    var g = {}, order = [];
    (D.prepub || []).forEach(function (it) { var k = it.mag + "|" + it.issue; if (!g[k]) { g[k] = { mag: it.mag, issue: it.issue, date: it.date, cover: it.cover, link: it.link, items: [] }; order.push(k); } if (it.cover && !g[k].cover) g[k].cover = it.cover; g[k].items.push(it); });
    return order.map(function (k) { return g[k]; });
  }
  function magCard(m) {
    var t = new Date().toISOString().slice(0, 10), paru = !m.date || m.date <= t;
    return '<article class="mh-mag"><div class="mh-magc">' + (m.cover ? '<img src="' + esc(couv(m.cover, 200)) + '" alt="" loading="lazy">' : '<span class="mh-noimg"></span>') + "</div><div class='mh-magt'><small>" + (paru ? "Sorti le " : "Sort le ") + esc(dd(m.date)) + "</small><b>" + esc(m.mag) + " " + esc(m.issue) + "</b>" +
      // Juste le titre et le numéro de chapitre (pas de pastille couverture / pause, Will 04/10/2026).
      m.items.map(function (it) { return '<span class="mh-ch"><span>' + esc(it.entry.split(" · ")[0]) + "</span><span>" + (it.status !== "Pause" && it.ch ? "<em>Ch. " + esc(it.ch) + "</em>" : "") + "</span></span>"; }).join("") + "</div></article>";
  }
  function direct() {
    var m = mags(); if (!m.length) return "";
    return '<section class="mh-sec" aria-label="Direct du Japon">' + head2("Direct du Japon", '<span class="live">● En direct</span> · Prépublication', "/?vue=magazines", "Tous les magazines") + '<div class="mh-car">' + m.slice(0, 6).map(magCard).join("") + "</div></section>";
  }
  function crows() {
    return '<a class="mh-cxw" href="/crows-x-worst/"><span class="chars"><img src="/crows-x-worst/img/char-hana.png" alt=""><img src="/crows-x-worst/img/char-boya.png" alt=""></span><span class="t"><small>Carte interactive</small><b>CROWS<i>×</i>WORST</b><em>Toutes les œuvres dans l\'ordre de l\'histoire</em></span></a>';
  }
  function avance() {
    var a = D.av; if (!a || !a.total) return "";
    var cells = 30, per = Math.ceil(a.total / cells), on = Math.round(a.enLigne / per);
    var c = ""; for (var i = 0; i < cells; i++) c += "<i" + (i < Math.max(1, on) ? ' class="on"' : "") + "></i>";
    var last = (a.recentes || [])[0];
    return '<a class="mh-av" href="/avancement/"><div class="mh-avh"><h2>La base FuryoGang</h2><small>Mise à jour chaque semaine</small></div><div class="mh-avn"><b>' + a.enLigne + "</b><span>/ " + a.total.toLocaleString("fr-FR") + ' fiches en ligne</span></div><div class="mh-avg">' + c + "</div><small>Une case = " + per + " fiches." + (last ? " Dernière arrivée : " + esc(last.fr || last.t) + "." : "") + "</small></a>";
  }
  function membres() {
    var m = D.mbr; if (!m) return "";
    var list = (m.items || []).slice().sort(function (a, b) { return new Date(b.inscrit) - new Date(a.inscrit); }).slice(0, 5);
    var body = list.length ? '<div class="mh-mbr">' + list.map(function (x) { return '<a href="' + (x.slug ? "/membres/" + encodeURIComponent(x.slug) : "/membres/") + '">' + (x.photo ? '<img src="' + esc(x.photo) + '" alt="" referrerpolicy="no-referrer" loading="lazy">' : "<i>" + esc((x.pseudo || x.nom || "?").charAt(0).toUpperCase()) + "</i>") + "<span>" + esc(x.pseudo || x.nom || "Membre") + "</span></a>"; }).join("") + "</div>"
      : '<p class="mh-note">' + (m.total || 0) + " membre" + ((m.total || 0) > 1 ? "s" : "") + " dans le gang. Connecte-toi pour voir qui en fait partie.</p>";
    return '<section class="mh-sec" aria-label="Derniers membres">' + head2("Ils ont rejoint le gang", "Derniers membres", "/membres/", "Membres") + body +
      (D.me && D.me.user ? "" : '<button type="button" class="mh-join" onclick="window.FG_LOGIN && FG_LOGIN()">Devenir membre</button>') + "</section>";
  }
  function mangakas() {
    var a = (D.aut || []).slice().sort(function (x, y) { return y.series.length - x.series.length; }).slice(0, 4);
    if (!a.length) return "";
    return '<section class="mh-sec" aria-label="Mangakas">' + head2("Mangakas", "", "/auteurs/", "Tous") + '<div class="mh-mk">' + a.map(function (x) {
      return '<a href="/auteurs/' + esc(x.slug) + '">' + (x.photo ? '<img src="' + esc(x.photo) + '" alt="" loading="lazy">' : '<i lang="ja">' + esc((x.jp || x.name).charAt(0)) + "</i>") + "<b>" + esc(x.name) + "</b><small>" + esc(x.series.slice(0, 2).map(function (s) { return s.fr || s.t; }).join(" · ")) + (x.series.length > 2 ? " +" + (x.series.length - 2) : "") + "</small></a>";
    }).join("") + "</div></section>";
  }

  // ---------- Vues ----------
  function q() { var p = new URLSearchParams(location.search); return { vue: p.get("vue") || "", cat: p.get("cat") || "" }; }
  var PAGE = 0, LIST = [];
  function top(t) { return '<div class="mh-top"><a href="/" data-home aria-label="Retour à l\'accueil">' + I.back + "</a><h1>" + esc(t) + "</h1></div>"; }
  function render() {
    var v = q(), news = (D.news || []).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    if (v.vue === "magazines") { root.innerHTML = top("Tous les magazines") + '<div class="mh-mags">' + (D.prepub ? mags().map(magCard).join("") || '<p class="mh-note">Aucun magazine pour l\'instant.</p>' : '<p class="mh-note">Chargement…</p>') + "</div>"; return; }
    if (v.vue === "actus" || v.cat) {
      LIST = v.cat ? news.filter(function (it) { return it.cat === v.cat; }) : news; PAGE = 0;
      var chips = v.cat ? '<div class="mh-chips">' + TYPES.map(function (t) { return '<a href="/?cat=' + t[0] + '" aria-current="' + (t[0] === v.cat) + '"><i style="background:' + t[2] + '"></i>' + t[1] + "</a>"; }).join("") + "</div>" : "";
      root.innerHTML = top(v.cat ? (TL[v.cat] || ["", "Catégorie"])[1] : "Toutes les actualités") + chips + '<div class="mh-list" id="mh-list"></div><div id="mh-more" class="mh-note"></div>';
      if (!D.news) { document.getElementById("mh-more").textContent = "Chargement…"; return; }
      if (!LIST.length) { document.getElementById("mh-more").textContent = "Aucune actualité dans cette catégorie pour l'instant."; return; }
      more(); return;
    }
    // Accueil
    var feed;
    if (TAB === "toutes") feed = news.length ? news.slice(0, 2).map(cardO).join("") : '<p class="mh-note">' + (D.news ? "Pas encore d'actualité." : "Chargement…") + "</p>";
    else if (!(D.me && D.me.user)) feed = '<div class="mh-lock"><b>' + (TAB === "feed" ? "Ton fil personnalisé" : "Tes signets") + "</b><p>" + (TAB === "feed" ? "Les news des séries que tu suis, rien que pour toi." : "Retrouve toutes les news que tu as gardées.") + ' Réservé aux membres.</p><button type="button" onclick="window.FG_LOGIN && FG_LOGIN()">Devenir membre</button></div>';
    else if (TAB === "feed") feed = '<p class="mh-note">Bientôt : les news des séries que tu suis apparaîtront ici. Pour l\'instant, ajoute des news à tes signets.</p>';
    else { var ids = D.signets || []; var sig = news.filter(function (it) { return ids.indexOf(newsId(it)) >= 0; }); feed = D.signets == null ? '<p class="mh-note">Chargement…</p>' : sig.length ? sig.map(cardO).join("") : '<p class="mh-note">Aucun signet pour l\'instant : touche l\'icône signet d\'une news pour la garder ici.</p>'; }
    root.innerHTML = xtabs() + catMenu("") + '<div class="mh-feed">' + feed + "</div>" +
      (TAB === "toutes" && news.length > 2 ? '<a class="mh-all" href="/?vue=actus">Voir toutes les actualités</a>' : TAB === "toutes" && news.length ? '<a class="mh-all" href="/?vue=actus">Voir toutes les actualités</a>' : "") +
      sortiesFR() + sortiesJP() + direct() + crows() + avance() + membres() + mangakas();
  }
  // Chargement au fur et à mesure (10 par 10)
  var io = null;
  function more() {
    var box = document.getElementById("mh-list"), m = document.getElementById("mh-more"); if (!box) return;
    var part = LIST.slice(PAGE * 10, PAGE * 10 + 10);
    box.insertAdjacentHTML("beforeend", part.map(function (it, i) { return PAGE === 0 && i === 0 ? hero(it) : cardR(it); }).join(""));
    PAGE++;
    var fini = PAGE * 10 >= LIST.length;
    m.textContent = fini ? (LIST.length > 1 ? "Tu as tout vu." : "") : "Chargement…";
    if (io) io.disconnect();
    if (!fini) { io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) more(); }, { rootMargin: "400px" }); io.observe(m); }
    loadStats(part);
  }
  function loadStats(list) {
    var ids = (list || D.news || []).map(newsId); if (!ids.length) return;
    get("/api/stats?ids=" + ids.join(",")).then(function (j) {
      if (!j || !j.stats) return;
      Object.keys(j.stats).forEach(function (id) { D.stats[id] = j.stats[id]; paint(id); });
    });
    get("/api/comments?ids=" + ids.join(",")).then(function (j) {
      if (!j || !j.counts) return;
      Object.keys(j.counts).forEach(function (id) { D.cn[id] = j.counts[id]; paint(id); });
    });
  }
  function paint(id) {
    var st = D.stats[id] || {};
    root.querySelectorAll('.mh-acts[data-id="' + id + '"]').forEach(function (a) {
      a.querySelector(".a-like b").textContent = nf(st.l || 0); a.querySelector(".a-like").classList.toggle("on", !!st.ml);
      a.querySelector(".a-v b").textContent = nf(st.v || 0); a.querySelector(".a-com b").textContent = nf(D.cn[id] || 0); a.querySelector(".a-book").classList.toggle("on", !!st.mb);
    });
  }
  // Fenêtre d'un tome (sorties FR / JP) : couverture en grand, tome, date, accès à la fiche si elle existe
  function tomePop(x) {
    var b = document.getElementById("mh-tp");
    if (!b) { b = document.createElement("div"); b.id = "mh-tp"; b.className = "mh-tp"; document.body.appendChild(b); b.addEventListener("click", function (e) { if (e.target === b || e.target.closest(".mh-tpx")) { b.hidden = true; document.body.style.overflow = ""; } }); }
    var jp = x.pays === "Japon", titre = jp ? x.series : (x.fr || x.series), d = x.date ? new Date(x.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
    b.innerHTML = '<div class="mh-tpb" role="dialog" aria-label="' + esc(titre) + '"><button type="button" class="mh-tpx" aria-label="Fermer">×</button>' +
      (x.cover ? '<img src="' + esc(couv(x.cover, 600)) + '" alt="Couverture ' + esc(titre) + '">' : '<span class="mh-noimg"></span>') +
      "<small>" + (jp ? I.jp + "Sortie au Japon" : I.fr + "Sortie en France") + "</small><h2>" + esc(titre) + "</h2>" +
      (x.n != null ? "<b>Tome " + esc(x.n) + "</b>" : "") + "<p>" + esc(d) + (x.pub ? " · " + esc(x.pub) : "") + "</p>" +
      (x.fiche ? '<a class="mh-tpgo" href="/series/' + esc(slug(x.fr || x.series)) + '#tomes">Accéder à la fiche</a>' : "") + "</div>";
    b.hidden = false; document.body.style.overflow = "hidden";
  }
  function toast(t) { var x = document.createElement("div"); x.className = "mh-toast"; x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.remove(); }, 2200); }

  // ---------- Événements ----------
  root.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]");
    if (a) {
      e.preventDefault();
      if (!(D.me && D.me.user)) { if (window.FG_LOGIN) FG_LOGIN(); return; }
      var box = a.closest(".mh-acts"), id = box.dataset.id, act = a.dataset.act;
      fetch("/api/stats", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: id, act: act }) })
        .then(function (r) { return r.json(); }).then(function (j) {
          if (!j.ok) { if (window.FG_LOGIN) FG_LOGIN(); return; }
          if (!j.stored) { toast("Bientôt actif : le stockage du site n'est pas encore branché"); return; }
          var st = D.stats[id] = D.stats[id] || {};
          if (act === "like") { st.l = j.n; st.ml = j.on; } else { st.b = j.n; st.mb = j.on; if (D.signets) { D.signets = D.signets.filter(function (x) { return x !== id; }); if (j.on) D.signets.unshift(id); } toast(j.on ? "Ajouté à tes signets" : "Retiré de tes signets"); }
          paint(id);
        }).catch(function () {});
      return;
    }
    var tp = e.target.closest("[data-tome]");
    if (tp) { var x = (D.cal || []).filter(function (c) { return c.id === tp.dataset.tome; })[0]; if (x) { e.preventDefault(); tomePop(x); return; } }
    var tb = e.target.closest("[data-tab]");
    if (tb) { TAB = tb.dataset.tab; if (TAB === "signets" && D.me && D.me.user && D.signets == null) get("/api/stats?mine=b").then(function (j) { D.signets = (j && j.ids) || []; render(); }); render(); return; }
    var cb = e.target.closest(".mh-catb");
    if (cb) { var m = root.querySelector(".mh-menu"); m.hidden = !m.hidden; cb.setAttribute("aria-expanded", !m.hidden); return; }
    var c = e.target.closest("[data-cat]");
    if (c) { go(c.dataset.cat ? "/?cat=" + c.dataset.cat : "/?vue=actus"); return; }
    var l = e.target.closest('a[href^="/?"], a[data-home]');
    if (l) { e.preventDefault(); go(l.getAttribute("href")); return; }
    var mm = root.querySelector(".mh-menu"); if (mm && !mm.hidden && !e.target.closest(".mh-menu")) mm.hidden = true;
  });
  function go(u) { history.pushState(null, "", u); scrollTo(0, 0); render(); }
  addEventListener("popstate", function () { if (MQ.matches) render(); });

  // ---------- Données ----------
  // Un nouvel arrivage de données ne redessine que la vue qui en a besoin (la liste qui se charge au fil du défilement n'est pas remise à zéro).
  function refresh(k) {
    var v = q();
    if (v.vue === "magazines") { if (k === "prepub") render(); return; }
    if (v.vue === "actus" || v.cat) { if (k === "news") render(); return; }
    render();
  }
  function start() {
    render();
    get("/api/auth/me").then(function (j) { D.me = j; refresh("me"); });
    get("/api/news").then(function (j) { D.news = (j && j.items) || []; refresh("news"); loadStats(); });
    get("/api/calendrier").then(function (j) { D.cal = (j && j.items) || []; refresh("cal"); });
    get("/api/prepub").then(function (j) { D.prepub = (j && j.items) || []; refresh("prepub"); });
    get("/api/avancement").then(function (j) { D.av = j; refresh("av"); });
    get("/api/membres").then(function (j) { D.mbr = j; refresh("mbr"); });
    get("/api/auteurs").then(function (j) { D.aut = (j && j.authors) || []; refresh("aut"); });
  }
  var started = false;
  function check() { if (MQ.matches && !started) { started = true; start(); } }
  MQ.addEventListener("change", check); check();
})();
