&#9665; [Motivation](motivation.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#introduction)
&nbsp;&nbsp;&nbsp;&nbsp; [Architecture](architecture.md) &#9655;
- - -

# Introduction
Seanox composite-js is a browser application runtime for composing loosely
coupled, domain-oriented application units at runtime. It is intended for
Single-Page Applications and micro-frontends and combines established concepts
and principles of web applications with declarative UI concepts.

The framework uses the browser's native programming model. HTML is the primary
view language, JavaScript is the primary application language, and CSS defines
the presentation. Applications do not require compilation, although an optional
build process can be used for packaging, optimization, or deployment.

## Contents Overview
- [Overview](#overview)
- [Composing Modules at Runtime](#composing-modules-at-runtime)
- [Declarative UI Concepts](#declarative-ui-concepts)
- [Composite Binding](#composite-binding)
- [Rendering](#rendering)
- [Design Principles](#design-principles)
  - [Browser's Native Programming Model](#browsers-native-programming-model)
  - [Declarative Application Model](#declarative-application-model)
  - [HTML as the Primary View Language](#html-as-the-primary-view-language)
  - [JavaScript as the Primary Application Language](#javascript-as-the-primary-application-language)
  - [Composing Modules at Runtime](#composing-modules-at-runtime-1)
  - [Architecture Neutrality](#architecture-neutrality)
  - [Without Compilation](#without-compilation)
  - [Optional Build Process](#optional-build-process)
- [Summary](#summary)

## Overview
Frontend applications are increasingly structured around business domains and
partitioned into loosely coupled software modules. Seanox composite-js provides
a browser application runtime that composes such modules into applications at
runtime.

The framework treats an application as a composition of independently identified
application units called Composites. Each Composite combines a declarative view,
application logic, and the resources required for its realization within the
DOM. The runtime resolves these resources, connects them with a concrete DOM
context, and realizes the resulting Composite in the browser.

## Composing Modules at Runtime
The central idea of _composite-js_ is the composition of application units at
runtime. An application is partitioned into loosely coupled Composites, each
with its own identity, resources, view, application logic, and runtime
representation. That identity is the Composite ID, declared in the markup and
used by the runtime as the reference for every relationship of a Composite.

The runtime resolves and loads these resources and realizes each Composite
within a concrete DOM context, so composition is part of the running
application rather than exclusively a build-time operation. Accordingly, the
DOM is not merely the output of the application but also part of its running
state, interpreted and processed by the runtime.

## Declarative UI Concepts
Seanox composite-js combines the browser's native programming model with
declarative UI concepts such as views and Expressions. A view describes the
declarative presentation of a Composite, defined by markup and styled by CSS.
The corresponding application logic is provided by an application module and
made available to the view through Expressions and Composite binding.

## Composite Binding
Composite binding connects the view with explicitly exported objects of the
application module. It is established by the runtime while a Composite is
realized, so the view can access application logic without an additional wiring
layer.

## Rendering
Rendering is the process by which the runtime transforms the declarative model
into its running state, both for the initial realization of a Composite and for
later updates.

These concepts, their responsibilities, and their relationships are defined in
full detail in [Architecture](architecture.md).

## Design Principles
The following principles characterize how _composite-js_ approaches application
development.

### Browser's Native Programming Model
Applications use the native programming model of the browser. HTML, JavaScript,
CSS, the DOM, and standard ECMAScript mechanisms remain the technical
foundation, while _composite-js_ adds the runtime mechanisms required for
composition.

### Declarative Application Model
Application structure and presentation are described declaratively in the DOM.
Markup can represent Composites, relationships, Expressions, and runtime
instructions in addition to visual content. The DOM is therefore part of the
running program state processed by the runtime.

### HTML as the Primary View Language
A view uses regular markup together with the declarative concepts and
instructions processed by the runtime. CSS defines its presentation.

### JavaScript as the Primary Application Language
Application logic is implemented in JavaScript. A Composite script establishes
the application module of a Composite, but the runtime does not prescribe how
that application module must be structured internally.

### Composing Modules at Runtime
Composition is part of the running application model rather than exclusively a
build-time operation, as described in [Composing Modules at Runtime](
    #composing-modules-at-runtime).

### Architecture Neutrality
The framework provides mechanisms for structuring and composing applications
without enforcing a specific application architecture. Composites can represent
business domains, technical concerns, or other application structures.

### Without Compilation
The fundamental programming and execution model does not require compilation.
Composite-specific relationships and instructions are processed by the runtime
in the browser.

### Optional Build Process
A build process can be used for packaging, optimization, or deployment, but it
does not define the semantics of the application model. The relationships
between Composite, Composite module, view, application module, composer, and
runtime remain independent of such a process.

## Summary
Seanox composite-js is a browser application runtime for Single-Page
Applications and micro-frontends. It structures applications as compositions of
independently identified Composites, each of which combines a declarative view,
application logic, and associated resources within a DOM context.

Applications are composed at runtime, use the native programming model of the
browser, and do not require compilation. The framework provides these mechanisms
without enforcing a specific application architecture.



- - -
&#9665; [Motivation](motivation.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#introduction)
&nbsp;&nbsp;&nbsp;&nbsp; [Architecture](architecture.md) &#9655;
