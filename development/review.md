# Code-Review `sources/*.js`
Stand: 2026-09-04  
Repository: https://github.com/seanox/composite-js/tree/master/sources  
Umfang (~6.000 Zeilen):
- composer.js
- expression.js
- reactive.js
- routing.js
- datasource.js
- extension.js
- messages.js
- scripting.js
- test.js

Aufwand in Story Points (1/2/3/5/8/13).  
Alle Findings wurden im Code verifiziert; modulübergreifende Dubletten sind
zusammengefasst.

## Hoch

### ~~1. Code-Injection über `String.prototype.unescape`~~

<details>
  <summary>Problem</summary>

> Stelle: extension.js:537-539, messages.js:49, Story-Points: 3

`.replace(/^(["'])/, "\$1")` ist ein No-op, das führende Anführungszeichen wird
nie escaped. i18n-Werte aus `locales.xml`/Modul-XML landen ungeschützt in `eval`
(`"+(alert(1))//`).

</details>

### ~~2. Syntaxfehler in generierter Route-Expression~~

<details>
  <summary>Problem</summary>

> Stelle: routing.js:478, Story-Points: 1

`${composite}")` ohne öffnendes `"` (vgl. Z. 482). Composite mit `route` __und__
eigener `condition` erzeugt ungültige Expression und verschwindet immer.

</details>

### ~~3. XSS-Oberfläche~~

<details>
  <summary>Problem</summary>

> Stelle: composer.js:2438, 2375, 1528; datasource.js:195-215,
> Story-Points: 5

