&#9665; [Reactivity Rendering](reactive.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Routing](routing.md) &#9655;
- - -

# Composite Binding
Composite binding is the mechanism used by _composite-js_ to connect the view of
a composite with its application module. The composer, as the central runtime
component for realizing composites, establishes this technical connection.

<img src="composite-binding_view_module.svg"/>

The runtime provides the infrastructure for connecting views and application
modules but does not define the internal structure or architectural role of an
application module. Depending on the application architecture, an application
module can implement a ViewModel, Controller, Service, application model or
another application-specific structure -- see [Architectural Patterns](
    #architectural-patterns).

## Contents Overview
- [Terms](#terms)
  - [Application Module](#application-module)
  - [View](#view)
  - [Runtime](#runtime)
  - [Composer](#composer)
  - [Composite](#composite)
- [Binding](#binding)
- [Synchronization](#synchronization)
- [Validation](#validation)
- [Events](#events)
- [Dock](#dock)
- [Undock](#undock)
- [Architectural Patterns](#architectural-patterns)
  - [MVC](#mvc)
  - [MVVM](#mvvm)
  - [MVCS](#mvcs)
  - [Other Architectures](#other-architectures)

## Terms
The terms used here are defined in the chapter [Architecture](
    architecture.md#architecture-model). The following sections describe them
from the perspective of composite binding.

### Application Module
Provides the application logic of a composite (see [Application Module](
    architecture.md#application-module)). From a binding perspective, the key
rule is: a [named application object](architecture.md#named-application-object)
must be available under the composite namespace, with accessible binding targets.
A script can provide it through [object publication](
    architecture.md#object-publication) using `expose(object, namespace)`.
An existing named application object also suffices; collecting module exports
with `expose(object)` alone does not establish this prerequisite.

Application modules are distinct from domain models. UI-specific state such as
selection, visibility or presentation status belongs to the application module
or its presentation logic, while domain models represent domain-specific data
and rules.

### View
The HTML representation of a composite (see [View](architecture.md#view)). It
defines structure and presentation and can use expressions and declarative
attributes to access application data, handle interactions and control rendering
behavior, but does not define application-specific logic itself.

### Runtime
The infrastructure for resource loading, rendering, binding and lifecycle
management -- see [Runtime](architecture.md#runtime).

### Composer
The runtime component that realizes composites and establishes composite binding
between view and application module -- see [Composer](architecture.md#composer).

### Composite
An identified application unit. Its composite ID addresses the application
module used for binding, if one exists. See [Composite](composite.md#composite)
for structure and resources.

## Binding
Composite binding connects the HTML view of a composite with its application
module.

The composer establishes the binding for the composite. The runtime provides
mechanisms for:
- synchronizing values between view elements and application module properties,
- forwarding UI events,
- invoking application module methods,
- evaluating expressions, and
- integrating the application module into the composite lifecycle.

HTML elements inside the composite participate in the binding through their
attributes and identifiers. The binding behavior of an element is defined by the
corresponding declarative markup. The named application object resolved from the
composite ID provides the application module used by the binding. In the example,
`expose(example, "example")` performs object publication before binding:

```javascript
const example = {
    message: "Hello World!",
    submit() {
        ...
    }
};

expose(example, "example");
```

```html
<form id="example" composite>
  <input id="message" type="text" events="change"/>
  <button id="submit" type="submit">Submit</button>
</form>
``` 

## Synchronization
Synchronization transfers values between view elements and the corresponding
properties of the application module.

Synchronization is triggered by the events declared with the `events` attribute
and can be combined with validation.

More details about the usage can be found in chapter
[events](markup.md#events).

## Validation
Validation determines whether a value may be synchronized between the view and
the application module.

Validation is declared with the `validate` attribute together with the
corresponding event configuration. The validation logic is provided by the
application module.

```javascript
const example = {
    message: "Hello World!",
    validate(element, value) {
        return true;
    }
};

expose(example, "example");
```

```html
<input id="message" type="text"
    events="input change" validate/>
```

The public method `Composer.validate(elementOrSelector, lock)` validates one
element, not its subtree. A CSS selector must match at most one element, as with
`Composer.lookup`: multiple matches throw `Error("Selector is not unique")`
before any element is validated. No matches, an empty selector or an unrendered
element return `undefined`. Invalid CSS selector syntax throws the browser's
selector error.

For one match, the selector returns exactly the same validation result as the
element reference, including error strings and `undefined`, without Boolean
normalization. HTML5 validation runs first. By default, `lock` is `true` and
application module validation is disabled, allowing its `validate` method to
delegate to HTML5 validation without calling itself again. Pass `false` to also
allow application module validation.

The application module selects field groups and interprets their results
explicitly. To validate every selected field before deciding whether all passed:

```javascript
const results = Array.from(document.querySelectorAll("#example input[required]"),
    element => Composer.validate(element, false));
const valid = results.length > 0 && results.every(result => result === true);
```

This example requires at least one field and a `true` result from every field.
Other group rules belong to the application logic. Calling `Composer.validate`
alone updates validation messages but does not synchronize values, invoke event
handlers or prevent browser events; those effects belong to the event binding.

More details about the usage can be found in chapter
[validate](markup.md#validate).

## Events
The composer forwards supported HTML events to the corresponding methods of the
application module. Event handlers are resolved from the application module
based on the element IDs inside the composite.

```javascript
const example = {
    showMessage: {
        onClick(event) {
            window.alert("Hello World!");
            return false;
        }
    }
};

expose(example, "example");
```

```html
<div id="example" composite>
  <button id="showMessage">Show message</button>
</div>
``` 

The composer establishes the event connection as part of composite binding. The
application module remains responsible for the application-specific behavior
executed by the event handler. Clicking the button displays `Hello World!`.

## Dock
When a composite becomes part of the document, the composer integrates its
application module into the composite lifecycle. If the application module
provides a `dock()` callback, it can react to the composite being attached.

```javascript
const example = {
    dock() {
        ...
    }
};

expose(example, "example");
```

The callback can be used to initialize or prepare application-specific state
when the composite is attached. It does not control the composite lifecycle or
the rendering process.

## Undock
When a composite is removed from the document, the composer removes its runtime
connections. If the application module provides an `undock()` callback, it can
react to the composite being detached and perform application-specific cleanup.

```javascript
const example = {
    undock() {
        ...
    }
};

expose(example, "example");
```

If a composite is controlled by a condition, docking and undocking depend on the
evaluation of that condition.

## Architectural Patterns
The architectural role of an application module depends entirely on its
implementation, not on the runtime. The following patterns show how established
architectures can be mapped onto an application module.

<img src="composite-binding_view_module.svg"/>

### MVC
The application module can implement the Controller, processing user
interactions, coordinating domain models and invoking services.

<img src="composite-binding_mvc.svg"/>

### MVVM
The application module can implement the ViewModel, containing presentation
logic, UI-specific state, computed values and commands. Domain data remains part
of the domain model.

<img src="composite-binding_mvvm.svg"/>

### MVCS
The application module can implement the Controller, delegating
application-specific responsibilities to Services.

<img src="composite-binding_mvcs.svg"/>

### Other Architectures
An application module can also implement a Service, an application model, or
another application-specific structure. In every case, composite binding
connects view and application module the same way.



- - -
&#9665; [Reactivity Rendering](reactive.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Routing](routing.md) &#9655;
