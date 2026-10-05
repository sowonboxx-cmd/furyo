// Crédits des images (Will, 05/10/2026) : générés automatiquement, jamais saisis à la main.
// Japon : au format des éditeurs japonais, « ©南勝久／講談社 ». France : « © Katsuhisa Minami / Kodansha · Pika pour l'édition française ».
// Les noms japonais viennent de la base Auteurs (« Nom japonais ») ; sans nom japonais, on garde le nom en lettres latines.
const KANJI = {
  "kodansha": "講談社", "shogakukan": "小学館", "shueisha": "集英社", "akita shoten": "秋田書店", "shonen gahosha": "少年画報社",
  "nihon bungeisha": "日本文芸社", "coamix": "コアミックス", "kadokawa": "KADOKAWA", "kadokawa shoten": "KADOKAWA", "media factory": "KADOKAWA", "ascii media works": "KADOKAWA", "square enix": "スクウェア・エニックス",
  "futabasha": "双葉社", "tokuma shoten": "徳間書店", "hakusensha": "白泉社", "shinchosha": "新潮社", "takeshobo": "竹書房",
  "bunkasha": "ぶんか社", "leed": "リイド社", "leed sha": "リイド社", "gentosha": "幻冬舎", "enterbrain": "エンターブレイン",
  "mag garden": "マッグガーデン", "ichijinsha": "一迅社", "houbunsha": "芳文社", "jitsugyo no nihonsha": "実業之日本社",
  "seirindo": "青林堂", "kobunsha": "光文社", "fusosha": "扶桑社", "bungeishunju": "文藝春秋", "shonen gaho": "少年画報社",
};
const plain = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const noms = v => String(v || "").replace(/\s*\([^)]*\)/g, "").split(/\s*,\s*|\s+&\s+|\s+et\s+|\s*\/\s*/).map(x => x.trim()).filter(Boolean);
// Éditeur actuel : le dernier d'une liste « J'ai lu, Pika » ; sans le label entre parenthèses.
const dernier = v => { const l = noms(v); return l[l.length - 1] || ""; };
const premier = v => noms(v)[0] || "";

// s : { scen, dess, pubJP, pubFR } ; auteurs : [{ name, jp }]
export function credits(s, auteurs = []) {
  const romaji = [...new Set([...noms(s.scen), ...noms(s.dess)])];
  const jpDe = n => (auteurs.find(a => plain(a.name) === plain(n)) || {}).jp || "";
  const list = romaji.length ? romaji : auteurs.map(a => a.name).filter(Boolean);
  if (!list.length) return { jp: "", fr: "" };
  const pubJP = premier(s.pubJP), pubFR = dernier(s.pubFR);
  const kanjiPub = KANJI[plain(pubJP)] || pubJP;
  const jpNoms = list.map(n => jpDe(n) || n);
  const jp = "©" + jpNoms.join("・") + (kanjiPub ? "／" + kanjiPub : "");
  const fr = "© " + list.join(", ") + (pubJP ? " / " + pubJP : "") + (pubFR ? " · " + pubFR + " pour l'édition française" : "");
  return { jp, fr };
}
// Image d'une news : crédit français pour les catégories françaises (licence, couverture, sortie FR), japonais sinon.
export const estFR = cats => (cats || []).some(c => /-fr$/.test(c.k || c));
