// Carte de partage (og:image) des actualités — format paysage 1200×630 pour les aperçus de liens (X, Discord, WhatsApp…).
// Design « dossier » : à gauche le logo, un badge catégorie + date, le titre et l'accroche ; à droite la couverture.
// Validé par Will le 20/10/2026 (même style que Hell Dogs / Bumpoor). Source unique, utilisée par le back-office.
//   FG_OGACTU.card(d, embedded?) → HTML de la carte
//   FG_OGACTU.png(d) → data URL PNG 1200×630
//   d = { titre, cat, date, desc, cover }   (cat = libellé du badge ; date = ISO "2026-10-19")
(function () {
  var SIZE = [1200, 630];
  var CSS = [
    '.oga{width:1200px;height:630px;position:relative;overflow:hidden;background:#000;font-family:"FGInter",sans-serif;line-height:normal;letter-spacing:normal;text-align:left;color:#fff}',
    '.oga *{box-sizing:border-box}',
    '.oga .oga-glow{position:absolute;right:-120px;top:50%;transform:translateY(-50%);width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,0) 62%)}',
    '.oga .oga-cover{position:absolute;right:74px;top:50%;height:548px;transform:translateY(-50%) rotate(2.4deg);border:9px solid #fff;border-radius:6px;box-shadow:0 30px 72px rgba(0,0,0,.65);object-fit:cover;background:#222;z-index:2}',
    '.oga .oga-left{position:absolute;left:64px;top:50%;transform:translateY(-50%);width:600px;z-index:3}',
    '.oga .oga-logo{width:250px;display:block;margin-bottom:30px}',
    '.oga .oga-badge{display:inline-block;background:#E0123F;color:#fff;font-family:"FGAntonio",sans-serif;font-weight:700;font-size:30px;line-height:1;text-transform:uppercase;letter-spacing:.07em;padding:11px 20px 9px;border-radius:8px}',
    '.oga .oga-title{font-family:"FGAntonio",sans-serif;font-weight:700;font-size:96px;line-height:.96;letter-spacing:.01em;color:#fff;text-transform:uppercase;margin:22px 0 0;overflow-wrap:anywhere}',
    '.oga .oga-title.oga-s{font-size:76px}.oga .oga-title.oga-xs{font-size:60px}',
    /* Extrait (Will, 26/10/2026, « Extrait 1 ») : couverture + planche à gauche, titre géant, pastille « Lis le chapitre 1 », auteurs, éditeur */
    '.oge{width:1200px;height:630px;position:relative;overflow:hidden;background:#0c0c0e;font-family:"FGInter",sans-serif;line-height:normal;text-align:left;color:#F2EFE9}',
    '.oge *{box-sizing:border-box}',
    '.oge .bg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:grayscale(1) blur(2px);opacity:.22}',
    '.oge .sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,12,14,.35),rgba(12,12,14,.92) 55%)}',
    '.oge .im{position:absolute;object-fit:cover;border:6px solid #fff;border-radius:3px;box-shadow:0 26px 60px rgba(0,0,0,.75);background:#222}',
    '.oge .lg{position:absolute;right:56px;top:46px;height:40px}',
    '.oge .tx{position:absolute;left:632px;right:44px;top:50%;transform:translateY(-50%)}',
    '.oge .t{font-family:"FGAntonio",sans-serif;font-weight:700;text-transform:uppercase;line-height:.88;font-size:116px;white-space:nowrap}',
    '.oge .t.s{font-size:90px}.oge .t.xs{font-size:72px;white-space:normal}',
    '.oge .pl{display:inline-block;margin-top:22px;background:#BC002D;color:#fff;font-family:"FGAntonio",sans-serif;font-weight:700;font-size:34px;letter-spacing:.04em;text-transform:uppercase;padding:10px 26px 12px;border-radius:6px;text-align:center}',
    '.oge .au{font-family:"FGAntonio",sans-serif;font-weight:700;font-size:26px;letter-spacing:.06em;text-transform:uppercase;margin-top:26px}',
    '.oge .sr{font-weight:500;font-size:21px;color:#cfcbc4;margin-top:10px}.oge .sr b{color:#fff}',
    '.oge .fl{display:inline-block;width:30px;height:20px;vertical-align:-3px;margin-left:8px;border-radius:3px;background:linear-gradient(90deg,#0055A4 0 33%,#fff 33% 66%,#EF4135 66%)}',
    '.oge .fl.jp{background:#fff;position:relative}.oge .fl.jp:after{content:"";position:absolute;left:50%;top:50%;width:11px;height:11px;margin:-5.5px;border-radius:50%;background:#BC002D}',
    '.oga .oga-desc{font-family:"FGInter",sans-serif;font-weight:500;font-size:34px;line-height:1.4;color:#e9e9ec;margin-top:22px;max-width:560px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}'
  ].join("\n");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var couv = function (u) { return /^https?:/.test(u || "") ? "/api/couv?u=" + encodeURIComponent(u) : (u || ""); };
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var dateFR = function (iso) { if (!iso) return ""; var p = String(iso).split("-"); if (p.length < 3) return ""; return Number(p[2]) + " " + (MOIS[Number(p[1]) - 1] || "") + " " + p[0]; };

  var style = document.createElement("style");
  style.textContent = '@font-face{font-family:"FGAntonio";src:url(/fonts/Antonio.ttf) format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(/fonts/Inter.ttf) format("truetype");font-weight:100 900}\n' + CSS;
  document.head.appendChild(style);

  var cache = {};
  function dataUrl(url) {
    if (!url) return Promise.resolve(null);
    if (!cache[url]) cache[url] = fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      return new Promise(function (ok) { var f = new FileReader(); f.onload = function () { ok(f.result); }; f.readAsDataURL(b); });
    }).catch(function () { return null; });
    return cache[url];
  }
  function fonts() {
    return Promise.all([dataUrl("/fonts/Antonio.ttf"), dataUrl("/fonts/Inter.ttf")]).then(function (u) {
      return '@font-face{font-family:"FGAntonio";src:url(' + u[0] + ') format("truetype");font-weight:100 700}\n@font-face{font-family:"FGInter";src:url(' + u[1] + ') format("truetype");font-weight:100 900}\n';
    });
  }

  function card(d, embedded) {
    var cover = embedded || couv(d.cover);
    var t = String(d.titre || "");
    var cls = t.length > 22 ? " oga-xs" : t.length > 15 ? " oga-s" : "";
    var badge = [String(d.cat || "News").toUpperCase(), dateFR(d.date)].filter(Boolean).join(" · ");
    return '<div class="oga">' +
      '<div class="oga-glow"></div>' +
      (cover ? '<img class="oga-cover" src="' + cover + '" alt="">' : '') +
      '<div class="oga-left">' +
        '<img class="oga-logo" src="/img/social/logo-blanc.png" alt="FuryoGang">' +
        '<span class="oga-badge">' + esc(badge) + '</span>' +
        '<div class="oga-title' + cls + '">' + esc(t) + '</div>' +
        (d.desc ? '<div class="oga-desc">' + esc(d.desc) + '</div>' : '') +
      '</div></div>';
  }

  // d = { type: "extrait", titre, cover, cover2, cta, auteurs, editeur, quand, pays }
  // e = images déjà en data URL (export) : [couverture, 2e visuel ou planche 1, planche 2]
  function cardExtrait(d, e1, e2, e3) {
    var pl = (d.planches || []).filter(Boolean), c1 = e1 || couv(d.cover), c2 = e2 || couv(pl[0] || d.cover2), c3 = pl[1] ? (e3 || couv(pl[1])) : "", t = String(d.titre || ""), cls = t.length > 14 ? " xs" : t.length > 10 ? " s" : "";
    return '<div class="oge">' + (c2 || c1 ? '<div class="bg" style="background-image:url(\'' + (c2 || c1) + '\')"></div>' : '') + '<div class="sh"></div>' +
      (c3 ? '<img class="im" src="' + c3 + '" alt="" style="left:300px;top:96px;width:250px;height:400px;transform:rotate(9deg);object-position:center 30%">' : '') +
      (c2 ? '<img class="im" src="' + c2 + '" alt="" style="left:' + (c3 ? 215 : 250) + 'px;top:70px;width:270px;height:430px;transform:rotate(' + (c3 ? 4 : 5) + 'deg);object-position:center 30%">' : '') +
      (c1 ? '<img class="im" src="' + c1 + '" alt="" style="left:' + (c2 ? 70 : 140) + 'px;top:58px;width:330px;height:470px;transform:rotate(-3deg)">' : '') +
      '<img class="lg" src="/img/logo-furyogang.png" alt="FuryoGang">' +
      '<div class="tx"><div class="t' + cls + '">' + esc(t) + '</div>' +
      '<div class="pl">' + esc(String(d.cta || "Lis l'extrait").replace(/\s*[→>]+\s*$/, "")) + '</div>' +
      (d.auteurs ? '<div class="au">' + esc(d.auteurs) + '</div>' : '') +
      ((d.editeur || d.quand) ? '<div class="sr">' + (d.editeur ? 'Extrait sur <b>' + esc(d.editeur) + '</b>' : 'Extrait') + (d.quand ? ' · ' + esc(d.quand) : '') + '<span class="fl' + (d.pays === "Japon" ? " jp" : "") + '"></span></div>' : '') +
      '</div></div>';
  }
  var MOISL = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var jourL = function (iso) { var p = String(iso || "").split("-"); return p.length < 3 ? "" : (+p[2] === 1 ? "1er" : +p[2]) + " " + MOISL[+p[1] - 1]; };
  var nomEd = function (u) { var h = String(u || "").replace(/^https?:\/\/(www\.)?/, "").split("/")[0]; var M = { "kana.fr": "Kana", "pika.fr": "Pika", "glenat.com": "Glénat", "ki-oon.com": "Ki-oon", "kurokawa.fr": "Kurokawa", "akata.fr": "Akata", "mangetsu.fr": "Mangetsu", "meian.fr": "Meian", "vega-livres.fr": "Vega-Dupuis", "kaze.fr": "Kaze", "komikku-editions.fr": "Komikku", "soleilprod.com": "Soleil" }; return M[h] || ""; };
  // Données de la carte « Extrait » à partir d'une news de la veille (back-office ou studio) : fiche série publique /api/serie.
  function donneesExtrait(i) {
    var slug = i.serie && i.serie.slug;
    return (slug ? fetch("/api/serie?s=" + encodeURIComponent(slug)).then(function (r) { return r.json(); }).catch(function () { return {}; }) : Promise.resolve({})).then(function (d) {
      var s = d.serie || {}, eds = d.editions || [], jp = eds.find(function (e) { return e.pays === "Japon"; }), fr = eds.find(function (e) { return e.pays === "France"; });
      var t1 = function (e) { var t = e && (e.tomes || []).filter(function (x) { return x.cover; }).sort(function (a, b) { return (a.n || 0) - (b.n || 0); }); return t && t.length ? t : []; };
      var tj = t1(jp), tf = t1(fr), txt = [i.titre, i.texte, i.accroche].join(" ");
      var C = i.carte || {}, propre = function (u) { return u && !/\/api\/ogcard\//.test(u) ? u : ""; };
      // Par défaut la couverture française du tome 1 (les extraits sont en français), sinon la japonaise (Will, 26/10/2026).
      var cover = propre(C.couv) || (tf[0] && tf[0].cover) || (tj[0] && tj[0].cover) || propre(i.imageChoisie) || (i.serie && i.serie.cover) || "";
      var planches = (C.planches || []).filter(Boolean).slice(0, 2);
      var cover2 = planches.length ? "" : ((tj[0] && tj[0].cover !== cover ? tj[0].cover : "") || (tf[0] && tf[0].cover !== cover ? tf[0].cover : "") || (tj[1] && tj[1].cover) || "");
      var ch = (txt.match(/chapitre\s+(\d+)/i) || [])[1] || (/premier chapitre|chapitre 1\b/i.test(txt) ? "1" : "");
      var aut = []; [s.scen, s.dess].forEach(function (a) { String(a || "").split(/\s*[,&]\s*/).forEach(function (x) { x = x.trim(); if (x && aut.indexOf(x) < 0) aut.push(x); }); });
      var auj = new Date().toISOString().slice(0, 10), pays = fr || !jp ? "France" : "Japon";
      var d1 = s.t1FR && s.t1FR >= auj ? s.t1FR : "", m = txt.match(/tome 1[^.]*?le (\d{1,2}(?:er)? [a-zéû]+)/i);
      return { type: "extrait", titre: s.fr || s.t || (i.serie && (i.serie.fr || i.serie.t)) || i.titre, cover: cover, cover2: cover2, planches: planches,
        cta: C.cta || (ch ? "Lis le chapitre " + ch : "Lis l'extrait"), auteurs: aut.join(" · "),
        editeur: C.editeur || nomEd(i.src) || nomEd(i.relais) || nomEd(s.extraitFR) || String(s.pubFR || "").replace(/\s*\(.*$/, "").split(",").pop().trim(),
        lire: C.lire || "", quand: C.quand != null && C.quand !== "" ? C.quand : d1 ? "tome 1 le " + jourL(d1) : m ? "tome 1 le " + m[1] : "", pays: C.pays || pays };
    });
  }
  // JPEG 1200×630 et envoi dans R2 (og/f/actu-<id8>.jpg), repris comme og:image de la news.
  function jpeg(png, q) { return new Promise(function (ok) { var img = new Image(); img.onload = function () { var c = document.createElement("canvas"); c.width = 1200; c.height = 630; var x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 1200, 630); x.drawImage(img, 0, 0, 1200, 630); try { ok(c.toDataURL("image/jpeg", q || .9)); } catch (e) { ok(png); } }; img.onerror = function () { ok(png); }; img.src = png; }); }
  // Extrait : la carte devient aussi l'image de la news (hero, carrousel) ; les miniatures prennent la couverture (Carte.couv).
  function imageNews(id, d) {
    var id8 = String(id || "").replace(/-/g, "").slice(-8);
    var carte = { couv: d.cover || "", planches: d.planches || [], cta: d.cta || "", editeur: d.editeur || "", quand: d.quand || "", pays: d.pays || "France", lire: d.lire || "" };
    return fetch("/api/admin/veille", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: id, image: "https://furyogang.com/api/ogcard/actu-" + id8 + ".jpg?v=" + Date.now().toString(36), cadrage: 50, carte: carte }) }).then(function (r) { return r.json(); });
  }
  function envoyer(id, d) { return png(d).then(function (p) { return jpeg(p, .9); }).then(function (j) { return fetch("/api/admin/ogcard", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: id, data: j }) }).then(function (r) { return r.json(); }); }); }

  function charger(src) { return window.htmlToImage ? Promise.resolve() : new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  function images(el) { return Promise.all([].map.call(el.querySelectorAll("img"), function (im) { return im.complete && im.naturalWidth ? null : new Promise(function (ok) { im.onload = im.onerror = ok; }); })); }

  function png(d) {
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;left:-20000px;top:0;width:1200px;height:630px;overflow:hidden;pointer-events:none";
    var lib = charger("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js");
    var ex = d.type === "extrait", pl = ex ? (d.planches || []).filter(Boolean) : [];
    var cov = dataUrl(couv(d.cover)), cov2 = ex ? dataUrl(couv(pl[0] || d.cover2)) : Promise.resolve(null), cov3 = pl[1] ? dataUrl(couv(pl[1])) : Promise.resolve(null), logo = ex ? dataUrl("/img/logo-furyogang.png") : Promise.resolve(null);
    return Promise.all([lib, cov, fonts(), cov2, logo, cov3]).then(function (r) {
      box.innerHTML = ex ? cardExtrait(d, r[1], r[3], r[5]) : card(d, r[1] || couv(d.cover));
      if (r[4]) { var lg = box.querySelector(".lg"); if (lg) lg.src = r[4]; }
      document.body.appendChild(box);
      return images(box).then(function () { return r[2]; });
    }).then(function (fcss) {
      var names = ['700 40px "FGAntonio"', '500 40px "FGInter"'];
      return Promise.all(names.map(function (f) { return document.fonts.load(f, "A"); })).then(function () {
        var opts = { width: 1200, height: 630, pixelRatio: 1, fontEmbedCSS: fcss, cacheBust: false, backgroundColor: "#0c0c0e" };
        var essai = function (k, prev) {
          return htmlToImage.toPng(box.firstChild, opts).then(function (u) {
            if (k >= 4 || (prev && Math.abs(u.length - prev.length) < 200 && k >= 2)) return u;
            return new Promise(function (ok) { setTimeout(ok, 150); }).then(function () { return essai(k + 1, u); });
          });
        };
        return essai(1, null);
      });
    }).finally(function () { box.remove(); });
  }

  window.FG_OGACTU = { card: card, cardExtrait: cardExtrait, png: png, jpeg: jpeg, envoyer: envoyer, imageNews: imageNews, donneesExtrait: donneesExtrait, SIZE: SIZE };
})();
