// /films/<nom> : sert la page films (films/index.html), qui lit le nom dans l'adresse et affiche la fiche.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/films/";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
