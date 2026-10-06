// Migration ponctuelle (06/10/2026) : remplit la colonne « Statut » des séries. Supprimée juste après usage.
// Séries déjà visibles sur le site (une édition) ou cochées « Publier » → « En ligne · public » ; les autres → « À valider ».
import { rel, check, queryAll } from "../../lib/notion.js";
const SERIES = { dataSource: "3ebb5e1a-634f-8051-9faf-000be2dabb16", database: "3ebb5e1a634f80f998e3c0fe5b75b6ea" };
export async function onRequestGet({ env, request }) {
  if (new URL(request.url).searchParams.get("k") !== "0a3f00a76ef467caefaffb1101ac88db") return new Response("non", { status: 403 });
  const rows = await queryAll(env.NOTION_TOKEN, { ...SERIES, body: { filter: { property: "Statut", select: { is_empty: true } } } });
  const lot = rows.slice(0, 35);
  let pub = 0, val = 0, err = 0;
  for (const r of lot) {
    const p = r.properties || {};
    const name = rel(p["Éditions"]).length > 0 || check(p["Publier"]) ? "En ligne · public" : "À valider";
    const x = await fetch("https://api.notion.com/v1/pages/" + r.id, { method: "PATCH", headers: { Authorization: "Bearer " + env.NOTION_TOKEN, "Notion-Version": "2022-06-28", "Content-Type": "application/json" }, body: JSON.stringify({ properties: { Statut: { select: { name } } } }) });
    if (!x.ok) err++; else if (name === "À valider") val++; else pub++;
  }
  return new Response(JSON.stringify({ restant: rows.length - lot.length, pub, val, err }), { headers: { "content-type": "application/json" } });
}
