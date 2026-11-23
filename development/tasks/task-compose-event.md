# User Story: Expliziter Composer-Start mit Lifecycle-Events

## User Story

Als Anwendungsentwicklerin möchte ich den Start meiner Anwendung über
Composer-Lifecycle-Events steuern und gemeinsame Ressourcen ausdrücklich
einbinden, damit die Runtime nicht ungefragt anwendungsspezifischen Code oder
Styles lädt und der initiale Rendering-Zeitpunkt eindeutig ist.

## Ausgangslage

Am Ende des Framework-Bundles wird `Composer.initialize()` aufgerufen. Diese
Initialisierung lädt derzeit automatisch `modules/common.js` und
`modules/common.css`. Die Dateien sind optional und werden synchron geladen,
aber die Anwendung kann nicht erkennen oder beeinflussen, wann der
Anwendungsstart relativ zur ersten Darstellung erfolgt.

Der Composer startet das automatische Rendering beim `window.load`-Event mit
`Composer.render(document.body)`. Das vorhandene `Composer.EVENT_MODULE_READY`
betrifft dagegen ein einzelnes angedocktes Anwendungsmodul und ist kein
Anwendungs- oder Runtime-Startsignal.

## Gewünschtes Verhalten

### Composer-Lifecycle-Events

Die Composer-API stellt die folgenden Konstanten bereit:

| Konstante | Eventname | Zeitpunkt und Bedeutung |
| --- | --- | --- |
| `Composer.EVENT_DOM_LOADED` | `composerDomLoaded` | Wird einmal ausgelöst, wenn das native `DOMContentLoaded`-Event eintritt. Das Dokument wurde geparst; externe Ressourcen müssen noch nicht geladen sein. |
| `Composer.EVENT_READY` | `composerReady` | Wird einmal beim bisherigen automatischen Start auf `window.load` ausgelöst, unmittelbar bevor der Composer das initiale `Composer.render(document.body)` beginnt. Es bedeutet „Runtime bereit für den initialen Start“, nicht „initiales Rendering abgeschlossen“. |

Beide Events werden über `Composer.listen(...)` registriert und synchron über
den vorhandenen Composer-Eventmechanismus ausgelöst. Die Eventkonstanten sind
nach Verfügbarkeit von `Composer` lesbar. Bei regulärer Skripteinbindung kann
Anwendungscode nach dem Framework-Bundle und vor dem jeweiligen Lifecycle-
Zeitpunkt Listener registrieren.

Die Events melden Lifecycle-Zeitpunkte; sie bilden keine asynchrone
Startbarriere. Der Composer wartet weder auf zurückgegebene Promises noch auf
asynchrone Listener-Arbeit. Bestehende Regeln zur Fehlerbehandlung von
Composer-Event-Listenern bleiben bestehen.

### Common-Ressourcen nur auf ausdrücklichen Wunsch

`Composer.initialize()` lädt `common.js` und `common.css` nicht mehr
automatisch. Die Ressourcen bleiben reguläre, optionale Composite-Ressourcen.
Eine Anwendung kann sie bei Bedarf synchron und einmalig am definierten
Startzeitpunkt einbinden:

```javascript
Composer.listen(Composer.EVENT_READY, () => {
    Composer.include("common");
});
```

`Composer.include("common")` behält dabei sein bisheriges Verhalten für
`common.js` und `common.css`. Anwendungen ohne solche Ressourcen benötigen
weder Dateien mit reserviertem Namen noch einen zusätzlichen Ladeversuch.

## Abnahmekriterien

- [ ] `Composer.EVENT_DOM_LOADED` und `Composer.EVENT_READY` sind als öffentliche
  Composer-Konstanten verfügbar und entsprechen den dokumentierten Eventnamen.
- [ ] `Composer.EVENT_DOM_LOADED` wird genau einmal als Reaktion auf
  `DOMContentLoaded` ausgelöst.
- [ ] `Composer.EVENT_READY` wird genau einmal beim automatischen Start und
  unmittelbar vor dem ersten automatischen Rendern des `document.body`
  ausgelöst.
- [ ] Die beobachtbare Reihenfolge ist `composerDomLoaded`, danach
  `composerReady`, danach `Composer.EVENT_RENDER_START` für das initiale
  Rendering.
- [ ] Listener, die in regulär nach dem Framework geladenem Anwendungscode
  vor dem jeweiligen Browserereignis mit `Composer.listen(...)` registriert
  wurden, empfangen das zugehörige Event.
- [ ] Die Events werden unabhängig davon bereitgestellt, ob die Test-API
  aktiviert ist.
- [ ] Der automatische Common-Ladevorgang entfällt: Das Framework fordert
  `modules/common.js` und `modules/common.css` beim initialen Start nicht mehr
  an.
- [ ] Ein explizites `Composer.include("common")` lädt die vorhandenen
  Common-Ressourcen weiterhin wie bisher und nicht mehrfach.
