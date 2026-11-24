// furyogang.com/rejoindre (Will, 24/11/2026) : lien direct pour s'inscrire, à mettre en story, en bio ou dans un post.
// Sert la page « Rejoins le gang » (rejoindre/index.html). Son bouton mène à l'écran Google, puis au profil.
// Dans le navigateur d'une appli (Instagram…), la page elle-même explique comment l'ouvrir dans le vrai navigateur.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.pathname === "/rejoindre") return Response.redirect(url.origin + "/rejoindre/" + url.search, 302);
  return next();
}
