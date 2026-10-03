// /sitemap.xml : la liste des pages à référencer, pour Google (déclarée dans robots.txt et la Search Console).
// Pages fixes, toutes les fiches séries en ligne et toutes les pages mangakas.
import { SITE } from "../lib/seo.js";
export async function onRequestGet({ request }) {
  const get = p => fetch(new URL(p, request.url).toString()).then(r => r.ok ? r.json() : {}).catch(() => ({}));
  const [series, auteurs] = await Promise.all([get("/api/series"), get("/api/auteurs")]);
  const fixes = [["/", "daily", "1.0"], ["/series/", "daily", "0.9"], ["/calendrier/", "daily", "0.8"], ["/crows-x-worst/", "weekly", "0.7"], ["/auteurs/", "weekly", "0.6"], ["/avancement/", "weekly", "0.4"], ["/membres/", "weekly", "0.3"]];
  const urls = [
    ...fixes.map(([p, f, pr]) => ({ loc: SITE + p, f, pr })),
    ...(series.items || []).filter(s => !s.apercu).map(s => ({ loc: `${SITE}/series/${s.slug}`, f: "weekly", pr: "0.8" })),
    ...(auteurs.authors || []).map(a => ({ loc: `${SITE}/auteurs/${a.slug}`, f: "monthly", pr: "0.5" })),
  ];
  const x = s => s.replace(/&/g, "&amp;");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${x(u.loc)}</loc><changefreq>${u.f}</changefreq><priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
