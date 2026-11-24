&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
- - -

# Composite
A composite is an independently identified, domain-oriented application unit
within the DOM. It consists of HTML, CSS, JavaScript and optional additional
resources and is identified by a __composite ID__.

Composites are declared in the markup and are realized by the composer within
their declaring HTML elements. These elements and their subtrees belong to the
browser document's shared DOM, not to separate DOMs per composite.

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
```composite``` and a unique identifier (ID). The combination of both is the
composite ID.

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
declarations remain local to the separate function scope. [Object publication](
    architecture.md#object-publication) makes an object available as a
[named application object](architecture.md#named-application-object) for
composite binding. Collecting module exports alone does not publish the object.

```javascript
const example = {
    ...
};

expose(example, "example");
```

The structure and responsibility of the application module are not prescribed by
the runtime. It can be implemented as an object, function, class or another
structure.

The composite ID can also be used for CSS selector mapping.

```css
#example {
  ...
}
```

The selector mapping is a resource convention and does not change the meaning of
the composite ID.

## Composite and Composer
A __composite__ is an application unit with a view, optional application logic
and associated resources. The __[composer](architecture.md#composer)__ realizes
it within its declaring HTML element and establishes [composite binding](
    composite-binding.md#composite-binding). The composer is part of the
runtime, which resolves and loads resources, executes scripts and manages the
composite lifecycle.

```text
Composite Module
    + declaring HTML element
        -> Composer
            -> running Composite
```

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
The runtime inserts the CSS into a &lt;style&gt; element in the &lt;head&gt; if
the markup (HTML) has been loaded beforehand.

### JavaScript
The runtime executes the JavaScript provided by a composite script in a separate
function scope. JavaScript is only loaded if no corresponding application module
already exists. Declarations remain local. Perform object publication under the
composite namespace with [`expose(object, namespace)`](scripting.md#expose) to
provide a named application object for composite binding.

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

For each invocation, the runtime supplies the current view-scope values and
temporary runtime variables, together with the persistent objects `view` and
`application`. These values form the [execution scope](
    architecture.md#execution-scope). Use `application` for values shared across
composites. A separately stored composite script executes at most once when
loaded. See the [Scope overview](architecture.md#scopes) for lifetime and sharing.

Static ECMAScript `import` and `export` declarations are not supported because
composite scripts are not ECMAScript modules. Use `require(...)` for JavaScript
resources in the module directory. Where the browser supports it, dynamic
`import()` can load ECMAScript modules, which remain independent of the
composite lifecycle.

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
Namespaces provide hierarchical structuring of named application objects and
resources associated with Composites. Named application objects can be used as
shared objects, services, delegates or other application-specific structures;
they need not belong to a composite.

Namespaces used by `use` and `expose` consist of dot-separated ASCII identifier
segments matching `[_A-Za-z$][_A-Za-z0-9$]*`. Composite IDs declare the
corresponding namespace with `@` and `:` separators; the runtime maps it to the
dotted form. Numeric-only segments are not valid namespace identifiers, though
application objects can contain numeric properties.

In a composite script, `use(namespace)` creates a namespace and
`expose(object, namespace)` performs object publication there, making the object
available as a named application object.

```javascript
const masterdata = {
    regions: {
        ...
    },
    languages: {
        ...
    }
};

use("example.administration");
expose(masterdata, "example.administration.masterdata");
```

The example creates the namespace ```example.administration``` if necessary.
Object publication makes ```masterdata``` available as the named application
object ```example.administration.masterdata```.

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
The composite binding between the view of a composite and its application module
is associated with the composite ID. Namespace mapping can be used for resource
resolution and for structuring application objects, but namespace usage does not
itself define the composite binding.

Further details are described in the chapter [Composite binding](
    composite-binding.md#composite-binding).



- - -
&#9665; [Scripting](scripting.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Reactivity Rendering](reactive.md) &#9655;
