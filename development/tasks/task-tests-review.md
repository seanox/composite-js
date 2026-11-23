# Aufgaben: Testbestand bereinigen und nachvollziehbar strukturieren

## User Story

Als Projektentwickler möchte ich erkennen können, welches Verhalten jeder Test
absichert und warum ähnliche Tests nebeneinander bestehen, damit ich
Regressionen zuverlässig erkenne und den Testbestand ohne unnötige
Überschneidungen warten kann.

## Ausgangslage und Aussagegrenzen

Die Bestandsprüfung vom 7. November 2026 umfasst die 100 vom Playwright-Runner
erkannten Testseiten direkt unter `test` sowie die Einordnung der 14 separaten
Benchmarkseiten. Hilfsseiten und Importfragmente sind keine zusätzlichen
eigenständigen Testseiten.

Die Befunde beruhen auf statischem Vergleich von Testkörpern, Eingaben,
Assertions, Sollbildern und relevanten Implementierungen. Einzelne wirkungslose
Assertions wurden zusätzlich mit gezielten Gegenbeispielen geprüft. Es wurde
kein Browser- oder Coverage-Lauf durchgeführt und keine Testdatei geändert.
Die Prüfung belegt deshalb weder den aktuellen Laufzeitstatus noch, dass nach
einer Kürzung dieselbe Fehlererkennung erhalten bleibt.

Alle folgenden Dateipfade sind relativ zum Repository-Root. Zeilenangaben
beziehen sich auf den damaligen Arbeitsbaum und dienen als Einstiegspunkte;
vor Umsetzung sind die aktuellen Testkörper erneut abzugleichen. Vorhandene
lokale Änderungen, insbesondere an Manuals und generierten Bundles, bleiben
erhalten.

Das Hauptproblem ist nicht ausschließlich die Zahl der Testseiten:

- Einzelne Assertions können unabhängig vom getesteten Verhalten nicht
  fehlschlagen oder beobachten nur einen selbst gesetzten Wert.
- Einige Prüfungen und Erwartungsdaten sind tatsächlich doppelt.
- Große Snapshot-Szenarien vermischen mehrere Prüfziele und Lebenszyklusphasen.
- Viele Tasks sind nicht nach ihrem beobachtbaren Verhalten benannt.
- Parameterkombinationen vergrößern den Bestand erheblich:
  `test\extension_object_path_split.html` registriert allein 811 Tasks.

Es gibt keinen belastbaren Grund, ganze Funktionsgruppen pauschal zu löschen.
Die Aufgaben trennen deshalb Orakelkorrekturen, belegte Redundanzen,
Konsolidierungskandidaten und reine Strukturverbesserungen.

## Aufgabenübersicht

Die IDs können als Grundlage für einzelne Issues oder Unteraufgaben dienen.
P1 betrifft die Aussagekraft, P2 sichere Bereinigung und Übersicht, P3 eine
weitergehende Optimierung. Diese Prioritäten sind keine Fehler-Severities der
Runtime.

| ID | Priorität | Aufgabe | Voraussetzung |
| --- | --- | --- | --- |
| TEST-01 | P1 | Wirkungslose und unvollständige Testorakel korrigieren | Keine |
| TEST-02 | P2 | Belegte Doppelprüfungen entfernen oder sinnvoll umwidmen | Keine; lokale Gegenprüfung vor jeder Änderung |
| TEST-03 | P2 | Ungenutzte Sollbilder und doppelte Plattform-Testkörper bereinigen | Keine |
| TEST-04 | P2 | Verwandte Szenarien unter Erhalt ihrer besonderen Testgrenzen konsolidieren | Inventar der jeweiligen Prüfziele; TEST-01, falls das betroffene Orakel schwach ist |
| TEST-05 | P3 | Parser- und Escape-Matrizen anhand ihrer Fehlerklassen verschlanken | Inventar der Varianten und nachgewiesene Fehlererkennung |
| TEST-06 | P2 | Testzwecke, Kategorien und Zustandsübergänge nachvollziehbar dokumentieren | Keine; kann parallel beginnen |
| TEST-07 | P3 | Benchmarks von Korrektheitsprüfungen und Diagnostik klar abgrenzen | Keine |

## TEST-01: Testorakel korrigieren

Die folgenden Befunde sind eigenständig bearbeitbar. Schwache Tests werden
nicht allein wegen ihres bisherigen geringen Prüfwerts gelöscht: Zuerst ist
das ursprünglich beabsichtigte Verhalten ausdrücklich zu prüfen.

