# Task: Dokumentation systematisch reviewen

## User Story

Als Entwickler:in, die composite-js kennenlernen, einsetzen oder warten möchte,
möchte ich eine fachlich korrekte, konsistente und verständliche Dokumentation
vorfinden, damit ich das Laufzeitmodell, die APIs und typische Abläufe
eigenständig nachvollziehen und korrekt anwenden kann.

## Ziel

Die Projektdokumentation wird anhand eines einheitlichen Prüfrasters untersucht.
Das Review soll belegbare fachliche Fehler, Verständnis- und Navigationslücken,
Inkonsistenzen sowie unnötige Wiederholungen sichtbar machen und nach
Auswirkung priorisieren. Es soll außerdem festhalten, was bereits gut erklärt
ist und erhalten bleiben sollte.

Das Review umfasst Analyse und begrenzte redaktionelle Überarbeitung:
Unnötige Wiederholungen innerhalb eines Dokuments und monoton gleich beginnende
Abschnitte in enger Nachbarschaft werden, wo sinnvoll, direkt überarbeitet.
Dabei bleiben fachliche Aussage, beabsichtigte Betonung und notwendige
Wiederholungen für die Eigenständigkeit der Einstiegskapitel erhalten.
Fachliche oder größere strukturelle Änderungen werden als separate
Folgeaufgaben dokumentiert, sofern sie nicht ausdrücklich Teil des Auftrags
sind.

## Geltungsbereich

- Die Manuals einschließlich Inhaltsverzeichnis, Einstiegsdokumenten und
  verlinkten Detailkapiteln.
- Relevante Beispiele, API-Beschreibungen, interne Verweise und Aussagen über
  Runtime-Verhalten.
- Die vorgesehenen Rollen der Dokumente: Einführung, Architektur,
  Getting Started und technische Referenz. Fehlende Inhalte sind nur dann ein
  Mangel, wenn sie für die jeweilige Rolle erforderlich sind.

## Aufgabe der eigenständigen Einstiegsdokumente

`../../manuals/introduction.md`, `manuals/architecture.md` und
`manuals/getting-started.md` sind die drei rollenspezifischen Einstiegspunkte
in composite-js. Sie ergänzen einander, sind keine mehrfachen Fassungen
derselben Einführung und bilden keine verpflichtende Lesereihenfolge. Leser:innen
sollen mit dem Dokument beginnen können, das zu ihrem Ziel passt.

Jedes dieser Dokumente muss deshalb seinen Kontext und die für sein Ziel
wesentlichen Konzepte selbst erklären. Eigenständig verständlich bedeutet nicht,
dass jedes Dokument eine vollständige API-Referenz enthält: Die Einstiege
vermitteln genug Wissen, um ihren Erklärungen und Beispielen folgen zu können;
Detailverhalten und Sonderfälle gehören weiterhin in die jeweiligen
Referenzmanuals.

- `introduction.md` erklärt Zweck, Kernkonzepte und Gestaltungsprinzipien und
  gibt eine konzeptionelle Orientierung.
- `architecture.md` erklärt das Zusammenspiel von Anwendungs- und
  Laufzeitmodell, Verantwortlichkeiten, Beziehungen, Scopes, Lifecycle und
  Grenzen. Es soll weder Installationsanleitung noch ausführbares Tutorial
  ersetzen.
- `getting-started.md` beschreibt Voraussetzungen und führt durch ein
  vollständiges, ausführbares erstes Beispiel. Es erklärt Aufbau und Verhalten
  des Beispiels, statt nur zum Kopieren von Code anzuleiten.

Links dürfen diese Erklärungen ergänzen, aber nicht ersetzen. Wird ein
verlinktes Thema zum Verständnis des Dokuments oder zur Ausführung seiner
Beispiele benötigt, muss das erforderliche Wissen lokal knapp, aber ausreichend
erklärt und anschließend mit der Detailreferenz verknüpft werden. Diese
bewusste Wiederholung erhält die Eigenständigkeit der Einstiege. Ihre
Zusammenfassungen müssen bei Verhaltensänderungen mit den Detailmanuals
konsistent gehalten werden, ohne ganze Referenzabschnitte oder sachfremde
Einzelheiten zu duplizieren.

