# 07 - Tests, CHANGES und Build

Übergeordnet: `refactoring_uid.md`
Dateien: `test/**`, `CHANGES`, Build-Artefakte
Aufwand: 2 Story Points
Abhängigkeiten: 01-06

---

## A - Bestehende Tests anpassen

| Datei | Zeile | Bisher |
|---|---|---|
| `test/reactive_condition.html` | 561 | `{{#_condition.ordinal()}}` |
| `test/reactive_condition.html` | 572 | `{{#[button@model//String('A')//].ordinal()}}` |
| `test/reactive_recursion.html` | 45 | `return this.ordinal();` |

Jeweils `ordinal()` → `uid()`. Es handelt sich um reine Umbenennungen, die
erwarteten Ergebnisse bleiben unverändert.

Nicht anfassen: `test/extension_window_serial.html`,
`test/extension_window_serial_frame.html` (betreffen `window.serial`),
`test/benchmark/benchmark.js` und `test/benchmark/reactive_burst.html`
(`renderSerial`), `test/compatibility.html` (eigener lokaler Zähler `serial`,
ohne Bezug zur Erweiterung).

## B - Neuer Test `test/extension_object_uid.html`

Bislang gibt es keinen dedizierten Test für die Erweiterung. Er wird nach dem
Muster von `test/extension_url_canonicalPath.html` angelegt.

Abzudeckende Fälle:

1. **Eindeutigkeit** - zwei Objekte liefern verschiedene Werte.
2. **Stabilität** - mehrfache Aufrufe auf demselben Objekt liefern denselben
   Wert.
3. **Klone** - `{...object}` und `element.cloneNode(true)` erhalten eine eigene
   UID.
4. **Keine Serialisierung** - nach `object.uid()` sind `Object.keys(object)`,
   die Schlüssel aus `for-in` und `JSON.stringify(object)` unverändert.
5. **Keine eigene Property** - `object.hasOwnProperty("uid")` ist `false`.
6. **Kollisionsfreiheit** - ein Objekt mit einem Datenfeld `uid` behält dessen
   Wert; die Zuweisung `object.uid = 42` ist im Strict Mode zulässig.
7. **Typen** - funktioniert für Objektliterale, Arrays, `Map`, DOM-Elemente und
   Textknoten.
8. **Alte API entfernt** - `Object.prototype.ordinal` und
   `Object.prototype.serial` sind `undefined`.
9. **Reaktive Objekte** - ein `uid()`-Aufruf auf einem reaktiven Objekt löst
   kein Rendering aus und erzeugt keinen Eintrag in der
   Notification-Verwaltung (ergänzt Teilaufgabe 04).

Grundgerüst:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Seanox composite-js Test Environment</title>
    <style>
      body {
        font-family: monospace;
        white-space: pre;
      }
    </style>
    <script src="composite-js-testing.js"></script>
    <script type="text/javascript">

        Test.activate();

        Test.create({test() {
            const object1 = {};
            const object2 = {};
            Assert.assertTrue(object1.uid() !== object2.uid());
            Assert.assertEquals(object1.uid(), object1.uid());
        }});

        …

        Test.start();
    </script>
  </head>
  <body>
  </body>
</html>
```

Registrierung in `test/index.html`: neuer Eintrag `extension_object_uid.html`
zwischen `extension_namespace_modules.html` und
`extension_string_decodeBase64.html` (:163-164), passend zur alphabetischen
Ordnung des Blocks.

## C - CHANGES

Eintrag im Kopf der Datei, im bestehenden Format (`CR:` für Change Request,
Modul als Präfix). Vorschlag:

```
CR: Composer: Refactoring of the object identity
    - Object.prototype.ordinal has been renamed to Object.prototype.uid
    - The identity is now stored internally with a symbol
      No longer visible in Object.keys, for-in and JSON.stringify
      No longer conflicts with a data field of the same name
    - Object.prototype.serial is no longer reserved and has been released
    - Meta-objects of the renderer use the field uid instead of serial
      Affects the public Composer.render.meta
```

> Der Eintrag beschreibt einen API-Bruch. Die Version im Kopf (`2.1.0 2026xxxx`)
> ist zu prüfen -- eine Umbenennung dokumentierter API rechtfertigt mindestens
> eine Minor-Version.

## D - Build und Artefakte

Nicht händisch bearbeiten, sondern neu erzeugen:

- `release/**`
- `test/composite-js-testing.js`, `test/composite-js-debug-testing.js`
- `benchmarks*/composite-js*.js`
- `tutorials/**/assets/composite-js*.js`

Erzeugung (build.xml:368-381):

```
ant -f development/build.xml compile
ant -f development/build.xml compile-max
```

Der vollständige Release-Lauf (`ant -f development/build.xml release`) enthält
ESLint über `-max.js` und die minimierte Fassung (build.xml:241-242, :262-267)
und muss fehlerfrei durchlaufen.

Zu kontrollieren nach dem Build:

- Der Composer-Block wurde durch build.xml:122-123 korrekt zu
  `compliant("Object.prototype.uid", function(){…})` zusammengefasst.
- Im Debug-Build steht `const _uid = window.__uid = Symbol("uid")`
  (build.xml:236-237, :259-260).
- Die Minimierung hat das Symbol nicht entfernt und `_uid_sequence` korrekt
  umbenannt.

## E - Abschluss

- [ ] Alle Tests unter `test/index.html` grün.
- [ ] `Select-String -Path sources\*.js,manuals\*.md,test\*.html -Pattern 'ordinal'`
      liefert keine Treffer.
- [ ] Ticketdateien `refactoring_uid*.md` nach Abschluss entfernen oder in
      `development/` archivieren.
