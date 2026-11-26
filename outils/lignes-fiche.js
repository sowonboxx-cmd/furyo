// Vérifie qu'un « Résumé fiche » tient sur l'image : 4 lignes au plus en post, 5 en story (Will, 26/11/2026).
// Usage : node outils/lignes-fiche.js "texte…"   (ou plusieurs textes à la suite pour comparer)
// Mesure avec FG_FICHE.lignes (site/fiche-card.js), donc avec les vraies polices et largeurs de la fiche.
const { chromium } = require("playwright"), http = require("http"), fs = require("fs"), path = require("path");
const RACINE = path.join(__dirname, ".."), textes = process.argv.slice(2);
if (!textes.length) { console.log('Usage : node outils/lignes-fiche.js "texte"'); process.exit(1); }
const srv = http.createServer((q, r) => {
  const f = path.join(RACINE, decodeURIComponent(q.url.split("?")[0]));
  if (q.url === "/") { r.setHeader("content-type", "text/html"); return r.end('<!doctype html><meta charset="utf-8"><body><script src="/site/fiche-card.js"></script>'); }
  fs.readFile(f, (e, b) => { if (e) { r.statusCode = 404; return r.end(); } r.end(b); });
}).listen(0, async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto("http://127.0.0.1:" + srv.address().port + "/");
  await p.waitForFunction(() => window.FG_FICHE);
  await p.evaluate(() => Promise.all(['500 40px "FGInter"', '500 37px "FGInter"', '500 42px "FGInter"'].map(f => document.fonts.load(f))));
  for (const t of textes) {
    const r = await p.evaluate(t => FG_FICHE.lignes(t), t);
    const v = (n, max, f) => `${n}/${max} lignes ${n <= max ? "OK" : "TROP LONG"}${n <= max ? ` (dernière ligne remplie à ${Math.round(f * 100)} %)` : ""}`;
    console.log(`${t.length} car. · Post ${v(r.post.n, 4, r.post.fill)} · Story ${v(r.story.n, 5, r.story.fill)} · ${r.ok ? "NICKEL" : "À RACCOURCIR"}\n  ${t.slice(0, 70)}…`);
  }
  await b.close(); srv.close();
});
