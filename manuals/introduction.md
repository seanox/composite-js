&#9665; [Motivation](motivation.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#introduction)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
- - -

# Introduction

## What is Seanox aspect-js?
Seanox aspect-js is a browser-native application runtime for single-page
applications (SPAs) and micro-frontends.

Applications consist of HTML, CSS and JavaScript resources that the runtime
loads, connects and manages. Native browser technologies are extended with
declarative application concepts such as expression language, component
composition, view-module binding, routing and reactive rendering without
requiring compilation.

The programming model applies established enterprise UI concepts—originally from
frameworks like JavaServer Faces (JSF)—directly to the browser while preserving
HTML as the primary view language and JavaScript as the application language.
Inspired by microservice architectures, Seanox aspect-js applies these concepts
to micro-frontends, allows frontend applications to be structured as
independent, composable modules that can be deployed at runtime.

## Design Principles

### Browser-native Execution
Seanox aspect-js runs directly in the browser and uses standard web technologies
as the foundation. Applications consist of HTML, CSS and JavaScript resources
that are loaded and connected at runtime. The runtime does not require a
compilation step to execute an application.

### HTML as View Language
HTML remains the primary language for describing the user interface. The runtime
extends HTML with declarative attributes and expressions that control rendering,
interaction, component usage and data access, while application logic remains
implemented in JavaScript modules.

### Application Modules
Applications are structured into Application Modules. The runtime connects their
resources and manages their lifecycle.

The architectural role of an Application Module depends on its implementation.

### Architecture Neutrality
Seanox aspect-js does not prescribe an application architecture. The runtime
connects views with Application Modules without determining their internal
responsibilities or requiring a specific pattern such as MVC, MVVM or MVCS.

The architectural role of a module is defined by its implementation within the
application.

### Separation of Runtime and Application Logic
The runtime provides mechanisms required for application execution, including
resource loading, component management, View-Module Binding, rendering,
reactive updates, routing and lifecycle handling. Application-specific
behavior, business logic and domain logic are implemented by application
components.

### View-Module Binding
The runtime connects a View with its corresponding Application Module. This
connection provides synchronization, event forwarding, module method invocation
and lifecycle integration.

The binding mechanism does not assume whether the module represents a ViewModel,
Controller, Service or another architectural role.

### Separation of Application State and Domain Data
Application state and domain data represent different concerns. UI-specific
state belongs to the Application Module or its presentation logic, while Domain
Models represent application-specific data and rules.

Domain Models are not used as containers for UI state such as selection,
visibility or presentation status.

## Core Concepts

### Application Module
An Application Module is the basic structural unit of an aspect-js application
and typically consists of HTML for the view, CSS for styling, JavaScript for
application-specific behavior and optional additional resources. The runtime
connects these parts and manages their lifecycle. JavaScript modules execute in
an isolated module scope. Objects that participate in View-Module Binding are
explicitly exported to the runtime.

The term Application Module describes the structure of an application unit and
does not define a specific architectural role. Depending on the application
design, a module can implement different roles such as ViewModel, Controller,
Application Model or Service.

### Composite
A Composite represents the association between an HTML element and an
Application Module. It is identified by an ID, which is used to resolve the
associated HTML, CSS, and JavaScript resources. The runtime automatically loads
these resources, establishes the View–Module binding, and manages the Composite
lifecycle. Application Modules may participate in this lifecycle through
lifecycle callbacks when a Composite is attached to or detached from the
document.

### View
A View is the user interface representation of an Application Module and is
implemented using HTML. It defines the structure and presentation of the user
interface and can use expressions and declarative attributes to access
application data, handle interactions and control rendering behavior.

Application logic is not defined by the View but by the associated Application
Module.

### View-Module Binding
View-Module Binding connects a View with its corresponding Application Module.
The runtime establishes this connection within a Composite and provides
synchronization between view elements and module properties, event forwarding
and invocation of module methods.

The binding mechanism connects the View and the Application Module without
defining the architectural role of the module.

### Expression Language
The Expression Language provides access to JavaScript expressions within HTML
markup and attribute values. Expressions can access application modules,
JavaScript values and functions, while the runtime evaluates them during
rendering and uses the results to generate or update the View.

### Declarative Markup
Declarative Markup extends HTML with aspect-js attributes that define runtime
behavior directly on HTML elements, including component declaration, conditional
rendering, event handling, synchronization and resource loading.

The markup describes the structure and behavior of the View, while application
logic remains implemented in JavaScript modules.

### Rendering
Rendering updates the View based on the current application state. During
rendering, the runtime evaluates expressions and processes declarative markup to
generate or update the corresponding parts of the document.

Rendering operations can trigger updates explicitly. Reactive data changes can
trigger them automatically.

## Reactivity
Reactivity connects changes in application data with updates of dependent views.
Reactive objects notify the runtime when values change, allowing the runtime to
update views that use these values in their expressions.

Reactive rendering is an optional mechanism and can be combined with explicit
rendering.

## Routing
Routing controls navigation between views within an application. Routes are
based on paths that identify views and their hierarchy, and the runtime uses
this information to manage the active view flow and the visibility of
corresponding composites.

## Runtime
The Application Runtime provides the infrastructure required to execute
applications built with Seanox aspect-js, including resource loading, component
management, View-Module Binding, rendering, reactive updates, routing and
lifecycle handling.

The runtime does not implement application-specific behavior or define the
architectural role of Application Modules.

## Documentation Structure
The documentation is organized into sections that describe Seanox aspect-js from
different perspectives. The sections are grouped by concepts, application
structure, runtime behavior and development topics.

The [Introduction](README.md#introduction) describes the basic concepts and
terminology used throughout the documentation.

The [Language](README.md#language) section describes the declarative and
scripting capabilities used to define application behavior. It covers the
Expression Language, Markup and Scripting features that are used to describe
views, interactions and application logic.

The [Components](README.md#components) section describes the structural building
blocks of an application, including loading, rendering, reactivity,
View-Module Binding and Routing.

The [Runtime](README.md#runtime) section describes the infrastructure provided
during application execution. It covers data access, resource handling, events
and runtime extensions that support the execution of components and modules.

The [Development](README.md#development) section describes tools and processes
related to application development, testing and project maintenance.

Each section focuses on a specific aspect of the framework. Concepts introduced
in earlier sections are used as a foundation for the more detailed descriptions
in later sections.



- - -
&#9665; [Motivation](motivation.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#introduction)
&nbsp;&nbsp;&nbsp;&nbsp; [Getting Started](getting-started.md) &#9655;
