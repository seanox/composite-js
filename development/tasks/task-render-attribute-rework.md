# User Story: Attribute Directives und DOM-Property-Mappings explizit festlegen

## User Story

Als Anwendungsentwicklerin möchte ich bei Attribute Directives Attributname
und JavaScript-Property getrennt und ausdrücklich angeben können, damit der
Renderer die gewünschte DOM-Property setzt, ohne sich auf implizite
Namenszuordnungen verlassen zu müssen.

## Ausgangslage und Umfang

Die geklammerte Syntax für dynamische Markup-Attribute heisst in diesem Ticket
__Attribute Directives__. Der Begriff bezeichnet die Attributvorlagen, die der
Composer erst beim Rendering in echte Attribute umwandelt.

Die Markup-Dokumentation beschreibt `@`-Attribute als Vorlagen, die der
Composer erst beim Rendering in echte Attribute umwandelt. Das verhindert,
dass der Browser ein Attribut wie `src` bereits vor der Auswertung der
Expression verarbeitet. Der aktuelle Renderer setzt dynamische Werte außerdem
auf die gleichnamige Element-Property und setzt diese beim Entfernen eines
Attributwerts auf ihren Browser-Default zurück.

Die `@`-Attributsyntax wird durch eine geklammerte Syntax ersetzt. Attribute
können ein explizites Mapping auf eine JavaScript-Property erhalten. Der
Property-Name ist case-sensitive. Ohne Mapping bleibt die bisherige Zuordnung
auf eine gleichnamige Property bestehen; ein explizites Mapping überschreibt
diese Zuordnung und ein leeres Mapping schaltet sie ab. Die Anwendung
beziehungsweise das verwendete Framework legt damit fest, welche Property
angesprochen wird.

Diese Änderung betrifft ausschließlich `@`-Attributvorlagen im Markup.
Andere `@`-Verwendungen, etwa der Parameter `@ATTRIBUTES-STATICS`, bleiben
unverändert.

## Gewünschtes Verhalten

Eine Schreibweise in eckigen Klammern kennzeichnet ein Attribut, das erst beim
Rendering als echtes Attribut gesetzt wird. Die Klammern werden dabei nicht in
das resultierende DOM-Attribut übernommen:

```html
<img [src]="{{image.url}}">
```

Nach dem Rendering besitzt das Element das Attribut `src`; der Browser
verarbeitet es nicht vor der Expression-Auswertung.

Ein optionales Mapping in eckigen Klammern am Attributnamen gibt die
JavaScript-Property an, die der Renderer zusätzlich zum Attribut setzen soll.
Die notierten Schreibweisen und ihre Wirkung sind:

```html
<div mein-attribut[checked]="123"></div>
<div [mein-attribut[checked]]="123"></div>
<img [src[xxx]]="{{image.url}}">
```

Für `[src[xxx]]` setzt der Renderer das DOM-Attribut `src` und die
Element-Property `element.xxx`. Attribut- und Property-Name sind getrennt
angegeben; der Property-Name wird exakt und case-sensitive verwendet. Ohne
explizites Mapping würde der Renderer die gleichnamige Property `element.src`
ansprechen.

Ein leeres Mapping ist ausdrücklich möglich. Es unterbindet sowohl das Setzen
der Element-Property als auch deren Zurücksetzen beim Entfernen des
Attributwerts:

```html
<img [src[]]="{{image.url}}">
<img [src[  ]]="{{image.url}}">
```

Beide Schreibweisen bedeuten dasselbe. Ohne Property-Aufruf wird beim
Entfernen kein Browser-Default für diese Property gesetzt. Für ein nicht
leeres Mapping bleibt das bestehende Zurücksetzen der gemappten Property auf
ihren Browser-Default beim Entfernen erhalten.

## Abnahmekriterien

- [ ] Die bisherigen `@`-Attributvorlagen werden durch Attribute Directives
  mit der neuen geklammerten Syntax ersetzt;
  die Beispiele und Verhaltensweisen verwenden keine `@`-Attributvorlagen
  mehr.
- [ ] Ein vollständig geklammertes Attribut wird erst beim Rendering als
  Attribut ohne die Syntaxklammern in das DOM geschrieben.
- [ ] Attributname und optionaler Property-Name sind getrennt angebbar. Bei
  vorhandenem Mapping setzt der Renderer das Attribut und die angegebene
  Element-Property.
- [ ] Ein nicht leeres Property-Mapping wird exakt und case-sensitive
  verwendet und überschreibt die Standardzuordnung auf die gleichnamige
  Element-Property.
- [ ] Ohne explizites Mapping bleibt die bestehende Zuordnung auf die
  gleichnamige Element-Property erhalten.
- [ ] Ein leeres Mapping, einschließlich `[ ]`, ruft keine Element-Property
  auf und setzt sie auch beim Entfernen des Attributwerts nicht zurück.
- [ ] Beim Entfernen eines Attributwerts mit nicht leerem Mapping wird die
  gemappte Property wie bisher auf ihren Browser-Default zurückgesetzt.
- [ ] Andere `@`-Verwendungen, insbesondere `@ATTRIBUTES-STATICS`, bleiben
  unverändert.
- [ ] Die neue Syntax, Property-Zuordnung, das Verhalten leerer Mappings und
  der Wechsel von `@`-Attributen sind in den betroffenen Manuals dokumentiert.

## Erforderliche Tests und Dokumentation

- Ergänze Regressionstests für verzögertes Setzen und Entfernen von Attributen,
  einschließlich eines Attributs wie `src`, das der Browser vor dem Rendering
  auswerten würde.
- Prüfe Attributsetzung mit und ohne Property-Mapping sowie die exakte,
  case-sensitive Verwendung des Property-Namens.
- Prüfe leere und nur aus Leerzeichen bestehende Mappings beim Setzen und
  Entfernen; dabei darf die Element-Property weder gesetzt noch zurückgesetzt
  werden.
- Prüfe das Zurücksetzen einer Property auf ihren Browser-Default bei einem
  nicht leeren Mapping und einem entfernten Attributwert.
- Aktualisiere `../../manuals/markup.md` und `../../manuals/expression.md` um
  Syntax, Laufzeitverhalten und Migrationshinweise. Ergänze `../../CHANGES`
  um den Syntaxwechsel.

## Technischer Umfang

- Runtime-Quelle: `../../sources/composer.js`
- Tests und Fixtures: betroffene Markup- und Composer-Tests unter `../../test/`
- Dokumentation: `../../manuals/markup.md`, `../../manuals/expression.md` und
  `../../CHANGES`
- Generierte Test-Bundles werden bei Runtime-Änderungen aus den Quellen mit
  dem vorhandenen Build erzeugt; generierte Dateien werden nicht manuell
  bearbeitet.
