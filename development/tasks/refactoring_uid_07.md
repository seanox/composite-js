# 07 - Tests, CHANGES und Build

Übergeordnet: `refactoring_uid.md`
Dateien: `test/**`, `CHANGES`, Build-Artefakte
Aufwand: 3 Story Points
Abhängigkeiten: 01-06

---

## A - Bestehende Tests anpassen

Alle Tests der Objektidentität müssen das Zielbild abdecken:

- ~~`serial()` ist die Abfragemethode;~~
- ~~`uid` ist die direkt lesbare Property;~~
- ~~`ordinal()` und `uid()` werden nicht verwendet.~~

~~Bereits teilweise umgestellte Stellen in `test/reactive_condition.html` und
`test/reactive_recursion.html` werden geprüft und vereinheitlicht. Direkte
Ausgaben von `.uid` und der Vergleich mit `.serial()` sind ausdrücklich
zulässig und sollen erhalten bleiben.~~

`test/reactive_recipients.html` muss für den Sonderfall der Freigabe prüfen,
dass eine noch nicht vergebene UID nicht durch einen unnötigen `serial()`-Aufruf
erzeugt wird.

Nicht anfassen:

- ~~`test/extension_window_serial.html` und
  `test/extension_window_serial_frame.html` betreffen `window.serial`;~~
- ~~`test/benchmark/benchmark.js` und
  `test/benchmark/reactive_burst.html` verwenden `renderSerial`;~~
- ~~`test/compatibility.html` verwendet einen eigenen lokalen Zähler `serial`.~~

## B - Neuer Test test/extension_object_serial.html

Für die Erweiterung wird nach dem Muster der vorhandenen Extension-Tests ein
dedizierter Test angelegt.

Abzudeckende Fälle:

1. **Eindeutigkeit** - zwei Objekte ohne vorgegebene UID erhalten verschiedene
   Werte.
2. **Stabilität** - mehrfache `serial()`-Aufrufe liefern denselben Wert.
3. **Property** - nach dem ersten Aufruf gilt
   `object.uid === object.serial()` und `hasOwnProperty("uid")`.
4. **Vorhandene UID** - `serial()` gibt eine bereits definierte `uid`
   unverändert zurück.
5. **Klone** - Objekt-Spread und `element.cloneNode(true)` übernehmen eine
   framework-generierte, nicht enumerierbare UID nicht und erhalten bei Bedarf
   eine eigene.
6. **Keine Enumeration** - `Object.keys`, `for-in` und `JSON.stringify`
   enthalten die generierte `uid` nicht.
7. **Descriptor** - eine generierte UID ist nicht enumerierbar, nicht
   beschreibbar und nicht konfigurierbar.
8. **Typen** - die Vergabe funktioniert für Objektliterale, Arrays, `Map`,
   DOM-Elemente und Textknoten.
9. **API** - `Object.prototype.serial` ist eine Funktion,
   `Object.prototype.ordinal` und `Object.prototype.uid` sind `undefined`.
10. **Nicht erweiterbare Objekte** - ohne vorhandene UID wirft `serial()` bei
    eingefrorenen oder versiegelten Objekten; mit vorhandener UID wird diese
    zurückgegeben.
11. **Reaktive Objekte** - `serial()` und der direkte Zugriff auf `uid` lösen
    kein Rendering aus und registrieren keine Notification für `uid`.

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
            Assert.assertTrue(object1.serial() !== object2.serial());
            Assert.assertEquals(object1.uid, object1.serial());
        }});

        ...

        Test.start();
    </script>
  </head>
  <body>
  </body>
</html>
```

Registrierung in `test/index.html`: neuer Eintrag
`extension_object_serial.html` passend zur alphabetischen Ordnung des
Extension-Blocks.

## C - CHANGES

Der vorhandene Eintrag im Kopf der Datei wird vervollständigt:

```text
CR: Composer: Refactoring ordinal/serial/uid
    - Object.prototype.ordinal has been replaced by Object.prototype.serial
    - The object identity is stored in the own property uid
      An existing uid is returned unchanged
      A missing uid is assigned lazily on the first serial() call
    - Generated UIDs are non-enumerable and read-only
```

Der Eintrag beschreibt einen API-Bruch. Die Version im Kopf
(`2.1.0 2026xxxx`) ist vor dem Release zu prüfen.

Nicht behaupten:

- dass die UID unter einem Symbol gespeichert wird;
- dass `Object.prototype.serial` entfernt wird;
- dass `Composer.render.meta.serial` in `uid` umbenannt wird.

## D - Build und Artefakte

Nicht händisch bearbeiten, sondern neu erzeugen:

- `release/**`
- `test/composite-js-testing.js`, `test/composite-js-debug-testing.js`
- `benchmarks*/composite-js*.js`
- `tutorials/**/assets/composite-js*.js`

Erzeugung:

```text
ant -f development/build.xml compile
ant -f development/build.xml compile-max
```

Der vollständige Release-Lauf

```text
ant -f development/build.xml release
```

enthält ESLint und die Minimierung und muss fehlerfrei durchlaufen.

Nach dem Build kontrollieren:

- Der zweizeilige Source-Block wurde zu
  `compliant("Object.prototype.serial", function(){...})` zusammengefasst.
- `compliant("Object.prototype.uid")` bleibt als eigenständige
  Kompatibilitätsprüfung erhalten.
- Die generierte Implementierung speichert die UID in der Property `uid` und
  nicht unter `_sequence.symbol`.
- Alle erzeugten Artefakte verwenden `serial()` statt `ordinal()`.

## E - Abschluss

- [ ] Alle Tests unter `test/index.html` sind grün.
- [x] ~~In Quellen, Manuals und Tests gibt es keine Aufrufe von `ordinal()` oder
      `uid()`.~~
- [ ] Manual und CHANGES beschreiben `uid` als Property und `serial()` als
      Methode.
- [ ] Ticketdateien `refactoring_uid*.md` nach Abschluss entfernen oder unter
      `development/` archivieren.
