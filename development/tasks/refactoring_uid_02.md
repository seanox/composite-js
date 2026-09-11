# 02 - Aufrufer in composer.js und reactive.js umbenennen

Übergeordnet: `refactoring_uid.md`
Dateien: `sources/composer.js`, `sources/reactive.js`
Aufwand: 3 Story Points
Abhängigkeiten: 01 (gemeinsamer Commit)

---

## Ziel

Alle Aufrufe von `ordinal()` werden zu `uid()`. Alle lokalen Variablen,
Parameter und Meta-Felder, die eine Objekt-Identität halten, heißen `uid`.

> **Achtung:** Kein globales Suchen/Ersetzen. `serial` hat in composer.js drei
> verschiedene Bedeutungen. Die Markup-ID (composer.js:1777-1814) wird in
> Teilaufgabe 03 gesondert behandelt und ist hier **nicht** anzufassen.

## A - Aufrufstellen `\.ordinal\(\)` → `\.uid\(\)`

`sources/composer.js`, 28 Stellen:

| Zeile | Bisher |
|---|---|
| 503 | `const serial = selector.ordinal();` |
| 745 | `const serial = selector.ordinal();` |
| 828 | `const serial = target.ordinal();` |
| 1085 | `const serial = element.ordinal();` |
| 1218 | `&& !_render_meta[selector.ordinal()]) {` |
| 1222 | `id = Expression.eval(selector.ordinal() + ":" + Composer.ATTRIBUTE_ID, id);` |
| 1247 | `let serial = selector.ordinal();` |
| 1479 | `object = _render_meta[composite.ordinal()];` |
| 1653 | `let serial = selector.ordinal();` |
| 1988 | `attribute.value = Expression.eval(selector.ordinal() + ":" + attribute.name, …);` |
| 2045 | `object = {serial:marker.ordinal(), element:marker, attributes,` |
| 2082 | `if (object.condition.share === lock.ordinal())` |
| 2087 | `if (Math.abs(object.condition.share \|\| 0) !== lock.ordinal()) {` |
| 2088 | `object.condition.share = -lock.ordinal();` |
| 2111 | `condition.share = lock.ordinal();` |
| 2126 | `_render_meta[element.ordinal()] = {` |
| 2127 | `serial:element.ordinal(), element, attributes, condition,` |
| 2145 | `if (object.condition.share !== -lock.ordinal())` |
| 2146 | `object.condition.share = lock.ordinal();` |
| 2223 | `const serial = node.ordinal();` |
| 2265 | `const serial = node.ordinal();` |
| 2392 | `const serial = selector.ordinal();` |
| 2397 | `const serial = selector.ordinal();` |
| 2412 | `const serial = selector.ordinal();` |
| 2909 | `const serial = node.ordinal();` |
| 2928 | `delete _render_meta[node.ordinal()];` |
| 2967 | `const serial = record.target.ordinal();` |
| 3070 | `if (_render_meta[node.ordinal()])` |

`sources/reactive.js`, 4 Stellen: :187, :209, :212, :265.

## B - Lokale Variablen und Parameter `serial` → `uid`

Betroffen sind alle Stellen, an denen `serial` aus `ordinal()` stammt oder als
Schlüssel für `_render_meta` dient:

- Lokale Deklarationen an den unter A genannten Zeilen (503, 745, 828, 1085,
  1247, 1653, 2223, 2265, 2392, 2397, 2412, 2909, 2967) sowie deren
  Verwendungen im jeweiligen Funktionsrumpf.
- Funktionsparameter inklusive JSDoc `@param {number} serial Serial of the …`:
  - `_render_meta_initialize(selector, serial)` - :1941, :1944, :1947, :1949
  - `_render_attribute_condition_initialize(selector, object, serial, lock)` - :2025, :2030, :2052
  - `_render_attribute_condition(selector, object, serial, lock)` - :2070, :2074, :2098
  - `_render_attribute_import(selector, object, serial, lock)` - :2363, :2366, :2382
  - `_render_attribute_output(selector, object, serial)` - :2436, :2438, :2446
  - `_render_attribute_interval(selector, object, serial)` - :2470, :2473, :2477
  - `_render_attribute_iterate(selector, object, serial, lock)` - :2511, :2515, :2530
  - `_render_attributes_update(selector, object, serial)` - :2599, :2601, :2622
- Die Aufrufe dieser Funktionen in `Composer.render` - :1276, :1283, :1292,
  :1316-:1320.

JSDoc entsprechend anpassen, z. B.
`@param {number} uid UID of the element`.

## C - Meta-Feld `object.serial` → `object.uid`

Das Feld der Render-Meta-Objekte wird umbenannt:

- :1947 `const object = {serial, element:selector, attributes:{}, …}`
- :2045 / :2048 `object = {serial:marker.ordinal(), …}` / `_render_meta[object.serial] = object`
- :2127 `serial:element.ordinal(), element, attributes, condition,`
- :2224 / :2231 / :2234 `{serial, element:node, …}` bzw. `this.serial + ":" + …`
- :2266 `{serial, element:node, attributes:{}, …}`
- :1654 `let object = _render_meta[serial] \|\| {};`

> **Hinweis:** `_render_meta` ist über `Composer.render.meta` (:1887-1889)
> öffentlich lesbar. Das umbenannte Feld ist damit Teil des API-Bruchs und
> gehört in den CHANGES-Eintrag (Teilaufgabe 07).

## D - Textmarken-Platzhalter

composer.js:2245 erzeugt `"{{" + serial + "}}"`, :2258 liest ihn mit
`parseInt(word.substring(2, word.length -2).trim())` zurück. Beide Stellen
konsistent auf `uid` umbenennen. Das Format des Platzhalters bleibt unverändert.

## E - Nicht anfassen

- composer.js:1777-1814 (`_mount_locate`) -- Markup-Composite-ID, siehe 03.
- `Math.serial`, `window.serial` in extension.js.
- `meta.serial` in test.js.

## Prüfung

- `Select-String -Path sources\composer.js,sources\reactive.js -Pattern '\bordinal\b'`
  liefert keine Treffer.
- `Select-String -Path sources\reactive.js -Pattern '\bserial\b'` liefert nur
  noch `Math.serial()` (:88).
- Alle Tests unter `test/index.html` laufen grün.
