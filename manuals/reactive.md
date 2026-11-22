&#9665; [Composite](composite.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite Binding](composite-binding.md) &#9655;
- - -

# Reactivity Rendering
Reactive is an optional data bridge between application logic and the view.
While rendering, it tracks properties read through reactive proxies by
expressions in HTML attributes and text nodes. Changes made through these
proxies trigger a partial refresh of the affected view consumers. Changes made
directly to the original object remain visible through the proxy but do not
trigger a view update.

## Contents Overview
- [Creating Reactive Objects](#creating-reactive-objects)
- [Consumers](#consumers)
- [Synchronization](#synchronization)
- [Nested Objects](#nested-objects)
- [Proxies](#proxies)
- [Notes](#notes)

## Creating Reactive Objects
Data objects must use `Reactive(object)` or `Object.prototype.reactive()` for
reactive rendering. `Reactive(object)` accepts a non-null object, including an
array, and returns its reactive proxy. Other argument types cause a `TypeError`
with the message `Invalid object type`.

```javascript
const data = {
    value: ...
}.reactive();
```

In this example, the composer re-renders the registered consumers that read the
`value` property directly or indirectly. Rendering is scheduled asynchronously
after assignment, so expressions read the resulting property values, which can
be relevant when using getters and setters. A change to `undefined` also updates
registered consumers.

No new reactive instance can be created from an existing one &ndash;
`Object.prototype.reactive()` and `Reactive(...)` always return a reference to
the same instance. The same original object also yields the same reactive
instance when accessed through another reactive object, including after
assignment as a property value.

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

## Consumers
__Reactive behavior is based on notifications within reactive that trigger
rendering. To create these notifications, reactive must know the consumers of
the reactive data. It collects this information while rendering the markup,
including markup inserted at runtime. Reactive instances must therefore be used
when the consumers are rendered.__

Dependencies are recorded for model properties read through the reactive
instance during rendering. This includes properties read by getters, whether the
getter is defined on the object itself or inherited from a prototype. Changing
an underlying model property therefore also updates consumers of the computed
getter value. Initialize properties before rendering their consumers, even if
their initial value is `null` or `undefined`. When a consumer is removed from
the DOM, Reactive automatically removes its subscriptions.

## Synchronization
__Reactive is a proxy for another object and controls access to the original
object. The reactive instance and the original have distinct identities but
share the same property data. Writes through the reactive instance update the
original object and notify the composer to render the consumers in the view.__

```javascript
const objectA = {};
const objectB = objectA.reactive();
objectB.value = "B";

// Assertions
typeof objectA.value === "string"
typeof objectB.value === "string"
objectA.value === objectB.value
```

As a proxy, reactive forwards reads and writes to the original object rather
than maintaining a separate copy of its data. Get reads the current property
value from the original object; Set writes to the original object and schedules
reactive rendering after successful assignment. Exceptions thrown by setters
propagate to the caller; a failed assignment does not trigger reactive
rendering. Changes made directly to the original object are visible on
subsequent reads through the reactive instance, but do not themselves trigger a
view update.

Successful structural changes made through a reactive instance also trigger
reactive rendering for the affected consumers. This includes deleting a property
with `delete`, redefining a property with `Object.defineProperty(...)`, and
array operations that remove entries, such as `pop()`.

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

In this example, after approx. 2 and 5 seconds, `instance.valueB` reads `2` from
the original object. After approx. 4 seconds, `instance.valueA` reads `3`. These
reads do not trigger view updates. After approx. 6 seconds, the write access to
`instance` schedules rendering of any registered consumers of `valueA`.

## Nested Objects
Reactive is intended for arrays and associative application objects, including
nested objects and objects added later as property values. Nested proxies are
created on first read and reused for subsequent accesses. They forward property
access to the original objects, but are separate instances and not identical to
them.

Native objects with internal state, such as `Date`, `Map` and `Set`, are outside
the reactive data contract and should not be wrapped. DOM nodes and collections
are returned unchanged. If a property stores an object in a non-configurable,
non-writable own data property, Reactive returns the original object instead of
a proxy. JavaScript requires this for Proxy invariants. For example,
`Object.freeze({nested: {}})` makes the `nested` property non-configurable and
non-writable. This does not freeze the nested object itself; it means that
access returns it without a reactive proxy, so changes made through that
reference do not trigger reactive rendering.

```javascript
const objectA = {}
const objectB = {}
objectA.objectB = objectB;

// Assertions
objectA.objectB === objectB

const objectC = objectA.reactive();

// Assertions
objectC.objectB !== objectA.objectB
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
original objects. Assigning a reactive instance as a property value stores its
underlying original object. An additional Proxy around that instance can
therefore be bypassed when assigned to another reactive instance. Proxies should
exist before the reactive instance is created or be placed around the reactive
instance later, so that the Proxy and not the reactive instance is used as the
data object.

```javascript
const object = {a:{valueA:1}};
const instance = new Proxy(Reactive(object), {
    get(target, key) {
        console.log(key);
        return target[key];
    }
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
