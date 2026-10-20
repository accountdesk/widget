// Prüft, dass das Widget keine Klassen, IDs, CSS-Variablen oder Keyframes mit
// dem Präfix `ad-`/`ad_` trägt. Werbeblocker (EasyList u. a.) verstecken solche
// Elemente (`##.ad-container`, `##.ad-card` …) — das Widget wäre dann unsichtbar.
// Präfix ist `acd-`. Aufruf: npm run check:adblock (läuft auch vor npm publish).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// ad- als Bezeichner, auch als Selektor (.ad-, #ad-) und CSS-Variable (--ad-); nicht in Woertern
// (load-), Pfaden (/ad-) oder Hostnamen (www.ad-)
const AD_DASH = /(?<![\w/.\-])ad-[\w$]|(?<![\w])[.#]ad-[\w$]|(?<![\w-])--ad-[\w$]/;
const AD_UNDERSCORE = /(?:class(?:Name)?\s*=\s*["'`][^"'`]*\bad_|\bid\s*=\s*["'`]ad_|[.#]ad_[\w-]*\s*[{,:])/;

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|js|css|html)$/.test(name)) files.push(path);
  }
};
walk("src");
// dieses Skript selbst zitiert die EasyList-Regeln und liegt nicht in src/
for (const extra of ["index.html", "demo.html"]) {
  try {
    statSync(extra);
    files.push(extra);
  } catch {}
}

const findings = [];
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (AD_DASH.test(line) || AD_UNDERSCORE.test(line)) findings.push(`${file}:${i + 1}: ${line.trim().slice(0, 160)}`);
    });
}
console.log(`Geprüft: ${files.length} Dateien`);
if (findings.length > 0) {
  console.error(`${findings.length} Fund(e) — Werbeblocker verstecken ad-*/ad_*-Namen, Präfix acd- verwenden:`);
  for (const f of findings) console.error("  " + f);
  process.exit(1);
}
console.log("Keine ad-*/ad_*-Namen gefunden.");
