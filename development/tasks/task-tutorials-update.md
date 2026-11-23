# User Story: Tutorials auf composite-js 3.0.0 migrieren

## User Story

Als Lernende möchte ich die Tutorials mit composite-js 3.0.0 nachvollziehen
können, damit die gezeigten APIs, Markup-Beispiele und Framework-Dateien zur
aktuellen Version passen und die einzelnen Schritte weiterhin funktionieren.

## Ausgangslage

Das Repository enthält eine Tutorialreihe für Single-Page-Applications und
eine für Micro-Frontends. Die Tutorials enthalten Beispielcode und lokale
Framework-Dateien, die mit der 3.0.0-Version und ihren Änderungen abgeglichen
werden müssen.

Die maßgeblichen Änderungen und Hinweise zur Migration sind in
`../../CHANGES`, Abschnitt `3.0.0`, unter „Compatibility and Migration“
dokumentiert.

## Gewünschtes Verhalten

Alle Schritte beider Tutorialreihen sind auf composite-js 3.0.0 abgestimmt.
Dazu werden die verwendeten Framework-Dateien und -Referenzen aktualisiert,
und alle betroffenen Codebeispiele, Markups, Erklärungen und Kommentare werden
an die aktuelle API angepasst.

Bei der Migration sind insbesondere die jeweils zutreffenden Änderungen aus
`CHANGES` zu berücksichtigen, darunter:

- `Composer.fire()` durch `Composer.emit()` und
  `Element.prototype.trigger()` durch `Element.prototype.dispatch()` ersetzen.
- Entfernte APIs wie `Namespace.create()` und `Math.unique()` nicht mehr
  verwenden; ersetzte APIs und Methoden mit ihren aktuellen Namen zeigen.
- Gültige Composite-IDs sowie die aktuellen Regeln für Ressourcenpfade,
  Scopes, Bedingungen, Intervalle, Iterationen und dynamische Attribute
  verwenden.
- Beispiele für `Scripting.eval()` und `Expression.eval()` mit dem
  erforderlichen expliziten Ausführungskontext aktualisieren, sofern sie
  vorkommen.

Die fachlichen Lernziele, die Reihenfolge der Schritte und die
Funktionsweise der jeweiligen Beispiele bleiben erhalten. Die Migration
ändert keine Runtime-Implementierung.

## Abnahmekriterien

- [ ] Alle 16 Schritte der Single-Page-Application-Tutorialreihe und alle
  9 Schritte der Micro-Frontend-Tutorialreihe sind geprüft und auf
  composite-js 3.0.0 migriert.
- [ ] Alle in den Tutorials verwendeten Framework-Dateien und
  Versionsreferenzen entsprechen composite-js 3.0.0.
- [ ] Betroffene API-Aufrufe, Markups, Ressourcenpfade, Codebeispiele,
  Kommentare und Erläuterungen entsprechen den geltenden 3.0.0-Regeln.
- [ ] Die in `CHANGES` aufgeführten Migrationshinweise sind berücksichtigt,
  soweit sie in den Tutorials verwendet werden.
- [ ] Kein Tutorial setzt stillschweigend entferntes oder nicht mehr
  kompatibles Verhalten voraus.
- [ ] Die Tutorialschritte bleiben in ihrer vorgesehenen Reihenfolge
  nachvollziehbar und die jeweiligen Beispiele funktionieren weiterhin.

## Erforderliche Prüfung

- Öffne die Einstiegspunkte aller Tutorialschritte über den vorgesehenen
  lokalen Webserver und prüfe auf Ladefehler sowie Fehler in der Browserkonsole.
- Prüfe die für den jeweiligen Schritt gezeigten Interaktionen und
  Framework-Funktionen; bei automatisierten Tests müssen die betroffenen
  Testseiten und Testfälle tatsächlich ausgeführt werden.
- Aktualisiere nur erzeugte Framework-Dateien über den vorgesehenen
  Build-/Kopierweg; bearbeite generierte Bundles nicht manuell.

## Technischer Umfang

- Tutorials: `../../tutorials/single-page-application/` und
  `../../tutorials/micro-frontend/`
- Migrationsreferenz: `../../CHANGES`
- Keine Änderungen an Runtime-Quellen außerhalb der Tutorials.
