// Adresse officielle : furyogang.com. Les pages ouvertes sur furyo.pages.dev ou www.furyogang.com y sont redirigées
// (redirection permanente). Les images (/couvertures/…) et l'API restent servies partout : les liens déjà enregistrés
// dans Notion continuent de marcher. Les déploiements de test (xxx.furyo.pages.dev) ne sont pas touchés.
// Ensuite, chaque page HTML reçoit ses balises de référencement (voir lib/seo.js).
import { SITE, balises, infosPage, jsonSite } from "../lib/seo.js";

const OFFICIEL = "furyogang.com";
const A_REDIRIGER = new Set(["furyo.pages.dev", "www.furyogang.com"]);
const PRIVE = /^\/(admin|studio|profil|membres-fiche)(\/|$)/;

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (A_REDIRIGER.has(url.hostname) && (request.method === "GET" || request.method === "HEAD")
      && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/couvertures/")) {
    url.hostname = OFFICIEL; url.protocol = "https:"; url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  const res = await next();
  if (request.method !== "GET" || url.pathname.startsWith("/api/") || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  try { return seo(res, url); } catch (e) { return res; }
}

function seo(res, url) {
  // Une fiche série a déjà préparé ses infos (titre, résumé, couverture) : on les reprend.
  let fiche = null;
  const h = res.headers.get("x-seo");
  if (h) { try { fiche = JSON.parse(decodeURIComponent(h)); } catch (e) {} }
  const prive = PRIVE.test(url.pathname);
  const info = fiche ? { t: fiche.titre, d: fiche.desc } : infosPage(url.pathname);
  const canon = fiche && fiche.url ? fiche.url : SITE + url.pathname;
  let titre = info ? info.t : "", desc = info ? info.d : "";
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
          image: fiche && fiche.image, type: fiche && fiche.type, carte: fiche && fiche.carte,
          jsonld: fiche ? fiche.jsonld : url.pathname === "/" ? jsonSite() : null,
        }), { html: true });
      });
    } })
    .on("#app", { element(el) { if (fiche && fiche.html) el.setInnerContent(fiche.html, { html: true }); } })
    .transform(out);
}
