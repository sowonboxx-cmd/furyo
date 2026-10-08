// /sitemap.xml : la liste des pages à référencer, pour Google (déclarée dans robots.txt et la Search Console).
// Pages fixes, toutes les fiches séries en ligne, les news, les pages À l'écran et toutes les pages mangakas.
import { SITE } from "../lib/seo.js";
import { slugify } from "../lib/notion.js";
export async function onRequestGet({ request }) {
  const get = p => fetch(new URL(p, request.url).toString()).then(r => r.ok ? r.json() : {}).catch(() => ({}));
  const [series, auteurs, news, films, biblio] = await Promise.all([get("/api/series"), get("/api/auteurs"), get("/api/news"), get("/api/films"), get("/api/biblio")]);
  const fixes = [["/", "daily", "1.0"], ["/series/", "daily", "0.9"], ["/calendrier/", "daily", "0.8"], ["/crows-x-worst/", "weekly", "0.7"], ["/auteurs/", "weekly", "0.6"], ["/films/", "weekly", "0.7"], ["/communaute/", "daily", "0.5"], ["/avancement/", "weekly", "0.4"]];
  const urls = [
    ...fixes.map(([p, f, pr]) => ({ loc: SITE + p, f, pr })),
    ...(series.items || []).filter(s => !s.apercu).map(s => ({ loc: `${SITE}/series/${s.slug}`, f: "weekly", pr: "0.8" })),
    // News (même adresse que sur le site : titre-8 derniers caractères de l'id) et pages À l'écran (Will, 07/10/2026).
    ...(news.items || []).map(n => ({ loc: `${SITE}/actus/${slugify(n.fr || n.titre).slice(0, 60)}-${String(n.id).slice(-8)}`, f: "monthly", pr: "0.7", d: n.date })),
    // Ma collection, une page par série de la base (Will, 09/10/2026).
    ...(biblio.items || []).filter(s => s.slug).map(s => ({ loc: `${SITE}/ma-collection/${s.slug}`, f: "weekly", pr: "0.5" })),
    ...(films.items || []).map(f => ({ loc: `${SITE}/films/${f.slug}`, f: "monthly", pr: "0.6" })),
    ...(auteurs.authors || []).map(a => ({ loc: `${SITE}/auteurs/${a.slug}`, f: "monthly", pr: "0.5" })),
  ];
  const x = s => s.replace(/&/g, "&amp;");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${x(u.loc)}</loc>${u.d ? `<lastmod>${u.d}</lastmod>` : ""}<changefreq>${u.f}</changefreq><priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
