/* En-tête commun à tout le site (style Le Monde) : avatar à gauche, logo centré, recherche à droite, menu Actualités / Séries / Calendrier.
   À inclure juste après <body> : <script src="/site/header.js"></script> (le CSS est injecté ici aussi).
   La hauteur de l'en-tête est exposée en --sh-h pour que les barres collantes de chaque page se placent dessous.
   La loupe ouvre une recherche instantanée sur tout le site (séries, mangakas, sorties, actualités, pages). */
(function () {
  var css = '@font-face{font-family:"FGAntonio";src:url(/fonts/Antonio.ttf) format("truetype");font-weight:100 700}@font-face{font-family:"FGInter";src:url(/fonts/Inter.ttf) format("truetype");font-weight:100 900}' +
    ".sh{position:sticky;top:0;z-index:40;background:#141416;border-bottom:1px solid #2C2C2F;margin:0 0 0;padding-top:env(safe-area-inset-top,0px)}" +
    ".sh-top{position:relative;display:flex;justify-content:center;align-items:center;height:64px;max-width:1080px;margin:0 auto;padding:0 16px}" +
    ".sh-logo{display:block;line-height:0}" +
    ".sh-logo img{height:42px;width:auto;display:block}" +
    ".sh-btn{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;display:grid;place-items:center;color:#F5F5F7;text-decoration:none;border:0;background:transparent;cursor:pointer;padding:0}" +
    ".sh-search{right:8px}.sh-me{left:8px}" +
    ".sh-adm{position:absolute;top:50%;left:56px;transform:translateY(-50%);display:flex;gap:6px}" +
    ".sh-bo,.sh-val{height:28px;padding:0 11px;border-radius:14px;background:#305887;color:#fff;font:600 12.5px Inter,system-ui,sans-serif;text-decoration:none;display:flex;align-items:center;gap:6px}" +
    ".sh-val{background:#2E7D4F}.sh-val b{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#fff;color:#1F5C38;font:700 11px Inter,system-ui,sans-serif;display:grid;place-items:center}" +
    ".sh-val[data-n='0'] b{display:none}" +
    ".sh-bo svg{display:none;width:16px;height:16px}" +
    "@media (max-width:520px){.sh-bo{width:30px;height:30px;padding:0;justify-content:center;border-radius:50%;font-size:0}.sh-bo svg{display:block}" +
    ".sh-val{height:30px;min-width:30px;padding:0 8px;justify-content:center;border-radius:15px;font-size:0}.sh-val b{background:transparent;color:#fff;font-size:13px;padding:0;min-width:0}.sh-val[data-n='0'] b{display:grid}}" +
    ".sh-me span{width:30px;height:30px;border-radius:50%;background:#38383B;display:grid;place-items:center;color:#CFCFD4}" +
    ".sh-nav{display:flex;justify-content:center;gap:4px;max-width:1080px;margin:0 auto;border-top:1px solid #2C2C2F;padding:0 8px}" +
    ".sh-nav a{position:relative;padding:0 16px;height:44px;display:flex;align-items:center;text-decoration:none;color:#CFCFD4;font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:15px;letter-spacing:-.005em}" +
    ".sh-nav a:hover{color:#F5F5F7}" +
    ".sh-nav a[aria-current=page]{color:#F5F5F7}" +
    ".sh-nav a[aria-current=page]::after{content:'';position:absolute;left:16px;right:16px;bottom:-1px;height:3px;border-radius:3px;background:#4C9BFF}" +
        /* Téléphone : rubriques en barre d'onglets ; admin : seulement le nombre à valider, discret, à côté de l'avatar */
    "@media (max-width:719px){.sh-nav{margin:8px 12px 10px!important;padding:4px!important;gap:4px!important;border:0!important;background:#000;border-radius:14px;justify-content:stretch!important}" +
    ".sh-nav a{flex:1;justify-content:center;height:40px!important;padding:0!important;border-radius:10px;font:700 17px/1 Antonio,'Arial Narrow',sans-serif!important;text-transform:uppercase;letter-spacing:.03em;color:#8E8E93}" +
    ".sh-nav a[aria-current=page]{background:#38383B;color:#F5F5F7}.sh-nav a[aria-current=page]::after{display:none}" +
    ".sh-bo{display:none!important}" +
    ".sh-adm{left:50px}.sh-val{pointer-events:none;background:transparent!important;width:auto!important;min-width:0!important;padding:0!important;height:auto!important}" +
    ".sh-val b{background:transparent!important;color:#8E8E93!important;font:600 13px Inter,system-ui,sans-serif!important;min-width:0!important;padding:0!important}.sh-val[data-n='0'] b{display:none!important}}" +
    /* Ordinateur aussi (Will, 04/10/2026) : plus de pastilles Back-office / Validation, juste le nombre à valider ; tout passe par l'avatar */
    ".sh-bo{display:none!important}.sh-val{pointer-events:none;background:transparent!important;padding:0!important;height:auto!important;font-size:0!important}" +
    ".sh-val b{background:transparent!important;color:#8E8E93!important;font:600 13px Inter,system-ui,sans-serif!important;padding:0!important}.sh-val[data-n='0'] b{display:none!important}" +
    /* Ordinateur (Will, 22/10/2026) : le nombre à valider est cliquable et ouvre directement les actus à valider */
    ".sh-adm .sh-val{pointer-events:auto;cursor:pointer}.sh-adm .sh-val:hover b{color:#F5F5F7!important;text-decoration:underline;text-underline-offset:3px}" +
    ".adm-pop{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.55);font-family:Inter,system-ui,sans-serif}.adm-pop[hidden]{display:none}" +
    ".adm-box{position:absolute;left:12px;top:calc(env(safe-area-inset-top,0px) + 60px);width:min(320px,calc(100% - 24px));box-sizing:border-box;padding:16px;background:#1C1C1E;border-radius:20px;display:flex;flex-direction:column;gap:10px;color:#F5F5F7}" +
    ".adm-u{display:flex;align-items:center;gap:12px;padding-bottom:6px;text-decoration:none;color:inherit}.adm-u img,.adm-u i{width:48px;height:48px;border-radius:24px;background:#38383B;object-fit:cover;display:block}.adm-u b{display:block;font-size:17px}.adm-u small{font-size:13px;color:#98989D}" +
    ".adm-b{display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 16px;border-radius:14px;background:#38383B;color:#F5F5F7;text-decoration:none}.adm-b.v{background:#305887;color:#fff}.adm-b.f{background:#2E7D4F;color:#fff}.adm-b.s{background:#6A4BC4;color:#fff}.adm-b.f small,.adm-b.s small{color:rgba(255,255,255,.78)!important}" +
    ".adm-b strong{display:block;font:700 20px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.03em}.adm-b small{display:block;margin-top:3px;font-size:12.5px;color:#C9D6E6}.adm-b:not(.v) small{color:#98989D}" +
    ".adm-b em{font-style:normal;min-width:40px;height:32px;padding:0 10px;box-sizing:border-box;border-radius:16px;background:#fff;color:#305887;font-weight:700;font-size:15px;display:grid;place-items:center}" +
    ".adm-b.c{background:#1F2A38;color:#fff}.adm-b.c small{color:#C9D6E6!important}" +
    ".adm-b.fgcm{background:#3A2A08;color:#fff}.adm-b.fgcm small{color:#E9D3A0!important}" +
    ".adm-b.j{background:#F2B33D;color:#000}.adm-b.j small{color:rgba(0,0,0,.66)!important}.adm-b.j em{background:#000;color:#F2B33D}" +
    /* Accès rapide admin (Will, 19/10/2026) : pop-up centré, grille 2 par 2. */
    ".adm-pop.center{background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}" +
    ".adm-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,calc(100% - 28px));box-sizing:border-box;padding:26px;background:#0c0c0e;border:1px solid #242428;border-radius:28px;box-shadow:0 40px 100px rgba(0,0,0,.6);color:#F5F5F7;font-family:FGInter,Inter,system-ui,sans-serif}" +
    ".adm-h{position:relative;display:flex;align-items:center;justify-content:flex-end;min-height:42px;margin-bottom:20px}.adm-h .t{font:700 17px Antonio,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#98989D}.adm-h .t b{color:#BC002D}" +
    ".adm-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;line-height:0}.adm-logo img{height:30px;width:auto;display:block}" +
    ".adm-h .x{width:42px;height:42px;border-radius:50%;background:#2a2a2e;color:#98989D;display:grid;place-items:center;font-size:26px;border:0;cursor:pointer;line-height:1}" +
    ".adm-s{display:flex;align-items:center;gap:13px;height:64px;background:#1f1f22;border-radius:18px;padding:0 20px;margin-bottom:20px;cursor:text;width:100%;border:0;color:inherit;text-align:left}.adm-s svg{width:26px;height:26px;color:#98989D;flex:none}.adm-s span{color:#98989D;font-size:20px}" +
    ".adm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}" +
    ".adm-srch{display:flex;align-items:center;gap:12px;width:100%;height:54px;margin:0 0 12px;padding:0 18px;border:0;border-radius:16px;background:#1e1e22;color:#9a9aa0;font:500 16px Inter,system-ui,sans-serif;text-align:left;cursor:pointer}.adm-srch svg{width:20px;height:20px;flex:none;color:#F5F5F7}.adm-srch span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media (min-width:601px){.adm-srch{display:none!important}}@media (max-width:600px){.adm-srch{height:46px;margin-bottom:9px;padding:0 14px;border-radius:13px;font-size:15px}}" +
    ".adm-qt{position:relative;display:flex;align-items:center;gap:16px;background:#1e1e22;border:0;border-radius:18px;padding:18px 20px;text-decoration:none;color:inherit}.adm-qt.wide{grid-column:1/3}" +
    ".adm-qt .ic{width:54px;height:54px;border-radius:16px;background:#305887;display:grid;place-items:center;flex:none}.adm-qt .ic svg{width:28px;height:28px;color:#fff}" +
    ".adm-qt h3{margin:0;font:700 24px/1 FGAntonio,sans-serif;text-transform:uppercase;letter-spacing:.01em;color:#fff}.adm-qt small{display:block;color:#9a9aa0;font-size:15px;margin-top:4px}" +
    ".adm-qt .bdg{position:absolute;top:20px;right:18px;min-width:28px;height:28px;padding:0 8px;box-sizing:border-box;border-radius:7px;background:#BC002D;color:#fff;font:700 15px FGAntonio,sans-serif;display:flex;align-items:center;justify-content:center;line-height:1}.adm-qt .bdg span{display:block;transform:translateY(-1px)}" +
    ".adm-out2{margin-top:16px;width:100%;height:58px;border:0;border-radius:16px;background:#2a2a2e;color:#98989D;font:600 16px Inter,sans-serif;cursor:pointer}" +
    "@media (max-width:600px){.adm-card{padding:16px;border-radius:22px;max-height:calc(100vh - 24px);overflow-y:auto}.adm-grid{grid-template-columns:1fr;gap:9px}.adm-qt{padding:10px 13px;gap:11px;border-radius:13px}.adm-qt.wide{grid-column:auto}.adm-qt .ic{width:32px;height:32px;border-radius:9px}.adm-qt .ic svg{width:18px;height:18px}.adm-qt h3{font-size:19px}.adm-qt small{display:none}.adm-qt .bdg{position:static;margin-left:auto;top:auto;right:auto}.adm-out2{height:50px;font-size:15px}}" +
    ".sh-sj{display:inline-flex;align-items:center;gap:4px;color:#F2B33D;text-decoration:none;font:600 13px Inter,system-ui,sans-serif}.sh-sj svg{width:15px;height:15px}.sh-sj b{font-weight:700}.sh-sj[data-n='0']{display:none!important}" +
    ".sh-adm{display:flex;align-items:center;gap:10px}" +
    ".adm-out{height:44px;border:0;border-radius:12px;background:transparent;color:#98989D;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}" +
"@media (max-width:719px){.sh-top{height:54px}.sh-logo img{height:34px}.sh-nav{justify-content:space-around;gap:0}.sh-nav a{padding:0 10px;font-size:14px;height:42px}.sh-nav a[aria-current=page]::after{left:10px;right:10px}}" +
    /* Recherche */
    ".fs{position:fixed;inset:0;z-index:80;background:rgba(8,8,10,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:flex-start;padding:calc(env(safe-area-inset-top,0px) + 10vh) 16px 16px;font-family:Inter,'Noto Sans JP',system-ui,sans-serif}" +
    ".fs[hidden]{display:none}" +
    ".fs-box{width:100%;max-width:640px;max-height:76vh;display:flex;flex-direction:column;background:#1B1B1D;border:1px solid #2C2C2F;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}" +
    ".fs-in{display:flex;align-items:center;gap:10px;padding:0 10px 0 16px;border-bottom:1px solid #2C2C2F;color:#98989D}" +
    ".fs-in input{flex:1;height:56px;border:0;background:transparent;color:#F5F5F7;font:inherit;font-size:17px!important;outline:none;min-width:0;-webkit-appearance:none;appearance:none}" +
    ".fs-in input::placeholder{color:#7A7A80}" +
    ".fs-in input::-webkit-search-cancel-button{display:none}" +
    ".fs-x{border:0;background:#2C2C2F;color:#CFCFD4;font:inherit;font-size:12px;font-weight:600;height:28px;padding:0 10px;border-radius:8px;cursor:pointer}" +
    ".fs-res{overflow-y:auto;overscroll-behavior:contain;padding:6px 0 10px}" +
    ".fs-g{padding:10px 16px 4px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7A7A80;display:flex;justify-content:space-between}" +
    ".fs-g a{color:#6FA8F5;text-decoration:none;letter-spacing:0;text-transform:none;font-size:12px}" +
    ".fs-r{display:flex;align-items:center;gap:12px;padding:8px 16px;text-decoration:none;color:#F5F5F7;min-height:52px}" +
    ".fs-r[aria-selected=true]{background:#2A2A2D}" +
    ".fs-r .ic{width:34px;height:48px;flex:none;border-radius:6px;background:#38383B;overflow:hidden;display:grid;place-items:center;color:#98989D;font-size:12px;font-weight:700}" +
    ".fs-r .ic.sq{height:34px;border-radius:9px}.fs-r .ic.rd{height:34px;border-radius:50%}" +
    ".fs-r .ic img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".fs-r .tx{min-width:0;flex:1}" +
    ".fs-r b{display:block;font-weight:600;font-size:15px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fs-r b mark{background:none;color:#6FA8F5}" +
    ".fs-r small{display:block;font-size:12.5px;color:#98989D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".fs-e{padding:26px 16px;text-align:center;color:#98989D;font-size:14px}" +
    ".fs-h{display:flex;gap:14px;justify-content:flex-end;padding:8px 16px;border-top:1px solid #2C2C2F;font-size:11.5px;color:#7A7A80}" +
    ".fs-h kbd{font:inherit;background:#2C2C2F;border-radius:4px;padding:1px 5px;color:#CFCFD4}" +
    "@media (max-width:719px){.fs{padding:calc(env(safe-area-inset-top,0px) + 8px) 8px 8px;background:rgba(8,8,10,.86)}.fs-box{max-height:none;height:100%;border-radius:16px}.fs-h{display:none}}" +
    "body.fs-open{overflow:hidden}" +
    /* Compte (brouillon) */
    ".me{position:fixed;inset:0;z-index:80;background:rgba(8,8,10,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,system-ui,sans-serif}" +
    ".me[hidden]{display:none}" +
    ".me-box{width:100%;max-width:400px;max-height:calc(100vh - 32px);overflow:auto;background:#1B1B1D;border:1px solid #2C2C2F;border-radius:22px;padding:22px 20px 18px;color:#F5F5F7}" +
    ".me-box h3{margin:0 0 6px;font-size:20px}.me-box p{margin:0 0 14px;color:#CFCFD4;font-size:14.5px;line-height:1.5}" +
    ".me-box ul{margin:0 0 18px;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:14.5px}" +
    ".me-box li{display:flex;gap:10px;align-items:center}.me-box li i{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;font-style:normal;flex:none}.me-box li i svg{width:17px;height:17px;display:block}" +
    ".me-box button{width:100%;height:46px;border:0;border-radius:23px;font:inherit;font-weight:700;cursor:pointer}" +
    ".me-box .go{background:#305887;color:#fff;opacity:.55;cursor:default}.me-box .no{margin-top:8px;background:transparent;color:#98989D}" +
    ".me-g{display:flex;justify-content:center;min-height:44px;margin-top:6px;color-scheme:light}.me-err{color:#F08A7E;font-size:13px;min-height:0;margin:6px 0 0}" +
    ".me-u{display:flex;align-items:center;gap:12px;margin:4px 0 14px}.me-u img{width:52px;height:52px;border-radius:50%}.me-u b{display:block;font-size:17px}.me-u small{color:#98989D}" +
    ".me-box a.go2{display:flex;align-items:center;justify-content:center;height:46px;border-radius:23px;background:#305887;color:#fff;font-weight:700;text-decoration:none;margin-bottom:8px}" +
    ".me-box .out{background:#38383B;color:#F5F5F7}" +
    ".me-mb{display:block;text-align:center;margin-top:12px;color:#4C9BFF;font-weight:600;font-size:14px;text-decoration:none}" +
    ".sh-me img{width:30px;height:30px;border-radius:50%;display:block}" +
    /* Ordinateur (Will, 05/10/2026) : une seule ligne. Logo à gauche, rubriques, puis loupe, nombre à valider et avatar tout à droite. */
    "@media (max-width:719px){.sh-d{display:none!important}}" +
    /* Téléphone (Will, 07/10/2026) : comme sur ordinateur, logo à gauche ; à droite, de droite à gauche : avatar, nombre à valider, loupe. */
    /* Logo de nouveau au centre (Will, 07/10/2026, 15 h 30) ; loupe à gauche ; à droite : nombre à valider puis avatar. */
    "@media (max-width:719px){.sh-top{justify-content:flex-end;gap:2px;padding:0 6px}.sh-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}.sh-logo img{height:32px}" +
    ".sh-btn{position:static;transform:none;flex:none}.sh-search{order:1;margin-right:auto}.sh-adm{order:3;position:static!important;transform:none;margin:0 2px}.sh-me{order:4}" +
    ".adm-box{left:auto!important;right:12px}" +
    /* Onglets du téléphone : Actualités, Séries, Calendrier, Ma collection, puis ☰ pour le reste (À l'écran, Mangakas…). */
    ".sh-nav a.sh-m0{display:none!important}.sh-nav a.sh-d{display:flex!important}.sh-nav a{flex:1 1 auto!important;min-width:0;padding:0 4px!important;font-size:15.5px!important}" +
    ".sh-plus{flex:none;align-self:stretch;width:44px;margin-left:6px;margin-right:-4px;border:0;padding:0;background:transparent!important;color:#F5F5F7;display:grid;place-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".sh-plus .x{display:none}.sh-plus[aria-expanded=true] .x{display:block}.sh-plus[aria-expanded=true] .b{display:none}" +
    ".sh-more{margin:-4px 12px 10px;padding:6px;background:#000;border-radius:14px;display:grid;grid-template-columns:1fr 1fr;gap:4px}.sh-more[hidden]{display:none}" +
    ".sh-more a{height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;text-decoration:none;color:#CFCFD4;font:700 16px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.03em;background:#1C1C1E}.sh-more a[aria-current=page]{background:#38383B;color:#F5F5F7}}" +
    "@media (min-width:720px){.sh-plus,.sh-more{display:none!important}}" +
    "@media (min-width:720px){.sh-in{display:flex;align-items:center;gap:8px;max-width:1240px;margin:0 auto;padding:0 20px;height:68px}" +
    ".sh-top{display:contents}.sh-logo{order:0;flex:none;margin-right:14px}.sh-logo img{height:38px}" +
    ".sh-nav{order:1;flex:1;min-width:0;margin:0;padding:0;border:0;justify-content:flex-start;gap:2px;overflow-x:auto;scrollbar-width:none}.sh-nav::-webkit-scrollbar{display:none}" +
    ".sh-nav a{flex:none;height:68px;padding:0 12px;font-size:14.5px;white-space:nowrap}.sh-nav a[aria-current=page]::after{left:12px;right:12px;bottom:0}" +
    ".sh-btn{position:static;transform:none;flex:none}.sh-search{order:3;margin-left:auto}.sh-adm{order:4;position:static;transform:none;margin-left:4px}.sh-me{order:5}" +
    ".sh-val b{font-size:14px!important;color:#CFCFD4!important}}" +
    "@media (min-width:720px) and (max-width:1099px){.sh-nav a{padding:0 9px;font-size:13.5px}.sh-nav a[aria-current=page]::after{left:9px;right:9px}}" +
    /* Rubriques en onglets plats dans un cadre noir, comme la maquette T (Will, 05/10/2026) */
    "@media (min-width:720px){.sh-nav{flex:none;background:#000;border-radius:16px;padding:5px;gap:4px;overflow:visible}" +
    ".sh-nav a{height:40px;padding:0 18px;border-radius:12px;font:700 17px/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.03em;color:#98989D}" +
    ".sh-nav a:hover{color:#F5F5F7;background:#1C1C1E}.sh-nav a[aria-current=page]{background:#38383B;color:#F5F5F7}.sh-nav a[aria-current=page]::after{display:none}}" +
    /* Piste D validée (Will, 05/10/2026) : plus de cadre, rubriques en blanc, rubrique active soulignée du rouge du logo (#BC002D). */
    "@media (max-width:719px){.sh-nav{background:transparent!important;margin:2px 12px 4px!important;padding:0!important;justify-content:space-around!important}" +
    ".sh-nav a{flex:none!important;height:44px!important;padding:0 4px!important;border-radius:0!important;background:none!important;color:#F5F5F7!important}" +
    ".sh-nav a[aria-current=page]::after{display:block!important;left:2px!important;right:2px!important;bottom:3px!important;height:4px!important;border-radius:2px!important;background:#BC002D!important}}" +
    "@media (min-width:720px){.sh-nav{background:transparent;padding:0;gap:6px}" +
    ".sh-nav a{height:44px;padding:0 12px;border-radius:0;background:none!important;color:#F5F5F7}.sh-nav a:hover{color:#fff}" +
    ".sh-nav a:hover::after{content:'';display:block;position:absolute;left:12px;right:12px;bottom:4px;height:4px;border-radius:2px;background:rgba(188,0,45,.45)}" +
    ".sh-nav a[aria-current=page]::after{content:'';display:block;position:absolute;left:12px;right:12px;bottom:4px;height:4px;border-radius:2px;background:#BC002D}}" +
    /* Téléphone : un trait gris très léger sépare la ligne du logo (avatar, logo, recherche) du menu (Will, 05/10/2026). */
    "@media (max-width:719px){.sh-top{border-bottom:1px solid rgba(255,255,255,.07)}}" +
    /* Ordinateur : logo, menu, recherche et avatar un peu en retrait des bords du contenu (Will, 05/10/2026). */
    "@media (min-width:980px){.sh-in{padding:0 48px!important}}" +
    /* Téléphone, maquette validée le 17/10/2026 : une seule ligne. Logo rond à gauche, rubriques et ☰ (à la hauteur des majuscules)
       au milieu, avatar à droite. Plus de loupe ni de compteur : la recherche passe dans le menu de l'avatar. */
    ".sh-logo .sh-lr{display:none}" +
    "@media (max-width:719px){.sh-in{display:flex;flex-wrap:wrap;align-items:center;min-height:50px;padding:0 12px 0 14px;gap:0 10px}" +
    ".sh-top{display:contents!important}.sh-logo{position:static!important;transform:none!important;order:0;flex:none;line-height:0}" +
    ".sh-logo img{display:none!important}.sh-logo img.sh-lr{display:block!important;width:30px!important;height:30px!important}" +
    ".sh-search,.sh-adm{display:none!important}.sh-me{order:2;position:static!important;transform:none!important;flex:none;width:34px;height:34px}" +
    ".sh-nav{order:1;flex:1 1 0;min-width:0;overflow:hidden;margin:0!important;padding:0!important;border:0!important;display:flex!important;align-items:center;justify-content:center!important;gap:clamp(5.5px,2vw,11px)!important}" +
    ".sh-nav a{flex:none!important;height:50px!important;padding:0!important;font:500 clamp(12.5px,3.55vw,15.5px)/1 Antonio,'Arial Narrow',sans-serif!important;letter-spacing:.03em!important;text-transform:uppercase;color:#fff!important;white-space:nowrap}" +
    ".sh-nav a[aria-current=page]{color:#fff!important}.sh-nav a[aria-current=page]::after{left:0!important;right:0!important;bottom:0!important;height:2px!important;border-radius:0!important}" +
    ".sh-ma{display:none}" +
    ".sh-plus{flex:none!important;width:clamp(13.5px,3.7vw,16px)!important;height:50px;margin:0!important;padding:0;align-self:center;color:#fff}" +
    ".sh-plus svg.b{display:none!important}.sh-plus .bm{display:flex;flex-direction:column;justify-content:space-between;width:100%;height:clamp(10px,2.8vw,12px);transform:translateY(.7px)}.sh-plus .bm i{display:block;height:1.7px;border-radius:1px;background:currentColor}" +
    ".sh-plus[aria-expanded=true] .bm{display:none}.sh-plus .x{width:15px;height:15px}" +
    ".sh-more{order:3;flex:0 0 100%;margin:0 -2px 10px!important}}" +
    "@media (min-width:720px){.sh-plus .bm,.sh-plus .pl{display:none}}" +
    ".adm-b.srch{background:#2A2A2D;border:0;width:100%;font:inherit;color:#F5F5F7;text-align:left;cursor:pointer}.adm-b.srch svg{width:20px;height:20px}" +
    // Téléphone (Will, 21/10/2026) : rubriques Actualités · Calendrier · Collection ; loupe à gauche de l'avatar pour tous ;
    // pour l'admin, le nombre de news à valider juste avant la loupe.
    "@media (max-width:719px){.sh-search{display:grid!important;order:3;position:static!important;transform:none!important;flex:none;width:30px;height:34px;place-items:center;color:#fff}.sh-search svg{width:19px;height:19px}" +
    ".sh-adm{display:flex!important;order:2;position:static!important;transform:none!important;margin:0!important;gap:6px}.sh-adm .sh-bo,.sh-adm .sh-sj{display:none!important}" +
    ".sh-adm .sh-val{pointer-events:auto!important;font-size:0!important;width:auto!important;height:auto!important;padding:0!important;background:transparent!important}" +
    ".sh-adm .sh-val b{display:flex!important;align-items:center;justify-content:center;box-sizing:border-box;width:24px!important;min-width:24px!important;height:24px!important;padding:0!important;border-radius:50%!important;background:#BC002D!important;color:#fff!important;font:700 12px/1 -apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif!important;font-variant-numeric:tabular-nums;letter-spacing:-.03em;text-align:center}" +
    // Plus de 99 : pastille allongée (Will, 21/10/2026 : pastille bien ronde, nombre centré).
    ".sh-adm .sh-val[data-n='99+'] b,.sh-adm .sh-val.long b{width:auto!important;padding:0 7px!important;border-radius:12px!important}.sh-adm .sh-val[data-n='0']{display:none!important}" +
    ".sh-me{order:4!important}.sh-more{order:9!important}" +
    // ☰ remplacé par un « + » épais (Will, 21/10/2026) ; « × » quand le menu est ouvert.
    ".sh-plus{width:18px!important;display:grid!important;place-items:center}.sh-plus .pl{display:block;width:17px;height:17px}.sh-plus[aria-expanded=true] .pl{display:none}" +
    ".sh-nav{justify-content:center!important;padding-left:0!important;gap:clamp(6px,2.1vw,12px)!important}#sh .sh-nav a[aria-current=page]::after{content:''!important;display:block!important;position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:2px!important;border-radius:0!important;background:#BC002D!important}.sh-nav a{font-size:clamp(12.5px,3.45vw,15.5px)!important}" +
    ".sh-in{gap:0 clamp(5px,1.6vw,9px)!important;padding:0 10px 0 12px!important}.sh-search{width:26px!important}.sh-me{width:32px!important;height:32px!important}}" +
    ".me-srch{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:44px;margin:0 0 14px;border:0;border-radius:22px;background:#2C2C2F;color:#F5F5F7;font:600 14.5px Inter,system-ui,sans-serif;cursor:pointer}.me-srch svg{width:18px;height:18px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  // Squelettes de chargement (Will, 06/10/2026) : des blocs gris qui pulsent à la place du contenu, puis la page finale.
  // .sk = bloc gris animé ; les images pas encore chargées pulsent aussi, puis apparaissent en fondu.
  var skc = document.createElement("style");
  skc.textContent = "@keyframes fgsk{0%{background-position:100% 0}100%{background-position:-100% 0}}" +
    ".sk,img.sk-i{background:linear-gradient(90deg,#1C1C1E 25%,#2A2A2D 50%,#1C1C1E 75%) 0 0/200% 100%!important;animation:fgsk 1.3s ease-in-out infinite}" +
    ".sk{display:block;border-radius:10px;color:transparent!important}" +
    "img.sk-i{color:transparent}img.sk-f{opacity:0}img.sk-in{opacity:1;transition:opacity .35s ease}" +
    ".skw{display:flex;flex-direction:column;gap:14px;padding:16px}.skr{display:flex;gap:12px;align-items:center}.skg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}" +
    "@media (min-width:980px){.skw{max-width:1240px;margin:0 auto;padding:24px 20px}.skg{grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px}}" +
    "@media (prefers-reduced-motion:reduce){.sk,img.sk-i{animation:none}}";
  document.head.appendChild(skc);
  function skImg(im) {
    if (im.dataset.sk || im.closest(".site-head,.sh,header,.no-sk")) return;
    im.dataset.sk = "1";
    if (im.complete && im.naturalWidth) return;
    im.classList.add("sk-i", "sk-f");
    var done = function () { im.classList.remove("sk-i"); im.classList.add("sk-in"); im.classList.remove("sk-f"); };
    im.addEventListener("load", done, { once: true }); im.addEventListener("error", function () { im.classList.remove("sk-i", "sk-f"); }, { once: true });
  }
  if (window.MutationObserver) new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType !== 1) return; if (n.tagName === "IMG") skImg(n); else if (n.querySelectorAll) n.querySelectorAll("img").forEach(skImg); }); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  var B = function (w, h, r) { return '<i class="sk" style="width:' + w + ";height:" + h + "px" + (r ? ";border-radius:" + r + "px" : "") + '"></i>'; };
  // Gabarits réutilisés par les pages : grille de couvertures, liste de cartes, fiche, article.
  window.FG_SK = {
    b: B,
    grid: function (n) { var h = ""; for (var i = 0; i < (n || 12); i++) h += '<div style="display:flex;flex-direction:column;gap:8px">' + B("100%", 0).replace("height:0px", "aspect-ratio:2/3;height:auto") + B("80%", 14) + "</div>"; return '<div class="skw"><div class="skr">' + B("100%", 46, 14) + B("96px", 46, 14) + '</div><div class="skr">' + B("70px", 34, 17) + B("70px", 34, 17) + B("70px", 34, 17) + B("70px", 34, 17) + '</div><div class="skg">' + h + "</div></div>"; },
    cards: function (n) { var h = ""; for (var i = 0; i < (n || 4); i++) h += '<div class="skr" style="padding:12px;border-radius:18px;background:#0B0B0C">' + B("88px", 110, 12) + '<div style="flex:1;display:flex;flex-direction:column;gap:9px">' + B("40%", 11) + B("75%", 20) + B("100%", 13) + B("85%", 13) + "</div></div>"; return '<div class="skw">' + h + "</div>"; },
    fiche: function () { return '<div class="skw"><div class="skr" style="align-items:flex-start;gap:20px;flex-wrap:wrap">' + B("min(260px,40%)", 0).replace("height:0px", "aspect-ratio:2/3;height:auto;flex:none") + '<div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:12px">' + B("70%", 46) + B("30%", 16) + B("45%", 16) + B("100%", 14) + B("100%", 14) + B("90%", 14) + B("60%", 14) + "</div></div>" + B("100%", 52, 16) + '<div class="skr">' + B("25%", 70, 14) + B("25%", 70, 14) + B("25%", 70, 14) + B("25%", 70, 14) + "</div></div>"; },
    article: function () { return B("100%", 0, 0).replace("height:0px", "height:min(58vh,460px)") + '<div class="skw">' + B("30%", 14) + B("100%", 16) + B("100%", 16) + B("92%", 16) + B("70%", 16) + B("100%", 0, 16).replace("height:0px", "aspect-ratio:16/9;height:auto") + B("100%", 64, 14) + "</div>"; }
  };
  var p = location.pathname;
  var cur = /^\/series/.test(p) ? "series" : /^\/films/.test(p) ? "ecran" : /^\/calendrier/.test(p) ? "cal" : /^\/ma-collection/.test(p) ? "col" : /^\/auteurs/.test(p) ? "mk" : /^\/crows-x-worst/.test(p) ? "cxw" : /^\/(communaute|membres)/.test(p) ? "cm" : (/^\/actus/.test(p) || ((p === "/" || p === "/index.html") && /[?&](vue=actus|cat=)/.test(location.search))) ? "actu" : "";
  if (/vue=magazines/.test(location.search) || /^\/japon/.test(p)) cur = "jp";
  var a = function (k, href, label, d, nw, cl) { return '<a href="' + href + '"' + (d ? ' class="sh-d"' : cl ? ' class="' + cl + '"' : "") + (nw ? ' target="_blank" rel="noopener"' : "") + (cur === k ? ' aria-current="page"' : "") + ">" + label + "</a>"; };
  var ICON_S = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  var html = '<header class="sh" id="sh"><div class="sh-in">' +
    '<div class="sh-top"><button class="sh-btn sh-me" id="sh-me" aria-label="Mon compte"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c.8-4.3 4.2-7 8.5-7s7.7 2.7 8.5 7z"/></svg></span></button>' +
    '<a class="sh-logo" href="/" aria-label="FuryoGang, accueil"><img src="/img/logo-furyogang.png" alt="FuryoGang" width="900" height="218"><img class="sh-lr" src="/img/logo-rond.png" alt="" width="276" height="276"></a>' +
    '<a class="sh-btn sh-search" id="sh-search" href="/series/" aria-label="Rechercher sur le site">' + ICON_S + '</a></div>' +
    '<nav class="sh-nav" aria-label="Rubriques">' + a("actu", "/?vue=actus", "Actualités") + a("series", "/series/", "Séries", 0, 0, "sh-m0") + a("ecran", "/films/", "À l'écran", 0, 0, "sh-m0") + a("cal", "/calendrier/", "Calendrier") +
    // « Au Japon » (Will, 12/10/2026) : ordinateur seulement, juste avant Ma collection qui reste à droite, ouvre le Direct du Japon (magazines et séries en ligne).
    a("jp", "/japon/", "Au Japon", 0, 0, "sh-m0") +
