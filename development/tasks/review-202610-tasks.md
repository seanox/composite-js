# Arbeitsauftraege zum Code-Review Oktober 2026

Stand: 2026-10-22

Dieses Dokument formuliert die 52 Befunde aus
[review-202610.md](review-202610.md) als umsetzbare Arbeitsauftraege fuer
Entwickler und Coding-Agenten. Es ergaenzt den strukturierten Plan
[review-202610-tasks.yaml](review-202610-tasks.yaml). Die IDs `R01` bis `R52`
entsprechen unveraendert den Befundnummern 1 bis 52 des Reviews.

**Alle Aufgaben sind offen.** Dieses Dokument beschreibt zu erledigende Arbeit,
nicht bereits implementierte Korrekturen. Die Quellenangaben beziehen sich auf
den Review-Stand der lokalen Dateien unter `sources`, nicht auf generierte
Release-Dateien. Gleiche vor jeder Bearbeitung die Fundstellen mit dem aktuellen
Quelltext ab. Alle Dateipfade gelten relativ zum Projektverzeichnis.

## Umfang und Bearbeitungsreihenfolge

| Prioritaet | Befunde | Story Points |
| --- | ---: | ---: |
| Hoch | 2 | 7 |
| Mittel | 41 | 100 |
| Niedrig | 9 | 13 |
| Gesamt | 52 | 120 |

Die Story Points sind die unveraenderte additive Schaetzung des Reviews,
einschliesslich gezielter Regressionstests. Sie sind keine Zeitangaben.
Gemeinsam bearbeitete Ursachen koennen Aufwand sparen; ein ueber die Korrektur
hinausgehender Funktionsausbau ist separat abzustimmen und nachzuschaetzen.

