&#9665; [Markup](markup.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite](composite.md) &#9655;
- - -

# Scripting
Seanox composite-js executes composite scripts as JavaScript in a separate
function scope. The runtime provides helper functions for loading modules,
collecting module exports, performing __object publication__ and creating
__namespaces__ -- these are object structures rooted in `window`, which are
referred to below as namespaces. Object publication makes an object available
under a name in that global structure; the result is a __named application
object__.

Variables, constants and functions declared in a script remain local to that
script. Module exports make selected properties available to `require`; object
publication makes the original object globally addressable by name. Runtime
values are evaluated in the [Execution-Scope](architecture.md#execution-scope).
Their lifetime and sharing behavior is summarized in the [scope overview](
    architecture.md#scopes).

## Contents Overview
- [Embedded Composite Script](#embedded-composite-script)
- [Modules](#modules)
- [API](#api)
  - [expose](#expose)
  - [require](#require)
  - [use](#use)
  - [attempt](#attempt)
- [Debugging](#debugging)

## Embedded Composite Script
Embedded scripting has specific runtime behavior. Standard scripts are executed
automatically by the browser and independently of rendering. Markup for
rendering therefore supports the additional script type `composite/javascript`.
It uses normal JavaScript, but the browser does not recognize it as
`text/javascript` and does not execute it directly. The composer recognizes the
JavaScript code and executes it in every relevant render cycle. This allows
&lt;script&gt; elements to be combined with declarative attributes such as
`condition` to control execution.

```html
<script type="composite/javascript">
    ...
</script>
```

Embedded Composite scripts run in the current [execution-scope](
    architecture.md#execution-scope). They access the view- and application
scope through `view` and `application`. View scope variables are passed to the
script as values; use `view` to persist changes within the current view. Use
`application` for values shared across Composites.

## Modules
Separately stored [composite scripts](composite.md#javascript) and standalone
JavaScript modules are located in the module directory, optionally in
subdirectories. A composite script can provide the application module of a
composite; standalone script modules can provide shared code without a
composite.

```
+ modules
  + example
    + io
      - api.js
      - connector.js
- index.html
```

Use `Composer.include(...)` for composite modules and `Composer.load(...)` for
specific resources; from a composite script, prefer [`require(...)`](#require)
for JavaScript modules.

## API
Composite scripts run in a separate function scope with a runtime-provided
context. It contains the current view-scope values, the `view` and `application`
objects, and helper functions for loading modules, handling optional errors,
creating namespaces and performing object publication.

### expose
`expose(object)` collects the object's own enumerable string-keyed properties as
flat exports of the current script. It returns the original object; repeated
calls replace exports with matching names. Collected exports are available to
scripts that load this module with `require(...)`. The argument must be a
non-null object; functions and primitive values are rejected. This form does not
perform [object publication](architecture.md#object-publication).

```javascript
const properties = {...};
const builder = {...};
const request = {...};

expose({properties, builder, request});
```

With `expose(object, namespace)`, the runtime additionally performs __Object
Publication__: the original object becomes a __Named Application Object__ at the
specified dot-separated path in the object structure rooted at `window`. Its
identity is preserved. Use this form to make an object available for
[composite binding](composite-binding.md#composite-binding); collecting module
exports alone does not create a named application object. Named application
objects can also provide shared services, state, or configuration independently
of a composite. Missing namespace levels are created. A namespace must use ASCII
identifier segments; existing `null` or primitive intermediate values and failed
assignments cause an error.

```javascript
const login = {
    validate(element, value) {
    },
    logon: {
        onClick(event) {
        }
    }
};

expose(login, "login");
```

### require
`require(path)` loads a JavaScript module from the module directory and returns
one exports object, which can contain multiple values or objects. The path uses
`/` for subdirectories and omits the `.js` extension. A module is executed only
once; later calls return its cached exports.

```javascript
const connector = require("example/io/connector");
const {properties, builder, request} = require("example/io/api");
```

### use
`use(namespace)` creates the dot-separated namespace on `window` if it does not
already exist. Repeated calls leave an existing namespace in place.

```javascript
use("a");
use("a.b.c");
```

### attempt
`attempt(value)` returns a non-function value unchanged. For a function, it
invokes the callback synchronously with `window` as `this`; if the callback
throws, `attempt(...)` returns `undefined`. Promise rejections are not handled.

```javascript
const value = attempt(() => object.that.does.not.exist());
```

## Debugging
When loading composite scripts, the runtime supplies their module path as a
`sourceURL` directive:

```javascript
//# sourceURL=/modules/example/module.js
```

This allows browser DevTools to expose the dynamically executed script as a
source in the sources panel. Composite scripts can therefore be opened,
searched, and debugged with breakpoints and the Debugger like regular JavaScript
sources.



- - -
&#9665; [Markup](markup.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite](composite.md) &#9655;
