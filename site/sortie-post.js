// Moteur de légendes « sortie / couverture / news » — SOURCE UNIQUE partagée (Will, 19/10/2026).
// Avant, le back-office (Validation) et le calendrier éditorial du QG généraient chacun leurs textes :
// la Validation faisait foi, mais le calendrier réinventait des légendes génériques. Désormais les deux
// passent par FGPost.captions(), donc X / Instagram / TikTok sont IDENTIQUES partout.
//
//   FGPost.setCats(vcats, newsCats)      → les libellés de catégorie (depuis la veille, côté admin)
//   FGPost.captions(i, rs)               → { x, ig, tt } pour une sortie / couverture / news
//   FGPost.resumeAuto(i)                 → résumé proposé quand « Résumé sortie » est vide
//   FGPost.ajouteMagX(xText, i)          → ajoute les comptes magazine d'office (ex. The Fable)
//   FGPost.postX / choixX / ligneSortie  → exposés pour les cas particuliers
//
// Règle couverture japonaise (Will, 19/10/2026) : une couverture japonaise ne se poste PAS sur Instagram
// ni TikTok (uniquement X) → ig et tt reviennent vides pour ce cas.
(function () {
  // Catégories : par défaut les deux sorties ; côté admin, FGPost.setCats() les remplace par celles de la veille.
  var VCATS = { "sortie-fr": "Sortie française", "sortie-jp": "Sortie japonaise" };
  var NEWS_CATS = ["licence-fr", "licence-jp", "couv-fr", "couv-jp", "sortie-fr", "sortie-jp", "fin", "pause", "anime", "adaptation", "bande-annonce", "tirage", "extrait", "hommage", "dedicace", "news"];

  var phrases = function (t) { return (String(t || "").replace(/\s+/g, " ").trim().match(/[^.!?…]+(?:[.!?…]+|$)(?=\s|$)/g) || []).map(function (x) { return x.trim(); }).filter(Boolean); };
  function resumeCourt(t) { return phrases(t)[0] || ""; }
  // Poids X : un lien compte pour 23 caractères.
  var poidsX = function (t) { return [].concat.apply([], String(t).replace(/(https?:\/\/)?\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|fr|jp|net|org|io)(\/\S*)?/gi, "x".repeat(23)).split("").map(function (c) { return c; })).length; };
  // Ligne « X @… » : une seule ligne (42 caractères), auteurs d'abord, éditeur français toujours présent s'il existe.
  // Ordre de priorité (Will, 22/10/2026) : l'auteur, puis l'éditeur français, puis l'éditeur japonais, puis le magazine.
  // Quand ça ne tient pas, on retire en partant de la fin (magazine d'abord). Ligne de 60 caractères au plus.
  var LIGNE_X = 60;
  function choixX(aut, fr, tient, mag, jp) {
    var vu = new Set(), prio = [];
    [].concat(aut || [], (fr || []).slice(0, 1), (jp || []).slice(0, 1), (mag || []).slice(0, 1)).filter(Boolean).forEach(function (h) { var k = h.toLowerCase(); if (!vu.has(k)) { vu.add(k); prio.push(h); } });
    var ligne = function (hs) { return hs.map(function (h) { return "@" + h; }).join(" · ").length; };
    for (var k = prio.length; k > 0; k--) { var hs = prio.slice(0, k); if (ligne(hs) <= LIGNE_X && tient(hs)) return hs; }
    return [];
  }
  function postX(i, rs) {
    var s = i.serie || {}, c = i.comptes || {}, t = i.tome || {};
    // « chez @éditeur » : le compte de l'éditeur du tome (FR ou JP), sinon l'éditeur FR de la série pour un tome français.
    var edH = (c.xEd || [])[0] || (t.pays === "France" ? (c.xFR || [])[0] : "");
    var edAt = t.pub && edH ? "@" + edH : "";
    var base = (/^couv/.test(i.catChoisie || i.cat) ? "" : catLigne(i)) + i.titre + "\n" + ligneSortie(i, edAt) + (rs ? "\n\n" + rs : "") + "\n\n↗ furyogang.com/series/" + s.slug;
    // Pas de double mention : un compte déjà cité dans « chez @Éditeur » ne revient pas dans la liste (Will, 21/10/2026).
    var sansEd = function (l) { return (l || []).filter(function (h) { return !edAt || h.toLowerCase() !== edAt.slice(1).toLowerCase(); }); };
    var hs = choixX(sansEd(c.x), sansEd(t.pays === "France" && edAt ? [] : c.xFR), function (h) { return poidsX(base + "\n" + h.map(function (x) { return "@" + x; }).join(" · ")) <= 280; }, c.xMag, sansEd(c.xJP));
    return base + (hs.length ? "\n" + hs.map(function (h) { return "@" + h; }).join(" · ") : "");
  }
  function resumeAuto(i) {
    var s = i.serie || {}, cands = [];
    for (var t of [s.resumeImg, s.resume]) { var ph = phrases(t); ph.forEach(function (_, n) { cands.push(ph.slice(0, n + 1).join(" ")); }); }
    var u = [...new Set(cands)].sort(function (a, b) { return b.length - a.length; });
    if (!u.length) return "";
    var c = i.comptes || {}, t2 = i.tome || {}, edA = t2.pub ? ((c.xEd || [])[0] || (t2.pays === "France" ? (c.xFR || [])[0] : "") || "").toLowerCase() : "", plein = choixX((c.x || []).filter(function (h) { return h.toLowerCase() !== edA; }), t2.pays === "France" && t2.pub ? [] : c.xFR, function () { return true; }, c.xMag);
    for (var k = plein.length; k >= 0; k--) {
      var ok = u.find(function (r) { var p = postX(i, r); return poidsX(p) <= 280 && (p.match(/\n(@\S.*)$/) || ["", ""])[1].split(" · ").filter(Boolean).length >= k; });
      if (ok) return ok;
    }
    return u[u.length - 1];
  }
  var tagOf = function (s) { return "#" + String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]/g, " ").split(" ").filter(Boolean).map(function (w) { return w[0].toUpperCase() + w.slice(1); }).join(""); };
  // Ligne de sortie ; « Dernier tome. » sur sa propre ligne (rien pour un premier tome).
  function ligneSortie(i, chez) {
    var t = i.tome || {}, d = i.sortie, q = "";
    var auj = d && d === new Date(Date.now() - new Date().getTimezoneOffset() * 60e3).toISOString().slice(0, 10);
    if (d && !auj) { var o = new Date(d + "T12:00:00"); q = o.toLocaleDateString("fr-FR", Object.assign({ day: "numeric", month: "long" }, o.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {})); q = q.replace(/^1 /, "1er "); }
    return (auj ? "Sortie aujourd'hui" : q ? "Sortie le " + q : "Sortie") + (chez || t.pub ? " chez " + (chez || t.pub) : "") + "." + (t.flag === "dernier" ? "\nDernier tome." : "");
  }
  // Catégorie en première ligne des posts (la même que sur le site et dans Notion) ; rien pour une sortie.
  function catLigne(i) {
    if (/^sortie/.test(i.catChoisie || i.cat)) return "";
    if ([i.catChoisie || i.cat, i.cat2Choisie !== undefined ? i.cat2Choisie : i.cat2].includes("tirage")) return ""; // « Tomes en circulation » : déjà sur le visuel (Will, 22/10/2026)
    var k = i.catChoisie || i.cat, k2 = i.cat2Choisie !== undefined ? i.cat2Choisie : i.cat2;
    return NEWS_CATS.includes(k) ? [VCATS[k]].concat(k2 && k2 !== k && NEWS_CATS.includes(k2) ? [VCATS[k2]] : []).join(" · ") + "\n" : "";
  }
  // Couverture japonaise = X uniquement, pas d'Instagram ni de TikTok (Will, 19/10/2026).
  function estCouvertureJaponaise(i) {
    var cat = i.catChoisie || i.cat || "";
    if (!/^couv/.test(cat)) return false;
    return (i.tome && i.tome.pays === "Japon") || /jp$/.test(cat);
  }
  // « Kujô l'implacable dépasse les 5 millions d'exemplaires » + « Kujô l'implacable, le manga de…, dépasse les 5 millions… » = redite.
  function sansRedite(titre, txt) {
    var mots = function (t) { return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; }); };
    var ph = phrases(txt); if (ph.length < 2) return txt;
    var mt = mots(titre), m1 = mots(ph[0]); if (mt.length < 3) return txt;
    var commun = mt.filter(function (w) { return m1.includes(w); }).length;
    return commun / mt.length >= 0.7 ? ph.slice(1).join(" ") : txt;
  }
  function captions(i, rs) {
    var s = i.serie || {}, c = i.comptes || {}, url = s.slug ? "furyogang.com/series/" + s.slug : "furyogang.com";
    var tags = [...new Set([tagOf(s.t)].concat((s.genres || []).slice(0, 2).map(tagOf)).concat(["#manga", "#FuryoGang"]).concat(/-fr$/.test(i.cat) ? ["#mangafr"] : []))].filter(function (x) { return x.length > 1; });
    if (/^(couv|sortie)/.test(i.cat) && i.tome) {
      var res = rs ? "\n\n" + rs : "";
      var jp = estCouvertureJaponaise(i);
      return {
        x: postX(i, rs),
        ig: jp ? "" : catLigne(i) + "🆕 " + i.titre + (s.jp ? " (" + s.jp + ")" : "") + "\n📅 " + ligneSortie(i) + res + "\n\n📖 Fiche complète, extraits, trailer et couverture : toutes les infos sur furyogang.com (lien en bio)." + ((c.ig || []).length ? "\n📣 " + c.ig.map(function (h) { return "@" + h; }).join(" ") : "") + "\n\n" + tags.join(" "),
        tt: jp ? "" : catLigne(i) + "🆕 " + i.titre + "\n📅 " + ligneSortie(i) + res + "\n\n📖 Fiche complète sur furyogang.com" + ((c.tt || []).length ? "\n📣 " + c.tt.map(function (h) { return "@" + h; }).join(" ") : "") + "\n\n" + [...tags.slice(0, 4), "#mangatok"].join(" "),
      };
    }
    var txt = (i.texte || "").trim();
    if (i.cat === "prepub" && i.tweet) return {
      x: i.tweet + (s.slug ? "\n↗ " + url : "") + ((c.x || []).length || (c.xFR || []).length || (c.xMag || []).length ? "\n" + choixX(c.x, c.xFR, function () { return true; }, c.xMag, c.xJP).map(function (h) { return "@" + h; }).join(" · ") : ""),
      ig: "📖 " + i.titre + (txt ? "\n\n" + txt : "") + "\n\n" + i.tweet + "\n\n📖 Toutes les infos sur furyogang.com (lien en bio).\n\n" + tags.join(" "),
      tt: "📖 " + i.titre + "\n\n" + i.tweet + "\n\n📖 Infos sur furyogang.com\n\n" + [...tags.slice(0, 4), "#mangatok"].join(" "),
    };
    // Extrait (standard Will, 27/10/2026) : « <Série> / Extrait du chapitre N », le résumé, puis les comptes (auteurs · éditeur),
    // et le lien de la news en dernier (X l'affiche en carte « Extrait » et masque l'adresse).
    if (i.cat === "extrait" || i.cat2 === "extrait") {
      var nomS = s.fr || s.t || String(i.titre || "").split(" : ")[0];
      var chM = String([i.titre, i.accroche, txt].join(" ")).match(/chapitre\s+(\d+)/i), chN = chM ? chM[1] : (/premier chapitre/i.test(txt + i.titre) ? "1" : "");
      var tete = nomS + "\n" + (chN ? "Extrait du chapitre " + chN : "Extrait");
      var slugN = String(i.fr || nomS).replace(/œ/g, "oe").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
      var lien = "https://furyogang.com/actus/" + slugN + "-" + String(i.id || "").replace(/-/g, "").slice(-8);
      var phE = phrases(sansRedite(nomS, txt)), resE = [...phE.map(function (_, n) { return phE.slice(0, n + 1).join(" "); }).reverse(), ""];
      var xE = "";
      for (var rE of resE) {
        var bE = tete + (rE ? "\n\n" + rE : "");
        var hE = choixX(c.x, c.xFR, function (l) { return poidsX(bE + "\n\n" + l.map(function (x) { return "@" + x; }).join(" · ") + "\n" + lien) <= 280; }, [], c.xJP);
        var cand = bE + (hE.length ? "\n\n" + hE.map(function (x) { return "@" + x; }).join(" · ") : "") + "\n" + lien;
        if (poidsX(cand) <= 280) { xE = cand; break; }
      }
      var resIG = txt ? "\n\n" + txt : "";
      return {
        x: xE || tete + "\n" + lien,
        ig: tete + resIG + "\n\n📖 Le lien pour le lire est sur furyogang.com (lien en bio)." + ((c.ig || []).length ? "\n\n" + c.ig.map(function (h) { return "@" + h; }).join(" · ") : "") + "\n\n" + tags.join(" "),
        tt: tete + (txt ? "\n\n" + resumeCourt(txt) : "") + "\n\n📖 Le lien pour le lire : furyogang.com (lien en bio)" + ((c.tt || []).length ? "\n" + c.tt.map(function (h) { return "@" + h; }).join(" · ") : "") + "\n\n" + [...tags.slice(0, 4), "#mangatok"].join(" "),
      };
    }
    // Titre sans le magazine ni « Nouvelle série : » d'abord (Will, 27/10/2026), puis le titre complet, puis le nom de la série.
    var titres = [...new Set([i.titre.replace(/\s*\([^)]*\)/g, "").replace(/^(nouvelle série|news|fin de série|hommage|extrait)\s*:\s*/i, "").replace(/\s+[—–-]\s+série terminée.*$/i, ""), i.titre, String(i.serie && i.serie.t || i.titre)])];
    // Pas de redite (Will, 22/10/2026) : si la 1re phrase du résumé redit le titre, on la retire des posts.
    txt = sansRedite(i.titre, txt);
    var ph = phrases(txt), resumes = [...ph.map(function (_, n) { return ph.slice(0, n + 1).join(" "); }).reverse(), ""];
    var nbC = ((c.x || []).length + (c.xFR || []).length + (c.xMag || []).length) ? 1 : 0;
    // L'auteur d'abord (Will, 22/10/2026) : on raccourcit le résumé plutôt que de perdre le compte de l'auteur.
    var autX = (c.x || []).map(function (h) { return h.toLowerCase(); }), aAut = function (l) { return l.some(function (h) { return autX.includes(h.toLowerCase()); }); };
    var xBase = "", hs = [];
    trouve: for (var min of (autX.length ? [2, nbC, 0] : [nbC, 0])) for (var t of titres) for (var r of resumes) {  // titre complet d'abord, quitte à raccourcir le résumé
      // Ligne vide entre le titre et le texte ; « Plus d'infos sur le site 👇 » au-dessus du lien quand ça tient (Will, 27/10/2026).
      var b = catLigne(i) + t + (r ? "\n\n" + r : "") + "\n\nPlus d'infos sur le site 👇\n" + url;
      if (poidsX(b) > 280) b = catLigne(i) + t + (r ? "\n\n" + r : "") + "\n\n↗ " + url;
      if (poidsX(b) > 280) continue;
      var h = choixX(c.x, c.xFR, function (l) { return poidsX(b + "\n" + l.map(function (x) { return "@" + x; }).join(" · ")) <= 280; }, c.xMag, c.xJP);
      if (h.length && poidsX(b + "\n" + h.map(function (x) { return "@" + x; }).join(" · ")) > 280) h = [];
      if (min === 2 ? aAut(h) : h.length >= min) { xBase = b; hs = h; break trouve; }
    }
    if (!xBase) xBase = catLigne(i) + titres[titres.length - 1] + "\n\n↗ " + url;
    var igL = (c.ig || []).length ? "\n📣 " + c.ig.map(function (h) { return "@" + h; }).join(" ") : "", ttL = (c.tt || []).length ? "\n📣 " + c.tt.map(function (h) { return "@" + h; }).join(" ") : "";
    return {
      x: xBase + (hs.length ? "\n" + hs.map(function (h) { return "@" + h; }).join(" · ") : ""),
      ig: catLigne(i) + "🆕 " + i.titre + (txt ? "\n\n" + txt : "") + "\n\n📖 Toutes les infos sur furyogang.com (lien en bio)." + igL + "\n\n" + tags.join(" "),
      tt: catLigne(i) + "🆕 " + i.titre + (txt ? "\n\n" + resumeCourt(txt) : "") + "\n\n📖 Infos sur furyogang.com" + ttL + "\n\n" + [...tags.slice(0, 4), "#mangatok"].join(" "),
    };
  }
  // Comptes magazine ajoutés d'office sur la ligne X de certaines séries. The Fable → Young Magazine.
  var MAG_X = [{ test: function (s) { return /fable/i.test(((s && s.slug) || "") + " " + ((s && s.t) || "")); }, hs: ["magazine_young", "yanmagaweb"] }];
  function magHandlesX(serie) { for (var r of MAG_X) if (r.test(serie)) return r.hs; return []; }
  function ajouteMagX(xText, i) {
    var extra = magHandlesX(i.serie); if (!extra.length || !xText) return xText;
    var lines = xText.split("\n");
    var li = -1; for (var k = lines.length - 1; k >= 0; k--) if (/^@\S/.test(lines[k])) { li = k; break; }
    var present = new Set((li >= 0 ? lines[li] : "").split("·").map(function (x) { return x.trim().replace(/^@/, "").toLowerCase(); }).filter(Boolean));
    var add = extra.filter(function (h) { return !present.has(h.toLowerCase()); });
    if (!add.length) return xText;
    if (li >= 0) { lines[li] += " · " + add.map(function (h) { return "@" + h; }).join(" · "); return lines.join("\n"); }
    return xText + "\n" + add.map(function (h) { return "@" + h; }).join(" · ");
  }

  window.FGPost = {
    setCats: function (vcats, newsCats) { if (vcats) VCATS = vcats; if (newsCats) NEWS_CATS = newsCats; },
    captions: captions, resumeAuto: resumeAuto, ajouteMagX: ajouteMagX, sansRedite: sansRedite,
    postX: postX, choixX: choixX, ligneSortie: ligneSortie, catLigne: catLigne,
    poidsX: poidsX, phrases: phrases, resumeCourt: resumeCourt, tagOf: tagOf,
    estCouvertureJaponaise: estCouvertureJaponaise,
  };
})();
