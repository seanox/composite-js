# Terminologie-Leitfaden

Dieses Dokument definiert die Terminologie der Seanox aspect-js-Dokumentation.
Jeder Begriff besitzt genau eine Bedeutung und darf nur in seinem vorgesehenen
Kontext verwendet werden.

Ziel ist eine konsistente, eindeutige und architekturneutrale Dokumentation.

## Regel 1 - Framework-Begriffe haben Vorrang

Wenn Konzepte der Seanox aspect-js-Runtime beschrieben werden, sind
ausschliesslich die Framework-Begriffe zu verwenden.

| Begriff                | Bedeutung                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| __Application Module__ | Von der Runtime verwaltetes JavaScript-Objekt eines Composite ohne festgelegte Architekturrolle |
| __Composite__          | Runtime-Component aus Markup, CSS, JavaScript und einem Application Module; verbindet View und Application Module |
| __Component__          | Allgemeiner funktionaler Baustein einer Anwendung                         |
| __View__               | HTML-Repräsentation der Benutzeroberfläche                                |
| __Application Runtime__| Infrastruktur zur Ausführung der Anwendung                                |

Framework-Begriffe dürfen nicht durch allgemeinere oder architekturspezifische
Begriffe ersetzt werden.

## Regel 2 - Framework-Begriffe sind Eigennamen

Die von Seanox aspect-js eingeführten Begriffe werden als Eigennamen behandelt
und stets in derselben Schreibweise verwendet.

__Richtig__

- Application Module
- Composite
- Component
- View
- Application Runtime
- Composite ID

__Falsch__

- application module
- composite object
- runtime module
- composite Id

## Regel 3 - Begriffe folgen ihrer Abstraktion

Es ist stets der spezifischste zutreffende Begriff zu verwenden.

```text
Component
    │
    ▼
Composite
    │
    ▼
Application Module
```

Beispiele:
- __Component__ beschreibt allgemeine Komponenten.
- __Composite__ beschreibt Runtime-Komponenten.
- __Application Module__ beschreibt das JavaScript-Laufzeitobjekt eines
  Composite.

Je konkreter das beschriebene Konzept ist, desto spezifischer ist auch die
Terminologie.

## Regel 4 - _Component_ und _Composite_ unterscheiden

Eine __Component__ bezeichnet einen allgemeinen funktionalen Baustein einer
Anwendung.

Ein __Composite__ ist eine spezielle Component der Seanox aspect-js-Runtime. Es
besteht aus Markup, CSS, JavaScript sowie einem Application Module und bildet
die Laufzeiteinheit der Anwendung.

Daraus folgt:
- Jedes Composite ist eine Component.
- Nicht jede Component ist ein Composite.

Wird ein Runtime-Konzept beschrieben, ist grundsätzlich der Begriff
__Composite__ zu verwenden.

## Regel 5 - Architekturrollen sind keine Runtime-Konzepte

Architekturrollen beschreiben ausschliesslich die Implementierung eines
__Application Modules__ innerhalb einer Anwendung.

Beispiele:
- ViewModel
- Controller
- Service
- Application Model

Die Runtime kennt diese Rollen nicht und trifft darüber keine Annahmen.

__Richtig__
> The runtime connects the View with its Application Module.
> In MVVM, the Application Module implements the ViewModel role.

__Falsch__
> The runtime connects the View with the ViewModel.

## Regel 6 - Domain Models gehören ausschliesslich zur Fachdomäne

Ein __Domain Model__ beschreibt fachliche Objekte, Regeln und Prozesse.

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

## Regel 7 - _Model_ niemals ohne Präzisierung verwenden

Der Begriff __Model__ ist mehrdeutig und darf nicht allein verwendet werden.

Stattdessen ist immer einer der konkreten Begriffe zu verwenden:
- Application Model
- Domain Model
- ViewModel

## Regel 8 - _Object_ ist ein JavaScript-Begriff

Der Begriff __Object__ bezeichnet ausschliesslich JavaScript-Konzepte.

Beispiele:
- JavaScript object
- object tree
- object hierarchy
- object property

Er darf nicht synonym verwendet werden für:
- Component
- Composite
- Application Module

## Regel 9 - _Module_ immer eindeutig verwenden

Der Begriff __Module__ besitzt mehrere Bedeutungen und muss bei Bedarf
qualifiziert werden.

| Begriff                | Kontext                    |
| ---------------------- | -------------------------- |
| __Application Module__ | Seanox aspect-js Runtime   |
| __ECMAScript module__  | JavaScript                 |
| __Software module__    | Allgemeine Softwaretechnik |
| __Module directory__   | Dateisystem                |

