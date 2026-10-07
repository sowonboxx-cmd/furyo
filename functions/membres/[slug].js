// Ancienne adresse /membres/<identifiant> : la rubrique s'appelle désormais Communauté (Will, 07/10/2026).
export function onRequestGet({ params }) {
  return new Response(null, { status: 301, headers: { location: "/communaute/" + encodeURIComponent(params.slug || "") } });
}
