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

Wrapping an original object again, or wrapping its reactive proxy, returns the
same proxy.

```javascript
const object = {};
const instance = Reactive(object);

// Assertions
Reactive(object) === instance;
Reactive(instance) === instance;
instance.reactive() === instance;
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
const object = {value:1};
const instance = Reactive(object);

object.value = 2;
console.log(instance.value);
// output: 2

instance.value = 3;
console.log(object.value);
// output: 3
```

The direct write to `object` changes the shared data without refreshing the
view. The write through `instance` updates the same data and schedules an
asynchronous refresh of registered consumers of `value`.

## Nested Objects
Reactive is intended for arrays and associative application objects, including
nested objects and objects added later as property values. Nested proxies are
created on first read and reused for subsequent accesses. They forward property
access to the original objects, but are separate instances and not identical to
them. The same original object yields the same proxy wherever it is referenced,
including after assignment to another property.

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
const product = {name: "Ruler"};
const model = Reactive({featured: product, selected: null});

// Assertions
model.featured !== product;
model.featured === Reactive(product);

model.selected = model.featured;
model.selected === model.featured;

model.featured.name = "Metal ruler";
console.log(product.name);
// output: Metal ruler
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
Markup event handling with [events](markup.md#events) and explicit rendering
with [render](markup.md#render) work independently of Reactive. When an
expression reads application data through a reactive proxy, changes made through
that proxy automatically refresh only the markup that depends on the changed
data; no explicit `render` target is needed. The `events` attribute is still
needed to synchronize input values with the corresponding properties in the
application module.

When [iterate](markup.md#iterate) reads a reactive array directly, it reads the
entries while building the output. Changing an entry through its proxy therefore
rebuilds the iterative element's inner HTML. To update product properties
without rebuilding the iteration, make `iterate` depend only on the array's
length and read the product data in the template:

```javascript
const example = {
    products: [
        {name: "Ruler"},
        {name: "Ballpoint pen"},
        {name: "Pencil"}
    ]
}.reactive();

expose(example, "example");
```

```html
<select iterate="{{products:example.products.length}}">
  <option value="{{example.products[products.index].name}}">
    {{example.products[products.index].name}}
  </option>
</select>
```

Here, the iteration depends on the number of products, while each option reads a
product's name. Changing a name through the proxy refreshes that option's value
and text without rebuilding the iteration. Adding or removing a product changes
the array's length and rebuilds the iteration. The Composer preserves the
iteration context when it refreshes an option's value or text individually.



- - -
&#9665; [Composite](composite.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite Binding](composite-binding.md) &#9655;