| Teilaufgabe | Fundstelle | Befund | Erforderliche Änderung |
| --- | --- | --- | --- |
| TEST-01a | `test\test_assert_message.html:23–29` | `assertMessageValue` prüft die Meldung nur im `catch`. Wirft `Assert.assertTrue` gar nicht mehr, besteht der Test trotzdem. | Das Ausbleiben der erwarteten Exception ausdrücklich fehlschlagen lassen; danach ihre Meldung prüfen. |
| TEST-01b | `test\composer_render_customize_selectors.html:59–72` | Nach Setzen von `window.probeCondition` wird lediglich derselbe Boolean verglichen. | DOM-Präsenz und Inhalt nach dem Ausblenden und erneuten Einblenden prüfen. |
| TEST-01c | `test\reactive_attributes_custom.html:22,35–41,73–74` | Das namensgebende Attribut `foo` wird nicht beobachtet. Das zusätzliche Value-Orakel akzeptiert einen beliebigen stabilen Wert ungleich dem Anfangswert. | Den konkreten `foo`-Wert vor und nach der Modelländerung prüfen. Die erneute Auswertung des unabhängigen Value-Ausdrucks mit kontrolliertem Wert oder Zähler nachweisen. |
| TEST-01d | `test\datasource_locator.html:37–51,95–103` | Die gültigen XML-/XSLT-Aufrufe prüfen nur, dass keine Exception auftritt. | Passende Rückgabetypen, bekannte Inhalte und konkrete XPath-Ergebnisse prüfen; die verschiedenen Locator-Formen erhalten. |
| TEST-01e | `test\routing_interceptors.html:23–37,60–71` | Der spätere Redirect-Interceptor ist hinter einem passenden, mit `false` abbrechenden Interceptor unerreichbar. Die Sollfolge enthält keinen Redirect. | Abbruch-Sentinel und Redirect-Test trennen. Einen erreichbaren Redirect-Pfad mit Hash-/Navigations- und gegebenenfalls DOM-Orakel ergänzen. |
| TEST-01f | `test\composer_render_condition.html:83–84` | Der Guard vergleicht `capture.snapshots().length` mit `capture.size()`. Beide sind dieselbe Länge; zusätzliche Renderzyklen werden hier nicht erkannt. | Mit der erwarteten Anzahl vergleichen. Eine zeitlich klar begrenzte Beobachtung unerwarteter Zusatzzyklen sicherstellen. |
| TEST-01g | `test\composer_render_output.html:30–32,50–65,93` | `outputC()` liefert `undefined`, sein Verbraucher bleibt aber während aller Schritte unsichtbar. | Einen sichtbaren C-Schritt ergänzen und die Undefined-Ausgabe prüfen oder den ungenutzten Fall ausdrücklich aus dem Szenario entfernen. A/B-Übergänge erhalten. |

### Abnahmekriterien

- [ ] Jeder überarbeitete Task hat ein ausdrücklich benanntes Prüfziel.
- [ ] Die Assertion beobachtet die Wirkung des Stimulus, nicht nur den zuvor
  gesetzten Modellwert oder eine Eigenschaft der Testhilfe.
- [ ] Für jedes korrigierte Orakel ist ein passendes Gegenbeispiel dokumentiert
  und geprüft: beispielsweise ausbleibende Exception, unverändertes DOM,
  falscher Rückgabewert oder zusätzlicher Renderzyklus.
- [ ] Das Gegenbeispiel schlägt im korrigierten Test fehl. Temporäre
  Fehler-Injektionen werden anschließend vollständig entfernt.
- [ ] Asynchrone Beobachtungen werden innerhalb des Test-Tasks abgewartet.
  Assertions nach dessen Abschluss gelten nicht als abgesicherte Prüfung.
- [ ] Beim Routing bleiben der frühzeitige Abbruch und die Reihenfolge der
  Interceptors separat nachgewiesen.
- [ ] Die betroffenen Testseiten laufen in Blink, Gecko und WebKit.

## TEST-02: Belegte Doppelprüfungen bereinigen

