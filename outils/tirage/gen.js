// node gen.js <dossier de sortie> <fond.jpg> <couv1,couv2,…> "<Série>" "+30" "millions" — rend banniere-lien.jpg (image du lien, avec texte) et banniere-ordinateur.jpg (21:8), banniere-mobile.jpg (16:9) et banniere.jpg (1200×630).
const { chromium } = require("playwright"), path = require("path");
(async () => {
  const [out, bg, cv, nom = "", n1 = "", n2 = ""] = process.argv.slice(2), b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const p = await b.newPage({ viewport: { width: 2200, height: 900 } });
  const abs = s => "file://" + path.resolve(s);
  await p.goto("file://" + __dirname + "/gen.html?bg=" + encodeURIComponent(abs(bg)) + "&cv=" + cv.split(",").map(s => encodeURIComponent(/^https?:/.test(s) ? s : abs(s))).join(",") + "&nom=" + encodeURIComponent(nom) + "&n1=" + encodeURIComponent(n1) + "&n2=" + encodeURIComponent(n2));
  await p.waitForLoadState("networkidle"); await p.waitForTimeout(500);
  for (const [id, f] of [["d", "banniere-ordinateur.jpg"], ["m", "banniere-mobile.jpg"], ["o", "banniere.jpg"], ["l", "banniere-lien.jpg"]]) await (await p.$("#" + id)).screenshot({ path: path.join(out, f), type: "jpeg", quality: 88 });
  await b.close();
})();
