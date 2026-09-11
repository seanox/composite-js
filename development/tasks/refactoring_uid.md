# Refactoring: Objekt-Identität als `Object.prototype.uid`

Stand: 2026-09-10
Typ: Refactoring / API-Änderung (breaking)
Repository: https://github.com/seanox/composite-js
Aufwand gesamt: 13 Story Points

---

## Ausgangslage

Die Laufzeit-Identität von Objekten wird aktuell über zwei sich überschneidende
Namen abgebildet (composer.js:2709-2723):

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

`ordinal()` ist die öffentliche API, `serial` ist der Speicher -- als sichtbare
eigene Property direkt auf dem fremden Objekt. Daraus ergeben sich vier
Probleme:

1. **Kollision mit Fachdaten.** Ein Modell mit einem eigenen Feld `serial`
   (Seriennummer) liefert bei `ordinal()` diesen Wert zurück. Folge: falsche
   oder doppelte Schlüssel in `_render_meta`.
2. **Blockierte Zuweisung.** `Object.defineProperty` ohne `writable`/
   `configurable` erzeugt eine schreibgeschützte Property. Ein späteres
   `object.serial = …` schlägt im Sloppy Mode still fehl und wirft im Strict
   Mode.
3. **Reaktive Nebenwirkung.** Nach dem ersten `ordinal()` ist
   `hasOwnProperty("serial")` wahr. Der Get-Trap in reactive.js:174-215
   registriert dadurch eine Notification für einen rein internen Schlüssel.
4. **Serialisierungs-Leak.** Die Property ist enumerierbar und erscheint in
   `Object.keys`, `for-in` und `JSON.stringify`.

Hinzu kommt die begriffliche Unschärfe: „serial" bezeichnet im Projekt bereits
drei verschiedene Dinge -- die zeitbasierte UID (`Math.serial()`,
`window.serial`), die Objekt-Identität (Speicher von `ordinal()`) und die aus
dem Markup gelesene Composite-ID (composer.js:1777-1814).

## Entscheidung

Die Objekt-Identität heißt künftig **`uid`**, der Speicher liegt unter einem
**Symbol**.