- [ ] Fehlende Common-Ressourcen verhindern den Framework-Start nicht und
  erzeugen ohne explizite Einbindung keine Requests.
- [ ] Bestehende Tests, die derzeit implizit auf `common.js` angewiesen sind,
  binden ihre Testhilfen ausdrücklich ein. Das Test-Setup darf den entfernten
  Produktiv-Automatismus nicht stillschweigend nachbilden.
- [ ] Die manuelle Einbindung und der Eventvertrag sind in der Dokumentation
  erklärt; generierte Bundles werden aus den Quellen mit dem vorhandenen Build
  erzeugt.

## Erforderliche Dokumentation

- Aktualisiere die Composer-API-Dokumentation und die Eventübersicht um
  `EVENT_DOM_LOADED` und `EVENT_READY`, einschließlich genauer Zeitpunkte,
  Reihenfolge und der Abgrenzung zwischen Runtime-Bereitschaft und beendetem
  Rendering.
- Aktualisiere „Common Resources“ in `../../manuals/composite.md`: Common-Ressourcen
  werden nicht mehr automatisch geladen. Behalte dort ein konkretes
  Anwendungsbeispiel, das `Composer.listen(Composer.EVENT_READY, ...)` und
  `Composer.include("common")` verwendet.
- Aktualisiere den Einstieg und die Laufzeitbeschreibung in den passenden
  Manuals, insbesondere `../../manuals/getting-started.md`, damit der empfohlene
  Anwendungsstart und das optionale Laden gemeinsamer Ressourcen klar sind.
- Passe Inhaltsübersichten und Querverweise an, falls neue oder geänderte
  Überschriften hinzukommen. Erhalte bestehende Kapitelüberschriften, auf die
  `../../manuals/README.md` verlinkt.
- Ergänze `CHANGES` um den API- und Verhaltenswechsel einschließlich des
  Wegfalls des automatischen Common-Ladens.
- Prüfe Tutorials und Beispiele auf eine Abhängigkeit vom impliziten
  Common-Ladevorgang. Aktualisiere betroffene Beispiele explizit; das
  Common-Muster soll mindestens als dokumentiertes Opt-in-Beispiel erhalten
  bleiben.

## Erforderliche Tests

- Ergänze Composer-Eventtests, die Registrierung, Konstanten, Einmaligkeit,
  Payload-Vertrag soweit vorhanden und die Reihenfolge gegenüber dem initialen
  Rendering absichern.
- Prüfe die Eventverfügbarkeit ohne aktivierte Test-API und verhindere, dass
  `EVENT_READY` mit `EVENT_MODULE_READY` verwechselt oder mehrfach bei späteren
  Renderzyklen ausgelöst wird.
- Ergänze einen Regressionstest, der ohne Common-Dateien einen normalen
  Framework-Start und das initiale Rendering nachweist, ohne Requests für
  `common.js` oder `common.css`.
- Ergänze einen Opt-in-Test, der über einen `EVENT_READY`-Listener
  `Composer.include("common")` aufruft und nachweist, dass JavaScript und CSS
  verfügbar sind, bevor das initiale Rendering fortgesetzt wird.
- Migriere bestehende Tests, die `navigator.engine`, `Test.read`,
  `String.prototype.simplify`, `attempt` oder andere Funktionen aus
  `../../test/modules/common.js` voraussetzen, auf explizites Test-Setup.
- Führe die passenden Szenarien mindestens in Blink, Gecko und WebKit aus.

## Technischer Umfang

- Primäre Runtime-Quelle: `../../sources/composer.js`.
- Tests: bestehende Composer-Tests und erforderliche Test-Hilfen unter `test`,
  einschließlich der Testfallliste in `../../test/index.html`.
- Dokumentation: insbesondere `../../manuals/events.md`, `manuals/composite.md` und
  `manuals/getting-started.md`.
- Build und Generated Artifacts: `../build.xml` und die daraus
  erzeugten Release-/Test-Bundles; keine manuelle Pflege generierter Bundles.

## Nicht-Ziele

- `Composer.EVENT_READY` wartet nicht automatisch auf asynchrone
  Initialisierung oder Promises.
- Das Event ersetzt nicht `Composer.EVENT_MODULE_READY`, das weiterhin den
  Zustand eines einzelnen Composite-Anwendungsmoduls beschreibt.
- Diese Aufgabe ändert nicht den bestehenden Vertrag für Framework-Bundles,
  die erst nach `DOMContentLoaded` oder `window.load` dynamisch geladen werden.
- Es wird kein neuer allgemeiner Ressourcenmanager eingeführt; bestehende
  `Composer.include(...)`- und `global.include(...)`-Mechanismen werden genutzt.


---

Diskussion / Klärungspunkte:
Composer.EVENT_ACTIVE (direkt nach dem Laden von composer.js)
Composer.EVENT_READY alles ist bereit, vor window.load

