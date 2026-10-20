// /actus/<titre>-<id> : sert la page news (actus/index.html), qui retrouve la news grâce au bout d'id à la fin de l'adresse.
// Pour Google et les aperçus de liens (X, Discord, WhatsApp…) : titre, description et image de la news (Will, 07/10/2026).
import { ogFiche, seoNews, SITE } from "../../lib/seo.js";
// Carte de partage de la fiche si elle existe (Will, 17/10/2026), sinon l'image d'origine.
async function carte(env, request, path) {
  // Carte livrée avec le site (fichier statique).
  try { const r = await env.ASSETS.fetch(new Request(new URL(path, request.url).toString(), { method: "HEAD" })); if (r.ok && (r.headers.get("content-type") || "").includes("image")) return SITE + path; } catch (e) {}
  // Carte générée par le back-office et stockée dans R2 (clé = chemin sans « /img/ »).
  try { if (env.COUV) { const o = await env.COUV.head(path.replace(/^\/img\//, "")); if (o) return SITE + path; } } catch (e) {}
  return "";
}

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
    const og = await carte(env, request, ogFiche("actu", String(n.id).slice(-8)));
    if (og) { seo.image = og; seo.carte = "summary_large_image"; }
    const out = new Response(page.body, page);
    out.headers.set("x-seo", encodeURIComponent(JSON.stringify(seo)));
    return out;
  } catch (e) { return page; }
}
