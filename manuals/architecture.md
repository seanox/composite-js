&#9665; [Introduction](introduction.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#architecture)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
- - -

# Architecture
The architecture of _composite-js_ defines the concepts, responsibilities, and
relationships that form its application and runtime model.

A _composite-js_ application consists of independently identified composites
that are realized within the DOM by the runtime. The following sections define
each concept, its responsibilities, and its relationships to the others.

## Contents Overview
- [Architecture Model](#architecture-model)
- [Trust Boundary](#trust-boundary)
- [Scopes](#scopes)
  - [Global Scope](#global-scope)
  - [Application Scope](#application-scope)
  - [View Scope](#view-scope)
  - [Execution Scope](#execution-scope)
- [Composite](#composite)
  - [Composite Declaration](#composite-declaration)
  - [Composite Responsibilities](#composite-responsibilities)
- [Composite ID](#composite-id)
- [Conceptual Composition](#conceptual-composition)
- [Composite Module](#composite-module)
  - [Composite Module Responsibilities](#composite-module-responsibilities)
- [Composite Script](#composite-script)
  - [Composite Script Responsibilities](#composite-script-responsibilities)
- [ECMAScript Module](#ecmascript-module)
- [Application Module](#application-module)
  - [Application Module Responsibilities](#application-module-responsibilities)
- [View](#view)
  - [View Responsibilities](#view-responsibilities)
- [Namespace](#namespace)
- [Composite Binding](#composite-binding)
  - [Composite Binding Responsibilities](#composite-binding-responsibilities)
- [Composer](#composer)
- [Runtime](#runtime)
  - [Runtime Responsibilities](#runtime-responsibilities)
- [Rendering Model](#rendering-model)
- [Resource Model](#resource-model)
- [Composite Lifecycle](#composite-lifecycle)
- [Static Runtime Model](#static-runtime-model)
- [Concept Relationships](#concept-relationships)
- [Architectural Invariants](#architectural-invariants)
- [Summary](#summary)

## Architecture Model
The architecture distinguishes between application units, resource units,
application logic, declarative presentation, and runtime mechanisms.

> __Application__
> - is composed of composites
>
> __Composite__
> - has a composite ID
> - has a DOM context
> - has a JavaScript context
> - has a CSS context
> - is realized from a composite module
> - can be associated with an application module
> - participates in the composite lifecycle
>
> __Composite Module__
> - provides markup
> - provides CSS
> - provides a composite script
> - can provide additional resources
>
> __Composite Script__
> - is JavaScript with access to the composite-specific script API
> - is executed in a separate function scope
> - can provide the application module
>
> __View__
> - describes the declarative presentation
> - can contain expressions
> - can contain runtime instructions
>
> __Application Module__
> - provides the application logic
> - is addressed through the composite ID
> - provides exposed objects for composite binding
>
> __Composite Binding__
> - connects the view with the application module
>
> __Composer__
> - processes the declarative program state
> - realizes composites
> - establishes composite bindings
> - manages DOM relationships
> - performs lifecycle transitions
>
> __Runtime__
> - loads composite modules
> - resolves resources
> - provides rendering
> - manages bindings
> - manages the composite lifecycle

## Trust Boundary
Seanox composite-js is an application runtime. Content that is loaded and
interpreted as application resources is considered part of the application and
is therefore trusted.

This includes:
- Application Modules
- Composite Scripts
- Expressions
- executable markup

These components execute within the same application context and are not
sandboxed from each other.

The trust boundary is the configured application context. Runtime resources are
resolved within this context path. Content outside this context is not
considered application code unless explicitly included by the application.

The application context is therefore a resource boundary, not a security
sandbox. It does not isolate JavaScript execution or protect trusted application
code from other trusted application code.

The runtime is not a sandbox for untrusted content. External or user-provided
data must be handled appropriately before being introduced as executable
application content.

Dynamic code execution is intentional and is part of the runtime execution
model. Composite scripts and expressions execute with the privileges of the
application context; they are not executed in an isolated JavaScript sandbox.

## Scopes
The runtime distinguishes four scopes. They differ in lifetime, ownership, and
how their values are accessed. These runtime scopes are separate from the
application context resource boundary described above.

### Global Scope
The browser page and its `window` object. It provides access to browser APIs and
globally available application objects, including objects used for composite
binding. Variables declared by markup expressions are not global variables.

### Application Scope
Persistent for one running composite-js application instance. It contains shared
state and services used by multiple composites and modules. Use `application` to
access state or services that must remain available independently of one view.

### View Scope
Shared storage for variables declared by markup expressions and values assigned
through `view`. It persists for the running page and is not isolated per
composite or automatically cleared when a composite is removed or a view changes.

### Execution Scope
Created for one expression evaluation or composite script invocation. It
contains the current view scope values, temporary runtime instruction variables,
and the persistent scope objects `view` and `application`. It is discarded
afterwards; assigning to a bare variable does not update the persistent scope.
Object values retain their identity, so changes to their properties persist.

The scopes are not interchangeable. Use each scope according to the lifetime and
visibility required by the data or service.

Expressions and composite scripts execute in the execution scope. View scope
variables are available there by name, while the persistent scopes are reached
through the reserved objects `view` and `application`. These explicit objects
make the intended lifetime and sharing of a value clear:

```javascript
view.selectedId = item.id;
application.currentUser = user;
const label = `${view.selectedId}`;
```

The execution scope may contain temporary variables with the same name as view
scope variables. Such temporary values take precedence only for the current
evaluation; they do not overwrite the persistent view scope value.

Expressions and composite scripts execute in strict mode. Available helpers
depend on the execution method; see the [Script API](scripting.md#script-api).

## Composite
A composite is an independently identified, domain-oriented application unit
within the DOM. Its runtime representation consists of three related contexts:

> __Composite__
> - DOM context
> - JavaScript context
> - CSS context

The DOM context is defined by the HTML element that declares the composite and
includes the DOM region associated with that element. The JavaScript context is
provided by the corresponding application module, if one exists. The CSS context
consists of the stylesheets and CSS rules associated with the composite. None of
them represents the composite independently.

Composite styles are not automatically scoped. Use selectors that target the
composite explicitly; loaded composite CSS is inserted into the document.

A composite is not a single JavaScript object, an ECMAScript module, or a
reusable UI component, but a logical application unit spanning these contexts.

The term _domain-oriented_ describes a conceptual assignment rather than a
technical restriction. A composite can represent a business domain, a technical
concern, or another application structure. The runtime does not enforce a
particular application architecture.

### Composite Declaration
A composite is declared by applying the `composite` attribute to an HTML
element. The element must also have an `id` attribute that identifies the
composite.

```html
<section id="customer" composite>
</section>
```

The declaration establishes the element as the root of the DOM context of the
composite. The combination of the `composite` attribute and the `id` attribute
forms the composite ID.

### Composite Responsibilities
A composite provides the logical boundary within which its declarative
presentation, application logic, and associated styles operate together.

It does not define how its resources are packaged, loaded, or resolved, and it
does not perform its own realization. These responsibilities belong to the
composite module, the runtime, and the composer.

## Composite ID
The composite ID is the unique identity of a composite and its global namespace
within the application.

It is formed by the semantic combination of the `id` and `composite` attributes
on an HTML element.

```html
<section id="customer" composite>
</section>
```

In this declaration, `customer` is the composite ID because the value occurs on
an element declared as a composite. The attribute value alone does not form a
composite ID outside that relationship.

The Composite ID connects:
- the Composite in the DOM
- the Composite module
- the Composite script
- the application module
- the associated resources

The runtime uses the composite ID for name resolution, resource resolution,
assignment of composite modules, management of the application module namespace,
composite binding, and lifecycle management.

The composite ID is therefore the primary identity of the runtime model,
comparable to a primary key: every relationship of a composite is derived from
it, and none of these relationships exists without it.

## Conceptual Composition
Several concepts in _composite-js_ are formed by the semantic association of
existing elements rather than by separate language constructs or artifacts.

The composite ID is an example of this principle. It is not merely an attribute
value.

```text
id attribute
    + composite attribute
        -> Composite ID
```

Conceptual composition is therefore a fundamental architectural principle of
_composite-js_. Existing browser concepts are assigned additional semantics by
the runtime and combined into framework concepts.

## Composite Module
A composite module is the loadable resource unit of a composite.

It groups the resources required to realize the composite:
- Markup
- CSS
- Composite script
- optional additional resources

A composite module defines the technical relationship between the resources of
a composite and the runtime. It does not represent the running composite and
does not itself provide the runtime state of the application unit.

```text
Composite Module
    -> provides resources
        -> used to realize a Composite
```

The relationship between a composite and its composite module is established
through the composite ID. The runtime uses that identity to resolve the
corresponding resource unit and load the resources required for realization.

A composite module is a runtime concept that is independent of the ECMAScript
module system. Although its composite script can use ECMAScript modules, the
composite module itself is not an ECMAScript module.

### Composite Module Responsibilities
A composite module is responsible for grouping the resources associated with a
composite and making them available as a loadable runtime resource unit.

It does not:
- represent the running composite
- manage the composite lifecycle
- perform composite binding
- define the internal structure of the application module
- replace the ECMAScript module system

## Composite Script
A composite script is JavaScript code with access to the _composite-js_-specific
[Script API](scripting.md#script-api): `require`, `expose`, `use` and
`attempt`. The runtime injects these helpers as local functions. They are not
registered as global functions or automatically provided to ECMAScript modules.

The composite script of a composite module is loaded and executed by the runtime
as part of realizing the composite, unless a corresponding application object
already exists. The script can provide the application module that implements
the application logic of the composite.

The same language and API can also be used in standalone modules loaded via
[require](scripting.md#require) and in JavaScript embedded in markup (see
[Embedded Composite Script](scripting.md#embedded-composite-script)). These
scripts need not belong to a composite module, but can also provide application
objects for composite binding.

> __Composite Module__
> - contains a composite script
>
> __Composite Script__
> - is processed and executed by the Runtime
> - can provide the application module

Composite scripts execute in a separate function scope, not an ECMAScript module
context. Static `import` and `export` declarations are not supported in these
scripts. Where supported by the browser, `import()` can load ECMAScript modules.

The script API supports loading script modules, publishing application objects,
and creating namespaces. For composite binding, an application object must be
available under the namespace resolved from the composite ID.

### Composite Script Responsibilities
The composite script is not itself the application module. The script is the
executable program, whereas the application module is the application logic it
can provide or initialize.

## ECMAScript Module
An ECMAScript module is a JavaScript module defined by the ECMAScript standard.
It uses the standard `import` and `export` language mechanisms and remains
independent of the runtime concepts of _composite-js_.

> __ECMAScript Module__
> - is defined by ECMAScript
> - does not participate in the composite lifecycle
> - has no direct relationship to composite IDs
> - has no direct relationship to composite binding

A composite module is not an ECMAScript module, a composite script is not an
application module, and a composite is not a module.

## Application Module
The application module provides the application logic of a composite. It can be
provided by a composite script or by an existing application object.

```text
Composite Script
    -> can provide
        -> Application Module
```

The runtime does not prescribe the internal structure of an application module.
It can be implemented using objects, functions, classes, multiple classes, or
any combination of these structures.

Following the [static runtime model](#static-runtime-model), the composite ID
addresses the corresponding application object. A composite can render without
an application module; composite binding requires that object to exist.

> __Composite ID__
> - identifies one composite
> - addresses the application module, if provided

The application module can organize its internal object structure hierarchically
and thereby provide additional logical namespaces. These namespaces are part of
the object structure of the application module and are addressed within the
namespace defined by the composite ID.

Objects that participate in composite binding must be accessible under the
namespace resolved from the composite ID. A composite script can publish an
object there with [expose(object, namespace)](scripting.md#expose). The
one-argument form only collects module exports; Composer does not use these
exports for binding. Internal objects that are not accessible through the
application module remain implementation details and are not directly available
to the view through composite binding.

### Application Module Responsibilities

The application module is responsible for providing the application logic of a
composite. It can maintain state, provide behavior, organize its internal object
structure, and expose bindable objects.

It does not define the declarative presentation, load its own composite module,
establish composite binding, or control the composite lifecycle.

## View
The view describes the declarative presentation of a composite.

It is defined by markup and styled by CSS. In addition to regular HTML, the view
can contain expressions and runtime instructions that are evaluated during
rendering.

The view does not provide the application logic. Instead, it refers to objects
provided by the application module through expressions and composite binding.

Expressions contain JavaScript enclosed in `{{...}}` and receive only `attempt`
automatically, not `require`, `use` or `expose`. The
[Markup Extensions for Expressions](expression.md#keyword) provide optional
operator aliases such as `:and` (`&&`), `:or` (`||`) and `:not` (`!`) as
markup-friendly spellings. They are translated before evaluation; normal
JavaScript operators remain supported.

Expression execution failures are logged and returned unchanged as ordinary
result values, which may appear in rendered output. Direct `Scripting.eval()`
and `Scripting.run()` calls instead propagate execution failures to their
caller. See [Expression error handling](expression.md#expressions).

Expressions use the shared view scope managed by the composer, distinct from
the application module's JavaScript context. Markup declarations create
persistent view variables, not global JavaScript variables. Runtime instructions
such as `iterate` provide additional temporary values in the execution scope.

The runtime exposes the persistent scopes through two explicit objects:

- `view` contains the persistent variables of the current view scope.
- `application` contains persistent variables shared by the composite-js
  application instance, including its modules.

Expressions and composite scripts read and update these scopes through `view`
and `application`. Bare view variables are supplied as values for each
execution; assigning to them does not update the stored view variables.

> __View__
> - describes declarative presentation
> - contains markup
> - can contain expressions
> - can contain runtime instructions
>
> __Application Module__
> - provides application logic
>
> __Composite Binding__
> - connects both concepts

The view is realized within a concrete DOM context by the composer. The
resulting DOM is part of the running state of the composite rather than merely a
passive output representation.

### View Responsibilities
The view is responsible for the declarative presentation and for the
relationships that the runtime must realize.

It does not implement the application logic, establish its own binding, load
resources, or manage runtime state transitions.

## Namespace
Namespaces organize application objects by name. They are represented by nested
JavaScript objects; the Object API provides methods to create and resolve these
structures.

Every composite has a namespace defined by its composite ID. This namespace is
the outer, global addressing space of the corresponding application module
within the application.

```text
Composite ID
    -> defines the outer namespace
        -> addresses the application module, if provided
            -> can contain an internal object structure
                -> can provide additional logical namespaces
```

The internal object structure of the application module can organize objects
hierarchically and thereby form additional logical namespaces. These remain
subordinate to the outer namespace defined by the composite ID:

> __Composite ID__
> - global application namespace of the composite
>
> __Application Module__
> - internal hierarchical organization

The namespace defined by a composite ID is used to resolve the corresponding
application object, as described in the [static runtime model](
    #static-runtime-model). DOM nesting does not create namespaces.

For example, the following declaration resolves to the application object
`shop.customer` and the module resources `modules/shop/customer.js`,
`modules/shop/customer.css` and `modules/shop/customer.html`:

```html
<section id="customer@shop" composite></section>
```

The composite script `modules/shop/customer.js` can publish the object as
follows:

```javascript
const customer = {
    name: "Jone"
};
expose(customer, "shop.customer");
```

The runtime provides the addressing mechanism, while the application determines
the meaning and organization of the objects within the application module. This
decision is independent of whether the represented structure is
business-oriented or technical.

## Composite Binding
Composite binding is the relationship between the declarative DOM structure of
a composite and its application module.

The composite ID provides the initial association between the composite in the
DOM, its composite module, its application module, and its resources. Within the
application module, bindable objects are associated with elements identified in
the view.

> __Composite ID__
> - associates the composite with the application module
>
> __Element ID__
> - identifies an element within the view
> - associates the element with a bindable object

During realization, the composer resolves these relationships and establishes
the composite binding when a corresponding application object exists. Objects
that participate in binding must be accessible through that object.

Composite binding is part of the runtime representation of a composite. It is
neither part of the composite module nor part of the application module itself.
It arises through the runtime while the composite is being realized.

### Composite Binding Responsibilities
Composite binding is responsible for connecting the declarative DOM structure
with accessible objects of the application module.

It does not provide application logic, define the view, or independently manage
the lifecycle of the composite.

## Composer
The composer is the central runtime component responsible for realizing
composites.

It connects composite modules with concrete DOM contexts and creates the runtime
representations of the corresponding composites. In doing so, it processes the
declarative program state and orchestrates the resources, relationships, and
state transitions required for realization.

Its responsibilities include:
- realizing DOM contexts
- establishing JavaScript contexts
- setting up composite bindings
- managing DOM relationships
- performing lifecycle transitions
- processing the declarative program state

```text
Composite Module
    + DOM context
        -> Composer
            -> running composite
```

The composer is neither a composite nor the complete runtime. It is the runtime
component that performs the concrete composition and realization of composites.

## Runtime
The runtime comprises all mechanisms that are effective during the execution of
a _composite-js_ application. It is not a single object or a single module, but
the architectural layer in which these mechanisms operate.

It provides the infrastructure required to:
- load composite modules
- resolve resources
- realize composites
- establish and manage composite bindings
- process declarative runtime instructions
- perform rendering
- manage the composite lifecycle
- maintain relationships between the DOM, JavaScript, and CSS

The composer operates as part of this layer. Other runtime mechanisms support
resource loading, resource resolution, script processing, binding, rendering,
and lifecycle management.

### Runtime Responsibilities
The runtime is responsible for realizing the semantic relationships defined by
the architecture.

The runtime does not prescribe the internal architecture of an application
module or the business meaning of a composite.

## Rendering Model

Rendering is the realization of the declarative program model within the
runtime.

The DOM is not treated only as an output target. It is part of the running
program state and contains declarations and relationships that are interpreted
by the runtime.

During rendering, the composer processes the declarative DOM model. This
processing can include:
- evaluating declarative attributes
- interpreting expressions
- processing composite scripts
- loading resources
- establishing composite bindings
- updating DOM structures
- rebuilding DOM structures
- performing required lifecycle transitions

```text
Declarative DOM model
    -> processed by the composer
        -> resources are resolved
        -> composite scripts are processed
        -> composite bindings are established
        -> DOM structures are realized
        -> runtime state is established
```

Rendering therefore includes more than the visual modification of the DOM. It
transforms the declarative model into its running runtime state.

The same fundamental mechanisms apply to both the initial realization of a
composite and later changes to an existing composite state. Rendering can
therefore create, update, or rebuild the runtime representation as required by
the declarative state.

## Resource Model
Resources are the artifacts required by the runtime to realize a composite. They
are grouped by the corresponding [composite module](#composite-module).

The resource model distinguishes the resource representation from the running
application unit:

> __Composite Module__
> - resource representation
>
> __Composite__
> - runtime representation

Resource resolution belongs to the runtime. A composite does not load or resolve
its own resources, and the application module does not determine the resource
identity of the composite.

A resource belongs conceptually to the composite module until it is processed as
part of realization. The resulting DOM, JavaScript, and CSS contexts belong to
the runtime representation of the composite.

## Composite Lifecycle
The composite lifecycle describes the runtime-controlled states and state
transitions of a composite during its existence in the DOM.

It covers the phases from the realization of the composite through its active
presence in the DOM to its removal.

```text
Composite declaration in the DOM
    -> realization
        -> active presence in the DOM
            -> removal from the DOM
```

The runtime controls the lifecycle, while the composer performs the state
transitions required for the concrete realization and removal of the composite.

The lifecycle describes the state model of the composite rather than the
application logic of its application module. Application state maintained by the
application module and lifecycle state maintained by the runtime are therefore
separate concerns.

The concrete states and transition conditions are defined by the runtime, which
must manage them consistently with the existence and realization of the
composite within the DOM.

## Static Runtime Model
Seanox composite-js uses a static runtime model for the relationship between a
composite and its application module.

The composite ID resolves an application object by its namespace. Realizing a
DOM element does not create a separate application object instance.

```text
Composite ID
    -> resolves the application object, if provided
```

Removing a composite from the DOM does not discard its application object.
Application logic is responsible for resetting state or releasing its own
resources when needed.

The internal state and object structure can change during execution. The static
model describes the namespace-based association, not an immutability guarantee
for the application object.

## Concept Relationships
The realization of a composite follows the conceptual dependency chain:

```text
Composite declaration
    -> Composite ID
        -> Composite Module resolution
            -> resource loading
                -> Composite Script processing, if needed
                    -> Application Module resolution, if provided
                        -> View realization
                            -> Composite Binding, if applicable
                                -> running Composite
```

This sequence expresses conceptual dependencies rather than a complete
procedural specification. Individual runtime operations can be coordinated or
repeated as required by rendering and lifecycle management.

## Architectural Invariants
The architecture establishes the following invariants:
1.  Every composite has a unique composite ID.
2.  Every composite ID defines the outer namespace of its composite.
3.  A composite can render without an application module.
4.  An application module can be provided by a composite script or an existing
    application object.
5.  A composite module provides resources but is not the running composite.
6.  A composite script is not the application module it can provide.
7.  An ECMAScript module is independent of composite module and lifecycle semantics.
8.  A view provides declarative presentation but not the application logic.
9.  Expressions and composite scripts are evaluated in a non-persistent
    execution scope; persistent state can be held in the view and application
    scopes or in application objects.
10. Composite binding requires an application object resolvable under the
    composite ID, with accessible binding targets.
11. Composite binding is established by the runtime during realization.
12. The composer performs the concrete realization of composites.
13. The composer is part of the runtime but is not the complete runtime.
14. Rendering realizes declarative program state and is not limited to visual
    DOM updates.
15. The runtime manages the composite lifecycle.
16. The runtime does not enforce a specific application architecture.

These invariants define the conceptual boundaries that implementations and
applications must preserve.

## Summary
The architecture of _composite-js_ is based on independently identified
composites realized within the DOM. The composite ID connects the DOM
declaration of a composite with its composite module, application module, and
resources, and is the reference the runtime uses for namespace resolution,
composite binding, and lifecycle management.

These responsibilities remain separate but are coordinated by the runtime.
Together, they define the conceptual and technical architecture of
_composite-js_.



- - -
&#9665; [Introduction](introduction.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#architecture)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