**Warum `uid` und nicht `ordinal`/`serial`?** Beide bisherigen Namen versprechen
eine Ordnung, die es nicht gibt -- der Wert ist eine Identität, keine Position
und keine sortierbare Sequenz. Die Vergabereihenfolge ist Implementierungs-
detail. `uid` ist zudem bereits das Hausvokabular: manuals/extensions.md:108
(„alphanumeric (U)UID"), :120 („unique alphanumeric UID") und :303 („the UID for
the window instance") verwenden den Begriff für exakt dieses Konzept.

**Warum `uid` und nicht `oid`?** `oid` ist im Web-Umfeld doppelt belegt
(MongoDB `ObjectId`, ASN.1/SNMP/LDAP-Objektbezeichner) und stottert an
`Object.prototype` („Objekt-Objekt-ID").

**Warum Methode und nicht Getter?** Ein Getter auf `Object.prototype` ohne
Setter verbietet seitenweit die Zuweisung `object.uid = …` -- im Strict Mode und
bei `Object.assign` mit Exception, sonst still. Außerdem würde ein reiner
*Lesezugriff* auf ein eingefrorenes Objekt werfen, weil der Shadow nicht
angelegt werden kann. Eine Methode (`writable: true`) bleibt überschattbar und
verlangt einen bewussten Aufruf.

**Warum Symbol und nicht WeakMap?** Gemessen wurde ein Faktor 5,5 zugunsten des
Symbol-Shadows (8,2 ms vs. 44,9 ms bei 4 Mio. Zugriffen), weil nach dem ersten
Zugriff ein einfacher Own-Property-Read genügt und kein Registry-Lookup
stattfindet. Das Symbol schließt alle vier oben genannten Probleme; die WeakMap
würde zusätzlich eingefrorene und prototypenlose Objekte abdecken, was für die
tatsächlichen Aufrufstellen (DOM-Knoten, Marker, interne Lock-Objekte) nicht
gebraucht wird.

## Grundlage

Diese Implementierung ersetzt composer.js:2709-2723 vollständig:

```js
const _uid = Symbol("uid");
let _uid_sequence = 0;

compliant("Object.prototype.uid");
compliant(null, Object.prototype.uid = function() {
    let uid = this[_uid];
    if (uid === undefined)
        Object.defineProperty(this, _uid, {value: uid = ++_uid_sequence});
    return uid;
});
```

Verbindliche Details:

- Die Zuweisung erfolgt als schlichte Zuweisung (`Object.prototype.uid = …`),
  **nicht** über `Object.defineProperty` mit `writable: false`. Nur so bleibt
  die Methode überschattbar und `object.uid = 42` weiterhin möglich.
- Der Symbol-Konstantenname lautet `_uid` (Unterstrich-Präfix wie
  `_render_meta`, `_cache`, `_register`, und analog zu reactive.js:88
  `const _secret`). Der Name `uid` für die Konstante ist **nicht** zulässig: das
  lokale `let uid` in der Methode überschattet ihn und erzeugt einen
  `ReferenceError: Cannot access 'uid' before initialization`.
- Die zweizeilige `compliant`-Form ist zwingend beizubehalten. Der Build fasst
  sie über build.xml:122-123 zu `compliant("Object.prototype.uid", function(){…})`
  zusammen; das Regex verlangt exakt dieses Muster.
- `const _uid` wird im Debug-Build über build.xml:236-237 bzw. :259-260 zu
  `const _uid = window.__uid = Symbol("uid")` umgeschrieben. Das ist korrekt und
  gewollt. `let _uid_sequence` wird nicht umgeschrieben (das Regex greift nur
  bei `const`).

## Nicht-Ziele

Bewusst **nicht** Teil dieses Tickets:

- `Math.serial()` und `window.serial` behalten ihren Namen. Dort ist „serial"
  sachlich korrekt: eine chronologisch sortierbare, zeitbasierte Seriennummer.
- `Test.worker.task.meta.serial` (test.js:180-182, manuals/test.md:305) behält
  seinen Namen. Das ist eine echte laufende Testnummer, also tatsächlich eine
  Sequenz, und dokumentierte API der Test-Erweiterung.
- `benchmark.js` `renderSerial` (test/benchmark/benchmark.js:18,86,106,140) ist
  ein Render-Zähler und nicht betroffen.
- Es wird **kein** Alias `ordinal()` als Rückwärtskompatibilität eingeführt.
  Begründung: Ein Alias würde die Doppelbenennung konservieren, die dieses
  Ticket beseitigt. Der Bruch wird stattdessen in CHANGES dokumentiert.

## Betroffene Dateien

Quellen (händisch zu ändern):

| Datei                          | Treffer                                  | Inhalt                                         |
|--------------------------------|------------------------------------------|------------------------------------------------|
| `sources/composer.js`          | 28× `.ordinal()`, 97 Zeilen mit `serial` | Kern-API, alle Aufrufer, Meta-Feld, Markup-ID  |
| `sources/reactive.js`          | 4× `.ordinal()`                          | Recipient-Registrierung                        |
| `sources/expression.js`        | 10× `serial`                             | Cache-Schlüssel-Parameter (optional, siehe 06) |
| `sources/extension.js`         | 2 Zeilen                                 | Beispiel im `compliant`-Kommentar (:41-42)     |
| `manuals/extensions.md`        | :130-144                                 | Abschnitt `Object.prototype.ordinal`           |
| `manuals/README.md`            | :251                                     | Inhaltsverzeichnis-Anker                       |
| `test/reactive_condition.html` | :561, :572                               | Testausdrücke                                  |
| `test/reactive_recursion.html` | :45                                      | Testausdruck                                   |
| `test/index.html`              | -                                        | Registrierung des neuen Tests                  |
| `CHANGES`                      | Kopf                                     | Changelog-Eintrag                              |

Build-Artefakte (**nicht** händisch ändern, werden neu erzeugt):
`release/**`, `test/composite-js*.js`, `benchmarks*/composite-js*.js`,
`tutorials/**/assets/composite-js*.js`. Erzeugung über
`ant -f development/build.xml compile` bzw. `compile-max` (build.xml:368-381).

## Teilaufgaben

| Nr. | Datei | Inhalt | SP |
|---|---|---|---|
| 01 | `refactoring_uid_01.md` | Kern-API in composer.js umstellen | 2 |
| 02 | `refactoring_uid_02.md` | Aufrufer in composer.js und reactive.js umbenennen | 3 |
| 03 | `refactoring_uid_03.md` | Markup-ID in composer.js entflechten | 2 |
| 04 | `refactoring_uid_04.md` | Symbol-Schlüssel im Reactive-Get-Trap ausfiltern | 1 |
| 05 | `refactoring_uid_05.md` | Dokumentation (Code-Kommentare und Manual) | 2 |
| 06 | `refactoring_uid_06.md` | Optional: Cache-Schlüssel in expression.js umbenennen | 1 |
| 07 | `refactoring_uid_07.md` | Tests, CHANGES und Build | 2 |

Reihenfolge: 01 → 02 → 03 → 04 → 05 → 06 → 07. Die Schritte 01 und 02 müssen in
einem Commit zusammen erfolgen, da der Zwischenstand nicht lauffähig ist.

## Risiken

- **Öffentlicher API-Bruch.** `element.ordinal()` existiert nach dem Refactoring
  nicht mehr. Anwendungscode Dritter, der die dokumentierte Erweiterung nutzt,
  bricht. Erfordert einen Eintrag in CHANGES und mindestens eine Minor-Version.
- **Freigabe reservierter Namen.** Mit dem Entfall von
  `compliant("Object.prototype.serial")` und `compliant("Object.prototype.ordinal")`
  gibt composite-js beide Namen frei. Das ist beabsichtigt und im
  Micro-Frontend-Kontext ein Gewinn, weil `compliant` bei Namenskollision den
  Start der Plattform mit `JavaScript incompatibility detected` abbricht.
- **Namensverwechslung beim Suchen/Ersetzen.** `serial` kommt in composer.js in
  drei Bedeutungen vor. Ein globales Suchen/Ersetzen ist ausgeschlossen, jede
  Fundstelle ist einzeln zu bewerten (siehe 02 und 03).
- **Eingefrorene Objekte.** `Object.freeze`/`Object.seal` und
  `Object.create(null)` bleiben nicht unterstützt (`TypeError` bzw. Methode
  nicht vorhanden). Das entspricht dem heutigen Verhalten und ist kein Regress,
  sollte aber im Manual als Einschränkung erwähnt werden (siehe 05).

## Abnahmekriterien

- [ ] `Object.prototype.uid` existiert, `Object.prototype.ordinal` und
      `Object.prototype.serial` existieren nicht mehr.
- [ ] Der Bezeichner `ordinal` kommt in `sources/**` nicht mehr vor.
- [ ] `serial` kommt in `sources/composer.js` und `sources/reactive.js` nur noch
      in Verbindung mit `Math.serial`/`window.serial` vor.
- [ ] Nach `object.uid()` gilt: `Object.keys(object)`, `for-in` und
      `JSON.stringify(object)` enthalten keinen zusätzlichen Schlüssel.
- [ ] `object.hasOwnProperty("uid")` ist `false`.
- [ ] `object.uid = 42` ist im Strict Mode zulässig und wirft nicht.
- [ ] Zwei Aufrufe auf demselben Objekt liefern denselben Wert, zwei
      verschiedene Objekte liefern verschiedene Werte.
- [ ] Ein Klon (`{...object}`, `cloneNode(true)`) erhält eine eigene `uid`.
- [ ] Alle Tests unter `test/index.html` laufen grün.
- [ ] `ant -f development/build.xml release` läuft fehlerfrei durch,
      einschließlich ESLint (build.xml:152-158).
- [ ] Manual und Inhaltsverzeichnis sind aktualisiert und die Anker stimmen.
- [ ] CHANGES enthält einen Eintrag zum API-Bruch.
