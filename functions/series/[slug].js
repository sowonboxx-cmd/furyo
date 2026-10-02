// /series/<nom> : sert toujours la page fiche (series/index.html), qui lit le nom dans l'adresse.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/series/";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
