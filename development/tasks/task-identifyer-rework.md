# User Story: Bezeichnerregeln nach dem Composite-Declaration-Rework harmonisieren

## User Story

Als Anwendungsentwicklerin möchte ich für Runtime-Bezeichner und deren
Namenssegmente eine einheitliche Regel verwenden können, damit Composite-,
Binding-, Namespace- und Message-Namen konsistent sind, ohne dadurch
unterschiedliche Pfadgrammatiken gleichzusetzen.

## Abhängigkeit und Abgrenzung

- Diese Story baut auf `task-composite-declaration-rework.md` auf und setzt
  dessen Trennung von Composite-`id`, Ressourcen-/Modulzuordnung über `use`
  und Binding-Basis voraus.
- Die dort festgelegte Ablösung der `@`-Syntax und das Verhalten von `use`
  werden hier nicht erneut entworfen. Die vereinheitlichte Bezeichnerregel
  wird auf die nach dem Rework verbleibenden Namen und `use`-Segmente
  angewendet.
- Die Story ändert weder Ressourcenauflösungs- und Ladeabläufe,
  Routing-Semantik, Composite-Eindeutigkeit noch das Veröffentlichen von
  Anwendungsobjekten. Die neue Bezeichnerprüfung bleibt davon getrennt.
- Sie verändert nicht die Grammatik beliebiger URLs, Ressourcenpfade,
  Routing-Daten, Interceptor-Ziele, HTML-/XML-Namen oder zitierter
  Objektschlüssel.
- Deklarationsnamen von Expressions und `iterate` sind nicht Teil dieser
  Story.

## Gemeinsame Bezeichnerregel

Jedes namensbildende Segment muss dieser ASCII-basierten Regel entsprechen:

```regex
^[_$A-Za-z][_$A-Za-z0-9]*$
```

Damit sind `_` und `$` am Anfang sowie Buchstaben, Ziffern, `_` und `$` an
den folgenden Stellen erlaubt. Ziffern sind am Anfang nicht erlaubt. Die
Regel ist eine festgelegte ASCII-Teilmenge nach JavaScript-Vorbild, nicht die
vollständige JavaScript-Bezeichnersyntax. Reservierte Wörter sind durch diese
Regel allein nicht ausgeschlossen; ob ein Name in einem konkreten
Ausdruckskontext verwendbar ist, bleibt dessen Grammatik überlassen.

Die Regel wird **pro Namenssegment** geprüft. Trennzeichen wie `.`, `/`, `:`
oder Composite-Binding-Qualifier behalten ihre Bedeutung und werden nicht
Bestandteil des regulären Ausdrucks.

## Gewünschtes Verhalten

- Composite-IDs folgen der Bezeichnerregel. Die `@`-Syntax bleibt gemäß dem
  vorausgesetzten Rework unzulässig; Routing und DOM-Identität bleiben an die
  Composite-ID gebunden.
- Composite-`use`-Werte werden als Ressourcen-/Modulpfade behandelt. Jedes
  namensbildende Slash-Segment folgt der Bezeichnerregel; Slash und die
  daraus abgeleitete Punktpfad-Syntax bleiben Strukturzeichen. Die im Rework
  festgelegten Regeln für Dateiendungen und ungültige Ressourcenpfade gelten
  unverändert.
- Bei normalem Markup-`use` folgt jedes Segment des adressierten
  Anwendungsobjekts der Bezeichnerregel. Dasselbe gilt für die
  Namespace-Segmente von `use()` und `expose(object, namespace)`. Die
  JavaScript-Helper behalten ihre bisherige Bedeutung.
- Bei Message-Keys folgt jedes punktgetrennte Segment der Bezeichnerregel.
  Die interne `messages`-Objektstruktur und die öffentliche Message-API
  bleiben konsistent.
- Bei Composite-Binding folgen der Basisname und benannte Qualifier der
  Bezeichnerregel. Bestehende numerische Qualifier und Array-Bindings, etwa
  `textArray:0`, bleiben gültig.
- Unquotierte Objektpfad-Bezeichner in `Object.use`, `Object.lookup` und
  `Object.exists` folgen derselben Regel. Numerische Indizes und zitierte
  Schlüssel behalten ihre bisherige Grammatik.
- Wenn `require()` und Markup-`use` dasselbe Modul adressieren, gelten für
  dessen namensbildende Segmente kompatible Regeln. Daraus entsteht keine
  Bezeichnerpflicht für beliebige Datei- oder Ressourcenpfade.
- Routing prüft Composite-Ziele nach deren ID-Regel, wendet diese Regel aber
  nicht auf den gesamten Routing-Pfad oder dessen Daten- und
  Interceptor-Segmente an.
- `$` in einer gültigen Composite-ID beeinträchtigt weder DOM-Referenzen noch
  CSS-Selektoren oder interne ID-Abfragen.

## Kollisionsverhalten

