// furyogang.com/rejoindre (Will, 24/11/2026) : lien direct pour s'inscrire, à mettre en story, en bio ou dans un post.
// Un clic → écran Google « choisir un compte » → retour sur le profil, connecté (pseudo à choisir).
// Google refuse la connexion dans les navigateurs intégrés aux applis (Instagram, Facebook, TikTok, X…) :
// dans ce cas, on affiche une petite page qui explique comment ouvrir le lien dans le vrai navigateur.
const DANS_APPLI = /Instagram|FBAN|FBAV|FB_IAB|Messenger|TikTok|musical_ly|Bytedance|Twitter|Snapchat|Line\/|Pinterest|LinkedInApp/i;

export async function onRequest({ request }) {
  const url = new URL(request.url), ua = request.headers.get("user-agent") || "";
  const retour = /^\/(?!\/)\S*$/.test(url.searchParams.get("r") || "") ? url.searchParams.get("r") : "/profil/";
  const google = "/api/auth/google?r=" + encodeURIComponent(retour);
  if (!DANS_APPLI.test(ua)) return Response.redirect(url.origin + google, 302);
  const android = /Android/i.test(ua);
  const intent = "intent://" + url.host + "/rejoindre" + url.search + "#Intent;scheme=https;package=com.android.chrome;end";
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Rejoindre le gang · FuryoGang</title>
<style>@font-face{font-family:A;src:url(/fonts/Antonio.ttf)}@font-face{font-family:I;src:url(/fonts/Inter.ttf);font-weight:100 900}
body{margin:0;min-height:100vh;background:#000;color:#f3f3f5;font:500 16px/1.5 I,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
.c{max-width:420px;text-align:center}img{height:46px;margin-bottom:22px}h1{font:700 40px/1.05 A;text-transform:uppercase;margin:0 0 12px}
p{color:#b8b8c0;margin:0 0 18px}.b{display:block;width:100%;padding:16px;border-radius:14px;background:#BC002D;color:#fff;text-decoration:none;font:800 16px I;border:0;margin-bottom:12px}
.g{background:#24242a}.s{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;background:#24242a;font-weight:900;margin:0 2px}</style></head>
<body><div class="c"><img src="/img/social/logo-blanc.png" alt="FuryoGang"><h1>Rejoins le gang</h1>
<p>Google bloque la connexion dans l'appli. Ouvre ce lien dans ton navigateur pour t'inscrire en un clic.</p>
${android ? `<a class="b" href="${intent}">Ouvrir dans Chrome</a>` : `<p>Touche <span class="s">···</span> en haut à droite, puis <b>« Ouvrir dans le navigateur »</b>.</p>`}
<button class="b g" onclick="navigator.clipboard&&navigator.clipboard.writeText('https://furyogang.com/rejoindre').then(()=>{this.textContent='Lien copié'})">Copier le lien</button>
</div></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
