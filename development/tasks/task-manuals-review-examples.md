# User Story: Beispiele in den Manuals

## User Story
Als Technical Writer und Frontend-Entwickler möchte ich die Beispiele in den
Manuals nach ihrem Lernziel gestalten, damit sie technische Mechanismen klar
erklären und natürliche, nachvollziehbare Anwendungen zeigen, ohne unnötigen
Fachkontext oder künstliche Vereinheitlichung.

Diese Story konkretisiert Punkt 2 von [Review der Manuals](
    task-manuals-review.md#unteraufgaben).

## Auswahl der Beispielart
Leitlinie: __so konkret wie für das Lernziel nötig, ansonsten so abstrakt wie
möglich.__ Die drei Beispielarten sind keine zwingende Reihenfolge oder feste
Komplexitätsstufen. Entscheidend ist, welche Darstellung den jeweiligen
Mechanismus verständlich macht.

### 1. Abstrakt: Syntax und technische Mechanismen
Für Syntax, API-Signaturen, Namespace-Aufbau, Fehlerfälle und Objektidentität
werden kurze Platzhalter wie `a`, `a.b.c` und `value` oder rollenbezogene Namen
wie `object`, `root` und `proxy` verwendet. Diese werden nicht pauschal durch
`example` oder fachliche Namen ersetzt.

```javascript
use("a");
use("a.b.c");
```

```javascript
const object = {};
const value = attempt(() => object.that.does.not.exist());
```

Hier sind die Namespace-Hierarchie beziehungsweise der abgefangene Fehler das
Lernziel; ein Anwendungsmodell würde davon ablenken.

### 2. Generisch: einfache, beobachtbare Anwendungen
Für einfache Eingabe- und Ausgabebeispiele ohne fachliche Beziehungen werden
fachlich neutrale, beschreibende Identifier bevorzugt, etwa `inputText`,
`outputText` oder `preview`. Bestehende verständliche Namen bleiben erhalten.

`example`, `exampleInput` und `exampleOutput` sind zulässige Platzhalter, aber
keine vorgeschriebenen Namen oder Präfixe. Eine Umbenennung allein zur
Vereinheitlichung ist kein Mehrwert; die Funktion oder Rolle soll aus dem Namen
verständlich werden.

`"Hello World!"` eignet sich als Beispieltext, wenn der konkrete Textinhalt für
das Lernziel keine Bedeutung hat.

```html
<input id="inputText" type="text" value="Hello World!">
{{document.getElementById("inputText").value}}
```

Anwendungsobjekte und DOM-Elemente bleiben unterscheidbar. Eigenschaften wie
`title` und `value` sind nicht austauschbar; DOM-Zugriffe werden explizit gezeigt.

### 3. Fachlich: Bakery
Für zusammenhängende Abläufe, Datenstrukturen und Beziehungen dient __Bakery__
als gemeinsames Thema: ein fiktiver, funktionsfähiger Online-Shop einer Bäckerei
als klassische Web-Anwendung mit Frontend und Backend. Die Beispiele behandeln
Shop-Funktionen, Benutzerkonten/Accounts, Administration, Artikelpflege und
-verwaltung sowie Mehrsprachigkeit.

Auch eine kurze Textinterpolation kann fachlich sein, wenn eine natürliche
Bäckerei-Phrase den Zusammenhang zwischen festem Text und Anwendungsdaten
verständlich zeigt. Ein Composite-Script stellt die Daten bereit:

```javascript
const bakery = {
    product: {name: "Baguette", category: "Bread"}
};
expose(bakery, "bakery");
```

```html
<p>From the oven: {{bakery.product.name}}.</p>
```

Die Ausgabe lautet `From the oven: Baguette.`. Der Ausdruck liest einen
Produktnamen statt weiterer Textkonstanten.

Für Produktbeispiele gelten folgende Kategorien und Produkte:

| Product Category | Products                          |
|------------------|-----------------------------------|
| Bread            | Loaf, Roll, Baguette, Toast        |
| Cakes            | Muffin, Brownie, Donut, Cupcake    |
| Pastries         | Croissant, Pretzel, Cookie, Waffle |

Das Thema Schreibwaren entfällt vollständig; andere fachliche Themen werden
nicht verwendet.

## Gemeinsame Regeln
1. __Lernziel bewahren.__ Notwendige Datentypen, unterschiedliche Werte,
   Sonderzeichen und API-Namen bleiben erhalten. Technisch erforderliche
   Literale, etwa für Encoding oder ungültige Syntax, werden nicht durch
   fachliche Daten ersetzt.
2. __Natürliche Textinterpolation verwenden.__ Sätze oder Phrasen verbinden
   festen Text mit dynamischen Anwendungsdaten. Textkonstanten werden nicht
   künstlich in mehrere Ausdrücke zerlegt, nur um `"Hello World!"` zu erzeugen.
3. __Sachlich formulieren.__ Fachliche Texte enthalten keine werblichen
   Wertungen oder Superlative. Beispieltexte folgen der Sprache des jeweiligen
   Manuals, etwa `From the oven: ...` in englischen Manuals.
4. __Zusammengehörige Beispiele konsistent halten.__ Identifier, Bindings,
   Selektoren, Ressourcenpfade, Nachrichten-Keys und erwartete Ausgaben werden
   gemeinsam angepasst.
5. __Voraussetzungen sichtbar machen.__ Erforderliche Anwendungsdaten,
   Objektveröffentlichung und sonstige Voraussetzungen werden im jeweiligen
   Kontext bereitgestellt oder klar benannt.
6. __Unnötigen Inhalt weglassen.__ Inhalt ohne Mehrwert für das Lernziel wird
   durch `...` ersetzt. Für Verständnis oder Ausführung erforderliche Daten,
   Initialisierung und erwartete Ausgaben werden dadurch nicht verdeckt.

## Abgrenzung
Gegenstand sind die Beispiele in `manuals/` und ihre unmittelbar zugehörigen
Erklärungen. Der allgemeine fachlich-redaktionelle Review verbleibt in
[Review der Manuals](task-manuals-review.md).

Bakery ist ein gemeinsamer Themenrahmen, nicht die Verpflichtung zum Aufbau
eines vollständigen Beispielshops. Zusammengehörige Beispiele müssen im
angegebenen Kontext konsistent und ausführbar sein.
