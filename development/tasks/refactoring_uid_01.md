# ~~01 - Kern-API in extension.js fertigstellen~~

Übergeordnet: `refactoring_uid.md`
Datei: `sources/extension.js`
Aufwand: 1 Story Point
Abhängigkeiten: keine (soll gemeinsam mit 02 committet werden)

---

## ~~Ziel~~

`Object.prototype.ordinal()` wird durch `Object.prototype.serial()` ersetzt.
Die abgefragte Objektidentität liegt als Own-Property `uid` auf dem Objekt.
Diese Umstellung ist bereits teilweise umgesetzt und wird in diesem Schritt
bereinigt und abgeschlossen.

## Bisher

```js
let _serial = 0;

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

## ~~Soll~~

```js
const _sequence = {symbol:Symbol(), value:0};

compliant("Object.prototype.uid");
compliant("Object.prototype.serial");
compliant(null, Object.prototype.serial = function() {
    if (this.uid === undefined)
        Object.defineProperty(this, "uid", {
            value: ++_sequence.value
        });
    return this.uid;
});
```

## ~~Vorgaben~~

- ~~`serial()` ist die Methode, `uid` die Property. Eine Methode `uid()` wird
  nicht eingeführt.~~
- ~~`compliant("Object.prototype.uid")` prüft, dass der Property-Name auf dem
  Prototyp noch frei ist. Die Zeile definiert selbst keine Property.~~
- ~~Die zweizeilige `compliant`-Form für `Object.prototype.serial` ist zwingend,
  damit build.xml:122-123 sie im Build korrekt zusammenfasst.~~
- ~~Die Methode bleibt eine normale `function`, weil sie ihr aufrufendes Objekt
  über `this` benötigt.~~
- ~~Eine vorhandene `uid` wird unverändert zurückgegeben. Nur bei
  `this.uid === undefined` wird eine neue numerische UID vergeben.~~
- ~~Für `uid` werden keine Descriptor-Optionen ergänzt. Die Standardwerte
  `enumerable: false`, `writable: false` und `configurable: false` sind
  beabsichtigt.~~
- ~~`_sequence` bleibt als konstantes Statusobjekt mit `symbol` und `value`
  erhalten. Die laufende Nummer wird ausschließlich über `_sequence.value`
  erhöht; die UID selbst wird in der String-Property `uid` gespeichert.~~
- ~~`window.serial` muss im Modul weiterhin vor `Object.prototype.serial`
  definiert werden.~~

## ~~Prüfung~~

```js
const object = {name: "x"};
const serial = object.serial();

object.uid === serial;                  // true
object.serial() === serial;             // true
object.hasOwnProperty("uid");           // true
Object.keys(object);                    // ["name"]
JSON.stringify(object);                 // {"name":"x"}

const assigned = {uid: "external"};
assigned.serial();                      // "external"

typeof Object.prototype.serial;         // "function"
typeof Object.prototype.ordinal;        // "undefined"
typeof Object.prototype.uid;            // "undefined"
```
