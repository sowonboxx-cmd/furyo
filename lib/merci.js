// Remerciement des donateurs (Will, 25/10/2026) : e-mail envoyé avec Brevo + fenêtre « Merci, t'es Premium » sur le site.
// Les deux partent tout seuls quand Will enregistre un don dans QG > Premium & dons.
//   envoyerMerci(env, d)  → { ok, id?, error? }   (secret Cloudflare BREVO_API_KEY ; MAIL_FROM optionnel, défaut contact@furyogang.com)
//   poserFenetre(env, id, d) → la fenêtre s'ouvrira à la prochaine visite du membre (clé KV « merci:<id> »)
//   d = { email, pseudo, num, slug, montant, total, ans, debut, fin, badge }
const SITE = "https://furyogang.com";
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const dateLongue = iso => { if (!iso) return ""; const [y, m, j] = iso.split("-").map(Number); return (j === 1 ? "1er" : j) + " " + MOIS[m - 1] + " " + y; };
const eur = n => (Math.round(n * 100) / 100).toLocaleString("fr-FR") + " €";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const cleMerci = id => "merci:" + String(id || "").replace(/-/g, "");

export function sujetMerci(d) { return d.ans ? `Merci ${d.pseudo}, t'es Premium` : `Merci pour ton soutien, ${d.pseudo}`; }

export function htmlMerci(d) {
  const P = !!d.ans, F = "font-family:Inter,Helvetica,Arial,sans-serif;";
  const ligne = (a, b) => `<tr><td style="${F}padding:13px 0;border-bottom:1px dashed #2c2c2f;font-size:15px;color:#9a9aa0">${a}</td><td align="right" style="${F}padding:13px 0;border-bottom:1px dashed #2c2c2f;font-size:15px;color:#ffffff;font-weight:700">${b}</td></tr>`;
  const avantages = ["Lu, Envie, Panier", "Statistiques de collection", "Classements", "Tirage au sort du mois", "Collections des autres membres", "Tout ce qui arrive ensuite"];
  const av = [0, 2, 4].map(i => `<tr><td width="50%" style="${F}padding:4px 0;font-size:14.5px;color:#D8D8DC"><span style="color:#3DB0FF;font-weight:800">✓</span>&nbsp; ${avantages[i]}</td><td width="50%" style="${F}padding:4px 0;font-size:14.5px;color:#D8D8DC"><span style="color:#3DB0FF;font-weight:800">✓</span>&nbsp; ${avantages[i + 1]}</td></tr>`).join("");
  const pill = (t, c, bg) => `<span style="${F}display:inline-block;padding:6px 12px;border-radius:15px;background:${bg};color:${c};font-size:13px;font-weight:700;letter-spacing:.04em;margin:0 6px 6px 0">${t}</span>`;
  const intro = P
    ? `Ton don de <b style="color:#fff">${eur(d.montant)}</b> est bien arrivé. C'est enregistré : <b style="color:#fff">ton Premium est activé pour ${d.ans} an${d.ans > 1 ? "s" : ""}</b>, et ton badge t'attend sur ton profil.`
    : `Ton don de <b style="color:#fff">${eur(d.montant)}</b> est bien arrivé. C'est enregistré, et ton badge de soutien t'attend sur ton profil.`;
  const decembre = P && d.debut === "2026-12-01" ? `<p style="${F}margin:14px 0 0;font-size:14px;line-height:1.5;color:#9a9aa0;text-align:center">D'ici le 1er décembre, tout le monde est Premium : ton année démarre après, rien n'est perdu.</p>` : "";
  const profil = SITE + (d.slug ? "/membres/" + encodeURIComponent(d.slug) + "/" : "/ma-collection/");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(sujetMerci(d))}</title></head>
