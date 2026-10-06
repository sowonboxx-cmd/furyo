// /ma-collection/<série> : sert la page de la bibliothèque (ma-collection/index.html), qui lit la série dans l'adresse.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/ma-collection/";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
