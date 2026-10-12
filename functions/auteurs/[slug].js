// /auteurs/<slug> : sert la page des mangakas (auteurs/index.html), qui affiche la fiche du mangaka d'après l'adresse.
// (La règle _redirects ne suffisait pas : la page d'accueil s'affichait à la place.)
// Pour Google et les aperçus de liens : titre, description, photo et données structurées propres au mangaka (Will, 12/10/2026).
import { seoAuteur, SITE } from "../../lib/seo.js";

export async function onRequestGet({ request, env, params }) {
  const u = new URL(request.url);
  u.pathname = "/auteurs/"; u.search = "";
  const page = await env.ASSETS.fetch(new Request(u.toString(), request));
  try {
    const slug = String(params.slug || "").toLowerCase();
    const r = await fetch(new URL("/api/auteurs", request.url).toString(), { headers: { cookie: "" } });
    if (!r.ok) return page;
    const a = ((await r.json()).authors || []).find(x => x.slug === slug);
    if (!a) return page;
    const url = `${SITE}/auteurs/${a.slug}`;
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify({ ...seoAuteur(a, url), url })));
    return out;
  } catch (e) { return page; }
}
