// /ma-collection/<série> : sert la page de la bibliothèque (ma-collection/index.html), qui lit la série dans l'adresse.
// Référencement par série (Will, 09/10/2026) : titre « <Série> : ma collection manga », description avec les éditions.
import { seoCollection, SITE } from "../../lib/seo.js";

export async function onRequestGet({ request, env, params }) {
  const u = new URL(request.url);
  u.pathname = "/ma-collection/";
  const page = await env.ASSETS.fetch(new Request(u.toString(), request));
  try {
    const slug = String(params.id || "").toLowerCase();
    const cat = await fetch(new URL("/api/biblio", request.url).toString(), { headers: { cookie: "" } }).then(r => r.ok ? r.json() : {});
    const item = (cat.items || []).find(x => x.slug === slug);
    if (!item) return page;
    const d = await fetch(new URL("/api/biblio?id=" + item.id, request.url).toString(), { headers: { cookie: "" } }).then(r => r.ok ? r.json() : {});
    if (!d.serie) return page;
    const url = `${SITE}/ma-collection/${item.slug}`;
    const seo = { ...seoCollection(d.serie, d.editions, item, url), url };
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify(seo)));
    return out;
  } catch (e) { return page; }
}
