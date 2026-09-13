# 04 - uid im Reactive-Get-Trap ausfiltern

Übergeordnet: `refactoring_uid.md`
Datei: `sources/reactive.js`, Get-Trap
Aufwand: 1 Story Point
Abhängigkeiten: 01

---

## Ziel

Die interne Identitäts-Property `uid` soll nie in der
Notification-Verwaltung des Reactive-Proxys landen.

## Hintergrund

Der Get-Trap registriert im `finally`-Block für jeden Schlüssel eine
Benachrichtigung, sofern `target.hasOwnProperty(key)` gilt. `serial()` liest
`this.uid` und legt die Property beim ersten Aufruf per
`Object.defineProperty` an.

Ohne Sonderbehandlung kann der verzögert ausgeführte Registrierungsblock nach
der Vergabe bereits `hasOwnProperty("uid") === true` sehen. Spätestens beim
nächsten Zugriff würde `uid` als reaktive Fachdaten-Property behandelt. Das
erzeugt unnötige Recipient-Einträge und Render-Auslösungen für eine
framework-generierte Identität, die sich nicht ändert.

## Umsetzung

Im Get-Trap unmittelbar nach der `_secret`-Prüfung und vor dem `try`-Block
ergänzen:

```js
// The uid is immutable object identity and not part of the reactive data.
if (key === "uid")
    return target[key];
```

## Vorgaben

- Die Prüfung muss vor dem `try`-Block bzw. vor dessen `finally` greifen. Ein
  `return` innerhalb des `try` würde den `finally`-Block trotzdem ausführen.
- Der Wert wird direkt vom Zielobjekt gelesen. Dadurch wird weder eine
  Notification geplant noch ein weiterer Proxy erzeugt.
- `Object.defineProperty` auf dem Proxy wird mangels `defineProperty`-Trap an
  das Zielobjekt weitergereicht. Proxy und Zielobjekt teilen daher dieselbe
  Own-Property `uid`.
- Ein allgemeiner Symbol-Filter ist nicht Teil dieses Tickets. Die Identität
  wird nicht unter einem Symbol gespeichert.
- Der Set-Trap benötigt keine Sonderbehandlung. Eine vom Framework erzeugte
  `uid` ist nicht beschreibbar.

## Prüfung

```js
const model = {value: 1}.reactive();
const serial = model.serial();

model.uid === serial;             // true
model.serial() === serial;        // true
JSON.stringify(model);            // {"value":1}
```

- Ein `serial()`-Aufruf auf einem reaktiven Objekt löst kein Rendering aus.
- Direkte Zugriffe auf `model.uid` registrieren keine Notification.
- Proxy und Zielobjekt liefern dieselbe UID.
