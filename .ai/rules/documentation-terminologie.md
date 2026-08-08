# Terminologie-Leitfaden
Dieses Dokument definiert die Terminologie der Seanox aspect-js-Dokumentation.

Ziel ist eine technische Dokumentation, die:
- fachlich präzise ist,
- eine eindeutige Sprache verwendet,
- Konzepte klar voneinander trennt,
- für den Leser verständlich und gut lesbar bleibt.

Terminologie wird nicht mechanisch wiederholt.
Ein eingeführter Begriff darf innerhalb eines eindeutigen Kontextes vereinfacht
verwendet werden, wenn dadurch keine Bedeutung verloren geht.

# Regel 1 - Framework-Begriffe haben Vorrang
Wenn Konzepte der Seanox aspect-js-Runtime beschrieben werden, sind die
Framework-Begriffe zu verwenden.

| Begriff             | Bedeutung                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------|
| Application Module  | Von der Runtime verwaltetes JavaScript-Objekt eines Composite ohne festgelegte Architekturrolle |
| Composite           | Runtime-Komponente aus Markup, CSS, JavaScript und einem Application Module                     |
| Component           | Allgemeiner funktionaler Baustein einer Anwendung                                               |
| View                | HTML-Repräsentation der Benutzeroberfläche                                                      |
| Application Runtime | Infrastruktur zur Ausführung der Anwendung                                                      |

Framework-Begriffe dürfen nicht durch fachlich ähnliche, aber ungenauere
Begriffe ersetzt werden.

Beispiel:

Falsch:
"The runtime connects the ViewModel."

Richtig:
"The runtime connects the View with the Application Module."

# Regel 2 - Framework-Begriffe werden korrekt eingeführt
Framework-Begriffe werden bei ihrer erstmaligen Verwendung vollständig und in
der definierten Schreibweise verwendet.

Die definierte Grossschreibung bleibt erhalten, wenn der vollständige
Framework-Begriff verwendet wird.

Richtig:
"The Application Module contains the application logic."

Nicht:
"The application module contains the application logic."

Bei qualifizierten Framework-Begriffen mit mehreren Wörtern kann eine Kurzform
eingeführt werden. Die Kurzform wird unmittelbar nach der vollständigen
Bezeichnung in Klammern angegeben.

Beispiele:

"The Application Runtime (runtime) initializes the Composite."

"The Application Module (module) contains the application logic."

Die Kurzform wird in Kleinbuchstaben geschrieben und bezeichnet weiterhin
denselben Framework-Begriff.

# Regel 3 - Begriffe dürfen nach Einführung verkürzt werden
Nach der eindeutigen Einführung einer Kurzform darf diese innerhalb desselben
semantischen Kontextes verwendet werden.

Eine Kurzform ist zulässig, wenn:
- der Bezug eindeutig ist,
- kein anderes Konzept mit derselben Kurzform existiert,
- der Leser die Bedeutung ohne erneute Erklärung versteht,
- die Kurzform die Lesbarkeit verbessert.

Beispiel:

Richtig:
"The Application Module (module) manages the connection to the View.
The module controls the lifecycle of the component."

Nicht erforderlich:
"The Application Module (module) manages the connection to the View.
The Application Module controls the lifecycle of the component."

Die Kurzform wird nach ihrer Einführung kleingeschrieben.

Die vollständige Bezeichnung wird nicht erneut verwendet, solange keine
Definition, Abgrenzung, Gegenüberstellung oder andere eindeutige fachliche
Anforderung dies erforderlich macht.

# Regel 4 - Terminologie-Kontext über Absätze hinweg
Ein einmal eingeführter Fachbegriff bleibt innerhalb desselben Abschnitts aktiv.

Ein neuer Absatz stellt keinen neuen Kontext dar.

Nachfolgende Absätze dürfen die etablierte Kurzform verwenden, wenn:
- weiterhin dasselbe Konzept beschrieben wird,
- keine neue Definition erfolgt,
- keine Gegenüberstellung mit einem anderen Konzept erfolgt,
- keine Mehrdeutigkeit entsteht.

