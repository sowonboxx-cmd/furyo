// Rendu du modèle « Annonce » (Playwright). Le site doit tourner en local :
//   cd <racine du site> && python3 -m http.server 8766
//   node modeles/annonce/render.js "<adresse ?visuel=…>" <dossier de sortie>
const { chromium } = require("playwright");
(async () => {
  const qs = process.argv[2] || "", out = process.argv[3] || ".";
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1300, height: 2200 } });
  await p.goto("http://localhost:8766/modeles/annonce/" + qs);
  await p.waitForFunction(() => +document.body.dataset.ok >= 1, null, { timeout: 20000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await (await p.$("#r")).screenshot({ path: out + "/reseaux.jpg", type: "jpeg", quality: 90 });
  await (await p.$("#l")).screenshot({ path: out + "/lien.jpg", type: "jpeg", quality: 90 });
  // Version story : même visuel sans le logo du haut (il est déjà en grand dans le bas de la story).
  await p.evaluate(() => { const l = document.querySelector("#r .logo"); if (l) l.style.visibility = "hidden"; });
  await (await p.$("#r")).screenshot({ path: out + "/story.jpg", type: "jpeg", quality: 90 });
  await b.close();
})();
