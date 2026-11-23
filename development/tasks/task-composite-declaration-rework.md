# User Story: Composite-Identität und Verwendung entkoppeln

## User Story

Als Anwendungsentwicklerin möchte ich Composites mit einer eindeutigen,
sprechenden `id` unabhängig von ihrem Ressourcenpfad benennen und Ressourcen
oder eine Binding-Basis mit `use` ausdrücklich zuordnen können, damit Routing,
DOM-Identität und Binding nicht an einen gemeinsamen Namen gekoppelt sind.

## Verbindliche Entscheidungen

- Ein Composite wird weiterhin durch die Kombination aus `composite`-Attribut
  und `id` deklariert. `use` allein deklariert kein Composite.
- `id` ist die eindeutige Identität des Composites. Routing, DOM-Referenzen,
  CSS-Selektoren, die Named-Application-Object-Auflösung und sonstige
  Composite-Logik bleiben ID-basiert.
- Die bisherige `@`-Namespace-Syntax in Composite- und Element-IDs entfällt.
  `use` übernimmt bei Element-Bindings die bisher damit ausgedrückte
  Binding-Zuordnung.
- Das Markup-Attribut `use` hat abhängig vom Elementtyp zwei Bedeutungen:
  - Bei einem Composite überschreibt es ausschließlich den Ressourcenpfad.
    Die Composite-ID bleibt maßgeblich für Identität und
    Named-Application-Object-Auflösung.
  - Bei einem normalen Element bestimmt es die Binding-Basis.
- Fehlt `use`, gilt das bisherige Verhalten. Bei einem Composite wird weiterhin
  die gleichnamige Ressource anhand der `id` geladen.
- `id` und `use` dürfen statischen Text, eine einzelne Expression oder eine
  Kombination aus Text und Expressions enthalten. Sie werden bei der
  erstmaligen Verarbeitung des jeweiligen Elements ausgewertet; die
  resultierenden Werte bleiben für dieses Element unverändert. Spätere
  Änderungen an Expression-Abhängigkeiten aktualisieren weder Identität noch
  Zuordnung.
- Das `use`-Mapping eines Composites wird nur für die Ressourcenauflösung
  benötigt und muss danach nicht als zusätzlicher dauerhafter Identitäts- oder
  Scope-Wert gespeichert werden.
- Das Laden eines Moduls führt nicht automatisch `expose` aus. Ein Modul muss
  ein benötigtes Anwendungsobjekt weiterhin selbst explizit veröffentlichen.
- Mehrere Composites dürfen dieselbe Modulzuordnung verwenden. Sie bleiben
  unterschiedliche DOM-Composites und können dieselben Ressourcen aus dem
  vorhandenen Ressourcen-Cache verwenden. Daraus folgen weder eine gemeinsame
  Composite-ID noch eine Änderung der ID-basierten
  Named-Application-Object-Auflösung oder eigene Bean-Instanzen.
- Ein erneutes `expose(object, name)` darf ein zuvor unter demselben Namen
  veröffentlichtes Anwendungsobjekt ersetzen. Das ist unabhängig von der
  Eindeutigkeit der Composite-IDs.

## Gewünschtes Verhalten

### Composite-Verwendung

Ein Composite kann mit `use` eine Ressourcenadresse ohne Dateiendung angeben:

```html
<div id="UserProfile" composite use="user/profile"></div>
```

Der Pfad wird relativ zur bestehenden Composer-Modulbasis aufgelöst:
`user/profile` adressiert die Ressourcen unter `modules/user/profile.*`.
Die zugehörigen optionalen Ressourcen werden nach den bestehenden Regeln
geladen, zum Beispiel aus `modules/user/profile.js`,
`modules/user/profile.css` und `modules/user/profile.html`. `use` ändert
weder die Composite-ID noch die Auflösung des Named Application Object:
`UserProfile` bleibt dafür maßgeblich. Der Composer führt kein automatisches
`expose` aus; falls das Objekt für das Binding bereitgestellt werden muss,
veröffentlicht das Modul es ausdrücklich nach den bestehenden Regeln, zum
Beispiel mit `expose(profile, "UserProfile")`.

Ohne `use` bleibt die bisherige Zuordnung über die Composite-`id` erhalten:

```html
<div id="UserProfile" composite></div>
```

In diesem Fall wird weiterhin die gleichnamige Modulressource geladen. Ein
angegebenes `use` mit Dateiendung oder ungültigem Ressourcenpfad ist keine
alternative Schreibweise und wird nicht stillschweigend wie ein fehlendes
Attribut behandelt.

Die Werte von `id` und `use` können mit der vorhandenen Markup-Expression-
Syntax (`{{...}}`) statischen Text, eine einzelne Expression oder gemischten
Text mit Expressions enthalten:

```html
<div id="Profile{{profile.id}}" composite
     use="user/{{profile.module}}"></div>
```

