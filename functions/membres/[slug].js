// /membres/<identifiant> : la page d'un membre (membres-fiche/index.html), qui lit l'identifiant dans l'adresse.
// La liste des membres, elle, est sur /communaute/ (Will, 07/10/2026).
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  u.pathname = "/membres-fiche/";
  return env.ASSETS.fetch(new Request(u.toString(), request));
}