| Teilaufgabe | Fundstelle | Befund | Erforderliche Änderung |
| --- | --- | --- | --- |
| TEST-02a | `test\extension_object_lookup.html:92–98` | Drei `assertNotNull(typeof …)`-Assertions können nicht fehlschlagen, weil `typeof` immer einen String liefert, auch für `undefined`. Die vorherigen Assertions prüfen die erwarteten Typen bereits. | Die drei wirkungslosen Assertions entfernen. |
| TEST-02b | `test\reactive_recursion.html:34–36` | Ein kompletter Task vergleicht `capture.size()` mit `capture.snapshots().length`. | Den tautologischen Task entfernen oder durch eine konkrete Prüfung ersetzen. Ein Rekursions-/Nicht-Render-Orakel muss zusätzlich ein abgewartetes Beobachtungsfenster besitzen. |
| TEST-02c | `test\reactive_recipients.html:76–81` | `removed` und `remainedRemoved` beobachten mit demselben Ausdruck dieselben Maps ohne zwischenzeitliche Mutation oder Wartephase. | Zweite Beobachtung und zugehörige Assertion entfernen oder tatsächlich nach einer weiteren Änderung beobachten. |
| TEST-02d | `test\composer_render_customize.html:32–37` | `new Object()` und `{}` prüfen dieselbe Ablehnung eines Objektarguments mit gleicher Callback-Art. | Einen der beiden Fälle entfernen; andere Argument-/Callback-Varianten erhalten. |
| TEST-02e | `test\routing_path_normalize.html:95–106` | `normalize({}, "#")` und `normalize(true, "#")` wiederholen die vorherige Ablehnung des ersten Arguments. | Vorzugsweise zu `normalize("#", {})` und `normalize("#", true)` umwidmen, um ungültige nachfolgende Argumente abzudecken. |
| TEST-02f | `test\composer_render_iterate.html:397–405` | `OutputH` und `OutputI` verwenden dieselbe Stringliste, dasselbe Template und dieselbe Erwartung. | Einen repräsentativen Fall behalten. Scope-Wiederverwendung über `OutputI`/`OutputJ` und die unterschiedliche Zahlenliste `OutputG` erhalten. |

### Abnahmekriterien

- [ ] Jede Entfernung nennt den verbleibenden Test, der das relevante
  Verhalten weiterhin prüft, oder begründet den fehlenden Prüfwert.
- [ ] `release.remainedReleased` in `test\reactive_recipients.html:113–118`
  bleibt erhalten: Diese Prüfung folgt einer weiteren Modelländerung und
  einem echten asynchronen Schritt.
- [ ] Rückgabetypen, Fehlerdiagnostik, Scope-Grenzen und zeitlich unterschiedliche
  Zustände werden nicht allein wegen gleicher Solltexte zusammengelegt.
- [ ] Die betroffenen Seiten laufen vor und nach der Bereinigung; ausgeführte
  Seiten, Tasks und Faults werden nachvollziehbar verglichen.

## TEST-03: Erwartungsdaten und Plattform-Testkopien bereinigen

### TEST-03a: Ungenutzte Inline-Sollbilder entfernen

`test\composer_render_attributes.html:46–287` enthält die Blöcke
`text/test1` und `text/test2`. Das tatsächlich ausgeführte Orakel liest bei
Zeilen 17–22 ausschließlich
`composer_render_attributes_<engine>.txt`.

- [ ] Vor Entfernung sind alle direkten und indirekten Leser der beiden
  Inline-Blöcke geprüft.
- [ ] Nur die ungenutzten Blöcke entfallen; die Engine-Fixtures und das
  ausgeführte Snapshot-Orakel bleiben erhalten.
- [ ] Die Attribut-Testseite läuft weiterhin in allen drei Playwright-Engines.

### TEST-03b: Plattform-Prüfungen aus einer gemeinsamen Quelle beziehen

Die vier Testkörper von `test\compatibility.html` und
`test\benchmarks\compatibility.html` sind identisch. Die Dateien unterscheiden
sich lediglich in Titel und Charset-Angabe.

Sie prüfen JavaScript-/Browser-Voraussetzungen, nicht eine Benchmarkdauer.
Das kann insbesondere für nicht durch Playwright vertretene Browser sinnvoll
bleiben; die beiden gepflegten Kopien sind dafür nicht erforderlich.

- [ ] Eine gemeinsame Quelle ersetzt die doppelte Pflege der Testkörper.
- [ ] Beide bisher vorgesehenen Einstiegspunkte bleiben ausführbar, sofern
  sie weiterhin von den jeweiligen Testoberflächen verwendet werden.
- [ ] Die Prüfung ist als Plattform-Smoke-Test erkennbar und wird nicht als
  Performance-Messung dargestellt.
- [ ] Keine zusätzliche Kopie und kein unnötiges neues Testframework entstehen.

