// Menu admin (clic sur l'avatar), maquette H1 validée par Will le 25/10/2026.
// Ordinateur : Actualités + Couvertures empilées | Mangas Database ; la famille du gang | 6 raccourcis ;
// Aujourd'hui (news du jour, heure à gauche) | To-do. Téléphone : tout l'un sous l'autre, heure en haut à droite des cartes (variante B).
// Données : /api/admin/tableau (un seul appel, gardé 1 min côté serveur). Chargé par header.js.
(function () {
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var CAT = { "licence-fr": ["#529CCA", "仏版"], "licence-jp": ["#FF7369", "連載"], serie: ["#FF7369", "連載"], "couv-fr": ["#9A6DD7", "表紙"], "couv-jp": ["#4DAB9A", "表紙"], "sortie-fr": ["#E255A1", "発売"], "sortie-jp": ["#FFA344", "発売"], fin: ["#BA856F", "完結"], pause: ["#9B9A97", "休載"], anime: ["#FFDC49", "放送"], adaptation: ["#9B9A97", "実写"], "bande-annonce": ["#9A6DD7", "予告"], tirage: ["#529CCA", "部数"], extrait: ["#E5483A", "試読"], news: ["#D4D4D8", "速報"] };
  var S = {
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11.5l2.2 2.2L16 9"/><rect x="4" y="4" width="16" height="16" rx="4"/></svg>',
    couv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>',
    db: '<svg viewBox="0 0 24 24"><g fill="#fff"><rect x="3.3" y="6" width="3.1" height="13" rx="0.7"/><rect x="7.1" y="4.3" width="3.1" height="14.7" rx="0.7"/><rect x="14.9" y="7" width="3.1" height="12" rx="0.7"/><rect x="2" y="19" width="20" height="2.5" rx="1.25"/></g><rect x="10.9" y="5.2" width="3.3" height="13.8" rx="0.7" fill="#E54839"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/></svg>',
    pm: '<svg viewBox="0 0 40 40"><path fill="#0095F6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"/><path fill="#fff" d="m17.204 27.822-7.1-7.115 2.2-2.193 4.9 4.909 10.396-10.414 2.2 2.193Z"/></svg>',
    hq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8l8-4 8 4v12"/><path d="M3 20h18M9.5 20v-4h5v4"/></svg>',
    st: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    cm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/><circle cx="18" cy="7" r="3"/><path d="M18 13c2.6.2 4 2.3 4 4.8"/></svg>',
    bo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    se: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };
  var CSS = [

    /* Calendrier éditorial (Will, 27/10/2026, maquette cal 2) : les jours en haut, 4 jours en grand, design du calendrier du QG */
    ".apc{background:#0c0c0e;border:1px solid #232327;border-radius:20px;padding:14px;margin-bottom:12px}",
    ".apc-t{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}.apc-t h2{margin:0 6px 0 2px;font:700 30px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}",
    ".apc-dc{display:flex;align-items:center;gap:10px;background:#141416;border-radius:14px;padding:6px 6px 6px 14px}.apc-dc .k{display:block;font:700 10.5px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#3d8bff}.apc-dc .v{display:block;font:700 17px/1.1 Antonio,sans-serif;text-transform:uppercase}",
    ".apc-ar{width:34px;height:34px;border:0;border-radius:10px;background:#1f1f24;color:#fff;font:700 16px Inter,sans-serif;cursor:pointer}.apc-ar:disabled{opacity:.3;cursor:default}",
    ".apc-lg{display:flex;gap:12px;align-items:center;font:600 12px Inter,sans-serif;color:#8c8c93}.apc-lg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}",
    ".apc-go{margin-left:auto;height:40px;padding:0 16px;border-radius:12px;background:#2A6FD0;color:#fff!important;font:700 14px Inter,sans-serif;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}",
    ".apc-pl{display:flex;gap:7px;margin-bottom:12px}.apc-pl button{flex:1;min-width:0;border:0;color:#F5F5F7;text-align:center;background:#141416;border-radius:13px;padding:8px 0 7px;position:relative;cursor:pointer}",
    ".apc-pl b{display:block;font:700 22px/1 Antonio,sans-serif}.apc-pl small{display:block;font:700 10px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8c8c93;margin-top:3px}.apc-pl .on{background:#2A6FD0}.apc-pl .on small{color:#dbe7ff}.apc-pl .apc-auj:not(.on) b{color:#3d8bff}",
    ".apc-pl i{position:absolute;top:-5px;right:6px;min-width:18px;height:18px;border-radius:9px;background:#2a2a30;color:#fff;font:800 10.5px/18px Inter,sans-serif;font-style:normal;padding:0 5px}",
    ".apc-pl .br{display:flex;gap:2px;justify-content:center;margin:5px auto 0;width:70%;height:3px}.apc-pl .br span{flex:1;max-width:14px;height:3px;border-radius:2px}",
    ".apc-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}",
    ".apc-col{background:#17171b;border-radius:14px;padding:10px 7px 8px;min-height:150px}",
    ".apc-col h4{margin:0 2px 9px;display:flex;align-items:baseline;gap:4px;font:700 13px Antonio,sans-serif;text-transform:uppercase;color:#8c8c93}.apc-col h4 b{font:700 20px/1 Antonio,sans-serif;color:#fff}.apc-col.apc-auj h4 b{color:#3d8bff}.apc-col h4 em{margin-left:auto;font:700 9.5px Inter,sans-serif;font-style:normal;letter-spacing:.08em;color:#3d8bff}",
    ".apc-cd{display:flex;gap:8px;align-items:flex-start;background:#1f1f24;border-radius:10px;padding:6px;margin-bottom:6px;position:relative;transition:background .15s}.apc-cd:hover{background:#26262c}",
    ".apc-cd .cv{width:28px;height:39px;border-radius:4px;flex:none;background:#2a2a30 center/cover}.apc-cd .cv.kj{background:#BC002D;display:grid;place-items:center;color:#fff;font:900 11px/1.05 'Noto Sans JP',sans-serif;writing-mode:vertical-rl;letter-spacing:.05em}",
    ".apc-cd .tx{min-width:0;flex:1}.apc-cd b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:700 12px/1.22 Inter,sans-serif;padding-right:12px}",
    ".apc-cd small{display:block;font:700 10px Antonio,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#8c8c93;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".apc-cd .d{position:absolute;right:6px;top:7px;width:8px;height:8px;border-radius:50%}.apc-p{background:#4DAB9A}.apc-a{background:#F2B33D}.apc-r{background:#ff5a5a}",
    ".apc-more{display:block;text-align:center;font:700 12px Inter,sans-serif;color:#8c8c93;padding:4px}.apc-vide{color:#55555c;margin:4px 3px;font-size:13px}",
    ".apc-tm{display:none}",
    "@media (max-width:760px){.apc-t{display:none}.apc-tm{display:block;margin-bottom:10px}.apc-tm .l1{display:flex;align-items:center;gap:8px}.apc-tm .l1 a{flex:1;font:700 22px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;color:#fff}.apc-tm .l1 .apc-ar{width:32px;height:32px}.apc-tm .l2{display:flex;justify-content:space-between;align-items:center;margin-top:6px}.apc-tm .l2>span:first-child{font:700 12px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#3d8bff}.apc-tm .apc-lg{gap:9px;font-size:11px;width:auto}.apc-tm .apc-lg i{width:7px;height:7px;margin-right:4px}.apc-pl{overflow-x:auto;scrollbar-width:none}.apc-pl button{flex:none;width:48px}.apc-cols{grid-template-columns:1fr}.apc-col:nth-child(n+2){display:none}}",
    ".ap-o{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;font-family:Inter,system-ui,sans-serif;color:#f3f3f5}",
    ".ap{position:relative;width:min(1080px,100%);box-sizing:border-box;background:#0c0c0e;border:1px solid #2C2C2F;border-radius:24px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.6);text-align:left}",
    ".ap *{box-sizing:border-box}.ap a{color:inherit;text-decoration:none}",
    ".ap-h{display:flex;align-items:center;gap:12px;margin-bottom:16px}.ap-h .av{width:46px;height:46px;border-radius:50%;object-fit:cover;background:#38383B;flex:none}",
    ".ap-h b{display:flex;align-items:center;gap:8px;font:700 24px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}.ap-h small{display:block;color:#8c8c93;font-size:12.5px;margin-top:4px}",
    ".ap-pill{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:12px;background:#0095F61F;color:#3DB0FF;font:700 11px Inter,sans-serif;letter-spacing:.06em}.ap-pill svg{width:13px;height:13px}",
    ".ap-hr{margin-left:auto;display:flex;gap:8px}.ap-hr button{height:40px;border:0;border-radius:12px;background:#17171b;color:#cfcfd4;font:600 13.5px Inter,sans-serif;display:inline-flex;align-items:center;gap:8px;padding:0 14px;cursor:pointer}.ap-hr button svg{width:16px;height:16px}.ap-hr .x{width:40px;padding:0;justify-content:center;font-size:20px;color:#fff}",
    ".ap-g{display:grid;gap:12px;margin-bottom:12px}.ap-g2{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr)}.ap-g3{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch}",
    ".ap-st{display:grid;grid-template-rows:1fr 1fr;gap:10px}",
    ".ap-t{position:relative;display:flex;align-items:center;gap:12px;border-radius:18px;padding:12px 14px;overflow:hidden;transition:transform .15s}.ap-t:hover{transform:translateY(-2px)}",
    ".ap-t .ic{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;flex:none}.ap-t .ic svg{width:20px;height:20px}",
    ".ap-t h3{margin:0;font:700 19px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase}.ap-t p{margin:3px 0 0;font-size:12px;color:#b8b8be}.ap-t>div{min-width:0;flex:1}",
    ".ap-t .n{margin-left:auto;min-width:40px;height:40px;border-radius:20px;display:grid;place-items:center;font:700 21px Antonio,sans-serif;padding:0 10px;flex:none}",
    ".ap-gr{background:linear-gradient(160deg,#1E3A2A,#000 75%);border:1px solid #2E7D4F}.ap-gr .ic,.ap-gr .n{background:#2E7D4F;color:#fff}",
    ".ap-rd{background:linear-gradient(160deg,#3d1414,#000 75%);border:1px solid #E5483A}.ap-rd .ic,.ap-rd .n{background:#E5483A;color:#fff}",
    ".ap-db{display:block;border-radius:18px;padding:14px 16px;background:linear-gradient(160deg,#142a44,#000 75%);border:1px solid #2A6FD0}",
    ".ap-db .hd{display:flex;align-items:center;gap:10px}.ap-db .ic{width:36px;height:36px;border-radius:10px;background:#2A6FD0;display:grid;place-items:center}.ap-db .ic svg{width:20px;height:20px}",
    ".ap-db h3{margin:0;font:700 19px Antonio,sans-serif;text-transform:uppercase}.ap-db .wk{margin-left:auto;font:700 11.5px Inter,sans-serif;color:#9CC3FF}",
    ".ap-pl{display:flex;justify-content:space-between;align-items:baseline;font:700 12px Inter,sans-serif;color:#cfcfd4;margin-top:12px}.ap-pl b{font:700 17px Antonio,sans-serif;color:#fff}",
    ".ap-pb{height:6px;border-radius:3px;background:#26262c;overflow:hidden;margin-top:6px}.ap-pb i{display:block;height:100%;border-radius:3px;min-width:4px}",
    ".ap-fam{position:relative;overflow:hidden;display:block;background:#000;border-radius:18px;padding:16px 18px;border:1px solid #2a1418;min-height:100%}",
    ".ap-fam .kj{position:absolute;right:-10px;top:-24px;font:900 130px/1 'Noto Sans JP',sans-serif;color:#BC002D;opacity:.22;pointer-events:none}",
    ".ap-fam .ey{position:relative;font:700 11px Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#E5483A}",
    ".ap-fam .nn{position:relative;display:flex;align-items:flex-end;gap:10px;margin-top:6px}.ap-fam .nn b{font:700 56px/.9 Antonio,sans-serif}.ap-fam .nn span{font:700 16px/1.1 Antonio,sans-serif;text-transform:uppercase;padding-bottom:6px}",
    ".ap-fam .s{position:relative;display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:13px;color:#CFCFD4}.ap-fam .s b{color:#4CD07D}.ap-fam .s .p b{color:#3DB0FF}.ap-fam .s svg{width:14px;height:14px;vertical-align:-2px}",
    ".ap-fam .av{position:relative;display:flex;margin-top:12px}.ap-fam .av>*{width:34px;height:34px;border-radius:50%;border:3px solid #000;margin-left:-9px;display:grid;place-items:center;font:700 13px Inter,sans-serif;font-style:normal;background:#38383B;object-fit:cover}.ap-fam .av>*:first-child{margin-left:0}",
    ".ap-sq{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}",
    ".ap-sq a{background:#17171b;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px;justify-content:space-between;transition:background .15s}.ap-sq a:hover{background:#1f1f25}",
    ".ap-sq .i{width:34px;height:34px;border-radius:10px;background:#26262c;display:grid;place-items:center}.ap-sq .i svg{width:18px;height:18px}",
    ".ap-sq b{display:block;font:700 14px/1.05 Antonio,sans-serif;text-transform:uppercase}.ap-sq small{display:block;font:600 11px Inter,sans-serif;color:#8c8c93;margin-top:3px}",
    ".ap-pan{background:#17171b;border-radius:18px;padding:14px;display:flex;flex-direction:column;min-width:0}",
    ".ap-sh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.ap-sh h2{margin:0;font:700 20px Antonio,sans-serif;text-transform:uppercase}.ap-sh h2 span{color:#2A6FD0}.ap-sh a{font:700 12px Inter,sans-serif;color:#8c8c93;white-space:nowrap}",
    ".ap-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.ap-tag{font:700 10px Inter,sans-serif;text-transform:uppercase;letter-spacing:.04em;padding:4px 8px;border-radius:7px;border:0;cursor:default}",
    ".ap-day{display:flex;flex-direction:column;gap:8px;max-height:396px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#3a3a40 transparent;padding-right:2px}",
    ".ap-nr{display:flex;gap:10px;align-items:flex-start}.ap-nr .h{font:700 15px Antonio,sans-serif;width:44px;flex:none;text-align:right;padding-top:12px}",
    ".ap-c{position:relative;flex:1;min-width:0;background:#1f1f25;border-radius:11px;padding:9px 12px 9px 9px;display:flex;gap:10px;align-items:center}",
    ".ap-c .cv{width:40px;height:56px;border-radius:5px;flex:none;background:#262630 center/cover no-repeat}",
    ".ap-c .kjc{background:#0c0c0e;display:flex;align-items:center;justify-content:center;gap:3px}.ap-c .kjc i{font:900 18px/1 'Noto Sans JP',sans-serif;font-style:normal;color:#BC002D;writing-mode:vertical-rl}.ap-c .kjc em{writing-mode:vertical-rl;transform:rotate(180deg);font:600 5px Antonio,sans-serif;letter-spacing:.3em;color:#fff;font-style:normal}",
    ".ap-c .ri{min-width:0;flex:1}.ap-c .bar{display:block;height:3px;width:26px;border-radius:2px;margin-bottom:6px}",
    ".ap-c .t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 13px/1.25 Inter,sans-serif}",
    ".ap-c .m{display:block;font:700 10px Antonio,sans-serif;letter-spacing:.04em;text-transform:uppercase;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ap-c .rt{flex:none;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;align-self:stretch;gap:6px}.ap-c .rt b{display:none;font:700 15px Antonio,sans-serif}",
    ".ap-chk{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#4DAB9A;color:#1b1b1f}.ap-chk svg{width:12px;height:12px}",
    ".ap-dot{width:9px;height:9px;border-radius:50%;background:#2A6FD0;box-shadow:0 0 0 4px rgba(42,111,208,.25);margin:0 6px 6px}",
    ".ap-vide{color:#8c8c93;font-size:13px;line-height:1.5;padding:6px 2px}",
    ".ap-fl{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px}.ap-fl button{font:700 10px Inter,sans-serif;text-transform:uppercase;letter-spacing:.04em;padding:5px 9px;border-radius:7px;border:0;background:#26262c;color:#cfcfd4;cursor:pointer}.ap-fl button[aria-pressed=true]{background:#2A6FD0;color:#fff}",
    ".ap-td{max-height:420px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#3a3a40 transparent}",
    ".ap-tr{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #222}.ap-tr:first-child{border-top:0}",
    ".ap-tr button{width:20px;height:20px;border-radius:6px;border:2px solid #3a3a40;background:none;flex:none;cursor:pointer;padding:0;display:grid;place-items:center;color:#1b1b1f}.ap-tr button svg{width:11px;height:11px;display:none}",
    ".ap-tr.ok button{background:#4DAB9A;border-color:#4DAB9A}.ap-tr.ok button svg{display:block}.ap-tr.ok span{text-decoration:line-through;color:#8c8c93}",
    ".ap-tr span{font:600 13px/1.3 Inter,sans-serif;flex:1;min-width:0}.ap-tr u{text-decoration:none;font:700 10px Inter,sans-serif;color:#8c8c93;flex:none}.ap-tr em{font-style:normal;font:700 10px Inter,sans-serif;padding:3px 7px;border-radius:6px;flex:none}",
    ".ap-add{display:flex;gap:8px;margin-top:10px}.ap-add input{flex:1;min-width:0;height:36px;border-radius:10px;border:1px solid #2C2C2F;background:#0c0c0e;color:#fff;padding:0 12px;font:500 13px Inter,sans-serif;outline:none}.ap-add button{height:36px;border:0;border-radius:10px;background:#26262c;color:#fff;font:700 13px Inter,sans-serif;padding:0 14px;cursor:pointer}",
    ".ap-ft{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid #222;font:600 13px Inter,sans-serif;color:#8c8c93}.ap-ft a:hover{color:#fff}.ap-ft button{border:0;background:none;color:#FF8A80;font:700 13px Inter,sans-serif;cursor:pointer;padding:0}",
    ".ap-sk{background:#17171b;border-radius:10px;height:14px;animation:apsk 1.2s ease-in-out infinite}@keyframes apsk{50%{opacity:.5}}",
    "@media (max-width:719px){.ap-o{padding:0}.ap{border-radius:0;border:0;min-height:100%;padding:14px 16px 24px}.ap-g2,.ap-g3{grid-template-columns:1fr}.ap-hr .srt{display:none}",
    ".ap-srm{display:flex!important}.ap-st{grid-template-rows:auto}.ap-nr .h{display:none}.ap-c .rt b{display:block}.ap-day{max-height:none}.ap-td{max-height:none}.ap-sq b{font-size:12.5px}.ap-sq a{padding:10px}}",
    ".ap-srm{display:none;align-items:center;gap:12px;width:100%;border:0;background:#17171b;border-radius:14px;padding:10px 14px;margin-bottom:12px;color:#fff;font:700 15px Antonio,sans-serif;text-transform:uppercase;cursor:pointer}.ap-srm span{width:34px;height:34px;border-radius:10px;background:#26262c;display:grid;place-items:center}.ap-srm svg{width:18px;height:18px}"
  ].join("");

  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."], JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  var couv = function (u) { return /^https?:/.test(u || "") ? "/api/couv?u=" + encodeURIComponent(u) + "&w=120" : (u || ""); };
  var nb = function (n) { return n == null ? "–" : Number(n).toLocaleString("fr-FR"); };
  var D = null, FILT = "Tout", CSEL = null;
  var JC = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  var addJ = function (d, n) { var x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  var dowJ = function (d) { return new Date(d + "T12:00:00Z").getUTCDay(); };
  var lundiDe = function (d) { return addJ(d, -((dowJ(d) + 6) % 7)); };
  var MC = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var jm = function (d) { var x = new Date(d + "T12:00:00Z"); return x.getUTCDate() + " " + MC[x.getUTCMonth()]; };
  function calBloc() {
    var C = D && D.cal, auj = (D && D.aujourdhui) || new Date().toISOString().slice(0, 10);
    if (!CSEL) CSEL = auj;
    var L = lundiDe(CSEL), sem = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addJ(L, i); }), J = function (d) { return (C && C.jours[d]) || []; };
    var cette = L === lundiDe(auj);
    var h = '<div class="apc"><div class="apc-t"><h2>Calendrier éditorial</h2><div class="apc-dc"><span><span class="k">' + (cette ? "Cette semaine" : "Semaine") + '</span><span class="v">' + jm(sem[0]) + ' – ' + jm(sem[6]) + '</span></span>' +
      '<button type="button" class="apc-ar" data-cw="-1" aria-label="Semaine précédente"' + (C && addJ(L, -1) < C.du ? " disabled" : "") + '>‹</button><button type="button" class="apc-ar" data-cw="1" aria-label="Semaine suivante"' + (C && addJ(L, 7) > C.au ? " disabled" : "") + '>›</button></div>' +
      '<span class="apc-lg"><span><i class="apc-p"></i>Publié</span><span><i class="apc-a"></i>À publier</span><span><i class="apc-r"></i>En retard</span></span><a class="apc-go" href="/hq/#calendrier">Ouvrir le calendrier →</a></div>' +
      // Téléphone (maquette M1, Will 27/10/2026) : le titre est le lien du calendrier, flèches à droite ; dessous, la semaine et la légende. Deux lignes.
      '<div class="apc-tm"><div class="l1"><a href="/hq/#calendrier">Calendrier éditorial</a><button type="button" class="apc-ar" data-cw="-1" aria-label="Semaine précédente"' + (C && addJ(L, -1) < C.du ? " disabled" : "") + '>‹</button><button type="button" class="apc-ar" data-cw="1" aria-label="Semaine suivante"' + (C && addJ(L, 7) > C.au ? " disabled" : "") + '>›</button></div>' +
      '<div class="l2"><span>' + jm(sem[0]) + ' – ' + jm(sem[6]) + '</span><span class="apc-lg"><span><i class="apc-p"></i>Publié</span><span><i class="apc-a"></i>À publier</span><span><i class="apc-r"></i>Retard</span></span></div></div>';
    h += '<div class="apc-pl">' + sem.map(function (d) { var l = J(d), w = new Date(d + "T12:00:00Z");
      return '<button type="button" data-cj="' + d + '" class="' + (d === CSEL ? "on" : "") + (d === auj ? " apc-auj" : "") + '"><b>' + w.getUTCDate() + '</b><small>' + JC[w.getUTCDay()] + '</small>' + (l.length ? '<i>' + l.length + '</i>' : '') +
        '<span class="br">' + l.slice(0, 6).map(function (e) { return '<span class="apc-' + e.st + '"></span>'; }).join("") + '</span></button>'; }).join("") + '</div>';
    if (!C) return h + '<div class="ap-sk" style="width:60%"></div></div>';
    h += '<div class="apc-cols">' + [0, 1, 2, 3].map(function (i) { var d = addJ(CSEL, i), l = J(d), w = new Date(d + "T12:00:00Z");
      return '<div class="apc-col' + (d === auj ? " apc-auj" : "") + '"><h4>' + JC[w.getUTCDay()] + ' <b>' + w.getUTCDate() + '</b>' + (d === auj ? '<em>AUJOURD’HUI</em>' : d === addJ(auj, 1) ? '<em style="color:#8c8c93">DEMAIN</em>' : '') + '</h4>' +
        (l.length ? l.slice(0, 7).map(function (e) {
          var cv = e.img ? '<span class="cv" style="background-image:url(\'' + esc(couv(e.img)) + '\')"></span>' : '<span class="cv kj" lang="ja">' + esc(e.kj || "予定") + '</span>';
          return '<a class="apc-cd" href="' + esc(e.u || "/hq/#calendrier") + '">' + cv + '<span class="tx"><b>' + esc(e.t) + '</b><small>' + (e.h ? esc(e.h) + " · " : "") + esc(e.s || "") + '</small></span><span class="d apc-' + e.st + '"></span></a>'; }).join("") +
          (l.length > 7 ? '<a class="apc-more" href="/hq/#calendrier">+' + (l.length - 7) + ' de plus</a>' : '') : '<p class="apc-vide">—</p>') + '</div>'; }).join("") + '</div></div>';
    return h;
  }

  function dateTodo(dt, auj) {
    if (!dt) return "";
    var d = new Date(dt + "T12:00:00"), a = new Date(auj + "T12:00:00"), j = Math.round((d - a) / 864e5);
    if (j < 0) return ["En retard", "#3d1414", "#FF8A80"];
    if (j === 0) return ["Aujourd'hui", "#3A2E10", "#F2B33D"];
    if (j < 7) return [JOURS[d.getDay()], "#3A2E10", "#F2B33D"];
    return [d.getDate() + " " + MOIS[d.getMonth()], "#142a44", "#9CC3FF"];
  }
  function todoRows() {
    var l = D.todo.items.filter(function (x) { return FILT === "Tout" || x.cat === FILT; });
    if (!l.length) return '<p class="ap-vide">Rien à faire ici.</p>';
    return l.map(function (x) {
      var b = x.done ? ["Fait", "#1f3b2a", "#7BC67E"] : (dateTodo(x.dt, D.aujourdhui) || (x.prio === "haut" ? ["Haut", "#3d1414", "#FF8A80"] : ""));
      return '<div class="ap-tr' + (x.done ? " ok" : "") + '"><button type="button" data-td="' + esc(x.id) + '" aria-label="' + (x.done ? "Décocher" : "Cocher") + '">' + S.ok + '</button><span>' + esc(x.t) + '</span>' + (x.cat ? '<u>' + esc(x.cat) + '</u>' : '') + (b ? '<em style="background:' + b[1] + ';color:' + b[2] + '">' + b[0] + '</em>' : '') + '</div>';
    }).join("");
  }
  function carte(n) {
    var c = CAT[n.cat] || CAT.news, img = n.image ? couv(n.image) : "";
    var cv = img ? '<span class="cv" style="background-image:url(\'' + esc(img) + '\')"></span>' : '<span class="cv kjc"><em>FURYOGANG</em><i lang="ja">' + c[1] + '</i></span>';
    var etat = n.statut === "publiee" ? '<span class="ap-chk">' + S.ok + '</span>' : '<span class="ap-dot"></span>';
    return '<div class="ap-nr"><span class="h">' + esc(n.heure || "") + '</span><a class="ap-c" href="/hq/news/#' + encodeURIComponent(n.id) + '">' + cv +
      '<span class="ri"><span class="bar" style="background:' + c[0] + '"></span><span class="t">' + esc(n.titre) + '</span><span class="m" style="color:' + c[0] + '">' + esc(n.label || "News") + '</span></span>' +
      '<span class="rt"><b>' + esc(n.heure || "") + '</b>' + etat + '</span></a></div>';
  }
  function corps(ME) {
    var u = ME.user || {}, now = new Date(), f = D && D.famille, b = D && D.base, j = (D && D.jour) || [];
    var pub = j.filter(function (x) { return x.statut === "publiee"; }).length, plan = j.length - pub;
    var prochaine = j.filter(function (x) { return x.statut !== "publiee"; })[0];
    var sk = '<div class="ap-sk" style="width:60%"></div>';
    var cats = D ? D.todo.items.reduce(function (a, x) { if (x.cat && !x.done) a[x.cat] = (a[x.cat] || 0) + 1; return a; }, {}) : {};
    var topCats = Object.keys(cats).sort(function (a, b2) { return cats[b2] - cats[a]; }).slice(0, 3);
    return '<div class="ap" role="dialog" aria-label="Menu admin">' +
      '<div class="ap-h"><a href="' + (u.slug ? "/membres/" + encodeURIComponent(u.slug) + "/" : "/profil/") + '">' + (u.picture ? '<img class="av" src="' + esc(u.picture) + '" alt="" referrerpolicy="no-referrer">' : '<span class="av"></span>') + '</a>' +
      '<a href="' + (u.slug ? "/membres/" + encodeURIComponent(u.slug) + "/" : "/profil/") + '"><b>' + esc(u.name || "Admin") + ' <span class="ap-pill">' + S.pm + 'Admin</span></b><small>' + JOURS[now.getDay()] + " " + now.getDate() + " " + ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][now.getMonth()] + ' · voir mon profil</small></a>' +
      '<span class="ap-hr"><button type="button" class="srt" data-ap-srch>' + S.se + 'Rechercher</button><button type="button" class="x" data-ap-x aria-label="Fermer">×</button></span></div>' +
      '<button type="button" class="ap-srm" data-ap-srch><span>' + S.se + '</span>Rechercher</button>' +
      calBloc() +
      // 1. Actualités + Couvertures | Mangas Database
      '<div class="ap-g ap-g2"><div class="ap-st">' +
        '<a class="ap-t ap-gr" href="/admin/#validation"><span class="ic">' + S.news + '</span><div><h3>Actualités et veille</h3><p>À relire avant publication</p></div><span class="n">' + (D ? nb(D.veille.n) : "…") + '</span></a>' +
        '<a class="ap-t ap-rd" href="/admin/#couvertures"><span class="ic">' + S.couv + '</span><div><h3>Couvertures manquantes</h3><p>Tomes parus sans couverture</p></div><span class="n">' + (D ? nb(D.couvertures.n) : "…") + '</span></a></div>' +
        '<a class="ap-db" href="/admin/#mangas"><div class="hd"><span class="ic">' + S.db + '</span><h3>Mangas Database</h3>' + (b && b.semaine ? '<span class="wk">+' + b.semaine + ' cette semaine</span>' : '') + '</div>' +
        (b ? '<div class="ap-pl"><span>En ligne</span><b>' + nb(b.enLigne) + ' / ' + nb(b.total) + '</b></div><div class="ap-pb"><i style="width:' + (b.total ? b.enLigne / b.total * 100 : 0) + '%;background:#7BC67E"></i></div>' +
          '<div class="ap-pl"><span>Promo faite</span><b style="color:#9CC3FF">' + nb(b.promo) + ' / ' + nb(b.enLigne) + '</b></div><div class="ap-pb"><i style="width:' + (b.enLigne ? b.promo / b.enLigne * 100 : 0) + '%;background:#2A6FD0"></i></div>' : '<div style="margin-top:14px">' + sk + '</div>') + '</a></div>' +
      // 2. La famille du gang | raccourcis
      '<div class="ap-g ap-g2"><a class="ap-fam" href="/communaute/"><span class="kj" lang="ja">仲間</span><div class="ey">La famille du gang</div>' +
        '<div class="nn"><b>' + (f ? nb(f.total) : "…") + '</b><span>membres<br>dans le gang</span></div>' +
        (f ? '<div class="s"><span><b>+' + f.auj + '</b> aujourd\'hui</span><span><b>+' + f.sem + '</b> cette semaine</span><span class="p">' + S.pm + ' <b>' + f.premium + '</b> Premium</span></div>' +
          '<div class="av">' + f.recents.map(function (r) { return r.photo ? '<img src="' + esc(r.photo) + '" alt="" referrerpolicy="no-referrer" title="' + esc(r.pseudo) + '">' : '<i title="' + esc(r.pseudo) + '">' + esc(r.pseudo.charAt(0).toUpperCase()) + '</i>'; }).join("") + '</div>' : '') + '</a>' +
        '<div class="ap-sq">' + [["cal", "Contenu régulier", "/hq/#vivre", "Récaps, promos"], ["pm", "Premium & dons", "/hq/#dons", f ? f.premium + " Premium" : "Dons, abonnés"], ["hq", "HQ", "/hq/", "Ressources"], ["st", "Statistiques", "/admin/#stats", "Clics Google"], ["cm", "Communauté", "/communaute/", f ? nb(f.total) + " membres" : "Les membres"], ["bo", "Back-office", "/admin/", "Fiches, réglages"]].map(function (r) {
          return '<a href="' + r[2] + '"><span class="i">' + S[r[0]] + '</span><div><b>' + r[1] + '</b><small>' + r[3] + '</small></div></a>'; }).join("") + '</div></div>' +
      // 3. Aujourd'hui | To-do
      '<div class="ap-g" style="grid-template-columns:1fr">' +
        '<div class="ap-pan"><div class="ap-sh"><h2>To-do' + (D ? ' <span style="color:#F2B33D">· ' + (D.todo.semaine ? D.todo.semaine + " cette semaine" : D.todo.total + " à faire") + '</span>' : '') + '</h2><a href="/hq/#todo">' + (D ? D.todo.total + " en tout" : "") + ' →</a></div>' +
        (D ? '<div class="ap-fl">' + ["Tout"].concat(topCats).map(function (c) { return '<button type="button" data-tf="' + esc(c) + '" aria-pressed="' + (FILT === c) + '">' + esc(c) + '</button>'; }).join("") + '</div><div class="ap-td" data-td-l>' + todoRows() + '</div>' +
          '<form class="ap-add" data-td-add><input name="t" placeholder="Ajouter une tâche" maxlength="300" autocomplete="off"><button type="submit">＋</button></form>' : sk) + '</div></div>' +
      '<div class="ap-ft"><span><a href="/admin/#sorties">Sorties du jour</a> · <a href="/admin/#maj">Mises à jour de fiche</a> · <a href="/studio/semaine/">Quoi de neuf dans le gang</a></span><button type="button" data-ap-out>Se déconnecter</button></div>' +
    '</div>';
  }

  window.FG_ADMPOP = function (ME, ouvrirRecherche) {
    if (!document.getElementById("ap-css")) { var st = document.createElement("style"); st.id = "ap-css"; st.textContent = CSS; document.head.appendChild(st); }
    var o = document.querySelector(".ap-o");
    if (!o) { o = document.createElement("div"); o.className = "ap-o"; document.body.appendChild(o); }
    var draw = function () { var y = o.scrollTop; o.innerHTML = corps(ME); o.scrollTop = y; };
    var close = function () { o.remove(); document.removeEventListener("keydown", key); document.documentElement.style.overflow = ""; };
    var key = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", key); document.documentElement.style.overflow = "hidden";
    draw();
    o.onclick = function (e) {
      if (e.target === o || e.target.closest("[data-ap-x]")) return close();
      if (e.target.closest("[data-ap-srch]")) { close(); if (ouvrirRecherche) ouvrirRecherche(); return; }
      if (e.target.closest("[data-ap-out]")) { fetch("/api/auth/me", { method: "DELETE" }).then(function () { location.reload(); }); return; }
      var cw = e.target.closest("[data-cw]"); if (cw) { CSEL = addJ(CSEL || (D && D.aujourdhui), 7 * +cw.dataset.cw); draw(); return; }
      var cj = e.target.closest("[data-cj]"); if (cj) { CSEL = cj.dataset.cj; draw(); return; }
      var tf = e.target.closest("[data-tf]"); if (tf) { FILT = tf.dataset.tf; draw(); return; }
      var td = e.target.closest("[data-td]");
      if (td && D) {
        var it = D.todo.items.filter(function (x) { return x.id === td.dataset.td; })[0]; if (!it) return;
        it.done = !it.done; D.todo.total += it.done ? -1 : 1; o.querySelector("[data-td-l]").innerHTML = todoRows();
        fetch("/api/admin/todo", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: it.id, done: it.done }) }).catch(function () {});
      }
    };
    o.onsubmit = function (e) {
      var f = e.target.closest("[data-td-add]"); if (!f) return; e.preventDefault();
      var t = f.t.value.trim(); if (!t) return;
      var cat = FILT === "Tout" ? "Divers" : FILT;
      D.todo.items.unshift({ id: "tmp" + Date.now(), t: t, cat: cat, done: false }); D.todo.total++; f.t.value = "";
      o.querySelector("[data-td-l]").innerHTML = todoRows();
      fetch("/api/admin/todo", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ add: { t: t, cat: cat } }) })
        .then(function () { return charger(true); }).catch(function () {});
    };
    var charger = function (frais) {
      return fetch("/api/admin/tableau" + (frais ? "?frais=1" : ""), { credentials: "same-origin", cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && document.body.contains(o)) { D = j; draw(); } });
    };
    charger(false);
  };
})();
