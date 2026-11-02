// Lecture traduite (privé, admin) : bibliothèque des séries, lecteur page par page, ajout au carnet /flashcard.
(function () {
  var API = "/api/admin/prive?f=";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var get = function (f) { return fetch(API + encodeURIComponent(f), { credentials: "same-origin", cache: "no-store" }).then(function (r) { if (r.status === 404) return null; if (!r.ok) throw new Error(r.status); return r.json(); }); };
  var put = function (f, o) { return fetch(API + encodeURIComponent(f), { method: "PUT", credentials: "same-origin", body: JSON.stringify(o) }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
  var IDX = [], S = null, CH = null, PAGES = [], pi = 0, PICKS = { lexique: {}, questions: [] }, CARDS = null;
  var F_PICKS = "prive/lecture/picks.json", F_CARDS = "prive/flashcards/cards.json";

  function base() { return "prive/lecture/" + S.id + "/"; }
  function pageImg(p) { return base() + CH.dir + "/" + p.file; }
  function savePicks() { put(F_PICKS, PICKS).then(dock).catch(function () { $("dcount").textContent = "Non enregistré (hors ligne)"; }); }

  // ---------- Bibliothèque ----------
  function showLib() {
    $("readv").hidden = true; $("libv").hidden = false; document.title = "Lecture · FuryoGang";
    var h = '<h1>Lecture</h1><p class="sub">Les chapitres traduits, réservés à toi. Rien ici n’est public.</p>' +
      '<div class="links"><a href="/flashcard/">Carnet de flashcards →</a></div>';
    if (!IDX.length) h += '<div class="serie"><p class="sub">Aucun chapitre pour l’instant.</p></div>';
    IDX.forEach(function (s, i) {
      h += '<div class="serie"><div><h2>' + esc(s.titre) + '</h2><div class="jp">' + esc(s.titre_jp || "") + '</div><p class="sub">' + esc([s.auteur, s.editeur].filter(Boolean).join(" · ")) + '</p></div><div class="chaps">' +
        s.chapitres.map(function (c) { return '<a href="#' + esc(s.id) + '/' + esc(c.id) + '" class="' + (c.fini ? "fin" : "") + '"><b>' + esc(c.titre) + '</b><span>' + c.n + ' pages' + (c.fini ? ' · lu' : '') + '</span></a>'; }).join("") + '</div></div>';
    });
    $("libv").innerHTML = h;
  }

  // ---------- Lecteur ----------
  function openChapter(sid, cid, page) {
    S = IDX.filter(function (s) { return s.id === sid; })[0]; if (!S) { location.hash = ""; return; }
    CH = S.chapitres.filter(function (c) { return c.id === cid; })[0]; if (!CH) { location.hash = ""; return; }
    $("libv").hidden = true; $("readv").hidden = false;
    $("stitle").textContent = S.titre_jp || S.titre; $("ssub").textContent = [S.titre, S.auteur, S.editeur].filter(Boolean).join(" · ");
    $("ch").innerHTML = S.chapitres.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.titre) + '</option>'; }).join(""); $("ch").value = CH.id;
    document.title = S.titre + " · " + CH.titre;
    $("side").innerHTML = '<div class="empty">Chargement du chapitre…</div>';
    get(base() + CH.id + ".json").then(function (d) {
      PAGES = d || []; pi = 0;
      if (page != null) { var k = PAGES.findIndex(function (p) { return String(p.page) === String(page); }); if (k >= 0) pi = k; }
      render();
    });
  }
  function strip() {
    $("strip").innerHTML = PAGES.map(function (p, i) { return '<button class="' + (i === pi ? "on" : "") + " " + ((p.lexique || []).length ? "has" : "") + '" data-i="' + i + '">' + esc(p.label != null ? p.label : p.page) + '</button>'; }).join("");
    var on = $("strip").querySelector(".on"); if (on) on.scrollIntoView({ block: "nearest", inline: "center" });
  }
  function inCarnet(jp, page) {
    return (CARDS || []).some(function (c) { return c.ref && c.ref.serie === S.id && c.ref.chap === CH.id && c.ref.page === page && (c.jp === jp || (c.phrase && c.phrase.jp === jp && c.type === "phrase")); });
  }
  function render() {
    var p = PAGES[pi]; if (!p) return;
    $("img").src = API + encodeURIComponent(pageImg(p));
    var last = PAGES[PAGES.length - 1];
    $("pn").textContent = (p.page === 0 ? "TITRE" : "P. " + p.page) + " / " + last.page;
    $("prev").disabled = pi === 0; $("next").disabled = pi === PAGES.length - 1;
    var h = "";
    if (p.resume) h += '<div class="resume"><b>' + (p.page === 0 ? "Page de titre" : "Page " + p.page) + '</b>' + esc(p.resume) + '</div>';
    if (!(p.bulles || []).length) h += '<div class="empty">Pas de texte sur cette page.</div>';
    (p.bulles || []).forEach(function (b, bi) {
      var sfx = b.qui === "SFX", on = b.jp && inCarnet(b.jp, p.page);
      h += '<div class="b' + (sfx ? " sfx" : "") + '"><div class="who ' + esc(b.qui) + '">' + esc(b.qui) + '</div><div class="fr">' + esc(b.fr) + '</div>' +
        (b.jp ? '<div class="jpl">' + esc(b.jp) + '</div>' : '') + (b.kana ? '<div class="kn">' + esc(b.kana) + '</div>' : '') + (b.note ? '<div class="nt">' + esc(b.note) + '</div>' : '') +
        (sfx || !b.jp ? '' : '<button class="add' + (on ? ' on' : '') + '" data-bi="' + bi + '">' + (on ? '✓ Dans mon carnet · en ajouter' : '＋ Carnet perso') + '</button>') + '</div>';
    });
    if ((p.lexique || []).length) {
      h += '<div class="lx"><h3>Pour le lexique<small>coche ce que tu gardes</small></h3>';
      p.lexique.forEach(function (l, li) {
        var key = S.id + "|" + CH.id + "|" + p.page + "|" + l.mot, on = inCarnet(l.mot, p.page);
        h += '<label class="lxi"><input type="checkbox" data-k="' + esc(key) + '" ' + (PICKS.lexique[key] ? "checked" : "") + '><div class="m">' + esc(l.mot) + '<small>' + esc(l.kana) + '</small>' + (l.type ? '<span class="ty">' + esc(l.type) + '</span>' : '') + '</div><div class="s">' + esc(l.sens) + '</div>' + (l.pourquoi ? '<div class="w">' + esc(l.pourquoi) + '</div>' : '') + '</label>' +
          '<button class="add' + (on ? ' on' : '') + '" style="margin:-4px 0 6px 38px" data-li="' + li + '">' + (on ? '✓ Dans mon carnet' : '＋ Carnet perso') + '</button>';
      });
      h += '</div>';
    }
    var qs = (PICKS.questions || []).filter(function (q) { return q.serie === S.id && q.chap === CH.id && q.page === p.page; });
    h += '<div class="ask"><h3>Une question pour Claude<small>un mot, une phrase, un doute sur cette page</small></h3><textarea id="qtxt" placeholder="Ex. : c’est qui l’homme à lunettes ?"></textarea><div class="row"><button id="qsend">Enregistrer pour Claude</button><span class="sent" id="qok"></span></div>' +
      (qs.length ? '<div class="qs">' + qs.map(function (q) { return '<div>' + esc(q.texte) + '</div>'; }).join("") + '</div>' : '') + '</div>';
    if (pi === PAGES.length - 1) h += '<div class="resume"><b>Fin du chapitre</b>Dis-le à Claude dans la conversation : il te demandera s’il peut retirer ce chapitre de son côté.</div>';
    $("side").innerHTML = h;
    $("side").querySelectorAll("[data-bi]").forEach(function (btn) { btn.onclick = function () { openAdd(p, p.bulles[+btn.dataset.bi], null); }; });
    $("side").querySelectorAll("[data-li]").forEach(function (btn) { btn.onclick = function () { var l = p.lexique[+btn.dataset.li]; openAdd(p, bubbleFor(p, l.mot), l); }; });
    $("side").querySelectorAll("input[data-k]").forEach(function (i) { i.onchange = function () { if (i.checked) PICKS.lexique[i.dataset.k] = new Date().toISOString().slice(0, 10); else delete PICKS.lexique[i.dataset.k]; savePicks(); }; });
    $("qsend").onclick = function () {
      var v = $("qtxt").value.trim(); if (!v) return;
      PICKS.questions = (PICKS.questions || []).concat({ serie: S.id, chap: CH.id, page: p.page, texte: v, at: new Date().toISOString() });
      put(F_PICKS, PICKS).then(function () { $("qok").textContent = "Enregistré. Dis « regarde mes questions » à Claude."; $("qtxt").value = ""; render(); }).catch(function () { $("qok").textContent = "Hors ligne : copie ton texte dans la conversation."; });
    };
    strip(); dock();
    try { history.replaceState(null, "", "#" + S.id + "/" + CH.id + "/" + p.page); } catch (e) {}
  }
  function bubbleFor(p, mot) { return (p.bulles || []).filter(function (b) { return b.jp && b.jp.indexOf(mot) >= 0; })[0] || null; }
  // Compteurs du chapitre ouvert (pas de toute la bibliothèque) : mots cochés pour le lexique, cartes ajoutées au carnet, questions.
  function dock() {
    if (!S || !CH) return;
    var pre = S.id + "|" + CH.id + "|";
    var nl = Object.keys(PICKS.lexique || {}).filter(function (k) { return k.indexOf(pre) === 0; }).length;
    var nc = (CARDS || []).filter(function (c) { return c.ref && c.ref.serie === S.id && c.ref.chap === CH.id; }).length;
    var nq = (PICKS.questions || []).filter(function (q) { return q.serie === S.id && q.chap === CH.id; }).length;
    $("dcount").textContent = CH.titre + " · Lexique " + nl + " · Carnet " + nc + " · Questions " + nq;
  }

  // ---------- Ajouter au carnet : le mot, ses kanji, ou la phrase (la phrase et la planche restent toujours jointes) ----------
  var ADD = null;
  var isKanji = function (ch) { return /[一-鿿㐀-䶿々]/.test(ch); };
  function openAdd(p, b, lex) {
    var words = (p.lexique || []).filter(function (l) { return b && b.jp && b.jp.indexOf(l.mot) >= 0; });
    if (lex && words.indexOf(lex) < 0) words.unshift(lex);
    ADD = { p: p, b: b, words: words, word: lex ? lex.mot : (words[0] ? words[0].mot : ""), mode: lex ? "mot" : (words.length ? "mot" : "phrase"), kanji: {} };
    drawAdd(); $("sheet").hidden = false;
  }
  function lexFor(w) { return (ADD.words || []).filter(function (l) { return l.mot === w; })[0] || ((ADD.p.lexique || []).filter(function (l) { return l.mot === w; })[0]) || null; }
  function drawAdd() {
    var A = ADD, b = A.b || {}, w = A.word, ks = [...(w || "")].filter(isKanji);
    if (A.mode === "kanji" && !ks.length) A.mode = w ? "mot" : "phrase";
    var lx = lexFor(w);
    var h = '<h3>Ajouter au carnet</h3>';
    if (b.jp) h += '<div class="bub"><div class="j">' + esc(b.jp) + '</div>' + (b.kana ? '<div class="r">' + esc(b.kana) + '</div>' : '') + '<div class="f">' + esc(b.fr || "") + '</div></div>';
    h += '<span class="lbl">LE MOT</span>';
    if (A.words.length) h += '<div class="chips">' + A.words.map(function (l, i) { return '<button data-w="' + i + '" class="' + (l.mot === w ? "on" : "") + '">' + esc(l.mot) + '</button>'; }).join("") + '</div>';
    h += '<input id="aw" lang="ja" autocomplete="off" placeholder="Ou écris le mot de la bulle (kanji)…" value="' + esc(w) + '">';
    h += '<span class="lbl">QU’EST-CE QUE TU GARDES ?</span><div class="opts">' +
      '<button data-m="mot" class="' + (A.mode === "mot" ? "on" : "") + '"' + (w ? "" : " disabled") + '><b>Le mot</b><span class="jp">' + esc(w || "—") + '</span></button>' +
      '<button data-m="kanji" class="' + (A.mode === "kanji" ? "on" : "") + '"' + (ks.length ? "" : " disabled") + '><b>Les kanji</b><span class="jp">' + esc(ks.join("") || "aucun") + '</span></button>' +
      '<button data-m="phrase" class="' + (A.mode === "phrase" ? "on" : "") + '"' + (b.jp ? "" : " disabled") + '><b>La phrase</b><span>en entier</span></button></div>';
    if (A.mode === "kanji") {
      if (!Object.keys(A.kanji).length) ks.forEach(function (k) { A.kanji[k] = 1; });
      h += '<div class="chips">' + ks.map(function (k) { return '<button data-k="' + esc(k) + '" class="' + (A.kanji[k] ? "on" : "") + '">' + esc(k) + '</button>'; }).join("") + '</div>';
    }
    var pv = A.mode === "phrase" ? { t: "PHRASE", k: b.jp, s: b.fr } : A.mode === "kanji" ? { t: "KANJI × " + Object.keys(A.kanji).length, k: Object.keys(A.kanji).join(" "), s: "Claude complète la lecture et le sens de chaque kanji" } : { t: "MOT", k: w, s: lx ? (lx.kana + " · " + lx.sens) : "Claude complète la lecture et le sens" };
    h += '<div class="prev"><span class="t">LA CARTE · ' + esc(pv.t) + '</span><span class="k">' + esc(pv.k || "") + '</span><span style="font-size:14px">' + esc(pv.s || "") + '</span>' +
      '<small>Toujours jointes : la phrase entière + sa traduction, et la planche · ' + esc(S.titre.split(" ~")[0]) + ' · ' + esc(CH.titre.toLowerCase()) + ' · p. ' + esc(A.p.page) + '</small></div>' +
      '<div class="row2"><button id="acancel">Annuler</button><button class="go" id="asave">Ajouter au carnet</button></div>';
    $("sh").innerHTML = h;
    $("sh").querySelectorAll("[data-w]").forEach(function (x) { x.onclick = function () { A.word = A.words[+x.dataset.w].mot; A.kanji = {}; if (A.mode === "phrase") A.mode = "mot"; drawAdd(); }; });
    $("sh").querySelectorAll("[data-m]").forEach(function (x) { x.onclick = function () { A.mode = x.dataset.m; drawAdd(); }; });
    $("sh").querySelectorAll("[data-k]").forEach(function (x) { x.onclick = function () { if (A.kanji[x.dataset.k]) delete A.kanji[x.dataset.k]; else A.kanji[x.dataset.k] = 1; drawAdd(); }; });
    var aw = $("aw"); aw.onchange = function () { A.word = aw.value.trim(); A.kanji = {}; if (A.word && A.mode === "phrase") A.mode = "mot"; drawAdd(); };
    $("acancel").onclick = closeAdd;
    $("asave").onclick = saveAdd;
  }
  function closeAdd() { $("sheet").hidden = true; ADD = null; }
  function saveAdd() {
    var A = ADD, b = A.b || {}, now = new Date().toISOString().slice(0, 10);
    var ref = { manga: S.titre + (S.titre_jp ? " (" + S.titre_jp + ")" : ""), auteur: S.auteur || "", editeur: S.editeur || "", chapitre: CH.n_chap || CH.titre.replace(/\D+/g, ""), page: A.p.page, img: pageImg(A.p), serie: S.id, chap: CH.id };
    var phrase = b.jp ? { jp: b.jp, kana: b.kana || "", fr: b.fr || "" } : null;
    var id = function () { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
    var neu = [];
    if (A.mode === "phrase") neu.push({ id: id(), type: "phrase", jp: b.jp, kana: b.kana || "", sens: b.fr || "", phrase: phrase, ref: ref, ajout: now });
    else if (A.mode === "kanji") Object.keys(A.kanji).forEach(function (k) { neu.push({ id: id(), type: "kanji", jp: k, kana: "", sens: "", todo: true, mot: A.word, phrase: phrase, ref: ref, ajout: now }); });
    else { var lx = lexFor(A.word); neu.push(lx ? { id: id(), type: "mot", jp: A.word, kana: lx.kana || "", sens: lx.sens || "", phrase: phrase, ref: ref, ajout: now } : { id: id(), type: "mot", jp: A.word, kana: "", sens: "", todo: true, phrase: phrase, ref: ref, ajout: now }); }
    if (!neu.length || !neu[0].jp) return;
    $("asave").textContent = "Ajout…";
    get(F_CARDS).then(function (cur) {
      CARDS = (Array.isArray(cur) ? cur : []).concat(neu);
      return put(F_CARDS, CARDS);
    }).then(function () { closeAdd(); render(); }).catch(function () { $("asave").textContent = "Échec, réessaie"; });
  }
  $("sheet").onclick = function (e) { if (e.target === $("sheet")) closeAdd(); };

  // ---------- Contrôles ----------
  $("prev").onclick = function () { if (pi > 0) { pi--; render(); window.scrollTo({ top: 0 }); } };
  $("next").onclick = function () { if (pi < PAGES.length - 1) { pi++; render(); window.scrollTo({ top: 0 }); } };
  $("strip").onclick = function (e) { var b = e.target.closest("button"); if (b) { pi = +b.dataset.i; render(); window.scrollTo({ top: 0 }); } };
  $("ch").onchange = function () { location.hash = S.id + "/" + $("ch").value; };
  $("tjp").onclick = function () { document.body.classList.toggle("nojp"); $("tjp").classList.toggle("on"); };
  $("tkn").onclick = function () { document.body.classList.toggle("nokana"); $("tkn").classList.toggle("on"); };
  document.addEventListener("keydown", function (e) { if (ADD || /INPUT|TEXTAREA/.test((e.target || {}).tagName || "")) return; if (e.key === "ArrowRight") $("next").click(); if (e.key === "ArrowLeft") $("prev").click(); if (e.key === "Escape") $("lb").classList.remove("on"); });
  // Toucher la planche : moitié droite = suivante, moitié gauche = précédente (pratique sur tablette). La loupe agrandit.
  $("img").onclick = function (e) {
    var r = $("img").getBoundingClientRect();
    if (e.clientX - r.left > r.width / 2) $("next").click(); else $("prev").click();
  };
  $("zoom").onclick = function () { $("lbi").src = $("img").src; $("lb").classList.add("on"); };
  $("lb").onclick = function () { $("lb").classList.remove("on"); };

  function route() {
    var m = (location.hash || "").slice(1).split("/");
    if (m[0] && m[1]) { if (!S || S.id !== m[0] || !CH || CH.id !== m[1]) openChapter(m[0], m[1], m[2]); }
    else { S = null; CH = null; showLib(); }
  }
  window.addEventListener("hashchange", route);
  Promise.all([get("prive/lecture/index.json"), get(F_PICKS).catch(function () { return null; }), get(F_CARDS).catch(function () { return null; })]).then(function (r) {
    IDX = Array.isArray(r[0]) ? r[0] : [];
    PICKS = r[1] && typeof r[1] === "object" ? r[1] : { lexique: {}, questions: [] }; PICKS.lexique = PICKS.lexique || {}; PICKS.questions = PICKS.questions || [];
    CARDS = Array.isArray(r[2]) ? r[2] : [];
    route();
  }).catch(function () { $("libv").innerHTML = '<p class="sub">Impossible de charger. Vérifie que tu es connecté en admin.</p>'; });
})();