## TEST-04: Verwandte Szenarien gezielt konsolidieren

Diese Kandidaten sind keine Freigabe zum ersatzlosen Löschen ihrer Seiten.
Zuerst werden gemeinsame und besondere Prüfziele erfasst.

| Teilaufgabe | Beteiligte Dateien | Gemeinsamer Anteil | Zwingend zu erhaltende Besonderheit |
| --- | --- | --- | --- |
| TEST-04a | `test\composer_render_customize_statics.html:11–25`; `test\composer_render_hardening.html:55–77,182–212` | Registrierung und Wiederherstellung statischer Attribute | Die kleine Seite verwendet den Composite selbst als Attributträger; Hardening prüft zusätzlich veränderte Baseline und ungeschütztes Attribut. |
| TEST-04b | `test\reactive_objects.html:126–136`; `test\modules\reactiveA.js:28–38`; `test\reactive_module.html` | Dieselben neun Änderungen auf unterschiedlichen Modelltiefen | Externe Modulinitialisierung und Registrierung ihrer Verbraucher. |
| TEST-04c | `test\reactive_condition.html:133–268,550–576` | Acht aufeinanderfolgende identische Sollbilder und gemeinsames Szenariogerüst | Renderanzahl, unterschiedliche Zugriffswege, Selbstmutation und wiederholtes Entfernen/Einfügen mit Button-Rebinding. |

### Abnahmekriterien

- [ ] Vor Umsetzung liegt pro Gruppe eine Liste ihrer unterschiedlichen
  beobachtbaren Verhalten und Lebenszyklusphasen vor.
- [ ] Gemeinsame Szenariodaten werden nur dort geteilt, wo dies die Tests
  tatsächlich einfacher macht; unabhängige Seiten behalten ihre Isolation.
- [ ] Eine Seite wird erst entfernt, wenn ihre besonderen Prüfziele in den
  verbleibenden Tests nachweisbar enthalten sind.
- [ ] Identische Sollbilder dürfen kompakter dargestellt werden, ihre
  relevante Wiederholungszahl wird aber ausdrücklich geprüft.
- [ ] Im Condition-Szenario bleiben Literalbedingungen, direkter Zugriff,
  Getter und Methode sowie mindestens zwei Wiedereinfügungszyklen erhalten.
- [ ] Die veränderten Szenarien laufen in Blink, Gecko und WebKit.

## TEST-05: Parser- und Escape-Matrizen überprüfen

`test\extension_object_path_split.html` registriert 811 Tasks.
Insbesondere die Schleifen für Backslash-Parität bei Zeilen 162–223 sowie
die Decoder-Matrix überschneiden sich mit
`test\extension_string_unescape.html`.

Der Splitter verwendet intern `String.prototype.unescape()`
(`sources\extension.js:258–285`). Eine separat vollständig geprüfte
Decoder-Funktion muss nicht automatisch in jeder Kombination nochmals
vollständig geprüft werden. Die Einbindung in die Pfadgrammatik hat jedoch
eigene Risiken und benötigt gezielte Integrationstests.

### Abnahmekriterien

- [ ] Varianten sind vor einer Kürzung nach Fehlerklassen und tatsächlichen
  Parsergrenzen geordnet, nicht nur nach gleichen Rückgabewerten.
- [ ] Decoder-Vollabdeckung und Splitter-Integration sind ausdrücklich getrennt.
- [ ] Quote-Arten, gerade/ungerade Backslash-Folgen, escaped Delimiter,
  genau einmaliges Decoding und unvollständige Escapes bleiben abgesichert.
- [ ] NUL-Marker, mehrstellige Tokenindizes, lange Pfade, unabhängige Ergebnisse
  und fehlende Auswertung von Literalinhalten bleiben abgesichert.
- [ ] Größere Backslash-Anzahlen werden erst entfernt, wenn nachgewiesen ist,
  dass repräsentative und lange Folgen dieselben relevanten Fehler erkennen.
- [ ] Für ausgewählte Fehlerklassen wird mit temporären Fehler-Injektionen
  geprüft, dass der reduzierte Bestand die Fehler weiterhin erkennt.
- [ ] Vorher-/Nachher-Taskzahl wird erfasst. Es gibt keine pauschale
  Kürzungsquote und keinen allein auf Taskzahlen beruhenden Erfolgsnachweis.
- [ ] Debug- und normale Testing-Bundles bleiben passend zur jeweiligen
  Testebene eingesetzt.

## TEST-06: Testzwecke und Kategorien sichtbar machen

