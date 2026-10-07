// /membres/<identifiant>/collection : toute la collection d'un membre (même page que sa fiche, vue « collection »).
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/membres-fiche/";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
