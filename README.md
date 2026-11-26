<p>
  <!-- 
  <a href="https://github.com/seanox/composite-js/pulls"
      title="Development is waiting for new issues / requests / ideas"
    ><img src="https://img.shields.io/badge/development-passive-blue?style=for-the-badge"
  ></a>
  -->
  <a href="https://github.com/seanox/composite-js/pulls"
    ><img src="https://img.shields.io/badge/development-active-green?style=for-the-badge"
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
- __Declarative HTML and Expressions__  
  HTML attributes control conditions, iteration, imports and rendering.
  JavaScript expressions in text nodes and attributes access application data
  and browser APIs. Attribute directives and property expressions control
  assignment to native attributes and DOM properties during rendering.
- __Runtime Composition__  
  Composites are application units consisting of HTML with optional CSS,
  JavaScript and additional resources. At runtime, resources are loaded within
  the application context and views are composed in the shared DOM, without an
  application compilation step.
- __Reactive Rendering__  
  Reactive is a data bridge between application logic and the view. Rendering
  tracks dependencies; changes through reactive proxies trigger asynchronous
  updates of affected parts of the view.
- __Runtime Events and Extensions__  
  Events for DOM changes, rendering, binding, module lifecycle and errors.
  Callbacks for custom tags, selectors and rendering interceptors extend markup
  processing.
- __Test API and Browser Automation__  
  Browser-based unit, integration and UI tests with assertions, simulated input
  and lifecycle events for test automation with tools such as Playwright.
- __Composite Binding__  
  Binds views to application modules, with value synchronization, validation,
  event handlers and lifecycle callbacks. The runtime does not prescribe an
  application architecture.
- __Routing__  
  Paths control navigation through nested composites (view flow), with view
  permissions and interceptors.
- __Internationalization and Localization__  
  Resource bundles for application-wide and module-specific messages, with
  locale selection, key-based access and parameterized text.
- __Scripting and Scopes__  
  JavaScript in composites loads modules, collects exports and publishes named
  application objects. This JavaScript and expressions in markup use an
  execution context with access to persistent view and application scopes.
- __XML DataSource__  
  Immutable XML data source for static application data, with locales, XPath
  queries, aggregation of multiple sources and XSLT transformations.
  
# Manuals
- [Motivation](https://seanox.github.io/composite-js/manuals/motivation.html)
- [Getting Started](https://seanox.github.io/composite-js/manuals/getting-started.html)
- [Tutorials](https://seanox.github.io/composite-js/tutorials/)
- [Manuals](https://seanox.github.io/composite-js/manuals/)

# Demos
- [Micro-Frontend](
      https://seanox.github.io/composite-js/tutorials/micro-frontend/Step_07%20Business%20logic%20in%20detail/)
- [Single Page Application](
      https://seanox.github.io/composite-js/tutorials/single-page-application/Step_14%20Composites%20-%20Example%20for%20dynamic%20table%20with%20CSV%20download/) 

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
  Engines (tested): Blink, Gecko, Goanna, LibWeb, WebKit
- Web server for hosting

# Downloads
<p>
  <a href="https://github.com/seanox/composite-js/actions/workflows/on-push-master-playwright-test.yaml"
    ><img src="https://img.shields.io/github/actions/workflow/status/seanox/composite-js/on-push-master-playwright-test.yaml?branch=master&style=for-the-badge&label=Blink&labelColor=555555"
  ></a>
  <a href="https://github.com/seanox/composite-js/actions/workflows/on-push-master-playwright-test.yaml"
    ><img src="https://img.shields.io/github/actions/workflow/status/seanox/composite-js/on-push-master-playwright-test.yaml?branch=master&style=for-the-badge&label=Gecko&labelColor=555555"
  ></a>
  <a href="https://github.com/seanox/composite-js/actions/workflows/on-push-master-playwright-test.yaml"
    ><img src="https://img.shields.io/github/actions/workflow/status/seanox/composite-js/on-push-master-playwright-test.yaml?branch=master&style=for-the-badge&label=WebKit&labelColor=555555"
  ></a>
  <a href="https://codecov.io/github/seanox/composite-js"
    ><img src="https://img.shields.io/codecov/c/github/seanox/composite-js?style=for-the-badge&label=Codecov&labelColor=555555"
  ></a>
</p>

[Seanox composite-js 2.0.0](https://github.com/seanox/composite-js/releases/download/2.0.0/composite-js-2.0.0.zip)  
[Seanox composite-js 2.0.0 Sources](https://github.com/seanox/composite-js/archive/refs/tags/2.0.0.zip)

# Release Channels
The release channels continuously provide the latest final versions.

## Version 2.0.0
- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js.js  
  __for deployment without Test API__

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-max.js  
  __for deployment without Test API__ not minimized and with comments

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing.js  
  for development and testing

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing-max.js  
  for development and testing not minimized and with comments

# Changes
## 2.0.0 20260829  
BF: Build: Optimizing npm access  
BF: Build: Correction of the missing jsdelivr default  
BF: Composite: Correction of the registration of the HTTP events  
BF: Documentation: Update of content  
BF: DataSource: Correction when fetch text nodes  
CR: Composer: Refactoring the rendering  
CR: Documentation: Using GitHub Pages  
CR: Scripting: Omission of macro #module  
CR: Test: Expansion of benchmarks/tests  
CR: Tutorials: Integration into the project  
CR: Project: Renamed to composite-js  
CR: Project: Refactoring after renaming to composite-js  

[Read more](https://raw.githubusercontent.com/seanox/composite-js/master/CHANGES)

# Contact
[Issues](https://github.com/seanox/composite-js/issues)  
[Requests](https://github.com/seanox/composite-js-tutorial/pulls)  
[Mail](http://seanox.com/contact)