## Allgemeine Review-Punkte

1. **Fachliche Korrektheit und Aktualität**
   - Stimmen Aussagen über APIs, Syntax, Laufzeitverhalten, Fehler und
     Kompatibilität mit den maßgeblichen Quellen, Tests und Builds überein?
   - Sind Aussagen und Beispiele an konkrete Versions- oder
     Veröffentlichungsstände gebunden, und passen sie zur tatsächlich
     verwendeten Runtime?
   - Liefern externe oder versionsgebundene URLs tatsächlich die Runtime und
     API, auf die sich Text und Beispiele beziehen? Maßgeblich ist die dort
     geladene Version, nicht allein der aktuelle Quellcode im Repository.
   - Wenn ein Versionsvergleich Teil des Auftrags ist: Werden Klarstellungen,
     Ergänzungen und entfallene Aussagen unterschieden und mögliche
     Informationsverluste danach bewertet, ob sie für die jeweilige
     Dokumentrolle relevant sind?

2. **Vollständigkeit im Verhältnis zur Dokumentrolle**
   - Vermittelt jedes Kapitel das Wissen, das seine Zielgruppe für den
     vorgesehenen Zweck benötigt?
   - Sind Grundlagen lokal ausreichend erklärt, oder setzt der Text
     unbegründet voraus, dass Leser:innen zuvor andere Kapitel gelesen haben?
   - Werden bewusst ausgelassene Inhalte nicht fälschlich als Lücke bewertet,
     wenn sie in ein anderes Dokument gehören?

3. **Verständlichkeit und Lernfluss**
   - Werden Begriffe eingeführt, bevor sie vorausgesetzt werden?
   - Ist die Reihenfolge vom Zweck und Grundmodell zu den konkreten Abläufen
     nachvollziehbar?
   - Sind Abstraktionen durch Beispiele verankert, ohne Einführung,
     Architekturübersicht und Referenz unnötig zu vermischen?
   - Wird bei zentralen Konzepten auch ihre Bedeutung für die Zielgruppe
     deutlich, statt sie nur abstrakt zu benennen?
   - Werden wesentliche Abstraktionen bei Bedarf durch einen knappen
     konkreten Anhaltspunkt verständlich, ohne die Dokumentrolle zu verschieben?

4. **Beispiele und Anwendbarkeit**
   - Sind Beispiele vollständig, konsistent und mit der beschriebenen Runtime
     ausführbar, insbesondere mit den Runtime-Versionen und externen URLs, die
     das Dokument tatsächlich einbindet?
   - Erklären sie den Zusammenhang der verwendeten Bestandteile und das
     erwartete Ergebnis, statt nur Codefragmente aufzuzählen?
   - Sind Schritte, Voraussetzungen und URLs eindeutig, wenn das Dokument eine
     ausführbare Anleitung sein soll?

5. **Konsistenz und Abgrenzung**
   - Werden Begriffe, API-Namen und Verhaltensbeschreibungen über Kapitel
     hinweg einheitlich verwendet?
   - Ergänzen sich die Dokumente entsprechend ihrer Rollen, oder gibt es
     Widersprüche, doppelte Erklärungen beziehungsweise fehlende Übergänge?
   - Sind Zuständigkeiten und Grenzen der Runtime sowie der Anwendung dort
     erklärt, wo sie für das Verständnis wichtig sind?

6. **Navigation und redaktionelle Qualität**
   - Funktionieren Inhaltsverzeichnis, interne Links und Markdown-Anker?
   - Sind Überschriften aussagekräftig und Abschnitte auffindbar?
   - Gibt es unnötige Wiederholungen innerhalb eines Dokuments, insbesondere
     wenn spätere Abschnitte bereits erklärte Inhalte ohne zusätzlichen Nutzen
     erneut darstellen?
   - Beginnen mehrere benachbarte Abschnitte auffällig ähnlich, etwa mit
     wiederkehrenden Einleitungssätzen oder Satzmustern? Wenn das den Lesefluss
     monoton macht, sind die Einstiege so zu überarbeiten, dass sie jeweils den
     eigenen Schwerpunkt klar und abwechslungsreich einführen. Eine
     beabsichtigte parallele Struktur soll dabei nicht allein um der Variation
     willen verändert werden.
   - Gibt es kategorische Formulierungen, die zu Missverständnissen führen
     können?
   - Wird die Dokumentation nicht allein durch zusätzlichen Umfang, sondern
     durch relevante und gut platzierte Information verbessert?

