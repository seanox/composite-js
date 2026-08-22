&#9665; [Architecture](architecture.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Expression Language](expression.md) &#9655;
- - -

# Getting Started

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
Composite ID, in this case `example`.

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

#export example;
```

The composite script establishes the application module of the Composite. The
runtime does not prescribe how application logic must be structured. It can be
implemented using objects, functions, classes, or combinations of these
structures.

Implement the view in `modules/example.html`:

```html
<input id="message" type="text"
    events="input change" validate render="#preview"/>
<p id="preview">{{example.message}}</p>
```

Optional styles in `modules/example.css`:

```css
#example {
  padding: 8px;
}
```

The view describes the declarative presentation of the Composite. It contains
markup and expressions and refers to application data provided by the
application module. The expression `{{example.message}}` accesses data exposed
by the application module through Composite binding.

## What Happens During Realization
When the runtime encounters the Composite declaration, it forms the Composite ID
from the `id` attribute and the `composite` attribute, resolves the
corresponding Composite module and loads its resources:

```
Composite Module
    -> example.html
    -> example.css
    -> example.js
```

The composer then realizes the Composite within the declared DOM context.

Conceptually, the realization follows this dependency chain:

```
Composite declaration
    -> Composite ID
        -> Composite Module resolution
            -> resource loading
                -> Composite Script execution
                    -> Application Module establishment
                        -> View realization
                            -> Composite Binding
                                -> running Composite
```

As shown here, the Composite lifecycle begins with the loading of the
Composite module. At the end of this process, the Composite reaches its
running state. The resulting Composite consists of:

```
Composite
    -> DOM context
    -> JavaScript context
    -> CSS context
```

## Composite Script and Application Module
The Composite script and the application module are related but distinct
concepts.

```
Composite Script
    -> establishes
        -> Application Module
```

The Composite script is the executable JavaScript program of the Composite
module, whose execution establishes the application module as the resulting
runtime representation of the application logic.

Objects that participate in Composite binding must be explicitly exported:

```
#export example;
```

Without the export, the object would remain internal to the Composite script
and would not be available to the view.

## Composite Binding
Composite binding connects the declarative DOM structure of the view with
explicitly exported objects of the application module.

```
View
    <-> Composite Binding <-> Application Module
```

The runtime resolves this relationship during realization and makes the
application data available to the view.

## Optional Next Step: Reactive Application Data
The previous example uses explicit rendering so that the data flow remains
visible.

```javascript
const example = {
    message: "",
    validate(element, value) {
        return true;
    }
}.reactive();

#export example;
```

```html
<input id="message" type="text"
    events="input change" validate/>
<p>{{example.message}}</p>
```

When reactive application data is used, the runtime reacts to changes of its
properties. Any expression in the view that depends on a changed property is
updated automatically, so explicit rendering is no longer required in this
case.

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
