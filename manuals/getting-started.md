&#9665; [Architecture](architecture.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Expression Language](expression.md) &#9655;
- - -

# Getting Started

## Contents Overview
- [Prerequisites](#prerequisites)
- [Choose a Runtime Variant](#choose-a-runtime-variant)
- [First Composite](#first-composite)
- [How the Example Is Realized](#how-the-example-is-realized)
- [Optional Next Step: Reactive Application Data](
      #optional-next-step-reactive-application-data)
- [Learning Path](#learning-path)
  - [Micro-Frontend](
        https://seanox.github.io/composite-js/tutorials/#micro-frontend)
  - [SPA (Single Page Application)](
        https://seanox.github.io/composite-js/tutorials/#spa-single-page-application)

## Prerequisites
- Browser with ECMAScript 6 support or higher
- Web server for hosting (required for runtime loading of modules, resources,
  and data)

## Choose a Runtime Variant
The runtime consists of one JavaScript file. It can be included through a
release-channel URL or downloaded as a release.

Release channels continuously provide the latest final major versions.

Each release provides versions for different purposes. These versions are
available in two variants. The standard variant is minified for production
environments. The unminified and documented max variant is available for
development and debugging.

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js.js  
  __for deployment without Test API__

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-max.js  
  __for deployment without Test API__ unminified and with comments

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing.js  
  for development and testing

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing-max.js  
  for development and testing unminified and with comments

## First Composite
Create `index.html` and declare a composite:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing-max.js"></script>
  </head>
  <body>
    <section id="example" composite></section>
  </body>
</html>
```

The combination of the `composite` attribute and the `id` attribute defines the
composite ID, in this case `example`.

Create the resources of the composite module:

```
+ modules
  - example.css
  - example.js
  - example.html
- index.html
```

The runtime automatically loads the resources associated with the composite ID
from `modules`. Individual resources are optional.

Implement the composite script in `modules/example.js`:

```
const example = {
    message: "",
    validate(element, value) {
        return true;
    }
};

expose(example, "example");
```

`modules/example.js` is the executable composite script; the published `example`
object is the application module that provides application logic at runtime.
`expose(example, "example")` makes the object available as `window.example` for
composite binding.

The example's object structure does not prescribe an application architecture.

Implement the view in `modules/example.html`:

```html
<input id="message" type="text"
    events="input change" validate render="#preview"/>
<p id="preview">{{example.message}}</p>
```

The expression `{{example.message}}` displays the current property value in the
preview.

Composite binding connects `id="message"` to `example.message`. The `events`
attribute selects `input` and `change` as triggers. On these events, `validate`
calls `example.validate(element, value)`; if it returns `true`, the input value
is copied to the property. `render="#preview"` refreshes the preview.

Optional styles in `modules/example.css`:

```css
#example {
  padding: 8px;
}
```

Composite CSS is inserted into the document and is not automatically scoped. Use
selectors such as `#example` to target the composite explicitly.

Serve the directory containing `index.html` and `modules` with a web server,
then open `index.html` over HTTP or HTTPS. Enter text in the input field; the
preview displays the same text.

## How the Example Is Realized
The runtime uses the composite ID `example` to resolve the corresponding
composite module. For the empty composite in this example, its resources are
processed in this order:

```text
modules/example.js
    -> modules/example.css
        -> modules/example.html
```

Executing `example.js` creates the `example` application module and publishes it
as `window.example` before the view is inserted. The composer realizes the view
within the declared `<section>`, evaluates expressions and establishes composite
binding:

```text
View <-> Composite Binding <-> Application Module
```

Together, the realized DOM, application logic and applied styles form the
running composite.

## Optional Next Step: Reactive Application Data
To use reactive application data, replace `modules/example.js` and
`modules/example.html` with the following versions.

```javascript
const example = {
    message: "",
    validate(element, value) {
        return true;
    }
}.reactive();

expose(example, "example");
```

```html
<input id="message" type="text"
    events="input change" validate/>
<p>{{example.message}}</p>
```

During rendering, the runtime tracks properties accessed through the reactive
object. When one of these properties is changed through that object, the
dependent parts of the view are updated asynchronously. The explicit `render`
attribute is therefore not needed in this example.

## Learning Path
The following tutorials provide separate learning paths for micro-frontends and
Single-Page Applications. Each path consists of incremental steps, from a
prototype to a finished application, that extend or modify the previous result.
The commented differences between consecutive steps illustrate the
implementation of individual concepts.

- [Micro-Frontend](https://seanox.github.io/composite-js/tutorials/#micro-frontend)
- [SPA (Single Page Application)](
      https://seanox.github.io/composite-js/tutorials/#spa-single-page-application)



- - -
&#9665; [Architecture](architecture.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Expression Language](expression.md) &#9655;
