// /actus/<titre>-<id> : sert la page news (actus/index.html), qui retrouve la news grâce au bout d'id à la fin de l'adresse.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/actus/"; u.search = "";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
