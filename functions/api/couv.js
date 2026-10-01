// GET /api/couv?u=<url de la couverture officielle>
// Sert la couverture d'un tome depuis le site de l'éditeur, gardée en cache chez Cloudflare (7 jours) :
// l'image reste affichée même si l'éditeur bloque l'affichage depuis un autre site.
// Seuls les sites officiels sont relayés ; une autre adresse est simplement redirigée.
const OFFICIELS = ["dlpdomain.com","editions-delcourt.fr","kazemanga.fr","crunchyroll-editions.fr","mangetsu-manga.fr","anime-store.fr","meian-editions.fr","akitashoten.co.jp","bookwalker.jp","kodansha.co.jp","shogakukan.co.jp","shueisha.co.jp","hakusensha.co.jp","kadokawa.co.jp","nihonbungeisha.co.jp","shonengahosha.co.jp","ebookjapan.yahoo.co.jp","cmoa.jp","bigcomicbros.net","championcross.jp","yanmaga.jp","kana.fr","pika.fr","ki-oon.com","glenat.com","meian.fr","akata.fr","kurokawa.fr","panini.fr","mangetsu.fr","nabanco.com","vega-dupuis.com","delcourt.fr","doki-doki.fr","soleil.fr","notion.so","notion-static.com","amazonaws.com"];
export async function onRequestGet({ request, waitUntil }) {
  const self = new URL(request.url);
  let t; try { t = new URL(self.searchParams.get("u")); } catch (e) { return new Response("u invalide", { status: 400 }); }
  if (t.protocol !== "https:" && t.protocol !== "http:") return new Response("u invalide", { status: 400 });
  if (!OFFICIELS.some(h => t.hostname === h || t.hostname.endsWith("." + h))) return Response.redirect(t.href, 302);
  const cache = caches.default, key = new Request(self.origin + "/api/couv?u=" + encodeURIComponent(t.href));
  const hit = await cache.match(key); if (hit) return hit;
  const r = await fetch(t.href, { headers: { "user-agent": "Mozilla/5.0 (FuryoGang)", referer: t.origin + "/" } });
  const ct = r.headers.get("content-type") || "";
  if (!r.ok || !ct.startsWith("image/")) return Response.redirect(t.href, 302);
  const out = new Response(r.body, { headers: { "content-type": ct, "cache-control": "public, max-age=604800" } });
  waitUntil(cache.put(key, out.clone()));
  return out;
}