Bezieht sich die Dokumentation auf die Runtime, ist grundsätzlich __Application
Module__ zu verwenden.

## Regel 10 - Runtime-Dokumentation verwendet Runtime-Begriffe

Kapitel über die Runtime verwenden ausschliesslich Runtime-Terminologie.

Bevorzugte Begriffe:
- Application Runtime
- Composite
- Application Module
- View

Architekturbegriffe dürfen ausschliesslich als Beispiele oder mögliche Rollen
auftreten.

## Regel 11 - Architekturkapitel verwenden Architekturbegriffe

Kapitel über Anwendungsarchitekturen verwenden die jeweilige Terminologie der
beschriebenen Architektur.

Beispiele:

| Architektur            | Begriffe             |
| ---------------------- | -------------------- |
| MVC                    | Controller           |
| MVVM                   | ViewModel            |
| MVCS                   | Controller, Service  |
| DDD                    | Domain Model         |
| Clean Architecture     | Use Case, Adapter    |

Sobald die Runtime beschrieben wird, ist wieder der Begriff __Application
Module__ zu verwenden.

## Regel 12 - Begriffe werden genau einmal definiert

Jeder grundlegende Begriff erhält genau eine massgebliche Definition.

Empfohlene Zuordnung:

| Begriff                | Kapitel              |
| ---------------------- | -------------------- |
| Application Runtime    | Introduction         |
| Component              | Components           |
| Composite              | Components           |
| Application Module     | View-Module Binding  |
| View                   | View-Module Binding  |

Spätere Kapitel verwenden diese Begriffe, ohne sie erneut zu definieren.

Bei Bedarf wird auf die ursprüngliche Definition verwiesen.

## Regel 13 - Ein Begriff bleibt innerhalb eines Abschnitts konstant

Nachdem ein Begriff eingeführt wurde, wird er innerhalb desselben Kapitels oder
Abschnitts konsequent verwendet.

__Richtig__
> The Application Module is instantiated by the runtime. The Application Module
> manages the application state.

__Falsch__
> The Application Module is instantiated by the runtime. The object manages the
> application state.

## Regel 14 - Die Runtime ist architekturneutral

Die Runtime kennt ausschliesslich ihre eigenen Konzepte.

Welche Architekturrolle ein Application Module übernimmt, entscheidet allein die
Anwendung.

```text
Application Runtime
        │
        ▼
Application Module
        │
        ▼
Architekturrolle
        ├─ ViewModel
        ├─ Controller
        ├─ Service
        └─ Application Model
```

## Regel 15 - Begriffe folgen ihrer Verantwortlichkeit

Jede Begriffskategorie gehört zu einer klar abgegrenzten Ebene.

| Ebene                    | Begriffe                                                   |
| ------------------------ | ---------------------------------------------------------- |
| JavaScript               | Object, ECMAScript module                                  |
| Seanox aspect-js Runtime | Application Runtime, Composite, Application Module, View   |
| Allgemeine Komponenten   | Component                                                  |
| Anwendungsarchitektur    | ViewModel, Controller, Service, Application Model          |
| Fachdomäne               | Domain Model                                               |

Begriffe unterschiedlicher Ebenen dürfen weder synonym verwendet noch
miteinander vermischt werden.

## Regel 16 - Terminologie folgt dem Kontext

Die verwendete Terminologie richtet sich nach dem Gegenstand des jeweiligen
Abschnitts.

| Kontext       | Zulässige Terminologie                                    |
| ------------- | --------------------------------------------------------- |
| Runtime       | Application Runtime, Composite, Application Module, View  |
| Komponenten   | Component, Composite                                      |
| Architektur   | ViewModel, Controller, Service                            |
| Fachdomäne    | Domain Model                                              |
| JavaScript    | Object, ECMAScript module                                 |

Beim Wechsel des Kontexts wird auch die Terminologie entsprechend angepasst.

## Regel 17 - Terminologie hat Vorrang vor Architekturmustern

Die Dokumentation beschreibt primär die Konzepte von Seanox aspect-js und nicht
die Konzepte einer bestimmten Anwendungsarchitektur.

Auch wenn ein __Application Module__ in einer Anwendung die Rolle eines
ViewModels, Controllers oder Services übernimmt, wird bei der Beschreibung der
Runtime stets der Framework-Begriff verwendet.

Architekturbegriffe werden ausschliesslich verwendet, wenn explizit die
Anwendungsarchitektur beschrieben wird.
