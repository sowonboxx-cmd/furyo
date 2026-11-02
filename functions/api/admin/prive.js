// Stockage privé de Will (R2, préfixe « prive/ ») : chapitres de manga traduits (/lecture) et carnet de flashcards (/flashcard).
// Jamais public : réservé à l'admin connecté. Claude peut aussi y déposer les chapitres traduits avec une clé d'import,
// dont seule l'empreinte SHA-256 est ici (la clé elle-même n'est nulle part dans le dépôt). Une nouvelle clé = une nouvelle empreinte.
// Will, 02/11/2026 : « c'est accès qu'à l'administrateur ».
import { isAdmin, json } from "../../../lib/admin.js";

const EMPREINTE = "a7ad332696732ec9078aa4d51daa755b2baed05687f95577925e7601ad1aaae1";
const CHEMIN = /^prive\/(lecture|flashcards)\/[A-Za-z0-9._\/-]{1,200}$/;
const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", json: "application/json; charset=utf-8", mp4: "video/mp4" };
const MAX = 12 * 1024 * 1024;

async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function autorise(request, env) {
  const k = request.headers.get("x-fg-import");
  if (k && (await sha(k)) === EMPREINTE) return true;
  return isAdmin(request, env).catch(() => false);
}

export async function onRequest({ request, env }) {
  if (!(await autorise(request, env))) return json({ error: "introuvable" }, 404, { "x-robots-tag": "noindex" });
  if (!env.COUV) return json({ error: "stockage indisponible" }, 503);
  const url = new URL(request.url);
  const f = url.searchParams.get("f") || "";
  if (request.method === "GET" && url.searchParams.has("liste")) {
    if (!/^prive\/(lecture|flashcards)\//.test(f)) return json({ error: "chemin" }, 400);
    const out = []; let cursor;
    do { const l = await env.COUV.list({ prefix: f, cursor, limit: 1000 }); l.objects.forEach(o => out.push({ k: o.key, s: o.size })); cursor = l.truncated ? l.cursor : null; } while (cursor && out.length < 20000);
    return json({ n: out.length, octets: out.reduce((a, o) => a + o.s, 0), fichiers: out });
  }
  if (!CHEMIN.test(f) || f.includes("..") || f.includes("//")) return json({ error: "chemin" }, 400);
  const ext = (f.split(".").pop() || "").toLowerCase();
  if (!TYPES[ext]) return json({ error: "type" }, 400);

  if (request.method === "GET" || request.method === "HEAD") {
    const o = await env.COUV.get(f);
    if (!o) return json({ error: "introuvable" }, 404);
    return new Response(request.method === "HEAD" ? null : o.body, { headers: {
      "content-type": TYPES[ext], "etag": o.httpEtag, "x-robots-tag": "noindex, nofollow",
      "cache-control": ext === "json" ? "no-store" : "private, max-age=604800" } });
  }
  if (request.method === "PUT") {
    const buf = await request.arrayBuffer();
    if (!buf.byteLength || buf.byteLength > MAX) return json({ error: "taille" }, 413);
    if (ext === "json") { try { JSON.parse(new TextDecoder().decode(buf)); } catch (e) { return json({ error: "json invalide" }, 400); } }
    await env.COUV.put(f, buf, { httpMetadata: { contentType: TYPES[ext] } });
    return json({ ok: true, f, octets: buf.byteLength });
  }
  if (request.method === "DELETE") {
    await env.COUV.delete(f);
    return json({ ok: true });
  }
  return json({ error: "méthode" }, 405);
}