| Reihenfolge | Paket | Zugeordnete Aufgaben |
| --- | --- | --- |
| 1 | `rendering`: Rendering, Bindung und Reactive-Verhalten stabilisieren | [R01](#r01), [R02](#r02), [R03](#r03), [R04](#r04), [R05](#r05), [R06](#r06), [R07](#r07), [R08](#r08), [R09](#r09), [R10](#r10), [R12](#r12), [R13](#r13), [R14](#r14), [R42](#r42) |
| 2 | `fehlererkennung`: Fehlerweitergabe und Teststeuerung absichern | [R15](#r15), [R20](#r20), [R38](#r38), [R39](#r39), [R40](#r40), [R41](#r41), [R48](#r48), [R49](#r49) |
| 3 | `navigation`: Routing-Ziel und Ereignisablauf vereinheitlichen | [R23](#r23), [R24](#r24), [R25](#r25), [R26](#r26), [R27](#r27), [R28](#r28), [R29](#r29), [R30](#r30) |
| 4 | `aufloesung_caches`: Namensaufloesung, Ressourcen und Messages korrigieren | [R11](#r11), [R21](#r21), [R22](#r22), [R31](#r31), [R32](#r32), [R33](#r33), [R34](#r34), [R35](#r35), [R36](#r36), [R37](#r37), [R43](#r43), [R45](#r45), [R50](#r50) |
| 5 | `sprache_api`: Sprachverarbeitung und verbleibende API-Faelle absichern | [R16](#r16), [R17](#r17), [R18](#r18), [R19](#r19), [R44](#r44), [R46](#r46), [R47](#r47), [R51](#r51), [R52](#r52) |

Beginne mit R01 und R02. Die Paketfolge ist eine Priorisierung und keine starre
Sperre: R15 muss beispielsweise vor R42 fertiggestellt oder gemeinsam mit R42
integriert werden. Fuer den Test-Runner ist die technische Reihenfolge
R39/R40, dann R38, dann R41 sinnvoll. R48 und R49 lassen sich mit diesen
Aenderungen abstimmen.

Die Aufgaben stehen unten zur eindeutigen Zuordnung in Befundreihenfolge.
**Voraussetzung** bezeichnet technische Vorarbeit. **Abstimmung** bezeichnet
gemeinsame Codepfade oder Vertraege, aber keine harte Abhaengigkeit. Gemeinsam
implementierte Aufgaben behalten ihre eigenen Regressionen und Abnahmekriterien.

## Arbeitsweise fuer Entwickler und Agenten

### Vor Beginn einer Aufgabe

1. Lies den zugehoerigen Review-Befund, den aktuellen betroffenen Quelltext und
   die angegebenen Tests. Die Testdateien sind Ansatzpunkte, keine Zusage, dass
   sie den Fehler bereits abdecken.
2. Reproduziere den Fehler und sichere ihn als gezielten Regressionstest ab.
   Halte bereits vorhandene, unabhaengige Probleme getrennt fest.
3. Pruefe Voraussetzungen und abgestimmte Aufgaben. Veraendere gemeinsam genutzte
   Helfer nicht nur fuer den gerade betrachteten Spezialfall.
4. Klaere als Entscheidung markierte API-Fragen vor der Implementierung.
   Empfehlungen in diesem Dokument sind keine Freigabe einer inkompatiblen
   Vertragsaenderung. Ist die Entscheidung offen, kennzeichne die betroffene
   Aufgabe als blockiert, statt still eine neue Semantik einzufuehren.

### Grenzen der Umsetzung

Korrigiere die bestehenden Mechanismen, nicht die Architektur als Ganzes.
Dynamische Ausfuehrung vertrauenswuerdiger Anwendungsressourcen, synchrone
Ressourcenbeschaffung, Prototype-Erweiterungen und der vollstaendige Neuaufbau
bei `iterate` sind hier keine zu ersetzenden Konzepte. Insbesondere folgt aus
R11 kein Auftrag fuer einen neuen Renderer oder ein DOM-Diffing-Verfahren.

Arbeite an den Dateien unter `sources`. Bearbeite generierte Release- und
Test-Bundles nicht von Hand. Nutze vorhandene Helfer und abstrahiere gemeinsame
Logik nur dort, wo mehrere reale Aufrufpfade davon profitieren. Erhalte die
bisherige Browser-/Sprachkompatibilitaet und beachte den vorhandenen
ES2015-Lintpfad. Neue Syntax oder APIs duerfen nicht beilaufig die
Kompatibilitaetsgrenze verschieben.

Fehler duerfen nicht durch breite Catch-Bloecke, stille Ersatzwerte oder
Erfolgsmeldungen verschwinden. Trenne erwartete optionale Nichtverfuegbarkeit,
etwa die Parent-Console in R51, von tatsaechlichen Implementierungsfehlern.
Vertragsaenderungen und neu praezisierte Randfaelle gehoeren in das passende
Manual, nicht nur in einen Test.

### Testintegration und unabhaengige Beobachtung

Erweitere bestehende HTML-Szenarien oder lege gezielte neue Szenarien unter
`test` an. Registriere neue regulaere Szenarien in `test\index.html` im Block
`text/test-cases`. Verwende kontrollierte lokale Ressourcen fuer HTTP-/XML-Faelle
und erfasse bei Cache- oder Routing-Tests auch Request- beziehungsweise
Ereignisanzahlen. Synchronisiere asynchrone Tests ueber beobachtete Zustaende und
Ereignisse; feste Wartezeiten sind hoechstens eine Abbruchschranke.

**Bei R38-R41, R47-R49 und R51 darf nicht allein das betroffene Test-Framework
seine eigene Korrektheit bestaetigen.** Fuehre kontrollierte Laeufe in isolierten
Frames oder Fenstern aus und erfasse mit dem vorhandenen Playwright von aussen
die Ereignisse, Zaehler, Console-Ausgaben und unbehandelten Rejections. Der
vorhandene Runner sammelt `pageerror` als Ausgabe und entscheidet normalerweise
anhand von `testFinish.queue.faults`. Ein gruener Zaehler allein ist bei diesen
Befunden gerade kein ausreichender Nachweis.

Trenne absichtlich ausgeloeste Testfehler von unerwarteten Browserfehlern.
Pruefe auch spaete `RESPONSE`-/`FINISH`-Ereignisse und Callbacks nach Interrupt.
Ein negativer Test muss nachweislich den erwarteten Fehler beobachten und darf
nicht nur deshalb bestehen, weil der Runner den Fehler verloren hat.

### Vorhandene Build- und Testwege

Verwende Java/Ant, die bestehenden Abhaengigkeiten aus
`development\package.json` und `test\playwright\package.json` sowie die
installierten Playwright-Browser. Fuer den Runner ist gemaess Projektangabe
Node >=24 vorgesehen. Ein weiteres Test- oder Lint-Framework ist nicht Teil
dieses Arbeitsauftrags.

Fuehre vom Projektverzeichnis aus den vorhandenen Compose-Pfad einschliesslich
ESLint aus. Dadurch entstehen aktuelle Test-Bundles aus den geaenderten Quellen:

```powershell
ant -f development\build.xml compose
```

Fuehre die Browserlaeufe anschliessend im Verzeichnis `test\playwright` aus:

```powershell
node runner.js -p 8001 -e blink -d ..
node runner.js -p 8002 -e gecko -d ..
node runner.js -p 8003 -e webkit -d ..
```

Die Ports muessen frei sein; beende dafuer keine fremden Dienste. Verbindliche
Einstiegspunkte sind `development\build.xml`,
`development\eslint.config.js`, `test\playwright\runner.js` und
`.github\workflows\playwright.yaml`. Fuehre bei Implementierungsarbeiten eine
Baseline und nach der Aenderung die passenden Szenarien sowie die Browsermatrix
aus. Nicht verfuegbare Umgebungen oder verbleibende Fehler sind offen zu benennen.

### Gemeinsame Definition of Done

- [ ] Die urspruengliche Reproduktion schlaegt vor der Korrektur fehl und erfuellt danach die individuelle Abnahme.
- [ ] Positive, negative und relevante Wiederholungs-/Lebenszyklusfaelle sind abgedeckt.
- [ ] Vorhandene betroffene Tests und die Browsermatrix zeigen keine neu verursachten Fehler.
- [ ] Die neuen Szenarien erzeugen keine unerwarteten Console-Fehler oder unbehandelten Rejections.
- [ ] Entscheidungen und geaenderte beziehungsweise praezisierte API-Vertraege sind dokumentiert.
- [ ] Generierte Artefakte stammen aus dem Build; die Korrektur ist nicht nur in einem Bundle vorhanden.

Halte bei Abschluss die geaenderten Dateien, den Nachweis der individuellen
Abnahme und gegebenenfalls Einschraenkungen fest. Pflege den Status in der
Markdown-Aufgabe und im entsprechenden YAML-Eintrag konsistent:
`offen`, `in_arbeit`, `blockiert` oder `erledigt`. Setze eine Aufgabe nicht schon
nach einem plausibel aussehenden Patch auf `erledigt`.

## Einzelauftraege

### R01

**Custom-Selektoren auf Elementknoten begrenzen**

**Prioritaet:** hoch | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R03](#r03)
**Fundstellen:** `sources\composer.js:1278-1284, 1949-1954`

**Problem und Ziel:** `_render_element_selectors()` ruft `matches()` auch auf
Textknoten und Condition-Markern auf. Bereits ein beliebiger registrierter
Selektor kann deshalb dynamische Texte und bedingte Elemente unbrauchbar machen.
Beschraenke ausschliesslich das CSS-Matching auf Elemente.

**Umsetzung**

1. Pruefe vor dem Matching den Knotentyp. Rufe `matches()` nur fuer einen
   geeigneten Elementknoten auf.
2. Platziere den Guard innerhalb der Selektorverarbeitung. Ein Nicht-Element
   darf dadurch nicht aus dem gesamten Renderablauf ausgeschlossen werden.
3. Erhalte Callback-Verhalten und Reihenfolge fuer passende Elemente. Erweitere
   den bisher statischen Selector-Test um echte Expression- und Condition-Faelle.

**Regression und Abnahme**

- [ ] Registriere `Composer.customize("[data-probe]", () => {})`; `<span>{{1 + 1}}</span>` zeigt danach `2`, auch ohne Selektortreffer.
- [ ] Wechsle eine Condition bei registriertem Selektor von `true` auf `false` und zurueck; das Element erscheint, verschwindet und erscheint erneut.
- [ ] Treffende Elemente erhalten weiterhin ihren Callback; Textknoten und Marker erzeugen keinen `matches`-TypeError.

**Testansatz:** `test\composer_render_customize_selectors.html`,
`test\composer_render_condition.html`.
**Erledigt, wenn:** Custom-Selektoren Text- und Condition-Rendering nicht mehr
unterbrechen und ihre eigene Funktion erhalten bleibt.

### R02

**Renderkontexte bei verschachtelten und partiellen Iterationen erhalten**

**Prioritaet:** hoch | **Aufwand:** 5 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R05](#r05), [R10](#r10)
**Fundstellen:** `sources\composer.js:1273-1276, 1343-1344, 1363-1365, 2587-2601`

**Problem und Ziel:** Kind-Rendering leert den gemeinsamen Workspace, ohne den
Elternkontext wiederherzustellen. Partiell neu aufgebaute Iterationskinder
uebernehmen ausserdem ihren gespeicherten aeusseren Kontext nicht vollstaendig.
Initiales und partielles Rendering muessen dieselben Variablen sehen.

**Umsetzung**

1. Sichere Workspace und Iterationskontext beim Eintritt in jeden Renderaufruf.
   Stelle den vorherigen Zustand in einem `finally` wieder her; verwende darin
   keine Rueckgabe, die einen Fehler verdecken koennte.
2. Verwende bei partiellem Rendering den gespeicherten Elternkontext als Basis
   und ergaenze die lokalen Iterationsvariablen mit ihrer vorgesehenen Prioritaet.
3. Verhindere, dass Kindaufrufe gemeinsam referenzierte Kontextstrukturen ihrer
   Eltern oder Geschwister nachtraeglich veraendern.
4. Beziehe Shadowing, Fehlerpfade und spaeter aus der Queue verarbeitete
   Renderauftraege in dasselbe Kontextmodell ein.

**Reproduktionsaufbau**

```html
<section iterate="{{outer:['A']}}">
  <div iterate="{{inner:[1]}}" title="{{outer.item}}">
    <span>{{outer.item}}:{{inner.item}}</span>
  </div>
</section>
```

**Regression und Abnahme**

- [ ] Initial lauten `title` und Text `A` beziehungsweise `A:1`.
- [ ] Nach einem Renderaufruf nur fuer das innere `div` bleiben beide Werte korrekt.
- [ ] Drei Ebenen, gleichnamige lokale Variablen und mehrere Geschwister zeigen kein Scope-Leck.
- [ ] Nach einem Fehler im Kind koennen Eltern- und Geschwisterausdruecke wieder mit ihrem eigenen Kontext ausgewertet werden.

**Testansatz:** `test\composer_render_iterate.html`,
`test\composer_render_recursive.html`, `test\reactive_iterate.html`.
**Erledigt, wenn:** Jeder Renderaufruf seinen Aufrufkontext wiederherstellt und
neue Iterationskinder den vollstaendigen gueltigen Scope erhalten.

### R03

**Tag-Makros eindeutig von CSS-Selektoren unterscheiden**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R01](#r01)
**Fundstellen:** `sources\composer.js:149, 1152-1160`

**Problem und Ziel:** `PATTERN_CUSTOMIZE_SCOPE` hat keinen Anfangsanker.
Dadurch werden beispielsweise `a.foo`, `.foo` und `#foo` aufgrund ihres Endes
als Tag-Makros registriert. Nur ein vollstaendiger Tagname darf ein Makro sein.

**Umsetzung**

1. Begrenze die Tagname-Erkennung auf den gesamten Eingabestring.
2. Uebergib alle anderen Strings unverkuerzt an die CSS-Selektorverwaltung.
3. Behalte die bisherigen Regeln fuer gueltige Makronamen und deren
   Callback-Aufrufe bei; registriere nichts gleichzeitig in beiden Verwaltungen.

**Regression und Abnahme**

- [ ] `a.foo`, `.foo` und `#foo` loesen am jeweils passenden Element den Callback aus.
- [ ] Attributselektoren und kombinierte Selektoren bleiben CSS-Selektoren.
- [ ] Reine unterstuetzte Tagnamen funktionieren weiterhin als Makros.

**Testansatz:** `test\composer_render_customize_selectors.html`,
`test\composer_render_customize_macros.html`.
**Erledigt, wenn:** Insbesondere die in `manuals\markup.md` dokumentierte
Verwendung von `a.foo` funktioniert.

### R04

**Exklusive DOM-Ausgaben auch bei leeren Sammlungen leeren**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R05](#r05)
**Fundstellen:** `sources\composer.js:2386-2394`

**Problem und Ziel:** Der gemeinsame `output`-/`import`-Pfad entfernt bisherigen
Zielinhalt erst beim Anhaengen des ersten neuen Knotens. Eine leere Sammlung
laesst deshalb veraltete Ausgabe stehen. Auch null neue Knoten muessen eine
exklusive Ersetzung ausloesen.

**Umsetzung**

1. Erfasse die eingehenden Knoten vor dem Leeren stabil, falls eine lebende
   `NodeList` oder eine Sammlung aus dem Ziel selbst uebergeben wurde.
2. Leere bei exklusiver Ausgabe den Zielinhalt vor der Uebernahmeschleife.
3. Wende dieselbe Regel auf `Document`, `DocumentFragment` und `NodeList` an.
   Veraendere nicht versehentlich vorhandene nicht-exklusive Ausgabepfade.

**Regression und Abnahme**

- [ ] Auf ein Fragment mit `old` folgt ein leeres Fragment; das Ziel ist danach leer.
- [ ] Leere `NodeList` und ein geeignetes leeres `Document` leeren das Ziel sowohl ueber `output` als auch ueber `import`.
- [ ] Nichtleere Folgeausgabe, Reihenfolge und Uebernahme bereits vorhandener Knoten bleiben korrekt.

**Testansatz:** `test\composer_render_output.html`,
`test\composer_render_import.html`.
**Erledigt, wenn:** Keine leere exklusive DOM-Ausgabe alten Zielinhalt stehen
laesst.

### R05

**Iterationscontainer beim Wechsel auf null Durchlaeufe leeren**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R02](#r02), [R04](#r04)
**Fundstellen:** `sources\composer.js:2553-2573`

**Problem und Ziel:** Das Leeren der Iterationsausgabe liegt innerhalb von
`if (iterate)`. Der gueltige numerische Wert `0` ueberspringt diesen Block.
Ein leer gewordenes Ergebnis darf keine alten Zeilen behalten.

**Umsetzung**

1. Trenne die Entfernung alter Ausgabe vom Wahrheitswert des Iterators.
2. Erhalte Vorlage und Elternkontext, damit nach einer leeren Iteration erneut
   Zeilen aufgebaut werden koennen.
3. Behalte die bestehende Validierung ungueltiger Iteratoren und den
   vollstaendigen Neuaufbau gueltiger Iterationen bei.

**Regression und Abnahme**

- [ ] Bei `<ul iterate="{{row:count}}"><li>{{row.item}}</li></ul>` entfernt der Wechsel `2 -> 0` alle Zeilen und den Text `01`.
- [ ] Der anschliessende Wechsel `0 -> 2` erzeugt genau zwei korrekt gebundene Zeilen.
- [ ] Ein initialer Wert `0` und ein Wechsel von einem nichtleeren auf ein leeres Array funktionieren ebenfalls.

**Testansatz:** `test\composer_render_iterate.html`, `test\reactive_iterate.html`.
**Erledigt, wenn:** Leere Iterationen keine alten Zeilen hinterlassen und der
Container danach erneut verwendbar ist.

### R06

**Boolesche DOM-Properties typgetreu aktualisieren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R07](#r07), [R08](#r08), [R09](#r09)
**Fundstellen:** `sources\composer.js:2647-2678, 2942-2950`

**Problem und Ziel:** Der Ausdruckswert `false` wird vor der Property-Zuweisung
zum String `"false"`. Boolesche DOM-Setter interpretieren diesen nichtleeren
String als wahr. Attributdarstellung und Property-Wert muessen getrennt bleiben.

**Umsetzung**

1. Bewahre den Rohwert der Expression bis zur Property-Zuweisung auf. Erzeuge
   einen String nur fuer diejenigen Attributpfade, die Text benoetigen.
2. Setze boolesche Properties typgerecht und halte die zugehoerige
   Attributpraesenz entsprechend dem bestehenden Composer-Vertrag konsistent.
3. Stimme direkten Renderpfad und MutationObserver ab. Verhindere, dass die
   Property-Reflexion die beabsichtigte Normalisierung vorzeitig unkenntlich macht.
4. Behalte die Textsemantik normaler Attribute sowie von `aria-*` und `data-*`
   bei. Fuehre keine pauschale Truthiness-Konvertierung aller Werte ein.

**Regression und Abnahme**

- [ ] `disabled="{{false}}"` und `checked="{{false}}"` ergeben false-Properties und keine aktivierenden Attribute.
- [ ] Der Wechsel `false -> true -> false` funktioniert auch nach Observer-Verarbeitung.
- [ ] Ein normales `title` mit dem Wert `false` sowie `aria-*`-/`data-*`-Werte behalten ihre vorgesehene Textdarstellung; es entstehen keine Observer-Schleifen.

**Testansatz:** `test\composer_render_attributes.html`,
`test\reactive_attributes.html`.
**Erledigt, wenn:** Boolesche Property-Semantik nicht mehr von einer zuvor
erzeugten Stringdarstellung abhaengt.

### R07

**Falsy Modellwerte bei initialer Eingabebindung uebernehmen**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R06](#r06)
**Fundstellen:** `sources\composer.js:993-1002`

**Problem und Ziel:** Die initiale Uebertragung verlangt ein truthy
`meta.target`. Dadurch bleiben HTML-Vorgaben bestehen, obwohl das Modell
gueltige Werte wie `0`, `false` oder `""` enthaelt.

**Umsetzung**

1. Pruefe Vorhandensein und unterstuetzten Typ statt des Wahrheitswerts.
2. Uebertrage auch falsy primitive Werte ueber die vorhandenen
   Binding-Konvertierungen in das Eingabeelement.
3. Behandle fehlende Ziele, `null`, `undefined` und Objektbindungen weiterhin
   nach ihrem bisherigen Vertrag; verwechsle sie nicht mit gueltigen Leerwerten.

**Regression und Abnahme**

- [ ] Modellwert `zero:0` ersetzt ein initiales `value="99"`.
- [ ] Modellwert `off:false` deaktiviert einen initial gesetzten `checked`-Zustand.
- [ ] Modellwert `empty:""` ersetzt `value="fallback"`; ein fehlendes Modellziel erzeugt dagegen keine neue Bindung.

**Testansatz:** `test\composer_mount.html`,
`test\composer_mount_synchronization.html`, `test\composer_render_value.html`.
**Erledigt, wenn:** Die initiale Anzeige alle unterstuetzten primitiven
Modellwerte unabhaengig von ihrer Truthiness uebernimmt.

### R08

**Zielnamen fuer @-Attribute vor der Wertverzweigung bestimmen**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R06](#r06), [R09](#r09)
**Fundstellen:** `sources\composer.js:2664-2678`

**Problem und Ziel:** Bei `undefined` wird das `@`-Praefix nicht entfernt.
Der Code entfernt beispielsweise `@title` statt des zuvor erzeugten `title`
und adressiert auch die falsche Property.

**Umsetzung**

1. Fuehre Deklarationsname und realen DOM-Zielnamen getrennt.
2. Bestimme den Zielnamen vor allen Verzweigungen nach dem Expression-Ergebnis.
   Verwende ihn fuer Setzen, Entfernen und Property-Aktualisierung.
3. Erhalte die Expression-Deklaration fuer spaetere Updates und fuehre den
   vorgesehenen Property-Reset beim Entfernen aus.

**Regression und Abnahme**

- [ ] `@title="{{label}}"` erzeugt bei `label="first"` ein `title`; nach `label=undefined` ist dieses entfernt.
- [ ] Nach `label="second"` erscheint `title` erneut mit dem neuen Wert.
- [ ] Initiales `undefined` und der Property-Zustand funktionieren ohne versehentlich angelegte `@title`-Property.

**Testansatz:** `test\composer_render_attributes.html`,
`test\reactive_attributes_custom.html`.
**Erledigt, wenn:** Alle Schreib- und Entfernungspfade dasselbe reale Ziel
adressieren.

### R09

**Originalschreibweise dynamischer SVG-Attribute erhalten**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R06](#r06), [R08](#r08)
**Fundstellen:** `sources\composer.js:1984-1999, 2668`

**Problem und Ziel:** Das generelle Lowercasing beim Einlesen macht aus
`viewBox` den anderen SVG-Attributnamen `viewbox`. Die Originalexpression bleibt
stehen und der Browser erhaelt kein wirksames aktualisiertes `viewBox`.

**Umsetzung**

1. Speichere den originalen Namen fuer DOM-Schreibzugriffe. Verwende einen
   getrennten normalisierten Namen nur fuer interne Vergleiche.
2. Beruecksichtige den Originalnamen bei Setzen, Entfernen und erneutem Rendern
   sowie bei der `@`-Normalisierung.
3. Erhalte die HTML-Erkennung. Behandle SVG-Properties nicht pauschal als
   schreibbare HTML-Properties.

**Regression und Abnahme**

- [ ] `viewBox="{{'0 0 100 100'}}"` setzt das korrekte Attribut; `viewBox.baseVal.width` ist `100` und es entsteht kein zusaetzliches `viewbox`.
- [ ] Mehrfaches Aktualisieren und Entfernen dynamischer SVG-Attribute respektiert deren Schreibweise.
- [ ] Gewoehnliche HTML-Attribute und interne Composer-Attribute funktionieren unveraendert.

**Testansatz:** `test\composer_render_attributes.html`,
`test\reactive_attributes.html`.
**Erledigt, wenn:** Case-sensitive Attributidentitaet und browserseitige
Interpretation des Werts erhalten bleiben.

### R10

**Render-Queue durch genau einen FIFO-Drain verarbeiten**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R02](#r02)
**Fundstellen:** `sources\composer.js:1223-1232, 1701-1703`

**Problem und Ziel:** Parameterlose geplante Queue-Aufrufe konkurrieren mit
einem beim Unlock bereits entnommenen Auftrag. So wird aus `A,B,C` die
Startreihenfolge `A,C,B`. Die Entnahme muss einen einzigen Eigentuemer haben.

**Umsetzung**

1. Konsolidiere die Verwaltung von geplantem und laufendem Queue-Drain.
   Es darf nicht fuer jeden Lock-Konflikt ein konkurrierender Drain entstehen.
2. Entnimm Eintraege ausschliesslich im Drain. Die Lock-Freigabe plant
   Verarbeitung, reserviert aber keinen Auftrag vorab.
3. Haenge waehrend des Renderns eingehende Auftraege hinten an. Stelle auch
   nach einem Fehler Lock-Freigabe und geordneten Fortgang sicher.
4. Erhalte bestehende Zusammenfassungsregeln und Aufrufargumente.

**Regression und Abnahme**

- [ ] Fordere im Render-Start von A zuerst B und dann C an; die Starts erfolgen exakt in der Reihenfolge `A,B,C`.
- [ ] Ein waehrend B eingereihtes D ueberholt C nicht.
- [ ] Ein Fehler blockiert keine spaeteren Auftraege und fuehrt zu keiner unbeabsichtigten doppelten Ausfuehrung.

**Testansatz:** `test\composer_events_render.html`,
`test\composer_render_recursive.html`, `test\composer_render_lock_leak_1.html`.
**Erledigt, wenn:** Die verbleibenden Queue-Eintraege unter Beibehaltung der
Zusammenfassungsregeln in FIFO-Reihenfolge verarbeitet werden.

### R11

**Cache-Grenzen von historischen Render-Serials entkoppeln**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `aufloesung_caches`
**Fundstellen:** `sources\composer.js:1913-1916, 2917-2920, 3073-3078`

**Problem und Ziel:** `delete _render_meta[serial]` entfernt einen Eintrag,
verkleinert aber nicht das sparse Array. Dessen historische Laenge steuert
trotzdem `Expression.prune()` und `Scripting.prune()`. Bei konstantem aktivem
DOM darf die erlaubte Cache-Groesse nicht mit der Laufzeithistorie wachsen.

**Umsetzung**

1. Erfasse alle Anlage- und Freigabepfade von Render-Metadaten. Ermittle eine
   verlaessliche aktive Anzahl statt der hoechsten jemals vergebenen Serial.
2. Verwende diese Anzahl samt bisheriger Mindestgrenzen fuer die Prune-Aufrufe.
   Falls stattdessen eine unabhaengige begrenzte Cache-Policy gewaehlt wird,
   lege deren Grenze und Begruendung vor der Implementierung fest.
3. Sichere doppelte Freigaben sowie Condition- und Iterations-Lebenszyklen ab.
   Nummeriere keine Serials neu und leite aus dem Befund keinen allgemeinen
   DOM-Speicherverlust oder Renderer-Neuentwurf ab.

**Regression und Abnahme**

- [ ] Fuehre mindestens 25 und danach deutlich mehr Einfuege-/Render-/Entferne-Zyklen mit wechselnden Expressions und konstantem Rest-DOM aus.
- [ ] Erfasse nach abgeschlossenem Cleanup aktive Metadaten, Prune-Grenzen und reale Cache-Groessen; die Grenzen folgen nicht der historischen Arraylaenge.
- [ ] Wiederholtes Entfernen sowie Condition-Marker und Iterationskinder machen die aktive Anzahl weder negativ noch dauerhaft zu gross.

**Testansatz:** `test\composer_render_release.html`,
`test\benchmarks\composer_lifecycle_benchmark.html`.
**Erledigt, wenn:** Die Cache-Groessensteuerung an aktiven Bedarf oder eine
ausdruecklich begrenzte Policy gebunden ist.

### R12

**Reactive-Cache-Praesenz vom Wert undefined unterscheiden**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R15](#r15), [R42](#r42)
**Fundstellen:** `sources\reactive.js:299-307`

**Problem und Ziel:** Ein fehlender Eintrag liefert bei `cache.get(key)`
bereits `undefined`. Der Rekursionsschutz interpretiert dadurch die erste
Zuweisung von `undefined` faelschlich als bereits verarbeiteten Wert.

**Umsetzung**

1. Pruefe die Cache-Praesenz ausdruecklich vor dem Wertvergleich.
2. Leite die erste erfolgreiche Aenderung auf `undefined` in den normalen
   Benachrichtigungspfad.
3. Erhalte Rekursionsschutz und Batching tatsaechlich wiederholter Zuweisungen.

**Regression und Abnahme**

- [ ] Nach Anzeige von `Reactive({value:1})` und `value=undefined` verschwindet die alte `1` aus dem DOM.
- [ ] Mehrfaches Schreiben von `undefined` erzeugt keine Endlosschleife oder unnoetige Renderkaskade.
- [ ] Ein anschliessend definierter Wert wird wieder korrekt angezeigt.

**Testansatz:** `test\reactive_text.html`, `test\reactive_recursion.html`.
**Erledigt, wenn:** Ein fehlender Cache-Eintrag keine erste gueltige
Aenderungsbenachrichtigung unterdrueckt.

### R13

**Geerbte Getter mit passendem Reactive-Receiver auswerten**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R14](#r14)
**Fundstellen:** `sources\reactive.js:195-200, 234-237`

**Problem und Ziel:** Nur eigene Getter erhalten den Proxy als Empfaenger.
Prototyp-Getter lesen ihre Felder am Originalobjekt, sodass die inneren
Abhaengigkeiten nicht registriert werden. Abgeleitete Anzeigen bleiben veraltet.

**Umsetzung**

1. Loese Accessors entlang der Prototypkette oder ueber ein geeignetes
   `Reflect.get` mit explizitem Receiver auf.
2. Fuehre bei proxyfaehigen Anwendungsobjekten die im Getter gelesenen
   Modellfelder durch den Proxy und registriere diese Abhaengigkeiten.
3. Verwirf eine relevante Abhaengigkeit nicht allein deshalb, weil der Getter
   geerbt ist. Stimme Ausnahmen fuer native Internal-Slot-Objekte mit R14 ab.

**Regression und Abnahme**

- [ ] Eine Klasseninstanz mit `n=1` und `get doubled(){return this.n*2;}` zeigt nach `n=2` den Wert `4`.
- [ ] Eigene Getter, mehrstufige Prototypketten und verschachtelte Getter funktionieren.
- [ ] Ein ungelesenes Feld wird nicht allein durch die Korrektur zur Abhaengigkeit des Getters.

**Testansatz:** `test\reactive_objects.html`, `test\reactive_recipients.html`.
**Erledigt, wenn:** Geerbte Anwendungs-Getter ihre tatsaechlich gelesenen
Modellabhaengigkeiten erfassen und ihre Verbraucher aktualisieren.

### R14

**Native Receiver und verpflichtende Proxy-Invarianten respektieren**

**Prioritaet:** mittel | **Aufwand:** 5 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R13](#r13), [R42](#r42)
**Fundstellen:** `sources\reactive.js:173-221`

**Problem und Ziel:** Rekursive Proxifizierung aller Objekte erzeugt
ungeeignete Receiver fuer native Methoden und andere Werte als die von festen
Properties zwingend verlangten Originalwerte. Beides kann regulaere Lesezugriffe
mit `TypeError` abbrechen.

**Entscheidung vor Umsetzung:** Lege fest, welche Objekttypen rekursiv reaktiv
sind und welche als opaque, unveraenderte Nutzwerte gelten. Empfohlen ist eine
gezielte Behandlung nicht proxyfaehiger nativer Typen, nicht der beilaufige
Aufbau einer neuen reaktiven Map-/Set-API. Versprich keine Beobachtung interner
Mutationen, wenn diese nicht implementiert wird.

**Umsetzung**

1. Konsolidiere vorhandene DOM-Ausnahmen und neue Typregeln zu einer
   nachvollziehbaren Behandlung von Objekten und Deskriptoren.
2. Halte `Date`, `Map` und vergleichbare Internal-Slot-Typen mit gueltigem
   Receiver nutzbar, sowohl als Root als auch als verschachtelten Wert.
3. Gib fuer nichtkonfigurierbare, nichtschreibbare Datenproperties exakt den
   hinterlegten Wert zurueck. Beachte auch andere Get-Trap-Invarianten.
4. Erhalte stabile Proxy-Identitaeten und vorhandene WeakMap-Zuordnungen fuer
   weiterhin reaktive Objekte. Dokumentiere die Grenzen.

**Regression und Abnahme**

- [ ] `Reactive(new Date(0)).getTime()` ergibt `0`; `Reactive(new Map([["a",1]])).get("a")` ergibt `1`.
- [ ] Bei `Object.freeze({nested:{}})` liefert der Proxy fuer `nested` exakt den Descriptor-Wert, ohne Invariantenfehler.
- [ ] Verschachtelte native Werte, feste Accessors ohne Getter und normale reaktive Objekte/Arrays sind abgedeckt.

**Testansatz:** `test\reactive_objects.html`, `test\reactive_recipients.html`.
**Dokumentation:** `manuals\reactive.md`.
**Erledigt, wenn:** Unterstuetzte Zugriffe native Receiver-Anforderungen und
Proxy-Invarianten respektieren und die Reaktivitaetsgrenzen klar beschrieben sind.

### R15

**Setter-Ausnahmen unveraendert an den Aufrufer weitergeben**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `fehlererkennung` | **Abstimmung:** [R12](#r12), [R42](#r42)
**Fundstellen:** `sources\reactive.js:299-332`

**Problem und Ziel:** `return true` im `finally` verdeckt Setter-Ausnahmen.
Teilweise wird sogar eine Aenderung gemeldet, obwohl die Zuweisung fehlgeschlagen
ist. Fehler und Erfolgszustand muessen der echten Schreiboperation entsprechen.

**Umsetzung**

1. Entferne Rueckgaben aus dem `finally`; beschraenke es gegebenenfalls auf
   Cleanup, das die urspruengliche Ausnahme nicht ersetzt.
2. Aktualisiere Cache und Benachrichtigungen erst nach erfolgreicher Zuweisung.
3. Liefere im Set-Trap den tatsaechlichen Erfolg der Schreiboperation. Melde
   abgewiesene Writes nicht aus Bequemlichkeit als erfolgreich.

**Regression und Abnahme**

- [ ] Ein Setter mit `throw new Error("reject")` gibt denselben Fehler an den Aufrufer des Proxys weiter.
- [ ] Ein ohne Modellaenderung abgewiesener Write erzeugt keine Erfolgsbenachrichtigung.
- [ ] Nach dem Fehler funktionieren erfolgreiche Writes und Rekursionsschutz weiterhin.

**Testansatz:** `test\reactive_objects.html`, `test\reactive_recursion.html`.
**Erledigt, wenn:** Keine Setter-Ausnahme unterdrueckt und keine fehlgeschlagene
Zuweisung als erfolgreiche Aenderung gemeldet wird.

### R16

**JavaScript-Literale vor Operator- und Makro-Umschreibungen schuetzen**

**Prioritaet:** mittel | **Aufwand:** 8 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R18](#r18), [R19](#r19)
**Fundstellen:** `sources\expression.js:203-204, 217-219, 256-264`;
`sources\scripting.js:110-124, 154-158`

**Problem und Ziel:** Regex-Literale und verschachtelte Templates werden
nicht durchgaengig von echtem Code getrennt. Operator-Aliase veraendern
Regex-Inhalte; Text wird als Makro behandelt oder ein echtes nachfolgendes Makro
uebersehen. Weitere isolierte String-Ersetzungen reichen hier nicht aus.

**Umsetzung**

1. Erfasse die vorhandenen Parserphasen beider APIs und ihre Umschreibungen.
   Entwickle eine konsistente lexikalische Erkennung, die beide Sprachzugaenge
   aufeinander abstimmt.
2. Unterscheide Strings, Escapes, Kommentare, Regex-Literale einschliesslich
   Zeichenklassen sowie Template-Text. Unterscheide Regex von Division anhand
   des Tokenkontexts.
3. Fuehre fuer Template-Interpolationen einen Stack verschachtelter Code- und
   Template-Ebenen. Interpolationscode und Literaltext sind nicht gleichzusetzen.
4. Wende Aliase, Tolerant-Umschreibungen und Makros nur in dafuer erlaubten
   Codebereichen an. Erhalte Literalinhalte unveraendert.
5. Pruefe echte Makros nach Literalen, Parse-Caches und Fehlerdiagnosen.
   Vermeide einen Parser-Sonderfall nur fuer die vier Review-Beispiele.

**Verbindliche Beispielergebnisse**

```javascript
Expression.eval({}, "{{ /and/.test('and') }}");      // true
Expression.eval({}, "{{ /(?:ab)+/.test('abab') }}"); // true
Scripting.eval({}, 'const r=/["]/; const answer=42; #export answer;');
// answer wird mit dem Wert 42 exportiert.
Scripting.eval({}, "const x = `a ${`#use missing`} z`; x");
// Ergebnis: "a #use missing z"
```

**Regression und Abnahme**

- [ ] Alle vier Beispiele behalten ihre JavaScript-Semantik.
- [ ] Escaped Slashes, Regex-Zeichenklassen, Kommentare, Division und mehrere Template-Ebenen sind abgedeckt.
- [ ] Echte Makros nach Literalen werden weiterhin erkannt; Makrotext innerhalb von Literalen bleibt unveraendert.
- [ ] Bestehende Alias-/Makro-Beispiele sowie ungueltige und unvollstaendige Literale behalten eine nachvollziehbare Diagnose.

**Testansatz:** `test\expression_syntax.html`, `test\expression_parse.html`,
`test\scripting_syntax.html`, `test\scripting_eval.html`.
**Dokumentation:** `manuals\expression.md`, `manuals\scripting.md`.
**Erledigt, wenn:** Umschreibungen nur echte, erlaubte Codebereiche treffen und
gueltige Literalinhalte nicht mehr veraendern.

### R17

**Interne Scripting-Bindungen vom Anwendungskontext trennen**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R16](#r16), [R52](#r52)
**Fundstellen:** `sources\scripting.js:249-256`

**Problem und Ziel:** Kontextschluessel werden als Funktionsparameter
erzeugt; anschliessend kommen interne Parameter gleichen Namens hinzu.
Schon ein unbenutzter Kontextwert `script` kann einen Syntaxfehler ausloesen.

**Umsetzung**

1. Trenne die internen Bindungen `script`, `_import`, `_export`, `_use` und
   `_tolerate` kollisionsfrei von den Bindungen des Anwendungskontexts.
2. Entferne oder benenne gueltige Anwendungsvariablen nicht still um. Ein
   Ausdruck muss weiterhin den uebergebenen Kontextwert lesen koennen.
3. Stimme erzeugten Funktionscode, Makroaufrufe und Cache-Identitaeten auf
   dieselbe Bindungsstrategie ab.

**Regression und Abnahme**

- [ ] `Scripting.run({script:"Anwendungsdaten"}, "1 + 2")` ergibt `3`.
- [ ] `Expression.eval({script:"Anwendungsdaten"}, "{{1 + 2}}")` ergibt ebenfalls `3`.
- [ ] Alle fuenf kollidierenden Namen sind als Anwendungsdaten lesbar, waehrend zugehoerige Makros weiterhin ihre internen Helfer verwenden.

**Testansatz:** `test\scripting_eval.html`, `test\expression_eval.html`.
**Erledigt, wenn:** Kein gueltiger Kontextname doppelte Parameter erzeugt oder
durch interne Hilfsbindungen semantisch verloren geht.

### R18

**Gesamten tolerierten Ausdruck im Callback klammern**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R16](#r16)
**Fundstellen:** `sources\scripting.js:135-138, 148-150`

**Problem und Ziel:** Ohne Ausdrucksklammern werden Kommaoperanden aus dem
tolerierten Callback verschoben und Objektliterale als Arrow-Funktionskoerper
interpretiert. Das Makro muss den gesamten eingeschlossenen Ausdruck auswerten.

**Umsetzung**

1. Erzeuge den Callback in der Form `() => (<Ausdruck>)`.
2. Korrigiere alle Erzeugungspfade des Tolerant-Makros, nicht nur den ersten
   auftretenden Beispielpfad.
3. Gleiche das Verhalten mit der bereits geklammerten Expression-Uebersetzung
   ab und erhalte verschachtelte tolerierte Ausdruecke.

**Regression und Abnahme**

- [ ] `Scripting.eval({}, "(? 1, 2)")` liefert `2`.
- [ ] `Scripting.eval({}, "(? 1, doesNotExist)")` wirft keinen `ReferenceError` nach aussen.
- [ ] `Scripting.eval({}, "(? {answer:42})")` liefert das Objekt mit `answer=42`; Verschachtelungen bleiben korrekt.

**Testansatz:** `test\scripting_syntax.html`, `test\scripting_eval.html`,
`test\expression_syntax.html`.
**Erledigt, wenn:** Die urspruengliche Ausdrucksklammerung einschliesslich
Kommaoperator und Objektliteral innerhalb der Toleranzgrenze erhalten bleibt.

### R19

**Gemischte Expression-Fragmente explizit als Text verknuepfen**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R16](#r16)
**Fundstellen:** `sources\expression.js:145-155, 162-164`

**Problem und Ziel:** Fragmente werden mit `+` verbunden. Vor dem ersten
String kann dadurch numerisch addiert werden. Mixed-Ausdruecke muessen Text
zusammensetzen; eine einzelne reine Expression muss ihren Originaltyp behalten.

**Umsetzung**

1. Unterscheide Mixed-Modus und reinen Einzelausdruck bei der Codeerzeugung.
2. Konvertiere beziehungsweise verknuepfe im Mixed-Modus bewusst textuell,
   bevor numerische Addition entstehen kann.
3. Erhalte die vorgesehene Behandlung von `undefined` und anderen Leerwerten.
   Fuehre keine globale String-Konvertierung reiner Expressions ein.

**Regression und Abnahme**

- [ ] `{{1}}{{2}} items` ergibt in `Expression.eval` und einem `title` exakt `"12 items"`.
- [ ] Ein einzelnes `{{1 + 2}}` bleibt die Zahl `3`, ein einzelnes `{{false}}` bleibt boolean `false`.
- [ ] Leere Strings, `undefined` sowie Text vor und nach Expressions sind konsistent behandelt.

**Testansatz:** `test\expression_eval.html`, `test\expression_parse.html`,
`test\composer_render_attributes.html`.
**Erledigt, wenn:** Gemischte Textausdruecke konkatenieren, ohne die
Typsemantik einzelner Expressions zu veraendern.

### R20

**Expression-Fehlerkontext ohne Mutation fremder Fehler anreichern**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `fehlererkennung` | **Abstimmung:** [R40](#r40)
**Fundstellen:** `sources\expression.js:70-76`

**Problem und Ziel:** Die Fehlerbehandlung schreibt in `error.message`.
Bei einer `DOMException` oder einem eingefrorenen Error kann gerade diese
Anreicherung einen neuen Fehler ausloesen und die urspruengliche Ursache verdecken.

**Umsetzung**

1. Erzeuge einen eigenen Fehlerwert mit Expression-Kontext, statt das fremde
   Fehlerobjekt zu veraendern.
2. Erhalte den Originalfehler als Ursache oder Referenz. Nutze dafuer einen
   mit der bestehenden Kompatibilitaetsgrenze vertraeglichen Mechanismus.
3. Behalte den Vertrag von `Expression.eval` bei, einen Fehlerwert
   zurueckzugeben. Behandle auch geworfene primitive Werte sicher.

**Regression und Abnahme**

- [ ] `document.querySelector("[")` in einer Expression liefert einen nutzbaren Fehlerwert statt eines neuen Anreicherungs-TypeError.
- [ ] `Object.freeze(new Error("failure"))` bleibt unveraendert und als Originalursache erhalten.
- [ ] Normale Errors und geworfene primitive Werte behalten Diagnose und Expression-Bezug.

**Testansatz:** `test\expression_errors.html`, `test\expression_eval.html`.
**Erledigt, wenn:** Die Fehlerbehandlung auch bei schreibgeschuetzten
Fremdobjekten ihren eigenen Rueckgabevertrag erfuellt.

### R21

**Namespace-Wurzeln ausserhalb interner Hilfsscopes aufloesen**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R22](#r22), [R45](#r45), [R52](#r52)
**Fundstellen:** `sources\extension.js:381-389`

**Problem und Ziel:** Das direkte `eval` in `_populate(namespace, level)`
sieht die gleichnamigen lokalen Parameter statt der gesuchten globalen
Bindungen. Globale Namen duerfen nicht mit der Implementierung kollidieren.

**Umsetzung**

1. Entkopple globale Namensaufloesung vom lexikalischen Scope der
   Hilfsfunktion.
2. Erhalte neben `window`-Properties auch globale `let`-/`const`-Bindungen.
   Ein blosses `window[name]` ist deshalb kein vollstaendiger Ersatz.
3. Behalte Namensvalidierung und die definierte Behandlung nicht existierender
   Wurzeln bei.

**Regression und Abnahme**

- [ ] Nach `window.level={child:{}}` liefert `Namespace.lookup("level")` genau dieses Objekt.
- [ ] `Namespace.use("namespace.child")` erzeugt `namespace.child`, nicht `window.child`.
- [ ] Globale `var`-, `let`- und `const`-Objekte funktionieren auch bei kollidierenden Hilfsnamen; teste echte Browser-Script-Scopes.

**Testansatz:** `test\extension_namespace.html`,
`test\extension_namespace_modules.html`.
**Erledigt, wenn:** Interne Variablen keine gueltige globale Namespace-Bindung
verdecken.

### R22

**Namespace-Wurzeltreffer ohne globalen Fallback weiterverarbeiten**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R21](#r21), [R45](#r45)
**Fundstellen:** `sources\extension.js:222-236, 381-384`

**Problem und Ziel:** Ein falsy Wurzelwert wird mit dem Zustand einer noch
nicht bestimmten Wurzel verwechselt. Ein `continue` umgeht zudem die normalen
Root-Pruefungen. Nachfolgende Namen werden dann unzulaessig erneut global gesucht.

**Umsetzung**

1. Verwalte ausdruecklich, ob die Wurzel bereits aufgeloest wurde.
2. Wende vor dem naechsten Schleifendurchlauf auch auf den Root-Treffer die
   normalen Container- und Abbruchpruefungen an.
3. Beende einen nicht fortsetzbaren Pfad nach bestehendem Vertrag. Weiche bei
   `null`, `false`, `0`, `""` oder einem unzulaessigen DOM-Root nicht auf Globals aus.

**Regression und Abnahme**

- [ ] Bei `reviewRoot=null` und vorhandenem globalem `reviewChild` liefert `lookup("reviewRoot.reviewChild")` niemals dieses fremde Kind; `exists` meldet false.
- [ ] Wiederhole den Fall mit `false`, `0` und `""`.
- [ ] DOM-Wurzeln werden gemaess Vertrag abgelehnt; normale verschachtelte Objektpfade funktionieren.

**Testansatz:** `test\extension_namespace.html`,
`test\composer_object_lookup.html`.
**Erledigt, wenn:** Eine bereits aufgeloeste Wurzel fuer nachfolgende Segmente
nicht nochmals durch eine globale Suche ersetzt wird.

### R23

**Verschachtelte Routing-Views entlang ihrer Composite-Hierarchie lokalisieren**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R26](#r26), [R28](#r28)
**Fundstellen:** `sources\routing.js:294-300`

**Problem und Ziel:** Ungeklammerte Selektoralternativen heben die beabsichtigte
Hierarchie auf. Direkte Kindselektoren beruecksichtigen zudem normale
Markup-Zwischenelemente nicht. `Routing.locate(true)` muss den tiefsten passenden
Composite erkennen und nur den Rest als Datenparameter liefern.

**Umsetzung**

1. Gruppiere Alternativen je Hierarchieebene korrekt oder verwende vorhandene
   DOM-/Composite-Metadaten fuer eine eindeutige Aufloesung.
2. Lasse normale Markup-Wrapper zwischen Composites zu, ohne dadurch
   gleichnamige Views aus fremden Zweigen einzubeziehen.
3. Trenne den tatsaechlich lokalisierten View-Pfad von verbleibenden
   Datenparametern.

**Regression und Abnahme**

- [ ] Bei aktiven verschachtelten Composites A/B und Route `#a#b` ist `locate` gleich `#a#b`; `b` wird nicht als Datenparameter geliefert.
- [ ] Dasselbe gilt mit `div`-Wrappern sowie gleichnamigen Composites in anderen Zweigen.
- [ ] `#a#b#parameter` lokalisiert den vorhandenen View und liefert nur `parameter` als Daten.

**Testansatz:** `test\routing_route.html`, `test\routing_active_on.html`,
`test\reactive_routing.html`.
**Erledigt, wenn:** Die Lokalisierung der realen Composite-Hierarchie statt
zufaellig passenden Selektoralternativen folgt.

### R24

**Synchrones Routing.forward auf ein gemeinsames effektives Ziel ausrichten**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R25](#r25), [R27](#r27), [R28](#r28), [R30](#r30)
**Fundstellen:** `sources\routing.js:154-157, 359-370`

**Problem und Ziel:** Das kuenstliche Ereignis enthaelt das Forward-Ziel,
waehrend Freigabe und weitere Verarbeitung noch die Browseradresse auswerten.
Dadurch bleibt die alte Ansicht aktiv. Alle Teilnehmer muessen waehrend einer
Navigation denselben effektiven Pfad verwenden.

**Umsetzung**

1. Fuehre einen normalisierten effektiven Zielpfad fuer die laufende
   Navigation und stelle ihn den betroffenen Routing-Pfaden bereit.
2. Richte Forward-Ereignis, interne History, Routing-Location, `approve`,
   `permit` und Rendering auf dieses Ziel aus.
3. Erhalte die dokumentierte synchrone Ausfuehrung von `forward`. Ersetze sie
   nicht durch einen blossen Hash-Write mit spaeterem nativen Ereignis.
4. Gleiche relative Ziele, Root und spaetere native Navigationen mit diesem
   Zustand ab. Verwechsle interne Routing-History nicht ungeprueft mit der
   Browser-History.

**Regression und Abnahme**

- [ ] Von `#a#b` aus macht `Routing.forward("#c")` C bereits im synchronen Ablauf zum effektiven Ziel.
- [ ] Routing-Location, interne History, Freigabe und sichtbare Ansicht stimmen anschliessend ueberein.
- [ ] `route` bleibt hashgetrieben; relative Forwards und anschliessendes Zurueck/Vorwaerts verlieren keinen Zustand.

**Testansatz:** `test\routing_route.html`, `test\routing_approve.html`.
**Dokumentation:** `manuals\routing.md`.
**Erledigt, wenn:** Forward sein Ziel synchron erreicht und kein beteiligter
Routing-Pfad weiterhin mit dem alten Ziel arbeitet.

### R25

**String-Rueckgaben von permit als Weiterleitung ausfuehren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `navigation` | **Voraussetzung:** [R24](#r24)
**Fundstellen:** `sources\routing.js:206-210`

**Problem und Ziel:** Die Implementierung akzeptiert nur `approval === true`,
obwohl ein String laut Vertrag ein Weiterleitungsziel ist. Ein String darf
nicht nur den bisherigen View ausblenden und die Navigation stehen lassen.

**Umsetzung**

1. Unterscheide `undefined`, `true`, `false` und String gemaess dem
   dokumentierten Permission-Vertrag.
2. Normalisiere String-Ziele ueber die vorhandenen Path-Regeln und fuehre die
   Weiterleitung ueber den in R24 konsolidierten Navigationspfad aus.
3. Erkenne normalisierte Selbstweiterleitungen. Verhindere auch unendliche
   Kaskaden durch wiederkehrende Redirect-Zyklen.

**Regression und Abnahme**

- [ ] Bei `a.permit(){return "#c";}` wird A nicht angezeigt, C aktiviert und der Navigationszustand auf C ausgerichtet.
- [ ] Relative Ziele und normalisierte Selbstweiterleitung funktionieren ohne Endlosschleife.
- [ ] `undefined`, `true`, `false` und die Freigaben uebergeordneter Views behalten ihr dokumentiertes Verhalten.

**Testansatz:** `test\routing_approve.html`, `test\routing_route.html`.
**Erledigt, wenn:** Der String-Vertrag aus `manuals\routing.md` als echte
Weiterleitung umgesetzt ist.

### R26

**Gueltige Routing-Segmente CSS-sicher verarbeiten**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R23](#r23)
**Fundstellen:** `sources\routing.js:294-298`

**Problem und Ziel:** Gueltige Pfadsegmente werden unveraendert in dynamische
Attributselektoren eingebaut. Ein erlaubter Backslash kann dadurch einen
`querySelector`-Syntaxfehler erzeugen.

**Umsetzung**

1. Erfasse alle Routing-Stellen, die Pfadsegmente in CSS-Selektoren einsetzen.
2. Verwende kontextgerechtes CSS-Escaping oder vergleiche Composite-Identitaeten
   ohne dynamische CSS-Werte.
3. Erhalte die Path-Grammatik. Verbiete keine bisher gueltigen Datenparameter
   nur deshalb, weil der aktuelle Selektorbau sie nicht beherrscht.

**Regression und Abnahme**

- [ ] `Routing.route("#a#\\")` verarbeitet den Backslash als Parameter ohne CSS-Syntaxfehler.
- [ ] Weitere nach der tatsaechlichen Path-Grammatik erlaubte CSS-Sonderzeichen sind abgedeckt.
- [ ] Normale View-Namen und Datenparameter behalten ihre exakte Identitaet.

**Testansatz:** `test\routing_route.html`, `test\routing_path_normalize.html`.
**Erledigt, wenn:** Kein gueltiger Routing-Pfad einen ungueltigen dynamischen
CSS-Selektor erzeugt.

### R27

**Native und synthetische Routing-Ereignisse eindeutig zuordnen**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R24](#r24), [R30](#r30)
**Fundstellen:** `sources\routing.js:125-135`

**Problem und Ziel:** Die per Microtask geplante Interrupt-Pruefung laeuft vor
nativen Hashchange-Tasks und dispatcht einen noch ausstehenden Wechsel erneut.
Interceptor-Seiteneffekte duerfen pro tatsaechlichem Uebergang nicht doppelt laufen.

**Umsetzung**

1. Unterscheide ausstehende, verarbeitete und ueberholte Navigationen anhand
   ihres konkreten Uebergangs, nicht nur anhand des aktuellen Hashs.
2. Entscheide ueber einen gegebenenfalls erforderlichen Fallback erst,
   nachdem native Ereignisse eine tatsaechliche Ausfuehrungsgelegenheit hatten.
3. Dedupliziere native und synthetische Verarbeitung desselben Uebergangs.
   Unterdruecke dabei keine spaetere echte Navigation auf dieselbe Route.
4. Stimme schnelle Folgerouten, Forward und Interceptor-Redirect miteinander ab.

**Regression und Abnahme**

- [ ] Von `#a` aus unmittelbar `route("#b")` und `route("#c")` aufrufen; `a -> b` und `b -> c` werden jeweils genau einmal beobachtet.
- [ ] Schnelle Folgen mit Forward, Redirect und Browser-Zurueck erzeugen keine doppelten Seiteneffekte.
- [ ] Eine spaetere echte erneute Navigation nach `#b` wird weiterhin verarbeitet.

**Testansatz:** `test\routing_route.html`, `test\routing_interceptors.html`.
**Erledigt, wenn:** Die Ereigniszuordnung doppelte Verarbeitung verhindert,
ohne regulaere Navigationen zu verlieren.

### R28

**Hashlose Zustaende vor jeder Routing-Verarbeitung als Root normalisieren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R23](#r23), [R24](#r24), [R30](#r30)
**Fundstellen:** `sources\routing.js:248-249, 295, 336-347`

**Problem und Ziel:** Aktives Routing bedeutet nicht, dass die Browseradresse
bereits einen Hash besitzt. Initialisierung und Browser-Zurueck koennen deshalb
`null` an `split` oder `startsWith` weiterreichen.

**Umsetzung**

1. Normalisiere einen fehlenden Hash am Eingang der gemeinsamen
   Pfadverarbeitung auf den bestehenden Root-Wert.
2. Wende dies auf `Routing.locate` und alte/neue Ereignispfade vor jeder
   Stringoperation und jedem Interceptor-Matching an.
3. Behandle Initialisierung, hashlose History-Eintraege und expliziten Root
   nach derselben effektiven Pfadsemantik.

**Regression und Abnahme**

- [ ] Ein vor Runtime-Start registrierter Render-End-Listener kann bei hashfreier URL `locate(true)` aufrufen.
- [ ] Browser-Zurueck auf einen hashfreien `pushState`-Eintrag funktioniert auch mit einem String-Interceptor.
- [ ] Fehlender Hash und expliziter Root ergeben denselben effektiven Root-Zustand ohne Null-Dereferenz.

**Testansatz:** `test\routing_active_on.html`, `test\routing_interceptors.html`.
**Erledigt, wenn:** Regulaere hashfreie Lebenszykluszustaende keine
Pfadoperation mehr mit `null` erreichen.

### R29

**RegExp-Interceptor-Matching von lastIndex entkoppeln**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R30](#r30)
**Fundstellen:** `sources\routing.js:350-352`

**Problem und Ziel:** `RegExp.test()` veraendert bei `g` und `y` den
`lastIndex`. Wiederverwendete Interceptor-Patterns ueberspringen dadurch
abwechselnd passende Ziele. Jede Pruefung muss unabhaengig sein.

**Umsetzung**

1. Beginne jedes Routing-Matching bei einem definierten `lastIndex`.
2. Sichere und restauriere erforderlichenfalls den Zustand des uebergebenen
   RegExp oder matche mit einer unabhaengigen Instanz.
3. Wende die zustandsunabhaengige Regel auf normale, globale und sticky
   Patterns an, ohne unbeabsichtigte Seiteneffekte fuer den Aufrufer.

**Regression und Abnahme**

- [ ] `/^#a/g` trifft nacheinander `#a#1`, `#a#2` und `#a#3`.
- [ ] Abwechselnd passende/unpassende Ziele, `g`/`y` und ein vorher veraenderter `lastIndex` beeinflussen spaetere Ergebnisse nicht.
- [ ] Patterns ohne `g` oder `y` behalten ihr Verhalten.

**Testansatz:** `test\routing_interceptors.html`.
**Erledigt, wenn:** Das Matchergebnis ausschliesslich von Pattern und Ziel,
nicht von frueheren Pruefungen abhaengt.

### R30

**Interceptor-Ziel nach einer Weiterleitung aktualisieren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `navigation` | **Abstimmung:** [R24](#r24), [R27](#r27), [R28](#r28), [R29](#r29)
**Fundstellen:** `sources\routing.js:337-355`

**Problem und Ziel:** Nach `location.replace()` im ersten Interceptor nutzen
spaetere Interceptors noch den alten `newHash`. Matching und Callback-Argumente
widersprechen damit dem bereits geaenderten Ziel und dem dokumentierten Vertrag.

**Umsetzung**

1. Bestimme und normalisiere nach jedem Callback das effektive Ziel neu.
2. Verwende dieses Ziel sowohl fuer nachfolgendes Matching als auch fuer
   deren Callback-Argumente.
3. Falls intern ein Durchgang neu gestartet werden muss, erhalte den
   Registrierungsablauf und wiederhole keine bereits ausgefuehrten Seiteneffekte.
4. Behalte `false` als expliziten Abbruch bei und stimme nachfolgende native
   Hashchange-Ereignisse mit der Deduplizierung aus R27 ab.

**Regression und Abnahme**

- [ ] Nach Redirect von `#old` auf `#new` sieht der folgende allgemeine Interceptor sofort `#new` als Ziel.
- [ ] Ein nachfolgender, ausschliesslich zu `#new` passender Interceptor wird beruecksichtigt.
- [ ] Mehrere Redirects und explizites `false` erzeugen weder veraltete Zielargumente noch doppelte Seiteneffekte.

**Testansatz:** `test\routing_interceptors.html`, `test\routing_route.html`.
**Erledigt, wenn:** Nachfolgende Interceptors das potenziell veraenderte Ziel
gemaess `manuals\routing.md` erhalten.

### R31

**DataSource-Caches mit vollstaendigen Ressourcenidentitaeten adressieren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R32](#r32), [R34](#r34), [R35](#r35), [R43](#r43)
**Fundstellen:** `sources\datasource.js:250-263, 344-348`

**Problem und Ziel:** `hashCode()` ist keine eindeutige Ressourcenidentitaet.
Beispielsweise koennen `Aa.xml` und `BB.xml` denselben Schluessel erzeugen.
Ein Cache-Treffer darf nie das Dokument einer anderen Ressource liefern.

**Umsetzung**

1. Adressiere den Fetch-Cache mit vollstaendigen normalisierten
   Ressourcenadressen statt ausschliesslich abgeleiteten Hashwerten.
2. Bilde Collection-Schluessel eindeutig und strukturiert aus Collector und
   geordneten Eingaben. Eine mehrdeutige Verkettung ist kein Ersatz fuer den Hash.
3. Halte Fetch- und Collection-Identitaeten getrennt oder eindeutig typisiert.
4. Erhalte Wiederverwendung identischer Ressourcen und unabhaengige Klone.
   Stimme die Aufloesung mit Sprache und Kontextnormalisierung ab.

**Regression und Abnahme**

- [ ] Lade `Aa.xml` und `BB.xml` mit verschiedenen Inhalten und kollidierenden Hashes; beide werden angefordert und korrekt geliefert.
- [ ] Collections mit kollidierenden Einzelhashes, unterschiedlicher Reihenfolge oder anderem Collector bleiben unterscheidbar.
- [ ] Ein wiederholter identischer Abruf nutzt den Cache, liefert aber einen unabhaengigen Klon.

**Testansatz:** `test\datasource_locator.html`, `test\datasource_collect.html`.
**Erledigt, wenn:** Verschiedene normalisierte Ressourcen- oder
Collection-Identitaeten keinen falschen Cache-Treffer erzeugen.

### R32

**Sprachabhaengige Ressourcen in die Collection-Identitaet aufnehmen**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Voraussetzung:** [R31](#r31)
**Fundstellen:** `sources\datasource.js:344-348, 365`

**Problem und Ziel:** `collect()` verwendet die angeforderten Locators ohne
deren sprachabhaengige Ressourcenaufloesung. Nach einem Sprachwechsel kann die
Collection daher Daten der vorherigen Sprache liefern.

**Umsetzung**

1. Nimm die aktive Sprache oder vorzugsweise die vollstaendig aufgeloesten
   Ressourcenidentitaeten in den Collection-Key auf.
2. Beruecksichtige weiterhin Collector, Eingabereihenfolge und XPath-Anteile.
3. Behandle explizite sprachunabhaengige Ressourcen und den Rueckwechsel zu
   einer zuvor verwendeten Sprache konsistent.

**Regression und Abnahme**

- [ ] `collect("xml:/item")` liefert nach `localize("en")` Englisch und nach `localize("de")` Deutsch.
- [ ] Der Rueckwechsel auf `en` liefert wieder Englisch und darf einen passenden alten Cache-Eintrag nutzen.
- [ ] Eine Mischung expliziter und sprachabhaengiger Locators liefert je Sprache die richtige Kombination.

**Testansatz:** `test\datasource_collect.html`, `test\datasource_locales.html`.
**Erledigt, wenn:** `collect()` und `fetch()` nach einem Sprachwechsel
dieselbe sprachliche Ressourcenaufloesung verwenden.

### R33

**XPath-Dokumentknoten in eine zulaessige Ergebnisrepraesentation ueberfuehren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches`
**Fundstellen:** `sources\datasource.js:287-306`

**Problem und Ziel:** XPath `/` liefert einen Dokumentknoten, der nicht direkt
als Kind eines `collection`-Elements eingefuegt werden darf. Gueltige
XPath-Ergebnisse brauchen eine DOM-konforme, dokumentierte Darstellung.

**Entscheidung vor Umsetzung:** Lege die konkrete Darstellung des
Dokumentknotens fest. Empfohlen ist eine ausdrueckliche Abbildung innerhalb des
bestehenden `NodeList`-Vertrags, beispielsweise ein `document`-Wrapper mit
importierten zulaessigen Kindknoten. Entscheide bewusst ueber DocumentType,
Kommentare und Processing Instructions. Aendere den oeffentlichen Rueckgabetyp
nicht stillschweigend.

**Umsetzung**

1. Behandle `DOCUMENT_NODE` im Ergebnis-Mapping ausdruecklich und erzeuge
   die abgestimmte Repraesentation.
2. Klone oder importiere die erforderlichen Knoten in das Ergebnisdokument,
   ohne gecachte Quelldokumente zu veraendern.
3. Erhalte die bestehenden Abbildungen fuer Element-, Attribut- und Textknoten
   sowie fuer skalare XPath-Ergebnisse.

**Regression und Abnahme**

- [ ] `DataSource.fetch("xml:/item.xml?/")` funktioniert ohne `HierarchyRequestError` und liefert exakt die dokumentierte Struktur.
- [ ] XML mit Kommentaren, Processing Instructions und DocumentType entspricht der festgelegten Abbildung.
- [ ] Gewoehnliche Knoten-XPaths, skalare Ergebnisse und Folgeabrufe des Quelldokuments bleiben korrekt.

**Testansatz:** `test\datasource_locator.html`, `test\datasource_collect.html`.
**Dokumentation:** `manuals\datasource.md`.
**Erledigt, wenn:** XPath-Dokumentresultate ohne DOM-Hierarchieverletzung in
einer eindeutig beschriebenen Form nutzbar sind.

### R34

**Backslashes vor Ressourcenaufloesung normalisieren und Kontextgrenze pruefen**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R31](#r31), [R35](#r35)
**Fundstellen:** `sources\locator.js:32, 43-52`;
`sources\datasource.js:245-256`

**Problem und Ziel:** Locator behandelt Backslashes nicht als Separatoren,
die spaetere HTTP-URL-Verarbeitung jedoch schon. Dadurch kann die tatsaechlich
angeforderte Ressource ausserhalb des zugesicherten Anwendungskontexts liegen.
Es geht um den Ressourcenvertrag, nicht um eine Sandbox fuer Anwendungsscripts.

**Umsetzung**

1. Vereinheitliche oder verwerfe literale und dekodierte Backslashes vor der
   Punktsegmentaufloesung entsprechend dem festgelegten Locator-Vertrag.
2. Stimme die Behandlung mehrfach kodierter Separatoren mit R35 ab.
3. Pruefe die endgueltige browsernormalisierte Ressourcenadresse vor dem
   Request gegen den Anwendungskontext.
4. Vergleiche Kontextgrenzen segmentgenau: `/app2` ist nicht Teil von `/app`.
   Melde ungueltige Ziele mit Bezug zum ausloesenden Locator.

**Regression und Abnahme**

- [ ] Unter `/app/index.html` loest `xml:/..%5Coutside.xml` keinen Request nach `/outside.xml` aus.
- [ ] Literale Backslashes, `%5C`, mehrfach kodierte Varianten, gemischte Separatoren und Punktsegmente sind abgedeckt.
- [ ] Gueltige Ressourcen innerhalb von `/app`, Kontext `/` und aehnliche Praefixe wie `/app2` werden korrekt unterschieden.

**Testansatz:** `test\locator_canonical_path.html`,
`test\datasource_locator.html`.
**Dokumentation:** `manuals\datasource.md`.
**Erledigt, wenn:** Auch die tatsaechlich angeforderte URL die zugesicherte
Kontextpfad-Normalisierung einhaelt.

### R35

**Prozentliterale bei Locator-Dekodierung erhalten**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R34](#r34)
**Fundstellen:** `sources\locator.js:34-40, 118-119`

**Problem und Ziel:** Wiederholtes `decodeURIComponent()` interpretiert ein
aus `%25` korrekt entstandenes Prozentzeichen erneut als Escape. Ein gueltiger
Locator kann dadurch mit `URIError` scheitern.

**Umsetzung**

1. Trenne Pfad und Query vor der Dekodierung und verarbeite sie nach ihrem
   jeweiligen Vertrag.
2. Dekodiere die Query, ohne entstandene Prozentliterale erneut zu
   interpretieren.
3. Erhalte fuer Pfade gezielt die bestehenden Anforderungen an mehrfach
   kodierte Separatoren. Ersetze sie nicht durch unkontrolliertes rekursives
   Dekodieren beliebiger Inhalte.
4. Melde urspruenglich ungueltige Escapes weiterhin eindeutig. Unterdruecke
   `URIError` nicht pauschal als vermeintliche Korrektur.

**Regression und Abnahme**

- [ ] `xml:/item?contains(., "100%25")` liefert das XPath `contains(., "100%")` ohne `URIError`.
- [ ] Kodierte Prozentliterale in Dateinamen, Unicode und kodierte Query-Zeichen bleiben verwendbar.
- [ ] Bestehende Mehrfachkodierungsfaelle fuer Separatoren bleiben normalisiert; tatsaechlich fehlerhafte Escapes bleiben Fehler.

**Testansatz:** `test\locator_canonical_path.html`,
`test\datasource_locator.html`.
**Dokumentation:** `manuals\datasource.md`.
**Erledigt, wenn:** Gueltige Prozentliterale erhalten bleiben, ohne die
Kontextpfad-Normalisierung zu schwaechen.

### R36

**Doppelte Message-Keys im flachen Speicher erkennen**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R50](#r50)
**Fundstellen:** `sources\messages.js:65-68`

**Problem und Ziel:** `Namespace.exists("Messages", key)` interpretiert
gepunktete Keys als Pfad, obwohl `Messages` sie als flache Properties speichert.
Ein Duplikat fuehrt deshalb zu `Cannot redefine property` und stoppt weitere Labels.

**Umsetzung**

1. Pruefe Duplikate mit einer robusten Own-Property-Pruefung im flachen
   `Messages`-Objekt.
2. Ueberspringe ein Duplikat unter Beibehaltung des ersten Werts und verarbeite
   die nachfolgenden Labels weiter.
3. Halte flachen Speicher und Objektbaum konsistent. Stimme reservierte Namen
   und Key-Validierung mit R50 ab.

**Regression und Abnahme**

- [ ] Ein globales und ein spaeteres Modul-Label `shared.title` behalten den ersten Wert ohne redefine-TypeError.
- [ ] Ein neues Label hinter diesem Duplikat wird geladen.
- [ ] Einfache/gepunktete Duplikate sowie Sprach- und Modulladevorgaenge halten dieselbe Regel ein.

**Testansatz:** `test\messages_locales.html`,
`test\messages_locales_module.html`.
**Erledigt, wenn:** Der Vertrag erstes Vorkommen gewinnt eingehalten wird,
ohne den verbleibenden Ladevorgang abzubrechen.

### R37

**Message-Platzhalter einmalig mit literalen Daten ersetzen**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches`
**Fundstellen:** `sources\messages.js:82-85`

**Problem und Ziel:** Replacement-Strings werten Dollar-Metazeichen aus.
Zudem werden eingesetzte Daten erneut durch spaetere Platzhalter-Ersetzungen
und Bereinigung veraendert. Werte muessen Daten bleiben, keine zweite Vorlage.

**Umsetzung**

1. Erkenne die Platzhalter ausschliesslich in der urspruenglichen Vorlage
   und ersetze sie in genau einem Durchlauf.
2. Verwende eine Replacement-Funktion, die die vorgesehenen Argumentwerte
   zurueckgibt und fehlende Argumente nach Vertrag entfernt.
3. Fuehre danach keine Platzhalter-Bereinigung mehr ueber eingesetzte Daten aus.

**Regression und Abnahme**

- [ ] `Hello {0}!` mit `"$&"` ergibt exakt `Hello $&!`.
- [ ] `Hello {0} {1}!` mit `"{1}"` und `"WORLD"` ergibt exakt `Hello {1} WORLD!`.
- [ ] Wiederholte/fehlende Platzhalter, mehrstellige Indizes, leere Werte und weitere Dollar-Sequenzen funktionieren.

**Testansatz:** `test\messages_locales.html`.
**Erledigt, wenn:** Keine eingesetzten Daten als Replacement-Syntax oder neue
Message-Vorlage interpretiert werden.

### R38

**Promise-Tests erst nach einem eindeutigen Abschluss bewerten**

**Prioritaet:** mittel | **Aufwand:** 5 SP | **Status:** erledigt
**Paket:** `fehlererkennung` | **Voraussetzung:** [R39](#r39), [R40](#r40)
**Abstimmung:** [R41](#r41), [R49](#r49)
**Fundstellen:** `sources\test.js:370-404`

**Problem und Ziel:** Der Runner ignoriert den Rueckgabewert einer Testfunktion.
Ein `async`-Test wird mit Rueckgabe des Promise bereits erfolgreich abgeschlossen,
obwohl spaeter eine Assertion scheitert. Ein solcher Lauf darf niemals falsch
gruen erscheinen.

**Entscheidung:** Promise-/Thenable-Rueckgaben werden unterstuetzt. Die
Testfunktion bleibt bis zur Erfuellung oder Ablehnung Teil des laufenden Tasks;
spaete Reaktionen nach Timeout oder Interrupt werden kontrolliert entgegengenommen.

**Umsetzung**

1. Erfasse den Rueckgabewert und warte gemaess Entscheidung Thenables ab oder
   lehne sie diagnostisch ab.
2. Fuehre synchronen Abschluss, Promise-Erfuellung/-Ablehnung und Timeout durch
   den idempotenten Abschlussmechanismus aus R39.
3. Halte den Queue-Lock bis zum wirksamen Abschluss. Spaete Reaktionen nach
   Timeout oder Interrupt duerfen weder erneut abschliessen noch einen Folgetask
   veraendern.
4. Wende Fehlernormalisierung und `expected` auch auf asynchrone Fehler an.
   Nimm Rejections kontrolliert entgegen, auch wenn der Task bereits beendet ist.

**Regression und Abnahme**

- [x] Ein `async`-Test mit verzoegertem `Assert.fail("ASYNC_FAIL")` meldet niemals `faults:0`.
- [x] Resolved/rejected Promises, eigene Thenables und ein werfender `then`-Getter werden korrekt behandelt.
- [x] Ein nie aufgeloestes Promise mit Timeout sowie spaete Erfuellung/Ablehnung erzeugen hoechstens einen wirksamen Abschluss und keine unbehandelte Rejection.
- [x] Folgetests starten erst nach Abschluss; erwartete asynchrone Fehler werden korrekt bewertet.
- [x] Thenables werden unterstuetzt, und spaete Rejections bleiben auch nach Timeout oder Interrupt behandelt.

**Testansatz:** `test\test_events.html`, `test\test_assert_message.html`;
zusaetzlich unabhaengige Beobachtung nach dem gemeinsamen Testverfahren.
**Dokumentation:** `manuals\test.md`.
**Erledigt, wenn:** Kein Promise-Test vorzeitig als erfolgreich gilt und jeder
gestartete Task hoechstens einmal wirksam abgeschlossen wird.

### R39

**Testabschluss und Timeout ueber Zustand statt Fehlermeldung steuern**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** erledigt
**Paket:** `fehlererkennung` | **Abstimmung:** [R38](#r38), [R40](#r40), [R41](#r41), [R49](#r49)
**Fundstellen:** `sources\test.js:400-404`

**Problem und Ziel:** Das Praefix `Timeout occurred` gilt als internes
Kennzeichen eines bereits gemeldeten Timeouts. Ein fachlicher Fehler mit
diesem Text wird deshalb nicht gezaehlt. Diagnose und Steuerzustand muessen
getrennt sein.

**Umsetzung**

1. Fuehre einen taskbezogenen Abschluss-/Timeout-Zustand ein, der nicht aus
   einer Meldung abgeleitet wird.
2. Koordiniere Fehlerzaehlung, `RESPONSE` und Lock-Freigabe ueber einen
   einmaligen Abschlussweg.
3. Entferne Textvergleiche, die einen vermeintlich bereits behandelten
   internen Timeout erkennen sollen.

**Regression und Abnahme**

- [x] `throw new Error("Timeout occurred in business operation")` erzeugt eine Fehler-RESPONSE und `faults:1`.
- [x] Ein interner Timeout mit kurz darauf eintreffendem normalen Abschluss wird nicht doppelt gezaehlt.
- [x] Andere Fehlertexte aendern die Bewertung Fehler/Erfolg nicht.

**Testansatz:** `test\test_events.html`, `test\test_assert_message.html`;
beobachte die Ereignisse und Zaehler auch von ausserhalb des Test-Frameworks.
**Erledigt, wenn:** Ausschliesslich expliziter Task-Zustand Abschluss und
Deduplizierung steuert.

### R40

**Geworfene Werte unabhaengig vom Error-Typ als Fehler erfassen**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** erledigt
**Paket:** `fehlererkennung` | **Abstimmung:** [R20](#r20), [R38](#r38), [R39](#r39), [R48](#r48)
**Fundstellen:** `sources\test.js:373-378, 400-404`

**Problem und Ziel:** Nur `instanceof Error` erhoeht den Fehlerzaehler.
Gleichzeitig versucht der Catch-Block, beliebige geworfene Werte zu beschreiben.
Ein `throw null` kann so eine Folgeexception und trotzdem falschen Erfolg erzeugen.

**Umsetzung**

1. Erfasse separat, dass eine Exception auftrat. Nutze weder Typ noch
   Truthiness ihres Werts als Kennzeichen dafuer.
2. Normalisiere den Wert fuer Status und Anzeige, ohne primitive, fremde oder
   eingefrorene Objekte zu mutieren.
3. Erhalte den Originalwert fuer `expected`-Konstruktor-/RegExp-Pruefungen.
   Ein Diagnose-Wrapper darf diese Semantik nicht versehentlich veraendern.
4. Leite Fehlerzaehlung aus dem bewerteten Testergebnis ab, nicht aus
   `instanceof Error`.

**Regression und Abnahme**

- [x] `throw {message:"BOOM"}`, `null`, `undefined`, `false`, `0` und ein String werden jeweils als unerwarteter Fehler gezaehlt.
- [x] Ein eingefrorener Error und ein Error aus einem anderen Frame ergeben eine Diagnose ohne Folgeexception.
- [x] Passende/unpassende `expected`-Regeln und eine fehlende erwartete Exception werden korrekt bewertet.

**Testansatz:** `test\test_assert_message.html`, `test\test_events.html`;
verwende die unabhaengige Beobachtung des Test-Frameworks.
**Erledigt, wenn:** Jede unerwartete Exception genau einmal gezaehlt wird und
ihre Normalisierung keinen falschen Erfolg erzeugt.

### R41

**Pause und Interrupt vom Eventstatus und Worker-Lebenszyklus trennen**

**Prioritaet:** mittel | **Aufwand:** 5 SP | **Status:** erledigt
**Paket:** `fehlererkennung` | **Voraussetzung:** [R38](#r38), [R39](#r39)
**Abstimmung:** [R49](#r49)
**Fundstellen:** `sources\test.js:132-133, 369-406, 449-455`

**Problem und Ziel:** Neue Events ueberschreiben den Suspend-Status.
Nach Interrupt greifen bereits eingeplante Callbacks auf einen geloeschten
oder inzwischen ersetzten Worker zu. Pause und Abbruch muessen dauerhafte,
laufbezogene Zustaende sein.

**Entscheidung:** Suspend aus `PERFORM` haelt den noch nicht gestarteten Test bis
Resume zurueck. Ein bereits laufender synchroner Funktionskoerper kann nicht
praemptiv angehalten werden; bereits gestartete asynchrone Tests und ihre
Timeout-Uhr laufen waehrend der Pause weiter. Die RESPONSE darf waehrenddessen
eintreffen, der naechste Task startet jedoch erst nach Resume.

**Umsetzung**

1. Trenne `paused` und `interrupted` vom zuletzt gemeldeten Ereignis.
2. Binde geplante Callbacks und Promise-Abschluesse an die Identitaet des
   Workers beziehungsweise Testlaufs.
3. Pruefe nach externen Listenern, Monitoren und Testfunktionen erneut
   Worker-Gueltigkeit und Pausenzustand.
4. Invalidiere bei Interrupt ausstehende Arbeit und Timer. Spaete alte
   Callbacks duerfen auch einen neu gestarteten Lauf nicht beeinflussen.
5. Setze bei Resume genau den pausierten Lauf fort, ohne Tasks doppelt zu starten.

**Regression und Abnahme**

- [x] Suspend im ersten `PERFORM` verhindert die Ausfuehrung bis Resume; anschliessend laeuft jeder Task einmal.
- [x] Interrupt in `PERFORM` und innerhalb einer Testfunktion verursacht keine Worker-TypeErrors und startet keine Folgetests.
- [x] Die spaete Reaktion eines unterbrochenen Promise-Tests beeinflusst einen sofort gestarteten neuen Lauf nicht.
- [x] Suspend/Resume aus `RESPONSE` sowie Timeout waehrend Pause folgen der dokumentierten Entscheidung.

**Testansatz:** `test\test_events.html`; Ereignisse, Laufidentitaeten und
spaete Callbacks zusaetzlich unabhaengig beobachten.
**Dokumentation:** `manuals\test.md`.
**Erledigt, wenn:** Pause bis Resume wirksam bleibt und Interrupt alte Arbeit
unwirksam macht, ohne einen sauberen Neustart zu verhindern.

### R42

**Strukturelle Reactive-Aenderungen an registrierte Verbraucher melden**

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** offen
**Paket:** `rendering` | **Voraussetzung:** [R15](#r15)
**Abstimmung:** [R12](#r12), [R14](#r14)
**Fundstellen:** `sources\reactive.js:173-179, 278-334`

**Problem und Ziel:** Nur Get-/Set-Traps sind implementiert. Loeschen und
Umdefinieren veraendern das Modell ohne passende Benachrichtigung.
Insbesondere ein Verbraucher eines entfernten Array-Indexes liest nicht
zwangslaeufig `length` und bleibt deshalb veraltet.

**Umsetzung**

1. Implementiere geeignete `deleteProperty`- und `defineProperty`-Traps,
   die die tatsaechlichen Reflect-Ergebnisse und Proxy-Invarianten respektieren.
2. Melde nur erfolgreiche relevante Struktur-/Descriptor-Aenderungen ueber
   den bestehenden Benachrichtigungsmechanismus.
3. Ermittle Verbraucher auch fuer einen Schluessel, der nach der Operation
   nicht mehr existiert.
4. Vermeide doppelte Meldungen im Zusammenspiel von `set` und `defineProperty`.
   Beruecksichtige entfernte Array-Indizes auch bei direkter Laengenkuerzung.

**Regression und Abnahme**

- [ ] Nach Anzeige von `data[1]` aus `Reactive(["A","B"])` entfernt `data.pop()` auch das alte `B` im DOM.
- [ ] `Object.defineProperty(model,"value",{value:"new"})` aktualisiert eine zuvor angezeigte Ausgabe `old`.
- [ ] `delete`, `splice` und direktes Verkuerzen von `length` aktualisieren betroffene Index-Verbraucher.
- [ ] Fehlgeschlagene Operationen auf festen Deskriptoren melden keinen Erfolg; normale Sets rendern nicht doppelt.

**Testansatz:** `test\reactive_objects.html`, `test\reactive_text.html`,
`test\reactive_iterate.html`.
**Erledigt, wenn:** Erfolgreiche strukturelle Aenderungen alle betroffenen
bestehenden Verbraucher erreichen, ohne Invarianten oder Batching zu brechen.

### R43

**XML-Parsergebnis vor dem Cache-Eintrag validieren**

**Prioritaet:** mittel | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R31](#r31)
**Fundstellen:** `sources\datasource.js:250-262`

**Problem und Ziel:** HTTP 200 wird ungeprueft als erfolgreich geparstes XML
behandelt. `responseXML=null` wird gecacht und verursacht danach bei jedem
Abruf einen `clone`-TypeError, selbst wenn die Ressource inzwischen repariert ist.

**Umsetzung**

1. Validiere `responseXML` vor Cache-Schreibzugriff und Klonen als verwendbares
   XML-Dokument.
2. Erkenne browsertypische Parserfehler-Dokumente gezielt. Lehne nicht
   pauschal beliebige Nutzdatenelemente mit einem aehnlichen Namen ab.
3. Melde einen Parsefehler mit Ressourcenbezug und hinterlasse keinen
   positiven Cache-Eintrag.
4. Erlaube einen erneuten Request auf dieselbe inzwischen korrigierte Ressource.

**Regression und Abnahme**

- [ ] HTTP 200 mit `<root>` erzeugt eine ausdrueckliche XML-Ladediagnose statt eines `null.clone`-TypeError.
- [ ] Liefert dieselbe URL danach gueltiges XML, erfolgt ein zweiter Request und der Abruf gelingt.
- [ ] Leere Antworten, Parserfehlerdarstellungen der Browser und regulaeres XML werden passend behandelt.

**Testansatz:** `test\datasource_locator.html`,
`test\composer_render_import_datasource.html`.
**Erledigt, wenn:** Nur gueltige Dokumente positiv gecacht werden und ein
Parsefehler spaetere Abrufe nicht dauerhaft beschaedigt.

### R44

**XHR-Listener mit aktuellen Request-Metadaten versorgen**

**Prioritaet:** niedrig | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `sprache_api`
**Fundstellen:** `sources\composer.js:2745-2769, 2781-2788`

**Problem und Ziel:** Einmalig registrierte Listener schliessen die
Metadaten des ersten `open()` ein. Bei Wiederverwendung derselben XHR-Instanz
melden spaetere Abschlussereignisse daher noch die erste URL.

**Umsetzung**

1. Pflege aktuelle Request-Metadaten pro XHR-Instanz in der vorhandenen
   Zuordnung.
2. Lasse die einmal registrierten Listener beim Ereignis die passende
   aktuelle Zuordnung lesen statt die erste Closure-Version.
3. Pruefe die Reihenfolge von `open`, implizitem Abort und Metadatenwechsel.
   Ein Abschluss des alten Requests darf nicht irrtuemlich die neuen Daten erhalten.

**Regression und Abnahme**

- [ ] Eine XHR-Instanz fordert nacheinander `/first.txt` und `/second.txt` an; START und LOAD tragen jeweils die richtige URL.
- [ ] Fehler-, Abort- und Loadend-Pfade bei Wiederverwendung sind korrekt zugeordnet.
- [ ] Mehrfaches `open` registriert keine doppelten Listener; verschiedene Instanzen bleiben getrennt.

**Testansatz:** `test\composer_events_xmlhttprequest.html`.
**Erledigt, wenn:** Jedes XHR-Ereignis die Metadaten seines Requests meldet.

### R45

**Objekt-only-Signaturen von Namespace und Object ohne Pfad zulassen**

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R21](#r21), [R22](#r22)
**Fundstellen:** `sources\extension.js:193-213, 259-262, 472-495`

**Problem und Ziel:** Ein fehlender Restpfad wird als ungueltige leere
Namespace-Ebene analysiert. Die dokumentierten Aufrufe nur mit einem
Root-Objekt sollen aber die Wurzel liefern beziehungsweise deren Existenz bestaetigen.

**Umsetzung**

1. Erkenne die Objekt-only-Signatur vor der Pfadzerlegung.
2. Gib bei gueltigem Root-Objekt fuer `lookup` genau dieses Objekt und fuer
   `exists` den Wert `true` zurueck.
3. Korrigiere Namespace- und Object-Varianten gemeinsam. Interpretiere
   ausdruecklich ungueltige Pfadargumente nicht pauschal als fehlenden Pfad.

**Regression und Abnahme**

- [ ] `Namespace.lookup(root)` und `Object.lookup(root)` liefern fuer `root={}` exakt dasselbe uebergebene Objekt.
- [ ] `Namespace.exists(root)` und `Object.exists(root)` liefern `true`.
- [ ] Root mit gueltigem/ungueltigem Pfad und unzulaessige Root-Typen behalten ihre Vertragsbehandlung.

**Testansatz:** `test\extension_namespace.html`,
`test\composer_object_lookup.html`.
**Erledigt, wenn:** Alle vier Objekt-only-Aufrufe ohne
`Invalid namespace at level 2` funktionieren.

### R46

**Gemeinsamen Pfad in Path.matches symmetrisch begrenzen**

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `sprache_api`
**Fundstellen:** `sources\routing.js:527-534`

**Problem und Ziel:** Passt eine kuerzere Eingabe vollstaendig, wird der
laengere erste Pfad ungekuerzt geliefert. Das gemeinsame Pfadergebnis haengt
dadurch von der Reihenfolge der Argumente ab.

**Umsetzung**

1. Baue die Ausgabe ausschliesslich aus tatsaechlich verglichenen,
   uebereinstimmenden Segmenten auf.
2. Begrenze sie durch die gemeinsame Laenge beider Eingaben und erhalte
   bestehende Root-/Normalisierungsregeln.
3. Verwende keine reine Zeichenpraefix-Pruefung statt der Segmentsemantik.

**Regression und Abnahme**

- [ ] `Path.matches("#a#b","#a")` und `Path.matches("#a","#a#b")` ergeben beide `"#a"`.
- [ ] Identische Pfade, Root und Abweichungen im ersten oder spaeteren Segment sind abgedeckt.
- [ ] `#a` und `#ab` gelten nicht allein wegen ihres Zeichenpraefixes als gleiches Segment.

**Testansatz:** `test\routing_path_normalize.html`.
**Erledigt, wenn:** Das Ergebnis symmetrisch und nie laenger als die wirklich
gemeinsame Segmentfolge ist.

### R47

**Symbol-Werte in der aktivierten Test-Console sicher formatieren**

**Prioritaet:** niedrig | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R51](#r51)
**Fundstellen:** `sources\test.js:624-628`

**Problem und Ziel:** Die implizite Buffer-Konvertierung wirft bei Symbolen.
Ein eigentlich gueltiger Console-Aufruf erreicht deshalb weder die normale
Ausgabe noch alle Listener. Zusaetzliches Logging darf diesen Aufruf nicht brechen.

**Umsetzung**

1. Verwende fuer den Buffer eine ausdrueckliche geeignete String-Konvertierung.
2. Reiche die Originalargumente unveraendert an native Console und bestehende
   Listener weiter.
3. Fuehre alle von `Test.activate()` umschlossenen Console-Methoden durch
   denselben sicheren Formatierungspfad.

**Regression und Abnahme**

- [ ] Nach `Test.activate()` wirft `console.log(Symbol("x"))` nicht; der Buffer enthaelt eine lesbare Symbol-Darstellung.
- [ ] Mehrere Argumente mit String, Symbol, `null` und `undefined` funktionieren.
- [ ] Native Ausgabe und Listener erhalten weiterhin die vorgesehenen Aufrufe und Originalargumente.

**Testansatz:** `test\test_assert_message.html`, `test\test_events.html`;
Console und Listener auch unabhaengig vom betroffenen Wrapper beobachten.
**Erledigt, wenn:** Symbol-Argumente gueltige Console-Aufrufe nicht mehr
unterbrechen.

### R48

**Fehlermeldung im Standardmonitor tatsaechlich trimmen**

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `fehlererkennung` | **Abstimmung:** [R40](#r40)
**Fundstellen:** `sources\test.js:293-299`

**Problem und Ziel:** Der Monitor interpoliert die Funktion `.trim`, statt
sie aufzurufen. Statt `BOOM` erscheint eine Funktionsdarstellung.
Die Ausgabe muss den bereinigten Meldungstext oder den Ersatztext verwenden.

**Umsetzung**

1. Rufe `String(...).trim()` tatsaechlich auf.
2. Bestimme erst anhand des bereinigten Ergebnisses, ob der Ersatztext fuer
   eine leere Meldung erforderlich ist.
3. Stimme die Eingabedaten mit R40 ab. Beschraenke diese Korrektur auf die
   Darstellung und veraendere nicht nebenbei Zaehler oder Monitor-Lifecycle.

**Regression und Abnahme**

- [ ] Ein Fehler `BOOM` erscheint als `BOOM`, nicht als `function trim()`.
- [ ] Fuehrende und nachfolgende Leerzeichen werden entfernt.
- [ ] Eine leere oder reine Whitespace-Meldung verwendet den vorgesehenen Ersatztext.

**Testansatz:** `test\test_assert_message.html`; die reale Monitorausgabe
unabhaengig erfassen.
**Erledigt, wenn:** Der Standardmonitor Text und niemals die trim-Funktion ausgibt.

### R49

**Timeout-Zaehler vor dem RESPONSE-Snapshot aktualisieren**

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `fehlererkennung` | **Abstimmung:** [R38](#r38), [R39](#r39), [R41](#r41)
**Fundstellen:** `sources\test.js:335-339, 393-398`

**Problem und Ziel:** Beide Timeout-Pfade erzeugen den Status vor dem
Inkrement von `queue.faults`. Der RESPONSE-Snapshot widerspricht dadurch dem
bereits enthaltenen Fehler und dem spaeteren FINISH-Zaehler.

**Umsetzung**

1. Aktualisiere den Fehlerzaehler vor `Test.status()` und `EVENT_RESPONSE`
   in beiden Timeout-Pfaden.
2. Verankere diese Reihenfolge gegebenenfalls zentral im Abschlussmechanismus
   aus R39.
3. Stelle sicher, dass konkurrierende Timeout-Erkennung und normaler
   Abschluss insgesamt nur einmal zaehlen.

**Regression und Abnahme**

- [ ] Ein synchroner Test mit `timeout:1` und etwa 10 ms Laufzeit liefert bereits in RESPONSE `faults:1`.
- [ ] Ein timerbasierter Timeout eines ausstehenden Tasks meldet ebenfalls den aktuellen Zaehler.
- [ ] RESPONSE und FINISH stimmen ueberein; ein spaeter Abschluss erhoeht den Zaehler nicht erneut.

**Testansatz:** `test\test_events.html`; die Snapshots von aussen vergleichen.
**Erledigt, wenn:** Jeder Timeout-RESPONSE den bereits verbuchten Fehler enthaelt.

### R50

**Message-Key-Vertrag und Kollisionen explizit behandeln**

**Prioritaet:** niedrig | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R36](#r36)
**Fundstellen:** `sources\messages.js:54-68, 80-86`

**Problem und Ziel:** Nicht passende Keys werden still verworfen.
`populate` kollidiert ausserdem mit der eingebauten Methode, sodass flacher
Zugriff und Objektbaum verschiedene Dinge liefern. Jeder Key braucht eine
definierte Darstellung oder eine ausdrueckliche Ablehnungsdiagnose.

**Entscheidung vor Umsetzung:** Lege zulaessige Segmente und reservierte Namen
fuer beide Zugriffsformen fest. Als begrenzte Korrektur empfiehlt sich die
diagnostizierte Ablehnung unvereinbarer Keys. Sollen beliebige flache Keys
unterstuetzt werden, muessen Daten und Hilfsmethoden kollisionsfrei getrennt
werden; dieser API-Umbau ist gesondert abzustimmen und zu schaetzen.

**Umsetzung**

1. Validiere Keys zentral vor Aenderungen an `Messages` und `messages`.
2. Erkenne reservierte Hilfsnamen und nicht darstellbare Baumsegmente
   ausdruecklich.
3. Melde Ablehnungen mit Key und Ressourcen-/Modulbezug. Hinterlasse keine
   nur teilweise installierten Labels in einer der beiden Darstellungen.
4. Erhalte die Duplikatregel aus R36 und dokumentiere, wie das Laden nach
   einem ungueltigen Eintrag fortgesetzt oder beendet wird.

**Regression und Abnahme**

- [ ] `foo-bar` und `populate` werden entweder konsistent in beiden Zugriffsformen unterstuetzt oder ausdruecklich diagnostiziert.
- [ ] Kein zugelassener Key fehlt still oder liefert gleichzeitig eine Hilfsfunktion und einen abweichenden Labeltext.
- [ ] Gueltige gepunktete Keys, Duplikate und Labels hinter einem ungueltigen Eintrag folgen dem festgelegten Ladevertrag.

**Testansatz:** `test\messages_locales.html`,
`test\messages_locales_module.html`.
**Dokumentation:** `manuals\message.md`.
**Erledigt, wenn:** Key-Darstellung und Fehlerverhalten eindeutig, konsistent
und nachvollziehbar sind.

### R51

**Optionale Parent-Console-Weiterleitung gegen Origin-Sperren absichern**

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R47](#r47)
**Fundstellen:** `sources\test.js:629-634`

**Problem und Ziel:** In einem Cross-Origin-Frame wirft bereits das Lesen von
`parent.console` einen `SecurityError`. Eine optionale Weiterleitung darf
dadurch keinen gewoehnlichen lokalen Console-Aufruf unterbrechen.

**Umsetzung**

1. Sichere nur den optionalen Zugriff auf die Parent-Console gezielt gegen
   den erwarteten Origin-Zugriffsfehler ab.
2. Fuehre lokale Ausgabe, Buffer und Listener unabhaengig von der
   Parent-Erreichbarkeit aus.
3. Verschlucke andere unerwartete Fehler nicht in einem breiten Catch.
   Vermeide eine rekursive Console-Diagnose aus dem Weiterleitungscode selbst.
4. Dokumentiere die nicht verfuegbare Cross-Origin-Weiterleitung als bewusste
   Grenze der optionalen Funktion.

**Regression und Abnahme**

- [ ] Eine Seite von Origin A bettet die Runtime von Origin B ein; nach `Test.activate()` wirft `console.log("child output")` im Frame nicht.
- [ ] Lokale Ausgabe, Buffer und Listener bleiben im Frame funktionsfaehig.
- [ ] Same-Origin-Weiterleitung funktioniert weiter; Top-Level-Aufrufe erzeugen keine Weiterleitungsrekursion.

**Testansatz:** `test\test_events.html`; fuer den Cross-Origin-Fall einen
kontrollierten Aufbau mit zwei lokalen Origins und unabhaengiger Beobachtung nutzen.
**Dokumentation:** `manuals\test.md`.
**Erledigt, wenn:** Ein unzugaenglicher Parent keine gueltigen lokalen
Console-Aufrufe beeintraechtigt.

### R52

**Jede Export-Namespace-Ebene als Container validieren**

**Prioritaet:** niedrig | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `sprache_api` | **Abstimmung:** [R17](#r17), [R21](#r21), [R22](#r22)
**Fundstellen:** `sources\scripting.js:289-306`

**Problem und Ziel:** `_export()` prueft vorhandene Namespace-Ebenen nicht
auf ihre Eignung als Container. Im nicht-strikten Helfer kann ein Write auf
einen primitiven Wert wirkungslos bleiben, waehrend die gesamte Anweisung als
erfolgreich erscheint.

**Umsetzung**

1. Pruefe Root und jede Zwischenebene vor dem Zugriff auf einen geeigneten
   Objekt- oder Funktionscontainer.
2. Erzeuge fehlende Ebenen nur nach bestehendem Exportvertrag. Ersetze
   primitive Werte oder `null` nicht still durch Objekte.
3. Melde Konflikte mit eindeutigem Namespace-/Exportbezug.
4. Sichere auch die abschliessende Zuweisung ab: Nicht beschreibbare
   Zielproperties und nicht erweiterbare Container duerfen keinen falschen Erfolg
   liefern.

**Regression und Abnahme**

- [ ] Nach `window.exportRoot=3` meldet `Scripting.eval({}, "const item=1; #export item@exportRoot; 42;")` einen Exportfehler statt Erfolg `42`.
- [ ] `null` und primitive Zwischenebenen werden mit verstaendlichem Namespace-Bezug abgelehnt.
- [ ] Objekt-/Funktionscontainer funktionieren; tatsaechlich fehlende Ebenen werden korrekt erzeugt.
- [ ] Nicht beschreibbare Zielproperties und nicht erweiterbare Container verursachen keinen still verlorenen Export.

**Testansatz:** `test\scripting_eval.html`, `test\scripting_syntax.html`,
`test\composer_render_export.html`.
**Dokumentation:** `manuals\scripting.md`.
**Erledigt, wenn:** Ein nicht ausgefuehrter Export nie als erfolgreich
abgeschlossene Anweisung ausgegeben wird.