Beispiel:

Erste Einführung:
"The Application Runtime (runtime) initializes the Composite."

Nachfolgende Absätze:
"The runtime manages the lifecycle of the Composite."

Nicht erforderlich:
"The Application Runtime manages the lifecycle of the Composite."

Eine erneute Verwendung der vollständigen Terminologie ist nur erforderlich bei:
- Definition eines Begriffs:
  "An Application Module is a runtime-managed object..."
- Abgrenzung:
  "An Application Module differs from an ECMAScript module..."
- Vergleich:
  "Application Modules and Domain Models have different responsibilities."
- Wechsel des fachlichen Kontexts:
  Runtime -> Architektur -> Fachdomäne

# Regel 5 - Kontext bleibt erhalten
Ein Begriffskontext bleibt bestehen über:
- zusammenhängende Sätze,
- Absätze,
- einen Abschnitt.

Ein neuer Absatz bedeutet keinen automatischen Kontextwechsel.

Eine eingeführte Kurzform darf auch in nachfolgenden Absätzen verwendet werden,
solange der fachliche Kontext erhalten bleibt und keine Mehrdeutigkeit entsteht.

Ein vollständiger Begriff muss nicht erneut eingeführt werden, solange weiterhin
dasselbe Konzept beschrieben wird.

Beispiel:

Richtig:
"The Application Runtime (runtime) initializes the Composite.
The runtime then creates the Application Module."

Nicht erforderlich:
"The Application Runtime initializes the Composite.
The Application Runtime then creates the Application Module."

# Regel 6 - Keine unnötige Wiederholung von Fachbegriffen
Die vollständige Terminologie wird nicht wiederholt, wenn sie keinen
zusätzlichen Informationswert liefert.

Vermeide:
"The Application Module receives events. The Application Module processes
events. The Application Module updates the View."

Besser:
"The Application Module receives events. The module processes events and
updates the View."

Eine etablierte Kurzform darf dabei kleingeschrieben verwendet werden.

# Regel 7 - Vollständige Begriffe bei wichtigen Stellen
Die vollständige Bezeichnung bleibt erforderlich bei:
- erstmaliger Einführung,
- Definitionen,
- Überschriften,
- Tabellen,
- Vergleichen,
- Abgrenzungen verschiedener Konzepte.

Beispiel:

Richtig:
"An Application Module differs from an ECMAScript module."

Nicht:
"A module differs from a module."

Die vollständige Bezeichnung ist insbesondere dann erforderlich, wenn die
Kurzform eine andere Bedeutung haben könnte.

# Regel 8 - Component und Composite unterscheiden
Eine Component bezeichnet einen allgemeinen funktionalen Baustein.

Ein Composite ist eine spezielle Runtime-Component von Seanox aspect-js.

Daraus folgt:
- Jedes Composite ist eine Component.
- Nicht jede Component ist ein Composite.

Bei Runtime-Konzepten ist Composite zu verwenden.

# Regel 9 - Architekturrollen sind keine Runtime-Konzepte
Architekturrollen beschreiben ausschliesslich die Implementierung eines
Application Modules innerhalb einer Anwendung.

Beispiele:
- ViewModel
- Controller
- Service
- Application Model

Die Runtime kennt diese Rollen nicht.

Richtig:
"The runtime connects the View with its Application Module.
In MVVM, the Application Module implements the ViewModel role."

Falsch:
"The runtime connects the View with the ViewModel."

# Regel 10 - Domain Models gehören zur Fachdomäne
Ein Domain Model beschreibt fachliche Objekte und Regeln.

Beispiele:
- Customer
- Order
- Invoice
- Product

Ein Domain Model ist nicht verantwortlich für:
- Rendering
- Binding
- Lifecycle
- UI-Zustand
- Events

# Regel 11 - Model nur mit eindeutiger Bedeutung verwenden
Der Begriff Model ist allein zu vermeiden.

