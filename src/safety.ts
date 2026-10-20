// Reine Hilfsfunktionen ohne DOM-Zugriff — einzeln testbar (test/safety.test.ts).

/** Text für HTML-Inhalt und Attributwerte in doppelten Anführungszeichen maskieren. */
export function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Hosts, für die `http:` erlaubt bleibt (lokale Entwicklung). */
const LOCAL_HOSTS = ['localhost', '127.0.0.1']

/**
 * Prüft das Attribut `api-url`. Das Widget schickt Widget-Token, Formularinhalte
 * und Anhänge dorthin — unverschlüsselt (`http:`) oder an ein anderes Schema
 * (`javascript:`, `data:` …) darf nichts davon gehen. Erlaubt ist nur `https:`,
 * für die Entwicklung zusätzlich `http://localhost` und `http://127.0.0.1`.
 * Relative Angaben werden gegen `base` (die Seite) aufgelöst.
 *
 * Rückgabe: die normalisierte Adresse ohne abschließenden Schrägstrich, oder
 * `null`, wenn sie nicht verwendet werden darf.
 */
export function checkApiUrl(raw: string, base?: string): string | null {
  let url: URL
  try {
    url = new URL(raw.trim(), base)
  } catch {
    return null
  }
  const allowed =
    url.protocol === 'https:' || (url.protocol === 'http:' && LOCAL_HOSTS.includes(url.hostname))
  if (!allowed || url.username || url.password) return null
  return url.href.replace(/\/+$/, '')
}

/** Wert für das `accept`-Attribut des Datei-Felds aus `allowed-file-types`. */
export function acceptAttr(types: string[]): string {
  return esc(types.join(','))
}