Beide Attribute werden bei der erstmaligen Verarbeitung dieses Elements
ausgewertet. Der aufgelöste `id`-Wert wird für die Composite-Identität
verwendet; der aufgelöste `use`-Wert wird einmalig zur Ressourcenauflösung
herangezogen. Ein erneutes Rendern, Verschieben oder eine spätere Änderung der
Expression-Abhängigkeiten ändert diese Werte für dasselbe Element nicht.

### Binding-Verwendung an normalen Elementen

Bei normalen Elementen gibt `use` an, auf welchem Named Application Object das
Element-Binding basiert. Der Wert kann ein einzelner Objektname oder ein
Objektpfad sein:

```html
<button id="save" use="user.profile"></button>
<button id="save" use="UserProfile"></button>
```

Auch hier kann `id` oder `use` statischer Text, eine einzelne Expression oder
eine Kombination aus Text und Expressions sein. Beide Werte werden bei der
erstmaligen Verarbeitung des Elements ausgewertet und bleiben danach
unverändert. Der Elementname aus `id` bleibt das Binding-Ziel innerhalb des
angegebenen Anwendungsobjekts. Ohne `use` bleibt die bisherige Auflösung über
das umgebende Composite bestehen.

Das Markup-Attribut `use` erzeugt keine Namespaces und ändert nicht den
gleichnamigen JavaScript-Helper `use(...)`. Es dient ausschließlich der
Zuordnung im Markup.

### Composite-ID und Eindeutigkeit

Die `id` eines Composites darf keinen `@`-Namespace mehr enthalten. Zwei
gleichzeitig deklarierte Composites mit derselben `id` sind ungültig, auch wenn
sie unterschiedliche `use`-Werte haben. Dagegen sind unterschiedliche IDs mit
demselben `use` zulässig.

Die Eindeutigkeitsprüfung darf gültige DOM-Lebenszyklen nicht als doppelte
Deklaration fehlinterpretieren. Ein einzelnes Composite, das erneut gerendert
oder innerhalb des beobachteten Bereichs verschoben wird, ist keine zweite
Deklaration.

Element-IDs verwenden `use` statt der bisherigen `@`-Syntax, um ein anderes
Anwendungsobjekt als das des umgebenden Composites zu adressieren. Andere
bisherige Bestandteile der Element-ID, insbesondere Qualifier und eindeutige
Kennungen, behalten ihre bisherige Bedeutung.

## Abnahmekriterien

- [ ] Ein Composite benötigt weiterhin sowohl `composite` als auch eine
  `id`; `use` allein kennzeichnet kein Composite.
- [ ] `id` und `use` unterstützen statischen Text, eine einzelne Expression
  und gemischten Text mit Expressions nach der vorhandenen Markup-Syntax.
  Beide Werte werden pro Element bei der erstmaligen Verarbeitung genau einmal
  ausgewertet und danach nicht durch Änderungen ihrer Abhängigkeiten,
  erneutes Rendern oder Verschieben aktualisiert.
- [ ] Ein Composite ohne `use` behält das bisherige Verhalten und lädt die
  gleichnamige Ressource anhand seiner `id`.
- [ ] Ein Composite mit `use="user/profile"` löst die Modulressourcen relativ
  zur Composer-Modulbasis ohne Dateiendung auf. Vorhandene optionale
  JavaScript-, CSS- und HTML-Ressourcen werden nach den bisherigen
  Lade-, Cache- und Fehlerregeln behandelt.
- [ ] Slash-Segmente des Composite-`use`-Pfads entsprechen denselben
  Pfadsegmenten bei der Ressourcenauflösung. Die Auflösung des Named
  Application Objects bleibt an die aufgelöste Composite-`id` gebunden.
- [ ] Werte für Composite-`use` mit Dateiendung oder ungültigem Ressourcenpfad
  werden explizit abgelehnt; sie fallen nicht auf die `id` zurück.
- [ ] Die Composite-`use`-Zuordnung wird nur für die Ressourcenauflösung
  verwendet und nicht als zusätzliche Composite-Identität oder dauerhafter
  Scope-Wert geführt. Die ID-basierte Auflösung des Named Application Object
  bleibt erhalten; der Composer führt kein automatisches `expose` aus und
  explizite Objektveröffentlichung durch das Modul funktioniert weiterhin.
- [ ] Verschiedene Composite-IDs mit demselben `use` sind zulässig und
  können dieselben Modulressourcen und den vorhandenen Ressourcen-Cache
  verwenden, ohne die ID-basierte Composite- oder
  Named-Application-Object-Auflösung zu verändern.
- [ ] Ein normales Element mit `use` bindet an das angegebene Named Application
  Object oder den angegebenen Object-Path; seine `id` bestimmt weiterhin das
  Binding-Ziel innerhalb dieses Objekts.
- [ ] Ein normales Element ohne `use` behält die bisherige Binding-Auflösung
  über das umgebende Composite.
