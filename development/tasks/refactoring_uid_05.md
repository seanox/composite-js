# 05 - Dokumentation (Code-Kommentare und Manual)

Übergeordnet: `refactoring_uid.md`
Dateien: `sources/composer.js`, `sources/extension.js`, `manuals/extensions.md`,
`manuals/README.md`
Aufwand: 2 Story Points
Abhängigkeiten: 01, 02, 03

---

## A - Manual: `manuals/extensions.md`

Der Abschnitt :128-144 wird ersetzt. Die Überschrift ändert sich, dadurch ändert
sich auch der Anker (`#objectprototypeordinal` → `#objectprototypeuid`).

Bisher:

```markdown
### Object.prototype.ordinal
Gets the serial ID to the objects. The ID is created continuously and should
help if a unique ID is needed at runtime.

```javascript
const object1 = {};
const object2 = {};

object1.ordinal() != object2.ordinal();

const element1 = document.createElement("a");
const element2 = element1.cloneNode(true);

element1.ordinal() != element2.ordinal();
```
```

Neu:

```markdown
### Object.prototype.uid
Gets the UID of an object. The UID is assigned on first access and is then
stable for the lifetime of the object. It is used if a unique identifier is
needed at runtime, e.g. to compare, map and reference objects.

The value is stored internally with a symbol and therefore does not appear in
`Object.keys`, `for-in` and `JSON.stringify` and does not collide with a data
field of the same name.

The order of assignment is an implementation detail. The UID must not be used
for sorting or to derive a chronological order.

Objects that are not extensible (`Object.freeze`, `Object.seal`) and objects
without prototype (`Object.create(null)`) are not supported.

```javascript
const object1 = {};
const object2 = {};

object1.uid() != object2.uid();

const element1 = document.createElement("a");
const element2 = element1.cloneNode(true);

element1.uid() != element2.uid();
```
```

## B - Manual: `manuals/README.md`

Zeile :251 anpassen:

```markdown
    - [Object.prototype.uid](extensions.md#objectprototypeuid)
```

> Im Inhaltsverzeichnis wird jede Überschrift der Kapiteldateien verlinkt. Der
> Anker muss exakt der neuen Überschrift entsprechen (Kleinschreibung, Punkte
> entfallen). Die Position innerhalb des Abschnitts `Object` bleibt unverändert.

Die Kopf- und Fußzeilen von `extensions.md` verlinken auf Abschnitte in
`README.md` und sind nicht betroffen.

## C - Code-Dokumentation: `sources/composer.js`

| Stelle | Anpassung |
|---|---|
| :1154-1164 | Absatz „Serial" im Klassenkommentar von `Composer.render`. Überschrift `Serial` → `UID`, Text entsprechend: die UID ist eine Erweiterung der JavaScript-API des Objekts, erzeugt eine eindeutige ID je Objekt und wird von Composite und Rendering genutzt, weil sie über das Markup nicht verändert werden kann. |
| :1155 | „The serial, the reference on the HTML element …" → „The UID, the reference …" |
| :1884 | `(key:serial, value:meta)` → `(key:uid, value:meta)` |
| :2208 | „expression with a serial" → „expression with a UID" |
| :3082-3085 | Kommentar zur Cache-Bereinigung: „Since serial is used only as a key prefix …" → „Since the UID is used only as a key prefix …", „without tracking serials" → „without tracking UIDs" |
| :2711-2714 | Kommentar der Erweiterung, siehe Teilaufgabe 01 |

## D - Code-Dokumentation: `sources/extension.js`

Der Beispielblock im Kommentar zu `compliant` (:37-42) nennt die alte API:

```js
 *     compliant("Object.prototype.ordinal");
 *     compliant(null, Object.defineProperty(Object.prototype, "ordinal", {...});
```

Anpassen auf `uid`. `compliant("Math.serial")` in :39-40 bleibt unverändert.

## Vorgaben

- `Math.serial` (extensions.md:119-126) und `window.serial` (:300-308) bleiben
  unverändert. Eine Vereinheitlichung zu `window.uid` wäre ein separater
  API-Bruch und ist nicht Teil dieses Tickets.
- Die Sprache der Manuals ist Englisch, die der Ticketdateien Deutsch.

## Prüfung

- Alle Anker in `manuals/README.md` lassen sich auflösen.
- `Select-String -Path manuals\*.md -Pattern 'ordinal'` liefert keine Treffer.
- `Select-String -Path sources\*.js -Pattern 'ordinal'` liefert keine Treffer.
