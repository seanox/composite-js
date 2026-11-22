# User Story: Tutorials mit PicoCSS und orangem Akzent gestalten

## User Story

Als Lernende möchte ich die Tutorials in einem modernen, responsiven und
einheitlichen Layout nutzen können, damit Inhalte und Beispiele auf
unterschiedlichen Bildschirmgrößen gut lesbar und leicht bedienbar sind.

## Ausgangslage

Die Tutorialreihen für Single-Page-Applications und Micro-Frontends verwenden
unterschiedliche Layouts und Styles. Die Single-Page-Application-Tutorials
verwenden unter anderem W3.CSS; die Micro-Frontend-Tutorials haben eigene
Seitenstyles. Dadurch unterscheiden sich Aufbau und Darstellung der
Tutorialschritte.

## Gewünschtes Verhalten

Die Einstiegsseiten, Tutorialnavigationen und zugehörigen Beispieloberflächen
beider Tutorialreihen verwenden PicoCSS als einheitliche Layoutgrundlage. Ein
konsistenter oranger Primärakzent prägt interaktive Elemente wie Links,
Buttons und Fokuszustände. Die verwendete PicoCSS-Version ist festgelegt und
wird nicht über eine unversionierte „latest“-Referenz eingebunden.

Semantische HTML-Elemente und PicoCSS-Komponenten werden für die
Seitenstruktur, Navigation, Inhalte, Formulare und Tabellen genutzt. Bisherige
W3.CSS-Klassen und -Styles werden dort ersetzt, wo sie dem Layout dienen.
Erforderliche individuelle Styles bleiben auf anwendungsspezifische
Darstellung beschränkt und stehen nicht im Konflikt mit PicoCSS.

Das Redesign verändert weder die Lerninhalte noch die Composite-Struktur,
Beispiellogik oder Interaktionen der Tutorials. Bestehende Bilder, Icons und
sonstige anwendungsspezifische Gestaltung bleiben erhalten, soweit sie für das
jeweilige Beispiel relevant sind.

## Abnahmekriterien

- [ ] Alle 16 Schritte der Single-Page-Application-Tutorialreihe und alle
  9 Schritte der Micro-Frontend-Tutorialreihe verwenden ein konsistentes
  PicoCSS-basiertes Layout.
- [ ] Der orange Primärakzent ist über beide Reihen hinweg konsistent und
  interaktive Zustände wie Hover und Fokus sind erkennbar.
- [ ] Die Layouts sind auf schmalen und breiten Viewports nutzbar; Inhalte,
  Navigationen, Formulare und Tabellen laufen nicht unbeabsichtigt über den
  verfügbaren Bereich hinaus.
- [ ] Text, Steuerelemente und Fokuszustände bleiben gut lesbar und
  zugänglich.
- [ ] W3.CSS und zugehörige Layoutklassen werden ersetzt, wo PicoCSS die
  Darstellung übernimmt; notwendige individuelle Anwendungsstyles bleiben
  funktionsfähig.
- [ ] Interaktionen und fachliches Verhalten der Tutorialbeispiele bleiben
  unverändert.
- [ ] PicoCSS wird in allen Schritten konsistent und mit einer festgelegten
  Version eingebunden.

## Erforderliche Prüfung

- Prüfe die Einstiegspunkte beider Reihen mindestens auf schmalen und breiten
  Viewports.
- Prüfe repräsentative Formulare, Tabellen, Navigationen und interaktive
  Composite-Beispiele auf korrekte Darstellung und unveränderte Funktion.
- Kontrolliere alle Tutorialschritte auf fehlende Stylesheets, Layoutkonflikte
  und unlesbare Inhalte.

## Technischer Umfang

- Tutorials: `../../tutorials/single-page-application/` und
  `../../tutorials/micro-frontend/`
- Styling: PicoCSS sowie die tutorialbezogenen Stylesheets und Markups
- Keine Änderungen an Runtime-Quellen oder an der öffentlichen Runtime-API.