7. **Nachvollziehbarkeit der Befunde**
   - Ist jeder Befund durch konkrete Textstellen und, bei technischen Aussagen,
     durch passende Quellen oder Tests belegt?
   - Sind Fehler, echte Wissenslücken, redaktionelle Verbesserungen und
     bewusste Abgrenzungen voneinander unterschieden?
   - Werden Auswirkungen auf Leser:innen und eine umsetzbare Empfehlung
     genannt?

## Spezielle Prüfpunkte für `architecture.md`

Diese Punkte stammen aus dem Architektur-Feedback und sind im Review anhand der
aktuellen Implementierung und Dokumentstruktur zu verifizieren. Sie sind
Prüffragen, keine vorweggenommenen Fehler. Maßstab ist die Rolle von
`architecture.md` als eigenständige, konzeptionelle Erklärung des Laufzeit- und
Anwendungsmodells: Grundlegende Zusammenhänge müssen lokal verständlich sein;
vollständige API-Beschreibungen und Sonderfälle bleiben den Referenzmanuals
vorbehalten.

- **Durchgehendes Architekturmodell:** Kann man den Weg von der
  Composite-Deklaration über Ressourcenauflösung und Script bis zum
  Application Object, zur View und zum Binding lokal nachvollziehen, ohne
  Beziehungen aus anderen Manuals zusammensetzen zu müssen? Dafür genügt ein
  zusammenhängender konzeptioneller Ablauf; ein vollständiges ausführbares
  Tutorial ist nicht erforderlich.
- **Wirkung des Bindings:** Wird die architektonische Beziehung und ihre
  wesentliche Wirkung auf konzeptioneller Ebene verständlich? Konkrete
  Bindungsarten wie Wertübertragung, Ereignisweiterleitung oder Methodenaufrufe
  sind nur aufzunehmen, wenn sie für das Modell wichtig und von der Runtime
  tatsächlich unterstützt sind. API-Details gehören in die Referenz.
- **Aktualisierung und Rendering:** Wird auf konzeptioneller Ebene deutlich,
  wodurch eine Ansicht erneut gerendert oder aktualisiert wird und ob Binding
  allein spätere Änderungen abdeckt? Explizite Render-Anforderungen und
  reaktive Abhängigkeiten sind nur so weit zu erklären, wie es zum Verständnis
  des Laufzeitmodells nötig ist; Details können verlinkt werden.
- **Lifecycle und Objektlebensdauer:** Werden Realisierung, aktive Präsenz und
  Entfernung sowie deren Verhältnis zur Lebensdauer des Application Objects
  verständlich eingeordnet? `dock()` und `undock()` sind nur insoweit zu
  erläutern, wie ihre Rolle für dieses Modell relevant ist; die vollständige
  API- und Ereignisreferenz bleibt außerhalb des Architekturkapitels.
- **Wiederverwendung:** Ist eine Formulierung wie „not a reusable UI component“
  so eingeordnet, dass sie die Abgrenzung vom üblichen instanziierten
  Komponentenmodell erklärt und nicht als generelles Verbot von Wiederverwendung
  verstanden wird?
- **Aufbau und Redundanz:** Ist das Modell in einer hilfreichen Reihenfolge
  erklärt und durch einen kompakten, zusammenhängenden Ablauf verankert?
  Unnötige Wiederholungen innerhalb des Kapitels sind von der beabsichtigten
  Wiederholung zentraler Grundlagen in den drei eigenständigen Einstiegen zu
  unterscheiden. Ganze Referenzabschnitte oder sachfremde Details sollen nicht
  dupliziert werden.