- Die Bezeichnerregel entscheidet nur über die lexikalische Gültigkeit eines
  Namens. Ein gültiger Name wird nicht allein deshalb abgelehnt, weil er ein
  reserviertes Wort oder der Name einer Objektmethode bzw. -eigenschaft ist.
- Bei gewöhnlichen Eigenschaften von Anwendungsobjekten gilt die
  JavaScript-Zuweisungssemantik: Eine erneute Zuweisung ersetzt den bisherigen
  Wert, ohne allein wegen dieser Überschreibung eine Warnung auszugeben.
  Message-Key-Überschreibungen folgen derselben Regel, sofern kein
  Runtime-eigener Eintrag betroffen ist.
- Runtime- und API-eigene Objektstrukturen dürfen ihre Invarianten schützen.
  Ein Konflikt, der eine solche Struktur unbrauchbar machen oder beschädigen
  würde, wird explizit als Fehler gemeldet und nicht stillschweigend
  übersprungen.
- Die Eindeutigkeit gleichzeitig deklarierter Composite-IDs bleibt davon
  unberührt: Doppelte IDs sind gemäß dem Rework ein Fehler. Unterschiedliche
  IDs dürfen dasselbe `use` verwenden; das Ersetzen eines veröffentlichten
  Objekts durch `expose` bleibt gemäß dem Rework zulässig.

## Abnahmekriterien

- [ ] Die Regel `^[_$A-Za-z][_$A-Za-z0-9]*$` wird für alle im Umfang
  aufgeführten Bezeichner und Namenssegmente einheitlich verwendet.
- [ ] Namen mit führendem `_` oder `$` sowie Namen mit nachgestellten Ziffern
  sind gültig; Namen mit führender Ziffer oder Zeichen außerhalb der
  festgelegten Menge werden an der jeweiligen API-/Markup-Grenze abgelehnt.
- [ ] Zusammengesetzte Adressen werden segmentweise geprüft. Punkte, Slashes,
  Doppelpunkte und bestehende Binding-Qualifier werden nicht pauschal durch
  die Bezeichnerregel ersetzt.
- [ ] Numerische Binding-Qualifier, numerische Objektpfad-Indizes, zitierte
  Objektschlüssel sowie numerische oder URI-artige Routing-Daten behalten
  ihr bestehendes Verhalten.
- [ ] Reservierte Wörter werden nicht durch eine zusätzliche globale
  Keyword-Liste ausgeschlossen; konkrete Ausdruckskontexte behalten ihre
  eigenen Syntaxregeln.
- [ ] Überschreiben gewöhnlicher Anwendungsobjekt- und Message-Eigenschaften
  folgt der festgelegten Zuweisungssemantik. Konflikte mit geschützten
  Runtime-/API-Strukturen erzeugen einen expliziten Fehler und beschädigen
  keine interne Struktur.
- [ ] Doppelte Composite-IDs bleiben Fehler; das Teilen eines `use`-Werts
  durch unterschiedliche IDs und das Ersetzen per `expose` bleiben gemäß
  dem Rework zulässig.
- [ ] Composite-IDs mit `$` funktionieren bei DOM-Referenzen, CSS-Bezügen
  und internen Abfragen korrekt.
- [ ] Die Regeln und Fehlerfälle sind in den betroffenen Manuals dokumentiert
  und die Änderung ist in `CHANGES` festgehalten.
- [ ] Betroffene Laufzeittests bestehen in Blink, Gecko und WebKit.

## Erforderliche Tests und Dokumentation

- Ergänze Tests für gültige und ungültige Bezeichner in Composite-IDs,
  Composite- und Element-`use`, Namespace-Aufrufen, Message-Keys,
  Composite-Binding und Objektpfaden.
- Ergänze Tests für Überschreibungen gewöhnlicher Eigenschaften sowie für
  explizite Fehler bei geschützten Runtime-/API-Strukturen.
- Sichere mit Regressionstests ab, dass bestehende Pfad-, Index-, Qualifier-,
  Array-Binding- und Routing-Semantik erhalten bleibt.
- Aktualisiere mindestens `manuals/composite.md`,
  `manuals/composite-binding.md`, `manuals/message.md`, `manuals/markup.md`
  und `manuals/scripting.md` entsprechend den tatsächlich betroffenen APIs.
- Implementiere Änderungen in den Runtime-Quellen und regeneriere bei
  Runtime-Änderungen die erforderlichen Test-Bundles mit dem vorhandenen
  Build. Generierte Dateien werden nicht manuell bearbeitet.

## Technischer Umfang

Betroffene Runtime-Bereiche sind insbesondere Composer und Composite Binding,
Scripting-/Namespace-Auflösung, Objektpfade und Message-Keys. Routing ist
einzubeziehen, soweit es Composite-IDs auflöst; die allgemeine
Routing-Pfadgrammatik bleibt außerhalb des Umfangs. Expressions und
`iterate`-Deklarationsnamen bleiben unverändert.
