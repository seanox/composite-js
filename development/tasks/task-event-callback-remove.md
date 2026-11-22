# User Story: Event-Callbacks zur Laufzeit abmelden

## User Story

Als Anwendungsentwicklerin möchte ich einzelne, zuvor registrierte
Event-Callbacks zur Laufzeit wieder abmelden können, damit temporäre Beobachter
nach ihrer Nutzung keine Ereignisse mehr verarbeiten und keine unnötigen
Referenzen oder Seiteneffekte behalten.

## Ausgangslage und Umfang

Öffentliche Callback-Registrierungen können derzeit dauerhaft angelegt werden:

- `Composer.listen(event, callback)` für Composer-Runtime-Events
- `Test.listen(event, callback)` für Test-Events
- `console.listen(callback)` für Konsolenausgaben, wenn die Test-API aktiviert
  ist

Die Event- und Ausgabe-Callbacks sollen jeweils einzeln zur Laufzeit abmeldbar
sein. Eine konkrete API-Form ist nicht vorgegeben; sie muss aber jede
Registrierung eindeutig adressierbar machen. Bestehende Aufrufe, die den
Rückgabewert einer Registrierung nicht verwenden, bleiben kompatibel.

Native DOM-Eventhandler über `addEventListener`/`removeEventListener` und
deklarative Eventattribute in Markup sind nicht Gegenstand dieser Änderung.
Monitor-Callbacks der Test-API bleiben wie bisher durch Ersetzen oder Entfernen
der jeweiligen Methode am Monitorobjekt steuerbar.

## Gewünschtes Verhalten

Eine Anwendung kann für jede Registrierung eine Möglichkeit zur Abmeldung
erhalten oder eine passende Abmeldemethode aufrufen. Die Abmeldung entfernt nur
die betreffende Registrierung. Andere Callbacks für dasselbe Event bleiben
aktiv und werden in ihrer bisherigen Registrierungsreihenfolge aufgerufen.

Wenn dieselbe Callback-Funktion mehrfach registriert wurde, muss jede
Registrierung unabhängig abmeldbar sein. Eine erneute Registrierung nach der
Abmeldung funktioniert wie eine neue Registrierung.

Die bestehenden Regeln für Callback-Argumente, synchrone Ausführung,
Fehlerbehandlung, Eventnamen und Weiterleitung bleiben unverändert. Während
einer laufenden Auslieferung gilt weiterhin die bestehende Snapshot-Semantik:
bereits für diese Auslieferung erfasste Callbacks werden nicht nachträglich
abgebrochen; eine Abmeldung wirkt auf nachfolgende Auslieferungen.

## Abnahmekriterien

- [ ] Für `Composer.listen(event, callback)` kann eine Registrierung zur
  Laufzeit einzeln abgemeldet werden; das gilt für vordefinierte und zulässige
  benutzerdefinierte Composer-Events.
- [ ] Für `Test.listen(event, callback)` kann eine Registrierung zur Laufzeit
  einzeln abgemeldet werden.
- [ ] Für `console.listen(callback)` kann eine Registrierung im aktivierten
  Test-API zur Laufzeit einzeln abgemeldet werden.
- [ ] Nach erfolgreicher Abmeldung wird der Callback bei nachfolgenden
  Auslieferungen des betreffenden Events beziehungsweise der betreffenden
  Konsolenausgabe nicht mehr aufgerufen.
- [ ] Die Abmeldung eines Callbacks beeinflusst weder andere Callbacks für
  dasselbe Event noch andere Events oder Konsolenausgaben.
- [ ] Mehrfachregistrierungen derselben Funktion sind unabhängig abmeldbar;
  erneutes Registrieren nach einer Abmeldung ist möglich.
- [ ] Eine wiederholte Abmeldung ist sicher und löst keinen Fehler aus.
- [ ] Registrierungsreihenfolge, Argumente, Fehlerbehandlung und
  Snapshot-Verhalten der bestehenden Auslieferung bleiben erhalten.
- [ ] Bestehender Anwendungscode, der den Rückgabewert der Registrierung
  ignoriert, funktioniert weiterhin.
- [ ] Die öffentliche API und ihr Abmeldeverhalten sind in den betroffenen
  Manuals dokumentiert.

## Erforderliche Tests und Dokumentation

- Ergänze Regressionstests für die Abmeldung von Composer- und Test-Event-
  Callbacks sowie Konsolen-Callbacks.
- Prüfe insbesondere mehrere Callbacks desselben Events, mehrfache
  Registrierung derselben Funktion, erneute Registrierung, Abmeldung während
  einer laufenden Auslieferung und wiederholte Abmeldung.
- Prüfe, dass Fehlerbehandlung, Argumente und Auslieferungsreihenfolge
  unverändert bleiben.
- Aktualisiere `../../manuals/events.md` und `manuals/test.md` um die API und ihre
  Laufzeitsemantik.

## Technischer Umfang

- Runtime-Quellen: `../../sources/composer.js` und `sources/test.js`
- Dokumentation: `../../manuals/events.md` und `manuals/test.md`
- Generierte Bundles werden, falls Runtime-Quellen geändert werden, aus den
  Quellen mit dem vorhandenen Build erzeugt.