Die Übersicht soll das Verhalten erklären, nicht lediglich Dateinamen
wiederholen. Für jede aktive Testseite sind mindestens Kategorie, Prüfziel,
Stimulus, beobachtete Wirkung und besondere Abgrenzung zu ähnlichen Tests
nachvollziehbar festzuhalten.

Geeignete Kategorien sind Unit-/API-Test, DOM-Integration, Lifecycle,
Regression, Plattform-Smoke-Test, Benchmark und Diagnose. Die Zuordnung kann
zunächst in einer kompakten Übersicht erfolgen; ein neues
Metadaten-/Discovery-System ist nicht Voraussetzung.

### Abnahmekriterien

- [ ] Eine gepflegte Zuordnung verbindet alle aktiven Testseiten mit ihren
  Prüfzwecken und wichtigen Überschneidungen.
- [ ] Neue und überarbeitete Tasks verwenden aussagekräftige `name`-Metadaten;
  parametrisierte Namen identifizieren die relevante Variante.
- [ ] Große Snapshot-Szenarien benennen ihre Zustandsübergänge und deren Grund.
- [ ] Pro bewusst beibehaltener Überschneidung ist die unterschiedliche
  Ausführungsgrenze erklärt.
- [ ] Hilfsseiten und Fragmente werden als solche kenntlich gemacht und
  nicht als eigenständige Tests gezählt.
- [ ] Bestehende Discovery, Filter und Testoberflächen bleiben funktionsfähig.
  Datei-/Rollenbenennungen werden nicht beiläufig umgestellt.
- [ ] Die gepflegte Übersicht und die Testanleitung in `manuals\test.md`
  widersprechen weder dem Dateibestand noch dem Runner.

## TEST-07: Benchmarks und Diagnostik einordnen

Die Benchmarkseiten liegen separat unter `test\benchmarks` und gehören nicht
zum regulären CI-Lauf über den Dokumentroot `test`.

Die älteren Seiten, beispielsweise
`composer_render_benchmark.html`, `reactive_batching_benchmark.html`,
`reactive_granular_update_benchmark.html`,
`reactive_leaf_update_benchmark.html`,
`reactive_root_update_benchmark.html` und
`reactive_worst_case_benchmark.html`, melden hauptsächlich Dauerwerte.
Ihre Test-Tasks prüfen das entstandene DOM nicht ausdrücklich.

Die neueren Szenarien verwenden `test\benchmarks\benchmark.js`, das
Messung, Ergebnisprüfung und Cleanup trennt. Dieses vorhandene Muster ist
vor einer neuen Lösung zu bevorzugen.

### Abnahmekriterien

- [ ] Benchmarks benennen den gemessenen Vorgang und grenzen Initialisierung,
  Mutation, Rendering und Cleanup nachvollziehbar ab.
- [ ] Ausgaben sind nur dann als gültige Messung ausgewiesen, wenn das
  erwartete Ergebnis geprüft ist; ein falsch gerenderter Zustand darf nicht
  allein wegen einer gemeldeten Dauer erfolgreich sein.
- [ ] Batching prüft den Endzustand und gegebenenfalls einen ausdrücklich
  begründeten Renderanzahl-Vertrag statt eines ungenutzten Zählers.
- [ ] Unterschiedliche Lastprofile wie Leaf-Update, viele Verbraucher,
  Collection-Replacement und Splice bleiben getrennt.
- [ ] Es werden keine willkürlichen browser-/hardwareabhängigen Zeitlimits
  als neue Performance-Abnahmekriterien eingeführt.
- [ ] `reactive_lifecycle_memory_benchmark.html` bleibt ausdrücklich
  Heap-Diagnostik, nicht Leak-Nachweis oder Pass/Fail-Speicherlimit.

## Bewusst zu erhaltende Testgrenzen

Die folgenden Ähnlichkeiten rechtfertigen keine ersatzlose Entfernung:

