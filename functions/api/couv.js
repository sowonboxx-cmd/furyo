// GET /api/couv?u=<url de la couverture officielle>
// Sert la couverture d'un tome depuis le site de l'éditeur, gardée en cache chez Cloudflare (7 jours) :
// l'image reste affichée même si l'éditeur bloque l'affichage depuis un autre site.
// Seuls les sites officiels sont relayés ; une autre adresse est simplement redirigée.
const OFFICIELS = ["dlpdomain.com","media.hachette.fr","editions-delcourt.fr","kazemanga.fr","crunchyroll-editions.fr","mangetsu-manga.fr","anime-store.fr","meian-editions.fr","akitashoten.co.jp","bookwalker.jp","kodansha.co.jp","shogakukan.co.jp","shueisha.co.jp","hakusensha.co.jp","kadokawa.co.jp","nihonbungeisha.co.jp","shonengahosha.co.jp","ebookjapan.yahoo.co.jp","cmoa.jp","bigcomicbros.net","championcross.jp","yanmaga.jp","kana.fr","pika.fr","ki-oon.com","glenat.com","meian.fr","akata.fr","kurokawa.fr","panini.fr","mangetsu.fr","nabanco.com","vega-dupuis.com","delcourt.fr","doki-doki.fr","soleil.fr","notion.so","notion-static.com","amazonaws.com"];
// Images « NOW PRINTING » / « 画像準備中 » connues (empreinte SHA-256) : ce ne sont pas des couvertures.
const PLACEHOLDERS = new Set([
  "517f458418f9ecf80b1c12449843a6584db25f398a70f00080d972fcdc9dc82a", // BookWalker NOW PRINTING
  "a71f701008ab37a643e1808c62ef2f16d89c5018de36ddc9e267150ba856b4ce", // Akita Shoten NOW PRINTING
  "573b17de6e70a52373f5b5d2a7ee2b6633fc970d8796f5940f2c6ac0b8924cd5", // Shogakukan Now Printing
]);
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

export async function onRequestGet({ request, waitUntil }) {
  const self = new URL(request.url);
  // ?check=1 : vérifie l'image sans la servir (utilisé par la tâche des couvertures).
  if (self.searchParams.has("check")) {
    let t; try { t = new URL(self.searchParams.get("u")); } catch (e) { return Response.json({ ok: false, error: "u invalide" }, { status: 400 }); }
    const r = await fetch(t.href, { headers: { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" } });
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || !ct.startsWith("image/")) return Response.json({ ok: false, status: r.status, type: ct, verdict: "pas une image" });
    const buf = await r.arrayBuffer(), sha = hex(await crypto.subtle.digest("SHA-256", buf));
    const ph = PLACEHOLDERS.has(sha) || buf.byteLength < 3000 || !ct.startsWith("image/");
    return Response.json({ ok: !ph, placeholder: ph, bytes: buf.byteLength, type: ct, sha256: sha, verdict: ph ? "image provisoire (NOW PRINTING ou vide) : refuser" : "image valide" });
  }
  let t; try { t = new URL(self.searchParams.get("u")); } catch (e) { return new Response("u invalide", { status: 400 }); }
  if (t.protocol !== "https:" && t.protocol !== "http:") return new Response("u invalide", { status: 400 });
  if (!OFFICIELS.some(h => t.hostname === h || t.hostname.endsWith("." + h))) return Response.redirect(t.href, 302);
  const cache = caches.default, key = new Request(self.origin + "/api/couv?u=" + encodeURIComponent(t.href));
  const hit = await cache.match(key); if (hit) return hit;
  const r = await fetch(t.href, { headers: { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" } });
  const ct = r.headers.get("content-type") || "";
  if (!r.ok || !ct.startsWith("image/")) return Response.redirect(t.href, 302);
  const buf = await r.arrayBuffer();
  if (PLACEHOLDERS.has(hex(await crypto.subtle.digest("SHA-256", buf)))) return new Response("Couverture provisoire", { status: 404 });
  const out = new Response(buf, { headers: { "content-type": ct, "cache-control": "public, max-age=604800" } });
  waitUntil(cache.put(key, out.clone()));
  return out;
}
