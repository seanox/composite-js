# User Story: Eigenstaendiges Projekt-Review November 2026

## User Story

Als Projektverantwortlicher moechte ich ein unabhaengiges, evidenzbasiertes
Review des aktuellen composite-js-Projekts erhalten, damit gegenwaertige
Risiken und Qualitaetsmaengel objektiv sichtbar und nach Auswirkung
priorisierbar sind.

## Ausgangslage und Referenzen

Das Review soll die Qualitaet und Nachvollziehbarkeit der folgenden Dokumente
als Orientierung fuer Format, Struktur, Umfang und Evidenz nutzen:

- `..\reviews\review-202610.md`
- `..\reviews\review-202610-tasks.md`

Diese Dokumente sind ausschliesslich methodische und redaktionelle Referenzen.
Ihre Befunde, IDs, Aufgaben, Statusangaben, Bewertungen, Loesungsvorschlaege
und Schlussfolgerungen sind keine Vorgaben oder Checkliste fuer dieses Review.
Jeder Befund muss unabhaengig am aktuellen Projektstand entdeckt und belegt
werden. Ein frueherer Befund darf nur aufgenommen werden, wenn er im aktuellen
Stand eigenstaendig erneut nachvollzogen und verifiziert wurde; er wird dann
als neuer Befund mit neuer ID und aktueller Evidenz dokumentiert.

Die spaetere Durchfuehrung dieser Story ist mit GPT Astra (Modell-ID
`gpt-6-astra`) vorzunehmen.

## Umfang

Pruefe den aktuellen gepflegten Projektstand als Ganzes. Massgeblich sind die
autoritativen Quellen und Vertraege, insbesondere:

- Runtime-Quellen unter `sources/`
- oeffentliche API- und Architekturvertraege in `manuals/` sowie relevante
  Kompatibilitaetsangaben in `CHANGES`
- Tests, Test-Runner und Testkonfiguration unter `test/`
- Build-, Entwicklungs- und CI-Konfiguration
- gepflegte Tutorials und Beispiele, soweit sie Runtime-Vertraege verwenden

Generierte Bundles und Release-Artefakte sind nicht als unabhaengige
Quellcodekopien zu reviewen. Pruefe sie gezielt, wenn Abweichungen von den
autoritativen Quellen, Build- oder Packaging-Probleme vermutet werden. Externe
Abhaengigkeiten und nicht gepflegte Drittanbieterinhalte liegen ausserhalb des
Umfangs, ausser ein konkreter Projektintegrationsfehler macht sie relevant.

Vor Beginn sind Commit/Branch, Review-Datum und Arbeitsbaumzustand festzuhalten.
Beruecksichtige vorhandene lokale Aenderungen, ohne sie zu veraendern; ordne
Befunde soweit moeglich dem geprueften Stand zu und kennzeichne, wenn eine
Aenderung die Beurteilung beeinflusst.

## Bewertungsmassstab

Bewerte Verhalten anhand der dokumentierten API-, Architektur- und
Kompatibilitaetsvertraege, nicht anhand persoenlicher Stilpraeferenzen.
Untersuche insbesondere:

- Korrektheit, Grenzfaelle und Zustandsuebergaenge
- Lifecycle, Scopes, Ressourcenaufloesung, Caches und asynchrone Verarbeitung
- Fehlerbehandlung und die Sichtbarkeit tatsaechlicher Fehler
- Kompatibilitaet mit den zugesicherten Browsern und der ES2015-Grenze
- Verlaesslichkeit der Tests, Testautomatisierung und Build-/Release-Pfade
- Abweichungen zwischen Implementierung, Dokumentation und Beispielen
- Einhaltung dokumentierter Ressourcen- und Vertrauensgrenzen

Bewusste, dokumentierte Architekturentscheidungen sind nicht allein deshalb
Befunde, weil andere Frameworks sie anders loesen. Bewerte sie nur dann als
Mangel, wenn aktuelle Evidenz eine Verletzung eines Vertrags, eine konkrete
nachteilige Auswirkung oder ein nicht angemessen beschriebenes Risiko zeigt.

## Arbeitsweise

1. Lies die Projektanweisungen und die fuer den jeweiligen Bereich
   massgeblichen Architektur- und API-Vertraege. Ermittle die autoritativen
   Quellen und verfolge relevante Aufrufpfade, statt nur einzelne Zeilen
   isoliert zu beurteilen.
2. Pruefe die gesamte festgelegte Review-Oberflaeche systematisch. Halte
   Umfang, untersuchte Bereiche und bewusste Ausschluesse im Bericht fest.
3. Belege jeden moeglichen Befund durch aktuellen Quelltext, einen
   nachvollziehbaren Kontrollfluss oder eine gezielte Reproduktion. Nutze
   vorhandene Tests als Evidenz, nicht als automatische Zusicherung, dass
   angrenzende Faelle korrekt sind.
4. Fuehre gezielte Tests, Browserlaeufe oder andere sichere Reproduktionen aus,
   wenn sie einen Befund bestaetigen oder widerlegen koennen. Erfasse Engine,
   Umgebung und tatsaechliche Ergebnisse. Bei Test-Runner-Befunden ist eine
   unabhaengige Beobachtung von Ereignissen, Fehlern oder Ausgaben zu nutzen,
   wenn der Runner sonst seine eigene Korrektheit bestaetigen muesste.
