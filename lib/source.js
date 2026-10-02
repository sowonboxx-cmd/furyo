// Nom lisible d'une source officielle à partir de son lien (affiché « Source : Kana ↗ »).
const NOMS = {
  "kana.fr": "Kana", "pika.fr": "Pika", "ki-oon.com": "Ki-oon", "akata.fr": "Akata", "glenat.com": "Glénat", "editions-delcourt.fr": "Delcourt",
  "meian-editions.fr": "Meian", "mangetsu.fr": "Mangetsu", "kurokawa.fr": "Kurokawa", "panini.fr": "Panini", "kazemanga.fr": "Kaze",
  "kodansha.co.jp": "Kodansha", "shogakukan.co.jp": "Shōgakukan", "akitashoten.co.jp": "Akita Shoten", "kadokawa.co.jp": "Kadokawa",
  "shueisha.co.jp": "Shūeisha", "championcross.jp": "Champion Cross", "yanmaga.jp": "Yanmaga", "x.com": "X", "twitter.com": "X",
};
export function sourceName(url) {
  try { const h = new URL(url).hostname.replace(/^www\./, ""); return NOMS[h] || NOMS[h.split(".").slice(-2).join(".")] || h; } catch (e) { return ""; }
}
