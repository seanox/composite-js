&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
- - -

# Components
Seanox aspect-js is designed for a modular and component-based architecture. For
this purpose, the application runtime (runtime) supports declarative marking of
components in the markup as well as automatic mechanisms for
[View-Module Bindung (binding)](view-module-binding.md#view-module-binding) and
loading of outsourced resources at runtime.

## Contents Overview
- [Module](#module)
- [Component](#component)
- [Composite](#composite)
- [Structure](#structure)
- [Resources](#resources)
- [Loading](#loading)
  - [CSS](#css)
  - [JavaScript](#javascript)
  - [HTML](#html)
- [Common Standard Component](#common-standard-component)
- [Namespace](#namespace)
- [Notes](#notes)

## Module
A module represents a self-contained technical software unit, usually provided
as a software library.

## Component
A component represents a functional unit that can consist of one or more modules.

## Composite
A composite is a component consisting of markup, CSS, JavaScript and optionally
other resources. In terms of the [View-Module Binding (binding)](
    view-module-binding.md#view-module-binding), a composite connects the view
with an application module (module).

__A composite resource is not an ECMAScript module. Composite scripts are
runtime-loaded and executed in the composite lifecycle.__

The binding between a composite in the view and its module is resolved by the
composite identifier and namespace mapping. Namespace usage within a module
does not define the [View-Module Binding (binding)](
    view-module-binding.md#view-module-binding) itself; it is used for
structuring and exposing application logic.

## Structure
A component in markup consists of an HTML element marked as composite with a
unique ID, which is called Composite ID.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="aspect-js.js"></script>
  </head>
  <body>
    <div id="example" composite></div>
  </bod>
</html>
```

In JavaScript, the composite ID is used as the name for the corresponding
module.

```javascript
const example = {
    ...    
}
```

And also in CSS, the composite ID is used as the selector mapping.

```css
#example {
  ...    
}
```

## Resources
Markup, CSS and JavaScript of composites can be stored externally. The default
directory `./modules` can be changed via the property `Composite.MODULES`. File
names are derived from the composite ID of the HTML element marked as
`composite`. The resources to externalize can be selected individually for each
composite.

```
+ modules
  - example.css
  - example.js
  - example.html
- index.html
```

## Loading
Resources and [binding](view-module-binding.md#view-module-binding) are
processed when a composite is required in the view. This minimizes loading time
because only the resources needed for the current rendering are loaded.

External resource loading is optional and can be configured individually for
each composite. Resources are loaded and embedded in the following order: CSS,
JavaScript, HTML/Markup.

If the request for a resource returns status `404`, the resource is assumed not
to be externalized. By design, status `404` is interpreted as __resource not
provided__ and not as a loading error. Any status code other than `200` or `404`
causes an error.

Resource loading is performed only once with the composite's first request for
the view, and the content is then cached.

### CSS
CSS is inserted as a style element in the HEAD element. Without a HEAD element,
the insertion causes an error.

### JavaScript
JavaScript is executed in an isolated runtime scope. Declarations remain local
unless they are explicitly exported, for example with the macro
[#export](scripting.md#export).

```javascript
const login = {
    validate(element, value) {
    },
    logon: {
        onClick(event) {
        }
    }    
};

#export login;
```

### HTML
HTML/markup is loaded only if the composite has no inner markup and neither the
`import` nor `output` attribute is defined, indicating an empty composite with
externalized markup.

## Common Standard Component
When the page is loaded and the runtime and application are initialized, the
Commons component in the modules directory is loaded automatically. It can
contain the JavaScript file `common.js` and/or the stylesheet `common.css` for
shared application logic and styles.

```
+ modules
  - common.css
  - common.js
  - ...
- index.html
```

## Namespace
Namespaces provide hierarchical structuring of components, resources and
business logic. In JavaScript, they are represented by object trees.

Namespace identifiers consist of letters, numbers and underscores separated by
dots. Namespace levels can also be numeric and are then interpreted as array
indices.

Composites or their data objects are comparable with static managed beans that
use the global namespace as singletons, facades or delegates. Namespaces are
used to structure these application objects.

__For modules, the macros [#use](scripting.md#use) and [#export](
    scripting.md#export) are recommended. `#use` creates a namespace if it does
not already exist, while `#export` publishes JavaScript declarations to that
namespace.__

```javascript
const masterdata = {
    regions: {
        ...
    },
    languages: {
        ...
    }
};

#use example.administration;
#export masterdata@example.administration;
```
The example creates the namespace `example.administration` if necessary and
exports `masterdata` into that namespace.

In markup, namespaces are derived from composite IDs. The nesting of composites
does not define namespaces because each composite is treated independently.

```html
<div id="example" composite>
  <div id="administration@example" composite>
    <div id="masterdata@example:administration" composite>
      <div id="regions@example:administration:masterdata" composite>
        Namespace: masterdata.regions
      </div>
    </div>
  </div>
</div>
```

Namespaces were introduced to support modular architectures based on the
micro-frontend concept, allowing domain-specific components to be structured
independently and reused across different contexts.

In markup, only namespace syntax is validated. Valid namespaces are mapped to
the directory structure of modules and their resources, extending the module
path accordingly.

```html
<div id="imprint" composite>
  Namespace: Imprint
  <div id="contact" composite>
    Namespace: Contact
    <div id="support" composite>
      Namespace: support
      <div id="mail@support" composite>
        Namespace: support.mail
      </div>
      <div id="channel@support" composite>
        Namespace: support.channel
      </div>
      ...
    </div>
    <div id="community" composite>
      Namespace: community
      <div id="channel@community" composite>
        Namespace: community.channel
      </div>
      ...
    </div>
  </div>
</div>
```

```
+ modules
  - common.css
  - common.js
  + community
    - channel.css
    - channel.html
    - channel.js
    - ...
  - imprint.css
  - imprint.html
  - imprint.js
  + support
    - mail.css
    - mail.html
    - mail.js
    - ...
  - ...
- index.html
```

## Notes
Further details are described in the chapters [View-Module Binding](
    view-module-binding.md#view-module-binding).



- - -
&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
