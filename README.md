<p>
  <a href="https://github.com/seanox/composite-js/pulls"
      title="Development is waiting for new issues / requests / ideas"
    ><img src="https://img.shields.io/badge/development-passive-blue?style=for-the-badge"
  ></a>  
  <a href="https://github.com/seanox/composite-js/issues"
    ><img src="https://img.shields.io/badge/maintenance-active-green?style=for-the-badge"
  ></a>
  <a href="http://seanox.com/contact"
    ><img src="https://img.shields.io/badge/support-active-green?style=for-the-badge"
  ></a>
</p>

# Description
Seanox composite-js is a browser-native application runtime for single-page
applications (SPAs) and micro-frontends.

Applications use the browser's programming model. HTML remains the primary view
language, extended with expression language and binding to application logic;
JavaScript remains the primary application language, extended with Routing and
reactive rendering; CSS defines the presentation.

The runtime combines component-based composition and declarative UI to organize
applications into modules, each containing a view, application logic and
resources. These modules are composed into an application at runtime, without
compilation.

__Recommended CSS/UI frameworks:__
- https://picocss.com/
- https://bulma.io/
- https://getbootstrap.com/
- https://vanillaframework.io/
- https://getuikit.com/
- https://fomantic-ui.com/
- https://w3schools.com/w3css/
- https://patternfly.org/ (CSS/HTML only)

Recommended are __CSS-only__, __CSS-first__ and __HTML-first__ UI toolkits that
provide styling and optional UI components without replacing HTML or managing
rendering, component lifecycle or application state.

# Features
- __Composite__  
  Modular application unit with its own identity, consisting of HTML, CSS,
  JavaScript and additional resources, composed at runtime.
- __Runtime Composition__  
  Composite resources are resolved and loaded by the runtime, which realizes the
  composite within a concrete DOM context -- without compilation.
- __Expression Language__  
  Expressions in markup provide access to client-side JavaScript, such as
  application data and the application module.
- __Composite Binding__  
  Connects the view with the application module, without an additional wiring
  layer.
- __Reactive Rendering__  
  Updates the affected parts of the view when reactive application data changes.
- __Routing__  
  Declarative routing through paths (view flow), based on nested composites,
  with navigation, permission checks and interceptors.
- __Architecture Neutrality__  
  The runtime provides the infrastructure for structuring and composing
  applications, without prescribing a specific application architecture such as
  MVC, MVCS or MVVM.
- __DataSource__  
  Immutable XML data source for static application data, with locales, querying
  and transformation via XPath and XSLT.
- __Resource Bundle__  
  DataSource extension for internationalization (i18n), localization (l10n) and
  other client-related texts, based on key-value entries.
- __Test API__  
  API and runtime environment for integration and unit tests, with mechanisms
  for automated execution and simulated user input.
  
# Manuals
- [Getting Started](https://seanox.github.io/composite-js/manuals/getting-started.html)
- [Tutorials](https://seanox.github.io/composite-js/tutorials/)
- [Manuals](https://seanox.github.io/composite-js/manuals/)

# Demos
- [Micro-Frontend](
      https://seanox.github.io/composite-js/tutorials/micro-frontend/Step_07%20Business%20logic%20in%20detail/)
- [Single Page Application](
      https://seanox.github.io/composite-js/tutorials/single-page-application/Step_14%20Components%20-%20Example%20for%20dynamic%20table%20with%20CSV%20download/) 

# License Terms
Seanox Software Solutions is an open-source project, hereinafter referred to as
__Seanox__.

This software is licensed under the __Apache License, Version 2.0__.

__Copyright (C) 2026 Seanox Software Solutions__

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

# System Requirement
- ECMAScript 6 support or higher (normally the current browsers)  
  Engines (tested): Blink, Gecko, Goanna, WebKit
- Web server for hosting

# Downloads
<p>
  <img src="https://img.shields.io/badge/Blink-tested-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Gecko-tested-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Goanna-tested-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/WebKit-tested-green?style=for-the-badge">
</p>

[Seanox composite-js 1.9.0](https://github.com/seanox/composite-js/releases/download/1.9.0/composite-js-1.9.0.zip)  
[Seanox composite-js 1.9.0 Sources](https://github.com/seanox/composite-js/archive/refs/tags/1.9.0.zip)

# Release Channels
The release channels continuously provide the latest final versions.

## Version 1.9.0
- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js.js  
  __for deployment without Test API__

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-max.js  
  __for deployment without Test API__ not minimized and with comments

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing.js  
  for development and testing

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing-max.js  
  for development and testing not minimized and with comments

# Changes
## 1.9.0 20260717  
BF: Composite: Validation corrections and optimization  
BF: DataSource: Correction for the use of locator/path with (sub)directories  
BF: DataSource: Correction of the method fetch when using the cache  
BF: Extensions: Correction of window.location.contextPath  
BF: Routing: Correction / workaround if the hashchange event is missing  
CR: Composite: Switch to microtasks-based scheduling  
CR: Composite: Renaming Composite.asynchron to Composite.asynchronous  
CR: Composite: Renaming Markup Hardening to Markup Protection  
CR: DataSource: Optimization and extension  
CR: Markup: iterate also supports numbers  
CR: Markup: import / output optimization and extension for DateSource  
CR: Message: Optimization and extension  
CR: Test: Update web server to version 5.9.0  

[Read more](https://raw.githubusercontent.com/seanox/composite-js/master/CHANGES)

# Contact
[Issues](https://github.com/seanox/composite-js/issues)  
[Requests](https://github.com/seanox/composite-js-tutorial/pulls)  
[Mail](http://seanox.com/contact)