| Gruppe | Unterschiedliche Absicherung |
| --- | --- |
| Composer-Rendering und Reactive-Updates | Initiale Realisierung gegenüber erneuter Auswertung nach Modelländerung |
| Import, Output und DataSource-Varianten | Unterschiedliche Wiederholungsregeln, dynamische Verbraucher sowie XML-/XPath-/XSLT-Pfade |
| `routing_active_on.html` / `routing_active_off.html` | Aktivierung beim Start mit beziehungsweise ohne `route` am Body; unterschiedliche DOM- und Aufrufverläufe |
| `composer_render_lock_leak_1.html` / `_2.html` / `_3.html` | Fehlende ID, leere ID und leerer Body; unterschiedliche Abbruch-/Leerlaufpfade |
| Module, Mount, Refresh und Docking | Ressourcenladen, Namespace-/Scope-Auflösung, Bindung, Dock/Undock und Remount |
| Reactive Input und Text | Benutzereingabe mit Rückwirkung auf das Modell gegenüber Modelländerung mit Aktualisierung mehrerer Verbraucher |
| Reactive Iterate und Recursion | Arrayersetzung gegenüber Änderung eines vorhandenen Elements und indirektem Getter |
| Test-API-Eigenprüfungen | Nachweis der Fehler-, Timeout- und Eventbehandlung, auf der die übrigen Tests beruhen |

Eine niedrige Zahl von Assert-Aufrufen ist kein Löschkriterium:
Ein einzelner Snapshot-Vergleich kann viele sichtbare Zustände absichern.
Umgekehrt sind identische Solltexte kein Beleg für gleiche Testsemantik.

## Gemeinsame Umsetzung und Validierung

- Prüfe vor jeder Änderung den aktuellen Git-Status und die betroffenen Diffs.
  Bestehende fremde Änderungen und generierte Dateien bleiben erhalten.
- Halte Runtime-Verhalten und öffentliche APIs unverändert. Diese Aufgaben
  betreffen Tests, Testhilfen, Erwartungsdaten und zugehörige Dokumentation.
  Entdeckte Runtime-Fehler werden als eigene Aufgaben erfasst.
- Stelle vor einer Testentfernung die verbleibende Absicherung fest.
  Bei Orakelkorrekturen prüfe das passende Gegenbeispiel vor der Korrektur
  und seine Erkennung danach.
- Verwende `Test.activate()`, `Test.create(...)` und `Test.start()`.
  Testabschluss und Faults werden nicht durch künstliche Runner-Events ersetzt.
- Nutze zuerst die betroffenen Seiten mit dem vorhandenen Runner, anschließend
  Blink, Gecko und WebKit für Änderungen an beobachtbarem Browserverhalten.
  Führe zusammengelegte Seiten einschließlich ihrer Fixtures aus.
- Prüfe, dass die vorgesehenen Seiten und Tasks tatsächlich ausgeführt wurden.
  Weniger Tasks oder gleiche Coverage-Prozentwerte allein beweisen keine
  gleichwertige Fehlererkennung.
- Für einen gezielten Lauf aus `test\playwright`, beispielsweise:

  ```text
  node runner.js -p 8001 -e blink -d .. -f "reactive_recipients.html"
  ```

  Für Gecko und WebKit verwende `-e gecko` beziehungsweise `-e webkit`
  und jeweils einen freien Port. Node.js 24 oder neuer und die benötigten
  Playwright-Browser sind Voraussetzung.
- Prüfe vor Browserläufen, ob die beiden Testing-Bundles zum relevanten
  Quellenstand passen. Eine erforderliche Regeneration erfolgt über
  `ant -f development compose`, nicht durch manuelle Bundle-Änderungen.
  Die Lösch-/Überschreibeffekte des Builds und parallele Nutzung sind vorher
  zu berücksichtigen.
- Erfolgreiche Firefox-Läufe sind kein Nachweis für Goanna. Erhaltene
  Plattform-Prüfungen dürfen nicht mit vollständiger Browserkompatibilität
  gleichgesetzt werden.
- Aktualisiere die direkt betroffene Dokumentation und gegebenenfalls
  generierte Testlisten über ihren bestehenden Erzeugungsweg.
- Dokumentiere je umgesetzter Aufgabe verbleibende Prüfziele, entfernte Fälle,
  ausgeführte Engines und etwaige nicht durchgeführte Validierung.

## Nicht Bestandteil

- Pauschale Löschung ähnlich benannter Testseiten oder ganzer Funktionsgruppen.
- Kürzung anhand einer festen Testzahl, Laufzeitquote oder Assert-Anzahl.
- Lockerung von Assertions oder Sollbildern, um einen Lauf erfolgreich zu machen.
- Neue Frameworks, erhebliche Abhängigkeiten oder ein umfassender Runner-Umbau.
- Änderungen am Scripting-Redesign oder an anderen Runtime-Funktionsaufgaben.
- Automatisches Entfernen von Plattform-Prüfungen, Benchmarks oder Diagnostik
  allein wegen ihrer Abgrenzung von regulären Funktionstests.
