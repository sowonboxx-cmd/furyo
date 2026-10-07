// /communaute/<identifiant> : adresse d'un jour, la page d'un membre est sur /membres/<identifiant> (Will, 07/10/2026).
export function onRequestGet({ params }) {
  return new Response(null, { status: 301, headers: { location: "/membres/" + encodeURIComponent(params.slug || "") } });
}