`output` schreibt Expression-Ergebnisse per `innerHTML` (Doku sagt "als Text“),
ebenso `import`/`include` ohne Sanitizing. XSLT-Output setzt
`innerHTML = textContent` und schreibt `<script>` in `composite/javascript` um,
das der Renderer ausführt.

> - No contradiction in the documentary
> - A dynamic/active execution is part of the concept

</details>

### ~~4. Jede `{{...}}`-Sequenz im DOM ist ausführbarer JS-Code~~

<details>
  <summary>Problem</summary>

> Stelle: expression.js:66; scripting.js:225-232;
> extension.js:52-63, 307-317, Story-Points: 8

`Function` + `eval`, kein Escaping, kein Opt-out. Nutzerdaten mit
`{{` = Remote Code Execution. Framework ist nicht CSP-fähig
(`unsafe-eval` in Scripting, `compliant`, `unescape`).

</details>

### 5. Synchrones XHR auf dem Main-Thread
> Stelle: composer.js:1377, 2384, 2861; datasource.js:286, 437-449;
> messages.js:100-109, Story-Points: 8

In Bootstrap, `load`, `import`, DataSource und Messages. Deprecated, blockiert
UI; `status 0` (`file://`, CORS, offline) bricht die gesamte
Framework-Initialisierung ab. Netzwerkfehler nicht abgefangen.

Korrektur:
- `file://` ist kein unterstütztes Deployment-Szenario
- Ressourcen sind bewusst auf den Context-Path beschränkt sind und damit
  Cross-Origin-Ressourcen gar nicht zum normalen Anwendungsfall gehören,
- Offline-Betrieb kein Ziel ist,

### 6. Speicherlecks / unbegrenzt wachsender Zustand
> Stelle: composer.js:730-731, 812, 1873, 2269, 2927;
> expression.js:60-75; reactive.js:117, 119, 182-213,
> Story-Points: 8

`Composer.mount.stack` (Array, `includes` O(n), nie bereinigt); `_render_meta`
(sparse Array mit starken Element-Refs, Textknoten-Meta ohne `parentNode` nie
aufgeräumt); Expression-`_cache` (Map `serial:attr`, nie geleert);
Reactive-`notifications` (DOM-Refs pro Key, Cleanup nur im `set`-Trap desselben
Keys). `_lock.release` mountet bei jedem Render-Ende alle
`querySelectorAll("*")` -> quadratisch.

#### 6.1. `Composer.mount.stack` räumt entfernte DOM-Elemente nicht auf
- Mount-Referenzen bleiben im Stack erhalten.

#### 6.2. `Composer.mount.stack` durch `Set` statt Array verwalten__
- Vermeidet `includes()` mit O(n) und erleichtert gezieltes Entfernen.

#### 6.3. `_render_meta` besitzt keinen konsistenten DOM-Lifecycle
- Render-Metadaten müssen zuverlässig beim Entfernen eines Elements freigegeben werden.

#### 6.4. `_render_meta` hält entfernte DOM-Bäume über `template`-Referenzen fest
- Besonders relevant bei `condition`/Templates.
- Erledigt mit: https://github.com/seanox/composite-js/blob/master/manuals/architecture.md#trust-boundary

#### ~~6.5. `Expression._cache` wird beim Entfernen von DOM-Elementen nicht bereinigt~~
- Cache-Einträge mit `serial` bleiben dauerhaft bestehen.

#### 6.6. `Reactive.notifications` entfernt obsolete DOM-Subscriptions zu spät
- Cleanup erfolgt derzeit erst bei einem späteren Reactive-Update.

#### 6.7. Kein zentraler Cleanup-Lifecycle für Composer, Expression und Reactive
- Ein gemeinsamer Cleanup-Pfad sollte alle elementbezogenen Ressourcen freigeben.

| Komponente         | Ressource, die bereinigt werden muss                                                             |
|--------------------|--------------------------------------------------------------------------------------------------|
| __Composer__       | `Composer.mount.stack` - entfernte DOM-Elemente aus dem Mount-Stack entfernen                    |
| __Composer__       | `_render_meta` - Render-Metadaten des entfernten Elements freigeben                              |
| __Composer__       | Composite-/Undock-State - zugehörige Composite-Instanz sauber und genau einmal undocken          |
| __Composer__       | Template-/Render-Referenzen, soweit sie ausschließlich zum Composer-Lifecycle gehören            |
| ~~__Expression__~~ | ~~`Expression._cache` - __alle__ Cache-Einträge des entfernten `serial` entfernen~~              |
| __Reactive__       | `Reactive.notifications` - __alle__ DOM-Subscriptions des entfernten `serial` entfernen          |
| __Reactive__       | Zugehörige Notification-/Observer-Strukturen entfernen, wenn sie dadurch leer werden             |
| __Alle__           | Keine langlebige Referenz auf den entfernten DOM-Knoten bzw. dessen Lifecycle-State zurücklassen |

| Komponente         | Hauptverantwortung           |
|--------------------|------------------------------|
| __Composer__       | DOM-/Render-/Mount-Lifecycle |
| ~~__Expression__~~ | ~~Expression-Cache~~         |
| __Reactive__       | Reactive-Subscriptions       |

#####6.8. `serial`-basierter globaler Zustand verhindert sauberes Lifecycle-Management
- `serial` dient gleichzeitig als Identifier für mehrere langlebige globale Strukturen.

#### 6.9.`iterate` durch Keyed-Diffing statt vollständigem Re-Rendering optimieren
- Nicht direkt derselbe Fehler wie #6, aber der wichtigste strukturelle Hebel,
  um die Menge an erzeugtem/verworfenem Zustand drastisch zu reduzieren.

### 7. Reactive-Proxy zerstört Objekte mit internen Slots
> Stelle: reactive.js:121-163, Story-Points: 3

Map, Set, Date, WeakMap, Promise und TypedArrays werden zerstört: Methoden
werden mit `this = proxy` aufgerufen -> `TypeError: incompatible receiver`. Nur
`Node`/`NodeList`/`HTMLCollection` ausgenommen.

### ~~8. Tolerant-Makro `(?...)` korrumpiert Regex-Literale~~

<details>
  <summary>Problem</summary>

> Stelle: scripting.js:94-141; expression.js:242-252,
> Story-Points: 8

`/(?:ab)+/` -> `/(_tolerate(()=>:ab))+/`. Regex-Literale werden im Parser nicht
als Literal erkannt; `/["]/` schaltet in String-Modus und verschluckt
nachfolgende `#export`-Makros. Gleiche Erkennung in expression.js trifft
`(?:...)`.

</details>

### ~~9. Doppel-Encoding + `"undefined"`~~

<details>
  <summary>Problem</summary>

> Stelle: composer.js:2608-2633, Story-Points: 2

Attributwert wird `encodeHtml()` + `&quot;` kodiert und per
`setAttribute`/Property gesetzt (beide dekodieren nicht) -> `title="{{'a<b'}}"`
ergibt literal `a&lt;b`. Bei `undefined` wird Attribut entfernt, danach aber
`selector[attribute] = undefined` -> `input.value === "undefined"`.

</details>

### 10. Test-Framework-Deadlock
> Stelle: test.js:305-307, 340-374, Story-Points: 2

Wirft ein `Test.listen`-Callback bei `EVENT_RESPONSE`, wird `queue.lock = false`
nie erreicht -> Testlauf hängt; Timeout-Interval feuert RESPONSE alle 25 ms
endlos.

## Mittel

### 11. Enumerable Prototype-Erweiterungen
> Stelle: composer.js:2697-2703; reactive.js:76; datasource.js:407;
> test.js:689-695; extension.js:409ff, Story-Points: 3

Per Zuweisung statt `defineProperty({enumerable:false})`:
`Object.prototype.ordinal/reactive/toPlainString`, `String.prototype.*`,
`Element.prototype.*` erscheinen in jedem `for...in`. `ordinal()` gibt
vorhandenes eigenes `serial`-Feld zurück (Kollision). `compliant` wirft hart bei
künftigen Standard-Kollisionen -> Framework stirbt beim Laden statt zu
degradieren.

> compliant ist ein fester und konzeptioneller Bestandteil der Plattform.
> composite-JS soll eine Anwendung nur dann starten, wenn die vorhandene
> Browser-Runtime alle für die Plattform erforderlichen Voraussetzungen erfüllt.
> Die Kompatibilitätsprüfung ist dabei bewusst strikt und kein Mechanismus zur
> optionalen Degradation.

### ~~12. Iterate ohne Diffing~~

<details>
  <summary>Problem</summary>

> Stelle: composer.js:2494-2563, Story-Points: 13

Jeder Render-Zyklus leert `innerHTML` und baut alle Kinder neu (neue Serials,
Meta, Cache-Einträge, Mount-Stack, Listener). Skaliert schlecht, verstärkt
[6. Keyed Reconciliation](#6-speicherlecks--unbegrenzt-wachsender-zustand) ist
ein Architekturvorhaben.

> - The restructuring is part of the concept
> - The memory leaks remain unresolved; this is handled by
>   [6. Keyed Reconciliation](#6-speicherlecks--unbegrenzt-wachsender-zustand)

</details>

### 13. Kein Function-Cache
> Stelle: scripting.js:219-233; composer.js:59, 1537-1547,
> Story-Points: 5

Pro Expression-Auswertung `Function(...)` + `eval`, `Composer.render.context`
kopiert bei jedem Zugriff Scope + Workspace. "Duplicate parameter name“, wenn
Iterationsvariable `script`, `_import`, `_export`, `_use`, `_tolerate` heisst.
`_render_context_scope` nie befüllt (toter Code).

### 14. Render-Queue-Race
> Stelle: composer.js:1178-1196, 1679-1681, Story-Points: 3

Bei Lock wird sowohl `asynchronous(render)` (ohne Selector -> `queue[0]`) als
auch beim Release `asynchronous(render, shift())` geplant -> Doppel-Scheduling,
Reihenfolge-Inversion; `render()` ohne Selector kann `undefined` in Queue
pushen.

### 15. Fragiler Bootstrap
> Stelle: composer.js:2841-2861, 3015, Story-Points: 2

Wirft `Composite.include("common")` (HTTP ≠ 200/404), wird weder
MutationObserver installiert noch gerendert -- Seite bleibt leer ohne
Fehlermeldung.

### 16. Listener-Exceptions in `fire(EVENT_RENDER_END)`
> Stelle: composer.js:354-355, 1629-1684, Story-Points: 2

Listener-Exceptions propagieren bis in MutationObserver/Event-Handler;
`context.queue.shift()` wird übersprungen. Keine Isolation der Listener.

### 17. `{{name:expr}}` in Textknoten schreibt globale Variablen
> Stelle: composer.js:2218, Story-Points: 3

`window[name]` kann `Composer`, `Expression`, `location` überschreiben; kein
Scope.

### 18. Attributnamen pauschal `toLowerCase()`
> Stelle: composer.js:1949, 1962, 2629, Story-Points: 2

SVG-camelCase-Attribute mit Expression (`viewBox`, `preserveAspectRatio`) werden
als `viewbox` gesetzt und ignoriert.

### 19. Gecko-Workaround wirkungslos
> Stelle: routing.js:125-137, 321-324, Story-Points: 3

`Composer.asynchronous` ist Microtask, `hashchange` Macrotask -> "Interrupt“
läuft immer vor dem Browser-Event. Bedingung `newURL !== Browser.location` ist
invertiert. Toter/falscher Codepfad, potenziell Doppel-Dispatch.

### 20. Selector-Injection/Crash
> Stelle: routing.js:295-298, 336-352, Story-Points: 2

Hash-Segmente unescaped in `querySelector('[id="..."]')`; `PATTERN_PATH` erlaubt
`"`, `]`, `\` -> DOMException im hashchange-Listener. `newHash === null`
(Navigation ohne `#`) -> TypeError bei String-Interceptoren; RegExp mit `g`-Flag
statusbehaftet.

### 21. Reactive-Handler
> Stelle: reactive.js:55-56, 170-216, 240-272, Story-Points: 5

`return true` im `finally` verschluckt Exceptions aus `target[key] = value` und
rendert trotzdem; fehlende `deleteProperty`/`defineProperty`-Traps -> kein
Re-Render; `_selector` nach `EVENT_RENDER_NEXT` nie zurückgesetzt (falsche
Recipient-Zuordnung); pro `get` Closure + Microtask auch ausserhalb des
Renderings (`_selector === null` erst im Callback geprüft).

### ~~22. Regex-Präzedenzfehler~~

<details>
  <summary>Problem</summary>

> Stelle: datasource.js:190, 197, Story-Points: 1

`/^yes\|on\|true\|1$/i` = `^yes` oder `on` oder `true` oder `1$` ->
`escape="none"`, `"month"`, `"untrue"` gelten als true.

</details>

### 23. Async-Import-Callback
> Stelle: composer.js:2374-2400, Story-Points: 2

Async-Import-Callback greift auf ggf. per `_cleanup` gelöschtes
`_render_meta[serial]` zu -> TypeError. Import-Cache wird mit `responseURL`
(absolut) befüllt, mit Roh-`value` (relativ) gelesen -> nie Treffer. Kein
Negative-Caching -> bei Fehler sync XHR pro Render-Zyklus.

### 24. `Namespace.use(object)` / `Namespace.create(object, value)`
> Stelle: extension.js:108-193, Story-Points: 3

Trotz dokumentierter Signatur kaputt (`"".split` ->
`[""]`, `eval("typeof [object Object]")`). Bei `null`-Wurzel
(`window.a === null`) fällt `use("a.b")` auf globale Suche nach `b` zurück.

### 25. Override von `Element.prototype.appendChild`
> Stelle: extension.js:326-342; composer.js:2366, Story-Points: 3

Ändert nativen Vertrag (2. Param `exclusive` löscht Kinder, Array statt Node als
Rückgabe). `typeof node[Symbol.iterator]` ist immer truthy -> `appendChild({})`
liefert still `[]` statt TypeError. Nur `Element`, nicht
`Node`/`DocumentFragment`.

### ~~26. `decodeHex` nutzt `text.substring(loop, 2)`~~

<details>
  <summary>Problem</summary>

> Stelle: extension.js:455-456, Story-Points: 1

Ende-Index statt Länge -> `"ABC".encodeHex().decodeHex()` = `"A\u0000B"`.
Asymmetrisch: `encodeHex` erzeugt 4 Stellen für Codepoints > 0xFF, `decodeHex`
liest immer 2.

</details>

### 27. Test-Framework ohne async-Unterstützung
> Stelle: test.js:288-308, 338-375, Story-Points: 5

Rückgabewert (Promise) von `meta.test()` wird ignoriert -> async Tests sofort
"grün“, Rejections unhandled. Timeout-Interval ist faktisch tot, da synchrone
Tests nicht unterbrochen werden.

### 28. Messages: `populate` nutzt `replace(RegExp, values[index])`
> Stelle: messages.js:53-85, Story-Points: 2

`$&`, `$$`, `$'` werden als Replacement-Pattern interpretiert. Keys mit
Nicht-`\w`-Zeichen (`foo-bar`) still verworfen. Key `populate` kollidiert mit
Methode.

### 29. `responseXML === null`
> Stelle: datasource.js:283-294, 376-380, 415, Story-Points: 2

Parse-Fehler oder falscher MIME wird gecached -> jeder Folgeaufruf
`null.clone()` TypeError; kein `<parsererror>`-Check. Cache-Key `hashCode()`
(31er-Hash) kollisionsanfällig -> falsche Dokumente. `DataSource.cache` ist
totes Public-API.

### ~~30. Text ausserhalb `{{}}` wird ungeescaped in `"..."` gesetzt~~

<details>
  <summary>Problem</summary>

> Stelle: expression.js:157, Story-Points: 1

`Er sagte "Hi" {{x}}` oder Backslash am Ende -> SyntaxError.

> Kein Fehler, sondern erwartetes Verhalten: Text ausserhalb von {{}} wird als
> String-Literal verarbeitet. \" wird dabei von der Runtime als Escape-Sequenz
> interpretiert und zu " aufgelöst. Soll der Backslash erhalten bleiben, muss
> entsprechend doppelt escaped werden (\\\").

</details>

## Niedrig

### ~~31. `Composer.validate` auf nicht gerenderte Elemente~~

<details>
  <summary>Problem</summary>

> Stelle: composer.js:497-580, 532, 843, Story-Points: 1

`object` undefined -> TypeError. `select.options[selectedIndex].value` bei
`selectedIndex === -1` -> TypeError.

</details>

### 32. `object.statics.hasOwnProperty[attribute]`
> Stelle: composer.js:1078, Story-Points: 1

Index statt Aufruf -> Bedingung immer false, Guard wirkungslos.

### 33. `listen()` und `interval()`
> Stelle: composer.js:324-335, 2458-2461, Story-Points: 1

`listen()` akzeptiert `null`/`undefined` als Callback, wirft erst in `fire`.
`interval` akzeptiert `""`/`0` -> `setInterval(fn, NaN)` Tight-Loop.

### 34. Getter `PATTERN_*`/`EVENT_FILTER/NAMES`
> Stelle: composer.js:168-308, 1909-1919, Story-Points: 2

Erzeugen bei jedem Zugriff neue RegExp/Arrays in Hot-Paths. Custom Selectors per
`parentNode.querySelectorAll` + `includes` statt `matches()`.

### 35. `forward()` und `Routing.locate()`
> Stelle: routing.js:106, 145-158, 245-259, 359-370, Story-Points: 3

`forward()` ändert weder URL noch `_history`-Ziel -> `approve()`/`Path.covers()`
prüft gegen reale URL und entfernt das Ziel. `Routing.locate()` crasht ohne Hash
(`null.split`). `history`-Getter gibt internes Array mutierbar heraus.

### 36. `parent.console` ohne try/catch
> Stelle: test.js:596-601, Story-Points: 1

SecurityError in Cross-Origin-iframe bei jedem `console.log` nach
`Test.activate()`.

### 37. Diverse Fehler im Test-Framework
> Stelle: test.js:164, 367-368, 379-380, 643-662, 740, 826-873,
> Story-Points: 2

`assertEquals` ≡ `assertSame` (beide `===`) trotz Doku; `typeof meta == null`
immer false; Off-by-one in `Assert.create` (`index > values.length`);
`clearTimeout` für `setInterval`-Handles; String-basierter Kontrollfluss auf
`Timeout occurred...`; `typeValue` dispatcht `input` mit `bubbles=false`.

### 38. `Math.unique` und `RegExp`-Erweiterungen
> Stelle: extension.js:351-401, Story-Points: 1

`Math.unique` nutzt `random % 10` (verzerrte Verteilung), `size = 0` -> 16.
`RegExp.quote` escaped `-` (SyntaxError mit `u`-Flag); `RegExp.escape` (ES2025)
nativ verfügbar.

### 39. `_export` ohne Typprüfung
> Stelle: scripting.js:85-104, 236-262, Story-Points: 2

Zwischen-Level werden nicht geprüft (primitive Globals -> TypeError/stiller
Fehlschlag); Export ist Wert-Snapshot (undokumentiert). Verschachtelte
`(? a + (? b))` nicht unterstützt. Doku-Signatur `eval(script, [url])`
widerspricht Implementierung.

### 40. Catch in `include`
> Stelle: composer.js:940-944, 1314-1320, Story-Points: 1

Setzt `origin.innerText = "Error: ..."` und greift auf `error.message` zu ->
TypeError bei Nicht-Error-Werten; Fehlerausgabe ersetzt Container-Inhalt.
`return result` im Event-Callback wirkungslos.

### 41. Toter Codepfad `ANY_TYPE`/`singleNodeValue`
> Stelle: datasource.js:143, 314-324, Story-Points: 1

`transform(xmlDocument)` mit einem XMLDocument-Argument ->
`variants[0].replaceAll` TypeError.

## Summe
- Hoch: 48 SP
- Mittel: 65 SP
- Niedrig: 24 SP
- __Gesamt: ≈ 137 SP__

## Einschätzung
Drei konzeptionelle Kernprobleme, aus denen viele Einzel-Findings folgen:

1. __eval als Laufzeitfundament__ (#1, #4, #13): Jede `{{}}`-Sequenz ist Code,
   keine CSP-Fähigkeit, keine Trennung von Daten und Code. Das ist eine bewusste
   Design-Entscheidung aus aspect-js, macht aber Datenquellen (i18n, XML,
   User-Content) zu Angriffsflächen. Mindestens ein Escape-Mechanismus bzw.
   Opt-out-Attribut ist Pflicht.
2. __Synchrones Laden__ (#5): Deprecated, blockiert die UI und lässt sich nicht
   nachrüsten, ohne den Render-Lock asynchron zu denken. Grösster Umbau, aber
   unumgänglich.
3. __Kein Lebenszyklus-Management__ (#6, #12): Meta, Caches und Mount-Stack
   wachsen mit jedem Iterate-Zyklus. WeakMap/WeakSet ist der erste Schritt,
   Keyed-Diffing der zweite.

## Empfohlene Reihenfolge
1. __Quick Wins__ (je 1-2 SP, zusammen ~15 SP): #2, #9, #10, #22, #26, #30, #31,
   #32, #33, #36 -- echte Bugs mit klarer Lösung.
2. __Sicherheit/Stabilität__: #1, #3, #7, #11, #20, #25.
3. __Architektur__: #4, #5, #6, #8, #12, #13, #21.
4. Rest nach Bedarf.
