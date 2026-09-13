# 05 - Dokumentation (Code-Kommentare und Manual)

Übergeordnet: `refactoring_uid.md`
Dateien: `sources/composer.js`, `sources/reactive.js`,
`sources/extension.js`, `manuals/extensions.md`, `manuals/README.md`
Aufwand: 2 Story Points
Abhängigkeiten: 01, 02, 03, 04

---

## A - Manual: manuals/extensions.md

Der Abschnitt `Object.prototype.serial` beschreibt Methode und Property
getrennt:

````markdown
### Object.prototype.serial
Gets the unique identifier (`uid`) of an object. If the object does not yet
have a `uid`, a numeric value is assigned on first access. Subsequent calls
return the same value.

The generated `uid` is stored as a non-enumerable, read-only property of the
object. It therefore does not appear in `Object.keys`, `for-in` or
`JSON.stringify`, but it can be read directly as `object.uid`.

If an object already has a defined `uid`, `serial()` returns that value
unchanged. Its uniqueness and stability are then the caller's responsibility.
The order of generated values is an implementation detail and must not be used
to derive chronological order.

Objects that are not extensible (`Object.freeze`, `Object.seal`) require an
existing `uid`. Objects without a prototype (`Object.create(null)`) do not
provide the method.

```javascript
const object1 = {};
const object2 = {};

object1.serial() != object2.serial();
object1.uid === object1.serial();

const element1 = document.createElement("a");
const element2 = element1.cloneNode(true);

element1.serial() != element2.serial();
```
````

Die Überschrift und der Anker bleiben
`Object.prototype.serial` / `#objectprototypeserial`.

## ~~B - Manual: manuals/README.md~~

Der vorhandene Eintrag muss weiterhin lauten:

```markdown
    - [Object.prototype.serial](extensions.md#objectprototypeserial)
```

Es wird kein Eintrag `Object.prototype.uid` ergänzt, weil `uid` keine Methode
auf dem Prototyp ist. Die Kopf- und Fußzeilen von `extensions.md` bleiben
unverändert.

## C - Code-Dokumentation

### sources/extension.js

Der Kommentar von `Object.prototype.serial` muss erklären:

- `serial()` fragt die eindeutige Objektidentität ab;
- der Wert liegt in der Own-Property `uid`;
- eine fehlende UID wird beim ersten Aufruf vergeben;
- eine vorhandene UID wird unverändert zurückgegeben.

### sources/composer.js

Kommentare zur Objektidentität verwenden `serial` für die Methode bzw. deren
Ergebnis und `uid` nur für die gespeicherte Property. Insbesondere:

- Der Klassenkommentar von `Composer.render` erklärt, dass `serial()` die UID
  des Elements liefert.
- ~~`(key:serial, value:meta)` und das öffentliche Meta-Feld `serial` bleiben
  unverändert.~~
- ~~Kommentare zu Expression-Cache-Präfixen dürfen weiterhin von `serial`
  sprechen, solange sie das Ergebnis von `serial()` meinen.~~

### ~~sources/reactive.js~~

- ~~Der Kommentar von `_release` erklärt, dass `node.uid` direkt gelesen wird,
  damit `serial()` keine neue UID anlegt.~~
- ~~Kommentare der Shadow-Map dürfen `serial` verwenden, weil ihre Schlüssel aus
  `serial()` stammen.~~
- ~~Das provisorische `TODO: serial / uid` wird entfernt.~~

## ~~D - Nicht ändern~~

- ~~`Math.serial` und `window.serial` bleiben unverändert.~~
- ~~`Object.prototype.serial` wird nicht zu `Object.prototype.uid` umbenannt.~~
- ~~Das Meta-Feld `serial` von `Composer.render.meta` bleibt erhalten.~~
- ~~Die Sprache der Manuals ist Englisch, die der Ticketdateien Deutsch.~~

## Prüfung

- ~~Jeder Link in `manuals/README.md` lässt sich auflösen.~~
- ~~`Object.prototype.serial` ist dokumentiert; `Object.prototype.uid` wird
  nicht als API-Methode aufgeführt.~~
- ~~In Quellen und Manuals wird `uid()` nirgends als aufrufbare Methode
  dargestellt.~~
- ~~Veraltete Verweise auf `ordinal()` sind entfernt.~~
