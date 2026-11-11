&#9665; [Composite Binding](composite-binding.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [DataSource](datasource.md) &#9655;
- - -

# Routing
Seanox composite-js can organize page presentation in views addressed by paths
(routes). Routing supports a hierarchical directory structure based on the IDs
of nested composites in the markup. It controls visibility and access permission
for views through paths, the so-called view flow. Routing uses the DOM to insert
and remove views depending on the situation.

```
+-----------------------------------------------+
|  Page (#)                                     |
|  +-----------------------------------------+  |
|  |  View A (#A)                            |  |
|  |  +-----------------------------------+  |  |
|  |  |  View B (#A#B)                    |  |  |
|  |  |  +-----------------------------+  |  |  |
|  |  |  |  View C (#A#B#C)            |  |  |  |
|  |  |  +-----------------------------+  |  |  |
|  |  +-----------------------------------+  |  |
|  +-----------------------------------------+  |
+-----------------------------------------------+
```

## Contents Overview
- [Terms](#terms)
  - [Page](#page)
  - [View](#view)
  - [View Flow](#view-flow)
- [Navigation](#navigation)
- [Permission Concept](#permission-concept)
  - [undefined / no return value](#undefined--no-return-value)
  - [true](#true)
  - [false](#false)
  - [string](#string)
- [Interceptors](#interceptors)
  - [Execution order](#execution-order)
  - [Path matching](#path-matching)
  - [Navigation changes](#navigation-changes)
- [Paths](#paths)
  - [Root Path](#root-path)
  - [Relative Path](#relative-path)
  - [Absolute Path](#absolute-path)

## Terms

### Page
In a single page application, the page is the basic framework and runtime
environment of the entire application.

### View
A view is a representation of composites or content that may also contain other
views and subviews. Views can be static and therefore always shown, or
path-controlled with the attributes `composite` and `route`. Paths address the
complete chain of nested routed views and show the parent views in addition to
the target view. Only composites with `route` contribute path components;
namespace suffixes such as `@application` in composite IDs are not part of the
path.

__This behavior requires routing to be enabled by adding the `route` attribute
to the &lt;body&gt; element.__

Activation is determined during initial rendering and cannot be changed
afterward. The presence of `route` enables routing; non-empty attribute values
are ignored with a console warning. If the URL has no hash, routing navigates to
`#`. An existing hash is processed initially, including registered interceptors.

```html
<body route>
  <header id="header" composite>
    always shown, regardless of the path
  </header>
  <main>
    <div id="a" composite route>
      shown with path #a
    </div>
    <div id="b" composite route>
      shown with path #b
    </div>
    <div id="c" composite route>
      shown with path #c  
    </div>
  </main>
  <footer id="footer" composite>
    always shown, regardless of the path
  </footer>
</body>

```

For a routed composite with an additional `condition`, both routing approval and
the condition must be explicitly `true`. If routing denies approval, the
condition expression is not evaluated.

### View Flow
View flow describes the access control and the sequence of views. The routing
provides interfaces, events, permission concepts and interceptors with which the
view flow can be controlled and influenced.

## Navigation
Navigation is based on paths that use the URL hash. It is triggered by changing
the URL hash in the browser, by using hash links and in JavaScript with
`window.location.hash`, `window.location.href`, `Routing.route(path)` and
`Routing.forward(path)`.

```html
<a href="#a#b#c">Goto root + a + b + c</a>
<a href="##">Back to the parent</a>
<a href="##x">Back to the parent + x</a>
```

The path syntax is described in chapter [Paths](#paths).

```javascript
Routing.route("#a#b#c");
Routing.route("##");
Routing.route("##x");
```

```javascript
Routing.forward("#a#b#c");
Routing.forward("##");
Routing.forward("##x");
```

`Routing.route(path)` changes the URL hash asynchronously. Forwarding dispatches
a `hashchange` event directly without changing the URL. Interceptors receive the
requested target, but view approval still uses the current URL hash. Use
`Routing.route(path)` to change the active path.

__Routing accepts paths without a matching view and covers the destinations from
the root. Subsequent path components are treated as path parameters and can be
used in the business logic of the views.__

With routing active, `Routing.locate(true)` returns an object with the resolved
view path in `locate` and the remaining path components as strings in `data`.

## Permission Concept
The permission concept is based on `permit` methods in the application modules.
For routed composites, routing calls `permit()` without arguments when rendering
evaluates their routing condition, even if the current path does not cover the
view. The application module must be published under the name and namespace of
the composite. These return values are evaluated synchronously:

### undefined / no return value
The view is shown if the current path covers the path of the view. This also
applies if the application module does not implement `permit()`.

### true
The view is shown independently of path coverage, provided that its parent views
are shown and any additional `condition` is explicitly `true`.

### false
The view and possible sub-views are not shown.

### string
A string does not trigger a redirect. Like any return value other than
`undefined` or `true`, it denies approval and the view and possible sub-views
are not shown. Use an interceptor for navigation redirects.

```javascript
const example = {
    condition: 1,
    permit() {
        if (this.condition === 1)
            return;        
        if (this.condition === 2)
            return true;
        return false;
    }    
};

expose(example, "example");
```

## Interceptors
Interceptors allow custom logic to be executed during navigation before routing
checks path validity, resolves the target view and updates the view flow. They
are suitable for tasks such as authentication checks, redirects, route migration
or custom navigation handling and can influence whether the navigation
continues.

An interceptor is registered with `Routing.customize(path, actor)`. The `path`
can be either a route string or a regular expression. The `actor` is a
function that is executed when the specified path matches the requested
navigation target. The actor is a callback that receives the previous hash and
the new hash as parameters. The previous hash is `null` during initial
processing.

```javascript
Routing.customize("#a#b#c", (previousHash, newHash) => {
    console.log("Navigation from", previousHash, "to", newHash);
});
```

### Execution order
Interceptors are executed in the order in which they were registered.

All registered interceptors are checked. If an interceptor matches the requested
path, its actor function is executed. Matching and callback arguments use the
hashes captured from the current event; changing the URL does not change them
for following interceptors in that event.

An interceptor can stop further processing of the current navigation by
returning `false` explicitly. This skips the remaining interceptors, routing
history update and view rendering for that event; it does not undo a URL change.

```javascript
Routing.customize("#a#b", (oldHash, newHash) => {
    if (!User.isAuthenticated())
        return false;
});
```

Any other return value does not affect routing.

### Path matching
A string interceptor matches the specified path and all nested paths below it.
String patterns must start with `#` and use the supported ASCII range; invalid
string patterns are ignored. Matching uses the event's target hash before
normalization.

```javascript
Routing.customize("#a", actor);
```

matches:

```
#a
#a#b
#a#b#c
```

but not:

```
#abc
#c#b#a
```

A string ending in `#`, such as `#a#`, matches paths with that prefix but not
`#a` itself. The root pattern `#` matches all target hashes.

Regular expressions can be used for pattern-based matching:

```javascript
Routing.customize(/^#a#\d+$/, actor);
```

### Navigation changes
Interceptors are executed within the current navigation event, before the
routing history is updated. Their invocation does not create a separate entry.

An interceptor can modify the target navigation if required. For example,
`window.location.replace()` can be used to replace the current URL without
creating an additional browser history entry.

```javascript
Routing.customize("#old-path", (oldHash, newHash) => {
    window.location.replace("#new-path");
});
```

__Changes to the URL affect the following path resolution and view approval.
They can also trigger another `hashchange` event.__

## Paths
Paths are used for navigation, routing and view flow control. The target can be
a view or, when using interceptors, a function. For SPAs (Single-Page
Applications), the anchor part of the URL is used for navigation and routes.

```
https://example.local/example/#path
```

Similar to a file system, absolute and relative paths are supported. Paths
consist of case-sensitive words that only use 7-bit ASCII characters above the
space character. Characters outside this range must be URL encoded before
passing a path to the routing methods; unsupported characters cause an error.
The words are separated by the separator character (`#`).

```
#a#b#c#d
```

Repeated use of the separator (`#`) allows jumps back in the path to be mapped.
Each separator after the first removes one path component in the direction of
the root. Returns beyond the root remain at the root.

```
#a#b#c#d##x   -> #a#b#c#x
#a#b#c#d###x  -> #a#b#x
#a#b#c#d####x -> #a#x
```

The navigation with these paths is described in chapter
[Navigation](#navigation).

The following path types are supported.

### Root Path
The root path consists of one separator character (`#`). An empty string passed
to `Routing.route(path)` or `Routing.forward(path)` retains the current path.

```html
<a href="#">Back to the root</a>
```

### Relative Path
Relative paths are based on the current path and begin with either a word or a
sequence of the separator (`#`) described above.

```html
<a href="##">Back to the parent</a>
<a href="##x">Back to the parent + x</a>
<a href="###">Back to the parent + parent</a>
<a href="###x">Back to the parent + parent + x</a>
```

Relative paths without separator at the beginning are possible, but only work
with `Routing.route(path)` and `Routing.forward(path)`.

```javascript
Routing.route("x#y#z");
Routing.forward("x#y#z");
```

> [!IMPORTANT] 
> __Links with these paths are interpreted by the browser as a reference to
> another page.__

### Absolute Path
Absolute paths start with the root, represented by a leading separator character
(`#`). If the path consists of just this separator and nothing else, it is the
[Root Path](#root-path).

```html
<a href="#a#b#c">Back to the root + a + b + c</a>
```



- - -
&#9665; [Composite Binding](composite-binding.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#components)
&nbsp;&nbsp;&nbsp;&nbsp; [DataSource](datasource.md) &#9655;