- **Korrekte Querverweise:** Verweisen Links auf tatsächlich vorhandene
  Überschriften? Ergänzen Detailkapitel die lokale Erklärung und führen sie zu
  Vertiefungen, statt notwendige Grundbegriffe oder das Verständnis des
  Architekturmodells zu ersetzen?
- **Kernmodell und fachliche Präzision:** Sind Aussagen zu optionalen
  Application Modules, Scopes, Namespaces, Trust Boundary und statischem
  Laufzeitmodell korrekt und für das Architekturverständnis ausreichend
  erklärt? Ein Vergleich mit früheren Fassungen ist nur erforderlich, wenn er
  ausdrücklich Teil des Review-Umfangs ist.
- **Passende Dokumentrolle:** Kann das Kapitel das Anwendungs- und
  Laufzeitmodell eigenständig verständlich machen, ohne Installationsanleitung,
  vollständiges API-Handbuch oder ausführbares Getting Started zu werden?

## Spezielle Prüfpunkte für `introduction.md`

Diese Punkte stammen aus dem Introduction-Feedback und sind anhand der
aktuellen Implementierung und Dokumentstruktur zu verifizieren. Sie sind
Prüffragen, keine vorweggenommenen Fehler. Maßstab ist die Rolle von
`introduction.md` als eigenständige konzeptionelle Orientierung zu Zweck,
Kernkonzepten und Gestaltungsprinzipien: Das mentale Grundmodell muss lokal
verständlich sein, ohne das Architekturkapitel, ein ausführbares Tutorial oder
die Referenzmanuals zu ersetzen.

- **Greifbares Composite-Grundmodell:** Wird ein Composite so erklärt, dass
  Leser:innen eine Deklaration im Markup grundsätzlich erkennen und seine
  Bestandteile einordnen können? Ein knapper konkreter Anhaltspunkt, etwa die
  Rolle der Attribute `composite` und `id`, kann die Erklärung erden, sofern
  er das tatsächliche Verhalten korrekt wiedergibt. Ist ein kurzes,
  zusammenhängendes Beispiel hilfreich, um Composite-Deklaration,
  Anwendungslogik und Zugriff der View miteinander zu verbinden? Ein
  vollständiges ausführbares Beispiel oder Dateibaum ist dafür nicht
  erforderlich.
- **Zusammenspiel und Optionalität:** Wird verständlich, wie View,
  Anwendungslogik und Ressourcen zusammenhängen, ohne den Eindruck zu
  erwecken, jedes Composite müsse für alle drei eigene Dateien oder ein
  separat geladenes Anwendungsmodul besitzen? Ist zugleich erkennbar, dass
  Laufzeitkomposition auch vorhandenes Markup und bereits vorhandene
  Anwendungsobjekte einbeziehen kann, sofern dies dem aktuellen Modell
  entspricht?
- **Expressions und Composite Binding:** Werden beide Konzepte auf
  Einführungsebene voneinander abgegrenzt und ihre jeweilige Rolle für die
  Verbindung von View und Anwendungslogik verständlich? Wird dabei knapp
  eingeordnet, was mit veröffentlichten Anwendungsobjekten und dem aus der
  Composite-ID aufgelösten Namespace gemeint ist? Die Erklärung soll das
  mentale Modell stützen; konkrete Syntax und Bindungsdetails gehören in die
  passenden Referenzmanuals.
- **Begriffe am Ort ihrer Verwendung:** Werden Begriffe wie
  Application Module und Composite Script vor oder bei ihrer Verwendung
  ausreichend eingeordnet? Wird das Application Module als Quelle der
  Anwendungslogik verständlich von einem ECMAScript-Modul abgegrenzt? Werden
  Begriffe wie Application Context und Lifecycle Management nur so weit lokal
  erklärt, wie es für das Grundverständnis nötig ist? Sind zusätzliche
  Build-Begriffe wie Composite Module oder Composer für die konzeptionelle
  Aussage nötig und, falls ja, lokal verständlich erklärt?
