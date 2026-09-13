# 06 - Optional: Cache-Schlüssel in expression.js umbenennen

Übergeordnet: `refactoring_uid.md`
Datei: `sources/expression.js`
Aufwand: 1 Story Point
Abhängigkeiten: 02
Status: optional, kann entfallen

---

## Ziel

`Expression.eval` nennt seinen optionalen ersten Parameter `serial`. Der Wert
ist jedoch keine Seriennummer und keine `uid`, sondern ein zusammengesetzter
Cache-Schlüssel.

Die Umbenennung ist unabhängig von der Entscheidung, dass `serial()` die
Objektidentität abfragt. Sie dient ausschließlich der lokalen Präzisierung in
`expression.js`.

## Bestand

`sources/expression.js` verwendet `serial` in Dokumentation, Signatur, lokaler
Variable und den Zugriffen auf `_cache`.

Aufgerufen wird die Funktion aus composer.js typischerweise mit einem aus der
Objektidentität und einem Attributnamen zusammengesetzten Schlüssel:

```js
Expression.eval(selector.serial() + ":" + Composer.ATTRIBUTE_ID, id);
```

Der vollständige Wert ist damit kein `serial()`-Ergebnis mehr.

## Empfehlung

Der Parameter wird zu `key` umbenannt:

```js
/**
 * Interprets the passed expression. In case of an error, the error is
 * returned and no error is thrown. A key can be specified optionally. The key
 * is an alias for caching compiled expressions. Without, the expressions are
 * always compiled. ...
 *
 *     function(expression)
 *     function(key, expression)
 *
 * @param {string} [key] Optional key for caching expressions
 * @param {string} expression Expression to be interpreted.
 */
```

## Vorgaben

- Reine Umbenennung von Parameter, lokaler Variable und JSDoc. Kein
  Verhaltenswechsel und keine Signaturänderung.
- Die Aufrufer in composer.js bleiben unverändert, da der Parameter positional
  übergeben wird.
- `selector.serial()` in den Aufrufern bleibt ausdrücklich erhalten.
- Andere fachlich korrekte Verwendungen von `serial` werden nicht geändert.

## Abwägung

Dafür: `key` beschreibt die Funktion des Parameters präziser und verhindert
eine Verwechslung mit `Object.prototype.serial()`.

Dagegen: `Expression.eval` ist dokumentierte API. Der Parametername taucht zwar
nicht im Manual auf, erscheint aber in der IDE-Signaturhilfe. Der Nutzen ist
rein terminologisch.

Empfehlung: umsetzen, aber in einem eigenen Commit, damit die kosmetische
Änderung bei Bedarf separat zurückgenommen werden kann.
