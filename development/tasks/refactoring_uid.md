# Refactoring: Objekt-Identität als `uid`-Property und `serial()`-Methode

Stand: 2026-09-13
Typ: Refactoring / API-Änderung (breaking)
Repository: https://github.com/seanox/composite-js
Aufwand gesamt: 11 Story Points

---

## Ausgangslage

Die Laufzeit-Identität von Objekten wurde ursprünglich über zwei sich
überschneidende Namen abgebildet:

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

`ordinal()` war die öffentliche Abfragemethode, `serial` die auf dem Objekt
gespeicherte Property. Daraus ergeben sich vor allem begriffliche und
technische Probleme:

1. **Kollision mit Fachdaten.** Ein Modell mit einem eigenen Feld `serial`
   (Seriennummer) wird durch die interne Identität blockiert oder von
   `ordinal()` ungeprüft als Identität verwendet.
2. **Unklare Semantik.** `ordinal` bezeichnet eine Position oder Ordnung,
   tatsächlich wird aber eine eindeutige Objektidentität abgefragt.
3. **Uneinheitliche API.** Methode und gespeicherter Wert verwenden zwei
   Begriffe, deren Rollen nicht erkennbar sind.
4. **Reaktive Nebenwirkung.** Der Zugriff auf die intern verwendete Property
   kann im Reactive-Proxy eine unnötige Notification registrieren.

Hinzu kommt, dass `serial` im Projekt mehrere Bedeutungen hat: die zeitbasierte
Seriennummer (`Math.serial()`, `window.serial`), die Abfragemethode für die
Objektidentität und eine aus dem Markup gelesene Composite-ID.

## ~~Entscheidung~~

Die Objekt-Identität wird als eigene, nicht enumerierbare Property **`uid`**
gespeichert. Die öffentliche Methode **`serial()`** gibt diese Property zurück
und legt sie beim ersten Aufruf an, falls sie noch nicht existiert.

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

Die Umstellung ist im Code bereits teilweise erfolgt. Die Teilaufgaben
beschreiben das verbindliche Zielbild und die noch erforderlichen Prüfungen.

**Warum `uid` als Property?** Die Property benennt den gespeicherten Wert: die
eindeutige Identität des Objekts. Sie kann direkt gelesen werden, sobald sie
existiert. Durch `Object.defineProperty` ohne weitere Descriptor-Optionen ist
eine vom Framework erzeugte UID nicht enumerierbar, nicht beschreibbar und nicht
konfigurierbar.

**Warum `serial()` als Methode?** Die Methode bildet die aktive Abfrage bzw.
bei Bedarf die fortlaufende Vergabe einer Seriennummer ab. Sie kapselt die
Lazy-Initialisierung und gibt immer `this.uid` zurück.

**Warum liegt die UID nicht unter einem Symbol?** Die UID soll ausdrücklich als
Property `uid` auf dem Objekt verfügbar sein. Das in `_sequence` enthaltene
Symbol ist kein Ablageort der UID und ändert nichts an dieser Entscheidung.

**Warum kein Getter?** Die bestehende API ist eine bewusste Methodenabfrage.
Ein Getter auf `Object.prototype` würde außerdem jede fachliche Zuweisung an
`uid` beeinflussen und die Lazy-Initialisierung bereits bei einem bloßen
Property-Zugriff auslösen.

## ~~Verbindliche Details~~

- ~~`Object.prototype.serial` ist die öffentliche Methode.~~
- ~~`uid` ist eine Own-Property des jeweiligen Objekts, keine Methode auf
  `Object.prototype`.~~
- ~~Hat ein Objekt bereits eine definierte `uid`, gibt `serial()` diesen Wert
  unverändert zurück. Die Verantwortung für dessen Eindeutigkeit liegt dann
  beim Aufrufer.~~
- ~~Fehlt `uid`, legt `serial()` eine numerische UID per `Object.defineProperty`
  an. Die Standardwerte `enumerable: false`, `writable: false` und
  `configurable: false` sind beabsichtigt.~~
- ~~`compliant("Object.prototype.uid")` bleibt als Kompatibilitätsprüfung
  erhalten. Es definiert keine Property auf dem Prototyp.~~
- ~~`window.serial` muss vor `Object.prototype.serial` definiert werden, damit
  die eigene Window-Property bei der Property-Auflösung Vorrang hat.~~
- ~~Es gibt keine Methode `uid()`. Die UID wird nicht unter
  `_sequence.symbol`, sondern in der Property `uid` gespeichert.~~

## ~~Nicht-Ziele~~

Bewusst **nicht** Teil dieses Tickets:

- ~~`Math.serial()` und `window.serial` behalten ihren Namen. Dort ist `serial`
  sachlich korrekt: eine chronologisch sortierbare, zeitbasierte Seriennummer.~~
- ~~`Test.worker.task.meta.serial` (test.js, manuals/test.md) bleibt unverändert.
  Das ist eine laufende Testnummer.~~
