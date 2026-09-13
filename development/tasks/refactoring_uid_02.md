# ~~02 - Aufrufer auf serial() vereinheitlichen~~

Übergeordnet: `refactoring_uid.md`
Dateien: `sources/composer.js`, `sources/reactive.js`
Aufwand: 1 Story Point
Abhängigkeiten: 01 (gemeinsamer Commit)

---

## ~~Ziel~~

Alle aktiven Abfragen der Objektidentität verwenden `serial()`. Direkte
Zugriffe auf `uid` sind nur dort vorgesehen, wo ausdrücklich geprüft werden
muss, ob bereits eine Identität vergeben wurde, ohne dabei eine neue anzulegen.

Die Umstellung ist in den Quellen bereits weitgehend erfolgt. Dieses Ticket
dient der Vervollständigung und der eindeutigen Abgrenzung der Begriffe.

## ~~A - Methodenaufrufe~~

- Verbliebene Aufrufe von `ordinal()` werden zu `serial()`.
- Eventuell aus der vorherigen Planung übernommene Aufrufe von `uid()` werden
  ebenfalls zu `serial()`.
- Die bereits vorhandenen `serial()`-Aufrufe in `composer.js` und `reactive.js`
  bleiben unverändert.

Beispiele:

```js
const serial = selector.serial();
const object = _render_meta[serial];

Expression.eval(selector.serial() + ":" + attribute.name, expression);
```

## ~~B - Interne Bezeichner~~

Lokale Variablen, Parameter und Meta-Felder mit dem Namen `serial` bleiben
erhalten. Sie enthalten das Ergebnis von `serial()` und entsprechen damit der
öffentlichen Methodenterminologie.

Insbesondere bleiben unverändert:

- lokale Variablen wie `const serial = selector.serial()`;
- Parameter wie `_render_meta_initialize(selector, serial)`;
- das Feld `object.serial` in den Meta-Objekten von `Composer.render.meta`;
- Kommentare, die tatsächlich eine durch `serial()` abgefragte Seriennummer
  beschreiben.

Das öffentliche Meta-Feld wird somit nicht umbenannt und erzeugt keinen
zusätzlichen API-Bruch.

## ~~C - Direkter UID-Zugriff bei reinen Lookups~~

Bei reinen Existenz- und Meta-Lookups darf keine neue UID erzeugt werden. Diese
Stellen verwenden deshalb die Property direkt. Das betrifft in `composer.js`:

- Validierung und Mount unbekannter Elemente;
- den Scan statischer Attribute;
- den Lookup eines übergebenen Composites;
- Cleanup und MutationObserver.

In `reactive.js` liest `_release` die UID beim Freigeben von Subscriptions
ebenfalls direkt:

```js
const _release = (node) => {
    const uid = node.uid;
    if (uid !== undefined)
        _shadow_release(uid);
    if (node.childNodes)
        Array.from(node.childNodes).forEach((node) =>
            _release(node));
};
```

Die teilweise vorhandene Variante

```js
if (node.serial !== undefined)
    _shadow_release(node.serial());
```

ist falsch: `serial` ist über den Prototyp immer vorhanden und der Aufruf würde
für Knoten ohne Subscription unnötig eine neue `uid` anlegen.

## ~~D - Nicht anfassen~~

- ~~Die lokale Markup-ID in `_mount_locate` wird in Teilaufgabe 03 behandelt.~~
- ~~`Math.serial()` und `window.serial` in extension.js bleiben unverändert.~~
- ~~`Expression.eval` verwendet `serial` derzeit als Cache-Schlüssel; die
  optionale Umbenennung ist Teilaufgabe 06.~~
- ~~`Test.worker.task.meta.serial` und `renderSerial` sind fachlich eigenständige
  Zähler.~~

## ~~Prüfung~~

- ~~In `sources/**` gibt es keine Aufrufe von `ordinal()` oder `uid()`.~~
- ~~Identitätsabfragen in `composer.js` und `reactive.js` verwenden `serial()`.~~
- ~~Reine Meta-Lookups verwenden eine bereits vorhandene `uid` und rufen nicht
  `serial()` auf.~~
- ~~Das Meta-Feld `serial` von `Composer.render.meta` bleibt erhalten.~~
