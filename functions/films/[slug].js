// /films/<nom> : sert la page films (films/index.html), qui lit le nom dans l'adresse et affiche la fiche.
// Pour Google et les aperçus de liens : titre, résumé et affiche du film ou de la série (Will, 07/10/2026).
import { ogFiche, seoFilm, SITE } from "../../lib/seo.js";
// Carte de partage de la fiche si elle existe (Will, 17/10/2026), sinon l'image d'origine.
async function carte(env, request, path) {
  try { const r = await env.ASSETS.fetch(new Request(new URL(path, request.url).toString(), { method: "HEAD" })); return r.ok && (r.headers.get("content-type") || "").includes("image") ? SITE + path : ""; } catch (e) { return ""; }
}

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
    const og = await carte(env, request, ogFiche("film", f.slug));
    if (og) { seo.image = og; seo.carte = "summary_large_image"; }
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify(seo)));
    return out;
  } catch (e) { return page; }
}
