# User Story: Mount-Event-Lookup dokumentieren

## User Story

Als Anwendungsentwicklerin möchte ich den Aufbau und die Bedeutung des
zweiten Arguments der Composer-Mount-Events verstehen, damit ich beim
Andocken und Entfernen eines Composites auf das richtige Anwendungsmodul und
den zugehörigen Namespace zugreifen kann, ohne den Lookup-Scope mit dem View-
oder Ausführungsscope zu verwechseln.

## Ausgangslage

`Composer.EVENT_MODULE_DOCK`, `Composer.EVENT_MODULE_READY` und
`Composer.EVENT_MODULE_UNDOCK` übergeben als zweites Callback-Argument ein
Lookup-Objekt. Die aktuelle Dokumentation beschreibt es nur allgemein als
Meta-Objekt und erklärt weder seine Struktur noch den Unterschied zwischen
den äußeren Lookup-Feldern und den verschachtelten Identifikationsdaten.

Die Runtime übergibt ein Objekt der Form `{meta, scope, model}`. Dabei enthält
`meta` die Informationen, mit denen das Anwendungsmodul lokalisiert wird;
`scope` und `model` sind die aufgelösten Objekte.

## Gewünschtes Verhalten

Die Event-Dokumentation erklärt für alle drei Events die Form und Bedeutung
des zweiten Callback-Arguments:

- `lookup.meta` enthält die Identifikationsdaten des Moduls.
- `lookup.meta.scope` enthält bei einem namespaced Modul die Namespace-
  Segmente als Array. Ohne Namespace-Pfad ist diese Eigenschaft nicht
  vorhanden.
- `lookup.meta.model` enthält den Modulnamen.
- `lookup.scope` ist das aufgelöste Objekt, in dem das Modul gefunden wurde,
  oder `undefined`, wenn es direkt im globalen Scope aufgelöst wurde.
- `lookup.model` ist das gefundene Anwendungsmodul.
- `lookup.scope` ist die Basis der Objektauflösung und weder der View-Scope
  noch der Ausführungsscope.

Die Dokumentation enthält ein Beispiel für `id="customer@shop:admin"`:
`lookup.meta.scope` ist `["shop", "admin"]`, `lookup.meta.model` ist
`"customer"`, `lookup.scope` ist das aufgelöste `window.shop.admin`-Objekt und
`lookup.model` das dort gefundene Anwendungsmodul.

Die bestehenden Zeitpunkte und sonstigen Verhaltensweisen der drei Events
bleiben unverändert.

## Abnahmekriterien

- [ ] Die Abschnitte zu `EVENT_MODULE_DOCK`, `EVENT_MODULE_READY` und
  `EVENT_MODULE_UNDOCK` beschreiben jeweils das zweite Callback-Argument als
  Lookup-Objekt mit der Struktur `{meta, scope, model}`.
- [ ] Die Dokumentation erklärt die äußeren Eigenschaften `scope` und `model`
  sowie die Identifikationsdaten unter `meta` korrekt.
- [ ] Das Beispiel `customer@shop:admin` veranschaulicht die Trennung zwischen
  Namespace-Pfad, Modulnamen, aufgelöstem Scope-Objekt und Anwendungsmodul.
- [ ] Die Dokumentation stellt klar, dass `lookup.scope` kein View- oder
  Ausführungsscope ist.
- [ ] Die Zeitpunkte und das Verhalten der Events werden durch die Änderung
  nicht verändert.

## Erforderliche Dokumentation

- Aktualisiere `../../manuals/events.md`.

## Technischer Umfang

- Dokumentation: `../../manuals/events.md`
- Keine Änderungen an Runtime-Quellen oder generierten Bundles.