- **Praktische Bedeutung:** Wird deutlich, was Laufzeitkomposition für die
  Arbeit mit der Runtime ermöglicht, beispielsweise vorhandenes Markup oder
  separat organisierte Anwendungseinheiten einzubeziehen? Nutzen und Beispiele
  müssen durch das tatsächliche Verhalten gedeckt sein und sollen die
  Introduction nicht in ein Tutorial verwandeln.
- **Aussagen zu Rendering und Build:** Sind die knappen Beschreibungen von
  Rendering und optionalem Build fachlich korrekt und für diese Einführung
  ausreichend? Verweisen sie für weiterführende Abläufe auf passende
  Detailkapitel, ohne notwendiges Grundverständnis dorthin auszulagern?
- **Architekturverweis:** Ergänzt der Verweis auf `architecture.md` die lokale
  Erklärung und ermöglicht eine Vertiefung, statt erst dort zentrale
  Grundbegriffe oder die Beziehung zwischen Composite, Anwendungslogik und
  View verständlich zu machen?
- **Umfang und Eigenständigkeit:** Vermittelt das Kapitel ein tragfähiges
  mentales Modell, ohne die vollständige Architektur, ein erstes ausführbares
  Beispiel oder API-Details vorwegzunehmen? Ein kurzes, illustratives Beispiel
  darf die Kernbeziehung verdeutlichen, muss aber weder vollständig ausführbar
  sein noch Installation und alle Abläufe abdecken. Wiederholungen sollen
  reduziert werden, soweit sie keinen zusätzlichen Orientierungswert bieten;
  notwendige Grundlagenerklärungen für die Eigenständigkeit bleiben erhalten.

## Spezielle Prüfpunkte für `getting-started.md`

Diese Punkte stammen aus dem Getting-Started-Feedback und sind anhand der
aktuellen Implementierung, der tatsächlich eingebundenen Runtime und der
Dokumentstruktur zu verifizieren. Sie sind Prüffragen, keine vorweggenommenen
Fehler. Maßstab ist die Rolle von `getting-started.md`: Es führt durch ein
vollständiges, ausführbares erstes Beispiel und erklärt dessen Aufbau und
Verhalten. Es soll weder die Introduction wiederholen noch die ausführliche
Architekturerklärung ersetzen.

- **Ausführbarkeit und Runtime-Version:** Funktioniert das Beispiel mit genau
  der Runtime und API, die die Anleitung über ihre URLs tatsächlich lädt?
  Insbesondere sind CDN-Version und verfügbare APIs gegen die ausgelieferte
  Version zu prüfen, nicht nur gegen den aktuellen Quellcode im Repository.
  Der im Feedback genannte mögliche Widerspruch zwischen `expose(...)` im
  Beispiel und `#export` in Runtime `2.0.0` ist anhand der tatsächlich
  geladenen Datei erneut zu verifizieren; bestätigt er sich, muss die Anleitung
  oder die eingebundene Version so angepasst werden, dass Beispiel und Runtime
  zusammenpassen.
- **Vollständiger erster Durchlauf:** Sind Voraussetzungen, lokales
  Ausliefern über HTTP/HTTPS, zu veröffentlichendes Verzeichnis und
  aufzurufende URL so beschrieben, dass die Zielgruppe das Beispiel starten
  kann? Wenn ein vorhandener Webserver vorausgesetzt wird, ist diese
  Voraussetzung klar zu benennen; andernfalls soll ein knapper Startweg
  angegeben sein. Ist außerdem das erwartete sichtbare Ergebnis beschrieben?
- **Dateien und Ressourcen:** Wird deutlich, welche Dateien das Beispiel
  benötigt, wie ihre Pfade und das automatische Laden zusammenhängen und
  welche Ressourcen optional sind? Die Erklärung muss den tatsächlichen
  Ladeablauf widerspiegeln, ohne ein bestimmtes Set eigener Ressourcen für
  jedes Composite zu suggerieren.
