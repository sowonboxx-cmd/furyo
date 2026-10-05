// /auteurs/<slug> : sert la page des mangakas (auteurs/index.html), qui affiche la fiche du mangaka d'après l'adresse.
// (La règle _redirects ne suffisait pas : la page d'accueil s'affichait à la place.)
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/auteurs/"; u.search = "";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