- ~~`benchmark.js` `renderSerial` ist ein Render-Zähler und nicht betroffen.~~
- ~~Das öffentliche Feld `serial` in den Meta-Objekten von
  `Composer.render.meta` bleibt unverändert.~~
- ~~Es wird kein Alias `ordinal()` als Rückwärtskompatibilität eingeführt.~~

## Betroffene Dateien

Quellen und Dokumentation:

| Datei | Inhalt |
|---|---|
| `sources/extension.js` | Kern-API `serial()` und Property `uid` |
| `sources/composer.js` | Aufrufer, Kommentare und Markup-ID |
| `sources/reactive.js` | Aufrufer, direkte UID-Abfrage und Notification-Filter |
| `sources/expression.js` | Cache-Schlüssel-Parameter (optional, siehe 06) |
| `manuals/extensions.md` | Dokumentation von `Object.prototype.serial` |
| `manuals/README.md` | Inhaltsverzeichnis-Anker prüfen |
| `test/**` | bestehende und neue Tests |
| `CHANGES` | Changelog-Eintrag |

Build-Artefakte werden nicht händisch geändert:
`release/**`, `test/composite-js*.js`, `benchmarks*/composite-js*.js`,
`tutorials/**/assets/composite-js*.js`.

## Teilaufgaben

| Nr. | Datei | Inhalt | SP |
|---|---|---|---|
| ~~01~~ | ~~`refactoring_uid_01.md`~~ | ~~Kern-API in extension.js fertigstellen~~ | ~~1~~ |
| ~~02~~ | ~~`refactoring_uid_02.md`~~ | ~~Aufrufer auf `serial()` vereinheitlichen~~ | ~~1~~ |
| 03 | `refactoring_uid_03.md` | Markup-ID in composer.js entflechten | 2 |
| 04 | `refactoring_uid_04.md` | `uid` im Reactive-Get-Trap ausfiltern | 1 |
| 05 | `refactoring_uid_05.md` | Dokumentation (Code-Kommentare und Manual) | 2 |
| 06 | `refactoring_uid_06.md` | Optional: Cache-Schlüssel in expression.js umbenennen | 1 |
| 07 | `refactoring_uid_07.md` | Tests, CHANGES und Build | 3 |

Reihenfolge: 01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07. Die Schritte 01 und 02
sollen gemeinsam committet werden, damit API und Aufrufer konsistent bleiben.

## Risiken

- **Öffentlicher API-Bruch.** `ordinal()` entfällt und wird durch `serial()`
  ersetzt. Anwendungscode Dritter muss angepasst werden.
- **Reservierter Datenname.** `uid` ist künftig für die Objektidentität
  vorgesehen. Eine bereits vorhandene `uid` wird von `serial()` übernommen und
  muss daher selbst eindeutig und stabil sein.
- **Unveränderliche generierte UID.** Nach der Vergabe ist `uid` nicht
  beschreibbar. Eine Zuweisung schlägt im Sloppy Mode still fehl und wirft im
  Strict Mode.
- **Nicht erweiterbare Objekte.** Ohne bereits vorhandene `uid` wirft
  `serial()` bei `Object.freeze`/`Object.seal`. Objekte ohne Prototyp besitzen
  die Methode nicht. Das entspricht dem bisherigen Verhalten.
- **Begriffsverwechslung.** `serial` bleibt absichtlich an mehreren fachlich
  korrekten Stellen erhalten. Ein globales Suchen/Ersetzen ist ausgeschlossen.

## Abnahmekriterien

- [x] ~~`Object.prototype.serial` existiert als Methode,
      `Object.prototype.ordinal` existiert nicht mehr.~~
- [x] ~~`Object.prototype.uid` wird nicht als Methode oder Getter definiert.~~
- [x] ~~Nach `object.serial()` gilt:
      `object.uid === object.serial()` und `object.hasOwnProperty("uid")`.~~
- [x] ~~Eine bereits vorhandene `uid` wird von `serial()` unverändert
      zurückgegeben.~~
- [x] ~~Eine generierte `uid` erscheint nicht in `Object.keys`, `for-in` oder
      `JSON.stringify`.~~
- [x] ~~Zwei Aufrufe auf demselben Objekt liefern denselben Wert, zwei
      verschiedene Objekte ohne vorgegebene UID verschiedene Werte.~~
- [x] ~~Ein Klon ohne kopierte UID erhält beim ersten `serial()` eine eigene UID.~~
- [x] ~~In `sources/**` gibt es keine Aufrufe von `ordinal()` oder `uid()`.~~
- [ ] Der Reactive-Proxy registriert für `uid` keine Notification.
- [ ] Alle Tests unter `test/index.html` laufen grün.
- [ ] `ant -f development/build.xml release` läuft fehlerfrei durch.
- [ ] Manual, Inhaltsverzeichnis und CHANGES bilden `uid`/`serial()` korrekt ab.
