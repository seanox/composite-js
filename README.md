<p>
  <a href="https://github.com/seanox/aspect-js/pulls"
      title="Development is waiting for new issues / requests / ideas"
    ><img src="https://img.shields.io/badge/development-passive-blue?style=for-the-badge"
  ></a>  
  <a href="https://github.com/seanox/aspect-js/issues"
    ><img src="https://img.shields.io/badge/maintenance-active-green?style=for-the-badge"
  ></a>
  <a href="http://seanox.de/contact"
    ><img src="https://img.shields.io/badge/support-active-green?style=for-the-badge"
  ></a>
</p>

# Description
Seanox aspect-js is a browser-native application runtime for single-page
applications (SPAs) and micro-frontends.

Applications remain composed of HTML, CSS and JavaScript resources that are
loaded, connected and managed by the runtime. Native browser technologies are 
extended with declarative application concepts such as expression language,
component composition, view-module binding, routing and reactive rendering
without requiring compilation.

The programming model applies established enterprise UI concepts such as
declarative views, expression language, component composition and view-module
binding directly in the browser while preserving HTML as the primary view
language and JavaScript as the application language.

__Recommendations for UI frameworks:__
- https://bulma.io/
- https://picocss.com/
- https://vanillaframework.io/
- https://fomantic-ui.com/
- https://getbootstrap.com/
- https://getuikit.com/

# Features
- __HTML and JavaScript Integration__  
  Uses component resources consisting of HTML, CSS and JavaScript as primary
  application modules and can be combined with other JavaScript frameworks,
  provided their functionality and syntax do not overlap.
- __Declarative Markup__  
  Extends HTML with declarative attributes, expressions and runtime processing
  for conditions, iteration, rendering, validation, events and related
  operations.
- __Expression Language__  
  Provides expressions in markup with access to JavaScript functionality and
  application modules.
- __Component-Based Architecture__  
  Provides components composed of markup, styles, scripts and additional
  resources.
- __View-Module Binding__  
  Connects HTML elements with JavaScript modules for synchronization of values,
  states and events in architectures such as __MVC__, __MVVM__ and __MVCS__.
- __Reactive Rendering__  
  Updates affected parts of the view when reactive data objects change.
- __Modular Resources and Runtime Imports__  
  Supports namespaces, modules, macros and loading of component resources at
  runtime.
- __Routing and View Flow__  
  Organizes views through paths, navigation, interceptors and permission
  concepts.
- __Resource Bundles__  
  Provides externalized messages and support for internationalization (i18n) and
  localization (l10n).
- __XML Data Source__  
  Provides an immutable XML-based data source with querying and transformation
  capabilities using XPath and XSLT.
- __Single-Page Applications and Micro-Frontends__  
  Provides runtime concepts for structuring applications as modular browser
  applications.
- __Test Environment__  
  Provides APIs for implementing and executing unit and integration tests.
  
# Manuals
- [Getting Started](https://github.com/seanox/aspect-js/blob/master/manuals/introduction.md#introduction)
- [Tutorials](https://github.com/seanox/aspect-js/tree/master/tutorials#readme)
- [Manuals](https://github.com/seanox/aspect-js/tree/master/manuals#readme)

# Demos
- [Micro-Frontend](
      https://seanox.github.io/aspect-js/tutorials/micro-frontend/Step_07%20Business%20logic%20in%20detail/)
- [Single Page Application](
      https://seanox.github.io/aspect-js/tutorials/single-page-application/Step_14%20Components%20-%20Example%20for%20dynamic%20table%20with%20CSV%20download) 

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
  Engines (tested): Blink, Gecko, Goanna, WebKit, ...  
- Web server for hosting

# Downloads
<p>
  <img src="https://img.shields.io/badge/Blink-tested-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Gecko-tested-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Goanna-tested-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/WebKit-tested-green?style=for-the-badge">
</p>

[Seanox aspect-js 1.9.0](https://github.com/seanox/aspect-js/releases/download/1.9.0/aspect-js-1.9.0.zip)  
[Seanox aspect-js 1.9.0 Sources](https://github.com/seanox/aspect-js/archive/refs/tags/1.9.0.zip)

# Release Channels
The release channels continuously provide the latest final versions.

## Version 1.9.0
- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js.js  
  __for deployment without Test API__

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-max.js  
  __for deployment without Test API__ not minimized and with comments

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-testing.js  
  for development and testing

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-testing-max.js  
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

[Read more](https://raw.githubusercontent.com/seanox/aspect-js/master/CHANGES)

# Contact
[Issues](https://github.com/seanox/aspect-js-tutorial/issues)  
[Requests](https://github.com/seanox/aspect-js-tutorial/pulls)  
[Mail](http://seanox.com/contact)
