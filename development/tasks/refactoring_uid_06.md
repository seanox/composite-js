# 06 - Optional: Cache-Schlüssel in expression.js umbenennen

Übergeordnet: `refactoring_uid.md`
Datei: `sources/expression.js`
Aufwand: 1 Story Point
Abhängigkeiten: 02
Status: optional, kann entfallen

---

## Ziel

`Expression.eval` nennt seinen optionalen ersten Parameter `serial`. Nach
Abschluss von 01-03 ist das die letzte Stelle in den Quellen, an der der
Begriff für etwas anderes als `Math.serial`/`window.serial` steht.

## Bestand

`sources/expression.js`, 10 Treffer:

| Zeile | Inhalt |
|---|---|
| :33-34 | „A serial can be specified optionally. The serial is an alias for caching compiled expressions." |
| :39 | Signatur `function(serial, expression)` |
| :41 | `@param {string} [serial] Optional serial for caching expressions` |
| :55, :58 | `let serial;` / `serial = String(variants[0]);` |
| :60, :63-65 | `_cache.get(serial)` / `_cache.delete(serial)` / `_cache.set(serial, script)` |

Aufgerufen wird die Funktion aus composer.js durchgängig mit einem aus der UID
zusammengesetzten Schlüssel, z. B. :1222
`Expression.eval(selector.uid() + ":" + Composer.ATTRIBUTE_ID, id)`.

## Bewertung

Der Parameter ist **keine** Objekt-Identität, sondern ein Cache-Schlüssel, der
aus einer UID und einem Attributnamen zusammengesetzt wird. Eine Umbenennung zu
`uid` wäre daher sachlich falsch und würde eine neue Unschärfe erzeugen.

Empfohlen wird `key`:

```js
/**
 * Interprets the passed expression. In case of an error, the error is
 * returned and no error is thrown. A key can be specified optionally. The key
 * is an alias for caching compiled expressions. Without, the expressions are
 * always compiled. …
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
  Verhaltenswechsel, keine Signaturänderung.
- Die Aufrufer in composer.js bleiben unverändert, da der Parameter positional
  übergeben wird.
- Der Kommentar in composer.js:3082-3085 zur `Expression.prune`-Bereinigung wird
  bereits in Teilaufgabe 05 angepasst und ist hier nicht erneut zu ändern.

## Abwägung gegen den Verzicht

Dafür: `serial` verschwindet damit vollständig aus den Quellen -- bis auf die
beiden Stellen, an denen es korrekt ist.

Dagegen: `Expression.eval` ist dokumentierte API. Der Parametername taucht zwar
in keinem Manual auf (`manuals/expression.md` nennt ihn nicht), erscheint aber
in der IDE-Signaturhilfe. Der Nutzen ist rein kosmetisch.

Empfehlung: umsetzen, aber in einem eigenen Commit, damit es bei Bedarf
separat zurückgenommen werden kann.