5. Trenne bestaetigte Befunde von Hypothesen und offenen Fragen. Behaupte keine
   Reproduktion, Testausfuehrung oder vollstaendige Abdeckung, die nicht
   tatsaechlich erfolgt ist. Nenne blockierte oder nicht ausgefuehrte Pruefungen
   ausdruecklich.
6. Fuehre im Rahmen dieses Reviews keine Korrekturen, Refactorings, Commits,
   Builds mit destruktiven Seiteneffekten oder Aenderungen an vorhandenen
   Arbeitsergebnissen durch.

## Anforderungen an einzelne Befunde

Jeder aufgenommene Befund muss:

- einen eindeutigen, nur innerhalb des neuen Berichts geltenden Bezeichner
  und einen konkreten Titel erhalten
- die aktuelle Datei und genaue Zeilen/Fundstellen im geprueften Stand nennen
- Prioritaet `Hoch`, `Mittel` oder `Niedrig` mit Begruendung der Auswirkung
  erhalten
- eine Ursache-Wirkungs-Kette erklaeren und beobachtbares Ist-Verhalten dem
  erwarteten Verhalten gegenueberstellen
- eine moeglichst kleine, nachvollziehbare Reproduktion oder einen
  gleichwertigen konkreten Kontrollflussnachweis enthalten
- einen begrenzten Korrekturansatz nennen, ohne unentschiedene API- oder
  Architekturfragen stillschweigend als beschlossen darzustellen
- passende Regressionstests beziehungsweise bestehende Testluecken benennen
- eine Story-Point-Schaetzung aus `1/2/3/5/8/13` fuer Korrektur und gezielte
  Absicherung enthalten; Story Points sind keine Zeitangaben

Fasse Symptome mit derselben nachgewiesenen Ursache zusammen und fuehre keine
doppelten Befunde. Nimm keine rein hypothetischen, nicht reproduzierbaren oder
rein stilistischen Beanstandungen als Fehler auf. Bei unsicherer Ursache oder
Auswirkung sind Unsicherheit und Konfidenz explizit auszuweisen.

## Ergebnis und Berichtsstruktur

Erstelle ausschliesslich den neuen Review-Bericht
`..\reviews\review-202611.md`. Uebernimm aus den Referenzen die
Nachvollziehbarkeit und sinnvolle Gliederung, nicht deren Befunde oder
Arbeitsauftraege. Der Bericht enthaelt mindestens:

- Titel, Datum, Repository, geprueften Commit/Arbeitsbaumstand und
  nachvollziehbare Umfangsangabe
- Bewertungsmassstab, wesentliche Ausschluesse und ausgefuehrte beziehungsweise
  nicht ausgefuehrte Validierungen
- eine nach Bereichen gegliederte Uebersicht mit Befund-IDs und Prioritaeten
- Befunde in Prioritaetsgruppen `Hoch`, `Mittel` und `Niedrig`, jeweils mit
  den oben geforderten Belegen und Korrekturansaetzen
- Summen der Befunde und Story Points pro Prioritaet sowie insgesamt
- eine begruendete Einschaetzung zu Architektur, Implementierungsqualitaet,
  Test-/Build-Verlaesslichkeit und geeigneten Einsatzgrenzen
- eine aus den neuen Befunden abgeleitete Empfehlung und Reihenfolge fuer
  moegliche Folgearbeiten

Falls keine Befunde nachgewiesen werden, enthaelt der Bericht trotzdem den
geprueften Umfang, die Validierung, deren Grenzen und eine begruendete
Einschaetzung. Es werden keine Befunde erfunden, um eine nichtleere Liste zu
erzeugen. Ein separates Umsetzungsaufgaben-Dokument wird nicht automatisch
erstellt.

## Abnahmekriterien

- [ ] Das Review wurde unabhaengig am aktuellen Projektstand durch GPT Astra
  (`gpt-6-astra`) durchgefuehrt.
- [ ] Die gepflegte Projektoberflaeche wurde gemaess dem festgelegten Umfang
  untersucht; Umfang, Stand und Ausschluesse sind im Bericht nachvollziehbar.
- [ ] Die beiden Review-Dokumente aus Oktober dienen nur als Referenz fuer
  Format, Struktur und Evidenzqualitaet. Ihre Befunde und Arbeitsauftraege
  wurden nicht als Aufgabenliste oder Ergebnis uebernommen.
- [ ] Jeder neue Befund ist durch aktuelle Fundstellen und nachvollziehbare
  Evidenz begruendet, nach Auswirkung priorisiert und auf Duplikate geprueft.
- [ ] Testergebnisse, Reproduktionen, Umgebungsgrenzen und nicht ausgefuehrte
  Pruefungen sind wahrheitsgetreu ausgewiesen.
- [ ] Das Ergebnis liegt in `development/reviews/review-202611.md`; Runtime,
  Tests, Build-Artefakte und vorhandene lokale Aenderungen wurden durch diese
  Review-Arbeit nicht veraendert.
