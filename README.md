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
- **Anpassbar**: Farben, Texte, Position, Sprache (de/en), Vorbefüllung,
  Custom Fields

## Schnellstart

Widget-Token in accountdesk erstellen (Einstellungen → API-Tokens → Typ
„Widget", erlaubte Domains eintragen), dann:

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

## Attribut-Referenz

| Attribut | Standard | Wirkung |
|---|---|---|
| `token` | — | **Pflicht.** Widget-Token (JWT) |
| `api-url` | `https://my.accountdesk.de/api` | API-Basis-URL |
| `mode` | `floating` | `floating`, `inline` oder `modal` (per `open()`/`close()`) |
| `position` | `bottom-right` | `bottom-right` oder `bottom-left` (nur `floating`) |
| `offset-x` / `offset-y` | `20px` | Abstand des Buttons vom Seitenrand |
| `primary-color` | `#1976D2` | Akzentfarbe |
| `primary-color-hover` | wie primary | Hover-Farbe |
| `button-text` / `title` | „Support" / „Kontaktieren Sie uns" | Beschriftungen |
| `language` | `de` | `de` oder `en` |
| `show-subject` | `true` | Betreff-Feld anzeigen |
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
```

`npm run build:nuxt` ist ein interner Build-Schritt des accountdesk-Monorepos
(schreibt in ein Nachbarverzeichnis) und für externe Nutzung nicht relevant.

## Lizenz

[MIT](LICENSE) — Verbesserungen, die für alle nützlich sind, nehmen wir gern
als Pull Request entgegen; Fehlerberichte jederzeit als Issue.