<body style="margin:0;padding:0;background:#e9e9ec">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9e9ec"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#0b0b0c;border-radius:6px;overflow:hidden">
<tr><td align="center" style="padding:24px 0 20px;border-bottom:1px solid #222"><img src="${SITE}/img/social/logo-blanc.png" alt="FuryoGang" height="40" style="height:40px;display:block;border:0"></td></tr>
<tr><td><img src="${SITE}/img/mail/${P ? "merci-premium" : "merci-soutien"}.jpg" width="600" alt="${P ? "Merci. T'es Premium." : "Merci pour ton soutien."}" style="width:100%;height:auto;display:block;border:0"></td></tr>
<tr><td style="padding:30px 36px 8px">
<p style="${F}margin:0 0 16px;font-size:16px;line-height:1.6;color:#D8D8DC">Yo ${esc(d.pseudo)},</p>
<p style="${F}margin:0 0 18px;font-size:16px;line-height:1.6;color:#D8D8DC">${intro}</p>
<div style="margin:0 0 18px">${P ? pill("✔ PREMIUM", "#3DB0FF", "#0f2a3d") : ""}${d.badge ? pill("♛ " + esc(d.badge), "#F2B33D", "#3a2e12") : ""}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151517;border-radius:14px"><tr><td style="padding:4px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${ligne("Ton soutien", eur(d.montant))}${P ? ligne("Premium", "du " + dateLongue(d.debut) + " au " + dateLongue(d.fin)) : ""}${d.num ? ligne("Membre", "n°" + d.num).replace(/border-bottom:1px dashed #2c2c2f;/g, "") : ""}</table>
</td></tr></table>
${P ? `<p style="font-family:'Arial Narrow',Arial,sans-serif;margin:26px 0 10px;font-size:21px;font-weight:700;letter-spacing:.02em;color:#fff;text-transform:uppercase">Ce que tu débloques</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${av}</table>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0"><tr><td align="center" style="background:#F2B33D;border-radius:27px"><a href="${profil}" style="${F}display:block;padding:16px 0;color:#000;font-size:16px;font-weight:700;text-decoration:none">Voir mon profil</a></td></tr></table>
${decembre}
<p style="${F}margin:22px 0 4px;font-size:14px;line-height:1.5;color:#9a9aa0;text-align:center">FuryoGang, c'est un passionné, pas une boîte. Merci de faire vivre le gang.</p>
<p style="font-family:'Arial Narrow',Arial,sans-serif;margin:0 0 28px;font-size:18px;font-weight:700;letter-spacing:.04em;color:#fff;text-align:center;text-transform:uppercase">FuryoGang</p>
</td></tr>
<tr><td align="center" style="${F}background:#000;padding:20px 36px;font-size:12px;line-height:1.6;color:#6c6c72">Tu reçois cet e-mail parce que tu as soutenu FuryoGang.<br><a href="${SITE}" style="color:#6c6c72">furyogang.com</a> · @FuryoGang</td></tr>
</table></td></tr></table></body></html>`;
}

export function texteMerci(d) {
  return [`Yo ${d.pseudo},`, "", `Ton don de ${eur(d.montant)} est bien arrivé.`,
    d.ans ? `Ton Premium est activé pour ${d.ans} an${d.ans > 1 ? "s" : ""} : du ${dateLongue(d.debut)} au ${dateLongue(d.fin)}.` : "Ton badge de soutien t'attend sur ton profil.",
    d.badge ? `Badge : ${d.badge}` : "", "", "FuryoGang, c'est un passionné, pas une boîte. Merci de faire vivre le gang.", "FuryoGang · " + SITE].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
}

// Envoi par Brevo (Will l'utilise déjà, 25/10/2026) : secret Cloudflare BREVO_API_KEY ; expéditeur vérifié sur Brevo.
export async function envoyerMerci(env, d) {
  if (!env.BREVO_API_KEY) return { ok: false, error: "BREVO_API_KEY manquant" };
  if (!d.email) return { ok: false, error: "pas d'e-mail" };
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "FuryoGang", email: env.MAIL_FROM || "contact@furyogang.com" }, to: [{ email: d.email, name: d.pseudo || undefined }],
        subject: sujetMerci(d), htmlContent: htmlMerci(d), textContent: texteMerci(d), tags: ["merci-premium"] }),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok ? { ok: true, id: j.messageId } : { ok: false, error: (j.message || "Brevo " + r.status).slice(0, 160) };
  } catch (e) { return { ok: false, error: "réseau" }; }
}

// Fenêtre sur le site : gardée 6 mois, effacée quand le membre la ferme.
export async function poserFenetre(env, id, d) {
  const { email, ...rest } = d;
  await env.STATS.put(cleMerci(id), JSON.stringify(rest), { expirationTtl: 180 * 86400 });
}

// La clé Brevo expire après 90 jours sans utilisation : une lecture sans envoi, au plus une fois par semaine,
// quand Will ouvre QG > Premium & dons (Will, 25/10/2026).
export async function garderCleBrevo(env) {
  if (!env.BREVO_API_KEY) return;
  const k = "brevo:ping", der = Number(await env.STATS.get(k)) || 0;
  if (Date.now() - der < 7 * 864e5) return;
  const r = await fetch("https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=1", { headers: { "api-key": env.BREVO_API_KEY, accept: "application/json" } }).catch(() => null);
  if (r && r.ok) await env.STATS.put(k, String(Date.now()));
}
