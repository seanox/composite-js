## **User-Story: Erweiterbare Reactive-Unterstützung für native und benutzerdefinierte Objekte**

**Titel:** Reactive: Erweiterung durch objektspezifische Adapter (`Reactive.customize`)

**Typ:** Feature / Enhancement\
**Komponente:** `sources/reactive.js`\
**Aufwand:** 8 Story Points (vorläufig)\
**Technische Vorgabe:** ECMAScript 2015 (ES6)\
**Priorität:** Mittel

### **User-Story**

Als Anwendungsentwickler möchte ich Reactive um objektspezifische Adapter erweitern können, damit auch interne Zustandsänderungen nativer und benutzerdefinierter Objekte erkannt und an abhängige Views propagiert werden, ohne den Reactive-Kern um typspezifische Implementierungen oder eine öffentliche Benachrichtigungs-API erweitern zu müssen.

### **Hintergrund**

Reactive verwendet derzeit freie, über eine `WeakMap` verwaltete Proxys und registriert beim Rendering Property-Abhängigkeiten. Änderungen werden über `_notify(notifications, key)` an betroffene View-Empfänger propagiert.

Die vorhandenen `get`-, `set`-, `deleteProperty`- und `defineProperty`-Traps unterstützen gewöhnliche Anwendungsobjekte und Arrays.

Native Objekte wie `Date`, `Map` und `Set` besitzen jedoch interne Zustände, deren Änderungen nicht durch gewöhnliche Proxy-Traps beobachtet werden können. Zudem erwarten native Methoden häufig das Originalobjekt als Receiver.

Die Erweiterung soll diese Einschränkung durch optionale Adapter adressieren. Die bestehende Reactive-Semantik für gewöhnliche Objekte und Arrays bleibt unverändert.

### **Funktionaler Umfang**

- Registrierung objektspezifischer Adapter über `Reactive.customize(Constructor, factory)`.
- Automatische Auswahl registrierter Adapter anhand des Objekttyps.
- Lazy-Erzeugung spezialisierter Proxys beim Zugriff auf entsprechende Modellwerte.
- Bereitstellung eines privaten `notify()`-Callbacks für den Adapter.
- Propagierung gemeldeter Änderungen an alle betroffenen View-Empfänger.
- Unterstützung mehrfach referenzierter Objekte unabhängig von ihrer Position im Modell.
- Wiederverwendung bereits erzeugter Adapter-Proxys über die bestehende `_register`-WeakMap.
- Keine öffentliche `Reactive.notify()`- oder `Reactive.trigger()`-Methode.
- Keine zusätzliche Event-Infrastruktur.
- Keine automatische Beobachtung von Änderungen, die direkt am Originalobjekt unter Umgehung des Adapters erfolgen.

### **Vorgesehene API**

```
Reactive.customize(Date, (target, notify) => {
    return new Proxy(target, {
        get(target, key) {
            const value = Reflect.get(target, key);

            if (typeof value !== "function")
                return value;

            return (...args) => {
                const result = value.apply(target, args);

                if (typeof key === "string"
                        && key.startsWith("set"))
                    notify();

                return result;
            };
        }
    });
});
```

Die Date-Implementierung dient als Beispiel für den Adapter-Vertrag. Die Erkennung mutierender Methoden erfolgt typspezifisch und ist nicht Bestandteil des Reactive-Kerns.

Anwendungsbeispiel:

```
const model = Reactive({
    date: new Date()
});

model.date.setFullYear(2030);
```

Eine View mit der Expression

```
<span>{{model.date.getFullYear()}}</span>
```

soll nach der Mutation automatisch aktualisiert werden.

### **Technischer Ansatz**

#### **1. Adapter-Registry**

Eine interne `Map` verwaltet die registrierten Adapter nach Konstruktor.

```
const _customizations = new Map();
```

`Reactive.customize()` registriert eine Factory für einen Konstruktor. Der Rückgabewert der Factory muss ein Proxy auf das übergebene Originalobjekt sein.

