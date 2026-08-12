&#9665; [Motivation](motivation.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#introduction)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
- - -

# Introduction

## What is Seanox aspect-js?
Seanox aspect-js is a browser-native __runtime__ for Single-Page Applications
(SPAs) and micro-frontends.

Applications consist of HTML, CSS, JavaScript and other resources that the
runtime loads, connects and manages. Native browser technologies are extended
with declarative application concepts such as expression language,
__composites__, __composite binding__, routing and reactive rendering without
requiring compilation.

The programming model brings established enterprise UI concepts, as used by
frameworks such as JavaServer Faces (JSF), directly to the browser while
preserving HTML as the primary view language and JavaScript as the application
language.

Inspired by microservice architectures, Seanox aspect-js applies these concepts
to micro-frontends and allows frontend applications to be structured as
independent, composable units that can be loaded and deployed as runtime
modules.

## Design Principles

### Browser-native Execution
Seanox aspect-js runs directly in the browser and uses standard web technologies
as the foundation. Applications consist of HTML, CSS and JavaScript and other
resources that are loaded and connected at runtime. The runtime does not require
a compilation step to execute an application.

### HTML as View Language
HTML remains the primary language for describing the user interface. The runtime
extends HTML with declarative attributes and expressions that control rendering,
interaction, composite usage and data access, while application logic remains
implemented in JavaScript.

### Composite Scripts / Application Modules
Applications are structured into __composites__, which contain __composite
scripts__ providing the logic of the application. These scripts take the role of
an __application module__, whose architectural responsibilities are not
predefined: they may implement any structure (object, function, class) and any
responsibility (ViewModel, Controller, Service, etc.).

### Architecture Neutrality
Seanox aspect-js does not prescribe the internal architecture of an application 
module. The runtime connects HTML views with composite scripts without
determining their internal responsibilities or requiring a specific pattern such
as MVC, MVVM or MVCS. The architectural role of a Composite Script is defined
solely by its implementation.

### Separation of Runtime and Application Logic
The runtime provides mechanisms required for application execution, including
resource loading, composite management, Composite Binding, rendering, reactive
updates, routing and lifecycle handling. Application-specific behavior, business
logic and domain logic are implemented inside composite scripts.

### Composite Binding
The runtime connects a Composite’s HTML view with its corresponding application
module, providing synchronization, event forwarding, method invocation and
lifecycle integration, without assuming any predefined architectural role for
the application module.

### Separation of Application State and Domain Data
Application state and domain data represent different concerns. UI‑specific
state belongs to the Application Module or its presentation logic, while domain
models represent domain‑specific data and rules. Domain models are not used as
containers for UI state such as selection, visibility or presentation status.

## Documentation Structure
The documentation is organized into sections that describe Seanox aspect-js from
different perspectives. The sections are grouped by concepts, application
structure, runtime behavior and development topics.

The [Introduction](README.md#introduction) describes the basic concepts and
terminology used throughout the documentation.

The [Architecture](README.md#architecture) section describes the structural and
technical foundation of Seanox aspect-js. It defines the core concepts of the
composite system, including composite, composite module, application module,
composite ID and composite binding, and explains how these elements interact
within the runtime.

The [Language](README.md#language) section describes the declarative and
scripting capabilities used to define application behavior. It covers the
expression language, markup and scripting features used to describe views,
interactions and application logic.

The [Components](README.md#components) section describes the structural building
blocks of an application, including loading, rendering, reactivity, composite
binding and routing.

The [Runtime](README.md#runtime) section describes the infrastructure provided
during application execution. It covers data access, resource handling, events
and runtime extensions that support the execution of composites and application
modules.

The [Development](README.md#development) section describes tools and processes
related to application development, testing and project maintenance.

Each section focuses on a specific aspect of the framework. Concepts introduced
in earlier sections are used as a foundation for more detailed descriptions in
later sections.



- - -
&#9665; [Motivation](motivation.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#introduction)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
