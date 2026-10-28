// Adresse officielle : furyogang.com. Les pages ouvertes sur furyo.pages.dev ou www.furyogang.com y sont redirigées
// (redirection permanente). Les images (/couvertures/…) et l'API restent servies partout : les liens déjà enregistrés
// dans Notion continuent de marcher. Les déploiements de test (xxx.furyo.pages.dev) ne sont pas touchés.
// Ensuite, chaque page HTML reçoit ses balises de référencement (voir lib/seo.js).
import { SITE, balises, infosPage, jsonSite, texteFixe, OG_ACTUS } from "../lib/seo.js";
import { isAdmin } from "../lib/admin.js";

// Notion limite à ~3 requêtes/seconde : sur un 429 (rate_limited), on attend « retry_after » puis on réessaie,
// jusqu'à 4 fois, pour toutes les requêtes du site vers api.notion.com (Will, 28/10/2026 : « Notion a refusé … 429 » dans le studio).
if (!globalThis.__fgNotionRetry) {
  globalThis.__fgNotionRetry = true;
  const base = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init) => {
    const u = typeof input === "string" ? input : input instanceof URL ? input.href : (input && input.url) || "";
    if (!u.startsWith("https://api.notion.com/")) return base(input, init);
    const req = typeof input === "string" || input instanceof URL ? null : input;
    for (let essai = 0; ; essai++) {
      const r = await base(req ? req.clone() : input, init);
      if (r.status !== 429 || essai >= 4) return r;
      const s = parseFloat(r.headers.get("retry-after") || "") || 1;
      await new Promise(ok => setTimeout(ok, Math.min(Math.max(s, 0.4), 3) * 1000 * (1 + essai * 0.5)));
    }
  };
}

const OFFICIEL = "furyogang.com";
const A_REDIRIGER = new Set(["furyo.pages.dev", "www.furyogang.com"]);
const PRIVE = /^\/(admin|studio|profil|membres-fiche|hq)(\/|$)/;

export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  if (A_REDIRIGER.has(url.hostname) && (request.method === "GET" || request.method === "HEAD")
      && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/couvertures/")) {
    url.hostname = OFFICIEL; url.protocol = "https:"; url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  // /hq/ : le QG de Will (ressources, to-do, projets). /ressources/ : documents de travail de Will (scans de magazines, murs d'affiches) pour trouver des idées de contenu.
  // Réservés aux admins connectés, jamais indexés (Will, 15/10/2026).
  // /studio/ aussi (18/10/2026) : les outils de visuels ne sont visibles que par les admins.
  if (url.pathname.startsWith("/ressources/") || url.pathname === "/hq" || url.pathname.startsWith("/hq/") || url.pathname === "/studio" || url.pathname.startsWith("/studio/")) {
    if (!(await isAdmin(request, env).catch(() => false))) return new Response("Introuvable", { status: 404, headers: { "x-robots-tag": "noindex" } });
    const r = await next(); const o = new Response(r.body, r); o.headers.set("x-robots-tag", "noindex, nofollow"); o.headers.set("cache-control", "private, max-age=3600"); return o;
  }
  const res = await next();
  if (request.method !== "GET" || url.pathname.startsWith("/api/") || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  try { return await seo(res, url); } catch (e) { return res; }
}

async function seo(res, url) {
  // Une fiche série a déjà préparé ses infos (titre, résumé, couverture) : on les reprend.
  let fiche = null;
  const h = res.headers.get("x-seo");
  if (h) { try { fiche = JSON.parse(decodeURIComponent(h)); } catch (e) {} }
  const prive = PRIVE.test(url.pathname);
  const info = fiche ? { t: fiche.titre, d: fiche.desc } : infosPage(url.pathname);
  const canon = fiche && fiche.url ? fiche.url : SITE + url.pathname;
  let titre = info ? info.t : "", desc = info ? info.d : "";
  const fixe = !fiche && !prive ? await texteFixe(url.pathname, url.origin).catch(() => null) : null;
  const out = new Response(res.body, res);
  out.headers.delete("x-seo");
  return new HTMLRewriter()
    .on("title", {
      element(el) { if (info) el.setInnerContent(info.t); },
      text(t) { if (!info) titre += t.text; },
    })
    .on('meta[name="description"]', { element(el) { if (info) el.setAttribute("content", info.d); else desc = el.getAttribute("content") || ""; } })
    .on('meta[name="robots"]', { element(el) { if (prive) el.remove(); } })
    .on("head", { element(el) {
      el.onEndTag(end => {
        end.before(balises({
          titre: titre.trim() || "FuryoGang", desc, url: canon, prive,
          image: (fiche && fiche.image) || (url.pathname === "/" && url.searchParams.get("vue") === "actus" ? SITE + OG_ACTUS : "") || (info && info.i ? SITE + info.i : ""), type: fiche && fiche.type, carte: fiche && fiche.carte,
          jsonld: fiche ? fiche.jsonld : url.pathname === "/" ? jsonSite() : (info && info.j) || (fixe && fixe.jsonld) || null,
        }), { html: true });
      });
    } })
    .on("#app, #na", { element(el) { if (fiche && fiche.html) el.setInnerContent(fiche.html, { html: true }); } })
    .on("body", { element(el) { if (fixe && fixe.html) el.append(fixe.html, { html: true }); } })
    .transform(out);
}
