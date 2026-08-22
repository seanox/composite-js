&#9665; [Composite](composite.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite Binding](composite-binding.md) &#9655;
- - -

# Reactivity Rendering
In the reactive approach, changes to reactive data objects trigger a partial
refresh of the consumers in the view. Consumers are all expressions that read
the changed value of a data object. In the view, expressions can be used in HTML
elements and free text.

## Contents Overview
- [Creating Reactive Objects](#creating-reactive-objects)
- [Consumers](#consumers)
- [Synchronization](#synchronization)
- [Nested Objects](#nested-objects)
- [Proxies](#proxies)
- [Notes](#notes)

## Creating Reactive Objects
Data objects must use `Reactive(object)` or `Object.prototype.reactive()` for
reactive rendering.

```javascript
const data = {
    value: ...
}.reactive();
```

In this example, the composer automatically re-renders all HTML elements in the
DOM and free text that use the `value` property directly or indirectly in an
expression. Rendering occurs when the changed value is final in the data object,
which can be relevant when using getters and setters.

No new reactive instance can be created from an existing one &ndash;
`Object.prototype.reactive()` and `Reactive(...)` always return a reference to
the same instance. However, if a reactive object is assigned as a value to
another (different) reactive instance, a new reactive instance is created from
its underlying original object.

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

Reactive rendering can be stopped by selectively deleting reactive instances
with the `delete` method.

## Consumers
__Reactive behavior is based on notifications within reactive that trigger
rendering. To create these notifications, reactive must know the consumers of
the reactive data. It collects this information while parsing and rendering the
markup, including markup inserted at runtime. Reactive must therefore exist
before the consumers.__

## Synchronization
__Reactive is a substitute for another object and controls access to the
original object. Reactive and the object are independent instances, but reactive
is tightly bound to the original object but logically separated from it. This
logical separation is necessary so that the composer can generate notifications
when data changes and thus trigger rendering of the consumers in the view.__

```javascript
const objectA = {};
const objectB = objectA.reactive();
objectB.value = "B";

// Assertions
typeof objectA.value === "string"
typeof objectB.value === "string"
objectA.value === objectB.value
```

As a proxy, reactive supports synchronization in both directions after
initialization, but each individual synchronization step is monodirectional and
driven separately by Get and Set. From the reactive instance perspective, Get
synchronizes from the original object to the reactive instance (object &rarr;
reactive). Set synchronizes from the reactive instance to the original object
(reactive &rarr; object). Changes to the original object are considered when
data is accessed, without affecting the View.

```javascript
const object = {valueA:1};
const instance = Reactive(object);
window.setTimeout(() =>
    object.valueB = 2, 1000);
window.setTimeout(() =>
    console.log(instance.valueB), 2000);
window.setTimeout(() =>
    object.valueA = 3, 3000);
window.setTimeout(() =>
    console.log(instance.valueA), 4000);
window.setTimeout(() =>
    console.log(instance.valueB), 5000);
window.setTimeout(() =>
    instance.valueA = 5, 6000);
```

In this example, after approx. 5 seconds, reactive instance `instance` reads the
original object as a reactive instance and takes over `valueB`. After approx. 6
seconds, the write access to `instance` triggers the view update.

## Nested Objects
Reactive works permanently recursively on all object levels and also on the
objects which are added later as values. Even if these objects do not explicitly
use reactive, new instances are created for the referenced objects. Views and
reactive instances, like instances internally, use proxies that behave and can
be used like the initiating originals. However, proxies are separate instances
that are compatible but not identical to the initiating object.

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

## Proxies
Further Proxies can be used with reactive instances. Due to the logical
separation, reactive instances always act recursively on the level of the
original objects. Adding Proxies on the object levels of reactive instances has
no effect because they are not addressed. Proxies should exist before the
reactive instance is created or be placed around the reactive instance later, so
that the Proxy and not the reactive instance is used as the data object.

```javascript
const object = {a:{valueA:1}};
const instance = new Proxy(Reactive(object), {
    ...
});
```

## Notes
Reactive itself has no direct influence on the view, but triggers the composer
to render the affected consuming HTML elements. This must be taken into account
especially when expressions use temporary variables, such as those used in the
attribute [iterate](markup.md#iterate), which is already taken into account
automatically.



- - -
&#9665; [Composite](composite.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite Binding](composite-binding.md) &#9655;
