// Adresse officielle : furyogang.com. Les pages ouvertes sur furyo.pages.dev ou www.furyogang.com y sont redirigées
// (redirection permanente). Les images (/couvertures/…) et l'API restent servies partout : les liens déjà enregistrés
// dans Notion continuent de marcher. Les déploiements de test (xxx.furyo.pages.dev) ne sont pas touchés.
const OFFICIEL = "furyogang.com";
const A_REDIRIGER = new Set(["furyo.pages.dev", "www.furyogang.com"]);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (A_REDIRIGER.has(url.hostname) && (request.method === "GET" || request.method === "HEAD")
      && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/couvertures/")) {
    url.hostname = OFFICIEL; url.protocol = "https:"; url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
