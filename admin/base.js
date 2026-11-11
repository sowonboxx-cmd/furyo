// Mangas Database, nouvelle version (Will, 11/11/2026) : six vues dans le style de la page Série du site.
// Liste + fiche (par défaut), Vitrine, Tableau, Avancement, Ordre des fiches, Calendrier des fiches.
// Remplace shell() et draw() du back-office ; réutilise ITEMS, F, Q, T, FILTRES, TRIS, ordrePub, prio, pret, imageFiche, toast, copier.
// Termes (Will, 11/11/2026) : « Sur le site » = la fiche est publique ; « Promo réseaux » = la fiche a été postée sur les réseaux (avec sa date).
(function () {
  const VUES = [["liste", "Liste + fiche"], ["vitrine", "Vitrine"], ["tableau", "Tableau"], ["avancement", "Avancement"], ["ordre", "Ordre des fiches"], ["calendrier", "Calendrier"]];
  const LABELS = { horsligne: "Pas sur le site", ligne: "Sur le site", promo: "Promo réseaux à faire", coeur: "Coups de cœur", tout: "Tout" };
  const M = window.MDB = { vue: "liste", sel: null, open: null, tab: "infos", tx: "resumeImg", lim: 120, mois: null, drag: null };
  try { const v = localStorage.getItem("mdb-vue"); if (v && VUES.some(x => x[0] === v)) M.vue = v; } catch (e) {}
  // Publication des fiches : jours de la semaine (0 = dimanche) et date de départ. Réglables dans la vue Calendrier.
  const CAL = { jours: [2, 5], depart: "2026-12-01", heure: "18 h" };
  try { const c = JSON.parse(localStorage.getItem("mdb-cal") || "null"); if (c && Array.isArray(c.jours)) Object.assign(CAL, c); } catch (e) {}

  const I = {
    grid: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5C19 15.6 12 20 12 20Z"/></svg>',
    ok: '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7BC67E"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ko: '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#55555A" stroke-width="2" stroke-dasharray="3 3"/></svg>',
    grip: '<svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><circle cx="4" cy="4" r="1.6"/><circle cx="10" cy="4" r="1.6"/><circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="4" cy="16" r="1.6"/><circle cx="10" cy="16" r="1.6"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    left: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m15 5-7 7 7 7"/></svg>',
    right: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m9 5 7 7-7 7"/></svg>',
    up: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m5 15 7-7 7 7"/></svg>',
    down: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m5 9 7 7 7-7"/></svg>',
    lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    ext: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/></svg>',
    txt: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
    ig: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    xl: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.3l-7.2 8.2L22.3 21h-6.6l-5.2-6.8L4.6 21H1.3l7.7-8.8L.9 3h6.8l4.7 6.2L17.8 3Zm-1.2 16.1h1.8L6.6 4.8H4.7l11.9 14.3Z"/></svg>',
    tt: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.2 1.9 3.8 4.1 4v3.2a7.6 7.6 0 0 1-4.1-1.3v6.3a5.8 5.8 0 1 1-5.8-5.8c.3 0 .7 0 1 .1v3.3a2.6 2.6 0 1 0 1.6 2.4V3h3.2Z"/></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    dl: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>'
  };
  const FR = '<svg class="fl" viewBox="0 0 3 2"><rect width="1" height="2" fill="#2C4BA8"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#D9272E"/></svg>';
  const JP = '<svg class="fl" viewBox="0 0 3 2"><rect width="3" height="2" fill="#fff"/><circle cx="1.5" cy="1" r=".6" fill="#BC002D"/></svg>';

  const css = `
.mdb{--card:#000;--raise:#151517;--fld:#0B0B0C;--line2:#2C2C2F;--bl:#0A84FF;padding-bottom:60px}
.mdb *{box-sizing:border-box}
.mdb .w{max-width:1360px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.mdb-top{position:sticky;top:0;z-index:30;background:#000}
.mdb-top .w{display:flex;align-items:center;gap:14px;padding-block:10px;flex-wrap:wrap}
.mdb-top .bk{color:var(--paper-3);text-decoration:none;font-weight:600;font-size:13px;white-space:nowrap}
.mdb-top .ttl{font:700 21px var(--f-display);text-transform:uppercase;white-space:nowrap}
.mdb-top .ttl i{font-style:normal;color:var(--red)}
.mdb-top .hq{display:inline-flex;align-items:center;height:30px;padding:0 11px;border-radius:9px;background:#BC002D;color:#fff;font:700 12px var(--f-body);text-decoration:none;letter-spacing:.04em}
.mdb-vues{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;flex:1 1 auto;min-width:0}
.mdb-vues::-webkit-scrollbar{display:none}
.mdb-vues button{border:0;background:var(--raise);border-radius:999px;padding:7px 13px;cursor:pointer;white-space:nowrap;font:600 13px var(--f-body);color:var(--paper-2)}
.mdb-vues button[aria-pressed=true]{background:var(--paper);color:#000}
.mdb-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0 4px}
.mdb-stat{background:var(--card);border-radius:16px;padding:13px 16px}
.mdb-stat b{font:700 28px/1 var(--f-display);display:block;font-variant-numeric:tabular-nums}
.mdb-stat span{color:var(--paper-3);font-size:12.5px}
.mdb-stat .br{height:4px;border-radius:4px;background:var(--line2);margin-top:9px;overflow:hidden}
.mdb-stat .br i{display:block;height:100%}
@media(max-width:700px){.mdb-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.mdb-tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:14px 0 10px}
.mdb-q{flex:1 1 260px;min-width:0;background:var(--card);border:0;border-radius:14px;padding:12px 16px;outline:none;color:var(--paper);font:16px var(--f-body)}
.mdb-q::placeholder{color:var(--paper-3)}
.mdb-tri{background:var(--card);border:0;border-radius:14px;padding:12px 14px;color:var(--paper);font:600 14px var(--f-body)}
.mdb-fs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.mdb-fs button{border:0;background:var(--card);border-radius:999px;padding:7px 13px;cursor:pointer;font:600 13px var(--f-body);color:var(--paper-2);display:inline-flex;gap:6px;align-items:center}
.mdb-fs button small{color:var(--paper-3);font-weight:500}
.mdb-fs button[aria-pressed=true]{background:var(--paper);color:#000}
.mdb-fs button[aria-pressed=true] small{color:#555}
.mdb .st{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;border-radius:999px;padding:3px 9px;white-space:nowrap}
.mdb .st::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.mdb .st.on{background:rgba(123,198,126,.16);color:var(--ok)}
.mdb .st.off{background:rgba(242,179,61,.16);color:var(--amber)}
.mdb .st.pr{background:rgba(10,132,255,.18);color:#6CB4FF}
.mdb .num{font:700 13px var(--f-display);letter-spacing:.04em;color:var(--paper-3);font-variant-numeric:tabular-nums}
.mdb .hrt{border:0;background:none;padding:4px;cursor:pointer;color:var(--paper-3);display:inline-flex}
.mdb .hrt[aria-pressed=true]{color:var(--red)}
.mdb .hrt[aria-pressed=true] svg path{fill:currentColor}
.mdb .ring{--p:0;width:34px;height:34px;border-radius:50%;background:conic-gradient(var(--c) calc(var(--p)*1%),var(--line2) 0);display:grid;place-items:center;flex:none}
.mdb .ring span{width:26px;height:26px;border-radius:50%;background:var(--card);display:grid;place-items:center;font:700 11px var(--f-display)}
.mdb .pb{height:5px;border-radius:5px;background:var(--line2);overflow:hidden;min-width:60px;flex:1}
.mdb .pb i{display:block;height:100%}
.mdb .ph{display:grid;place-items:center;background:var(--raise);color:var(--paper-3);font:700 15px var(--f-body)}
/* Liste + fiche */
.mdb-split{display:grid;grid-template-columns:350px minmax(0,1fr);gap:16px;align-items:start}
.mdb-sl{background:var(--card);border-radius:18px;padding:6px;max-height:calc(100vh - 92px);overflow:auto;position:sticky;top:76px}
.mdb-sr{display:flex;gap:10px;align-items:center;padding:7px;border-radius:10px;cursor:pointer}
.mdb-sr:hover{background:var(--raise)}
.mdb-sr[aria-current=true]{background:var(--paper);color:#000}
.mdb-sr[aria-current=true] small{color:#444}
.mdb-sr img,.mdb-sr .ph{width:34px;height:48px;object-fit:cover;border-radius:5px;flex:none}
.mdb-sr .x{min-width:0;flex:1}
.mdb-sr b{font:700 15px/1.1 var(--f-display);text-transform:uppercase;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mdb-sr small{color:var(--paper-3);font-size:11.5px}
.mdb-sr .rk{font:700 12px var(--f-display);color:var(--paper-3);width:22px;text-align:right;flex:none}
@media(max-width:980px){.mdb-split{grid-template-columns:1fr}.mdb-sl{position:static;max-height:none}.mdb-split>.mdb-det-w{display:none}}
/* Vitrine */
.mdb-ga{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:22px 14px}
.mdb-ca{cursor:pointer;min-width:0}
.mdb-ca .im{position:relative;aspect-ratio:5/7;border-radius:12px;overflow:hidden;background:var(--card)}
.mdb-ca .im img,.mdb-ca .im .ph{width:100%;height:100%;object-fit:cover;transition:transform .25s}
.mdb-ca:hover .im img{transform:scale(1.04)}
.mdb-ca .tl{position:absolute;top:8px;left:8px;right:8px;display:flex;justify-content:space-between;align-items:center}
.mdb-ca .tl .st,.mdb-ca .tl .hrt{background:rgba(0,0,0,.78)}
.mdb-ca .tl .hrt{border-radius:50%}
.mdb-ca .ov{position:absolute;inset:auto 0 0 0;padding:28px 8px 8px;background:linear-gradient(transparent,rgba(0,0,0,.88));display:flex;align-items:center;gap:6px}
.mdb-ca .ov .num{color:var(--paper)}
.mdb-ca h3{font:700 16px/1.15 var(--f-display);text-transform:uppercase;margin:9px 0 0}
.mdb-ca .jp{color:var(--paper-3);font-size:11.5px}
@media(max-width:520px){.mdb-ga{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 8px}.mdb-ca h3{font-size:13px}}
.mdb-more{display:block;margin:22px auto 0;border:0;background:var(--paper);color:#000;border-radius:999px;padding:11px 22px;font-weight:700;cursor:pointer}
/* Tableau */
.mdb-tw{background:var(--card);border-radius:18px;overflow-x:auto}
.mdb-tb{width:100%;border-collapse:collapse;min-width:860px}
.mdb-tb th{text-align:left;font:600 11px var(--f-body);text-transform:uppercase;letter-spacing:.08em;color:var(--paper-3);padding:14px 12px;border-bottom:1px solid var(--line2)}
.mdb-tb td{padding:9px 12px;border-bottom:1px solid #141416;vertical-align:middle}
.mdb-tb tbody tr{cursor:pointer}
.mdb-tb tbody tr:hover td{background:#0B0B0C}
.mdb-tb .who{display:flex;align-items:center;gap:12px;min-width:0}
.mdb-tb .who img,.mdb-tb .who .ph{width:38px;height:54px;border-radius:6px;object-fit:cover;flex:none}
.mdb-tb .who b{font:700 16px var(--f-display);text-transform:uppercase;display:block;line-height:1.1}
.mdb-tb .who small{color:var(--paper-3);font-size:12px}
.mdb .tg{display:inline-flex;align-items:center;gap:8px;border:0;background:none;cursor:pointer;padding:0;color:var(--paper-2);font:600 12.5px var(--f-body)}
.mdb .sw{width:34px;height:20px;border-radius:20px;background:var(--line2);position:relative;transition:background .15s;flex:none}
.mdb .sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--paper);transition:transform .15s}
.mdb .tg[aria-pressed=true] .sw{background:var(--ok)}
.mdb .tg.pr[aria-pressed=true] .sw{background:var(--bl)}
.mdb .tg[aria-pressed=true] .sw::after{transform:translateX(14px)}
.mdb .tg.busy{opacity:.5;pointer-events:none}
.mdb .pill{display:inline-block;background:var(--raise);border-radius:999px;padding:3px 9px;font-size:12px;color:var(--paper-2);white-space:nowrap}
/* Avancement */
.mdb-kb{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:12px;overflow-x:auto;padding-bottom:6px}
.mdb-col{background:var(--card);border-radius:18px;padding:12px;min-width:0}
.mdb-col h3{font:700 18px var(--f-display);text-transform:uppercase;margin:4px 4px 12px;display:flex;align-items:center;gap:8px}
.mdb-col h3 small{font:600 12px var(--f-body);color:var(--paper-3)}
.mdb-col h3 i{width:9px;height:9px;border-radius:50%}
.mdb-kc{display:flex;gap:10px;background:var(--raise);border-radius:12px;padding:8px;margin-bottom:8px;cursor:pointer;align-items:center}
.mdb-kc:hover{background:#1E1E21}
.mdb-kc img,.mdb-kc .ph{width:44px;height:62px;object-fit:cover;border-radius:6px;flex:none}
.mdb-kc b{font:700 15px/1.1 var(--f-display);text-transform:uppercase;display:block}
.mdb-kc .m{display:flex;gap:6px;align-items:center;margin-top:6px}
.mdb-kc .mn{min-width:0;flex:1}
.mdb-col .plus{width:100%;border:0;background:none;color:var(--paper-3);font:600 12.5px var(--f-body);padding:8px;cursor:pointer}
/* Ordre */
.mdb-q2{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start}
@media(max-width:980px){.mdb-q2{grid-template-columns:1fr}}
.mdb-ql{background:var(--card);border-radius:18px;padding:8px}
.mdb-qh{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 10px 12px;flex-wrap:wrap}
.mdb-qh h3{font:700 22px var(--f-display);text-transform:uppercase;margin:0}
.mdb-qh span{color:var(--paper-3);font-size:13px}
.mdb-qi{display:grid;grid-template-columns:24px 72px 46px minmax(0,1fr) auto;gap:12px;align-items:center;padding:8px;border-radius:12px;cursor:pointer}
.mdb-qi:hover{background:var(--raise)}
.mdb-qi.dg{opacity:.4}
.mdb-qi.ov{box-shadow:inset 0 2px 0 var(--red)}
.mdb-qi .gp{color:#4A4A4F;cursor:grab;display:flex;justify-content:center}
.mdb-qi .n{font:700 32px/1 var(--f-display);font-variant-numeric:tabular-nums;color:var(--red)}
.mdb-qi .n.au{color:#4A4A4F}
.mdb-qi .n.lk{color:var(--paper-3)}
.mdb-qi img,.mdb-qi .ph{width:46px;height:64px;object-fit:cover;border-radius:6px}
.mdb-qi b{font:700 17px/1.1 var(--f-display);text-transform:uppercase;display:block}
.mdb-qi .d{color:var(--paper-3);font-size:12.5px}
.mdb-qi .ac{display:flex;gap:6px;align-items:center}
.mdb-sb{border:0;background:var(--raise);border-radius:9px;padding:7px 10px;cursor:pointer;font:600 12.5px var(--f-body);color:var(--paper-2);display:inline-flex;align-items:center;gap:6px}
.mdb-sb:hover{background:#26262A}
@media(max-width:620px){.mdb-qi{grid-template-columns:52px 40px minmax(0,1fr);gap:10px}.mdb-qi .gp{display:none}.mdb-qi .ac{grid-column:1/-1;justify-content:flex-end}.mdb-qi .n{font-size:24px}}
.mdb-side{display:flex;flex-direction:column;gap:12px;position:sticky;top:76px}
.mdb-box{background:var(--card);border-radius:18px;padding:16px}
.mdb-box h4{font:700 18px var(--f-display);text-transform:uppercase;margin:0 0 10px}
.mdb-mini{display:flex;flex-direction:column;gap:8px}
.mdb-mini div{display:flex;gap:10px;align-items:center;font-size:13px;cursor:pointer}
.mdb-mini img,.mdb-mini .ph{width:30px;height:42px;border-radius:4px;object-fit:cover;flex:none}
.mdb-mini em{font-style:normal;color:var(--paper-3);margin-left:auto;font-size:12px;white-space:nowrap}
/* Calendrier */
.mdb-calh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:16px 0 12px}
.mdb-calh h2{font:700 30px var(--f-display);text-transform:uppercase;margin:0 8px 0 0;min-width:180px}
.mdb-calh .sp{flex:1}
.mdb-jours{display:inline-flex;background:var(--card);border-radius:12px;padding:3px;gap:2px}
.mdb-jours button{border:0;background:none;border-radius:9px;padding:7px 10px;cursor:pointer;font:600 12.5px var(--f-body);color:var(--paper-3)}
.mdb-jours button[aria-pressed=true]{background:var(--red);color:#fff}
.mdb-date{background:var(--card);border:0;border-radius:12px;padding:9px 12px;color:var(--paper);font:600 14px var(--f-body);color-scheme:dark}
.mdb-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.mdb-cal .dn{color:var(--paper-3);font:600 11px var(--f-body);text-transform:uppercase;letter-spacing:.08em;padding:0 4px 4px}
.mdb-day{background:var(--card);border-radius:14px;min-height:150px;padding:8px;display:flex;flex-direction:column;gap:6px;min-width:0}
.mdb-day.vide{background:transparent}
.mdb-day.auj{box-shadow:inset 0 0 0 2px var(--paper-3)}
.mdb-day.pj{background:#120A0C}
.mdb-day .dt{font:700 15px var(--f-display);color:var(--paper-3);display:flex;justify-content:space-between;align-items:center}
.mdb-day.pj .dt{color:var(--paper)}
.mdb-day .dt small{font:600 10.5px var(--f-body);color:var(--red);text-transform:uppercase;letter-spacing:.06em}
.mdb-ev{display:flex;flex-direction:column;gap:5px;cursor:pointer;min-width:0}
.mdb-ev .cv{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:5/7;background:var(--raise)}
.mdb-ev .cv img,.mdb-ev .cv .ph{width:100%;height:100%;object-fit:cover}
.mdb-ev .cv .tag{position:absolute;left:5px;top:5px;font:700 11px var(--f-display);background:rgba(0,0,0,.8);color:#fff;border-radius:6px;padding:1px 6px}
.mdb-ev .cv .tag.dn2{background:var(--bl)}
.mdb-ev b{font:700 13px/1.1 var(--f-display);text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.mdb-day .libre{margin-top:auto;color:#55555A;font-size:11.5px;font-weight:600}
@media(max-width:900px){.mdb-cal{grid-template-columns:1fr}.mdb-cal .dn,.mdb-day.vide,.mdb-day.nojour{display:none}.mdb-day{min-height:0;flex-direction:row;flex-wrap:wrap;align-items:center}.mdb-day .dt{width:100%}.mdb-ev{flex-direction:row;align-items:center;width:100%}.mdb-ev .cv{width:44px;flex:none}}
.mdb-leg{display:flex;gap:14px;flex-wrap:wrap;color:var(--paper-3);font-size:12.5px;margin:12px 0 0}
.mdb-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
/* Fiche */
.mdb-det{display:flex;flex-direction:column;gap:14px;min-width:0}
.mdb-hero{background:var(--card);border-radius:22px;padding:24px;display:grid;grid-template-columns:200px minmax(0,1fr);gap:26px;position:relative}
.mdb-hero .cv{border-radius:12px;overflow:hidden;aspect-ratio:5/7;background:var(--raise)}
.mdb-hero .cv img,.mdb-hero .cv .ph{width:100%;height:100%;object-fit:cover}
.mdb-hero h2{font:700 clamp(34px,4.6vw,56px)/.95 var(--f-display);text-transform:uppercase;margin:0;padding-right:150px;text-wrap:balance}
.mdb-hero .hj{font-size:17px;color:var(--paper-2);margin:6px 0 10px;font-weight:700}
.mdb-hero .ln{color:var(--paper-3);margin:3px 0;font-size:14.5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.mdb-hero .ln b{color:var(--paper);font-weight:600}
.mdb-hero p.rs{color:var(--paper-2);font-size:15px;max-width:70ch;margin:12px 0;line-height:1.6}
.mdb .fl{width:18px;height:12px;border-radius:2px;flex:none}
.mdb-tags{display:flex;gap:6px;flex-wrap:wrap}
.mdb-tags span{background:var(--raise);border-radius:8px;padding:5px 10px;font-size:13px;font-weight:600;color:var(--paper-2)}
.mdb-tags span.b{background:var(--bl);color:#fff}
.mdb-hero .ctl{position:absolute;top:20px;right:20px;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.mdb-hero .ctl small{color:var(--paper-3);font-size:11.5px;margin-top:-6px}
@media(max-width:760px){.mdb-hero{grid-template-columns:1fr;padding:18px}.mdb-hero .cv{max-width:180px}.mdb-hero h2{padding-right:0}.mdb-hero .ctl{position:static;flex-direction:row;flex-wrap:wrap;align-items:center;order:-1}}
.mdb-tabs{background:var(--card);border-radius:18px;padding:6px;display:flex;gap:4px;overflow-x:auto}
.mdb-tabs button{flex:1;border:0;background:none;border-radius:12px;padding:10px 14px;cursor:pointer;font:700 18px var(--f-display);text-transform:uppercase;color:var(--paper-3);white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:8px}
.mdb-tabs button small{font:600 11px var(--f-body)}
.mdb-tabs button[aria-pressed=true]{background:var(--raise);color:var(--paper)}
.mdb-pn{background:var(--card);border-radius:22px;padding:22px}
.mdb-pn h3{font:700 24px var(--f-display);text-transform:uppercase;margin:0 0 14px}
.mdb-pn h3+.hint{margin:-8px 0 14px}
.mdb .hint{color:var(--paper-3);font-size:13px}
.mdb-chk{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.mdb-chk div{display:flex;align-items:center;gap:10px;background:var(--raise);border-radius:12px;padding:11px 12px;font-weight:600;font-size:13.5px}
.mdb-chk .ko{color:var(--paper-3)}
@media(max-width:760px){.mdb-chk{grid-template-columns:1fr}}
.mdb-info{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
.mdb-info div{background:var(--raise);border-radius:14px;padding:12px 14px;min-width:0}
.mdb-info label{display:flex;align-items:center;gap:7px;font:700 10.5px var(--f-body);text-transform:uppercase;letter-spacing:.08em;color:var(--paper-3);margin-bottom:4px}
.mdb-info p{margin:0;font-weight:600;overflow-wrap:anywhere}
@media(max-width:760px){.mdb-info{grid-template-columns:repeat(2,minmax(0,1fr))}}
.mdb-nr{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:16px}
.mdb-nb{display:flex;align-items:center;background:var(--raise);border-radius:12px;overflow:hidden}
.mdb-nb span{font:700 12px var(--f-body);color:var(--paper-3);padding:0 12px;text-transform:uppercase;letter-spacing:.06em}
.mdb-nb input{width:96px;border:0;background:var(--fld);padding:10px 12px;font:700 22px var(--f-display);outline:none;color:var(--paper)}
.mdb-ttabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.mdb-ttabs button{border:0;background:var(--raise);border-radius:999px;padding:7px 13px;cursor:pointer;font:600 13px var(--f-body);color:var(--paper-2);display:inline-flex;align-items:center;gap:7px}
.mdb-ttabs button[aria-pressed=true]{background:var(--paper);color:#000}
.mdb-ed{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:16px}
@media(max-width:1100px){.mdb-ed{grid-template-columns:1fr}.mdb-prev{max-width:340px}}
.mdb-ta{width:100%;min-height:240px;background:var(--fld);border:1px solid var(--line2);border-radius:14px;padding:16px;line-height:1.6;color:var(--paper);resize:vertical;outline:none;font:16px/1.6 var(--f-body)}
.mdb-ta:focus{border-color:#5A5A60}
.mdb-tf{display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:10px;flex-wrap:wrap}
.mdb-tf .ko{color:var(--red)}
.mdb .bt{border:0;border-radius:12px;padding:10px 16px;font:700 14px var(--f-body);cursor:pointer;display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.mdb .bt.p{background:var(--paper);color:#000}
.mdb .bt.g{background:var(--raise);color:var(--paper)}
.mdb .bt.busy{opacity:.5;pointer-events:none}
.mdb-prev{background:#fff;color:#111;border-radius:16px;overflow:hidden;font-size:13px;align-self:start}
.mdb-prev .h{display:flex;align-items:center;gap:8px;padding:10px 12px;font-weight:700}
.mdb-prev .h i{width:26px;height:26px;border-radius:50%;background:#BC002D;display:grid;place-items:center;color:#fff;font:700 9px "Noto Sans JP",sans-serif;font-style:normal}
.mdb-prev img{aspect-ratio:4/5;object-fit:cover;width:100%}
.mdb-prev p{margin:0;padding:10px 12px 14px;white-space:pre-line;line-height:1.45;max-height:200px;overflow:hidden}
.mdb-vis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.mdb-vis div{background:var(--raise);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.mdb-vis b{font:700 18px var(--f-display);text-transform:uppercase}
@media(max-width:620px){.mdb-vis{grid-template-columns:1fr}}
.mdb-tomes{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:16px 12px}
.mdb-tome img,.mdb-tome .ph{aspect-ratio:5/7;object-fit:cover;width:100%;border-radius:10px}
.mdb-tome b{font:700 15px var(--f-display);text-transform:uppercase;display:flex;align-items:center;gap:6px;margin-top:7px}
.mdb-tome small{color:var(--paper-3);font-size:12px}
.mdb-scrim{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:40}
.mdb-drawer{position:fixed;top:0;right:0;bottom:0;width:min(1000px,100%);background:var(--ink);z-index:41;overflow:auto;padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 40px 16px;box-shadow:-20px 0 60px rgba(0,0,0,.5)}
.mdb-close{border:0;background:var(--card);border-radius:12px;padding:9px 13px;cursor:pointer;font:700 14px var(--f-body);color:var(--paper);display:inline-flex;gap:8px;align-items:center;margin-bottom:12px}
.mdb-back{border:0;background:none;cursor:pointer;color:var(--paper-3);font:600 14px var(--f-body);display:inline-flex;gap:6px;align-items:center;padding:6px 0;margin:14px 0 4px}
.mdb-vide{color:var(--paper-3);padding:40px 0;text-align:center}
.mdb :focus-visible{outline:2px solid var(--bl);outline-offset:2px}
@media(prefers-reduced-motion:reduce){.mdb *{transition:none!important}}
`;
  if (!document.getElementById("mdb-css")) { const st = document.createElement("style"); st.id = "mdb-css"; st.textContent = css; document.head.appendChild(st); }

  // ---------- Aides ----------
  const nomS = s => (typeof shownT === "function" ? shownT(s) : (s.fr || s.t));
  const couv = (s, w) => s.cover ? `/api/couv?w=${w || 200}&u=${encodeURIComponent(s.cover)}` : "";
  const img = (s, w) => s.cover ? `<img src="${couv(s, w)}" alt="" loading="lazy" decoding="async">` : `<span class="ph jp">${esc((s.jp || s.t || "").slice(0, 2))}</span>`;
  const okN = s => s.oblig.length - s.manque.length;
  const ratio = s => s.oblig.length ? okN(s) / s.oblig.length : 0;
  const teinte = s => ratio(s) >= 1 ? "#7BC67E" : ratio(s) >= .75 ? "#F2B33D" : "#E54839";
  const ring = s => `<span class="ring" style="--p:${Math.round(ratio(s) * 100)};--c:${teinte(s)}" title="Éléments obligatoires ${okN(s)}/${s.oblig.length}"><span>${okN(s)}/${s.oblig.length}</span></span>`;
  const pbar = s => `<span class="pb"><i style="width:${Math.round(ratio(s) * 100)}%;background:${teinte(s)}"></i></span>`;
  const jj = d => d ? d.slice(8, 10) + "/" + d.slice(5, 7) : "";
  const stSite = s => s.publier ? `<span class="st on">Sur le site</span>` : `<span class="st off">Pas sur le site</span>`;
  const stPromo = s => s.promo ? `<span class="st pr">Promo réseaux${s.promoLe ? " · " + jj(s.promoLe) : ""}</span>` : "";
  const hrt = s => `<button class="hrt" data-mh="${s.id}" aria-pressed="${!!s.coeur}" aria-label="Coup de cœur">${I.heart}</button>`;
  const nfmt = n => n ? "N°" + String(n).padStart(3, "0") : "Auto";
  const byId = id => ITEMS.find(x => x.id === id);
  // Un numéro est verrouillé quand la fiche a déjà été postée sur les réseaux (Will, 11/11/2026 : « une fois publié, on ne change plus »).
  const verrou = s => !!(s.num && s.promo);

  function liste() {
    const n = slugify(Q), keep = (FILTRES.find(x => x[0] === F) || FILTRES[FILTRES.length - 1])[2];
    const L = ITEMS.filter(s => n ? slugify([s.t, s.fr, s.jp].join(" ")).includes(n) || (s.jp || "").includes(Q) : keep(s));
    const reste = s => s.manque.length;
    if (T === "ordre") L.sort(ordrePub);
    if (T === "recent") L.sort((a, b) => (b.cree || "").localeCompare(a.cree || "") || a.t.localeCompare(b.t, "fr"));
    if (T === "az") L.sort((a, b) => nomS(a).localeCompare(nomS(b), "fr"));
    if (T === "peu") L.sort((a, b) => reste(a) - reste(b) || a.t.localeCompare(b.t, "fr"));
    if (T === "beaucoup") L.sort((a, b) => reste(b) - reste(a) || a.t.localeCompare(b.t, "fr"));
    return L;
  }

  // ---------- En-tête ----------
  window.shell = function () {
    root.innerHTML = `<div class="mdb"><header class="mdb-top"><div class="w">
        <a class="bk" href="#">‹ Back-office</a><span class="ttl">Mangas <i>Database</i></span><a class="hq" href="/hq/">HQ</a>
        <nav class="mdb-vues" id="mdb-vues"></nav></div></header>
      <main class="w" id="mdb-main"></main></div>`;
  };

  function outils(avecStats) {
    const on = ITEMS.filter(s => s.publier).length, pr = ITEMS.filter(s => s.promo).length, ok = ITEMS.filter(s => s.oblig.length && !s.manque.length).length, tot = ITEMS.length || 1;
    const st = avecStats ? `<div class="mdb-stats">
        <div class="mdb-stat"><b>${ITEMS.length}</b><span>séries dans la base</span></div>
        <div class="mdb-stat"><b>${on}</b><span>sur le site</span><div class="br"><i style="width:${on / tot * 100}%;background:var(--ok)"></i></div></div>
        <div class="mdb-stat"><b>${pr}</b><span>promo réseaux faite</span><div class="br"><i style="width:${pr / tot * 100}%;background:var(--bl)"></i></div></div>
        <div class="mdb-stat"><b>${ok}</b><span>fiches complètes ★</span><div class="br"><i style="width:${ok / tot * 100}%;background:var(--amber)"></i></div></div></div>` : "";
    return st + `<div class="mdb-tools"><input class="mdb-q" id="q" type="search" placeholder="Chercher une série, un titre japonais…" value="${esc(Q)}" autocomplete="off">
        <select class="mdb-tri" id="mdb-tri" aria-label="Trier">${TRIS.map(([k, l]) => `<option value="${k}"${T === k ? " selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="mdb-fs">${FILTRES.map(([k, , f]) => `<button data-mf="${k}" aria-pressed="${!Q && F === k}">${LABELS[k] || k} <small>${ITEMS.filter(f).length}</small></button>`).join("")}</div>`;
  }

  // ---------- Fiche détaillée ----------
  const TOMES = {};
  function fiche(s) {
    const tabs = [["infos", "Infos"], ["textes", "Textes"], ["visuels", "Visuels"], ["tomes", "Tomes"]];
    const T5 = { resumeImg: ["Résumé image", s.resumeImg, I.txt], resume: ["Résumé site", s.resume, I.txt], ig: ["Instagram", s.leg && s.leg.ig, I.ig], tt: ["TikTok", s.leg && s.leg.tt, I.tt], x: ["X", s.leg && s.leg.x, I.xl] };
    let body = "";
    if (M.tab === "infos") {
      body = `<div class="mdb-pn"><h3>Prête à publier ?</h3><p class="hint">Les éléments ★ obligatoires de la fiche.</p>
        <div class="mdb-chk">${s.oblig.map(o => `<div class="${o.ok ? "" : "ko"}">${o.ok ? I.ok : I.ko}${esc(o.k)}</div>`).join("")}</div>
        <div class="mdb-nr"><div class="mdb-nb"><span>Fiche</span><input id="mdb-num" type="number" min="1" inputmode="numeric" value="${s.num || ""}" placeholder="auto"${verrou(s) ? " disabled" : ""}></div>
          <button class="bt g" data-mnum>${verrou(s) ? I.lock + "Numéro verrouillé" : "Enregistrer le numéro"}</button>
          <span class="hint" id="mdb-numw">${verrou(s) ? "La fiche a déjà été postée : son numéro ne bouge plus." : "Vide = rangée automatiquement après les numéros choisis."}</span></div>
        <div class="mdb-info">
          <div><label>Réseaux des auteurs</label><p>${s.sns && s.sns.tot ? `${s.sns.ok}/${s.sns.tot} trouvés` : "—"}</p></div>
          <div><label>${FR} Extrait FR</label><p>${s.exFR ? (s.exFR.lien ? "Trouvé" : s.exFR.aucun ? "Aucun (vérifié)" : "À chercher") : "—"}</p></div>
          <div><label>Prochaine sortie</label><p>${s.next ? `${esc(s.next.pays || "")} · ${jj(s.next.d)}` : "—"}</p></div>
          <div><label>Mise en ligne</label><p>${s.date ? s.date.split("-").reverse().join("/") : "—"}</p></div></div></div>`;
    }
    if (M.tab === "textes") {
      const lim = { resumeImg: 300, resume: 0, ig: 2200, tt: 2200, x: 280 };
      body = `<div class="mdb-pn"><div class="mdb-ttabs">${Object.entries(T5).map(([k, v]) => `<button data-mtx="${k}" aria-pressed="${M.tx === k}">${v[2]}${v[0]}</button>`).join("")}</div>
        <div class="mdb-ed"><div>${Object.entries(T5).map(([k, v]) => `<textarea class="mdb-ta" data-f="${k}" aria-label="${v[0]}"${M.tx === k ? "" : " hidden"}>${esc(v[1] || "")}</textarea>`).join("")}
          <div class="mdb-tf"><span class="hint" id="mdb-cnt" data-lim="${lim[M.tx]}"></span><span style="display:flex;gap:8px"><button class="bt g" data-mcp>${I.copy}Copier</button><button class="bt p" data-msave>Enregistrer les textes</button></span></div></div>
          <div class="mdb-prev"><div class="h"><i>不良</i>furyogang</div>${s.cover ? `<img src="${couv(s, 400)}" alt="">` : ""}<p id="mdb-pv">${esc(T5[M.tx][1] || "")}</p></div></div></div>`;
    }
    if (M.tab === "visuels") {
      // Les textareas restent présentes (cachées) : l'image « Nouvelle fiche » lit le résumé tel qu'il est saisi.
      body = `<div class="mdb-pn"><h3>Image « Nouvelle fiche »</h3><p class="hint">Générée avec le résumé image et le numéro de fiche.</p>
        <div class="mdb-vis"><div><b>Post 3:4</b><button class="bt p" data-mdl="post">${I.dl}Télécharger</button></div><div><b>Story 9:16</b><button class="bt p" data-mdl="story">${I.dl}Télécharger</button></div></div>
        <div hidden><textarea data-f="resumeImg">${esc(s.resumeImg || "")}</textarea><textarea data-f="resume">${esc(s.resume || "")}</textarea></div></div>`;
    }
    if (M.tab === "tomes") {
      const t = TOMES[s.slug];
      if (t === undefined) { TOMES[s.slug] = null; fetch(`/api/serie?s=${encodeURIComponent(s.slug)}`).then(r => r.ok ? r.json() : null).then(j => { TOMES[s.slug] = j && j.editions ? j.editions : []; if (M.tab === "tomes") draw(); }).catch(() => { TOMES[s.slug] = []; draw(); }); }
      const eds = TOMES[s.slug];
      body = `<div class="mdb-pn"><h3>Tomes</h3>${!eds ? `<p class="hint">Chargement…</p>` : !eds.length ? `<p class="hint">Tomes visibles quand la série est sur le site.</p>` :
        eds.map(e => `<p class="hint" style="margin:14px 0 10px">${e.pays === "France" ? FR : JP} <b style="color:var(--paper)">${esc(e.pub || e.nom || "")}</b> · ${esc(e.format || "")} · ${e.nb || (e.tomes || []).length} tomes</p>
          <div class="mdb-tomes">${(e.tomes || []).slice(0, 60).map(x => `<div class="mdb-tome">${x.cover ? `<img src="/api/couv?w=240&u=${encodeURIComponent(x.cover)}" alt="" loading="lazy">` : `<span class="ph">${x.n}</span>`}<b>Tome ${String(x.n).padStart(2, "0")}</b><small>${x.date ? x.date.split("-").reverse().join("/") : "Date à venir"}</small></div>`).join("")}</div>`).join("")}</div>`;
    }
    const stF = s.stFR && s.stFR !== "Non licencié" ? s.stFR : "Pas encore en France";
    return `<div class="mdb-det" data-mdet="${s.id}">
      <section class="mdb-hero"><div class="cv">${img(s, 500)}</div>
        <div style="min-width:0"><h2>${esc(nomS(s))}</h2>${s.jp ? `<div class="hj jp">${esc(s.jp)}</div>` : ""}
          ${s.scen || s.dess ? `<div class="ln">${s.scen && s.dess && s.scen !== s.dess ? `Histoire : <b>${esc(s.scen)}</b> · Dessin : <b>${esc(s.dess)}</b>` : `Auteur : <b>${esc(s.scen || s.dess)}</b>`}</div>` : ""}
          <div class="ln">${FR}<b>${esc(stF)}</b>${s.pubFR ? " · " + esc(s.pubFR) : ""}</div>
          <div class="ln">${JP}<b>${esc(s.stJP || "—")}</b>${s.y1 ? " · depuis " + s.y1 : ""}</div>
          ${s.resume ? `<p class="rs">${esc(s.resume)}</p>` : `<p class="rs hint">Pas encore de résumé.</p>`}
          <div class="mdb-tags">${s.type ? `<span class="b">${esc(s.type)}</span>` : ""}${(s.genres || []).slice(0, 5).map(g => `<span>${esc(g)}</span>`).join("")}</div></div>
        <div class="ctl">${hrt(s)}
          <button class="tg" data-mon="${s.id}" aria-pressed="${!!s.publier}"><span class="sw"></span>Sur le site</button>
          <button class="tg pr" data-mpr="${s.id}" aria-pressed="${!!s.promo}"><span class="sw"></span>Promo réseaux</button>${s.promoLe ? `<small>postée le ${s.promoLe.split("-").reverse().join("/")}</small>` : ""}
          <span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${s.visible ? `<a class="bt g" style="padding:7px 11px;font-size:12.5px" href="/series/${esc(s.slug)}" target="_blank" rel="noopener">${I.ext}Site</a>` : ""}<a class="bt g" style="padding:7px 11px;font-size:12.5px" href="${esc(s.notion)}" target="_blank" rel="noopener">${I.ext}Notion</a></span></div>
      </section>
      <div class="mdb-tabs">${tabs.map(([k, l]) => `<button data-mtab="${k}" aria-pressed="${M.tab === k}">${l}${k === "infos" ? ` <small>★ ${okN(s)}/${s.oblig.length}</small>` : ""}</button>`).join("")}</div>
      ${body}</div>`;
  }

  // ---------- Vues ----------
  const ligneL = (s, i) => `<div class="mdb-sr" data-msel="${s.id}" aria-current="${M.sel === s.id}">${T === "ordre" && !s.publier ? `<span class="rk">${i + 1}</span>` : ""}${img(s, 100)}<span class="x"><b>${esc(nomS(s))}</b><small>${s.publier ? "Sur le site" : "Pas sur le site"}${s.promo ? " · promo " + jj(s.promoLe) : ""} · ★ ${okN(s)}/${s.oblig.length}</small></span>${s.coeur ? `<span class="hrt" aria-pressed="true">${I.heart}</span>` : ""}</div>`;
  const carteA = s => `<div class="mdb-ca" data-mop="${s.id}"><div class="im">${img(s, 320)}<div class="tl">${stSite(s)}${hrt(s)}</div><div class="ov"><span class="num">${nfmt(s.num)}</span><span style="flex:1"></span>${ring(s)}</div></div><h3>${esc(nomS(s))}</h3><div class="jp">${esc(s.jp || "")}</div></div>`;
  const ligneB = s => `<tr data-mop="${s.id}"><td class="num">${nfmt(s.num)}</td><td><span class="who">${img(s, 100)}<span style="min-width:0"><b>${esc(nomS(s))}</b><small class="jp">${esc(s.jp || "")}</small></span></span></td><td>${s.type ? `<span class="pill">${esc(s.type)}</span>` : ""}</td>
    <td><span style="display:flex;align-items:center;gap:8px;min-width:120px">${pbar(s)}<span class="num">${okN(s)}/${s.oblig.length}</span></span></td>
    <td><button class="tg" data-mon="${s.id}" aria-pressed="${!!s.publier}" aria-label="Sur le site"><span class="sw"></span></button></td>
    <td><button class="tg pr" data-mpr="${s.id}" aria-pressed="${!!s.promo}" aria-label="Promo réseaux"><span class="sw"></span></button> <span class="hint">${jj(s.promoLe)}</span></td><td>${hrt(s)}</td></tr>`;

  const VUE = {
    liste() {
      const L = liste();
      if (DEEP) { M.sel = DEEP; DEEP = ""; }
      if (!M.sel || !L.some(s => s.id === M.sel)) M.sel = L[0] ? L[0].id : null;
      const cur = byId(M.sel);
      const etroit = matchMedia("(max-width:980px)").matches;
      if (etroit && M.open) return `<button class="mdb-back" data-mclose>${I.left}Retour à la liste</button>` + fiche(byId(M.open));
      return outils(false) + `<div class="mdb-split"><div class="mdb-sl" id="mdb-sl">${L.map(ligneL).join("") || `<p class="mdb-vide">Rien ici.</p>`}</div><div class="mdb-det-w" style="min-width:0">${cur ? fiche(cur) : ""}</div></div>`;
    },
    vitrine() {
      const L = liste();
      return outils(true) + `<div class="mdb-ga">${L.slice(0, M.lim).map(carteA).join("")}</div>${L.length > M.lim ? `<button class="mdb-more" data-mplus>Afficher plus (${L.length - M.lim})</button>` : ""}` +
        (M.open ? `<div class="mdb-scrim" data-mclose></div><aside class="mdb-drawer"><button class="mdb-close" data-mclose>${I.x}Fermer</button>${fiche(byId(M.open))}</aside>` : "");
    },
    tableau() {
      if (M.open) return `<button class="mdb-back" data-mclose>${I.left}Retour au tableau</button>` + fiche(byId(M.open));
      const L = liste();
      return outils(true) + `<div class="mdb-tw"><table class="mdb-tb"><thead><tr><th>N°</th><th>Série</th><th>Type</th><th>Éléments ★</th><th>Sur le site</th><th>Promo réseaux</th><th></th></tr></thead><tbody>${L.slice(0, M.lim).map(ligneB).join("")}</tbody></table></div>${L.length > M.lim ? `<button class="mdb-more" data-mplus>Afficher plus (${L.length - M.lim})</button>` : ""}`;
    },
    avancement() {
      if (M.open) return `<button class="mdb-back" data-mclose>${I.left}Retour à l'avancement</button>` + fiche(byId(M.open));
      const L = liste(), cols = [["À compléter", "#E54839", s => !s.publier && !pret(s)], ["Prête à publier", "#F2B33D", s => pret(s)], ["Sur le site", "#7BC67E", s => s.publier && !s.promo], ["Promo réseaux faite", "#0A84FF", s => s.promo]];
      M.kb = M.kb || {};
      return outils(true) + `<div class="mdb-kb">${cols.map(([t, c, f], i) => { const C = L.filter(f), n = M.kb[i] || 12;
        return `<div class="mdb-col"><h3><i style="background:${c}"></i>${t} <small>${C.length}</small></h3>${C.slice(0, n).map(s => `<div class="mdb-kc" data-mop="${s.id}">${img(s, 100)}<div class="mn"><b>${esc(nomS(s))}</b><div class="m">${pbar(s)}<span class="num">${okN(s)}/${s.oblig.length}</span></div>${s.promoLe ? `<small class="hint">postée le ${jj(s.promoLe)}</small>` : ""}</div>${s.coeur ? `<span class="hrt" aria-pressed="true">${I.heart}</span>` : ""}</div>`).join("")}${C.length > n ? `<button class="plus" data-mkb="${i}">+ ${C.length - n} autres</button>` : ""}</div>`; }).join("")}</div>`;
    },
    ordre() {
      if (M.open) return `<button class="mdb-back" data-mclose>${I.left}Retour à l'ordre</button>` + fiche(byId(M.open));
      const fixes = ITEMS.filter(s => s.num).sort((a, b) => a.num - b.num);
      const n = slugify(Q), keep = (FILTRES.find(x => x[0] === F) || FILTRES[4])[2];
      const autres = ITEMS.filter(s => !s.num && (n ? slugify([s.t, s.fr, s.jp].join(" ")).includes(n) : keep(s))).sort(ordrePub);
      const plan = planning();
      const row = (s, lock) => `<div class="mdb-qi" data-mop="${s.id}"${s.num && !lock ? ` draggable="true" data-mdrag="${s.id}"` : ""}><span class="gp">${s.num && !lock ? I.grip : ""}</span>
        <span class="n${!s.num ? " au" : lock ? " lk" : ""}">${s.num ? String(s.num).padStart(3, "0") : "—"}</span>${img(s, 100)}
        <span style="min-width:0"><b>${esc(nomS(s))}</b><span class="d">${lock ? `${I.lock} postée le ${jj(s.promoLe) || "?"}` : plan.date[s.id] ? `prévue le ${plan.date[s.id].split("-").reverse().join("/")}` : esc(s.jp || "")}</span></span>
        <span class="ac">${stSite(s)}${s.num && !lock ? `<button class="mdb-sb" data-mmv="${s.id}" data-dir="-1" aria-label="Monter">${I.up}</button><button class="mdb-sb" data-mmv="${s.id}" data-dir="1" aria-label="Descendre">${I.down}</button><button class="mdb-sb" data-munfix="${s.id}">Retirer</button>` : !s.num ? `<button class="mdb-sb" data-mfix="${s.id}">Lui donner le n°${(fixes.length ? fixes[fixes.length - 1].num : 0) + 1}</button>` : ""}${hrt(s)}</span></div>`;
      const prochaines = plan.file.slice(0, 6);
      return outils(false) + `<div class="mdb-q2"><div class="mdb-ql">
          <div class="mdb-qh"><h3>Numéros choisis</h3><span>${fixes.length} séries · glisse pour changer l'ordre (les fiches déjà postées ne bougent plus)</span></div>
          <div id="mdb-fixes">${fixes.map(s => row(s, verrou(s))).join("") || `<p class="mdb-vide">Aucun numéro choisi pour l'instant.</p>`}</div>
          <div class="mdb-qh" style="margin-top:10px"><h3>Sans numéro</h3><span>rangées automatiquement après · ${autres.length} séries</span></div>
          ${autres.slice(0, M.lim).map(s => row(s, false)).join("")}${autres.length > M.lim ? `<button class="mdb-more" data-mplus>Afficher plus (${autres.length - M.lim})</button>` : ""}</div>
        <div class="mdb-side"><div class="mdb-box"><h4>Prochaines fiches</h4><p class="hint" style="margin:-4px 0 10px">${joursTxt()} à ${CAL.heure}, à partir du ${CAL.depart.split("-").reverse().join("/")}</p>
          <div class="mdb-mini">${prochaines.map(x => `<div data-mop="${x.s.id}">${img(x.s, 80)}<b>${esc(nomS(x.s))}</b><em>${jj(x.d)}</em></div>`).join("") || `<p class="hint">Donne des numéros aux séries pour remplir le planning.</p>`}</div>
          <button class="bt g" style="margin-top:12px;width:100%;justify-content:center" data-mvue="calendrier">Voir le calendrier</button></div></div></div>`;
    },
    calendrier() {
      if (M.open) return `<button class="mdb-back" data-mclose>${I.left}Retour au calendrier</button>` + fiche(byId(M.open));
      const now = new Date(), base = M.mois || CAL.depart.slice(0, 7);
      const [y, m] = base.split("-").map(Number), first = new Date(Date.UTC(y, m - 1, 1)), nb = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const plan = planning(), ev = {};
      ITEMS.filter(s => s.promo && s.promoLe).forEach(s => (ev[s.promoLe] = ev[s.promoLe] || []).push({ s, fait: true }));
      plan.file.forEach(x => (ev[x.d] = ev[x.d] || []).push({ s: x.s, fait: false }));
      const decal = (first.getUTCDay() + 6) % 7, auj = now.toISOString().slice(0, 10), cells = [];
      for (let i = 0; i < decal; i++) cells.push(`<div class="mdb-day vide"></div>`);
      for (let d = 1; d <= nb; d++) {
        const k = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(), pj = CAL.jours.includes(wd) && k >= CAL.depart, E = ev[k] || [];
        cells.push(`<div class="mdb-day${pj ? " pj" : ""}${k === auj ? " auj" : ""}${!pj && !E.length ? " nojour" : ""}"><div class="dt">${d}${pj ? `<small>${CAL.heure}</small>` : ""}</div>
          ${E.map(e => `<div class="mdb-ev" data-mop="${e.s.id}" title="${esc(nomS(e.s))}"><div class="cv">${img(e.s, 220)}<span class="tag${e.fait ? " dn2" : ""}">${e.fait ? "Postée" : nfmt(e.s.num)}</span></div><b>${esc(nomS(e.s))}</b></div>`).join("")}
          ${pj && !E.length ? `<span class="libre">Créneau libre</span>` : ""}</div>`);
      }
      const mm = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
      const NJ = [["L", 1], ["M", 2], ["M", 3], ["J", 4], ["V", 5], ["S", 6], ["D", 0]];
      return `<div class="mdb-calh"><button class="mdb-sb" data-mmois="-1" aria-label="Mois précédent">${I.left}</button><h2>${mm}</h2><button class="mdb-sb" data-mmois="1" aria-label="Mois suivant">${I.right}</button><span class="sp"></span>
          <span class="hint">Jours de publication</span><span class="mdb-jours">${NJ.map(([l, v]) => `<button data-mjour="${v}" aria-pressed="${CAL.jours.includes(v)}">${l}</button>`).join("")}</span>
          <span class="hint">à partir du</span><input class="mdb-date" type="date" id="mdb-depart" value="${CAL.depart}"></div>
        <div class="mdb-cal">${["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(x => `<div class="dn">${x}</div>`).join("")}${cells.join("")}</div>
        <div class="mdb-leg"><span><i style="background:#BC002D"></i>Jour de publication</span><span><i style="background:#0A84FF"></i>Fiche déjà postée (date de la promo réseaux)</span><span>Les fiches prévues suivent l'ordre des numéros choisis (vue Ordre des fiches).</span></div>`;
    }
  };
  function joursTxt() { const n = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]; const j = CAL.jours.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(x => n[x]); return j.length ? j.join(" et ").replace(/^./, c => c.toUpperCase()) : "Aucun jour choisi"; }
  // Planning des fiches : les séries avec un numéro, pas encore postées, dans l'ordre des numéros, sur les prochains jours de publication.
  function planning() {
    const file = ITEMS.filter(s => s.num && !s.promo).sort((a, b) => a.num - b.num), out = [], date = {};
    if (!CAL.jours.length) return { file: [], date };
    const auj = new Date().toISOString().slice(0, 10);
    let d = new Date((CAL.depart > auj ? CAL.depart : auj) + "T12:00:00Z");
    for (const s of file) {
      while (!CAL.jours.includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
      const k = d.toISOString().slice(0, 10); out.push({ s, d: k }); date[s.id] = k; d.setUTCDate(d.getUTCDate() + 1);
    }
    return { file: out, date };
  }

  window.draw = function () {
    if (!document.getElementById("mdb-main")) shell();
    if (DEEP) { M.vue = "liste"; M.open = null; }
    document.getElementById("mdb-vues").innerHTML = VUES.map(([k, l]) => `<button data-mvue="${k}" aria-pressed="${M.vue === k}">${l}</button>`).join("");
    const main = document.getElementById("mdb-main"), ae = document.activeElement, qf = ae && ae.id === "q", pos = qf ? ae.selectionStart : 0;
    const sl = document.getElementById("mdb-sl"), slTop = sl ? sl.scrollTop : 0;
    main.innerHTML = VUE[M.vue]();
    const sl2 = document.getElementById("mdb-sl"); if (sl2) sl2.scrollTop = slTop;
    if (qf) { const q = document.getElementById("q"); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (e) {} } }
    document.body.style.overflow = M.open && M.vue === "vitrine" ? "hidden" : "";
    compte();
  };
  window.plusM = function () {};

  // Compteur du texte affiché (X : un lien compte pour 23 caractères).
  function compte() {
    const c = document.getElementById("mdb-cnt"); if (!c) return;
    const ta = document.querySelector(`.mdb-ta[data-f="${M.tx}"]`); if (!ta) return;
    const v = ta.value, n = M.tx === "x" ? v.replace(/furyogang\.com\/\S*/g, "x".repeat(23)).length : v.length, lim = +c.dataset.lim;
    c.textContent = lim ? `${n} / ${lim} caractères` : `${n} caractères`; c.className = "hint" + (lim && n > lim ? " ko" : "");
    const pv = document.getElementById("mdb-pv"); if (pv) pv.textContent = v.slice(0, 360);
  }

  // Envoi vers Notion (mêmes champs que l'ancienne base).
  async function maj(s, patch, el) {
    el && el.classList.add("busy");
    try {
      const r = await fetch("/api/admin/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: s.id, slug: s.slug, date: s.date, ...patch }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { login("Session expirée, reconnecte-toi."); return false; }
      if (!r.ok) throw new Error(j.error || "Erreur");
      Object.assign(s, patch, { statut: j.statut, publier: j.publier, promo: typeof j.promo === "boolean" ? j.promo : s.promo, promoLe: "promoLe" in j ? j.promoLe : s.promoLe, date: j.date || s.date });
      return true;
    } catch (e) { toast(String(e.message || e).slice(0, 80)); return false; }
    finally { el && el.classList.remove("busy"); }
  }

  document.addEventListener("click", async e => {
    if (!e.target.closest(".mdb")) return;
    const t = e.target.closest("[data-mvue],[data-mf],[data-msel],[data-mop],[data-mclose],[data-mh],[data-mon],[data-mpr],[data-mtab],[data-mtx],[data-msave],[data-mcp],[data-mdl],[data-mnum],[data-mplus],[data-mkb],[data-mfix],[data-munfix],[data-mmv],[data-mmois],[data-mjour]");
    if (!t) return;
    const d = t.dataset;
    if (d.mvue) { M.vue = d.mvue; M.open = null; M.lim = 120; try { localStorage.setItem("mdb-vue", M.vue); } catch (_) {} draw(); scrollTo(0, 0); return; }
    if (d.mh) { e.stopPropagation(); const s = byId(d.mh); if (await maj(s, { coeur: !s.coeur })) { toast(s.coeur ? "Coup de cœur ✓" : "Coup de cœur retiré"); draw(); } return; }
    if (d.mon) { e.stopPropagation(); const s = byId(d.mon); if (await maj(s, { statut: s.publier ? "À valider" : "En ligne · public" }, t)) { toast(s.publier ? "Sur le site, visible par tout le monde ✓" : "Retirée du site"); draw(); } return; }
    if (d.mpr) { e.stopPropagation(); const s = byId(d.mpr); if (await maj(s, { promo: !s.promo }, t)) { toast(s.promo ? "Promo réseaux faite ✓" : "Promo réseaux annulée"); draw(); } return; }
    if (d.mf) { F = d.mf; Q = ""; M.lim = 120; draw(); return; }
    if (d.msel) { M.sel = d.msel; M.tab = M.tab || "infos"; if (matchMedia("(max-width:980px)").matches) { M.open = d.msel; scrollTo(0, 0); } draw(); return; }
    if (d.mop) { M.open = d.mop; if (M.vue === "liste") M.sel = d.mop; if (M.vue !== "vitrine") scrollTo(0, 0); draw(); return; }
    if ("mclose" in d) { M.open = null; draw(); return; }
    if (d.mtab) { M.tab = d.mtab; draw(); return; }
    if (d.mtx) { M.tx = d.mtx; document.querySelectorAll(".mdb-ta").forEach(x => x.hidden = x.dataset.f !== M.tx); document.querySelectorAll("[data-mtx]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mtx === M.tx)); const c = document.getElementById("mdb-cnt"); if (c) c.dataset.lim = { resumeImg: 300, resume: 0, ig: 2200, tt: 2200, x: 280 }[M.tx]; compte(); return; }
    const det = t.closest("[data-mdet]"), s = det && byId(det.dataset.mdet);
    if ("msave" in d && s) { const v = k => (det.querySelector(`.mdb-ta[data-f="${k}"]`) || {}).value || "";
      const p = { resume: v("resume").trim(), resumeImg: v("resumeImg").trim(), legIG: v("ig"), legTT: v("tt"), legX: v("x") };
      if (await maj(s, p, t)) { s.leg = { ig: p.legIG, tt: p.legTT, x: p.legX }; toast("Textes enregistrés ✓"); } return; }
    if ("mcp" in d && s) { const ta = det.querySelector(`.mdb-ta[data-f="${M.tx}"]`); copier(ta ? ta.value : "").then(ok => toast(ok ? "Copié ✓" : "Copie impossible, sélectionne le texte à la main")); return; }
    if (d.mdl && s) { imageFiche(s, d.mdl, det, t); return; }
    if ("mnum" in d && s) { if (verrou(s)) return; const v = document.getElementById("mdb-num").value, n = +v || null;
      const autre = n && ITEMS.find(x => x !== s && x.num === n); if (autre) { document.getElementById("mdb-numw").textContent = `Déjà pris par ${nomS(autre)}`; return; }
      if (await maj(s, { num: v }, t)) { s.num = n; AV = null; toast(n ? `Fiche n°${n} ✓` : "Numéro automatique ✓"); draw(); } return; }
    if ("mplus" in d) { M.lim += 120; draw(); return; }
    if (d.mkb) { M.kb[d.mkb] = (M.kb[d.mkb] || 12) + 24; draw(); return; }
    if (d.mfix) { e.stopPropagation(); const x = byId(d.mfix), max = Math.max(0, ...ITEMS.map(i => i.num || 0)); if (await maj(x, { num: String(max + 1) })) { x.num = max + 1; AV = null; toast(`${nomS(x)} : fiche n°${max + 1} ✓`); draw(); } return; }
    if (d.munfix) { e.stopPropagation(); const x = byId(d.munfix); if (await maj(x, { num: "" })) { x.num = null; AV = null; toast("Numéro retiré"); draw(); } return; }
    if (d.mmv) { e.stopPropagation(); const libres = ITEMS.filter(i => i.num && !verrou(i)).sort((a, b) => a.num - b.num), i = libres.findIndex(i => i.id === d.mmv), j = i + Number(d.dir);
      if (i < 0 || j < 0 || j >= libres.length) return; await echanger(libres[i], libres[j]); return; }
    if (d.mmois) { const b = M.mois || CAL.depart.slice(0, 7); let [y, m] = b.split("-").map(Number); m += Number(d.mmois); if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } M.mois = `${y}-${String(m).padStart(2, "0")}`; draw(); return; }
    if (d.mjour) { const v = +d.mjour; CAL.jours = CAL.jours.includes(v) ? CAL.jours.filter(x => x !== v) : CAL.jours.concat(v); sauverCal(); draw(); return; }
  });
  function sauverCal() { try { localStorage.setItem("mdb-cal", JSON.stringify(CAL)); } catch (e) {} }
  async function echanger(a, b) {
    const na = a.num, nb = b.num;
    // Passage par un numéro temporaire impossible (Notion accepte deux fiches au même numéro un court instant) : on écrit les deux.
    const ok = (await Promise.all([maj(a, { num: String(nb) }), maj(b, { num: String(na) })])).every(Boolean);
    if (ok) { a.num = nb; b.num = na; AV = null; toast("Ordre mis à jour ✓"); }
    draw();
  }
  // Glisser-déposer des numéros choisis (ordinateur). On réattribue les mêmes numéros, dans le nouvel ordre.
  document.addEventListener("dragstart", e => { const r = e.target.closest && e.target.closest("[data-mdrag]"); if (!r) return; M.drag = r.dataset.mdrag; r.classList.add("dg"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", M.drag); } catch (_) {} });
  document.addEventListener("dragover", e => { const r = e.target.closest && e.target.closest("[data-mdrag]"); if (!M.drag || !r) return; e.preventDefault(); document.querySelectorAll(".mdb-qi.ov").forEach(x => x.classList.remove("ov")); r.classList.add("ov"); });
  document.addEventListener("dragend", () => { M.drag = null; document.querySelectorAll(".mdb-qi.dg,.mdb-qi.ov").forEach(x => x.classList.remove("dg", "ov")); });
  document.addEventListener("drop", async e => {
    const r = e.target.closest && e.target.closest("[data-mdrag]"); if (!M.drag || !r) return; e.preventDefault();
    const libres = ITEMS.filter(i => i.num && !verrou(i)).sort((a, b) => a.num - b.num), nums = libres.map(i => i.num);
    const from = libres.findIndex(i => i.id === M.drag), to = libres.findIndex(i => i.id === r.dataset.mdrag); M.drag = null;
    if (from < 0 || to < 0 || from === to) { draw(); return; }
    const ordre = libres.slice(); const [x] = ordre.splice(from, 1); ordre.splice(to, 0, x);
    const chg = ordre.map((s, k) => [s, nums[k]]).filter(([s, n]) => s.num !== n);
    const ok = (await Promise.all(chg.map(([s, n]) => maj(s, { num: String(n) })))).every(Boolean);
    chg.forEach(([s, n]) => { if (ok) s.num = n; }); AV = null; toast(ok ? "Ordre mis à jour ✓" : "Une partie n'a pas été enregistrée"); draw();
  });
  document.addEventListener("input", e => {
    if (!e.target.closest || !e.target.closest(".mdb")) return;
    if (e.target.id === "q") { Q = e.target.value.trim(); M.lim = 120; draw(); return; }
    if (e.target.classList.contains("mdb-ta")) compte();
  });
  document.addEventListener("change", e => {
    if (e.target.id === "mdb-tri") { T = e.target.value; draw(); }
    if (e.target.id === "mdb-depart" && /^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) { CAL.depart = e.target.value; M.mois = CAL.depart.slice(0, 7); sauverCal(); draw(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && M.open && document.querySelector(".mdb")) { M.open = null; draw(); } });
})();
