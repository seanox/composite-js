&#9665; [Introduction](introduction.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
- - -

# Architecture

## Architecture Overview
In Seanox aspect-js, the __composite__ is the atomic UI unit. A composite
contains its view, application logic and associated resources. The __runtime__
loads and manages these resources and controls the composite lifecycle.

The __composite ID__ identifies a composite and brings its view, resources and
application module together. From the runtime's perspective, these resources
form a __composite module__, which represents them as a __runtime module__.
__Composite binding__ connects the view with the application module without
prescribing its internal structure.

Multiple composites can be combined into functional __components__. An __ECMA
module__ is independent of the Composite system and provides standard
JavaScript modularization using `import` and `export`.

## Core Concepts

### Runtime
The runtime provides the infrastructure required to execute applications built
with Seanox aspect-js. It loads and manages resources, creates and manages
composites, establishes composite binding and handles rendering, reactivity,
routing and lifecycle. For each composite, it loads the corresponding composite
module and manages the resources associated with its composite ID. Application-
specific behavior remains outside the runtime, which does not define the
internal architecture of application modules.

### Composite
A composite is the atomic UI unit of Seanox aspect-js. It consists of HTML,
CSS, JavaScript and optional additional resources and is identified by a
__composite ID__. The runtime uses this ID to find the associated resources,
establish composite binding and manage the composite lifecycle. An application
module can participate in this lifecycle through callbacks when the composite
is attached to or removed from the document.

### Composite ID
A __composite ID__ is a unique string that identifies a composite. It connects
the composite with its view, application module and associated resources and is
used for resource resolution, the application module namespace, the composite
lifecycle and composite binding.

In markup, the composite ID is represented by the combination of the `id` and
`composite` attributes. It is also used as the logical name of the composite
in files and code.

### Composite Module
A __composite module__ is the resource group that belongs to a Composite. It
consists of:
- HTML (View)
- CSS (Styling)
- JavaScript (Composite Script)
- optional additional resources

The runtime loads composite modules lazily and can cache them for later use. The
Composite ID identifies the composite module and its resources. From the
runtime's perspective, a composite module is a runtime module and is independent
of the JavaScript module system defined by ECMAScript.

### View
A __view__ is the HTML representation of a composite. It defines the structure
and presentation of the user interface and can use expressions and declarative
attributes to access application data, handle interactions and control rendering
behavior. Application logic is provided by the application module rather than
the view.

### Application Module
The __application module__ provides the application logic of a Composite. It
consists of the JavaScript provided by the Composite Script and has no
predefined internal structure.

Its structure may consist of an object, function, class or multiple classes. The
Runtime does not prescribe an architectural pattern. It may contain presentation
logic, a ViewModel, a Controller, a Service or other application-specific
structures.

Composite Scripts execute in an isolated module scope. Objects that participate
in composite binding must be explicitly exported.

### Component
A __Component__ is a functional unit composed of multiple Composites and/or
other Components. It groups Composites into a larger functional unit without
replacing the Composite as the atomic UI unit.

### ECMA Module
An __ECMA module__ is a standard JavaScript module defined by the ECMAScript
module system and uses `import` and `export`. It is independent of the composite
system and does not participate in the composite lifecycle. The ECMAScript
`import` and `export` can be used together with the `#import` and `#export`
mechanisms of a Composite Script.

The three module concepts have different roles:
- __Composite Module__ — resource group managed by the runtime
- __ECMA Module__ — JavaScript module defined by ECMAScript
- __Application Module__ — application logic of a composite

## Composite Binding
Composite binding connects a view with its application module. The runtime
establishes this connection for a composite and provides synchronization between
view elements and module properties, event forwarding and method invocation. It
does not define the internal structure or architectural role of the application
module. The binding is associated with the composite ID and follows the
composite lifecycle.

## Declarative Concepts

### Declarative Markup
Declarative Markup provides additional attributes that can be used on HTML
elements. These attributes define runtime behavior such as conditional
rendering, event handling, synchronization and resource loading.

The markup describes the structure and behavior of the view, while application
logic remains in the application module.

### Expression Language
The expression language allows expressions to be used in HTML markup and
attribute values. Expressions can access application modules, JavaScript values
and functions. The runtime evaluates these expressions during rendering and
uses their results to update the view.

## Runtime Model

### Lifecycle
The runtime manages the lifecycle of a Composite from loading its resources
through binding and rendering to its removal. During this lifecycle, the runtime
creates and connects the composite, processes its View and application module,
and removes their runtime connections when the composite is detached.

Application modules can react to lifecycle events by subscribing to events or
using interceptors. Both mechanisms allow application modules to respond to
lifecycle changes, but neither can control the lifecycle or influence rendering.

### Rendering
Rendering updates the view based on the current application state. During this
process, the runtime evaluates expressions and processes declarative markup to
create or update the corresponding parts of the document. Rendering can be
triggered explicitly or, when reactivity is enabled, automatically by changes
to reactive data.

### Reactivity
Reactivity connects changes in application data with updates to dependent views.
When a reactive object changes, the runtime is notified and can update views
that use the affected values in their expressions. Reactive rendering is
optional and can be combined with explicit rendering.

### Routing
Routing controls navigation between Views within an application. Routes are
based on paths that identify Views and their hierarchy. The Runtime uses these
paths to manage the active Views and the corresponding Composites.

## System Model
A Composite brings together a view, an application module and their associated
resources under a __composite ID__. The runtime loads and manages these
resources as a __composite Module__ and connects the View and application module
through composite binding.

Multiple composites can be combined into __Components__, while __ECMA Modules__
provide JavaScript modularization independently of the composite system. The
runtime provides the infrastructure for managing these elements throughout their
lifecycle.



- - -
&#9665; [Introduction](introduction.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
