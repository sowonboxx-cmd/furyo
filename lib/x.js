// Publication sur X (Twitter) par l'API officielle, au compte FuryoGang (Will, 25/11/2026).
// Paiement à l'usage : un post sans lien coûte 0,015 $, avec un lien 0,20 $ (docs.x.com, novembre 2026).
// Secrets Cloudflare (jamais dans le code) : X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET (OAuth 1.0a, app en « Read and write »).
// Images : jusqu'à 20 par post depuis le 12/11/2026 ; si X refuse, repli en fil de 4 images par post (compte sans Premium).
const API = "https://api.x.com/2";
const SITE = "https://furyogang.com";
const abs = u => (/^\//.test(u || "") ? SITE + u : u || "");

export const xPret = env => !!(env.X_API_KEY && env.X_API_SECRET && env.X_ACCESS_TOKEN && env.X_ACCESS_SECRET);

// Encodage OAuth (RFC 3986).
const pe = s => encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
async function hmac(cle, msg) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(cle), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg)));
  let b = ""; for (const x of sig) b += String.fromCharCode(x); return btoa(b);
}
// En-tête Authorization OAuth 1.0a. Corps JSON : il n'entre pas dans la signature, seuls les paramètres d'URL y entrent.
async function oauth(env, methode, url) {
  const u = new URL(url), p = {
    oauth_consumer_key: env.X_API_KEY, oauth_nonce: crypto.randomUUID().replace(/-/g, ""), oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)), oauth_token: env.X_ACCESS_TOKEN, oauth_version: "1.0" };
  const tous = { ...p }; u.searchParams.forEach((v, k) => { tous[k] = v; });
  const base = Object.keys(tous).sort().map(k => pe(k) + "=" + pe(tous[k])).join("&");
  const chaine = [methode.toUpperCase(), pe(u.origin + u.pathname), pe(base)].join("&");
  p.oauth_signature = await hmac(pe(env.X_API_SECRET) + "&" + pe(env.X_ACCESS_SECRET), chaine);
  return "OAuth " + Object.keys(p).sort().map(k => pe(k) + '="' + pe(p[k]) + '"').join(", ");
}
async function appel(env, methode, chemin, corps) {
  const url = API + chemin;
  const r = await fetch(url, { method: methode, headers: { Authorization: await oauth(env, methode, url), ...(corps ? { "content-type": "application/json" } : {}) }, body: corps ? JSON.stringify(corps) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || (d.errors && !d.data)) {
    const m = (d.errors && d.errors[0] && (d.errors[0].message || d.errors[0].detail)) || d.detail || d.title || ("X a répondu " + r.status);
    const e = new Error(m); e.status = r.status; throw e;
  }
  return d;
}

// Envoie une image (adresse publique, JPEG ou PNG) et renvoie son identifiant média.
export async function xImage(env, url) {
  const r = await fetch(abs(url)); if (!r.ok) throw new Error("image introuvable : " + url);
  const buf = new Uint8Array(await r.arrayBuffer()); let b = "";
  for (let i = 0; i < buf.length; i += 0x8000) b += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  const d = await appel(env, "POST", "/media/upload", { media: btoa(b), media_category: "tweet_image" });
  return d.data.id;
}
async function tweet(env, texte, medias, reponseA) {
  const corps = { text: texte || "" };
  if (medias && medias.length) corps.media = { media_ids: medias };
  if (reponseA) corps.reply = { in_reply_to_tweet_id: reponseA };
  return (await appel(env, "POST", "/tweets", corps)).data.id;
}

// Post X : texte + images. Toutes les images dans un seul post si X l'accepte, sinon fil de 4 images par post.
export async function xPost(env, texte, images) {
  if (!xPret(env)) throw new Error("clés X absentes dans Cloudflare");
  images = (images || []).map(abs).filter(Boolean).slice(0, 20);
  const ids = []; for (const u of images) ids.push(await xImage(env, u));
  const lien = id => "https://x.com/i/web/status/" + id;
  if (ids.length <= 4) { const id = await tweet(env, texte, ids); return { id, lien: lien(id), fil: 1 }; }
  try { const id = await tweet(env, texte, ids); return { id, lien: lien(id), fil: 1 }; }
  catch (e) {
    // Refus des 20 images (compte sans Premium, ou limite revenue à 4) : fil.
    let premier = null, prec = null, n = 0;
    for (let i = 0; i < ids.length; i += 4) { prec = await tweet(env, i ? "" : texte, ids.slice(i, i + 4), prec); premier = premier || prec; n++; }
    return { id: premier, lien: lien(premier), fil: n, repli: String(e.message || e) };
  }
}
