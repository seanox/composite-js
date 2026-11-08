&#9665; [Architecture](architecture.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Expression Language](expression.md) &#9655;
- - -

# Getting Started

## Contents Overview
- [Prerequisites](#prerequisites)
- [Choose a Runtime Variant](#choose-a-runtime-variant)
- [First Composite](#first-composite)
- [What Happens During Realization](#what-happens-during-realization)
- [Composite Script and Application Module](#composite-script-and-application-module)
- [Composite Binding](#composite-binding)
- [Optional Next Step: Reactive Application Data](#optional-next-step-reactive-application-data)
- [Learning Path](#learning-path)
  - [Micro-Frontend](https://seanox.github.io/composite-js/tutorials/#micro-frontend)
  - [SPA (Single Page Application)](https://seanox.github.io/composite-js/tutorials/#spa-single-page-application)

## Prerequisites
- Browser with ECMAScript 6 support or higher
- Web server for hosting (required for runtime loading of modules, resources,
  and data)

## Choose a Runtime Variant
The runtime consists of one JavaScript file. It can be included through a
release-channel URL or downloaded as a release.

Release channels continuously provide the latest final major versions.

Each release provides versions for different purposes. These versions are
available in two variants. The standard variant is compressed for production
environments. The uncompressed and documented max variant is available for
development and error analysis.

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js.js  
  __for deployment without Test API__

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-max.js  
  __for deployment without Test API__ not compressed and with comments

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing.js  
  for development and testing

- https://cdn.jsdelivr.net/npm/@seanox/composite-js/release/composite-js-testing-max.js  
  for development and testing not compressed and with comments

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

The composite script establishes the application module of the composite. The
runtime does not prescribe how application logic must be structured. It can be
implemented using objects, functions, classes, or combinations of these
structures.

Implement the view in `modules/example.html`:

```html
<input id="message" type="text"
    events="input change" validate render="#preview"/>
<p id="preview">{{example.message}}</p>
```

On the [`input` and `change` events](markup.md#events), the runtime
[validates the input](markup.md#validate) and, if valid, copies its value to
`example.message`. [`render="#preview"`](markup.md#render) refreshes the
preview. The validation method in this example accepts every value.

Optional styles in `modules/example.css`:

```css
#example {
  padding: 8px;
}
```

Composite CSS is inserted into the document and is not automatically scoped. Use
selectors such as `#example` to target the composite explicitly.

The view describes the declarative presentation of the composite. It contains
markup and expressions and refers to application data provided by the
application module. The expression `{{example.message}}` reads the property of
the published application object. Composite binding connects the input element
`id="message"` with that property.

Serve the directory containing `index.html` and `modules` with a web server,
then open `index.html` over HTTP or HTTPS. Enter text in the input field; the
preview displays the same text.

## What Happens During Realization
For the empty composite in this example, the runtime forms the composite ID from
the `id` attribute and the `composite` attribute and resolves the corresponding
composite module. It loads and executes `example.js` before loading
`example.css` and `example.html`:

```
Composite Module
    -> example.js
    -> example.css
    -> example.html
```

Composite resources are optional. A composite can use an existing application
module without loading a composite script. CSS is loaded for empty composite
elements; HTML is loaded only if the element is empty and has neither `import`
nor `output`. A missing resource (HTTP 404) is tolerated during automatic
loading.

The composer then realizes the composite within the declared DOM context. The
general relationships and the contexts of a running composite are described in
[Concept Relationships](architecture.md#concept-relationships) and
[Composite](architecture.md#composite).

## Composite Script and Application Module
In this example, `modules/example.js` is the composite script; the exposed
`example` object is the application module used for binding. See
[Composite Script](architecture.md#composite-script) and
[Application Module](architecture.md#application-module) for their general
responsibilities.

Objects that participate in composite binding must be available under the
namespace resolved from the Composite ID. A composite script can publish an
object there with `expose(object, namespace)`:

```
expose(example, "example");
```

The namespace argument publishes the entire object as `window.example`. Without
it, `expose(example)` only collects the object's properties as module exports.
Composer does not make those exports available to the view.

## Composite Binding
Composite binding connects the declarative DOM structure of the view with the
corresponding application module.

```
View
    <-> Composite Binding <-> Application Module
```

The runtime resolves this relationship during realization and makes the
application data available to the view.

## Optional Next Step: Reactive Application Data
The previous example uses explicit rendering so that the data flow remains
visible.

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

Properties read through the reactive object during rendering are tracked as
dependencies. Changes made through that reactive object update the dependent
parts of the view asynchronously, so the explicit `render` attribute is not
needed in this example.

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
