// /actus/<titre>-<id> : sert la page news (actus/index.html), qui retrouve la news grâce au bout d'id à la fin de l'adresse.
// Pour Google et les aperçus de liens (X, Discord, WhatsApp…) : titre, description et image de la news (Will, 07/10/2026).
import { seoNews, SITE } from "../../lib/seo.js";
export async function onRequestGet({ request, env, params }) {
  const u = new URL(request.url);
  u.pathname = "/actus/"; u.search = "";
  const page = await env.ASSETS.fetch(new Request(u.toString(), request));
  try {
    const slug = String(params.slug || ""), bout = slug.slice(-8);
    const r = await fetch(new URL("/api/news", request.url).toString(), { headers: { cookie: "" } });
    if (!r.ok) return page;
    const n = ((await r.json()).items || []).find(x => String(x.id).endsWith(bout));
    if (!n) return page;
    const seo = seoNews(n, `${SITE}/actus/${slug}`);
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify(seo)));
    return out;
  } catch (e) { return page; }
}
