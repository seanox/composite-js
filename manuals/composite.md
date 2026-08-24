&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
- - -

# Composite
A composite is an independently identified, domain-oriented application unit
within the DOM. It consists of HTML, CSS, JavaScript and optional additional
resources and is identified by a __composite ID__.

Composites are declared in the markup and are realized by the composer within
the declared DOM context.

## Contents Overview
- [Structure](#structure)
- [Composite and Composer](#composite-and-composer)
- [Resources](#resources)
- [Loading](#loading)
  - [CSS](#css)
  - [JavaScript](#javascript)
  - [HTML](#html)
- [Modules](#modules)
- [Common Resources](#common-resources)
- [Namespace](#namespace)
- [Notes](#notes)

## Structure
A composite in markup consists of an HTML element marked with the attribute
```composite``` and a unique ID. The combination of both is the composite ID.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="composite-js.js"></script>
  </head>
  <body>
    <div id="example" composite></div>
  </body>
</html>
``` 

The composite ID connects the composite with its view, application module and
associated resources. It is also used for resource resolution and composite
binding.

The composite script provides the JavaScript of the application module. Its
declarations are isolated unless they are explicitly exported.

```javascript
const example = {
    ...
};

#export example;
```

The structure and responsibility of the application module are not prescribed by
the runtime. It can be implemented as an object, function, class or another
suitable structure.

The composite ID can also be used for CSS selector mapping.

```css
#example {
  ...
}
```

The selector mapping is a resource convention and does not change the meaning of
the composite ID.

## Composite and Composer
A __composite__ is the conceptual application unit. It defines identity,
boundary and the association between view, application module and resources. It
has no active behavior of its own.

The __[composer](architecture.md#composer)__ is the runtime component that
realizes composites. It connects a composite module with a concrete DOM context,
establishes the [composite binding](composite-binding.md#composite-binding)
between the view and the application module, and performs the lifecycle
transitions. The surrounding runtime resolves and loads the resources, executes
the composite script and controls the composite lifecycle.

```text
Composite            -> concept: identified application unit
Composite Module     -> resource unit of a composite
Composer             -> runtime component that realizes composites
Runtime              -> infrastructure that provides loading, rendering,
                        lifecycle and the composer
```

```text
Composite Module
    + DOM context
        -> Composer
            -> running Composite
```

Consequently, a composite does not load its own resources, does not render 
itself and does not establish its own binding. These actions are performed by
the runtime and the composite.

## Resources
The resources associated with a composite can be stored externally. The default
directory ```./modules``` can be changed via the property
```Composer.MODULES```. File names are derived from the composite ID of the HTML
element marked as ```composite```. The resources to externalize can be selected
individually for each composite.

Within a project, the resources of a composite module are located as follows:

```text
+ modules
  - example.css
  - example.js
  - example.html
- index.html
```

The runtime manages these resources as a composite module.

## Loading
Resources are loaded only once by the runtime when the composite is first
required for rendering and are then cached. If a response has status 404, it is
interpreted as __resource not provided__ and is not treated as a loading error.
Any response with a status other than 200 or 404 causes an error.

The composer then uses these resources to realize the composite and establish
[composite binding](composite-binding.md#composite-binding).

External resource loading is optional and determined per composite and resource
based on whether the resource is provided. Resources are loaded and embedded in
the following order:

1. CSS
2. JavaScript
3. HTML/Markup

### CSS
The runtime inserts the CSS as a ```style``` element in the ```HEAD``` element.
Without a ```HEAD``` element, the insertion causes an error.

### JavaScript
The runtime executes the JavaScript provided by a Composite script in an
isolated runtime scope. Declarations remain local unless explicitly exported,
for example with the macro [#export](scripting.md#export) -- this is required
for any object participating in Composite binding.

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

In addition to the composite-js `#import` and `#export` macros, a Composite
script can use the standard ECMAScript `import` and `export` mechanisms.
ECMAScript modules remain independent of the Composite lifecycle.

### HTML
The runtime loads the external markup only for an empty Composite, that is, if
the declaring element contains no inner markup and neither the ```import``` nor
the ```output``` attribute is defined.

## Modules
The term module can refer to different concepts in _composite-js_ and should
therefore be used with the appropriate qualification. Full definitions are in
[Architecture](architecture.md#composite-module):

- __[Composite module](architecture.md#composite-module)__ resource group (HTML,
  CSS, JavaScript, optional additional resources) managed by the runtime
- __[Application module](architecture.md#application-module)__ application logic
  of a Composite, established by the Composite script
- __[ECMAScript module](architecture.md#ecmascript-module)__ standard JavaScript
  module using `import`/`export`, independent of the Composite system and its
  lifecycle

## Common Resources
When the page is loaded and the runtime and application are initialized, the
common resources in the modules directory are loaded automatically. They can
consist of the JavaScript file ```common.js``` and/or the stylesheet
```common.css``` for shared application logic and styles.

```text
+ modules
  - common.css
  - common.js
  - ...
- index.html
```

These common resources provide shared application logic and styles for the
application. They are not associated with a specific Composite ID.

## Namespace
Namespaces provide hierarchical structuring of application objects and resources
associated with Composites. Application objects can be used as shared objects,
services, delegates or other application-specific structures.

Namespace identifiers consist of letters, numbers and underscores separated by
dots. Namespace levels can also be numeric and are then interpreted as array
indices.

For Composite scripts, the macros [#use](scripting.md#use) and [#export](
    scripting.md#export) are recommended. ```#use``` creates a namespace if it
does not already exist, while ```#export``` publishes JavaScript declarations to
that namespace.

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

The example creates the namespace ```example.administration``` if necessary and
exports ```masterdata``` into that namespace.

In markup, namespaces are derived from Composite IDs. The nesting of Composites
does not define namespaces because each Composite is treated independently.

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

Namespaces can also be used for modular structures and micro-frontends, allowing
application-specific objects and resources to be structured independently and
reused in different contexts. In markup, only the namespace syntax is validated;
valid namespaces are mapped to the directory structure of modules and their
resources, extending the module path accordingly.

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

```text
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
The Composite binding between the view of a Composite and its application module
is associated with the Composite ID. Namespace mapping can be used for resource
resolution and for structuring application objects, but namespace usage does not
itself define the Composite binding.

Further details are described in the chapter [Composite binding](
    composite-binding.md#composite-binding).



- - -
&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
