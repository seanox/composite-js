&#9665; [Composite](composite.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#reactivity-rendering)
&nbsp;&nbsp;&nbsp;&nbsp; [View-Module Binding](view-module-binding.md) &#9655;
- - -

# Reactivity Rendering
In the reactive approach, changes to reactive data objects trigger a partial
refresh of the consumers in the view. Consumers are all expressions that read
the changed value of a data object. In the view, expressions can be used in HTML
elements and free text. Data objects must use `Reactive(object)` or
`Object.prototype.reactive()` for reactive rendering.

```javascript
const data = {
    value: ...
}.reactive();
```

In this example, the renderer automatically updates all HTML elements in the DOM
and free text that use the `value` property directly or indirectly in an
expression. The update occurs when the changed value is final in the data object,
which can be relevant when using getters and setters.

__Reactive behavior is based on notifications within Reactive that trigger
rendering. To create these notifications, Reactive must know the consumers of
the reactive data. It collects this information while parsing and rendering the
markup, including markup inserted at runtime. Reactive must therefore exist
before the consumers.__

Reactive rendering can be stopped by selectively deleting reactive instances
with the `delete` method.

__Reactive is a substitute for another object and controls access to the
original object. Reactive and the object are independent instances, but Reactive
is tightly bound to the original object and logically separated from it.__

```javascript
const objectA = {};
const objectB = objectA.reactive();
objectB.value = "B";

// Assertions
typeof objectA.value === "string"
typeof objectB.value === "string"
objectA.value === objectB.value
```

No new Reactive instance can be created from an existing Reactive instance.
`Object.prototype.reactive()` and `Reactive(...)` always return a reference to
themselves. When another Reactive object is added as a value to an existing
Reactive instance, a new Reactive instance is created from the original object
that is added as a Reactive object.

```javascript
const objectA = ({}).reactive();
const objectB = objectA.reactive();
const objectC = Reactive(objectA);

// Assertions
objectA === objectB
objectA === objectC
objectB === objectC

const objectD = ({objectA}).reactive();

// Assertion
objectD.objectA === objectA

objectC.objectB = objectB;

// Assertion
objectC.objectB === objectB
```

Reactive is a proxy and remains logically separated from the original object.
This supports bidirectional synchronization after initialization. In detail,
bidirectional synchronization is monodirectional and driven by Get and Set. From
the Reactive instance perspective, Get synchronizes from the original object to
the Reactive instance (object &rarr; reactive). Set synchronizes from the
reactive instance to the original object (reactive &rarr; object). Changes to
the original object are considered when data is accessed, without affecting the
view.

```javascript
const object = {valueA:1};
const model = Reactive(object);
window.setTimeout(() =>
    object.valueB = 2, 1000);
window.setTimeout(() =>
    console.log(model.valueB), 2000);
window.setTimeout(() =>
    object.valueA = 3, 3000);
window.setTimeout(() =>
    console.log(model.valueA), 4000);
window.setTimeout(() =>
    console.log(model.valueB), 5000);
window.setTimeout(() =>
    model.valueA = 5, 6000);
```

In this example, after approx. 5 seconds, reactive instance `model` reads the
original object as a reactive instance and takes over `valueB`. After approx. 6
seconds, the write access to `model` triggers the view update.

Reactive works permanently recursively on all object levels and also on the
objects which are added later as values. Even if these objects do not explicitly
use Reactive, new instances are created for the referenced objects. Initiating
objects and Reactive instances are logically decoupled and are synchronized
bidirectionally. In contrast, views and Reactive instances, like instances
internally, use proxies that behave and can be used like the initiating
originals. However, proxies are separate instances that are compatible but not
identical to the initiating object. This logical separation is necessary so
that the renderer can generate appropriate notifications when data changes and
thus update the consumers in the view.

```javascript
const objectA = {}
const objectB = {}
objectA.objectB = objectB;

// Assertions
objectA.objectB === objectB

const objectC = objectA.reactive();

// Assertions
objectC.objectB !== objectA
objectC.objectB !== objectB
objectA.objectB === objectB

const objectD = ({}).reactive();
objectD.objectB = objectB;
objectD.objectB.text = "A";

// Assertions
objectD.objectB !== objectB;
objectD.objectB === objectC.objectB;
objectD.objectB.text === "A";
objectC.objectB.text === "A";

const objectE = {text: "A"};
const objectF = objectE.reactive();
objectF.text = "B";

// Assertions
objectE.text === "B";
objectF.text === "B";

objectE.text = "C";

// Assertions
objectE.text === "C"
objectF.text === "C"

```

Further proxies can be used with Reactive instances. Due to the logical
separation, Reactive instances always act recursively on the level of the
original objects. Adding proxies on the object levels of Reactive instances has
no effect because they are not addressed. Proxies should exist before the
Reactive instance is created or be placed around the Reactive instance later, so
that the proxy and not the Reactive instance forms the model.

```javascript
const object = {a:{valueA:1}};
const model = new Proxy(Reactive(object), {
    ...
});
```

__Prevent misunderstandings__

Reactive itself has no direct influence on the view, but prompts the renderer to
update individual consuming HTML elements, which must be taken into account
especially when expressions use temporary variables, such as those used in the
attribute `iterate`, which is already taken into account automatically.



- - -
&#9665; [Composite](composite.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#reactivity-rendering)
&nbsp;&nbsp;&nbsp;&nbsp; [View-Module Binding](view-module-binding.md) &#9655;
