// GET /api/couv?u=<url de la couverture officielle>
// Sert la couverture d'un tome. Depuis le 07/10/2026, chaque couverture est copiée une fois dans le stockage R2
// de FuryoGang (bucket « furyogang-couvertures », liaison COUV), puis servie depuis chez nous : le site ne dépend plus
// des serveurs des éditeurs (lenteur, image supprimée, blocage). Clé R2 = SHA-256 de l'adresse d'origine.
// Les vignettes (&w=) sont fabriquées à partir de la copie R2 (adresse /couv/<clé>) et gardées en cache.
// Seuls les sites officiels sont relayés ; une autre adresse est simplement redirigée.
const OFFICIELS = ["dlpdomain.com","media.hachette.fr","editions-delcourt.fr","kazemanga.fr","crunchyroll-editions.fr","mangetsu-manga.fr","anime-store.fr","meian-editions.fr","akitashoten.co.jp","bookwalker.jp","kodansha.co.jp","shogakukan.co.jp","shueisha.co.jp","hakusensha.co.jp","kadokawa.co.jp","nihonbungeisha.co.jp","shonengahosha.co.jp","ebookjapan.yahoo.co.jp","cmoa.jp","bigcomicbros.net","championcross.jp","shonenjumpplus.com","comicvine.gamespot.com","yanmaga.jp","kana.fr","pika.fr","ki-oon.com","glenat.com","meian.fr","akata.fr","kurokawa.fr","panini.fr","mangetsu.fr","nabanco.com","vega-dupuis.com","delcourt.fr","doki-doki.fr","soleil.fr","notion.so","notion-static.com","amazonaws.com","furyo.pages.dev","furyogang.com",
  // Sites et CDN officiels d'éditeurs repérés lors du référencement de la bibliothèque (07/10/2026)
  "leed.co.jp","kdkw.jp","shinchosha.co.jp","square-enix.com","coamix.co.jp","casterman.com","lisez.com","noeve-grafx.com","humano.com","lezardnoir.com","shogakukan-comic.jp","twovirgins.jp",
  "dosbg3xlm0x1t.cloudfront.net" /* Shūeisha */, "d2l33iqw5tfm1m.cloudfront.net" /* Futabasha */];
// CDN partagés : seulement le dossier de l'éditeur.
const DOSSIERS = ["cdn.shopify.com/s/files/1/0770/8049/4404/", "cdn.shopify.com/s/files/1/0810/4011/3877/", "cdn.prod.website-files.com/6a60c0369879c07f7143335d/"];
// Images « NOW PRINTING » / « 画像準備中 » connues (empreinte SHA-256) : ce ne sont pas des couvertures.
const PLACEHOLDERS = new Set([
  "517f458418f9ecf80b1c12449843a6584db25f398a70f00080d972fcdc9dc82a", // BookWalker NOW PRINTING
  "a71f701008ab37a643e1808c62ef2f16d89c5018de36ddc9e267150ba856b4ce", // Akita Shoten NOW PRINTING
  "573b17de6e70a52373f5b5d2a7ee2b6633fc970d8796f5940f2c6ac0b8924cd5", // Shogakukan Now Printing
]);
// Type réel d'après les premiers octets (certains serveurs annoncent binary/octet-stream).
const sniff = buf => { const b = new Uint8Array(buf.slice(0, 12));
  if (b[0] === 0xFF && b[1] === 0xD8) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) return "image/webp";
  if (b[0] === 0x47 && b[1] === 0x49) return "image/gif";
  return ""; };
// Dimensions en pixels (JPEG, PNG, WebP, GIF) : pour repérer les couvertures en basse définition.
const dims = buf => { const b = new Uint8Array(buf), n = b.length;
  try {
    if (b[0] === 0x89 && b[1] === 0x50) return [(b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0];
    if (b[0] === 0x47 && b[1] === 0x49) return [b[6] | b[7] << 8, b[8] | b[9] << 8];
    if (b[0] === 0x52 && b[8] === 0x57) { const c = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (c === "VP8 ") return [(b[26] | b[27] << 8) & 0x3fff, (b[28] | b[29] << 8) & 0x3fff];
      if (c === "VP8L") return [1 + ((b[22] << 8 | b[21]) & 0x3fff), 1 + (((b[24] & 0xf) << 10) | b[23] << 2 | (b[22] >> 6))];
      if (c === "VP8X") return [1 + (b[24] | b[25] << 8 | b[26] << 16), 1 + (b[27] | b[28] << 8 | b[29] << 16)]; }
    if (b[0] === 0xFF && b[1] === 0xD8) { let i = 2;
      while (i < n - 9) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1], len = b[i + 2] << 8 | b[i + 3];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b[i + 7] << 8 | b[i + 8], b[i + 5] << 8 | b[i + 6]];
        i += 2 + len; } }
  } catch (e) {}
  return [0, 0]; };
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

