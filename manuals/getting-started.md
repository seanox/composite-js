&#9665; [Introduction](introduction.md)
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

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js.js  
  __for deployment without Test API__

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-max.js  
  __for deployment without Test API__ not minimized and with comments

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-testing.js  
  for development and testing

- https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-testing-max.js  
  for development and testing not minimized and with comments

## First Composite (Explicit Rendering Flow)
Create `index.html` and declare one composite:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/@seanox/aspect-js/release/aspect-js-testing-max.js"></script>
  </head>
  <body>
    <div id="example" composite></div>
  </body>
</html>
```

Add module resources in the default module directory:

```text
+ modules
  - example.css
  - example.js
  - example.html
- index.html
```

Implement the model in `modules/example.js`:

```javascript
const example = {
    message: "",
    validate(element, value) {
        return true;
    }
};

#export example;
```

Implement the view in `modules/example.html`:

```html
<input id="message" type="text"
    events="input change" validate render="#preview"/>
<p id="preview">{{example.message}}</p>
```

Optional style in `modules/example.css`:

```css
#example {
  padding: 8px;
}
```

This example shows the explicit data/render flow: `events` triggers
synchronization from input to model, `validate` controls the sync result, and
`render` refreshes selected targets (`#preview`). The expression
`{{example.message}}` outputs model data into the markup.

## What the Runtime Does Here
When the page is rendered, the composite `id="example"` is used as the component
key. aspect-js resolves resources by that ID and loads CSS, JavaScript, and HTML
in this order. The JavaScript model and markup are then connected through
view-module binding, based on matching IDs and model properties.

`#export example;` is required because Composite JavaScript runs in an isolated
scope. Without export, the model is not published to the runtime namespace used
by the binding.

The HTML resource (`modules/example.html`) is auto-loaded only if the composite
element has no inner HTML and does not use `import` or `output`.

## Optional Next Step: Reactive Model
The first example intentionally uses explicit `render`, so the update mechanism
is visible. As a next step, you can make the model reactive and remove `render`
for this case.

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

Changes to reactive model values update consumers automatically.

## Learning Path
The following tutorials provide separate learning paths for micro-frontends and
single-page applications. Each path consists of incremental steps that extend or
modify the previous result. The differences between consecutive steps illustrate
the implementation of individual concepts.

- [Micro-Frontend](../../../tree/master/tutorials/micro-frontend)
- [SPA (Single Page Application)](
      ../../../tree/master/tutorials/single-page-application)



- - -
&#9665; [Introduction](introduction.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#getting-started)
&nbsp;&nbsp;&nbsp;&nbsp; [Expression Language](expression.md) &#9655;
