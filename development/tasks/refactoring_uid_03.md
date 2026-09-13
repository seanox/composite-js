# 03 - Markup-ID in composer.js entflechten

Übergeordnet: `refactoring_uid.md`
Datei: `sources/composer.js`, Funktion `_mount_locate`
Aufwand: 2 Story Points
Abhängigkeiten: 02

---

## Ziel

In `_mount_locate` heißt die aus dem Markup gelesene Composite-/Element-ID
derzeit `serial`. Sie ist keine über `serial()` abgefragte Objektidentität,
sondern der String aus `Composer.ATTRIBUTE_ID`, der über
`PATTERN_COMPOSITE_ID` bzw. `PATTERN_ELEMENT_ID` in `namespace`, `route` und
`unique` zerlegt wird.

Der Name wird zu `identifier` geändert, damit `serial` nur noch für tatsächliche
Seriennummern und die Methode `serial()` verwendet wird.

## Umbenennung

`serial` -> `identifier`

Zusätzlich wird die Doppelbelegung der Variablen aufgelöst: Der Identifier wird
aktuell mit dem Ergebnis von `String.prototype.match` überschrieben und hält
danach kein String mehr, sondern ein Match-Array. Dafür wird eine eigene
Variable `matches` eingeführt.

## Bisher (gekürzt)

```js
let serial = (element.getAttribute(Composer.ATTRIBUTE_ID) || "").trim();
if (element.hasAttribute(Composer.ATTRIBUTE_COMPOSITE)) {
    const composite = serial.match(Composer.PATTERN_COMPOSITE_ID);
    if (!composite)
        throw new Error(`Invalid composite id${serial ? ": " + serial : ""}`);
    ...
}
...
if (!serial.match(Composer.PATTERN_ELEMENT_ID))
    throw new Error(`Invalid element id${serial ? ": " + serial : ""}`);
...
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

## Soll

```js
const identifier = (element.getAttribute(Composer.ATTRIBUTE_ID) || "").trim();
if (element.hasAttribute(Composer.ATTRIBUTE_COMPOSITE)) {
    const composite = identifier.match(Composer.PATTERN_COMPOSITE_ID);
    if (!composite)
        throw new Error(`Invalid composite id${identifier ? ": " + identifier : ""}`);
    ...
}
...
const matches = identifier.match(Composer.PATTERN_ELEMENT_ID);
if (!matches)
    throw new Error(`Invalid element id${identifier ? ": " + identifier : ""}`);
...
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

- `let` wird zu `const`, da `identifier` nicht neu zugewiesen wird.
- Der doppelte `match`-Aufruf für `PATTERN_ELEMENT_ID` wird zu einem einzigen
  Aufruf zusammengefasst.
- Die Reihenfolge der Prüfungen bleibt unverändert. Der Match-Aufruf muss
  weiterhin nach `_mount_locate(element.parentNode)` und nach der Prüfung auf
  `ATTRIBUTE_ID` stehen.
- Fehlermeldungen (`Invalid composite id`, `Invalid element id`) bleiben
  unverändert, da sie in Tests geprüft werden.
- Andere Bezeichner `serial` in composer.js werden nicht pauschal umbenannt.
  Ergebnisse von `serial()` dürfen weiterhin `serial` heißen.

## Prüfung

- In `_mount_locate` gibt es keine lokale Variable `serial` mehr.
- Tests mit ungültigen IDs werfen weiterhin dieselben Meldungen.
- Alle bestehenden Mount- und Routing-Tests laufen unverändert.
