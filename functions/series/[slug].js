// /series/<nom> : sert la page fiche (series/index.html), qui lit le nom dans l'adresse.
// Pour Google et les aperçus de liens, on prépare aussi le titre, la description, la couverture du tome 1
// et le résumé de la série (repris par le middleware, voir lib/seo.js).
import { seoSerie, SITE } from "../../lib/seo.js";

export async function onRequestGet({ request, env, params }) {
  const u = new URL(request.url);
  u.pathname = "/series/";
  const page = await env.ASSETS.fetch(new Request(u.toString(), request));
  try {
    const slug = String(params.slug || "").toLowerCase();
    const api = new URL("/api/serie?s=" + encodeURIComponent(slug), request.url);
    const r = await fetch(api.toString(), { headers: { cookie: "" } });
    if (!r.ok) return page;
    const { serie, editions } = await r.json();
    if (!serie) return page;
    const url = `${SITE}/series/${serie.slug || slug}`;
    const seo = { ...seoSerie(serie, editions, url), url };
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify(seo)));
    return out;
  } catch (e) { return page; }
}