Die Auswahl erfolgt vor der regulären Proxy-Erzeugung. Die Behandlung von nicht unterstützten Objekttypen ohne registrierten Adapter bleibt mit dem bisherigen Verhalten kompatibel.

#### **2. Integration in&#x20;**`_reactive()`

Die bestehende `_register`-WeakMap bleibt die zentrale Zuordnung zwischen Originalobjekt und Proxy.

Für jedes Originalobjekt wird höchstens ein Reactive-Proxy beziehungsweise Adapter-Proxy erzeugt.

Die vorhandene `_secret`-Erkennung muss auch für Adapter-Proxys funktionieren. Dazu kann Reactive den vom Adapter gelieferten Proxy mit einem äußeren, intern kontrollierten Proxy versehen oder einen entsprechenden Zugriff im Adapter-Vertrag festlegen.

Eine zusätzliche Proxy-Ebene ist nur zulässig, wenn sie die nativen Methodenaufrufe und die Objektidentität nicht beeinträchtigt. Vorzugsweise wird die interne Erkennung unabhängig vom Adapter über eine zusätzliche WeakMap organisiert.

#### **3. Objektbezogene Benachrichtigung**

Die vorhandene Funktion

```
_notify(notifications, key)
```

bleibt unverändert.

Für angepasste Objekte wird ein interner Notification-Key verwendet:

```
const _change = Symbol("Reactive.change");
```

Beim Erzeugen eines Adapters erhält dessen Factory einen Callback:

```
const notify = () => _notify(notifications, _change);
```

Die Registrierung der View-Abhängigkeiten wird so erweitert, dass beim Lesen eines angepassten Objekts zusätzlich dessen objektbezogene Abhängigkeit erfasst wird.

Damit kann ein Adapter Änderungen melden, ohne die Eltern-Property oder den Modellpfad zu kennen.

#### **4. Mehrfachreferenzen**

Ein Objekt kann über mehrere Properties erreichbar sein:

```
const date = new Date();

const model = Reactive({
    start: date,
    end: date
});
```

Beide Zugriffe müssen denselben Adapter-Proxy liefern.

Eine Mutation über `model.start` muss auch Views aktualisieren, die `model.end` verwenden.

Die objektbezogene Registrierung darf deshalb nicht an eine einzelne Eltern-Property gebunden sein.

#### **5. Lebenszyklus und Speicherverwaltung**

Die bestehende `_shadow`-Verwaltung und die Freigabe über `Composer.EVENT_DOM_REMOVED` werden weiterverwendet.

Adapter dürfen keine dauerhaften starken Referenzen auf entfernte View-Empfänger erzeugen.

Die Benachrichtigung erfolgt über den bestehenden asynchronen Mechanismus `Composer.asynchronous()`.

#### **6. ES6-Kompatibilität**

Die Implementierung verwendet ausschließlich ECMAScript-2015-Sprachmittel:

- `Proxy` und `Reflect`
- `Map`, `WeakMap` und `Set`
- `Symbol`
- Arrow-Funktionen und Closures
- `const` und `let`

Nicht verwendet werden beispielsweise `WeakRef`, `FinalizationRegistry`, private Klassenfelder (`#field`) oder neuere JavaScript-Sprachsyntax.

### **Akzeptanzkriterien**

- `Reactive.customize(Constructor, factory)` registriert einen Adapter für einen Objekttyp.
- Registrierte Adapter werden beim Zugriff auf passende Modellwerte automatisch verwendet.
- Ohne registrierten Adapter bleibt das bisherige Reactive-Verhalten unverändert.
- Die Factory erhält das Originalobjekt und einen privaten `notify()`-Callback.
- Native Methoden werden mit einem kompatiblen Receiver ausgeführt.
- Eine durch den Adapter gemeldete Mutation aktualisiert alle betroffenen Views.
- Mehrfach referenzierte Objekte verwenden denselben Adapter-Proxy und benachrichtigen sämtliche abhängigen Views.
- Bereits reaktive Objekte werden nicht erneut gewrappt.
- Der bestehende `_notify()`-Mechanismus und die Empfängerbereinigung bleiben erhalten.
- Nicht mehr referenzierte Objekte und entfernte View-Empfänger können weiterhin freigegeben werden.
- Fehler aus nativen Methoden werden unverändert an den Aufrufer weitergegeben.
- Direkte Änderungen am Originalobjekt lösen weiterhin keine automatische Benachrichtigung aus.
- Die Implementierung ist ES6-konform und besteht den vorhandenen Lint.
- Regressionstests bestehen in Blink, Gecko und WebKit.

