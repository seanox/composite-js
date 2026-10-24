# Arbeitsauftraege zum Code-Review Oktober 2026

Stand: 2026-10-24

Dieses Dokument formuliert die 52 Befunde aus
[review-202610.md](review-202610.md) als umsetzbare Arbeitsauftraege fuer
Entwickler und Coding-Agenten. Es ergaenzt den strukturierten Plan
[review-202610-tasks.yaml](review-202610-tasks.yaml). Die IDs `R01` bis `R52`
entsprechen unveraendert den Befundnummern 1 bis 52 des Reviews.

**Dokumentierter Status:** R01, R02, R11 und R38-R41 sind als erledigt
gekennzeichnet. Die uebrigen Aufgaben sind offen. Dieser Status wird durch die
Ergaenzung der Loesungsansaetze nicht erneut als Laufzeitergebnis bestaetigt.
Dieses Dokument beschreibt die Arbeitsauftraege und ihren Bearbeitungsstand. Die
Quellenangaben beziehen sich auf
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

### Lesart der konkreten Loesungsansaetze

Die Abschnitte **Konkreter Loesungsansatz** nennen die zu aendernden
Implementierungsstellen, geeignete Datenstrukturen und den vorgesehenen
Kontrollfluss. Codefragmente zeigen den relevanten Mechanismus, nicht zwingend
einen unveraendert einsetzbaren Gesamtpatch. Als neu bezeichnete Helfer sind
Vorschlaege; vorhandene Helfer werden ausdruecklich benannt. Bei offenen
API-Entscheidungen ist der empfohlene Weg von einer bereits beschlossenen
Semantik zu unterscheiden.

**Quellenabgleich am 2026-10-24 (R11 integriert):** Massgeblich ist
`sources\composer.js`, das `development\build.xml` in seinen Quelllisten
einbindet. Beim Abgleich fehlten in dieser Build-Quelle die in den
Abschlussvermerken beschriebenen Korrekturen fuer R01 und R02. R01 wurde am
2026-10-24 erneut umgesetzt und gezielt verifiziert; die Scope-Wiederherstellung
aus R02 fehlt weiterhin. Die nachstehenden Loesungsansaetze beschreiben die
erforderlichen Eingriffe direkt an dieser Quelle und setzen keine zusaetzliche
Referenzimplementierung voraus. R11 ist bereits integriert: `_render_meta` ist
eine `Map`, und die Zugriffe sowie Prune-Grenzen verwenden deren Operationen
und `size`. Erhalte diesen Registerstand bei der Umsetzung von R02.
Die historischen Abschlussvermerke unten bleiben als solche erhalten.

In `sources\test.js` sind dagegen bereits `completeTask`, `normalizeError`,
`matchesExpected`, `isCurrentWorker` und `parentContext` vorhanden.
R38-R41 beschreiben deshalb unten den vorhandenen Mechanismus statt eines
zweiten Umbaus. R48 ist im aktuellen Monitor bereits teilweise korrigiert;
R49 und der Zugriffsschutz aus R51 sind ebenfalls im Quelltext vorzufinden.
Ihre noch offenen Abnahmen sind gegen diesen Stand zu pruefen, nicht durch
erneut parallel implementierte Helfer zu ersetzen.

## Arbeitsweise fuer Entwickler und Agenten

### Vor Beginn einer Aufgabe

1. Lies den zugehoerigen Review-Befund, den aktuellen betroffenen Quelltext und
   die angegebenen Tests. Die Testdateien sind Ansatzpunkte, keine Zusage, dass
   sie den Fehler bereits abdecken.
2. Erstelle vor jeder Implementierung zuerst einen gezielten Regressionstest,
   der den gemeldeten Fehler reproduziert. Fuehre ihn gegen den unveraenderten
   Quelltext aus und bestaetige, dass er aus dem erwarteten Grund fehlschlaegt.
   Erst danach korrigiere die Implementierung. Schlaegt der Test aus einem
   anderen Grund fehl oder laesst sich der Befund nicht reproduzieren, klaere
   zuerst die Reproduktion, statt eine vermutete Korrektur einzubauen. Halte
   unabhaengige Probleme getrennt fest.
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

