# 04 - Symbol-Schlüssel im Reactive-Get-Trap ausfiltern

Übergeordnet: `refactoring_uid.md`
Datei: `sources/reactive.js`, Get-Trap (:120-217)
Aufwand: 1 Story Point
Abhängigkeiten: 01

---

## Ziel

Interne Symbol-Schlüssel sollen nie in der Notification-Verwaltung des
Reactive-Proxys landen.

## Hintergrund

Der Get-Trap registriert im `finally`-Block (:174-215) für jeden Schlüssel eine
Benachrichtigung, sofern `target.hasOwnProperty(key)` gilt (:179). Wird `uid()`
auf einem Proxy aufgerufen, legt `Object.defineProperty` den Symbol-Shadow auf
dem Zielobjekt an. Ab dem nächsten Zugriff wäre `hasOwnProperty(_uid)` wahr und
der interne Schlüssel bekäme einen Eintrag in `notifications` -- samt
Recipient-Verwaltung und Render-Auslösung für einen Wert, der sich nie ändert.

Das ist reine Verschwendung und keine Fehlfunktion, sollte aber
ausgeschlossen werden. Die Änderung ist unabhängig von `uid` sinnvoll, weil
reactive.js mit `_secret` (:88) bereits einen weiteren internen Schlüssel führt.

## Umsetzung

Im Get-Trap unmittelbar nach der `_secret`-Prüfung (:130-131) ergänzen:

```js
// Symbols are used exclusively for internal keys (e.g. object identity).
// They are passed through directly, so that no notifications are registered
// for keys that are not part of the data model.
if (typeof key === "symbol")
    return target[key];
```

## Vorgaben

- Die Prüfung muss **vor** dem `try`-Block bzw. vor dessen `finally` greifen,
  damit die verzögerte Registrierung gar nicht erst geplant wird. Wird sie
  innerhalb des `try` platziert, läuft das `finally` trotz `return` weiterhin.
- `Object.defineProperty` auf dem Proxy wird mangels `defineProperty`-Trap an
  das Zielobjekt weitergereicht. Proxy und Zielobjekt teilen sich dadurch
  dieselbe `uid`. Das ist gewollt: Die Identität folgt dem Objekt, nicht der
  Hülle.
- Der `set`-Trap benötigt keine Anpassung -- dort wird der Symbol-Schlüssel
  nicht verwendet, weil `uid()` ausschließlich über `defineProperty` schreibt.

## Prüfung

```js
const model = {value: 1}.reactive();
model.uid();
model.uid();
Composer.render.meta;             // kein Eintrag mit Symbol-Schlüssel
JSON.stringify(model);            // {"value":1}
```

- Ein `uid()`-Aufruf auf einem reaktiven Objekt löst kein Rendering aus.
- `model.uid() === model[Symbol]`-Zielobjekt liefert denselben Wert.
