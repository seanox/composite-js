# User Story: Review der Manuals

## User Story
Als Technical Writer für ein Open-Source-JavaScript-Framework möchte ich die
Manuals fachlich-redaktionell und zugleich aus Sicht eines erfahrenen
Frontend-Entwicklers prüfen, der das Framework einsetzen soll, damit die
Dokumentation technisch präzise, konsistent, verständlich und praxisnah ist.

## Unteraufgaben
1. __HTML-Begriffe vereinheitlichen.__ Wo das HTML-Element gemeint ist, steht
   beispielsweise BODY-Tag statt `<body>`-Element. Die Unterscheidung wird auch
   bei `<script>`, `<style>` und anderen Elementen berücksichtigt.
2. __Beispiele vereinheitlichen.__ Durchgängiges Thema ist ein fiktiver,
   funktionsfähiger Online-Shop für Schreibwaren als klassische Web-Anwendung
   mit Frontend und Backend. Die Beispiele behandeln ausschließlich
   Shop-Funktionen, Benutzerkonten/Accounts, Administration, Artikelpflege und
   -verwaltung sowie Mehrsprachigkeit. Andere Themen werden nicht verwendet.
   Wenn konkreter Inhalt für das Lernziel keinen Mehrwert bietet, wird er durch
   `...` ersetzt.
3. __Didaktische Reihenfolge prüfen.__ Kapitel und Abschnitte sollen einen
   nachvollziehbaren Lern- und Arbeitsablauf unterstützen.
4. __Identifier-Terminologie vereinheitlichen.__ Bezeichnungen für
   identifierbasierte Komponenten und Bestandteile sollen einheitlich und
   technisch präzise sein. Insbesondere werden Formulierungen zu erlaubten
   Zeichen wie `7-bit ASCII characters above the space character`,
   `7-bit ASCII characters` und `ASCII characters` abgeglichen; wo hilfreich,
   wird stattdessen ein passendes RegEx-Muster dokumentiert.
5. __Ähnliche Formulierungen überarbeiten.__ Sätze in unmittelbarer Nähe, die
   sich nur durch ein Wort oder die Formatierung unterscheiden, werden so
   angepasst, dass Unterschiede verständlich und Wiederholungen sinnvoll sind.
6. __~~Nutzwert aus Anwendersicht prüfen.~~__ Inhalte sollen technisch präzise,
   kompakt und verständlich sein; unnötige Details und akademische Erklärungen
   werden vermieden. Detailaussagen werden auf ihren tatsächlichen Nutzwert
   geprüft. So wird etwa bewertet, ob die Erklärung, dass ein String auf
   `JSON.stringify(object)` basiert und iterierbare Objekte zuvor in Arrays
   umgewandelt werden, für die Anwendung des Frameworks erforderlich ist; je
   nach Ergebnis bleibt sie erhalten, wird gekürzt oder entfällt.
7. __Korrekte Inhalte bewahren.__ Bestehende Struktur, Terminologie und Aussagen
   bleiben erhalten, soweit sie korrekt und für Anwender zweckmäßig sind.
   Größere Umstrukturierungen oder inhaltliche Kürzungen erfolgen nur, wenn sie
   für Verständlichkeit, Korrektheit oder Nutzwert erforderlich sind.

## Abgrenzung
Informationen zur Pflege und Weiterentwicklung des Frameworks sind grundsätzlich
nicht Gegenstand des Reviews. Ausgenommen davon sind `architecture.md`,
`introduction.md` und `maintenance.md`; deren für Leser erforderliche Inhalte
werden mitbetrachtet.
