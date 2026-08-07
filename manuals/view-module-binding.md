&#9665; [Reactivity Rendering](reactive.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#model-view-controller)
&nbsp;&nbsp;&nbsp;&nbsp; [Routing](routing.md) &#9655;
- - -

# View-Module Binding
View-Module Binding (binding) is the mechanism used by Seanox aspect-js to
connect a view with an application module (module). The application runtime
(runtime) establishes this technical connection within a composite, synchronizes
values, propagates events, invokes module methods, and manages the module
lifecycle.

The runtime provides the infrastructure for connecting views and modules but
does not define the architectural role of a module.

<img src="./view-module-binding_view_module.svg"/>

Depending on the application architecture, a module may implement a ViewModel,
Controller, Service, Application Model, or another architectural role defined by
the application.

## Contents Overview
- [Application Module](#application-module)
- [View](#view)
- [Application Runtime](#application-runtime)
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

## Application Module
An application module (module) is the JavaScript object associated with a
composite.

Together with HTML, CSS, and optional additional resources, it forms a composite
within an application. Modules provide application-specific functionality for
views, which may include data, state, interactions, presentation logic, or
coordination with other parts of the application.

The runtime connects the view with its corresponding module but does not impose
an architectural pattern. A module can implement one of many architectural
roles, for example:
- ViewModel
- Controller
- Service
- Application Model
- another architectural role defined by the application

Modules can contain presentation logic, coordinate Domain Models, invoke
services or manage UI-specific state.

## View
The view defines the user interface and is implemented with HTML markup. It
represents the information and interactions provided by the associated module
according to its own structure. The view is responsible for presentation and
does not define application logic. The runtime connects and synchronizes the
view with the associated module.

## Application Runtime
The application runtime (runtime) provides the infrastructure required to
connect views and modules.

Its responsibilities include:
- connecting views with modules,
- synchronizing values between views and modules,
- forwarding UI events,
- rendering and reactive updates,
- routing,
- component management, and
- lifecycle management.

The runtime manages the binding mechanisms between the view and the module. It
provides infrastructure for rendering, synchronization, events, routing and
lifecycle management, but does not implement application logic or define the
architectural role of a module.

## Composite
A composite is the basis for view-module binding and consists of:
- HTML
- CSS
- JavaScript (module)
- optional additional resources

Each composite is identified by its composite ID, which connects the HTML
element, the corresponding module, and the CSS selector.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="aspect-js.js"></script>
  </head>
  <body>
    <div id="example" composite></div>
  </bod>
</html>
```

```javascript
const example = {
    ...    
}
```

```css
#example {
  ...    
}
```

The composite ID uniquely identifies a composite within the application. It is
formed from the `id` and `composite` attributes of the HTML element and
determines the location of the corresponding module in the runtime namespace
hierarchy. A composite ID consists of letters, digits, and underscores and must
start with a letter or an underscore.

Elements inside the composite that define an `id` can be mapped to corresponding
properties or methods of the module according to the binding
configuration.

```javascript
const model = {
    message: "Hello", 
    submit: {
        ...    
    }
};
```

```html
<html>
  <body>
    <form id="model" composite>
      <input type="text" id="message"/>
      <input type="submit" id="submit"/>
      ...
    </form>
  </body>
</html>
```

## Binding
View-Module Binding connects the HTML view of a composite with its associated
application module. The runtime performs event wiring and synchronization based
on the binding configuration.

The runtime:
- synchronizes values,
- forwards UI events,
- invokes module methods, and
- updates the view.

```javascript
const model = {
    message: "Hello", 
    dock() {
        ...
    },
    undock() {
        ...
    },
    submit: {
        onClick(event) {
            ...
        }
    }
};
```

```html
<html>
  <body>
    <form id="model" composite>
      <input type="text" id="message" value="{{model.message}}" events="change"/>
      <input type="submit" id="submit"/>
      ...
    </form>
  </body>
</html>
```

## Synchronization
Synchronization transfers values between HTML elements and the corresponding
properties of the module in addition to the static binding. It is triggered only
by the events declared with the `events` attribute.

More details about the usage can be found in chapter [events](markup.md#events).

## Validation
Validation controls whether synchronization of values between the view and the
module is performed. It is declared with the `validate` attribute together with
the `events` attribute. The corresponding validation method is implemented by
the module.

More details about the usage can be found in chapter [validate](
    markup.md#validate).

## Events
The runtime forwards supported HTML events to matching methods of the module.

Events are mapped to methods following a naming convention. Matching methods are
discovered during binding and registered automatically as event listeners. Event
handlers can be resolved from module methods according to the naming convention.

```javascript
const contact = {
    mail: {
        onClick(event) {
          const mail = "mailto:mail@local?subject=Test&body=Greetings";
            document.location.href = mail;
            return false;
        }
    }
};
```

```html
<html>
  <body>
    <div id="contact" composite>
      <p>
        Example for use of events.
      </p>
      <button id="mail">
        Click Me!
      </button>
    </div>
  </body>
</html>
```

## Dock
When a composite becomes part of the DOM, its module is docked and, if
implemented, `dock()` is executed before the composite is rendered. The method
can be used to prepare the view.

```javascript
const model = {
    dock() {
        ...
    }
};
```

## Undock
When a composite is removed from the DOM, its module is undocked, after which
the optional `undock()` method is executed. The method can be used for cleanup.

```javascript
const model = {
    undock() {
        ...
    }
};
```

If a composite is controlled by a condition, docking and undocking depend on the
evaluation of that condition.

## Architectural Patterns
View-Module Binding is independent of the application architecture.

The runtime connects views with their associated modules.

<img src="./view-module-binding_view_module.svg"/>

The architectural role of a module depends entirely on its implementation.

### MVC
In MVC, the module typically implements the Controller.

<img src="./view-module-binding_mvc.svg"/>

The Controller processes user interactions, coordinates Domain Models, and
invokes services.

### MVVM
In MVVM, the module typically implements the ViewModel.

<img src="./view-module-binding_mvvm.svg"/>

The ViewModel contains presentation logic, UI state, computed values, and commands.

Domain data remains part of the Domain Model.

### MVCS
In MVCS, the module typically implements the Controller and delegates
application logic to services.

<img src="./view-module-binding_mvcs.svg"/>

### Other Architectures
The runtime is independent of any specific architectural pattern.

A module may also implement:
- a Service
- an Application Model
- another architectural role defined by the application

The runtime connects views with their associated modules.

The architectural role of that module is defined solely by the application.



- - -
&#9665; [Reactivity Rendering](reactive.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#model-view-controller)
&nbsp;&nbsp;&nbsp;&nbsp; [Routing](routing.md) &#9655;