export async function onRequestGet({ request, env, waitUntil }) {
  const self = new URL(request.url);
  // ?check=1 : vérifie l'image sans la servir (utilisé par la tâche des couvertures).
  if (self.searchParams.has("check")) {
    let t; try { t = new URL(self.searchParams.get("u")); } catch (e) { return Response.json({ ok: false, error: "u invalide" }, { status: 400 }); }
    const r = await fetch(t.href, { headers: { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" } });
    const buf = await r.arrayBuffer(), ct = sniff(buf);
    if (!r.ok || !ct) return Response.json({ ok: false, status: r.status, type: r.headers.get("content-type") || "", verdict: "pas une image" });
    const sha = hex(await crypto.subtle.digest("SHA-256", buf));
    const ph = PLACEHOLDERS.has(sha) || buf.byteLength < 3000;
    const [width, height] = dims(buf);
    return Response.json({ ok: !ph, placeholder: ph, bytes: buf.byteLength, type: ct, width, height, basseDef: width > 0 && width < 400, sha256: sha, verdict: ph ? "image provisoire (NOW PRINTING ou vide) : refuser" : "image valide" });
  }
  let t; try { t = new URL(self.searchParams.get("u")); } catch (e) { return new Response("u invalide", { status: 400 }); }
  if (t.protocol !== "https:" && t.protocol !== "http:") return new Response("u invalide", { status: 400 });
  if (!OFFICIELS.some(h => t.hostname === h || t.hostname.endsWith("." + h)) && !DOSSIERS.some(d => (t.hostname + t.pathname).startsWith(d))) return Response.redirect(t.href, 302);
  const cache = caches.default, key = new Request(self.origin + "/api/couv?u=" + encodeURIComponent(t.href));
  const rk = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t.href)));
  // &w=360 : version réduite (vignettes), en AVIF ou WebP si le navigateur les accepte (Images → Transformations).
  const w = Math.min(1200, Math.max(0, parseInt(self.searchParams.get("w") || "0", 10) || 0));
  const acc = request.headers.get("accept") || "", fmt = /image\/avif/.test(acc) ? "avif" : /image\/webp/.test(acc) ? "webp" : "";
  const key2 = w ? new Request(key.url + "&w=" + w + "&f=" + (fmt || "o")) : null;
  if (key2) { const h2 = await cache.match(key2); if (h2) return h2; }
  const IMMUABLE = "public, max-age=2592000";
  let orig = null, enR2 = false;
  if (env.COUV) {
    const o = await env.COUV.get(rk).catch(() => null);
    if (o) { orig = new Response(o.body, { headers: { "content-type": o.httpMetadata?.contentType || "image/jpeg", "cache-control": IMMUABLE, "x-couv": "r2" } }); enR2 = true; }
  }
  if (!orig) { orig = await cache.match(key);
    // Déjà en cache Cloudflare mais pas encore dans R2 : on l'y copie aussi.
    if (orig && env.COUV) { const c2 = orig.clone(); waitUntil((async () => { const buf = await c2.arrayBuffer(); const ct = sniff(buf); if (ct) await env.COUV.put(rk, buf, { httpMetadata: { contentType: ct }, customMetadata: { source: t.href.slice(0, 1000) } }); })().catch(() => {})); } }
  if (!orig) {
    const r = await fetch(t.href, { headers: { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" } });
    const buf = r.ok ? await r.arrayBuffer() : null, ct = buf ? sniff(buf) : "";
    if (!ct) return Response.redirect(t.href, 302);
    if (PLACEHOLDERS.has(hex(await crypto.subtle.digest("SHA-256", buf))) || buf.byteLength < 3000) return new Response("Couverture provisoire", { status: 404 });
    if (env.COUV) {
      try { await env.COUV.put(rk, buf, { httpMetadata: { contentType: ct }, customMetadata: { source: t.href.slice(0, 1000) } }); enR2 = true; } catch (e) {}
    }
    orig = new Response(buf, { headers: { "content-type": ct, "cache-control": enR2 ? IMMUABLE : "public, max-age=604800", "x-couv": enR2 ? "r2-nouveau" : "editeur" } });
    if (!enR2) waitUntil(cache.put(key, orig.clone()));
  }
  if (!w) return orig;
  // Source du redimensionnement : notre copie R2 si elle existe, sinon le site de l'éditeur.
  const sources = enR2 ? [[self.origin + "/couv/" + rk, {}], [t.href, { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" }]] : [[t.href, { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" }]];
  for (const [src, headers] of sources) {
    try {
      const rs = await fetch(src, { headers, cf: { image: { width: w, fit: "scale-down", quality: 78, ...(fmt ? { format: fmt } : {}) } } });
      const ct = rs.headers.get("content-type") || "";
      // « cf-resized » : Cloudflare a bien redimensionné (sinon l'option est ignorée et on garde l'original, sans le figer en cache).
      if (rs.ok && ct.startsWith("image/") && rs.headers.has("cf-resized")) {
        const out = new Response(rs.body, { headers: { "content-type": ct, "cache-control": "public, max-age=604800", vary: "Accept" } });
        waitUntil(cache.put(key2, out.clone()));
        return out;
      }
    } catch (e) {}
  }
  return orig;
}
