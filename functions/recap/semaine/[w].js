// /recap/semaine/<AAAA-SS> : sert la page du récap de la semaine (recap/semaine/index.html), qui lit la semaine dans l'adresse.
// (Comme /auteurs/<slug> : la règle _redirects seule affichait la page d'accueil.) Titre et partage : lib/seo.js via le middleware.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  if (!u.pathname.endsWith("/")) return Response.redirect(u.origin + u.pathname + "/" + u.search, 301);
  u.pathname = "/recap/semaine/"; u.search = "";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