a("col", "/ma-collection/", '<span class="sh-ma">Ma&nbsp;</span>collection', 1) +
    '<button class="sh-plus" id="sh-plus" type="button" aria-label="Autres rubriques" aria-expanded="false" aria-controls="sh-more"><svg class="pl" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg><svg class="b" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="x" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    "</nav>" +
    // Menu ☰ du téléphone (Will, 21/10/2026) : Séries en haut à gauche, Crows × Worst en haut à droite, puis le reste.
    '<div class="sh-more" id="sh-more" hidden>' + a("series", "/series/", "Séries") + a("cxw", "/crows-x-worst/", "Crows × Worst") + a("ecran", "/films/", "À l'écran") + a("mk", "/auteurs/", "Mangakas") + a("cm", "/communaute/", "Communauté") + a("jp", "/japon/", "Au Japon") + "</div>" +
    "</div></header>";
  var me = document.currentScript;
  me.insertAdjacentHTML("beforebegin", html);
  var plus = document.getElementById("sh-plus"), more = document.getElementById("sh-more");
  if (plus && more) {
    // Le menu reste fermé à l'arrivée sur une page, même si elle en fait partie (Will, 07/10/2026).
    plus.addEventListener("click", function () { more.hidden = !more.hidden; plus.setAttribute("aria-expanded", String(!more.hidden)); if (typeof set === "function") set(); });
  }
  var set = function () { var h = document.getElementById("sh"); if (h) document.documentElement.style.setProperty("--sh-h", h.offsetHeight + "px"); };
  set(); addEventListener("resize", set); addEventListener("load", set);

  // Barre d'état de l'iPhone (Safari) de la même couleur que l'en-tête, pour la continuité (Will, 21/10/2026).
  (function () { var m = document.querySelector('meta[name="theme-color"]'); if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); } m.content = "#141416"; })();
  /* ---------- Recherche instantanée ---------- */
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9぀-ヿ㐀-鿿]+/g, " ").trim(); };
  // Voyelles longues : « ou / oo / ō / ô » et toute voyelle doublée ≡ une seule voyelle, pour que « tou », « too », « tōsenbō » et « tosenbo » tombent sur la même fiche (Will, 20/10/2026).
  var lv = function (s) { return String(s || "").replace(/ou/g, "o").replace(/([aeiou])\1+/g, "$1"); };
  var tn = function (n) { return (Number.isInteger(n) && n >= 0 && n < 10) ? "0" + n : String(n); };
  var MC = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var dc = function (s) { if (!s) return ""; var d = new Date(s + "T12:00:00"); return d.getDate() + " " + MC[d.getMonth()] + " " + d.getFullYear(); };
  var couv = function (u) { return "/api/couv?u=" + encodeURIComponent(u); };
  var shown = function (s) { return (s.t && s.fr && s.t === s.t.toUpperCase() && /[A-Z]/.test(s.t) && s.t.toLowerCase() === s.fr.toLowerCase()) ? s.t : (s.fr || s.t); };
  var PAGES = [
    { t: "Actualités", d: "Les dernières news furyō, yakuza et crime", u: "/", ic: "◉" },
    { t: "Séries", d: "Toutes les fiches séries", u: "/series/", ic: "▦" },
    { t: "Calendrier", d: "Les prochaines sorties", u: "/calendrier/", ic: "31" },
    { t: "Au Japon", d: "Prépublications et magazines japonais", u: "/japon/", ic: "誌", k: "japon magazine magazines prepublication prépublication chapitre" },
    { t: "Calendrier Japon", d: "Les sorties au Japon", u: "/calendrier/#japon", ic: "日", k: "japon jp" },
    { t: "Calendrier France", d: "Les sorties en France", u: "/calendrier/#france", ic: "FR", k: "france fr" },
    { t: "Mangakas", d: "Les auteurs et leurs séries", u: "/auteurs/", ic: "筆", k: "auteurs auteur dessinateur scenariste" },
    { t: "Avancement", d: "Les fiches en ligne et celles à venir", u: "/avancement/", ic: "%", k: "progression fiches" },
    { t: "CROWS × WORST", d: "La chronologie de l'univers", u: "/crows-x-worst/", ic: "鴉", k: "crows worst chronologie chrono" },
  ];
  var DATA = null, loading = null, sel = 0, flat = [];
  function load() {
    if (DATA || loading) return loading;
    var j = function (u) { return fetch(u).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }); };
    loading = Promise.all([j("/api/series"), j("/api/auteurs"), j("/api/calendrier"), j("/api/news"), j("/api/biblio")]).then(function (r) {
      var today = new Date().toISOString().slice(0, 10), from = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
      DATA = {
        series: (r[0].items || []).map(function (s) { return { t: shown(s), alt: [s.t, s.fr, s.jp].join(" "), d: [s.jp, s.type, s.y1].filter(Boolean).join(" · "), u: "/series/" + s.slug, img: s.cover }; }),
        auteurs: (r[1].authors || []).map(function (a) { return { t: a.name, alt: [a.name, a.jp].join(" "), d: [a.jp, (a.series || []).map(function (x) { return x.t; }).slice(0, 3).join(", ")].filter(Boolean).join(" · "), u: "/auteurs/" + a.slug, ini: (a.jp || a.name || "?").charAt(0) }; }),
        sorties: (r[2].items || []).filter(function (it) { return it.date >= from; }).map(function (it) {
          var t = it.fr && !(it.series && it.series === it.series.toUpperCase() && /[A-Z]/.test(it.series) && it.series.toLowerCase() === it.fr.toLowerCase()) ? it.fr : it.series;
          return { t: t + (it.n != null ? " T." + tn(it.n) : ""), alt: [it.series, it.fr, it.jp, it.pub].join(" "), d: [it.pays, it.pub, (it.date < today ? "sorti le " : "") + dc(it.date)].filter(Boolean).join(" · "), u: "/calendrier/#t-" + it.id, img: it.cover, date: it.date };
        }),
        // Séries de la base sans fiche en ligne (Will, 08/10/2026) : trouvables quand même, elles ouvrent Ma collection.
        collection: (function () {
          var avec = {}; (r[0].items || []).forEach(function (s) { avec[s.slug] = 1; });
          return (r[4].items || []).filter(function (s) { return s.slug && !avec[s.slug]; }).map(function (s) {
            return { t: shown(s), alt: [s.t, s.fr, s.jp].join(" "), d: [s.jp, "Fiche bientôt en ligne"].filter(Boolean).join(" · "), u: "/ma-collection/" + s.slug, img: s.cover };
          });
        })(),
        news: (r[3].items || []).map(function (n) { return { t: n.fr || n.titre, alt: [n.titre, n.fr, n.jp, n.pub, n.texte].join(" "), d: [n.type === "licence" ? "Licence FR" : "News", n.pub, dc(n.date)].filter(Boolean).join(" · "), u: "/#n-" + n.id, ini: n.type === "licence" ? "FR" : "!" }; }),
      };
      return DATA;
    });
    return loading;
  }
  // Score : début du titre > début d'un mot du titre > dans le titre > autres champs (japonais, éditeur…).
  function score(item, q) {
    var t = lv(norm(item.t)), o = lv(norm(item.alt)), Q = lv(q);
    if (t.indexOf(Q) === 0) return 100 - t.length / 100;
    if ((" " + t).indexOf(" " + Q) >= 0) return 80 - t.length / 100;
    if (t.indexOf(Q) >= 0) return 60;
    if ((" " + o).indexOf(" " + Q) >= 0) return 40;
    if (o.indexOf(Q) >= 0) return 20;
    return 0;
  }
  function find(list, q, max) {
    return list.map(function (x) { return [score(x, q), x]; }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, max).map(function (x) { return x[1]; });
  }
  // Surligne le début tapé quand il correspond au début du titre ou d'un mot.
  function hl(t, q) {
    if (!q) return esc(t);
    var words = t.split(/(\s+)/), out = "", done = false;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!done && norm(w).indexOf(q) === 0 && q.indexOf(" ") < 0) { out += "<mark>" + esc(w.slice(0, q.length)) + "</mark>" + esc(w.slice(q.length)); done = true; }
      else out += esc(w);
    }
    return out;
  }
  // Recherches récentes (Will, 10/10/2026) : les 4 derniers résultats ouverts, gardés sur l'appareil, affichés en premier quand la recherche est vide.
  var RK = "fg-recherches", SEEN = {};
  function recents() { try { var l = JSON.parse(localStorage.getItem(RK) || "[]"); return Array.isArray(l) ? l.slice(0, 4) : []; } catch (e) { return []; } }
  function retenir(u) {
    var x = SEEN[u]; if (!x) return;
    try { var l = recents().filter(function (y) { return y.u !== u; }); l.unshift({ t: x.t, d: x.d, u: x.u, img: x.img, ic: x.ic, ini: x.ini, k: x.k }); localStorage.setItem(RK, JSON.stringify(l.slice(0, 4))); } catch (e) {}
  }
  function row(x, q, kind) {
    SEEN[x.u] = { t: x.t, d: x.d, u: x.u, img: x.img, ic: x.ic, ini: x.ini, k: kind };
    var ic = x.img ? '<span class="ic"><img src="' + couv(x.img) + '" alt="" loading="lazy"></span>'
      : '<span class="ic ' + (kind === "auteurs" ? "rd" : "sq") + '">' + esc(x.ic || x.ini || "") + "</span>";
    return '<a class="fs-r" href="' + esc(x.u) + '" role="option">' + ic + '<span class="tx"><b>' + hl(x.t, q) + "</b>" + (x.d ? "<small>" + esc(x.d) + "</small>" : "") + "</span></a>";
  }
  var GROUPS = [["series", "Séries", 6, "/series/"], ["collection", "Dans la collection", 5, "/ma-collection/"], ["auteurs", "Mangakas", 4, "/auteurs/"], ["sorties", "Sorties", 5, "/calendrier/"], ["news", "Actualités", 4, "/"]];
  function draw() {
    var raw = inp.value.trim(), q = norm(raw), out = "";
    if (!q) {
      var rc = recents();
      if (rc.length) out += '<div class="fs-g">Recherches récentes<a href="#" id="fs-clr">Effacer</a></div>' + rc.map(function (x) { return row(x, "", x.k); }).join("");
      out += '<div class="fs-g">Raccourcis</div>' + PAGES.slice(0, 7).map(function (x) { return row(x, "", "pages"); }).join("");
      if (DATA) {
        var today = new Date().toISOString().slice(0, 10);
        var next = DATA.sorties.filter(function (s) { return s.date >= today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, 4);
        if (next.length) out += '<div class="fs-g">Prochaines sorties <a href="/calendrier/">Tout voir</a></div>' + next.map(function (x) { return row(x, "", "sorties"); }).join("");
      }
    } else {
      var pages = find(PAGES.map(function (x) { return { t: x.t, alt: x.t + " " + (x.k || "") + " " + x.d, d: x.d, u: x.u, ic: x.ic }; }), q, 3);
      if (pages.length) out += '<div class="fs-g">Pages</div>' + pages.map(function (x) { return row(x, q, "pages"); }).join("");
      if (DATA) GROUPS.forEach(function (g) {
        var r = find(DATA[g[0]], q, g[2]);
        if (r.length) out += '<div class="fs-g">' + g[1] + '<a href="' + g[3] + '">Tout voir</a></div>' + r.map(function (x) { return row(x, q, g[0]); }).join("");
      });
      if (!out) out = DATA ? '<div class="fs-e">Rien trouvé pour « ' + esc(raw) + " ».<br>Essaie le titre japonais, français ou le nom du mangaka.</div>" : '<div class="fs-e">Chargement…</div>';
    }
    res.innerHTML = out;
    flat = [].slice.call(res.querySelectorAll(".fs-r")); sel = 0; mark(true);
  }
  function mark(quiet) { flat.forEach(function (el, i) { el.setAttribute("aria-selected", i === sel ? "true" : "false"); }); if (!quiet && flat[sel]) flat[sel].scrollIntoView({ block: "nearest" }); }
  document.body.insertAdjacentHTML("beforeend",
    '<div class="fs" id="fs" hidden role="dialog" aria-modal="true" aria-label="Recherche"><div class="fs-box">' +
    '<div class="fs-in">' + ICON_S + '<input id="fs-q" type="search" placeholder="Série, mangaka, sortie, actu…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label="Rechercher"><button class="fs-x" id="fs-x">Fermer</button></div>' +
    '<div class="fs-res" id="fs-res" role="listbox"></div>' +
    '<div class="fs-h"><span><kbd>↑</kbd> <kbd>↓</kbd> naviguer</span><span><kbd>Entrée</kbd> ouvrir</span><span><kbd>Échap</kbd> fermer</span></div></div></div>' +
    '<div class="me" id="me" hidden role="dialog" aria-modal="true" aria-label="Compte"><div class="me-box"><button type="button" class="me-srch" data-srch>' + ICON_S + 'Rechercher sur le site</button><h3>Ton compte FuryoGang</h3>' +
    "<p>Connecte-toi en un clic avec Google. Ton compte gratuit te permettra bientôt de :</p>" +
    "<ul><li><i style=\"background:#E5483926;color:#E54839\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M12 21s-8.5-5.2-8.5-11.6C3.5 6.3 5.8 4 8.6 4c1.5 0 2.7.7 3.4 1.8C12.7 4.7 13.9 4 15.4 4c2.8 0 5.1 2.3 5.1 5.4C20.5 15.8 12 21 12 21z\"/></svg></i>Liker les actus et les séries</li><li><i style=\"background:#F2B33D26;color:#F2B33D\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z\"/></svg></i>Garder tes séries préférées en favoris</li><li><i style=\"background:#4C9BFF26;color:#4C9BFF\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M12 3l8 9h-5v9H9v-9H4z\"/></svg></i>Voter pour les séries populaires</li><li><i style=\"background:#7BC67E26;color:#7BC67E\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><circle cx=\"9\" cy=\"8\" r=\"4\"/><path d=\"M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7z\"/><circle cx=\"17\" cy=\"7\" r=\"3\"/><path d=\"M17.5 12c2.8.3 4.5 2.6 4.5 5.5V19h-4.2c-.3-2.6-1.5-4.9-3.3-6.4.9-.4 1.9-.6 3-.6z\"/></svg></i>Voir la famille FuryoGang (réservé aux membres)</li></ul>" +
    '<div id="me-g" class="me-g"></div><p class="me-err" id="me-err"></p><a class="me-mb" href="/communaute/">Voir la communauté</a><button class="no" id="me-x">Fermer</button></div></div>');
  var fs = document.getElementById("fs"), inp = document.getElementById("fs-q"), res = document.getElementById("fs-res"), meBox = document.getElementById("me");
  function open() {
    fs.hidden = false; document.body.classList.add("fs-open"); inp.value = ""; draw(); inp.focus();
    var l = load(); if (l) l.then(function () { if (!fs.hidden) draw(); });
  }
  function close() { fs.hidden = true; document.body.classList.remove("fs-open"); }
  document.getElementById("sh-search").addEventListener("click", function (e) { e.preventDefault(); open(); });
  // Recherche ouvrable depuis l'accès rapide admin des pages sans en-tête (back-office, HQ) : /#recherche (Will, 21/10/2026).
  window.FG_SEARCH = open;
  if (location.hash === "#recherche") { history.replaceState(null, "", location.pathname + location.search); setTimeout(open, 50); }
  document.getElementById("fs-x").addEventListener("click", close);
  fs.addEventListener("click", function (e) { if (e.target === fs) close(); });
  res.addEventListener("click", function (e) {
    if (e.target.id === "fs-clr") { e.preventDefault(); try { localStorage.removeItem(RK); } catch (x) {} draw(); return; }
    var r = e.target.closest(".fs-r"); if (r) retenir(r.getAttribute("href"));
    if (e.target.closest(".fs-r, .fs-g a")) close();
  });
  inp.addEventListener("input", draw);
  inp.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(flat.length - 1, sel + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === "Enter" && flat[sel]) { e.preventDefault(); var u = flat[sel].getAttribute("href"); retenir(u); close(); location.href = u; }
  });
  addEventListener("keydown", function (e) {
    var typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || "");
    if (e.key === "Escape") { if (!fs.hidden) close(); if (!meBox.hidden) meBox.hidden = true; var ap = document.getElementById("adm-pop"); if (ap) ap.hidden = true; }
    else if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && fs.hidden)) { e.preventDefault(); open(); }
  });
  // Préchargement discret des données quand le doigt ou la souris approche de la loupe.
  ["pointerenter", "touchstart", "focus"].forEach(function (ev) { document.getElementById("sh-search").addEventListener(ev, load, { passive: true }); });
  /* ---------- Compte : connexion « Continuer avec Google » ---------- */
  var GCID = "923817714860-h88lmvr2bnvninn41ioa19iv2lrd2ed5.apps.googleusercontent.com", ME = null;
  var meInner = meBox.querySelector(".me-box"), meDefault = meInner.innerHTML;
  function bindClose() { var x = document.getElementById("me-x"); if (x) x.onclick = function () { meBox.hidden = true; }; var sr = meBox.querySelector("[data-srch]"); if (sr) sr.onclick = function () { meBox.hidden = true; open(); }; }
  function drawAvatar() {
    var btn = document.getElementById("sh-me");
    if (ME && ME.user && ME.user.picture) btn.innerHTML = '<img src="' + esc(ME.user.picture) + '" alt="" referrerpolicy="no-referrer">';
    var old = document.querySelector(".sh-adm"); if (old) old.remove();
    // Seulement pour un membre connecté avec Google ET administrateur (un ancien accès admin seul ne suffit pas).
    if (ME && ME.admin && ME.user) {
      var box = document.createElement("div"); box.className = "sh-adm";
      box.innerHTML = '<a class="sh-bo" href="/admin/" aria-label="Back-office"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>Back-office</a>' +
        '<a class="sh-val" href="/admin/#validation" data-n="0" aria-label="Validation">Validation<b>0</b></a>' +
        // Sorties du jour pas encore postées (Will, 06/10/2026) : icône calendrier + nombre en jaune, à côté du nombre de la veille.
        '<a class="sh-sj" href="/admin/#sorties" data-n="0" aria-label="Sorties du jour"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg><b>0</b></a>';
      document.querySelector(".sh-top").appendChild(box);
      valCount();
    }
  }
  // Pastille « Validation » : nombre d'éléments de la veille à relire, mis à jour chaque minute tant que la page est ouverte.
  var valTimer = null;
  var SJ = { n: 0, fr: 0, jp: 0 };
  function sjCount() {
    var a = document.querySelector(".sh-sj"); if (!a) return;
    fetch("/api/admin/sorties?count=1", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return; SJ = j; a.setAttribute("data-n", j.n || 0); a.querySelector("b").textContent = j.n || 0;
      a.setAttribute("aria-label", "Sorties du jour : " + (j.n || 0) + " à poster");
    }).catch(function () {});
  }
  function valCount() {
    sjCount();
    var a = document.querySelector(".sh-val"); if (!a) return;
    fetch("/api/admin/veille?count=1", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return; var n = j.n || 0; a.setAttribute("data-n", n); a.classList.toggle("long", n > 99); a.querySelector("b").textContent = n > 99 ? "99+" : n;
      a.setAttribute("aria-label", "Validation : " + n + " à relire");
    }).catch(function () {});
    clearTimeout(valTimer); valTimer = setTimeout(function () { if (!document.hidden) valCount(); else document.addEventListener("visibilitychange", function v() { if (!document.hidden) { document.removeEventListener("visibilitychange", v); valCount(); } }); }, 60000);
  }
  function gis(cb) {
    if (window.google && google.accounts && google.accounts.id) return cb();
    var sc = document.createElement("script"); sc.src = "https://accounts.google.com/gsi/client"; sc.async = true; sc.onload = cb; document.head.appendChild(sc);
  }
  // L'avatar ouvre une petite fenêtre : Validation, raccourcis et Back-office pour l'admin, Communauté pour tous.
  // Mon feed, Signets et Ma collection retirés (Will, 08/10/2026) : déjà accessibles depuis le site.
  function admPop() {
    var pop = document.getElementById("adm-pop");
    if (!pop) {
      pop = document.createElement("div"); pop.className = "adm-pop"; pop.id = "adm-pop"; pop.hidden = true;
      document.body.appendChild(pop);
      pop.addEventListener("click", function (e) { if (e.target === pop) pop.hidden = true; });
    }
    // Menu admin H1 (Will, 25/10/2026) : chargé à part ; l'ancienne grille reste en secours si le fichier ne charge pas.
    if (ME.admin) {
      pop.hidden = true;
      if (window.FG_ADMPOP) { window.FG_ADMPOP(ME, open); return; }
      var sc = document.createElement("script"); sc.src = "/site/admin-pop.js?v=1";
      sc.onload = function () { window.FG_ADMPOP(ME, open); }; sc.onerror = function () { admGrid(pop); };
      document.head.appendChild(sc); return;
    }
    pop.classList.remove("center");
    var n = (document.querySelector(".sh-val") || { getAttribute: function () { return "0"; } }).getAttribute("data-n") || "0";
    pop.innerHTML = '<div class="adm-box" role="dialog" aria-label="Mon compte">' +
      '<a class="adm-u" href="/profil/">' + (ME.user.picture ? '<img src="' + esc(ME.user.picture) + '" alt="" referrerpolicy="no-referrer">' : "<i></i>") + '<span><b>' + esc(ME.user.name || "Membre") + '</b><small>' + (ME.admin ? "Administrateur" : "Membre FuryoGang") + ' · Voir mon profil</small></span></a>' +
      // Recherche (Will, 17/10/2026) : sur téléphone, la loupe n'est plus dans l'en-tête, elle passe ici.
      '<button type="button" class="adm-b srch" data-srch><span><strong>Rechercher</strong><small>Séries, mangakas, sorties, news</small></span>' + ICON_S + '</button>' +
      (ME.admin ? '<a class="adm-b v" href="/admin/#validation"><span><strong>Validation</strong><small>À relire avant publication</small></span><em>' + esc(n) + '</em></a>' +
      // Sorties du jour et Couvertures manquantes toujours visibles, juste sous Validation (Will, 08/10/2026) : un clic au lieu de deux.
      '<a class="adm-b j" href="/admin/#sorties"><span><strong>Sorties du jour</strong><small>' + (SJ.n ? [SJ.fr ? SJ.fr + " France" : "", SJ.jp ? SJ.jp + " Japon" : ""].filter(Boolean).join(" · ") + " à poster" : "Rien à poster pour l'instant") + '</small></span>' + (SJ.n ? '<em>' + SJ.n + '</em>' : '<span aria-hidden="true">→</span>') + '</a>' +
      '<a class="adm-b" href="/admin/#couvertures"><span><strong>Couvertures manquantes</strong><small>Les tomes parus sans couverture</small></span><span aria-hidden="true">→</span></a>' +
      '<a class="adm-b" href="/admin/"><span><strong>Back-office</strong><small>Base mangas, fiches, réglages</small></span><span aria-hidden="true">→</span></a>' +
      // HQ, le QG de Will : ressources, to-do, promo, kit officiel (Will, 15/10/2026).
      '<a class="adm-b" href="/hq/"><span><strong>HQ</strong><small>Ressources, to-do, promo, kit officiel</small></span><span aria-hidden="true" style="font:900 15px \'Noto Sans JP\',sans-serif;color:#BC002D">本部</span></a>' +
      // Statistiques Google (Search Console), réservées à l'admin (Will, 07/10/2026).
      '<a class="adm-b" href="/admin/#stats"><span><strong>Statistiques</strong><small>Clics et recherches Google</small></span><span aria-hidden="true">→</span></a>' : "") +
      // Communauté (Will, 07/10/2026) : réseaux, classement des collections, membres.
      '<a class="adm-b fgcm" href="/communaute/"><span><strong>Communauté</strong><small>Tous les membres du gang</small></span><span aria-hidden="true">→</span></a>' +
      '<button class="adm-out" type="button">Se déconnecter</button></div>';
    pop.querySelector("[data-srch]").onclick = function () { pop.hidden = true; open(); };
    pop.querySelector(".adm-out").onclick = function () { fetch("/api/auth/me", { method: "DELETE" }).then(function () { location.reload(); }); };
    // Ordinateur : même fenêtre que sur téléphone, ouverte sous l'avatar, sans assombrir la page (Will, 04/10/2026).
    var box = pop.querySelector(".adm-box"), av = document.getElementById("sh-me");
    if (!matchMedia("(max-width:719px)").matches && av) {
      var r = av.getBoundingClientRect();
      pop.style.background = "transparent";
      box.style.top = Math.round(r.bottom + 10) + "px"; if (r.left < innerWidth / 2) box.style.left = Math.max(12, Math.round(r.left)) + "px"; else { box.style.left = "auto"; box.style.right = Math.max(12, Math.round(innerWidth - r.right)) + "px"; }
      box.style.boxShadow = "0 20px 50px rgba(0,0,0,.5)"; box.style.border = "1px solid #38383B";
    } else { pop.style.background = ""; box.style.cssText = ""; }
    pop.hidden = false;
  }
  // Accès rapide admin : pop-up centré, grille 2 par 2 (Will, 19/10/2026, maquette validée).
  var COUV = null;
  function admGrid(pop) {
    pop.classList.add("center"); pop.style.background = "";
    var n = (document.querySelector(".sh-val") || { getAttribute: function () { return "0"; } }).getAttribute("data-n") || "0";
    var I = {
      news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h11v15H5a1 1 0 0 1-1-1z"/><path d="M15 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2"/><path d="M7 8.5h5M7 11.5h5M7 14.5h3"/></svg>',
      sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
      cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/></svg>',
      db: '<svg viewBox="0 0 24 24"><g fill="#fff"><rect x="3.3" y="6" width="3.1" height="13" rx="0.7"/><rect x="7.1" y="4.3" width="3.1" height="14.7" rx="0.7"/><rect x="14.9" y="7" width="3.1" height="12" rx="0.7"/><rect x="2" y="19" width="20" height="2.5" rx="1.25"/></g><rect x="10.9" y="5.2" width="3.3" height="13.8" rx="0.7" fill="#E54839"/></svg>',
      stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
      comm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/><circle cx="18" cy="7" r="3"/><path d="M18 13c2.6.2 4 2.3 4 4.8"/></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
      couv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>',
      admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
      hq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8l8-4 8 4v12"/><path d="M3 20h18M9.5 20v-4h5v4M8.5 11h2M13.5 11h2"/></svg>'
    };
    function qt(ic, title, sub, href, badge, wide) {
      return '<a class="adm-qt' + (wide ? " wide" : "") + '" href="' + href + '"><span class="ic">' + I[ic] + '</span><div><h3>' + title + '</h3><small>' + sub + '</small></div>' + (badge ? '<span class="bdg"><span>' + esc(String(badge)) + '</span></span>' : '') + '</a>';
    }
    var sjSub = SJ && SJ.n ? (SJ.n + " à poster") : "France + Japon";
    pop.innerHTML = '<div class="adm-card" role="dialog" aria-label="Accès rapide admin">' +
      '<div class="adm-h"><a class="adm-logo" href="/" aria-label="Retour au site"><img src="/img/logo-furyogang.png" alt="FuryoGang"></a><button class="x" type="button" aria-label="Fermer">×</button></div>' +
      // Recherche, au-dessus d'Actualités : sur téléphone, la loupe n'est plus dans l'en-tête (Will, 21/10/2026).
      '<button type="button" class="adm-srch" data-srch>' + ICON_S + '<span>Rechercher sur le site</span></button>' +
      '<div class="adm-grid">' +
        qt("news", "Actualités", "à relire", "/admin/#validation", n !== "0" ? n : "") +
        qt("sort", "Sorties", sjSub, "/admin/#sorties", SJ && SJ.n ? SJ.n : "") +
        qt("cal", "Calendrier", "la semaine", "/hq/#calendrier", "") +
        qt("db", "Mangas Database", "toutes les séries", "/admin/#mangas", "") +
        // Couvertures manquantes, nombre en direct, juste sous Mangas Database (Will, 21/10/2026).
        qt("couv", "Couvertures manquantes", COUV == null ? "tomes parus sans couverture" : (COUV ? COUV + " à remplir" : "tout est rempli"), "/admin/#couvertures", COUV || "", true).replace('class="adm-qt', 'data-couv class="adm-qt') +
        qt("admin", "Admin", "le back-office", "/admin/", "") +
        qt("stats", "Statistiques", "clics Google", "/admin/#stats", "") +
        qt("comm", "Communauté", "les membres", "/communaute/", "") +
        qt("user", "Mon compte", "profil, préférences", "/profil/", "") +
        qt("hq", "HQ", "ressources, promo", "/hq/", "") +
      '</div>' +
      '<button class="adm-out2" type="button">Se déconnecter</button></div>';
    pop.querySelector(".x").onclick = function () { pop.hidden = true; };
    pop.querySelector(".adm-srch").onclick = function () { pop.hidden = true; open(); };
    fetch("/api/admin/couvertures?count=1", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return; COUV = j.n || 0; var a = pop.querySelector("[data-couv]"); if (!a) return;
      a.querySelector("small").textContent = COUV ? COUV + " à remplir" : "tout est rempli";
      var b = a.querySelector(".bdg"); if (!COUV) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement("span"); b.className = "bdg"; b.innerHTML = "<span></span>"; a.appendChild(b); } b.firstChild.textContent = COUV;
    }).catch(function () {});
    pop.querySelector(".adm-out2").onclick = function () { fetch("/api/auth/me", { method: "DELETE" }).then(function () { location.reload(); }); };
    pop.hidden = false;
  }
  function openMe() {
    if (ME && ME.user) { admPop(); return; }
    if (false) {
      meInner.innerHTML = '<div class="me-u">' + (ME.user.picture ? '<img src="' + esc(ME.user.picture) + '" alt="" referrerpolicy="no-referrer">' : "") + '<div><b>' + esc(ME.user.name || "Membre") + '</b><small>' + (ME.admin ? "Administrateur" : "Membre FuryoGang") + "</small></div></div>" +
        (ME.admin ? '<a class="go2" href="/admin/">Ouvrir le back-office</a>' : "") +
        '<button class="out" id="me-out">Se déconnecter</button><button class="no" id="me-x">Fermer</button>';
      document.getElementById("me-out").onclick = function () { fetch("/api/auth/me", { method: "DELETE" }).then(function () { location.reload(); }); };
    } else {
      meInner.innerHTML = meDefault;
      gis(function () {
        google.accounts.id.initialize({ client_id: GCID, callback: function (r) {
          fetch("/api/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential: r.credential }) })
            .then(function (x) { return x.json(); }).then(function (j) {
              if (j.ok) { ME = { user: j.user, admin: j.admin }; drawAvatar(); meBox.hidden = true; location.reload(); }
              else document.getElementById("me-err").textContent = j.error || "Connexion impossible.";
            }).catch(function () { document.getElementById("me-err").textContent = "Connexion impossible."; });
        } });
        google.accounts.id.renderButton(document.getElementById("me-g"), { theme: "filled_black", shape: "pill", size: "large", text: "continue_with", locale: "fr", width: 280 });
      });
    }
    bindClose(); meBox.hidden = false;
  }
  document.getElementById("sh-me").addEventListener("click", openMe);
  // « Rejoindre » (Will, 18/10/2026) : un clic et on part directement sur l'écran Google de choix du compte,
  // puis retour sur la même page, connecté. Déjà connecté : la fenêtre du compte s'ouvre comme avant.
  window.FG_LOGIN = function () {
    if (ME && ME.user) return openMe();
    location.href = "/api/auth/google?r=" + encodeURIComponent(location.pathname + location.search + location.hash);
  };
  if (/[?&]connexion=echec/.test(location.search)) { setTimeout(function () { openMe(); }, 400); history.replaceState(null, "", location.pathname + location.search.replace(/[?&]connexion=echec/, "").replace(/^&/, "?") + location.hash); }
  if (/^https?:$/.test(location.protocol)) fetch("/api/auth/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) { ME = j; drawAvatar();
    // Don enregistré : fenêtre « Merci, t'es Premium » une seule fois (Will, 25/10/2026). ?apercu=merci pour la voir.
    var mc = j.merci || (j.user && /[?&]apercu=merci/.test(location.search) ? { pseudo: j.user.name, montant: 25, ans: 1, debut: "2026-12-01", fin: "2027-11-30", badge: "Donateur — Bancho", slug: j.user.slug, apercu: 1 } : null);
    if (mc) { var sc = document.createElement("script"); sc.src = "/site/merci.js?v=3"; sc.onload = function () { window.FG_MERCI(mc); }; document.head.appendChild(sc); }
  } }).catch(function () {});
  bindClose();
  meBox.addEventListener("click", function (e) { if (e.target === meBox) meBox.hidden = true; });
  // Retour en haut (mobile) : même flèche que la chronologie CROWS x WORST, qui a déjà la sienne.
  function toTop() {
    if (document.getElementById("toTop")) return;
    var st = document.createElement("style");
    st.textContent = ".sh-up{position:fixed;z-index:35;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:48px;height:48px;border-radius:50%;border:0;background:#38383B;color:#F5F5F7;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);padding:0}" +
      ".sh-up[hidden]{display:none}@media (min-width:980px){.sh-up{display:none!important}}";
    document.head.appendChild(st);
    var b = document.createElement("button");
    b.className = "sh-up"; b.hidden = true; b.setAttribute("aria-label", "Revenir en haut");
    b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(b);
    addEventListener("scroll", function () { b.hidden = scrollY < 700; }, { passive: true });
    b.addEventListener("click", function () { scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", toTop); else toTop();

  /* ---------- Cookies (RGPD) : seuls les cookies nécessaires sont posés d'office ----------
     Contenus tiers (vidéos YouTube) : seulement après accord. Le choix est gardé 6 mois et modifiable via « Gérer les cookies ». */
  var CK = "fg_consent";
  function choix() { try { var v = JSON.parse(localStorage.getItem(CK) || "null"); return v && v.t > Date.now() - 182 * 864e5 ? v.v : null; } catch (e) { return null; } }
  function garder(v) { try { localStorage.setItem(CK, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {} }
  window.FG_CONSENT = { video: function () { return choix() === "oui"; }, accepter: function () { garder("oui"); }, ouvrir: function () { banniere(true); } };
  function ckCss() {
    var st = document.getElementById("ck-css");
    if (!st) { st = document.createElement("style"); st.id = "ck-css"; st.textContent =
      ".ck{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:95;max-width:560px;margin:0 auto;background:#1B1B1D;border:1px solid #2C2C2F;border-radius:18px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.55);font-family:Inter,system-ui,sans-serif;color:#F5F5F7}" +
      ".ck b{display:block;font-size:15px;margin-bottom:4px}.ck p{margin:0 0 12px;font-size:13.5px;line-height:1.5;color:#CFCFD4}.ck p a{color:#4C9BFF}" +
      ".ck-b{display:flex;gap:8px}.ck-b button{flex:1;height:42px;border:0;border-radius:21px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}" +
      ".ck-b .y{background:#305887;color:#fff}.ck-b .n{background:#38383B;color:#F5F5F7}" +
      // Le pied de page n'apparaît qu'une fois la page remplie (sinon il « saute » vers le bas : mauvais pour le score Google).
      ".sh-legal{visibility:hidden}.sh-legal.on{visibility:visible}#app,body>main{min-height:calc(100vh - 140px)}" +
      ".sh-legal{max-width:1080px;margin:28px auto 0;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 90px);display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;border-top:1px solid #2C2C2F;font:500 12.5px Inter,system-ui,sans-serif}" +
      ".sh-legal .sh-cr{flex-basis:100%;margin:6px 0 0;text-align:center;color:#98989D}.sh-legal .sh-cr a{color:#CFCFD4;font-weight:600}" +
      ".sh-legal a,.sh-legal button{color:#98989D;text-decoration:none;background:none;border:0;padding:0;font:inherit;cursor:pointer}.sh-legal a:hover,.sh-legal button:hover{color:#F5F5F7}";
      document.head.appendChild(st); }
  }
  function banniere(force) {
    ckCss();
    if (!force && choix()) return;
    var old = document.getElementById("ck"); if (old) old.remove();
    var d = document.createElement("div"); d.className = "ck"; d.id = "ck"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Cookies");
    d.innerHTML = "<b>Cookies</b><p>FuryoGang n'utilise aucun cookie publicitaire ni de mesure d'audience. Les bandes-annonces sont hébergées par YouTube ou Dailymotion, qui déposent leurs propres cookies : on ne les charge qu'avec ton accord. <a href=\"/cookies/\">En savoir plus</a></p>" +
      '<div class="ck-b"><button class="n" data-ck="non">Refuser</button><button class="y" data-ck="oui">Accepter</button></div>';
    d.addEventListener("click", function (e) { var b = e.target.closest("[data-ck]"); if (b) { garder(b.dataset.ck); d.remove(); } });
    document.body.appendChild(d);
  }
  function pied() {
    ckCss();
    if (document.getElementById("sh-legal")) return;
    var f = document.createElement("nav"); f.className = "sh-legal"; f.id = "sh-legal"; f.setAttribute("aria-label", "Informations légales");
    // Trois liens seulement (Will, 17/10/2026) : les quatre pages légales se parcourent ensuite par onglets, et « Gérer les cookies » est dans la page Cookies.
    f.innerHTML = '<a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a><a href="/cookies/">Cookies</a>' +
      '<p class="sh-cr">Créé par Sowon, boss du <a href="https://x.com/FuryoSquad" target="_blank" rel="noopener">FuryoSquad</a> et du <a href="https://x.com/FuryoGang" target="_blank" rel="noopener">FuryoGang</a></p>';
    document.body.appendChild(f);
    var montrer = function () { setTimeout(function () { f.classList.add("on"); }, 1200); };
    if (document.readyState === "complete") montrer(); else addEventListener("load", montrer);
    window.FG_CK = function () { banniere(true); };
    onglets();
  }
  // Pages légales : onglets en haut de page pour passer de l'une à l'autre, et bouton « Gérer les cookies » sur la page Cookies.
  function onglets() {
    var P = [["/mentions-legales/", "Mentions légales"], ["/conditions/", "Conditions"], ["/confidentialite/", "Confidentialité"], ["/cookies/", "Cookies"]];
    var here = location.pathname.replace(/index\.html$/, ""), m = document.querySelector("body>main");
    if (!m || !P.some(function (x) { return x[0] === here; }) || document.getElementById("lg-tabs")) return;
    var st = document.createElement("style");
    st.textContent = ".lg-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 22px;padding:4px;background:#000;border-radius:14px}.lg-tabs::-webkit-scrollbar{display:none}" +
      ".lg-tabs a{flex:1 0 auto;text-align:center;padding:9px clamp(5px,1.6vw,12px);border-radius:10px;color:#98989D!important;text-decoration:none;font:700 clamp(12.5px,3.4vw,15px)/1 Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap}" +
      ".lg-tabs a[aria-current=page]{background:#38383B;color:#F5F5F7!important}" +
      ".lg-ck{display:inline-flex;align-items:center;height:44px;padding:0 20px;margin:8px 0 4px;border:0;border-radius:22px;background:#305887;color:#fff;font:700 14.5px Inter,system-ui,sans-serif;cursor:pointer}";
    document.head.appendChild(st);
    var n = document.createElement("nav"); n.className = "lg-tabs"; n.id = "lg-tabs"; n.setAttribute("aria-label", "Pages légales");
    n.innerHTML = P.map(function (x) { return '<a href="' + x[0] + '"' + (x[0] === here ? ' aria-current="page"' : "") + ">" + x[1] + "</a>"; }).join("");
    m.insertBefore(n, m.firstChild);
    var cur = n.querySelector("[aria-current]"); if (cur && n.scrollWidth > n.clientWidth) n.scrollLeft = cur.offsetLeft - 8;
    if (here === "/cookies/") { var h = m.querySelector("h1"), b = document.createElement("button"); b.type = "button"; b.className = "lg-ck"; b.textContent = "Gérer les cookies"; b.onclick = function () { banniere(true); }; (h && h.nextElementSibling ? h.nextElementSibling : h).insertAdjacentElement("afterend", b); }
  }
  function legal() { pied(); banniere(false); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", legal); else legal();
  // Navigation sans rechargement (accueil mobile) : « Actualités » s'allume seulement sur les pages d'actualités, pas sur l'accueil.
  window.FG_NAV = function () {
    var l = document.querySelector('.sh-nav a[href="/?vue=actus"]'); if (!l) return;
    var on = /^\/actus/.test(location.pathname) || /[?&](vue=actus|cat=)/.test(location.search);
    if (on) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current");
  };
})();
