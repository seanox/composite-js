&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
- - -

# Components
Seanox aspect-js is designed for a modular and component-based architecture. For
this purpose, the application runtime supports declarative marking of components
in the markup as well as automatic mechanisms for view-model binding and loading
of outsourced resources at runtime.

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
A module represents a closed functional program unit, which is usually provided
as a program library.

## Component
A component refers to a functionally or technically independent part that can
consist of one or more modules.

## Composite
A composite is a functionally independent component that consist of markup, CSS,
JavaScript, and optionally other resources. In terms of the
model-view-controller approach, a composite provides components for model and
view.

__This makes the composite concept different from the JavaScript module concept,
which can also be used. Another important difference is in the loading and
execution of JavaScript, which in composites is linear/sequential and thus
synchronous in a render cycle.__

## Structure
A component in markup consists of an HTML element marked as composite with a
unique ID, which is also called Composite ID.

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

In JavaScript, the ID from the HTML element which was declared as a composite is
used as the name for the corresponding model.

```javascript
const example = {
    ...    
}
```

And also in CSS the ID from the HTML element of the composite is used as
mapping.

```css
#example {
  ...    
}
```

## Resources
The inner markup, CSS and JavaScript of composites can be outsourced. The
default directory `./modules` can be changed via the property
`Composite.MODULES`. The file names of the outsourced resources are derived from
the ID of the HTML element marked as composite. Which resources or parts of the
component are swapped out can be decided individually for each component.

```
+ modules
  - example.css
  - example.js
  - example.html
- index.html
```

## Loading
The loading of the resources and the view model binding are done partially when
the composite is needed in the view, which greatly minimizes the loading time,
since only resources that are used at the moment of rendering are loaded
depending on the situation.

Offloading and loading resources at runtime is optional and can be applied
completely, partially and not. There is a fixed order for reloading and
embedding: CSS, JavaScript, HTML/Markup.

If the request of a resource is responded with status 404, it is assumed that
this resource has not been outsourced. Statuses other than 200 or 404 cause an
error.

Resource loading is performed only once with the component's first request for
the view, and the content is then cached.

### CSS
CSS is inserted as a style element in the HEAD element. Without a HEAD element,
the insertion causes an error.

### JavaScript
JavaScript is not inserted into the document as a &lt;script&gt; element.
Instead, it is executed directly in a isolated runtime scope. Variables,
constants and functions declared there remain local to that scope unless they
are explicitly exported e.g. with the macro [#export](scripting.md#export).

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
HTML/markup is loaded for a composite only if the HTML element of the component
itself has no inner HTML and the attributes `import` or `output` have not been
declared for the element. Only then is an empty component with outsourced
HTML/markup assumed.

## Common Standard Component
When the page is loaded and the runtime and application are initialized, the
Commons component in the modules directory is also loaded automatically, which
can consist of the JavaScript file `common.js` and/or the CSS stylesheet
`common.css`. Both files are intended for storing initial and application-wide
logic and styles, respectively.

```
+ modules
  - common.css
  - common.js
  - ...
- index.html
```

## Namespace
Comparable to packages in other programming languages, namespaces can be used
for hierarchical structuring of components, resources and business logic.

Although packages are not a feature of JavaScript, they can be mapped at the
object level by concatenating objects into an object tree. Here, each level of
the object tree forms a namespace, which can also be considered a domain.

As is typical for the identifiers of objects, namespaces also use letters,
numbers and underscores separated by a dot. As a special feature, arrays are
also supported. If a layer in the namespace uses an integer, this layer is
interpreted as an array.

Composites or their data objects (models) are comparable with static managed
beans that use the global namespace as singletons/facades/delegates. In order to
structure these data objects and implement domain concepts, corresponding
namespaces are required.

__For modules, the use of the macro [#export](scripting.md#export) is
recommended here as well, since this can also contain a namespace as a target in
addition to the JavaScript element to be published.__

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

The example creates the namespace `example.administration` with [#use](
    scripting.md#use) if it does not already exist, and then exports to
`example.administration.masterdata` with [#export](scripting.md#export)
masterdata.

In the markup, namespaces are formed from the composite IDs. The nesting of
composites therefore has no effect, because composites are always considered as
independent, comparable to managed or named beans.

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

Namespaces were introduced with the idea of micro-frontends, which use their own
domains and should be reusable in different places. This way, domain-related
components can be implemented in the static world of Seanox aspect-js.

Namespaces also have effects on resources and modules. Namespaces in the markup
have only a textual character for the time being and can also exist and be used
without a corresponding JavaScript object. Only the syntax of the namespaces is
checked in the markup. If this is valid, the namespaces are applied directly to
the path of modules and their resources and extend the path from the module
directory.

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

# Notes
Because of the close connection, we deliberately refer to the more detailed
chapters [Model-View-Controler](mvc.md) and [View-Model-Binding](
    mvc.md#view-model-binding).



- - -
&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
