# 03 - Markup-ID in composer.js entflechten

Übergeordnet: `refactoring_uid.md`
Datei: `sources/composer.js`, Funktion `_mount_locate` (:1766-1830)
Aufwand: 2 Story Points
Abhängigkeiten: 02

---

## Ziel

In `_mount_locate` heißt die aus dem Markup gelesene Composite-/Element-ID
`serial`. Das ist die dritte Bedeutung des Begriffs im selben Modul und hat mit
der Objekt-Identität nichts zu tun: Es handelt sich um den String aus
`Composer.ATTRIBUTE_ID`, der über `PATTERN_COMPOSITE_ID` bzw.
`PATTERN_ELEMENT_ID` in `namespace`, `route` und `unique` zerlegt wird.

Fachlich entspricht das JSFs `UIComponent.getId()` -- einer vom Autor im Markup
vergebenen ID -- während `uid()` dem framework-erzeugten
`UIViewRoot.createUniqueId()` entspricht. Die Namen sollen diese Trennung
abbilden.

## Umbenennung

`serial` → `identifier`

Zusätzlich wird die Doppelbelegung der Variablen aufgelöst: Ab :1805 wird
`serial` mit dem Ergebnis von `String.prototype.match` überschrieben, hält also
kein String mehr, sondern ein Match-Array. Dafür ist eine eigene Variable
einzuführen.

## Bisher (:1777, :1791-1814, gekürzt)

```js
let serial = (element.getAttribute(Composer.ATTRIBUTE_ID) || "").trim();
if (element.hasAttribute(Composer.ATTRIBUTE_COMPOSITE)) {
    const composite = serial.match(Composer.PATTERN_COMPOSITE_ID);
    if (!composite)
        throw new Error(`Invalid composite id${serial ? ": " + serial : ""}`);
    …
}
…
if (!serial.match(Composer.PATTERN_ELEMENT_ID))
    throw new Error(`Invalid element id${serial ? ": " + serial : ""}`);
…
serial = serial.match(Composer.PATTERN_ELEMENT_ID);
if (serial[4]) {
    meta.namespace = serial[4].split(/:/);
    meta.route = [meta.namespace[meta.namespace.length -1]];
}
meta.route.push(serial[1]);
if (serial[2])
    meta.route.push(...serial[2].split(/:/));
if (serial[3])
    meta.unique = serial[3];
```

## Neu

```js
const identifier = (element.getAttribute(Composer.ATTRIBUTE_ID) || "").trim();
if (element.hasAttribute(Composer.ATTRIBUTE_COMPOSITE)) {
    const composite = identifier.match(Composer.PATTERN_COMPOSITE_ID);
    if (!composite)
        throw new Error(`Invalid composite id${identifier ? ": " + identifier : ""}`);
    …
}
…
const matches = identifier.match(Composer.PATTERN_ELEMENT_ID);
if (!matches)
    throw new Error(`Invalid element id${identifier ? ": " + identifier : ""}`);
…
if (matches[4]) {
    meta.namespace = matches[4].split(/:/);
    meta.route = [meta.namespace[meta.namespace.length -1]];
}
meta.route.push(matches[1]);
if (matches[2])
    meta.route.push(...matches[2].split(/:/));
if (matches[3])
    meta.unique = matches[3];
```

## Vorgaben

- `let` wird zu `const`, da `identifier` nach der Umstellung nicht mehr
  neu zugewiesen wird.
- Der doppelte `match`-Aufruf (:1791 zur Prüfung, :1805 zur Auswertung) wird zu
  einem einzigen Aufruf zusammengefasst. Das ist eine reine Optimierung ohne
  Verhaltensänderung: `PATTERN_ELEMENT_ID` liefert bei Nichttreffer `null`, die
  bisherige Prüfung `if (!serial.match(...))` ist dazu äquivalent.
- Die Reihenfolge der Prüfungen bleibt unverändert. Der `match`-Aufruf muss
  weiterhin **nach** `_mount_locate(element.parentNode)` (:1787) und **nach**
  der Prüfung auf `ATTRIBUTE_ID` (:1788-1789) stehen, damit das Verhalten für
  Elemente ohne ID identisch bleibt.
- Fehlermeldungstexte (`Invalid composite id`, `Invalid element id`) bleiben
  unverändert, da sie in Tests geprüft werden.

## Prüfung

- `Select-String -Path sources\composer.js -Pattern '\bserial\b'` liefert nach
  02 und 03 keine Treffer mehr.
- Tests mit ungültigen IDs werfen weiterhin dieselben Meldungen.
- Alle Tests unter `test/index.html` laufen grün.
