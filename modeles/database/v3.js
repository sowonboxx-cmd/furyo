// Maquettes v3 (Will, 26/11/2026) : base fusionnée (m1 à m3) et fiche CROWS (o1 : tomes en tuiles sous l'auteur, o2 : tomes dans les infos).
const V = new URLSearchParams(location.search).get("v") || "m1";
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const couv = (u, w = 360) => u ? "/api/couv?w=" + w + "&u=" + encodeURIComponent(u) : "";
const ic = d => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${d}</svg>`;
const IC = { search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'), fl: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'), ext: ic('<path d="M7 17 17 7M9 7h8v8"/>'), dn: ic('<path d="m6 9 6 6 6-6"/>'),
  heart: ic('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'), lib: ic('<path d="M5 4v16M9 4v16M13 5l4 15"/>'), sort: ic('<path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3"/>'),
  play: '<svg class="ic" viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px"><path d="M8 5v14l11-7z"/></svg>' };
const FL = p => `<i class="flag ${p}"></i>`;
const typ = t => String(t || "").replace(/^Shonen$/, "Shōnen").replace(/^Shojo$/, "Shōjo");
const nom = s => s.fr || s.t;
const statut = s => /termin/i.test(s.stJP) ? '<span class="st fi">Terminé</span>' : /abandon|arr[eê]t/i.test(s.stJP) ? '<span class="st" style="color:#ff8a5a">Abandonné</span>' : '<span class="st ec">En cours</span>';
const carte = s => `<a class="card"><div class="cv"><img src="${couv(s.cover)}" alt="" loading="lazy"></div><b>${esc(nom(s))}</b><span class="g">${esc((s.genres || []).slice(0, 3).join(" · "))}</span><span class="m">${esc(typ(s.type))}${s.y1 ? " · " + s.y1 : ""} · ${statut(s)}</span></a>`;
Promise.all([fetch("/api/series").then(r => r.json()), fetch("/api/avancement").then(r => r.json()), fetch("/api/serie?s=" + (new URLSearchParams(location.search).get("s") || "crows")).then(r => r.json())]).then(([S, A, C]) => {
  const items = S.items.slice().sort((a, b) => nom(a).localeCompare(nom(b), "fr")), by = {}; items.forEach(s => by[s.slug] = s);
  const rec = (A.recentes || []).slice(0, 3).map(x => Object.assign({ date: x.date }, by[x.slug] || {})).filter(x => x.slug);
  const dateC = d => d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";
  const pct = String(A.pct).replace(".", ",") + " %";
  const app = document.getElementById("app");
  const tools = `<div class="tools"><div class="search">${IC.search} Chercher une série, un auteur</div><span class="chip">France</span><span class="chip">Japon</span><span class="chip">En cours</span><span class="chip">Terminé</span><span class="chip">A à Z ${IC.dn}</span><span class="chip">Type ${IC.dn}</span><span class="chip">Année ${IC.dn}</span></div>`;
  const grille = `<h2 class="s">Toute la base <small>${A.enLigne} fiches · A à Z</small></h2><div class="grid">${items.slice(0, 12).map(carte).join("")}</div>`;
  const hc = s => `<a class="hc"><div class="cv"><img src="${couv(s.cover, 260)}"></div><div><span class="date">${dateC(s.date)}</span><span class="nvb">Nouveau</span><b>${esc(nom(s))}</b><span class="g">${esc((s.genres || []).slice(0, 3).join(" · "))}</span><span class="m">${esc(typ(s.type))} · ${s.y1 || ""} · ${statut(s)}</span></div></a>`;
  const kpis = `<div class="kpi"><b style="color:var(--blue)">+${A.semaine}</b><span>cette semaine</span></div><div class="kpi"><b style="color:var(--gold)">${A.reste}</b><span>à faire</span></div><div class="kpi"><b style="color:#ff5a7a">${A.total}</b><span>séries</span></div>`;
  // m1 : un seul bloc noir ; l'avancement en haut, les 3 dernières fiches en tuiles dessous.
  if (V === "m1") app.innerHTML = `<div class="mbox"><div class="mhead"><div><div class="lab">Manga Database</div><div class="n">${A.enLigne}<small>fiches sur ${A.total}</small></div></div>
      <div style="flex:1"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="lab">Avancement</span><b class="D" style="font-size:22px;color:var(--blue)">${pct}</b></div><div class="bar" style="height:14px"><i style="width:${A.pct}%"></i></div></div>${kpis}</div>
      <div style="height:1px;background:#1f1f24;margin:20px 0 16px"></div><div class="lab" style="margin-bottom:12px">Dernières fiches</div><div class="row3">${rec.map(hc).join("")}</div></div>${tools}${grille}`;
  // m2 : un seul bloc ; avancement en colonne à gauche, les 3 dernières fiches en grandes couvertures à droite.
  if (V === "m2") app.innerHTML = `<div class="mbox" style="display:grid;grid-template-columns:300px 1fr;gap:22px">
      <div class="tile" style="padding:20px;display:flex;flex-direction:column"><div class="lab">Manga Database</div><div class="big" style="margin-top:10px">${A.enLigne}</div><span style="color:#cfcfd4;margin-top:4px">fiches sur ${A.total} séries</span>
        <div class="bar" style="margin-top:18px"><i style="width:${A.pct}%"></i></div><b class="D" style="font-size:22px;color:var(--blue);margin-top:8px">${pct}</b>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto"><div style="background:#000;border-radius:12px;padding:12px"><b class="D" style="font-size:28px;color:var(--blue)">+${A.semaine}</b><div style="font-size:12px;color:var(--mute)">cette semaine</div></div><div style="background:#000;border-radius:12px;padding:12px"><b class="D" style="font-size:28px;color:var(--gold)">${A.reste}</b><div style="font-size:12px;color:var(--mute)">à faire</div></div></div></div>
      <div><div class="lab" style="margin-bottom:12px">Dernières fiches</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">${rec.map(s => `<a class="vc"><div class="cv"><img src="${couv(s.cover, 420)}"><span class="nv">Nouveau</span></div><b>${esc(nom(s))}</b><span class="g">${esc((s.genres || []).slice(0, 3).join(" · "))}</span><span class="m">${esc(typ(s.type))} · ${s.y1 || ""} · ${statut(s)} · ${dateC(s.date)}</span></a>`).join("")}</div></div></div>${tools}${grille}`;
  // m3 : un seul bloc ; barre d'avancement en bandeau tout en haut, chiffres en ligne, puis les 3 fiches.
  if (V === "m3") app.innerHTML = `<div class="mbox" style="padding:0;overflow:hidden"><div style="padding:20px 24px 16px;display:flex;align-items:baseline;gap:16px;flex-wrap:wrap"><span class="D" style="font-size:34px">Manga Database</span><span style="color:#cfcfd4"><b style="color:#fff">${A.enLigne}</b> fiches sur ${A.total} · <b style="color:var(--blue)">+${A.semaine}</b> cette semaine · <b style="color:var(--gold)">${A.reste}</b> à faire</span><b class="D" style="margin-left:auto;font-size:26px;color:var(--blue)">${pct}</b></div>
      <div class="bar" style="height:6px;border-radius:0;margin:0 24px;border-radius:4px"><i style="width:${A.pct}%"></i></div><div style="padding:18px 24px 24px"><div class="row3">${rec.map(hc).join("")}</div></div></div>${tools}${grille}`;

  // c3a à c3c : bandeau titre (C3) avec les chiffres plus gros (Will, 26/11/2026).
  const fiches3 = `<div class="row3">${rec.map(hc).join("")}</div>`;
  if (V === "c3a") app.innerHTML = `<div class="mbox" style="padding:22px 24px 24px"><div style="display:flex;align-items:center;gap:30px"><span class="D" style="font-size:40px">Manga Database</span>
      <div style="display:flex;gap:28px;align-items:baseline"><span><b class="D" style="font-size:44px">${A.enLigne}</b><span style="color:#cfcfd4;margin-left:8px">fiches sur ${A.total}</span></span><span><b class="D" style="font-size:44px;color:var(--blue)">+${A.semaine}</b><span style="color:#cfcfd4;margin-left:8px">cette semaine</span></span><span><b class="D" style="font-size:44px;color:var(--gold)">${A.reste}</b><span style="color:#cfcfd4;margin-left:8px">à faire</span></span></div>
      <b class="D" style="margin-left:auto;font-size:44px;color:var(--blue)">${pct}</b></div><div class="bar" style="height:8px;margin:14px 0 20px"><i style="width:${A.pct}%"></i></div>${fiches3}</div>${tools}${grille}`;
  if (V === "c3b") app.innerHTML = `<div class="mbox" style="padding:22px 24px 24px"><div style="display:flex;align-items:flex-end;gap:16px"><span class="D" style="font-size:40px;line-height:1">Manga Database</span><b class="D" style="margin-left:auto;font-size:30px;color:var(--blue);line-height:1">${pct}</b></div>
      <div class="bar" style="height:8px;margin:14px 0 16px"><i style="width:${A.pct}%"></i></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">${[[A.enLigne, "fiches en ligne sur " + A.total, "#fff"], ["+" + A.semaine, "cette semaine", "var(--blue)"], [A.reste, "encore à faire", "var(--gold)"]].map(k => `<div class="tile" style="padding:14px 18px;display:flex;align-items:baseline;gap:12px"><b class="D" style="font-size:52px;line-height:1;color:${k[2]}">${k[0]}</b><span style="color:#cfcfd4;font-weight:600">${k[1]}</span></div>`).join("")}</div>${fiches3}</div>${tools}${grille}`;
  if (V === "c3c") app.innerHTML = `<div class="mbox" style="padding:24px"><div style="display:grid;grid-template-columns:1fr auto auto auto;gap:34px;align-items:end"><div><span class="D" style="font-size:40px;line-height:1">Manga Database</span><div class="bar" style="height:8px;margin-top:16px"><i style="width:${A.pct}%"></i></div><div style="margin-top:8px;font:600 13px Inter;color:var(--mute)"><b style="color:var(--blue)">${pct}</b> de la base</div></div>
      ${[[A.enLigne, "fiches sur " + A.total, "#fff"], ["+" + A.semaine, "cette semaine", "var(--blue)"], [A.reste, "à faire", "var(--gold)"]].map(k => `<div style="text-align:right"><b class="D" style="display:block;font-size:64px;line-height:.9;color:${k[2]}">${k[0]}</b><span style="color:#cfcfd4;font:600 13px Inter">${k[1]}</span></div>`).join("")}</div>
      <div style="height:1px;background:#1f1f24;margin:20px 0"></div>${fiches3}</div>${tools}${grille}`;
  // ---- Fiche (n'importe quelle série : ?s=<slug>, CROWS par défaut)
  const s = C.serie, eds = C.editions || [], frEd = eds.find(e => e.pays === "France"), jpEd = eds.find(e => e.pays === "Japon");
  const tit = s.fr || s.t, mac = t => String(t || "").replace(/Shonen/g, "Shōnen").replace(/Shojo/g, "Shōjo");
  // Pas encore d'extrait choisi pour cette série : pages de CROWS en attendant (maquette).
  const pages = [1, 2, 3, 4, 5].map(i => "/img/extraits/crows/" + i + ".jpg");
  const parts = v => String(v || "").split(/\s*,\s*/).filter(Boolean);
  const dapres = (String(s.scen || "").match(/\(d'après ([^)]+)\)/) || [])[1];
  const scen = parts(String(s.scen || "").replace(/\s*\(d'après [^)]+\)/, "")), dess = parts(s.dess);
  const memes = scen.join() === dess.join();
  const autL = memes ? `<div class="aut">Auteur :<b>${esc(scen.join(", "))}</b></div>` : `<div class="aut">Scénario :<b>${esc(scen.join(", "))}</b></div><div class="aut" style="margin-top:4px">Dessin :<b>${esc(dess.join(", "))}</b></div>`;
  const dapL = dapres ? `<div class="aut" style="margin-top:4px">D'après :<b>${esc(dapres)}</b></div>` : "";
  const an = t => (t && t.date ? +t.date.slice(0, 4) : null);
  const ansFR = frEd ? frEd.tomes.map(an).filter(Boolean) : [], frDebut = ansFR.length ? Math.min(...ansFR) : null, frFin = ansFR.length ? Math.max(...ansFR) : null;
  const stc = st => /termin/i.test(st) ? "fi2" : /abandon|arr/i.test(st) ? "ab2" : "ec2";
  const jpTxt = /termin/i.test(s.stJP) ? `Terminé · ${s.y1}${s.y2 && s.y2 !== s.y1 ? "-" + s.y2 : ""}` : s.stJP ? `${s.stJP} · depuis ${s.y1}` : "";
  const frTxt = /termin/i.test(s.stFR) ? "Terminé" + (frDebut ? " · " + frDebut + (frFin > frDebut ? "-" + frFin : "") : "") : s.stFR && !/non licen/i.test(s.stFR) ? `${s.stFR}${frDebut ? " · depuis " + frDebut : ""}` : "";
  const nT = n => n + " tome" + (n > 1 ? "s" : "");
  const tuiles = [jpEd && s.tomesJP ? `<div><b>${FL("jp")}${nT(s.tomesJP)}</b><span class="${stc(s.stJP)}">${esc(jpTxt)}</span></div>` : "", frEd && s.tomesFR ? `<div><b>${FL("fr")}${nT(s.tomesFR)}</b><span class="${stc(s.stFR)}">${esc(frTxt)}</span></div>` : ""].join("");
  const lignes = k => String(s[k] || "").split("\n").filter(Boolean).map(l => ({ t: l.replace(/\s*[(<].*$/, ""), y: (l.match(/\((\d{4})/) || [])[1], d: (l.match(/\(\d{4}, ([^)]*)\)/) || [])[1] || "", img: (l.match(/<https:\/\/furyo\.pages\.dev(\/affiches\/[^>]+)>/) || [])[1], vo: / VO </.test(l), vf: / VF </.test(l), ba: /youtube|dailymotion/.test(l) }));
  const AD = [["Films", lignes("film")], ["Dramas", lignes("drama")], ["Anime", lignes("anime")], ["OAV", lignes("oav")]].filter(x => x[1].length), nbAd = AD.reduce((n, x) => n + x[1].length, 0);
  const sim = items.filter(x => x.slug !== s.slug).map(x => ({ x, sc: (x.genres || []).filter(g => (s.genres || []).includes(g)).length + (x.type === s.type ? 1 : 0) })).sort((a, b) => b.sc - a.sc).slice(0, 6).map(o => o.x);
  const pills = `<div class="pills"><span class="pb">${esc(mac(s.type))}</span>${s.cxw ? `<a class="cxw"><i class="k">Univers</i><i class="t">CROWS</i><i class="x">×</i><i class="t">WORST</i><i style="margin-left:8px">${IC.ext}</i></a>` : ""}${(s.genres || []).map(g => `<span class="pg">${esc(g)}</span>`).join("")}</div>`;
  const t1 = (frEd || jpEd).tomes.slice().sort((a, b) => a.n - b.n).find(t => t.cover && t.n >= 1) || {};
  const hero = avec => `<div class="hero"><div class="actions"><span class="suivre">${IC.heart} Suivre</span><span class="coll">${IC.lib} Collection</span><span class="fno">Fiche n°001</span></div>
      <div class="cv"><img src="${couv(t1.cover, 600)}"></div><div style="padding-right:150px"><h1${tit.length > 18 ? ' style="font-size:58px"' : ""}>${esc(tit)}</h1><div class="jp">${esc(s.jp)}</div>${autL}${dapL}
      ${avec && tuiles ? `<div class="ttile">${tuiles}</div>` : ""}
      <p class="r">${esc(s.resume)}</p>${pills}</div></div>`;
  const tabs = `<div class="tabs"><a class="on">Infos</a><a>Extrait</a>${nbAd ? `<a>Adaptations<sup>${nbAd}</sup></a>` : ""}<a>News<sup>0</sup></a></div>`;
  const prep = s.prepub ? s.prepub.slice(0, 4) : s.y1;
  const cartes = [jpEd ? `<div><span class="lab">${FL("jp")} Éditeur Japon</span><b>${esc(s.pubJP || jpEd.pub)}</b></div>` : "", frEd ? `<div><span class="lab">${FL("fr")} Éditeur France</span><b>${esc(s.pubFR || frEd.pub)}</b></div>` : "",
    s.mag ? `<div><span class="lab">Magazine</span><b>${esc(mac(s.mag))}</b></div>` : "", s.mag && prep ? `<div><span class="lab">Prépublication</span><b>${prep}</b></div>` : ""].filter(Boolean);
  const infos = `<div class="infos2" style="grid-template-columns:repeat(${cartes.length},1fr)">${cartes.join("")}</div>`;
  const vf = !!(s.extraitFR || frEd), vo = !!(s.extraitJP || jpEd), chez = vf ? (s.pubFR || "").replace(/\s*\(.*/, "") : (s.pubJP || "").replace(/\s*\(.*/, "");
  const extrait = `<div class="sec mbox"><h2 class="s">Extrait <small>Chapitre 1</small></h2><div class="extb"><div class="pg5">${pages.map(p => `<img src="${p}">`).join("")}</div>
      <div class="txt"><div class="lab">Lire le début</div><b class="D" style="font-size:32px;line-height:1">Les premières pages</b><p style="margin:0;color:#cfcfd4;font-size:14px"><b style="color:#fff">${esc(tit)}</b>, chapitre 1. Cliquez sur une page pour zoomer et les faire défiler.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px"><a class="lien">Lire l'extrait${chez ? " chez " + esc(chez) : ""} ${IC.ext}</a><span class="seg">${vf ? `<span class="on">${FL("fr")} VF</span>` : ""}${vo ? `<span class="${vf ? "" : "on"}">${FL("jp")} VO</span>` : ""}</span></div></div></div></div>`;
  const edTom = frEd || jpEd, nbJP = eds.filter(e => e.pays === "Japon").reduce((n, e) => n + e.tomes.length, 0);
  const lib = (edTom.nom || "").split(" — ")[1] || edTom.pub;
  const tomes = `<div class="sec tomes"><div class="hd"><h2>Tomes</h2><span class="seg">${frEd ? `<span class="on">${FL("fr")} France <small style="opacity:.6">${frEd.tomes.length}</small></span>` : ""}${jpEd ? `<span class="${frEd ? "" : "on"}">${FL("jp")} Japon <small style="opacity:.6">${nbJP}</small></span>` : ""}</span><span class="chip" style="background:#1b1b1f;padding:10px 12px">${IC.sort}</span></div>
      <div class="ed"><span><b>${esc(lib)}</b> · ${nT(edTom.tomes.length)}</span></div>
      <div class="tg">${(V === "t1" || V === "t2" ? edTom.tomes.slice().sort((a, b) => a.n - b.n).slice(0, V === "t1" ? 14 : 99) : edTom.tomes.slice().sort((a, b) => a.n - b.n).filter(t => t.cover).slice(0, 7)).map(t => `<div><div class="cv"><img src="${couv(t.cover, 260)}"></div><b>Tome ${String(t.n).padStart(2, "0")}</b><small>${t.date ? t.date.split("-").reverse().join("/") : ""}</small></div>`).join("")}</div>${V === "t1" && edTom.tomes.length > 14 ? `<div style="display:flex;justify-content:center;margin-top:20px"><a class="lien" style="background:#2d2d32;color:#fff">Voir les ${edTom.tomes.length} tomes ${IC.dn}</a></div>` : V === "t2" ? `<div style="display:flex;justify-content:center;margin-top:20px"><a class="lien" style="background:#2d2d32;color:#fff">Réduire <span style="transform:rotate(180deg);display:inline-flex">${IC.dn}</span></a></div>` : ""}</div>`;
  const adc = a => `<div class="adc"><div class="po">${a.img ? `<img src="${a.img}">` : ""}</div><div><b>${esc(a.t)}</b><p>${esc(a.d.replace(/^au cinéma/, "Au cinéma"))}</p><div class="bt"><span class="yr">${a.y || ""}</span><span class="bts">${a.vo ? `<span>${IC.play} VO</span>` : ""}${a.vf ? `<span>${IC.play} VF</span>` : ""}${!a.vo && a.ba ? `<span>${IC.play} Bande-annonce</span>` : ""}<span class="f">Fiche ${IC.ext}</span></span></div></div></div>`;
  const adapt = nbAd ? `<div class="sec mbox adb"><h2 class="s">Adaptations <small>${nbAd} au total</small></h2><div class="flt">${AD.map((x, i) => `<span class="${i ? "" : "on"}">${x[0]}<small>${x[1].length}</small></span>`).join("")}</div><div class="adg">${AD[0][1].slice(0, 4).map(adc).join("")}</div></div>` : "";
  const univ = s.cxw ? `<div class="sec uni"><span class="k">Univers</span><b>CROWS × WORST</b><span>CROWS, WORST, QP, Crows Gaiden… toute la saga dans l'ordre chronologique</span><a class="go">Voir l'univers ${IC.fl}</a></div>` : "";
  const simil = `<div class="sec mbox"><h2 class="s">Si vous aimez ${esc(tit)}</h2><div class="grid">${sim.map(carte).join("")}</div></div>`;
  if (V === "t1" || V === "t2") app.innerHTML = tomes;
  if (V === "o1") app.innerHTML = hero(true) + tabs + infos + extrait + tomes + adapt + univ + simil;
  if (V === "o2") app.innerHTML = hero(false) + tabs + infos + extrait + tomes + adapt + univ + simil;
}).catch(e => { document.getElementById("app").textContent = "Erreur : " + e.message; });