Verwende:
- Application Model
- Domain Model
- ViewModel

Ausnahme:
Nach Einführung eines dieser Begriffe darf eine Kurzform nur verwendet werden,
wenn der Kontext eindeutig bleibt.

Beispiel:
"The Domain Model represents customers.
The model contains customer validation rules."

Nur erlaubt, wenn kein anderes Model-Konzept im Kontext existiert.

# Regel 12 - Module eindeutig verwenden
Module kann verschiedene Bedeutungen haben.

| Begriff            | Kontext                    |
|--------------------|----------------------------|
| Application Module | Seanox aspect-js Runtime   |
| ECMAScript module  | JavaScript                 |
| Software module    | Allgemeine Softwaretechnik |

Bei erstmaliger Erwähnung eines Seanox-Runtime-Konzepts ist "Application Module"
zu verwenden.

Nach Einführung darf "module" verwendet werden, wenn ausschliesslich das
Application Module gemeint ist.

Wenn mehrere Module-Konzepte im selben Kontext vorkommen, ist die vollständige
Bezeichnung zu verwenden, um Mehrdeutigkeit zu vermeiden.

# Regel 13 - Begriffe folgen ihrer Ebene
| Ebene          | Begriffe                                                 |
|----------------|----------------------------------------------------------|
| JavaScript     | Object, ECMAScript module                                |
| Seanox Runtime | Application Runtime, Composite, Application Module, View |
| Komponenten    | Component                                                |
| Architektur    | ViewModel, Controller, Service                           |
| Fachdomäne     | Domain Model                                             |

Begriffe verschiedener Ebenen dürfen nicht synonym verwendet werden.

# Regel 14 - Kontext bestimmt die Terminologie
Die Terminologie richtet sich nach dem beschriebenen Konzept.

| Kontext     | Begriffe                                                 |
|-------------|----------------------------------------------------------|
| Runtime     | Application Runtime, Composite, Application Module, View |
| Architektur | ViewModel, Controller, Service                           |
| Fachdomäne  | Domain Model                                             |
| JavaScript  | Object, ECMAScript module                                |

Ein Wechsel des Absatzes alleine ist kein Kontextwechsel.

# Regel 15 - Lesbarkeit hat Vorrang
Die Dokumentation soll für Menschen verständlich bleiben.

Vermeide:
- unnötige Wiederholung langer Begriffe,
- künstlich aufgeblähte Sätze,
- Terminologieketten ohne Informationsgewinn.

Bevorzuge:
- klare Erstdefinition,
- konsistente Kurzformen,
- natürliche Sprache.

# Regel 16 - Keine Rückumwandlung
Eine einmal sinnvoll eingeführte Kurzform darf nicht wieder automatisch in die
vollständige Terminologie zurückgeführt werden.

Dies gilt auch für die Gross- und Kleinschreibung der Kurzform.

Beispiel:

Erlaubt:
"The Application Runtime (runtime) initializes the Composite.
The runtime then creates the Application Module.
The module handles lifecycle events."

Nicht:
"The Application Runtime (runtime) initializes the Composite.
The runtime then creates the Application Module.
The Application Module handles lifecycle events."

wenn keine neue Abgrenzung erforderlich ist.

# Regel 17 - Finaler Terminologie-Review
Nach allen Änderungen prüfen:
- Ist jeder Fachbegriff eindeutig?
- Sind erstmalige Begriffe vollständig?
- Sind Framework-Begriffe in ihrer definierten Schreibweise korrekt
  grossgeschrieben?
- Werden sinnvolle Kurzformen kleingeschrieben verwendet?
- Sind Wiederholungen sinnvoll reduziert?
- Wurde kein Konzept durch ein anderes ersetzt?
- Bleibt der Text natürlich lesbar?

Das Ziel ist nicht maximale Terminologiedichte, sondern maximale
Verständlichkeit bei fachlicher Genauigkeit.