- [ ] Das Markup-Attribut `use` erzeugt keine Namespaces und verändert nicht
  das Verhalten des JavaScript-Helpers `use(...)`.
- [ ] Die `@`-Namespace-Syntax wird für Composite-IDs und explizite
  Element-Binding-Referenzen nicht mehr akzeptiert. Andere `@`-Funktionen des
  Markups, etwa `@`-Attribute, bleiben unverändert.
- [ ] Doppelte Composite-IDs werden als Fehler erkannt, auch wenn die
  zugehörigen Composites unterschiedliche `use`-Werte haben. Verglichen wird
  der einmalig aufgelöste `id`-Wert.
- [ ] Erneutes Rendern oder Verschieben desselben Composite-Elements löst
  keinen Fehler wegen einer vermeintlichen doppelten ID aus.
- [ ] Unterschiedliche Composite-IDs mit gleichem `use` bleiben zulässig;
  `expose` darf ein zuvor unter demselben Namen veröffentlichtes Objekt
  weiterhin ersetzen.
- [ ] Routing, CSS-Selektoren und sonstige Composite-Identität bleiben an die
  `id` gebunden und werden nicht auf den `use`-Wert umgestellt.
- [ ] Die geänderte Syntax, Defaults, Fehlerfälle und Migrationshinweise sind
  dokumentiert.

## Erforderliche Tests

- Ergänze Regressionstests für die Ressourcenauflösung mit und ohne Composite-
  `use`, einschließlich fehlender optionaler Ressourcen, ungültiger Pfade und
  Pfaden mit unzulässiger Dateiendung.
- Prüfe, dass mehrere verschiedene IDs mit demselben `use` die erwarteten
  Ressourcen über die bestehenden Cache-Regeln wiederverwenden, ohne die
  ID-basierte Auflösung des Named Application Objects zu verändern.
- Prüfe `id` und `use` jeweils mit statischem Text, einer einzelnen Expression
  und gemischtem Text mit Expressions. Verifiziere, dass Expressions pro
  Element nur einmal ausgewertet werden und spätere Änderungen, erneutes
  Rendern oder Verschieben die aufgelösten Werte nicht verändern.
- Prüfe, dass keine automatische Objektveröffentlichung erfolgt und explizites
  `expose(...)` weiterhin wie bisher funktioniert, einschließlich des
  Ersetzens eines zuvor veröffentlichten Objekts.
- Prüfe Element-Binding mit einem einzelnen Named Application Object, einem
  Object-Path sowie ohne `use`.
- Prüfe doppelte Composite-IDs mit gleichem und unterschiedlichem `use`,
  außerdem Einfügen, Entfernen, Verschieben und erneutes Rendern von
  Composites.
- Migriere bestehende Tests und Fixtures mit `@`-Namespaces. Erhalte Tests für
  andere `@`-Markup-Funktionen und für ID-basierte Routing- und CSS-Semantik.
- Führe die betroffenen Laufzeittests in Blink, Gecko und WebKit aus.

## Erforderliche Dokumentation

- Aktualisiere `manuals/architecture.md`, `manuals/composite.md`,
  `manuals/composite-binding.md` und `manuals/markup.md` um die neue Trennung
  von Composite-ID, Modulzuordnung und Binding-Basis.
- Aktualisiere `manuals/scripting.md`, um die Markup-Bedeutung von `use` klar
  vom JavaScript-Helper `use(...)` abzugrenzen.
- Dokumentiere die `@`-Migration, die Default-Semantik ohne `use`, die
  Ressourcenpfadregeln, die explizite Objektveröffentlichung und die
  Fehlerbehandlung.
- Ergänze `CHANGES` um den Syntax- und Verhaltenswechsel.

## Technischer Umfang

- Primäre Runtime-Quelle: `sources/composer.js`; `sources/routing.js` ist
  einzubeziehen, falls die Entfernung der ID-Namespace-Syntax dort Anpassungen
  erfordert.
- Betroffene Tests und Fixtures liegen insbesondere bei den Composer-
  Namespace-, Mount-, Binding- und Routing-Tests unter `test/`.
- Runtime-Änderungen werden in den Quellen umgesetzt. Generierte Test-Bundles
  sind mit dem vorhandenen Build zu regenerieren; Release-Bundles werden nicht
  manuell bearbeitet.

## Nicht-Ziele

- Es wird kein Bean-Container, kein neuer Scope und keine automatische
  Instanzerzeugung eingeführt.
- Es gibt keine automatische Veröffentlichung oder Aliasbildung durch den
  Composer.
- Das bestehende `expose(...)`-Verhalten und die bestehende
  Ressourcen-Fehlerbehandlung werden nicht unabhängig von dieser Story
  umgestaltet.
- `use` ändert weder die Composite-ID noch Routing, CSS-Isolation oder
  DOM-Identität.