**Prioritaet:** hoch | **Aufwand:** 2 SP | **Status:** erledigt
**Paket:** `rendering` | **Abstimmung:** [R03](#r03)
**Fundstellen:** `sources\composer.js:1278-1284, 1949-1954`

**Konkreter Loesungsansatz**

Ergaenze am Anfang von `_render_element_selectors` den Guard
`if (!(selector instanceof Element) || !selector.parentNode) return false;`.
`false` bedeutet hier, dass die Standardverarbeitung weitergehen soll. Ein
`return` auf Ebene von `Composer.render` waere falsch, weil dann gerade
Textknoten und Condition-Marker nicht mehr verarbeitet wuerden. Die bestehende
Schleife ueber `_selectors` und der Abbruch bei `callback(...) === false`
bleiben unveraendert. Erweitere dazu den vorhandenen `parentNode`-Guard in
`sources\composer.js`, statt einen zweiten Filter im Aufrufer einzufuehren.
Wichtig ist die Unterscheidung der Rueckgabewerte: `false` aus einem Callback
fuehrt zu `true` aus dem Helfer und beendet das Rendering; `false` aus dem
Guard ueberspringt dagegen nur das Matching. Fange Matching- oder
Callback-Fehler nicht pauschal ab; der vorhandene Render-Fehlerpfad bleibt
zustaendig.

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

- [x] Registriere `Composer.customize("[data-probe]", () => {})`; `<span>{{1 + 1}}</span>` zeigt danach `2`, auch ohne Selektortreffer.
- [x] Wechsle eine Condition bei registriertem Selektor von `true` auf `false` und zurueck; das Element erscheint, verschwindet und erscheint erneut.
- [x] Treffende Elemente erhalten weiterhin ihren Callback; Textknoten und Marker erzeugen keinen `matches`-TypeError.

**Testansatz:** `test\composer_render_customize_selectors.html`,
`test\composer_render_condition.html`.
**Erledigt, wenn:** Custom-Selektoren Text- und Condition-Rendering nicht mehr
unterbrechen und ihre eigene Funktion erhalten bleibt.

**Abschluss 2026-10-23:** Element-Guard ausschliesslich in
`sources\composer.js` innerhalb von `_render_element_selectors` ergaenzt.
`test\composer_render_customize_selectors.html` prueft dynamischen Text mit und
ohne Selektortreffer, den Condition-Zyklus `true/false/true`, Callback-Reihenfolge,
Abbruch durch `false` und ausbleibende Renderfehler. Der erweiterte Test meldete
vor dem Fix drei Fehler und danach in Blink, Gecko und WebKit jeweils null Fehler
bei fuenf Testaufgaben. Alle 92 regulaeren Szenarien bestanden sowohl vor als auch
nach dem Fix in jeder der drei Engines. Die externe Browserbeobachtung zeigte
keine Laufzeitfehler oder unbehandelten Rejections; die bekannten optionalen
404-Antworten fuer `modules/common.xml` und `modules/common.css` bleiben bestehen.
Der Compose-Pfad einschliesslich ES2015-Lint lief erfolgreich mit
`-Dworkspace.release=D:\Privat\composite-js\development\tmp\r01-release`, damit
vorhandene lokale Release-Aenderungen unangetastet bleiben; die Test-Bundles
wurden daraus erzeugt. `manuals\markup.md` dokumentiert die Begrenzung auf Elemente.

**Erneute Umsetzung und Verifikation am 2026-10-24:** Der Element-Guard und
Regressionen fuer dynamischen Text mit und ohne Selektortreffer, Condition
`true/false/true`, Callback-Aufruf und den ausbleibenden `matches`-TypeError
sind in `sources\composer.js` und
`test\composer_render_customize_selectors.html` vorhanden. Der Compose-Pfad
einschliesslich ES2015-Lint war mit isoliertem Release- und Testverzeichnis
erfolgreich. Das Selektor-Szenario bestand in Blink, Gecko und WebKit jeweils
mit drei Testaufgaben und null Fehlern. Die vollstaendige Szenariensuite wurde
bei dieser erneuten Umsetzung nicht ausgefuehrt.

### R02

**Renderkontexte bei verschachtelten und partiellen Iterationen erhalten**

**Prioritaet:** hoch | **Aufwand:** 5 SP | **Status:** erledigt
**Paket:** `rendering` | **Abstimmung:** [R05](#r05), [R10](#r10)
**Fundstellen:** `sources\composer.js:1273-1276, 1343-1344, 1363-1365, 2587-2601`

**Konkreter Loesungsansatz**

Behandle den Scope jedes tatsaechlich ausgefuehrten Renderaufrufs als
zeitlich begrenzten Zustand. Nach dem Queue-/Lock-Konfliktpfad, aber vor der
initialen ID-Auswertung, werden
`workspace = [..._view_scope_workspace]` und `stack = [..._view_scope_stack]`
gesichert. Fuer den Knoten wird `object.context` beziehungsweise der bisherige
Stack in den Workspace kopiert; derselbe Kontext bildet anschliessend den
Stack fuer neu erzeugte Kinder. Im `finally` werden beide Arrays durch
`length = 0` und `push(...snapshot)` wiederhergestellt. Ihre Objektidentitaet
bleibt erhalten; die enthaltenen Anwendungsobjekte werden nicht tief geklont.
Ein vorhandener leerer Knotenkontext ist dabei ebenfalls verbindlich:
Er darf nicht mit Variablen des aktuellen Aufrufers aufgefuellt werden.
Stelle beide Snapshots vor `lock.release()` wieder her, damit von dort
ausgeloeste Folgeaktionen keinen temporaeren Kindkontext uebernehmen.

Die initiale ID-Auswertung benoetigt einen eigenen solchen Schutz. In
`_render_attribute_iterate` muss nach `push({[name]: meta})` die Verarbeitung
der Kinder in `try/finally` mit garantiertem `pop()` erfolgen. Der Schutz muss
auch Custom-Callback-Abbrueche erfassen. Ein in einem fremden Scope eingereihter
Auftrag verwendet beim spaeteren Eintritt seinen gespeicherten Knotenkontext,
nicht zufaellig den Kontext des Auftraggebers.

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

- [x] Initial lauten `title` und Text `A` beziehungsweise `A:1`.
- [x] Nach einem Renderaufruf nur fuer das innere `div` bleiben beide Werte korrekt.
- [x] Drei Ebenen, gleichnamige lokale Variablen und mehrere Geschwister zeigen kein Scope-Leck.
- [x] Nach einem Fehler im Kind koennen Eltern- und Geschwisterausdruecke wieder mit ihrem eigenen Kontext ausgewertet werden.

**Testansatz:** `test\composer_render_iterate.html`,
`test\composer_render_recursive.html`, `test\reactive_iterate.html`.
**Erledigt, wenn:** Jeder Renderaufruf seinen Aufrufkontext wiederherstellt und
neue Iterationskinder den vollstaendigen gueltigen Scope erhalten.

**Abschluss 2026-10-23:** `sources\composer.js` sichert Workspace und Scope-Stack
pro Renderaufruf und stellt beide in `finally` wieder her. Der gespeicherte
Knotenkontext bildet auch den Stack fuer neue Kinder. Die initiale ID-Auswertung
stellt den vorherigen Workspace wieder her; Iterationsvariablen werden auch bei
einem Abbruch aus dem Stack entfernt.
Das neue, in `test\index.html` registrierte Szenario
`test\composer_render_iterate_context.html` deckt initiales und wiederholtes
partielles Rendering, dynamische IDs, drei Ebenen, Shadowing, Geschwister,
fruehen Callback-Abbruch, einen gezielt ausgeloesten Kindfehler mit anschliessender
Erholung und einen aus fremdem Scope eingereihten Renderauftrag ab.
Vor dem Fix scheiterten alle sechs Testaufgaben; danach bestanden sie in Blink,
Gecko und WebKit. Gegenueber der gruenen R01-Baseline mit 92 Szenarien bestanden
nach R02 alle 93 Szenarien je Engine. Die externe Browserbeobachtung bestaetigte
genau den erwarteten Kindfehler und keine weiteren Laufzeitfehler oder
unbehandelten Rejections; optionale 404 fuer `modules/common.xml` und
`modules/common.css` bleiben unveraendert.
Compose einschliesslich ES2015-Lint lief mit
`-Dworkspace.release=D:\Privat\composite-js\development\tmp\r02-release`
erfolgreich, ohne vorhandene lokale Release-Aenderungen zu ueberschreiben.
Der Scope-Vertrag ist in `manuals\markup.md` beim Attribut `iterate` dokumentiert.

### R03

**Tag-Makros eindeutig von CSS-Selektoren unterscheiden**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R01](#r01)
**Fundstellen:** `sources\composer.js:149, 1152-1160`

**Konkreter Loesungsansatz**

Aendere das bestehende Pattern von `/[_a-z]([\w-]*\w)?$/i` auf
`/^[_a-z]([\w-]*\w)?$/i`. Damit bleiben erlaubte Tag-Namen einschliesslich
Bindestrichen erhalten, waehrend `a.foo`, `.foo` und `#foo` nicht mehr nur
ueber ihr Ende passen. Der vorhandene `Composer.customize`-Zweig fuer
`_macros` bleibt bestehen; nicht passende Eingaben erreichen unverkuerzt den
bereits vorhandenen `_selectors`-Zweig. Kein neues Klassifikationsregister
und keine Zerlegung eines CSS-Selektors an Punkten einfuehren.

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

**Konkreter Loesungsansatz**

Korrigiere `_render_append_renderable`, nicht nur dessen `output`-Aufrufer.
Bilde fuer `Document`, `DocumentFragment` oder `NodeList` zuerst
`Array.from(value.childNodes || value).map(node => node.cloneNode(true))`.
Die Kopien muessen vor dem Leeren entstehen, da die Eingabe aus dem Ziel
stammen kann. Uebergib danach das gesamte Array einmal an
`_render_append_nodes(selector, nodes, exclusive)`. Dieser Helfer leert
bereits vor seiner Schleife und behandelt deshalb auch `[]` richtig.
Der einzelne `Node` bleibt im vorhandenen Klonpfad. Damit wird die fehlerhafte
Kopplung `exclusive && index === 0` vollstaendig entfernt und die Korrektur
gilt gleichzeitig fuer `output` und `import`.

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

**Konkreter Loesungsansatz**

Normalisiere in `_render_attribute_iterate` das ausgewertete Ergebnis zuerst
auf eine lokale Folge `items`: vorhandene XPath-/Zahlen-/Array-Konvertierungen
fuer nichtleere Werte weiterverwenden, fuer eine bisher als leer behandelte
Eingabe eine leere Folge verwenden. Erst nach erfolgreicher Auswertung und
Konvertierung einmal `selector.innerHTML = ""` ausfuehren und anschliessend
`items.forEach(...)`. So leert `0` den Container, waehrend ein
Expression-/Konvertierungsfehler vor dem Leeren weitergereicht wird.
`object.template` bleibt die unveraenderte Quelle fuer neue Kinder; nicht
die gerade geleerte Ausgabe erneut als Vorlage speichern.

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

**Konkreter Loesungsansatz**

Trenne in `_render_attributes_update` drei Werte: den gespeicherten
Expression-Text, das rohe Ergebnis `raw` und den DOM-Zielnamen aus R08/R09.
Ein kleiner gemeinsamer Schreibhelfer fuer Renderer und
Boolean-Normalisierung des MutationObservers kann dann zuerst `undefined`
behandeln, danach bekannte boolesche HTML-Attribute und zuletzt Textattribute.
Erkenne boolesche Attribute ueber eine fachliche Attribut-/Property-Zuordnung,
nicht ueber `typeof raw === "boolean"`: `aria-hidden="false"` ist Text.
Beachte unterschiedliche Property-Namen wie `readonly -> readOnly` und
`autofocus -> autofocus`. Ergaenze `checked`/`selected` und die weiteren
unterstuetzten booleschen HTML-Attribute konsistent.

Bei einem booleschen `raw === false` das Attribut entfernen und die
zugehoerige Property auf `false` setzen; bei `true` das Praesenzattribut
setzen und die Property auf `true`. Der aktuelle Observer-Vertrag fuer die
Strings `"false"`/`"true"` muss in denselben Pfad einbezogen werden.
Die abschliessende pauschale Zuweisung `selector[attribute] = value` darf den
Wert danach nicht erneut als String schreiben. Fuer sonstige Properties
den Rohwert und nur fuer `setAttribute` die Textdarstellung benutzen.
Bei `checked` die aktuelle Property auch nach einem Dirty-Checkedness-Zustand
explizit setzen; Attributreflexion allein genuegt nicht.

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

**Konkreter Loesungsansatz**

Ersetze im initialen Mount-Synchronisierungspfad
`if (meta && meta.target && identifier)` durch eine Pruefung auf gueltiges
Binding-Metaobjekt und `identifier`; pruefe `meta.target !== undefined`
statt dessen Truthiness. Die nachfolgende bestehende Auswahl
`value = meta.target` beziehungsweise `meta.target.value` fuer Objektziele
bleibt erhalten, ebenso der Guard `value !== undefined`.
Lasse `0`, `false` und `""` danach direkt in die vorhandenen Zuweisungen
`selector.checked = value` beziehungsweise `selector.value = value` laufen.
Die Behandlung von `null` nicht durch einen neuen `||`-Fallback veraendern;
sie ist getrennt vom hier notwendigen Wegfall der Truthiness-Sperre zu pruefen.

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

**Konkreter Loesungsansatz**

Behalte `attribute` als Schluessel von `object.attributes` und als Teil des
Expression-Cache-Identifiers bei. Bestimme daneben vor der Auswertung
`targetName = attribute.replace(/^@+/, "")`. Ein physisches Template-Attribut
wird unter dem Deklarationsnamen entfernt; Setzen und Entfernen des
Ergebnisattributs verwenden immer `targetName`. Auch die Property-Zuweisung
verwendet dessen gegebenenfalls abweichenden Property-Namen aus R06.
Mutierende Umbenennung von `attribute` nur im definierten Ergebniszweig
entfaellt. Bei `undefined` bleibt die Expression im Metaobjekt erhalten,
waehrend Zielattribut und Property gemaess dem dokumentierten Vertrag
aktualisiert werden.

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

**Konkreter Loesungsansatz**

Entferne das unbedingte Lowercasing des Speicherschluessels in
`_render_attributes_initialize`. Halte Originalname und gegebenenfalls
`namespaceURI`/`localName` neben einem Vergleichsnamen vor. Eine Zusatzzuordnung
am vorhandenen Metaobjekt ist moeglich, ohne alle Expression-Werte in
`object.attributes` in neue Wrapperobjekte umzuwandeln. Interne HTML-Namen
bleiben kanonisch; der reale Schreibname fuer SVG bleibt beispielsweise
`viewBox`.

Ziehe dieselbe Zuordnung in `_render_attributes_update` und im
Hardening-Zweig des MutationObservers heran: Auch dort geht die Schreibweise
aktuell durch `.toLowerCase()` verloren. Bei namespaced Attributen
`setAttributeNS`/`removeAttributeNS` mit den passenden Namen verwenden.
Schreibe nicht in read-only SVG-Properties wie `viewBox`; hier ist die
Attributoperation der richtige Updatepfad. Nicht pauschal jede Exception eines
Property-Setters abfangen, sondern den Schreibpfad nach Element-/Property-Art
waehlen.

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

**Konkreter Loesungsansatz**

Fuehre fuer die Render-Queue einen einzigen Planungszustand ein, etwa
`let renderDrainScheduled = false`. Ein neuer Helfer plant nur dann eine
Microtask, wenn Arbeit vorliegt, kein fremder Render-Lock aktiv ist und noch
kein Drain geplant ist. Die Microtask setzt den Planungszustand zurueck,
prueft den Lock erneut und entnimmt erst dann mit `shift()` den naechsten
Selektor. Nach dessen Verarbeitung wird bei Bedarf erneut geplant.

Entferne sowohl `Composer.asynchronous(Composer.render)` im Lock-Konfliktpfad
als auch das vorzeitige `shift()` fuer Rendering in `_lock.release`.
Plane den Render-Drain dort erst nach Freigabe von `_render_lock`, auch bei
Fehlern. `_lock` bedient ebenfalls Mounting; dessen Pfad darf nicht
unbeabsichtigt entfallen. `lock.share()` erlaubt weiterhin synchrone
Kindaufrufe derselben Transaktion. Das vorhandene Entfernen eines bereits
mitgerenderten Selektors aus der Queue bleibt als Deduplizierung erhalten.

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

**Prioritaet:** mittel | **Aufwand:** 3 SP | **Status:** erledigt
**Paket:** `aufloesung_caches`
**Fundstellen:** `sources\composer.js:1913-1916, 2917-2920, 3073-3078`

**Konkreter Loesungsansatz**

**Empfehlung fuer die Datenstruktur: `Map<number, Meta>` mit der vorhandenen
Serial als Schluessel.** `_render_meta` ist kein positionsabhaengiges Array,
sondern ein Register. Eine `Map` drueckt genau diese Funktion aus und liefert
mit `size` die Anzahl existierender Eintraege ohne zusaetzlichen Zaehler.
Der fuer den aktuellen Quellstand empfohlene Kern lautet:

```javascript
const _render_meta = new Map();

// Alle Stellen muessen dieselbe numerische Serial verwenden.
_render_meta.set(serial, object);
const objectForNode = _render_meta.get(node.uid);
const known = _render_meta.has(node.uid);
_render_meta.delete(serial);

// Nach Verarbeitung der tatsaechlich entfernten Knoten:
Expression.prune(_render_meta.size);
Scripting.prune(_render_meta.size);
```

Das Fragment illustriert unterschiedliche Registeroperationen, keinen
zusammenhaengenden Renderablauf. `Map.delete()` ist bereits idempotent;
erneutes Setzen derselben Serial erhoeht `size` nicht.

**Alle betroffenen Stellen der Migration**

- Initialisierung: `_render_meta_initialize` schreibt mit `set`.
- Condition-Initialisierung: den Marker mit `set` eintragen und die alte
  Element-Serial mit `delete` entfernen.
- Condition-Ausgabe: das neu erzeugte Element separat eintragen; Marker und
  sichtbares Element bleiben zwei aktive Meta-Eintraege.
- Textzerlegung: dynamische und statische Textknoten mit `set` eintragen;
  die aus Platzhaltern per `parseInt` gewonnenen Serials mit `get` aufloesen.
- Saemtliche Zugriffe in Rendern, Mounting, Lookup, Validierung,
  Lock-Abschluss und MutationObserver von `store[serial]` auf `get`/`has`
  umstellen. Gemischte Array-/Map-Zugriffe funktionieren nicht.
- `_cleanup`: bestehende Unterbaum-/Undock-Logik und die Erkennung
  verschobener Knoten erhalten; anschliessend `delete(node.uid)` verwenden.
- Den Observer-Guard `!_render_meta.length` ebenfalls auf
  `_render_meta.size === 0` umstellen. Falls er tatsaechlich
  "Initialrendering hat begonnen" statt "Register nicht leer" meinen soll,
  diesen Zustand separat fuehren und nicht wieder ueber historische Groesse
  ausdruecken.
- Den Regressionstest `test\composer_render_cache_prune.html` am
  tatsaechlichen Verhalten ausrichten: Er protokolliert aktuell die Argumente
  beider Prune-Aufrufe und vergleicht sie nach jedem Entfernen mit dem ersten
  abgeschlossenen Zyklus. Er setzt keine internen Registerhelfer voraus.
  Falls direkte Registerpruefungen ergaenzt werden, muessen sie
  `size`, `set` und `delete` statt Array-/Objektzugriffen verwenden.
  Fuer kuenstliche Testeintraege separate numerische Serials verwenden:
  Anders als Objektschluessel unterscheidet eine Map die Zahl `1` vom
  String `"1"`.

**Warum keine `WeakMap` als unmittelbarer Ersatz?** Die vorhandenen Keys
sind numerische Serials; eine `WeakMap` akzeptiert keine Zahlen, hat kein
`size` und ist nicht iterierbar. Eine `WeakMap<Node, Meta>` waere nur mit
Umstellung aller serialbasierten Zugriffe und separater deterministischer
Aktivzaehlung moeglich. Gerade die Text-Platzhalter werden anhand ihrer
Serial aufgeloest. Ein zusaetzlicher starker Node-Index fuer diese Zugriffe
wuerde den vermeintlichen GC-Vorteil wieder aufheben.

Eine `Map` haelt ihre Metaobjekte und deren `element`-Referenzen stark fest.
Sie ersetzt deshalb **nicht** den expliziten Cleanup und beweist fuer sich
keine Speicherleckfreiheit. DOM-Verschiebungen duerfen nicht geloescht werden;
wirklich entfernte Unterbaeume muessen weiterhin freigegeben werden.

**Empfehlung und Integrationsstand:** Behalte die in `sources\composer.js`
integrierte `Map` bei. Sie vermeidet sparse Arrays und einen separat synchron
zu haltenden Zaehler; fuehre deshalb keinen redundanten Aktivzaehler und keine
zweite Registerverwaltung ein. Entscheidend ist nicht allein die Datenstruktur,
sondern die Invariante: Nach dem Cleanup entspricht `size` genau den noch
registrierten Metaobjekten. Condition-Marker und sichtbares Condition-Element
zaehlen getrennt; blosse DOM-Verschiebungen aendern ihren Bestand nicht.

Ermittle die Grenze erst nach Verarbeitung des gesamten Mutation-Batches
einschliesslich Cleanup und uebergib sie an beide Prune-Aufrufe.
`test\composer_render_cache_prune.html` prueft bereits 50
Einfuege-/Render-/Entferne-Zyklen auf konstante, uebereinstimmende Prune-Grenzen.
Das allein belegt noch nicht die korrekte aktive Anzahl oder die reale
Cache-Groesse: Sichere diese separat ab und pruefe insbesondere vollstaendige
Unterbaumfreigabe, Condition-Wechsel und Verschiebungen. Messe jeweils erst,
nachdem der MutationObserver die Aenderungen verarbeitet hat; eine Messung
direkt nach `removeChild()` kann noch den vorherigen Registerstand zeigen.

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

- [x] Fuehre 50 Einfuege-/Render-/Entferne-Zyklen mit wechselnden Expressions und konstantem Rest-DOM aus.
- [x] Erfasse nach abgeschlossenem Cleanup aktive Metadaten, beide Prune-Grenzen und reale Expression-/Scripting-Cache-Groessen; die Grenzen entsprechen dem aktiven Metadatenbestand statt der historischen Arraylaenge.
- [x] Wiederholte Freigaben sowie Condition-Marker und Iterationskinder machen die aktive Anzahl weder negativ noch dauerhaft zu gross.

**Testansatz:** `test\composer_render_cache_prune.html`,
`test\composer_render_release.html`,
`test\benchmarks\composer_lifecycle_benchmark.html`.
**Erledigt, wenn:** Die Cache-Groessensteuerung an aktiven Bedarf oder eine
ausdruecklich begrenzte Policy gebunden ist.

**Abschluss 2026-10-23:** `sources\composer.js` zaehlt aktive Meta-Eintraege
zentral beim Setzen und idempotenten Loeschen. Beide Prune-Aufrufe verwenden
diese Anzahl statt der historischen Arraylaenge. Der neue Regressionstest
fuehrt 50 Zyklen mit wechselnden Ausdruecken, Condition-Markern und
Iterationskindern aus; er vergleicht beide Prune-Grenzen mit den aktiven
Metadaten, prueft reale Cache-Groessen sowie eine doppelte Freigabe. Der Compose-
Build einschliesslich ES2015-Lint war erfolgreich. Alle 94 Testszenarien
bestanden in Blink, Gecko und WebKit.

### R12

**Reactive-Cache-Praesenz vom Wert undefined unterscheiden**

**Prioritaet:** mittel | **Aufwand:** 1 SP | **Status:** offen
**Paket:** `rendering` | **Abstimmung:** [R15](#r15), [R42](#r42)
**Fundstellen:** `sources\reactive.js:299-307`

**Konkreter Loesungsansatz**

Aendere den Rekursionsguard im Set-Trap auf
`if (this.cache.has(key) && this.cache.get(key) === value) return true;`.
Der Guard steht erst nach einer erfolgreichen Zuweisung gemaess R15.
Danach `this.cache.set(key, value)` und die vorhandene Benachrichtigung
ausfuehren. `has` unterscheidet "noch nie gespeichert" von "gespeichertes
undefined"; ein eigener Sentinel ist bei der vorhandenen `Map` unnoetig.
Die Gleichheitsregel nicht beilaufig auf eine andere Semantik umstellen.

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

**Konkreter Loesungsansatz**

Verwende im Get-Trap fuer proxyfaehige Anwendungsobjekte waehrend der
Abhaengigkeitserfassung `Reflect.get(target, key, proxy)` statt der
eigenen-Getter-Sonderbehandlung. `Reflect.get` findet auch geerbte Accessors;
deren `this.n` laeuft mit dem Proxy als Receiver wieder durch den Get-Trap.
Die dadurch gelesenen eigenen Felder werden von der vorhandenen
Registrierungs-Microtask erfasst. Ein eigener Descriptor-Walk ist nur
erforderlich, wenn daraus weitere Typ-/Invariantentscheidungen entstehen.

Die direkte Registrierung des geerbten Getter-Namens allein reicht nicht:
Ein Write auf `n` muss die beim Getter-Lesen registrierten Verbraucher von
`n` erreichen. Die Receiver-Wahl fuer native Objekte ist mit R14 zu trennen;
native Internal-Slot-Getter duerfen nicht blind diesen Proxy erhalten.

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

**Konkreter Loesungsansatz**

Empfohlene begrenzte Variante: einen zentralen Typ-Guard am Eingang von
`_reactive` verwenden, der `Node`, `NodeList`, `HTMLCollection` und die
abgestimmten nativen Internal-Slot-Typen wie `Date`, `Map`, `Set`,
`WeakMap` und `WeakSet` unveraendert zurueckgibt. Derselbe Eingang wird fuer
Root- und verschachtelte Werte verwendet; die bisherigen nur im Get-Trap
stehenden DOM-Ausnahmen reichen fuer Root-Werte nicht. Normale Objekte,
Arrays und die unterstuetzten Anwendungsinstanzen bleiben proxyfaehig.
Die Liste und ihre Grenzen sind eine ausdrueckliche API-Entscheidung.

Im Get-Trap vor rekursiver Proxifizierung den **eigenen** Descriptor mit
`Reflect.getOwnPropertyDescriptor(target, key)` lesen. Bei
`configurable === false`, Datenproperty und `writable === false` zwingend
`descriptor.value` zurueckgeben. Bei einem nichtkonfigurierbaren Accessor
ohne Getter ist `undefined` vorgeschrieben. Diese Regeln duerfen nicht
durch nachfolgendes `_reactive(value)` wieder verletzt werden.
Nicht allgemein `Object.isFrozen` als Ersatz fuer die Descriptor-Pruefung
verwenden: Auch einzelne feste Properties auf sonst veraenderlichen Objekten
sind betroffen.

Eine pauschale Bindung aller Methoden per `.bind(target)` ist keine gute
Alternative: Sie veraendert Methodenidentitaeten und umgeht bei
Anwendungsmethoden die Erfassung innerer Zugriffe. Fuer native Typen ist
die beschriebene opaque Behandlung einfacher und ausdruecklich ohne
Beobachtung von `Map.set` oder `Date.setTime`.

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

**Konkreter Loesungsansatz**

Ersetze das `try { target[key] = value; } finally { ... return true; }`
durch einen linearen Erfolgspfad: Proxywerte zuerst wie bisher auf ihren
Originalwert entpacken, dann `Reflect.set(target, key, value)` ausfuehren.
Ein `false` wird als `false` vom Trap weitergegeben; eine Setter-Exception
laeuft ohne Catch zum Aufrufer. Erst bei `true` folgen Cache-Guard aus R12,
Cache-Aktualisierung und Benachrichtigung.

Ohne expliziten Receiver verwendet `Reflect.set` hier weiterhin das
Originalobjekt, entsprechend der bisherigen Setter-Semantik. Es ruft deshalb
nicht als Nebenwirkung den neuen Proxy-`defineProperty`-Trap aus R42 auf.
Soll spaeter bewusst der Proxy als Setter-Receiver gelten, muss die dadurch
moegliche Doppelbenachrichtigung gesondert koordiniert werden.

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

**Konkreter Loesungsansatz**

Erweitere den vorhandenen Cursor-Scanner in `Scripting.eval` und ersetze
die reine Quote-Regex in `Expression._parse(TYPE_SCRIPT, ...)` durch eine
abgestimmte lexikalische Behandlung. Das minimale Zustandsmodell umfasst
Code, einfache/doppelte Strings, Zeilen-/Blockkommentar, Regex mit einem
separaten `inCharacterClass`-Flag sowie Template-Text. Escapes werden im
jeweiligen Zustand konsumiert, nicht pauschal als "naechstes Zeichen ignorieren".
Bei `${` einen Code-Frame mit Klammerzaehler auf einen Stack legen; ein darin
auftretendes Template legt wiederum einen eigenen Frame an.

Der Scanner sollte zusammenhaengende Originalbereiche mit Art und Grenzen
liefern. Nur Codebereiche werden umgeschrieben; Literalbereiche bleiben
bytegetreu beziehungsweise als unveraenderte Patches erhalten. Verwende
denselben Mechanismus auch zur Erkennung des schliessenden `}}` einer
Expression: Die aktuelle Regex `/\{\{(.*?)\}\}/g` kennt keine Literale.
Sonst kann schon vor der eigentlichen Literalverarbeitung falsch getrennt
werden.

Fuer `/` muss der Tokenkontext zwischen erwartbarem Operanden und bereits
abgeschlossenem Ausdruck unterscheiden. Zusaetzlich Klammerarten festhalten:
Ein `)` nach einer `if`-Bedingung und eines nach einem Funktionsaufruf
erlauben nicht denselben Folgetoken. Ebenso Block versus Objektliteral und
Statement-Grenzen beachten. Ein Flag anhand nur des letzten Zeichens ist
kein vollstaendiger Regex-/Divisions-Disambiguator. Ergaenze dafuer Tests
wie Regex nach `if (...)`, Division nach `fn()` und Regex im
Template-Ausdruck. Falls diese Grammatik nicht verlaesslich lokal abbildbar
ist, einen kompatiblen Tokenizer als gesonderte Abhaengigkeitsentscheidung
pruefen, statt einen scheinbar universellen Regex-Patch zu liefern.

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

**Konkreter Loesungsansatz**

Trenne die Kollision des `script`-Transportparameters von den Makrohelfern.
Fuer den Transport einen frischen internen Parameternamen erzeugen, der in
`Object.keys(context)` und im ausgewerteten Quelltext nicht als Bezeichner
vorkommt. Der Wrapper bleibt ein strikter direkter `eval`-Wrapper, damit
lokale Kontextbindungen und das Ergebnis der letzten Anweisung erhalten
bleiben. Ein indirektes `eval` wuerde diesen Kontext verlieren.

Fuer Makrohelfer reicht blosses Umbenennen von Funktionsparametern nicht:
Auch die vom Parser erzeugten Aufrufe muessen genau diese internen Namen
verwenden. Empfohlen ist, erzeugte Helferstellen beim Parsen getrennt von
originalen Codebereichen zu markieren und beim Erzeugen des Ausfuehrungscodes
mit frischen Aliasnamen zu belegen. Originaler Anwendungscode
`_export` bleibt dann ein Kontextzugriff; ein aus `#export` erzeugter
Aufruf referenziert den Alias des internen Helfers. Keine globale
String-Ersetzung aller Vorkommen von `_export` durchfuehren.

Wird ein gemeinsames Helferobjekt verwendet, lautet die Form beispielsweise
`<frischerName>.export(...)`; auch dieser Name muss kollisionsfrei sein.
Die Aliaswahl muss deterministisch mit der Wrapper-/Parse-Cache-Identitaet
zusammenpassen. Beziehe daher Aliasbelegung neben den geordneten
Kontextschluesseln in die Wrapper-Signatur ein; keine konkreten Kontextwerte
oder deren Objekte im Cache festhalten. Beide Parser und der
`Scripting.eval(..., debug)`-Ausgabepfad sind mit derselben Aliasstrategie
zu verbinden. Eine neue reservierte Anwendungsnamenliste waere kein Fix
fuer die hier geforderten gueltigen Namen.

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

**Konkreter Loesungsansatz**

Im vorhandenen Klammer-Scanner wird beim tolerierten `(` aktuell
`"_tolerate(()=>"` eingefuegt. Ergaenze die oeffnende Ausdrucksklammer zu
`"_tolerate(()=>("`. Beim zugehoerigen schliessenden `)` muessen dann
zwei statt einer zusaetzlichen schliessenden Klammer eingefuegt werden.
Die resultierende Form ist `(_tolerate(()=>(<Ausdruck>)))`.
Passe die Cursorfortschreibung an die tatsaechlich eingefuegte Laenge an.
Die `brackets`-Markierung fuer normale und tolerierte Klammern bleibt
erhalten; R16 muss verhindern, dass Klammern innerhalb von Literalen diesen
Stack veraendern. Der vorhandene Expression-Emitter liefert bereits die
entsprechend geklammerte Form.

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

**Konkreter Loesungsansatz**

Arbeite im `TYPE_MIXED`-Zweig an der Stelle, an der die aufgeloesten
Fragment-Patches zusammengesetzt werden. Erzeuge fuer gemischte Ausdruecke
eine explizite Text-Konvertierung pro Fragment und verbinde diese
Textwerte, statt rohe Ausdruecke mit `+` zu addieren. Ein anwendbares
Konvertierungsprinzip ist `(value => value === undefined ? "" : String(value))`
pro einmalig ausgewertetem Fragment. Halte die gewaehlte
`undefined`-Darstellung mit dem bestehenden Ausgabe-/Manualvertrag konsistent.
Nicht jedes Fragment zweimal auswerten, etwa einmal im Guard und nochmals
fuer den String: Das wuerde Getter und Funktionsaufrufe doppelt ausfuehren.

Fuer den nicht-gemischten Einzelausdruck bleibt das Patch unveraendert.
Falls ein Konvertierungshelfer in den generierten Code eingebunden wird,
dessen interne Bindung nach R17 kollisionsfrei bereitstellen; ein
gleichnamiger Kontextwert darf die Textkonvertierung nicht ersetzen.

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

**Konkreter Loesungsansatz**

Erzeuge im Catch von `Expression.eval` ein neues `Error`-Objekt aus einer
sicher gelesenen Meldung plus dem bereits vorhandenen Script-Kontext.
Speichere den gefangenen Wert mit
`Object.defineProperty(wrapped, "cause", {value: error, configurable: true})`.
Das benoetigt nicht den neueren `Error(message, {cause})`-Konstruktor und
funktioniert auch mit einem eingefrorenen Originalfehler.
Die bestehende `console.error`-Meldung und Rueckgabe erhalten den Wrapper.

Die Meldungsextraktion muss `null`, Symbole und werfende
`message`-/`toString`-Zugriffe beruecksichtigen. Ein eng auf die
Diagnosekonvertierung begrenzter Fallback darf hier eine beschreibende
Ersatzmeldung liefern, der Originalwert bleibt aber als `cause` erhalten.
Kein nachtraegliches Schreiben in `error.message` und kein Catch, das einen
Expression-Fehler als erfolgreichen Nutzwert ausgibt.

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

**Konkreter Loesungsansatz**

Extrahiere die globale Wurzelaufloesung aus `_populate`. Nach der vorhandenen
Validierung eines einzelnen Root-Bezeichners kann ein **indirektes**
`eval` wie `(0, eval)(\`typeof ${level} !== "undefined" ? ${level} : undefined\`)`
im globalen Scope ausgefuehrt werden. Anders als direktes `eval` sieht es
keine lokalen Parameter `namespace` oder `level`, aber globale
Script-`let`-/`const`-Bindungen. Modul-lokale Bindungen sind keine globalen
Namespaces und werden dadurch nicht zugaenglich.

Nur den validierten ersten Bezeichner so aufloesen; alle nachfolgenden
Segmente werden direkt ueber `namespace[level]` gelesen. Fuer den
vorhandenen ausdruecklichen `window`-Root-Pfad die beabsichtigte globale
Aufloesung erhalten, aber nicht jede spaetere falsy Zwischenebene wieder
global interpretieren. Verwende den neuen Root-Helfer sowohl in
`Namespace.lookup` als auch in `Namespace.use`. TDZ-Fehler und echte
Getter-Fehler nicht pauschal als "nicht vorhanden" verschlucken.

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

**Konkreter Loesungsansatz**

Loese die Wurzel als separaten Schritt vor der Schleife ueber die
restlichen Segmente auf. Alternativ verwende ein explizites `rootResolved`;
der Nutzwert `namespace` ist kein geeigneter Sentinel. Wende sofort die
Null-/DOM-Pruefung an, die bisher nach dem uebersprungenen `continue`
steht. Fuer jeden weiteren Schritt verwende nur einen Property-Zugriff
auf den bereits bestimmten Container.

Damit entfaellt die problematische Logik
`if (namespace && namespace !== window) ... else eval(...)` fuer
Zwischenebenen. Ein am Pfadende gueltiger falsy Nutzwert darf weiterhin
zurueckgegeben werden; nur ein nicht mehr fortsetzbarer Restpfad wird nach
Lookup-Vertrag als nicht vorhanden behandelt. `Namespace.exists` bleibt
auf `Object.usable(Namespace.lookup(...))` aufgebaut. Die Erzeugungsregeln
von `Namespace.use` getrennt erhalten, statt Lookup und Creation
versehentlich dieselbe Ersatzobjekt-Semantik zu geben.

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

**Konkreter Loesungsansatz**

Bevorzuge fuer `_lookup(string)` einen Vergleich bereits vorhandener
Composite-Pfade statt einen immer komplexeren dynamischen CSS-Selektor:
Ermittle Kandidaten mit dem konstanten Selektor
`[composite][route][id]` und berechne ihren Pfad ueber den vorhandenen
`_lookup(Element)`-Zweig. Dieser laeuft bereits die Elternkette entlang
und ignoriert gewoehnliche Markup-Wrapper.

Ein Kandidatenpfad passt, wenn er gleich dem gesuchten Pfad ist oder
dieser mit `candidatePath + "#"` beginnt. Waehle den Kandidaten mit
den meisten passenden Segmenten; bei gleicher Tiefe die bisherige
DOM-Reihenfolge beibehalten. Ohne Treffer bleibt `document.body` der
Fallback. Das vermeidet Fremdzweig-Treffer und loest zugleich den
Selektor-Escaping-Teil aus R26. Die Rueckrichtung `_lookup(Element)`
bleibt die gemeinsame Definition der Routing-Hierarchie; keine zweite,
abweichende Hierarchieinterpretation einfuehren.

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

**Konkreter Loesungsansatz**

Extrahiere den Inhalt des Hashchange-Listeners in einen internen
Navigationsablauf mit explizitem Datensatz, beispielsweise
`{previous, target, kind}`. Ein natives Ereignis liefert seine
`oldURL`/`newURL`-Snapshots; `forward` liefert das normalisierte Ziel direkt
und ruft denselben Ablauf synchron auf. Verwende darin durchgehend den
Datensatz, nicht nachtraeglich `Browser.location` als Ersatz fuer `target`.

Halte den akzeptierten effektiven Routing-Pfad separat von der rohen
Browseradresse. `Routing.location`, `Path.covers`, History-Pflege,
`approve` und die Render-Entscheidung lesen diesen Pfad beziehungsweise
das Ziel des aktiven Durchgangs. Der akzeptierte Pfad muss bis zum
naechsten Wechsel erhalten bleiben, weil der Composer Renderauftraege
einreihen und spaeter ausfuehren kann; ein nur kurz gesetzter Stackwert
waere dann bereits wieder verschwunden.

Der heutige Block `if (location !== Browser.location) location.replace(...)`
darf einen reinen Forward nicht wieder in hashgetriebene Navigation
zurueckverwandeln. Browser-URL-Normalisierung nur fuer den passenden
Navigationsmodus ausfuehren. Die relative Pfadaufloesung muss denselben
effektiven Ausgangspfad erhalten; die derzeit in `Path.normalize`
implizit gelesene `Browser.location` ist dabei mit einzubeziehen.
R30 aktualisiert den Datensatz bei Redirects, R27 ordnet native
Folgeereignisse zu. Keine zweite unabhaengige Forward-History anlegen.

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

**Konkreter Loesungsansatz**

Ergaenze in `Routing.approve` nach dem `undefined`-Fall einen eigenen
`typeof approval === "string"`-Zweig. Normalisiere den String relativ
zum effektiven Navigationspfad aus R24, fuehre die Weiterleitung ueber
denselben internen Navigationsablauf aus und liefere fuer den aktuell
pruefenden View `false`. Das verhindert, dass der bisherige View aufgrund
des nichtleeren Strings als freigegeben gilt.

Ein pro Redirect-Kette gefuehrtes `Set` normalisierter Zielpfade erkennt
Selbstweiterleitung und Zyklen. Einen Zyklus mit klarem Routingfehler
abbrechen, nicht als erfolgreiche Freigabe behandeln. Das Set gehoert
zur aktuellen Kette, nicht dauerhaft zur Route; spaetere regulaere
Navigationen auf dasselbe Ziel bleiben erlaubt. Pruefe auch einen
Permit-Redirect waehrend bereits laufendem Render-Lock, damit der
eingereihte Ziel-Render den beibehaltenen effektiven Pfad sieht.

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

**Konkreter Loesungsansatz**

Nutze vorzugsweise den Kandidaten-/Pfadvergleich aus R23. Dann gelangen
Pfadsegmente ueberhaupt nicht mehr in CSS-Quelltext: `#`, Backslash,
Anfuehrungszeichen oder Klammern sind nur Daten des Pfadvergleichs.
Der konstante Kandidatenselektor braucht kein dynamisches Escaping.
Falls der bestehende Selektoransatz bewusst beibehalten wird, muessen
alle eingesetzten Werte fuer **CSS-Attributstrings** escaped werden;
`encodeURIComponent` oder HTML-Escaping sind dafuer nicht geeignet.
Zusaetzlich bleibt die Gruppierungs-/Hierarchiefrage aus R23 zu loesen.

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

**Konkreter Loesungsansatz**

Die allgemeine Microtask-Simulation in `route` entfernen. Ein Unterschied
zwischen `event.newURL` und der inzwischen geaenderten Browseradresse
beweist keinen verlorenen Event. Fuer normale Hash-Wechsel die nativen
`oldURL`-/`newURL`-Snapshots in Empfangsreihenfolge verarbeiten, auch wenn
die Browseradresse inzwischen schon beim uebernaechsten Ziel steht.

Falls der im Quellkommentar genannte Gecko-Sonderfall von einer hashfreien
URL zu einem leeren Hash noch reproduzierbar ist, dafuer eine eng
begrenzte Fallback-Behandlung verwenden. Ausstehende eigene Wechsel in
einer Queue mit Sequenz und URL-Paar fuehren; ein nativer Event konsumiert
genau den passenden ausstehenden Wechsel. Ein Fallback verwendet dieselbe
Identitaet und markiert sie als verarbeitet. Ein spaeter eintreffender
nativer Event derselben Identitaet darf nicht nochmals Seiteneffekte
ausloesen.

Ein `setTimeout(0)` ist allein noch kein Beweis fuer Ereignisausfall,
weil verschiedene Task-Quellen keine solche universelle Reihenfolge
garantieren. Deshalb den Fallback auf den bestaetigten Sonderfall
begrenzen und zusaetzlich deduplizieren. Keine globale Menge aller
jemals gesehenen URL-Paare verwenden: `A -> B` kann spaeter ein neuer,
legitimer Wechsel sein. Die Queue-/Deduplizierungsdaten nach Abschluss
der jeweiligen Ereigniszuordnung wieder freigeben.

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

**Konkreter Loesungsansatz**

Normalisiere fehlende Hashes an den Routing-Eingaengen ausdruecklich,
beispielsweise `_locate(url) === null ? "#" : _locate(url)`, ohne
`Path.normalize(null)` projektweit umzudeuten. Diese API darf ihren
bisherigen Null-Vertrag behalten. `Routing.locate` arbeitet vor `_lookup`
und `substring` mit einem Root-String; der Navigationsdatensatz aus R24
enthaelt auch vor den Interceptors keinen null-Pfad.

Den Typ-/Syntaxfehler eines wirklich ungueltigen Pfads nicht durch
`catch { return "#"; }` verbergen. Es geht ausschliesslich um den
regulaeren fehlenden Hash. Den bisherigen Rueckgabevertrag von
`meta.data` bei leerem Restpfad ebenfalls nicht beilaufig aendern.

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

**Konkreter Loesungsansatz**

Erzeuge bei `Routing.customize` fuer ein RegExp ein internes Pattern
`new RegExp(path.source, path.flags)`. Vor jeder Pruefung dieses internen
Patterns `lastIndex = 0` setzen und erst dann `test(target)` aufrufen.
So bleibt auch ein vom Aufrufer veraenderter oder eingefrorener
Original-RegExp unangetastet. Der interne Klon bleibt pro Registrierung
wiederverwendbar; es ist kein neuer Klon pro Navigation erforderlich.
`g`/`y` nicht entfernen, da insbesondere `y` eine eigene Match-Semantik
hat. Alternativ kann das Original mit gesichertem/restauriertem
`lastIndex` verwendet werden, aber nur wenn Schreibbarkeit garantiert ist.

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

**Konkreter Loesungsansatz**

Verwende im Interceptor-Loop ein veraenderbares `target` aus dem
Navigationsdatensatz, kein konstantes `newHash`. Erfasse unmittelbar vor
jedem Callback die rohe Browseradresse. Hat der Callback sie durch
`location.replace` geaendert, extrahiere und normalisiere danach das
neue Ziel und aktualisiere den Datensatz. Hat sich die Adresse nicht
geaendert, bleibt das effektive Ziel bestehen; insbesondere darf ein
Forward ohne URL-Wechsel nicht auf die alte Browseradresse zurueckfallen.

Pruefe anschliessend den Rueckgabewert auf exakt `false` und fahre sonst
beim naechsten registrierten Interceptor mit dem aktuellen Ziel fort.
History und Render-Entscheidung muessen nach dem Loop ebenfalls dieses
Ziel verwenden statt erneut `event.newURL`. Das spaetere native
Redirect-Ereignis nach R27 zuordnen, damit die bereits ausgefuehrten
Interceptor-Seiteneffekte nicht nochmals laufen.

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

**Konkreter Loesungsansatz**

Ersetze `_cache = {}` durch zwei klar getrennte `Map`-Register fuer
geladene Dokumente und fertige Collections. Der Dokument-Key ist die
vollstaendige kanonische Ressourcenadresse **ohne XPath**, weil
unterschiedliche XPath-Abfragen dasselbe Quelldokument verwenden koennen.
Cache-Treffer lauten `documents.has(url)`/`documents.get(url).clone()`;
erst nach erfolgreichem Laden und Validieren gemaess R43 `set(url, data)`.

Der Collection-Key kann per
`JSON.stringify([collector, entries])` entstehen, wobei `entries` eine
geordnete Folge aus Ressourcenadresse und XPath je Eingabe ist.
Strukturierte String-Serialisierung verhindert Mehrdeutigkeiten durch
Kommas oder andere Trennzeichen im Locator. Ein direkt als Map-Key
verwendetes neu erzeugtes Array waere falsch: Arrays werden nach Identitaet
verglichen und ergaben bei jedem Aufruf einen Cache-Miss.
R32 liefert die sprachabhaengig aufgeloesten Adressen. Eine `WeakMap`
ist fuer diese String-Identitaeten ungeeignet.

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

**Konkreter Loesungsansatz**

Extrahiere aus `fetch` einen gemeinsamen internen Aufloesungsschritt:
`Locator.parse`, Erkennung einer expliziten Dateiendung und Wahl zwischen
`contextPath + path` sowie `DATA + "/" + locale + path + "." + schema`.
Dieser Schritt liefert die kanonische Ressourcenadresse und die getrennte
Query, ohne bereits einen Request auszufuehren.

`collect` verwendet dieselben aufgeloesten Eintraege fuer den
Collection-Key aus R31 und fuer das anschliessende Laden. Erfasse die
verwendete Locale fuer diesen Aufruf konsistent. Bei `en -> de` aendern
sich die Adressen impliziter Ressourcen und damit automatisch der Key;
explizite Ressourcen bleiben identisch. Ein blosses `cache.clear()`
bei Sprachwechsel ist nicht notwendig und wuerde wiederverwendbare
sprachunabhaengige Dokumente verwerfen.

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

**Konkreter Loesungsansatz**

Fuer die empfohlene, vorab freizugebende Wrapper-Variante den
`switch (node.nodeType)` um `Node.DOCUMENT_NODE` ergaenzen:
ein `xml.createElement("document")` erzeugen und zulaessige Kinder des
Dokuments mit `xml.importNode(child, true)` darunter kopieren.
Element-, Kommentar- und Processing-Instruction-Kinder sind dabei
darstellbar. Ein `DocumentType` ist unter einem Element nicht zulaessig;
ihn nach ausdruecklich dokumentierter Regel auslassen oder als Metadaten
abbilden, keinesfalls blind anhaengen.

Danach wird der Wrapper wie die bestehenden `attribute`-/`text`-Wrapper
unter `collection` eingefuegt, und der Rueckgabewert bleibt
`xml.documentElement.childNodes`. Beispielsweise waere fuer `<root/>`
eine NodeList mit einem `<document><root/></document>`-Element das
festgelegte Ergebnis. Teste genau diese Form, nicht nur die Abwesenheit
einer Exception. Die Repraesentation ist eine API-Entscheidung, kein
bereits vorhandener Runtime-Vertrag.

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

**Konkreter Loesungsansatz**

Bevorzuge die Vereinheitlichung: Nach kontrollierter Dekodierung in
`_normalize_path` alle Backslashes mit `/` ersetzen und erst danach
die vorhandene Segment-Stack-Logik fuer `.` und `..` anwenden.
Damit wird etwa `..%5Coutside.xml` innerhalb des logischen Root-Pfads
normalisiert statt erst spaeter vom Browser als Elternpfad interpretiert.
R35 stellt sicher, dass verschachtelte Kodierungen diesen Schritt nicht
umgehen.

Bilde in DataSource die endgueltige Adresse mit `new URL(...)` relativ
zur Anwendungsadresse. Vergleiche `origin` und den kanonischen
`pathname` mit dem Anwendungskontext; akzeptiere nur den Kontext selbst
oder dessen Praefix inklusive abschliessendem `/`. Bei Kontext `/`
bleibt die gesamte gleiche Origin erlaubt. Verwende fuer Cache-Key,
Pruefung und Request **dieselbe** endgueltige Adresse. Ein Vergleich
vor Browsernormalisierung oder ein blosses `startsWith("/app")` reicht
nicht. Gueltige Prozentzeichen bei der URL-Erzeugung gemaess R35
segmentweise kodieren.

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

**Konkreter Loesungsansatz**

Entferne `_decode` als gemeinsamen rekursiven Decoder fuer Pfad und
Query. Fuer die Query genau einmal `decodeURIComponent` auf den
urspruenglichen Query-Teil anwenden. Eine entstandene Zeichenfolge
`100%` wird danach nicht mehr als URI-Syntax behandelt.

Fuer Pfade zuerst eine kontrollierte Entschachtelung der im
Pfadvertrag relevanten Kodierungen verwenden: Punkt, Slash, Backslash
und auch Leerzeichen. Letzteres ist bereits durch
`test\locator_canonical_path.html` mit `%2520` abgedeckt.
Kodierungen dieser Zeichen einschliesslich verschachtelter
`%25`-Ebenen muessen bis zur vorgesehenen Normalisierungsstufe erkannt
werden; sonst wuerde der Fix die bestehenden `%252e`-/`%252f`-Faelle
brechen. Anschliessend uebrige gueltige UTF-8-Escapes einmal dekodieren.
Eine Dekodierung, die ein bereits erzeugtes nacktes `%` nochmals an
`decodeURIComponent` uebergibt, ist gerade zu vermeiden. Weitere
mehrfach kodierte Nutzzeichen nur gemaess ausdruecklich festgelegtem
Vertrag entschaerfen, nicht aus einer endlosen Decode-Schleife ableiten.

**Auch die Serialisierung mitziehen:** `Locator.parse` liefert derzeit
dekodierte Werte auch in `uri`; der Composer reicht diese URI erneut an
`DataSource.fetch` und damit an `Locator.parse` weiter. Eine Query mit
literalem `%` waere beim zweiten Parsen wieder ungueltig. `path`/`query`
duerfen dekodierte Nutzwerte bleiben, `uri` muss jedoch eine erneut
parsebare Kodierung verwenden, insbesondere `%25` fuer Prozentliterale.
Erhalte echte `/`-Pfadtrenner und kodiere die einzelnen Nutzsegmente.
Pruefe `parse(parse(input).uri)` sowie den vollstaendigen
Composer-DataSource-Pfad auf gleiche Ressourcen-/Query-Semantik.

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

**Konkreter Loesungsansatz**

Pruefe zu Beginn der Verarbeitung eines gueltigen Keys
`Object.prototype.hasOwnProperty.call(Messages, key)`. Ist der Key
bereits vorhanden, diesen gesamten Label-Eintrag ueberspringen, bevor
entweder der Baum oder die flache Property geschrieben wird. Die
`Namespace.exists("Messages", key)`-Pruefung entfaellt.
Fuer die Objektbaumdarstellung kann der Namespace-Pfad weiterhin
verwendet werden; nur die flache Duplikatidentitaet ist davon getrennt.
Die Key-/Reserviert-Pruefung aus R50 muss zuerst laufen, damit etwa die
Methode `populate` nicht faelschlich als harmloses Label-Duplikat gilt.

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

**Konkreter Loesungsansatz**

Ersetze die Schleife in `Messages.populate` und die anschliessende
Bereinigung durch genau einen `replace`-Aufruf auf der Originalvorlage.
Der folgende Kern erhaelt auch die bisherige Schreibweise der
Platzhalter-Indizes: `{01}` wird nicht ploetzlich als `{1}` interpretiert.

```javascript
return text.replace(/\{(\d+)\}/g, (match, digits) => {
    const index = Number(digits);
    return String(index) === digits && index < values.length
        ? String(values[index]) : "";
});
```

Der Callback gibt Werte literal zurueck; `$&` ist daher keine
Replacement-Anweisung. Explizit uebergebenes `undefined` bleibt durch
`String` von einem fehlenden Argument unterscheidbar, entsprechend
dem bisherigen Replacement-Verhalten. Eingesetzte `{1}`-Texte werden
nicht erneut besucht. Den bisherigen Lookup der Message-Vorlage
ausserhalb dieses Kerns beibehalten.

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

**Konkreter Loesungsansatz**

Im aktuellen Quellstand ist der empfohlene Weg bereits in `scheduleTask`
umgesetzt: synchronen Aufruf von `task.meta.test()` mit `try/catch`
erfassen und den Rueckgabewert mit `Promise.resolve(result).then(...)`
assimilieren. Erfolg ruft `completeTask(worker, task)` auf, Ablehnung
`completeTask(worker, task, true, error)`. Das behandelt fremde Thenables
und einen werfenden `then`-Getter ueber den Promise-Mechanismus, ohne
eigene fehleranfaellige Thenable-Erkennung zu benoetigen.

`completeTask` prueft Laufidentitaet, aktuelle Task-Identitaet und
`task.completed`, bevor es Zaehler oder Ereignisse veraendert.
Timeouts rufen denselben Helfer auf. Diesen Mechanismus erhalten und
gegen die untenstehenden Faelle absichern; keine zweite Async-Queue
einbauen. Der Rejection-Handler muss auch nach Timeout/Interrupt am
Promise bleiben, damit spaete Ablehnungen behandelt sind, obwohl
`completeTask` dann bewusst keine Zustandsaenderung mehr ausfuehrt.

**Problem und Ziel:** Der Runner ignoriert den Rueckgabewert einer Testfunktion.
Ein `async`-Test wird mit Rueckgabe des Promise bereits erfolgreich abgeschlossen,
obwohl spaeter eine Assertion scheitert. Ein solcher Lauf darf niemals falsch
gruen erscheinen.

**Entscheidung:** Promise-/Thenable-Rueckgaben werden unterstuetzt. Die
Testfunktion bleibt bis zur Erfuellung oder Ablehnung Teil des laufenden Tasks;
spaete Reaktionen nach Timeout oder Interrupt werden kontrolliert entgegengenommen.

**Umsetzung**

1. Erfasse den Rueckgabewert und warte entsprechend der bereits getroffenen
   Entscheidung Promise-/Thenable-Rueckgaben ab.
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

**Konkreter Loesungsansatz**

Verwende den bereits vorhandenen
`completeTask(worker, task, thrown, value, timedOut)` als einzigen
Abschlussweg. `task.completed` wird vor dem Versenden von `RESPONSE`
gesetzt; `timedOut` beschreibt die Herkunft des Ergebnisses explizit.
Ein Fehlertext wird nicht mehr fuer die Entscheidung "schon gemeldet"
verwendet. Fehlerbewertung, Dauer, Zaehler und Queue-Lock werden vor
`createStatus(worker)` konsistent aktualisiert.

Wichtig ist die Idempotenz auch bei reentrantem Listener-Code:
Ein `RESPONSE`-Listener kann weitere Teststeuerung ausloesen. Nach
dem bereits markierten Abschluss darf weder ein Timeout-Tick noch
eine Promise-Reaktion denselben Task ein zweites Mal abschliessen.
Im aktuellen Quellstand existiert dieser Ablauf; die Aufgabe verlangt
keinen parallelen neuen Timeout-Meldungsmechanismus.

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

**Konkreter Loesungsansatz**

Der aktuelle `completeTask` erhaelt das Auftreten einer Exception
bereits getrennt als `thrown` und ihren Originalwert als `value`.
Behalte diese Trennung bei, auch fuer `throw undefined` oder
`throw false`. `matchesExpected(expected, value)` prueft zuerst den
Originalwert; erst ein unerwarteter Fehler wird durch
`normalizeError(value)` in einen fuer Status und Monitor brauchbaren
Fehler ueberfuehrt.

Verwende die vorhandenen `normalizeError`-/`errorText`-Helfer statt
einer zweiten Normalisierung im Catch oder Monitor. Sie duerfen nicht
in den geworfenen Wert schreiben. Fuer weiterfuehrende Diagnose kann
ein neu erzeugter Wrapper den Originalwert als `cause` behalten,
analog R20. Die Zaehlung wird aus `task.error` nach der Ergebnisbewertung
abgeleitet, nicht aus `value instanceof Error`. Pruefe
Cross-Realm-Errors und problematische Konvertierungen genau an diesem
Pfad, statt sie durch einen pauschalen erfolgreich-Ausgang zu umgehen.

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

**Konkreter Loesungsansatz**

Der aktuelle Runner verwendet bereits einen privaten `_worker` und
je Lauf ein eingefangenes `worker`-Objekt. Die benoetigte
Gueltigkeitspruefung lautet `_worker === worker && !worker.interrupted`;
ein alter Callback kann dadurch keinen neu gestarteten Lauf bedienen.
`worker.paused` ist getrennt von `worker.status` und wird nur durch
Suspend/Resume veraendert.

Erhalte die vorhandene Staffelung `scheduled`, `started`, `completed`
am Task: Vor Planung und innerhalb des geplanten Callbacks werden
Pause und Laufidentitaet erneut geprueft. Erst beim wirklichen Start
werden Startzeit und Timeout-Deadline gesetzt. Interrupt markiert den
alten Worker, raeumt dessen Timer auf und setzt `_worker` nur dann
zurueck, wenn er immer noch derselbe Worker ist; das ist fuer Neustart
innerhalb eines Interrupt-Listeners wesentlich.

Die bereits beschlossene Pause-Semantik ist konkret: laufende
Promises und ihre Deadlines laufen weiter, `RESPONSE` darf eintreffen,
aber die Queue startet bis Resume keinen neuen Task. Deshalb nicht
nachtraeglich auch den Timeout-Intervall blind mit `worker.paused`
blockieren. Nach jedem externen Callback, insbesondere `START`,
`PERFORM` und Abschlussereignissen, die Gueltigkeit beachten.

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

**Konkreter Loesungsansatz**

Extrahiere die bestehende Recipient-Benachrichtigung aus dem Set-Trap
in einen gemeinsamen internen Pfad fuer einen Schluessel. Dieser
verwendet `notifications.get(key)` auch dann, wenn der Schluessel
inzwischen aus `target` entfernt wurde. Der aktuelle Guard
`if (!target.hasOwnProperty(key)) return` muss fuer die Benachrichtigung
entfallen; er verhindert sonst gerade den Delete-Fall.

`deleteProperty` erfasst vorab den eigenen Descriptor, ruft
`Reflect.deleteProperty(target, key)` auf und meldet nur bei Erfolg
und zuvor vorhandener Property die Entfernung. Den Rekursionscache
fuer diesen Key invalidieren, damit eine spaetere Neuanlage nicht
als alter Write unterdrueckt wird. `defineProperty` vergleicht eigene
Deskriptoren vor/nach `Reflect.defineProperty`, ohne dafuer Getter
auszufuehren, und meldet relevante Aenderungen.

Arrays benoetigen einen Zusatzpfad: Beim direkten Verkuerzen von
`length` fuehrt die Engine Loeschungen auf dem Target aus, ohne fuer
jeden Index einen Proxy-Delete-Trap aufzurufen. Erfasse deshalb vorher
die betroffenen abonnierten Index-Keys und benachrichtige sie nach
einer tatsaechlichen Laengenkuerzung; bei Index-Neuanlage auch
`length`-Verbraucher beruecksichtigen. Vergleiche den realen
Nachzustand, nicht nur den angeforderten Wert. Array-Laengenwrites
koennen an nichtkonfigurierbaren Indizes teilweise scheitern und
trotzdem bereits andere Indizes entfernt haben: Fehler weitergeben,
aber tatsaechliche Teilmutationen nicht als ungeschehen behandeln.

R15 verwendet `Reflect.set` am Originaltarget und vermeidet dadurch
den doppelten Set-/Define-Pfad. Ein fehlender eigener Key darf zudem
eine erneute Registrierung eines zuvor geloeschten und weiter
gelesenen Felds nicht dauerhaft verhindern. Passe den Registrierungs-
Guard gezielt an, sodass Delete, erneutes Lesen und spaetere Neuanlage
zusammen funktionieren; `_shadow`-Cleanup fuer DOM-Verbraucher bleibt.

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

**Konkreter Loesungsansatz**

Setze die Validierung unmittelbar nach der HTTP-Statuspruefung und
vor jedem `_cache`-/Map-Schreibzugriff. Verlange ein vorhandenes
XML-Dokument mit `documentElement`. Pruefe erkannte browserseitige
Parserfehler anhand ihrer charakteristischen Dokumentwurzel und
gegebenenfalls Parserfehler-Namespace, nicht mit einer pauschalen
Suche nach irgendeinem Nutzdatenelement namens `parsererror`.

Bei Fehler einen `Error` mit angeforderter Ressourcenadresse und
Parsefehlerdiagnose werfen; kein `null` und kein Fehlerobjekt als
positiven Cache-Wert speichern. Erst danach `documents.set(url, data)`
aus R31 und `data.clone()` ausfuehren. Ein erneuter Abruf derselben
URL trifft somit keinen vergifteten Eintrag. Fuer den Regressionstest
die erste und zweite Antwort derselben lokalen URL kontrollieren
und die Request-Anzahl mitpruefen; ein Test nur mit einer neuen URL
wuerde den Cachefehler nicht nachweisen.

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

**Konkreter Loesungsansatz**

Hier ist eine `WeakMap<XMLHttpRequest, RequestState>` sinnvoll:
Die XHR-Instanz ist bereits ein Objekt-Key, es wird weder Enumeration
noch `size` benoetigt und die Zuordnung soll die Instanz nicht
kuenstlich am Leben halten. Die bisherige `_request_monitoring`
ist dagegen nur eine `WeakSet` zur einmaligen Listenerregistrierung.
Sie kann getrennt bleiben oder in denselben RequestState integriert
werden.

Die Listener lesen beim Ereigniseintritt `state.current` und halten
diesen Wert fuer genau dieses Ereignis fest, statt das erste `meta`
in ihrer Closure zu verwenden. Ein neuer `open` erzeugt eine neue
Metadateninstanz, veraendert aber keine bereits versendeten Metadaten.
Da natives `open` synchron `readystatechange` ausloesen kann, reicht
ein Setzen der Map erst nach `_request_open.call(...)` nicht.

Verwalte den Uebergang bei Bedarf als `{current, pending}`: Der
erfolgreiche OPENED-Uebergang uebernimmt die neuen Metadaten; bis
dahin auftretende Abschluesse des alten Requests behalten dessen
Metadaten. Nach erfolgreichem nativen `open` die noch eigene pending
Instanz abschliessen; bei einer Exception nur den eigenen Versuch
zuruecknehmen und die Exception weitergeben. Identitaetspruefungen
verhindern, dass ein reentrant aus einem Listener gestartetes `open`
dabei ueberschrieben wird. Die bewusst abweichende Position von
`EVENT_HTTP_START` gemaess vorhandenem Runtime-Vertrag beibehalten.

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

**Konkreter Loesungsansatz**

Uebernimm fuer `Namespace.lookup` den bereits in `Namespace.use`
vorhandenen Objekt-only-Guard:
`variants.length === 1 && variants[0] !== null && typeof variants[0] === "object"`.
Nach der fuer Lookup erforderlichen Root-Validierung die Wurzel
direkt zurueckgeben, bevor `levels.join(".").split(...)` aus einem
leeren Restpfad `[""]` erzeugt. Die DOM-Root-Ablehnung aus R22 darf
dieser Sonderpfad nicht umgehen.

`Namespace.exists`, `Object.lookup` und `Object.exists` delegieren
bereits an Lookup beziehungsweise Exists; keine vier duplizierten
Sonderbehandlungen einbauen. Die Signatur `(root, "")` besitzt
dagegen ein ausdrueckliches Pfadargument und faellt nicht automatisch
unter den Objekt-only-Guard.

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

**Konkreter Loesungsansatz**

Behalte Typpruefungen und Sonderfaelle am Anfang von `Path.matches`.
Nach dem vorhandenen Split fuehre einen Zaehler `matched` bis
`Math.min(path.length, compare.length)`, solange die Segmente gleich
sind. Liefere `path.slice(0, matched).join("") || null`.
Alternativ kann das erste Array vor der vorhandenen Schleife auf
die gemeinsame maximale Laenge gekuerzt werden. Entscheidend ist,
dass auch beim vollstaendig passenden kuerzeren Argument abgeschnitten
wird, nicht nur bei der ersten Abweichung. Kein `startsWith` auf
ungetrennten Pfadstrings verwenden.

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

**Konkreter Loesungsansatz**

Die aktuelle Fehlerstelle ist in `console.forward` die Zeile
`_output[level] += variants.join(", ")`. Verwende fuer die
Bufferdarstellung eine separate Stringfolge, beispielsweise
`variants.map(value => value == null ? "" : String(value)).join(", ")`.
Die Behandlung von `null`/`undefined` als leer erhaelt das bisherige
`Array.join`-Verhalten; die explizite `String`-Konvertierung macht
Symbole darstellbar.

`variants` selbst nicht durch diese Strings ersetzen. Die bereits
vorhandenen Callback-Snapshots, der Aufruf der Originalconsole und
die Weiterleitung bekommen weiter die Originalargumente. Dadurch
bleibt auch die Browserdarstellung von Objekten erhalten. Eine
vollstaendige neue Objektserialisierung ist fuer diesen Befund
nicht erforderlich.

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

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** erledigt
**Paket:** `fehlererkennung` | **Abstimmung:** [R40](#r40)
**Fundstellen:** `sources\test.js:293-299`

**Konkreter Loesungsansatz**

Der aktuelle Standardmonitor ruft `.trim()` inzwischen bereits auf:
`String(status.task.error.message || "unknown error").trim()`.
Der historische Funktionsausgabe-Fehler ist an dieser Stelle also
nicht mehr vorhanden. Noch zu pruefen ist die Reihenfolge des
Fallbacks: Ein nur aus Leerzeichen bestehender String ist vor
`trim()` truthy und ergibt danach eine leere Ausgabe.

Die vollstaendige Form fuer den normalisierten Error lautet
`String(status.task.error.message).trim() || "unknown error"`.
Den Ersatztext erst nach dem Trimmen bestimmen und im vorhandenen
`response`-Monitor interpolieren. Die Fehlernormalisierung aus R40
beibehalten; keinen zweiten Monitor und keine weitere Catch-Schicht
einfuehren. Status erst nach den konkreten Ausgabe-Abnahmen aktualisieren.

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

- [x] Ein Fehler `BOOM` erscheint als `BOOM`, nicht als `function trim()`.
- [x] Fuehrende und nachfolgende Leerzeichen werden entfernt.
- [x] Eine leere oder reine Whitespace-Meldung verwendet den vorgesehenen Ersatztext.

**Testansatz:** `test\test_assert_message.html`; die reale Monitorausgabe
unabhaengig erfassen.
**Erledigt, wenn:** Der Standardmonitor Text und niemals die trim-Funktion ausgibt.

### R49

**Timeout-Zaehler vor dem RESPONSE-Snapshot aktualisieren**

**Prioritaet:** niedrig | **Aufwand:** 1 SP | **Status:** erledigt
**Paket:** `fehlererkennung` | **Abstimmung:** [R38](#r38), [R39](#r39), [R41](#r41)
**Fundstellen:** `sources\test.js:335-339, 393-398`

**Konkreter Loesungsansatz**

Der aktuelle `completeTask` aus R39 erledigt die Reihenfolge bereits:
Fehler bestimmen, gegebenenfalls `worker.queue.faults++`, Queue-Lock
freigeben und danach
`Test.fire(EVENT_RESPONSE, createStatus(worker))`.
Sowohl der Timeout-Intervall als auch die nachtraegliche Deadline-
Pruefung eines abgeschlossenen Tests muessen diesen Weg verwenden.

Keine zusaetzliche Erhoehung im Timeout-Intervall einfuehren; sie
wuerde jetzt doppelt zaehlen. Verifiziere den noch offenen
Snapshot-Test gegen den gemeinsamen Abschlussweg. Der historische
Hinweis auf zwei getrennte Timeout-RESPONSE-Pfade beschreibt nicht
mehr die aktuelle Implementierung.

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

- [x] Ein synchroner Test mit `timeout:1` und etwa 10 ms Laufzeit liefert bereits in RESPONSE `faults:1`.
- [x] Ein timerbasierter Timeout eines ausstehenden Tasks meldet ebenfalls den aktuellen Zaehler.
- [x] RESPONSE und FINISH stimmen ueberein; ein spaeter Abschluss erhoeht den Zaehler nicht erneut.

**Testansatz:** `test\test_events.html`; die Snapshots von aussen vergleichen.
**Erledigt, wenn:** Jeder Timeout-RESPONSE den bereits verbuchten Fehler enthaelt.

### R50

**Message-Key-Vertrag und Kollisionen explizit behandeln**

**Prioritaet:** niedrig | **Aufwand:** 2 SP | **Status:** offen
**Paket:** `aufloesung_caches` | **Abstimmung:** [R36](#r36)
**Fundstellen:** `sources\messages.js:54-68, 80-86`

**Konkreter Loesungsansatz**

Fuer die begrenzte Ablehnungsvariante einen internen
`validateMessageKey(key)` vor allen Schreibzugriffen in `_load`
verwenden. Er prueft die abgestimmte Segmentgrammatik sowie eine
explizite Menge reservierter Namen fuer die flache API und die
Baumdarstellung. Neben `populate` insbesondere `toString` beachten:
Jeder Message-Baumknoten besitzt bereits eine eigene `toString`-
Methode. Auch geerbte Namen wie `constructor` oder `__proto__`
duerfen nicht versehentlich als bestehende Datencontainer gelten.

Als begrenzten Ladevertrag empfiehlt sich: unvereinbaren Eintrag
mit `console.error` samt Key, Locale und Quelle diagnostizieren,
diesen Eintrag vollstaendig ueberspringen und weitere Labels laden.
Die Quelle muss `_load` dazu vom globalen und vom Modul-Ladepfad
erhalten; nur das XMLDocument liefert nicht verlaesslich einen
brauchbaren Ressourcenbezug. Die Entscheidung vor Umsetzung
abstimmen und im Manual festhalten.

Vor Installation beide Darstellungen auf Kollisionen pruefen, damit
eine erfolgreiche flache Property nicht mit einem fehlgeschlagenen
Baumeintrag zurueckbleibt. Fuer eine spaetere Unterstuetzung beliebiger
Keys waere dagegen eine echte Trennung von Daten und Methoden
notwendig; das Lockern der Regex allein behebt diese Kollisionen nicht.

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

**Konkreter Loesungsansatz**

Nutze den inzwischen vorhandenen Helfer `parentContext(name)`:
Er prueft Top-Level versus Frame, liest `parent[name]` in einem
engen `try/catch` und toleriert ausschliesslich
`error.name === "SecurityError"`. `console.forward` verwendet bereits
`parentContext("console")`; auch `Test.fire` nutzt denselben Helfer.
Es wird kein zweiter Zugriffsschutz neben diesem benoetigt.

Die bewusst nicht verfuegbare optionale Weiterleitung liefert kein
Parent-Ziel; lokale Ausgabe und Listener bleiben im vorhandenen
Callback-Ablauf. Andere Fehler werden weitergeworfen. Hier keine
Warnung ueber die gerade umgeleitete Console ausgeben, da sie
denselben gesperrten Pfad erneut betreten koennte. Pruefe den
aktuellen Helfer mit zwei lokalen Origins und dokumentiere den
Abschluss erst nach unabhaengiger Beobachtung der lokalen Ausgabe.

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

**Konkreter Loesungsansatz**

Verwende in `_export` einen kleinen lokalen Container-Guard:
`value !== null && (typeof value === "object" || typeof value === "function")`.
Pruefe damit Root und jede nach dem Property-Lesen erhaltene
Zwischenebene. Nur wenn der Wert tatsaechlich `undefined` ist,
gemaess bestehendem Vertrag einen neuen Container erzeugen.
`null` oder primitive vorhandene Werte sind ein Konflikt, kein
Anlass fuer stilles Ersetzen.

Fuehre sowohl die Anlage fehlender Zwischencontainer als auch den
finalen Export mit `Reflect.set(container, name, value)` aus.
Bei `false` einen ausdruecklichen Exportfehler mit vollstaendigem
Zielpfad werfen; Setter-Ausnahmen nicht verschlucken. So werden
auch nicht erweiterbare Objekte und nicht schreibbare Properties
im bisher nicht-strikten Helfer zu erkennbaren Fehlschlaegen.
Die bestehende Regel fuer bereits belegte finale Namen und die
beabsichtigte Ausnahme fuer browserseitige Element-/HTMLCollection-
Bindings erhalten. Kein allgemeines "bei jedem Konflikt ueberschreiben".

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
