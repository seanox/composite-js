# User Story: Customize-Callbacks zur Laufzeit entfernen

## User Story

Als Anwendungsentwicklerin möchte ich registrierte Customize-Callbacks zur
Laufzeit gezielt wieder entfernen können, damit zeitlich begrenzte Anpassungen
nicht auf spätere Render- oder Navigationsvorgänge wirken und andere
Anpassungen unbeeinflusst bleiben.

## Ausgangslage und Umfang

Callback-basierte Anpassungen werden über folgende APIs registriert:

- `Composer.customize(tag, callback)` für Custom Tags beziehungsweise Makros
- `Composer.customize(selector, callback)` für Selektoren
- `Composer.customize(callback)` für Composer-Interceptor
- `Routing.customize(path, actor)` für Routing-Interceptor

Custom Tags und Selektoren lassen sich bereits durch Übergabe von `null` als
Callback entfernen. Für Composer-Interceptor und Routing-Interceptor gibt es
bisher keine entsprechende Laufzeit-Abmeldung. Die Entfernung soll für alle
Callback-basierten Customize-Varianten nachvollziehbar und konsistent möglich
sein. Eine konkrete API-Form ist nicht vorgegeben; sie muss jede Registrierung
eindeutig adressierbar machen. Bestehende Aufrufe, die den Rückgabewert einer
Registrierung nicht verwenden, bleiben kompatibel.

Konfigurationsparameter von `Composer.customize(...)`, insbesondere
`@ATTRIBUTES-STATICS`, sind keine Callbacks und bleiben außerhalb des Umfangs.
Ihre bestehende kumulative und nicht entfernbare Konfiguration wird nicht
geändert.

## Gewünschtes Verhalten

Eine Anwendung kann jede registrierte Customize-Funktion zur Laufzeit gezielt
abmelden. Nach der Abmeldung wird sie bei anschließend begonnenen
Render- beziehungsweise Navigationsvorgängen nicht mehr aufgerufen. Andere
Registrierungen bleiben aktiv.

Die bisherigen Zuordnungs- und Überschreibungsregeln bleiben erhalten:
Custom Tags und Selektoren bleiben über ihren Schlüssel adressiert; bei
mehreren Routing-Interceptoren für denselben Pfad darf die Entfernung eines
Interceptors nicht unbeabsichtigt die anderen entfernen. Wird eine Registrierung
durch eine spätere Registrierung für denselben Schlüssel ersetzt, darf die
Abmeldung der alten Registrierung die neue nicht entfernen.

Die Rückgabewerte der Callbacks behalten ihre bisherige Bedeutung. Insbesondere
bleiben das Abbrechen der weiteren Composer-Verarbeitung mit `false` und das
Abbrechen einer Routing-Verarbeitung mit `false` unverändert.

## Abnahmekriterien

- [ ] Custom-Tag-/Makro-Callbacks können weiterhin über ihren Schlüssel
  entfernt werden; das bestehende Verhalten mit `null` bleibt erhalten und ist
  dokumentiert.
- [ ] Selektor-Callbacks können weiterhin über ihren Selektor entfernt werden;
  das bestehende Verhalten mit `null` bleibt erhalten und ist dokumentiert.
- [ ] Composer-Interceptor können einzeln zur Laufzeit entfernt werden.
- [ ] Routing-Interceptor können einzeln zur Laufzeit entfernt werden,
  unabhängig davon, ob ihr Pfad als String oder `RegExp` registriert wurde.
- [ ] Nach erfolgreicher Entfernung wird der betreffende Callback bei späteren
  Render- beziehungsweise Navigationsvorgängen nicht mehr aufgerufen.
- [ ] Die Entfernung einer Registrierung beeinflusst keine anderen Callbacks
  beziehungsweise Interceptors, auch wenn sie denselben Pfad oder Schlüssel
  verwenden.
- [ ] Wird ein Custom Tag oder Selektor durch eine neuere Registrierung
  ersetzt, kann die Abmeldung der alten Registrierung die neue nicht entfernen.
- [ ] Erneute Registrierung nach einer Entfernung funktioniert wie eine neue
  Registrierung.
- [ ] Callback-Reihenfolge, Matching, Argumente, Fehlerbehandlung und
  Rückgabewert-Semantik bleiben unverändert.
- [ ] Die Konfiguration über `@ATTRIBUTES-STATICS` bleibt kumulativ und nicht
  entfernbar.
- [ ] Bestehender Anwendungscode, der den Rückgabewert der Registrierung
  ignoriert, funktioniert weiterhin.
- [ ] Die öffentliche API und ihr Entfernungsverhalten sind in den betroffenen
  Manuals dokumentiert.

## Erforderliche Tests und Dokumentation

- Ergänze Regressionstests für das Entfernen jeder Composer- und Routing-
  Customize-Variante.
- Prüfe mehrere Interceptors für denselben Routing-Pfad, Ersetzen und Entfernen
  von Custom Tags und Selektoren, erneute Registrierung sowie die unveränderte
  Abbruchsemantik mit `false`.
- Prüfe, dass Konfigurationsparameter von `Composer.customize(...)` vom
  Callback-Entfernungsverhalten unberührt bleiben.
- Aktualisiere `../../manuals/markup.md` und `manuals/routing.md` um die API,
  Beispiele und Laufzeitsemantik.

## Technischer Umfang

- Runtime-Quellen: `../../sources/composer.js` und `sources/routing.js`
- Dokumentation: `../../manuals/markup.md` und `manuals/routing.md`
- Generierte Bundles werden, falls Runtime-Quellen geändert werden, aus den
  Quellen mit dem vorhandenen Build erzeugt.