### **Testfälle**

| Test                                        | Erwartung                                  |
| ------------------------------------------- | ------------------------------------------ |
| `Date.setFullYear()` über Adapter           | View wird aktualisiert                     |
| `Date.getFullYear()`                        | Keine Änderungsbenachrichtigung            |
| Zwei Properties referenzieren dieselbe Date | Beide Views werden aktualisiert            |
| Wiederholter Zugriff auf dasselbe Objekt    | Identischer Adapter-Proxy                  |
| Direkte Mutation am Original                | Keine automatische Aktualisierung          |
| Mutation ohne registrierten Adapter         | Keine zusätzliche Adapter-Benachrichtigung |
| Adapter-Methode wirft Exception             | Originalfehler bleibt erhalten             |
| DOM-Empfänger wird entfernt                 | Subscription wird bereinigt                |
| Gewöhnliches Objekt oder Array              | Bisheriges Verhalten bleibt erhalten       |

### **Arbeitsweise**

Die Umsetzung erfolgt **Test-first**:

1. Zunächst gezielte Regressionstests für Registrierung, Adapterauswahl, Benachrichtigung, Mehrfachreferenzen und Speicherverwaltung erstellen.
2. Tests mit dem unveränderten Quellstand ausführen und das erwartete Fehlschlagen nachweisen.
3. Die Erweiterung innerhalb der bestehenden Reactive-Architektur implementieren.
4. Tests mit frisch erzeugten Bundles in Blink, Gecko und WebKit ausführen.
5. Isolierten Build und ES2015-Lint durchführen.
6. Reactive-Manual und Änderungsprotokoll ergänzen.

### **Technische Risiken und offene Designpunkte**

Die wichtigste technische Herausforderung liegt nicht in `customize()` selbst, sondern in der **objektbezogenen Registrierung von View-Abhängigkeiten**.

Die aktuelle Implementierung registriert Empfänger anhand gelesener Properties. Eine zusätzliche objektbezogene Abhängigkeit muss in dieses System integriert werden, ohne unnötige Renderings oder dauerhaft gehaltene Referenzen zu verursachen.

Außerdem muss die Adapter-Identität sauber definiert werden. Die vorgeschlagene Kombination aus Factory, Proxy und `_register` darf keine Mehrfach-Proxys oder inkompatible native Receiver erzeugen.

Ein weiterer Punkt ist die Registrierung nach bereits erfolgter Proxifizierung. Für die erste Version sollte festgelegt werden, dass Adapter vor der erstmaligen Verwendung des betreffenden Objekttyps registriert werden. Eine nachträgliche Umwandlung vorhandener Proxys ist nicht Bestandteil dieser Story.

### **Definition of Done**

Die Erweiterung ist abgeschlossen, wenn native und benutzerdefinierte Objekte über registrierte Adapter interne Änderungen an abhängige Views propagieren können, ohne dass der Reactive-Kern objektspezifisches Wissen benötigt.

Die bestehende Architektur aus freien Proxys, WeakMap-Registrierung, Property-Abhängigkeiten, Shadow-Verwaltung und asynchronem Rendering bleibt erhalten.

**Architekturziel:** `Reactive.customize()` ist die einzige neue öffentliche API. `notify()` bleibt eine ausschließlich an Adapter übergebene Fähigkeit und wird nicht als allgemeiner Workaround für Anwendungen veröffentlicht.