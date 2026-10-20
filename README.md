# accountdesk Support-Widget

Ein schlankes Kontaktformular-Widget für die eigene Website: Besucher:innen
füllen es aus, und in [accountdesk](https://www.accountdesk.de) entsteht daraus
automatisch ein Ticket — inklusive Anhängen und optionalem Bildschirmfoto.

- **Eine Datei, keine Abhängigkeiten** — Web Component (`<accountdesk-widget>`)
  als selbstständiges IIFE-Bundle (~9 kB gzipped), Styles isoliert im Shadow DOM
- **Drei Modi**: schwebender Button (`floating`), fest eingebettet (`inline`),
  per JavaScript geöffnetes Overlay (`modal`)
- **Datei-Anhänge & Bildschirmfoto**: Drag & Drop-Upload und optional ein
  „Bildschirmfoto aufnehmen"-Knopf über die Screen-Capture-API des Browsers
- **Artikel-Vorschläge**: schlägt beim Tippen passende Artikel aus dem
  öffentlichen Wiki des Workspace vor
- **Anpassbar**: Farben, Texte, Position, Sprache (de/en, auto), Vorbefüllung,
  Custom Fields

## Schnellstart

Kontaktformular in accountdesk anlegen (Einstellungen → Integrationen →
Hinzufügen → Kontaktformular (Website), erlaubte Domains eintragen) und den
Einbau-Code übernehmen, dann:

```html
<script src="https://my.accountdesk.de/widget/accountdesk-widget.js" defer></script>

<accountdesk-widget token="euer-widget-token"></accountdesk-widget>
```

## Installation über npm / CDN

Das Widget ist als [`@accountdesk/widget`](https://www.npmjs.com/package/@accountdesk/widget)
auf npm veröffentlicht.

**Als Script von einem npm-CDN** (versioniert, ohne eigenen Build):

```html
<script src="https://cdn.jsdelivr.net/npm/@accountdesk/widget@1/dist/accountdesk-widget.js" defer></script>
```

**In eigener Build-Pipeline** (registriert das Custom Element als Side-Effect):

```bash
npm install @accountdesk/widget
```

```js
import "@accountdesk/widget"
```

## Selbst hosten — ausdrücklich erlaubt und empfohlen

Ihr müsst das Script nicht von `my.accountdesk.de` laden. Baut es selbst (siehe
unten), installiert es über npm oder kopiert die ausgelieferte Datei und legt
sie zu euren eigenen Assets. Vorteile: keine Third-Party-Anfrage beim
Seitenaufruf, volle Kontrolle über Caching und Versionierung, CSP ohne
Fremd-Host.

Genauso ausdrücklich erlaubt: **den Code beliebig an eure Bedürfnisse
anpassen** — eigenes Design-System, zusätzliche Felder, andere Validierung
(MIT-Lizenz, auch kommerziell, ohne Rückfrage). Tickets erstellt eure
angepasste Version weiterhin über den dokumentierten Endpoint
(`POST /v1/widget/ticket` mit eurem Widget-Token als Bearer); die
Domain-Whitelist des Tokens gilt unverändert.

Empfohlen für angepasste Versionen: bei jedem Absenden einen Header
`Idempotency-Key` mit einer zufälligen UUID mitschicken und bei Wiederholungen
derselben Anfrage (Netzfehler, Antwort 409/429/502–504) **denselben** Wert
verwenden. Der Server legt das Ticket dann nur einmal an und liefert bei der
Wiederholung die erste Antwort (Header `Idempotent-Replayed: true`). Ohne den
Header werden Anfragen weiterhin angenommen.

Regeln für den Schlüssel (max. 100 sichtbare ASCII-Zeichen, aufbewahrt 24 h):

- **Neuer Schlüssel für neuen Inhalt.** Derselbe Schlüssel mit anderem Body
  wird mit `422` abgelehnt — ändert der Nutzer das Formular nach einem Fehler,
  einen neuen Schlüssel erzeugen.
- **`409`** heißt: die erste Anfrage mit diesem Schlüssel läuft noch (z. B.
  großer Anhang). Kurz warten und mit demselben Schlüssel wiederholen.
- Der Server nimmt je Widget-Token höchstens eine Anfrage alle 2 Sekunden an
  (`429`) — Wiederholungen frühestens nach 2 Sekunden.

Das mitgelieferte Widget macht das ab Version 1.2.0 selbst: ein Schlüssel je
Absendevorgang, bis zu zwei automatische Wiederholungen (nach 2,5 und 5 s) bei
Netzfehler oder `409`/`429`/`502`–`504`, und „Erneut versuchen“ nach einem
Fehler nutzt denselben Schlüssel, solange der Inhalt gleich bleibt.

## Attribut-Referenz

| Attribut | Standard | Wirkung |
|---|---|---|
| `token` | — | **Pflicht.** Widget-Token (JWT) |
| `api-url` | `https://my.accountdesk.de/api` | API-Basis-URL. Nur `https://` (für Entwicklung auch `http://localhost` und `http://127.0.0.1`); bei anderen Adressen sendet das Widget nichts und warnt in der Browser-Konsole |
| `mode` | `floating` | `floating`, `inline` oder `modal` (per `open()`/`close()`) |
| `position` | `bottom-right` | `bottom-right` oder `bottom-left` (nur `floating`) |
| `offset-x` / `offset-y` | `20px` | Abstand des Buttons vom Seitenrand |
| `primary-color` | `#1976D2` | Akzentfarbe |
| `primary-color-hover` | wie primary | Hover-Farbe |
| `button-text` / `title` | „Support" / „Kontaktieren Sie uns" | Beschriftungen |
| `language` | _(leer = automatisch)_ | `de` oder `en`. Ohne Angabe wird die Browsersprache (`navigator.language`) genutzt, mit Fallback auf Deutsch |
| `show-subject` | `true` | Betreff-Feld anzeigen. Der Betreff ist optional — bleibt er leer, bildet accountdesk ihn aus dem Anfang der Nachricht |
| `show-attachments` | `true` | Datei-Upload anzeigen |
| `screenshot` | `false` | „Bildschirmfoto aufnehmen"-Knopf (nur auf Browsern mit Screen-Capture-API; auf Mobilgeräten automatisch ausgeblendet) |
| `show-email` / `show-name` | `true` | Felder ausblenden (nur sinnvoll mit `prefill-*`) |
| `show-header` | `true` | Formular-Kopfzeile anzeigen |
| `suggest-articles` | `false` | Wiki-Artikelvorschläge beim Tippen |
| `prefill-email` / `prefill-name` | — | Felder vorbefüllen |
| `external-customer-nr` | — | Ticket einer externen Kundennummer zuordnen |
| `custom-fields` | — | JSON-Objekt mit Custom-Field-Werten |
| `max-files` / `max-file-size` | `5` / `10` (MB) | Anhang-Limits |
| `allowed-file-types` | `.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt,.zip` | Erlaubte Datei-Endungen |
| `z-index` | `9999` | Stapelreihenfolge |

### JavaScript-API

```js
document.querySelector("accountdesk-widget").open()  // Formular öffnen (v.a. mode="modal")
document.querySelector("accountdesk-widget").close() // wieder schließen
```

## Entwicklung

```bash
npm install
npm run dev      # Demo-Seite mit Live-Vorschau auf http://localhost:5180
npm run build    # tsc + Vite → dist/accountdesk-widget.js
npm test         # Unit-Tests (node --test, ab Node 22.18 ohne Zusatzoptionen)
```

## Release

Veröffentlicht wird nur aus GitHub Actions (`.github/workflows/release.yml`), mit npm-Provenance:

```bash
npm version patch|minor|major   # bumpt package.json, Commit + Tag vX.Y.Z
git push --follow-tags          # der Tag startet den Release-Workflow
```

Der Workflow prüft, dass Tag und `package.json` übereinstimmen, baut (`lint`, `format:check`, `build`) und ruft
`npm publish --provenance --access public` auf. **Nicht mehr lokal `npm publish` ausführen.**

**Einmalig auf npmjs.com einrichten (Trusted Publishing, kein Token):**

1. Auf npmjs.com als Inhaber des Pakets `@accountdesk/widget` anmelden → Paket → **Settings**.
2. Unter **Trusted Publisher** „GitHub Actions“ wählen und eintragen: Organization/User `accountdesk`,
   Repository `widget`, Workflow-Datei `release.yml`, Environment `npm`.
3. Speichern. Optional danach unter **Publishing access** „Require two-factor authentication and disallow
   tokens“ wählen – dann kann nur noch der Workflow veröffentlichen.
4. Im GitHub-Repo unter **Settings → Environments** das Environment `npm` anlegen (optional mit Schutzregel,
   z. B. nur Tags `v*`).

Rückfall ohne Trusted Publishing: auf npmjs.com einen *Granular Access Token* mit Schreibrecht nur auf
`@accountdesk/widget` erzeugen und im GitHub-Repo als Secret `NPM_TOKEN` (Environment `npm`) hinterlegen.

## Sicherheit und unterstützte Versionen

Sicherheitslücken bitte nach <https://www.accountdesk.de/sicherheit> melden, nicht als öffentliches Issue.
Das Widget erhält Sicherheitsupdates, solange es angeboten wird, mindestens aber 5 Jahre ab Erscheinen einer
Hauptversion; Sicherheitskorrekturen erscheinen in der aktuellen Hauptversion, ältere Hauptversionen erhalten
noch 18 Monate Korrekturen. Details: [SECURITY.md](SECURITY.md).

### Sicher einbinden

- **Nur den Widget-Token verwenden**, nie einen API-Token der Entwickler-API. Der Widget-Token steht sichtbar
  im Quelltext eurer Seite; er darf nur Tickets anlegen und Artikel vorschlagen, und accountdesk nimmt ihn nur
  von den Domains an, die ihr beim Kontaktformular eingetragen habt. Tragt dort nur eure eigenen Domains ein.
- **Version festlegen.** Beim Laden über ein npm-CDN eine genaue Version angeben (`@1.2.1` statt `@1`) und ein
  `integrity`-Attribut (Subresource Integrity) setzen – oder die Datei selbst hosten (siehe oben).
- **Content-Security-Policy** eurer Seite: `script-src` muss den Ort der Script-Datei erlauben, `connect-src`
  die API (`https://my.accountdesk.de`). `'unsafe-inline'` ist **nicht** nötig: Ab der nächsten Version nach 1.2.1 hängt das
  Widget seine Styles als Constructable Stylesheet (`adoptedStyleSheets`) an seinen Shadow DOM, und das Markup
  enthält keine `style`-Attribute. Getestet mit
  `default-src 'self'; script-src 'self'; style-src 'self'; connect-src https://my.accountdesk.de`.
  Nur Browser ohne `adoptedStyleSheets` (Safari vor 16.4, Firefox vor 101, Chrome vor 73) bekommen die Styles
  weiterhin als `<style>`-Element – dort bleibt das Widget bei strenger CSP ungestylt, funktioniert aber.
- **API-Adresse**: `api-url` nimmt nur `https://` an (Ausnahme für Entwicklung: `http://localhost`,
  `http://127.0.0.1`). Eine andere Adresse verwendet das Widget nicht – es sendet dann weder Token noch
  Formularinhalte, zeigt Besucher:innen einen Hinweis und schreibt eine Warnung in die Browser-Konsole.
- **Daten**: Das Widget schickt nur, was Besucher:innen ins Formular eingeben (E-Mail, Name, Betreff,
  Nachricht, Anhänge) sowie eure Vorbelegungen (`prefill-*`, `external-customer-nr`, `custom-fields`) per
  HTTPS an accountdesk. Mit `suggest-articles` geht der eingegebene Text schon beim Tippen an die
  Artikelsuche. Ein Bildschirmfoto entsteht nur auf Klick und nach der Freigabe im Browser. Das Widget setzt
  keine Cookies und nutzt keinen lokalen Speicher. Weist in eurer Datenschutzerklärung darauf hin.
- **Aktuell halten**: Neue Versionen stehen auf npm und unter
  [Releases](https://github.com/accountdesk/widget/releases); wer `my.accountdesk.de/widget/…` einbindet,
  bekommt Korrekturen automatisch.
- **Sicherheitsupdates** veröffentlichen wir als
  [GitHub Security Advisories](https://github.com/accountdesk/widget/security/advisories) dieses Repos.
  Benachrichtigt werdet ihr über **Watch → Custom → Security alerts** oben auf der Repo-Seite (bei
  Installation über npm meldet zusätzlich `npm audit` betroffene Versionen).

### Widget entfernen

1. Das Element `<accountdesk-widget …>` und das zugehörige `<script>` (bzw. den `import "@accountdesk/widget"`
   und das npm-Paket) von der Website entfernen. Das Widget speichert nichts im Browser der Besucher:innen,
   es bleibt nichts zurück.
2. In accountdesk unter Einstellungen → Integrationen das Kontaktformular löschen bzw. den Widget-Token
   widerrufen. Danach nimmt accountdesk mit diesem Token keine Anfragen mehr an – auch nicht von Kopien
   des Einbau-Codes, die noch irgendwo stehen.
3. Bereits über das Widget entstandene Tickets bleiben im Arbeitsbereich erhalten und werden dort wie alle
   anderen Tickets verwaltet bzw. gelöscht.

### Prüfungen und Herkunft

Jeder Pull Request durchläuft Lint, Formatierung, Unit-Tests, Build, `npm audit`, Gitleaks (Geheimnisse), Semgrep und
CodeQL (`.github/workflows/`). Ab der ersten Version aus dem Release-Workflow (nach 1.1.0) trägt jede Version
auf npm eine Provenance-Angabe (`npm audit signatures`), und zu jedem Release hängt eine Stückliste im Format
CycloneDX (`sbom.cdx.json`: Laufzeit – das Widget hat keine Abhängigkeiten; `sbom-build.cdx.json`:
Build-Werkzeuge).

## Hersteller und Kontakt

AccountDesk GmbH, Nordstraße 2, 24937 Flensburg, Deutschland – <https://www.accountdesk.de>

- Sicherheitslücken: <security@accountdesk.de> bzw. nach <https://www.accountdesk.de/sicherheit>
  (siehe [SECURITY.md](SECURITY.md))
- Alles andere: <support@accountdesk.de> oder ein [Issue](https://github.com/accountdesk/widget/issues)

Die EU-Konformitätserklärung und Angaben zur CE-Kennzeichnung nach dem Cyber Resilience Act folgen vor dem
11.12.2027 an dieser Stelle und auf der [npm-Seite](https://www.npmjs.com/package/@accountdesk/widget).

## Lizenz

[MIT](LICENSE) — Verbesserungen, die für alle nützlich sind, nehmen wir gern
als Pull Request entgegen; Fehlerberichte jederzeit als Issue.
