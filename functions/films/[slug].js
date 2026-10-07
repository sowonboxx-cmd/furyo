// /films/<nom> : sert la page films (films/index.html), qui lit le nom dans l'adresse et affiche la fiche.
// Pour Google et les aperçus de liens : titre, résumé et affiche du film ou de la série (Will, 07/10/2026).
import { seoFilm, SITE } from "../../lib/seo.js";
export async function onRequestGet({ request, env, params }) {
  const u = new URL(request.url);
  u.pathname = "/films/";
  const page = await env.ASSETS.fetch(new Request(u.toString(), request));
  try {
    const slug = String(params.slug || "").toLowerCase();
    const r = await fetch(new URL("/api/films", request.url).toString(), { headers: { cookie: "" } });
    if (!r.ok) return page;
    const f = ((await r.json()).items || []).find(x => x.slug === slug);
    if (!f) return page;
    const seo = seoFilm(f, `${SITE}/films/${f.slug}`);
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify(seo)));
    return out;
  } catch (e) { return page; }
}