- **Script-API und Anwendungsobjekt:** Wird erklärt, welche Funktionen wie
  `expose(...)` von der Runtime bereitgestellt werden und wie das Beispiel
  sein Anwendungsobjekt für das Binding verfügbar macht? Ist die Veröffentlichung
  von einem lokal im Script verbleibenden Objekt und von ECMAScript-Modul-
  Exporten unterscheidbar, soweit es für das Beispiel nötig ist?
- **Zusammenhang des Beispiels:** Können Leser:innen den Ablauf von der
  Composite-Deklaration über Script und Application Module bis zur View
  nachvollziehen? Werden zentrale Bindings wie `id="message"` und
  `example.message` sowie Ereignisbehandlung, Validierung und anschließendes
  Rendering so erklärt, dass verständlich wird, warum das Beispiel funktioniert?
- **CSS-Verhalten:** Wird ein für das Beispiel relevanter Unterschied zu
  komponentenbasierten Frameworks, etwa fehlendes automatisches CSS-Scoping,
  korrekt und knapp erklärt, ohne daraus ein allgemeines CSS-Kapitel zu machen?
- **Reaktivität als Folgeschritt:** Wird eine optionale reaktive Erweiterung
  auf dem zuvor erklärten Datenfluss aufgebaut? Sind die Änderung des Beispiels,
  die erfassten Abhängigkeiten und die daraus folgende Aktualisierung
  verständlich, ohne unnötige Runtime-Interna einzuführen?
- **Orientierung und Navigation:** Gibt ein kurzer Auftakt an, was Leser:innen
  erstellen und wie das Beispiel ausgeführt wird, ohne die Introduction zu
  wiederholen? Verweisen Inhaltsverzeichnis und Links auf die aktuellen
  Überschriften, auch wenn Abschnitte entfernt oder umbenannt wurden?
- **Passende Einstiegstiefe:** Bleibt die Erklärung auf das notwendige Wissen
  zum Ausführen und Verstehen des Beispiels beschränkt? Ausführliche
  Architekturdetails, Installationsvarianten und alternative Implementierungen
  sollen nur aufgenommen werden, wenn sie für diesen ersten Durchlauf nötig
  sind.

## Akzeptanzkriterien

- Der Review-Umfang und die Rolle der geprüften Dokumente sind festgehalten.
- Die drei Einstiegsdokumente sind jeweils ohne vorherige Lektüre der anderen
  Manuals verständlich, und ihre unterschiedlichen Aufgaben bleiben klar
  voneinander abgegrenzt.
- Jedes Dokument wurde auf unnötige inhaltliche Wiederholungen und auf
  monoton gleich beginnende benachbarte Abschnitte geprüft. Sinnvolle
  redaktionelle Anpassungen wurden direkt vorgenommen, ohne fachliche Aussagen
  oder beabsichtigte Parallelstrukturen zu verändern.
- Die allgemeinen Kriterien wurden auf alle Dokumente im vereinbarten Umfang
  angewendet; die speziellen Prüffragen für `architecture.md`,
  `introduction.md` und `getting-started.md` wurden zusätzlich geprüft.
- Technische Befunde sind mit Fundstelle und nachvollziehbarem Beleg
  dokumentiert. Beispiele und interne Links wurden auf Konsistenz geprüft.
- Das Getting-Started-Beispiel wurde gegen die tatsächlich eingebundene
  Runtime-Version und den beschriebenen Ausführungsweg geprüft.
- Jeder Befund nennt Auswirkung, Priorität und eine konkrete Empfehlung.
- Der Bericht unterscheidet Regressionen von bereits bestehenden Lücken, wenn
  ein Versionsvergleich Teil des Auftrags ist.
- Stärken und Inhalte, die beibehalten werden sollten, sind ebenfalls
  festgehalten.
- Nicht belegbare Vermutungen werden nicht als Fehler ausgegeben; nicht
  gefundene Probleme werden nicht durch bloße Stilpräferenzen ersetzt.
- Aus dem Review ergibt sich eine nach Wirkung priorisierte Liste fachlicher
  und größerer struktureller Folgeaufgaben. Die beschriebenen redaktionellen
  Anpassungen sind Teil des Reviews; weitergehende Änderungen erfolgen nur,
  wenn sie ausdrücklich Teil des Auftrags sind.
