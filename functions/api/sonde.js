// TEMPORAIRE : teste si une source de couvertures répond depuis Cloudflare. À supprimer après les tests.
const HOSTS = ["ndlsearch.ndl.go.jp","api.openbd.jp","cover.openbd.jp","bookwalker.jp","www.googleapis.com","www.pika.fr","pika.fr","www.kana.fr","kana.fr","www.akata.fr","akata.fr","books.rakuten.co.jp","www.fnac.com","www.decitre.fr","www.ki-oon.com","ki-oon.com","www.meian.fr","www.glenat.com","catalogue.bnf.fr","www.akitashoten.co.jp","www.shogakukan.co.jp","kc.kodansha.co.jp","www.hakusensha.co.jp","www.nihonbungeisha.co.jp","www.kadokawa.co.jp","www.shueisha.co.jp","www.manga-news.com"];
export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  let t; try { t = new URL(u.searchParams.get("u")); } catch (e) { return new Response("u invalide", { status: 400 }); }
  if (!HOSTS.includes(t.hostname)) return new Response("hôte non autorisé", { status: 403 });
  const r = await fetch(t, { headers: { "user-agent": "Mozilla/5.0 (FuryoGang couvertures)", "accept-language": "fr,ja;q=0.8" }, redirect: "follow" });
  const ct = r.headers.get("content-type") || "";
  const n = +(u.searchParams.get("n") || 6000), off = +(u.searchParams.get("o") || 0);
  let body = ct.startsWith("image/") ? `[image ${r.headers.get("content-length") || "?"} octets]` : (await r.text());
  const q = u.searchParams.get("q");
  if (q && !ct.startsWith("image/")) { const re = new RegExp(q, "gi"); body = [...body.matchAll(re)].slice(0, 40).map(m => m[0]).join("\n"); }
  else body = body.slice(off, off + n);
  return new Response(`STATUS ${r.status} ${ct}\nFINAL ${r.url}\n\n${body}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
