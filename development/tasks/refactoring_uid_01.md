# 01 - Kern-API in composer.js umstellen

Übergeordnet: `refactoring_uid.md`
Datei: `sources/composer.js`
Aufwand: 2 Story Points
Abhängigkeiten: keine (muss gemeinsam mit 02 committet werden)

---

## Ziel

Die Erweiterung `Object.prototype.ordinal()` wird durch
`Object.prototype.uid()` ersetzt. Der Speicher wandert von einer sichtbaren
String-Property auf ein modul-privates Symbol.

## Bisher (composer.js:2709-2723)

```js
let _serial = 0;

/**
 * Enhancement of the JavaScript API
 * Adds a function for getting the serial ID to the objects.
 */
compliant("Object.prototype.serial");
compliant("Object.prototype.ordinal");
compliant(null, Object.prototype.ordinal = function() {
    if (this.serial === undefined)
        Object.defineProperty(this, "serial", {
            value: ++_serial
        });
    return this.serial;
});
```

## Neu

```js
/**
 * Symbol used as hidden key for the object identity. A symbol is used so that
 * the identity cannot collide with data fields, does not appear in
 * Object.keys, for-in and JSON.stringify, and is not visible as an own
 * property for the reactive notification management.
 */
const _uid = Symbol("uid");

let _uid_sequence = 0;

/**
 * Enhancement of the JavaScript API
 * Adds a function for getting the UID of an object. The UID is a unique
 * identifier that is assigned on first access and is then stable for the
 * lifetime of the object. The order of assignment is an implementation detail
 * and must not be used for sorting or comparison.
 * @returns {number} The UID of the object
 */
compliant("Object.prototype.uid");
compliant(null, Object.prototype.uid = function() {
    let uid = this[_uid];
    if (uid === undefined)
        Object.defineProperty(this, _uid, {value: uid = ++_uid_sequence});
    return uid;
});
```

## Vorgaben

- Die beiden Reservierungen `compliant("Object.prototype.serial")` und
  `compliant("Object.prototype.ordinal")` entfallen ersatzlos. Beide Namen
  werden damit für Fremdcode freigegeben.
- Die Zuweisung erfolgt als schlichte Zuweisung. **Kein**
  `Object.defineProperty(Object.prototype, "uid", {...})` und insbesondere kein
  `writable: false` -- das würde `object.uid = 42` im Strict Mode werfen lassen
  und die Methode unüberschattbar machen.
- **Kein Getter.** Ein Accessor auf `Object.prototype` ohne Setter blockiert
  seitenweit jede Zuweisung an ein Feld `uid` und lässt bereits einen reinen
  Lesezugriff auf eingefrorene Objekte werfen.
- Die Konstante heißt `_uid`, nicht `uid`. Bei `const uid = Symbol("uid")`
  überschattet das lokale `let uid` in der Methode die Konstante und erzeugt
  `ReferenceError: Cannot access 'uid' before initialization`.
- `let _uid_sequence` ersetzt `let _serial`. Der Zähler bleibt eine `let`-
  Variable, damit ihn das Debug-Regex (build.xml:236-237, greift nur auf
  `const`) nicht umschreibt.
- Die zweizeilige `compliant`-Form ist zwingend, siehe build.xml:122-123.
- Position im Modul: unverändert an der Stelle des bisherigen Blocks, damit die
  Deklaration von `_uid` vor allen Aufrufern liegt.

## Prüfung

```js
const object = {name: "x"};
object.uid();
Object.keys(object);              // ["name"]
JSON.stringify(object);           // {"name":"x"}
object.hasOwnProperty("uid");     // false
object.uid() === object.uid();    // true
({...object}).uid() !== object.uid();  // true
(() => {"use strict"; const o = {}; o.uid = 42; return o.uid;})();  // 42
Object.assign({}, {uid: 7});      // {uid: 7}
typeof Object.prototype.ordinal;  // "undefined"
typeof Object.prototype.serial;   // "undefined"
```
