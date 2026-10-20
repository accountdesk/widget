# Sicherheit

## Sicherheitslücke melden

Bitte melden Sie Sicherheitslücken nicht als öffentliches Issue, sondern nach unserer Richtlinie unter
<https://www.accountdesk.de/sicherheit> (English: <https://www.accountdesk.de/en/security>).

## Unterstützte Versionen

Das Widget erhält Sicherheitsupdates, solange es angeboten wird, mindestens aber 5 Jahre ab Erscheinen einer
Hauptversion. Sicherheitskorrekturen erscheinen in der jeweils aktuellen Hauptversion; ältere Hauptversionen
erhalten noch 18 Monate lang Korrekturen. Danach ist der kostenlose Wechsel auf die aktuelle Hauptversion der
Weg zu Sicherheitsupdates.

| Version | Sicherheitsupdates |
|---|---|
| 1.x (aktuell) | ja |

## Herkunft der Pakete

Ab der nächsten Version (nach 1.1.0) wird jede Version auf npm ausschließlich aus GitHub Actions veröffentlicht
(`.github/workflows/release.yml`) und trägt eine npm-Provenance-Angabe. Sie lässt sich mit `npm audit signatures` prüfen.

Zu jedem Release auf GitHub gehört eine Stückliste (SBOM, CycloneDX) als Anhang.
