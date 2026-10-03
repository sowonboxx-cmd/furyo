// /membres/<identifiant> : sert la page profil public (membres-fiche/index.html), qui lit l'identifiant dans l'adresse.
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/membres-fiche/";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
