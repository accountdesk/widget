# Sicherheit

## Sicherheitslücke melden

Bitte melden Sie Sicherheitslücken nicht als öffentliches Issue, sondern nach unserer Richtlinie unter
<https://www.accountdesk.de/sicherheit> (English: <https://www.accountdesk.de/en/security>).

Alternativ per E-Mail an <security@accountdesk.de>.

## Veröffentlichung von Sicherheitsupdates

Behobene Sicherheitslücken veröffentlichen wir als
[GitHub Security Advisories](https://github.com/accountdesk/widget/security/advisories) dieses Repos – mit
betroffenen und korrigierten Versionen und, wo vorhanden, einer CVE-Kennung. Die Advisories fließen in die
GitHub Advisory Database ein; `npm audit` meldet betroffene Versionen dadurch automatisch. Benachrichtigungen
lassen sich auf der Repo-Seite über **Watch → Custom → Security alerts** abonnieren. Die korrigierte Version
erscheint gleichzeitig auf npm und unter [Releases](https://github.com/accountdesk/widget/releases).

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
