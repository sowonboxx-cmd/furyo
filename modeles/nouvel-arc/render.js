// Rendu du modèle « Nouvel arc » (Playwright). Le site doit tourner en local :
//   cd <racine du site> && python3 -m http.server 8766
//   node modeles/nouvel-arc/render.js "<adresse ?visuel=…>" <dossier de sortie>
const { chromium } = require("playwright");
(async () => {
  const qs = process.argv[2] || "", out = process.argv[3] || ".";
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1300, height: 2200 } });
  await p.goto("http://localhost:8766/modeles/nouvel-arc/" + qs);
  await p.waitForFunction(() => +document.body.dataset.ok >= 1, null, { timeout: 20000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await (await p.$("#r")).screenshot({ path: out + "/reseaux.jpg", type: "jpeg", quality: 90 });
  await (await p.$("#l")).screenshot({ path: out + "/lien.jpg", type: "jpeg", quality: 90 });
  await b.close();
})();
