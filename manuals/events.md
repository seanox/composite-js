&#9665; [Resource Bundle](message.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [API Extension](extensions.md) &#9655;
- - -

# Events
Seanox composite-js provides events for extensions and for notifying the
application about runtime state changes during the composite lifecycle.

Event names use camelCase; the predefined names are exposed through `Composer`
constants. Custom event names passed to `listen` and `fire` must follow the same
pattern.

## Contents Overview
- [DOM](#dom)
  - [Composer.EVENT_DOM_ADDED](#composerevent_dom_added)
  - [Composer.EVENT_DOM_REMOVED](#composerevent_dom_removed)
  - [Composer.EVENT_DOM_MOVED](#composerevent_dom_moved)
- [Rendering](#rendering)
  - [Composer.EVENT_RENDER_START](#composerevent_render_start)
  - [Composer.EVENT_RENDER_NEXT](#composerevent_render_next)
  - [Composer.EVENT_RENDER_END](#composerevent_render_end)
- [Composite Binding](#composite-binding)
  - [Composer.EVENT_MOUNT_START](#composerevent_mount_start)
  - [Composer.EVENT_MOUNT_NEXT](#composerevent_mount_next)
  - [Composer.EVENT_MOUNT_END](#composerevent_mount_end)
- [Modules](#modules)
  - [Composer.EVENT_MODULE_LOAD](#composerevent_module_load)
  - [Composer.EVENT_MODULE_DOCK](#composerevent_module_dock)
  - [Composer.EVENT_MODULE_READY](#composerevent_module_ready)
  - [Composer.EVENT_MODULE_UNDOCK](#composerevent_module_undock)
- [HTTP](#http)
  - [XMLHttpRequest](#xmlhttprequest)
  - [window.fetch](#windowfetch)
  - [Composer.EVENT_HTTP_START](#composerevent_http_start)
  - [Composer.EVENT_HTTP_PROGRESS](#composerevent_http_progress)
  - [Composer.EVENT_HTTP_RECEIVE](#composerevent_http_receive)
  - [Composer.EVENT_HTTP_LOAD](#composerevent_http_load)
  - [Composer.EVENT_HTTP_ABORT](#composerevent_http_abort)
  - [Composer.EVENT_HTTP_TIMEOUT](#composerevent_http_timeout)
  - [Composer.EVENT_HTTP_ERROR](#composerevent_http_error)
  - [Composer.EVENT_HTTP_END](#composerevent_http_end)
- [Error](#error)
  - [Composer.EVENT_ERROR](#composerevent_error)

Listeners are called in registration order. If a listener throws synchronously,
the error is reported asynchronously so the remaining listeners can still be
called. Errors from `Composer.EVENT_ERROR` listeners are logged instead of
rethrown, avoiding a recursive error event.

## DOM
The runtime monitors structural changes to the DOM. Changes are detected with a
MutationObserver and reported once per mutation cycle. The callback receives the
event and an array containing the affected root nodes.

```javascript
Composer.listen(Composer.EVENT_DOM_***, function(event, nodes) {
    ...
});
```

Events are fired after rendering and cleanup for the corresponding mutation
cycle, so listeners observe a consistent state. The array passed with the event
contains the root nodes reported by the MutationObserver, with their child nodes
implied.

__The observation is focused on the &lt;body&gt; element, because only there
composites are composed, rendered and bound. Nodes that leave this scope, for
example into the &lt;head&gt; element or into a detached fragment, are therefore
regarded as removed.__

### Composer.EVENT_DOM_ADDED
Occurs when nodes are inserted into the DOM.

### Composer.EVENT_DOM_MOVED
Occurs when nodes are moved within the &lt;body&gt; element. Nodes moved outside
the  &lt;body&gt; element are treated as removed.

## Rendering
The following events occur during rendering. The current selector is passed to
the callback method, which can influence the selector and the corresponding
HTML element, but not the rendering.

```javascript
Composer.listen(Composer.EVENT_RENDER_***, function(event, selector) {
    ...
});
```

### Composer.EVENT_RENDER_START
The event occurs when rendering starts. Processing starts after the event.

### Composer.EVENT_RENDER_NEXT
The event occurs during recursive rendering iteration when another HTML element
starts rendering during a render cycle. Processing starts after the event.

### Composer.EVENT_RENDER_END
The event occurs after rendering has ended. Processing ends before the event.

## Composite Binding
The following events occur during composite binding. As with the rendering
events, the current selector is passed to the callback method, which can
influence the selector and the corresponding HTML element, but not the binding.

```javascript
Composer.listen(Composer.EVENT_MOUNT_***, function(event, selector) {
    ...
});
```

### Composer.EVENT_MOUNT_START
The event occurs when binding starts. Processing starts after the event.

### Composer.EVENT_MOUNT_NEXT
The event occurs during recursive binding iteration when another HTML element
starts binding during a render cycle. Processing starts after the event.

### Composer.EVENT_MOUNT_END
The event occurs after binding has ended. Processing ends before the event.

## Modules
The following events occur when the runtime loads composite modules and connects
their application modules to the composite lifecycle.

### Composer.EVENT_MODULE_LOAD
Occurs when a composite module is initially loaded. If a composite module is
loaded and unloaded multiple times at runtime, this event occurs only once. The
callback method is passed the trigger and the determined module. Triggers can be
HTML elements when modules are addressed via markup, or strings when modules are
addressed programmatically in JavaScript.

### Composer.EVENT_MODULE_DOCK
Occurs when a composite is added to the DOM, before the `dock` method of the
application module is called. The callback method is passed the event and a
meta-object with information about the module.

```javascript
Composer.listen(Composer.EVENT_MODULE_DOCK, function(event, meta) {
    ...
});
```

### Composer.EVENT_MODULE_READY
Occurs after the `dock` method of the application module has been executed. At
this point the application module is connected to the composite and can be used.
The callback method is passed the event and a meta-object with information about
the module.

```javascript
Composer.listen(Composer.EVENT_MODULE_READY, function(event, meta) {
    ...
});
```

### Composer.EVENT_MODULE_UNDOCK
Occurs after a composite has been removed from the DOM and the `undock` method
of the application module has been executed. The callback method is passed the
event and a meta-object with information about the module.

```javascript
Composer.listen(Composer.EVENT_MODULE_UNDOCK, function(event, meta) {
    ...
});
```

## HTTP
The runtime provides application-wide HTTP events for request-related logic,
such as logging or displaying loading indicators. These events also cover
requests used to load external resources of composites.

```javascript
Composer.listen(Composer.EVENT_HTTP_***, function(event, payload) {
    ...
});
```

HTTP events follow the composite-js runtime lifecycle rather than the native
lifecycle of the underlying request API. Requests via `XMLHttpRequest` and
`fetch` are therefore intercepted centrally and forwarded through
`Composer.fire()`, independently of their native event mechanisms.

### XMLHttpRequest
`EVENT_HTTP_START` is triggered when `open()` is called, not on the native
`loadstart` event. Subsequent native events are mapped to their corresponding
runtime events: `progress`, `readystatechange`, `load`, `abort`, `error`,
`timeout`, and `loadend`. Each `readystatechange` triggers `EVENT_HTTP_RECEIVE`,
regardless of the current `readyState`.

Callbacks receive the native event object, whose `target` references the
`XMLHttpRequest` instance.

### window.fetch
`EVENT_HTTP_START` is triggered when `fetch()` is called, `EVENT_HTTP_RECEIVE`
when its promise fulfills with a response, and `EVENT_HTTP_END` when the promise
settles. A fulfilled response with an HTTP error status is still a receive, not
a transport error. Since the promise fulfills when response headers are
available, the body may still be streaming after `EVENT_HTTP_END`.

Fetch notifications are queued as microtasks so event listeners do not alter the
fetch promise's result. Rejected promises trigger `EVENT_HTTP_ERROR`, without
distinguishing the cause, followed by `EVENT_HTTP_END`.

`fetch` does not trigger `EVENT_HTTP_PROGRESS`, `EVENT_HTTP_LOAD`,
`EVENT_HTTP_ABORT`, or `EVENT_HTTP_TIMEOUT`, as it has no equivalent native
events that preserve those `XMLHttpRequest` semantics. Since `fetch` has no
native event objects, callbacks receive the `Response` for `EVENT_HTTP_RECEIVE`
and the rejection value for `EVENT_HTTP_ERROR`.

### Composer.EVENT_HTTP_START
Triggered when a request to load data is initiated by a method call. The event
follows the composite-js runtime lifecycle, not the native XMLHttpRequest
lifecycle.  
XMLHttpRequest: method call (not `loadstart`)  
Fetch: method call

### Composer.EVENT_HTTP_PROGRESS
Triggered periodically when a request receives further data.  
XMLHttpRequest: `progress`  
Fetch: not available

### Composer.EVENT_HTTP_RECEIVE
Triggered when the status of the request/response changes.  
XMLHttpRequest: `readystatechange`  
Fetch: response promise fulfillment (once)

### Composer.EVENT_HTTP_LOAD
Triggered when a resource is loaded. This also applies to HTTP status codes that
indicate an error, because the transfer itself was successful.  
XMLHttpRequest: `load`  
Fetch: not available; its promise can fulfill before the response body is read

### Composer.EVENT_HTTP_ABORT
Triggered when the loading of a resource is aborted.  
XMLHttpRequest: `abort`  
Fetch: not available

### Composer.EVENT_HTTP_TIMEOUT
Triggered when the loading of a resource is aborted because the maximum loading
time has been exceeded.  
XMLHttpRequest: `timeout`  
Fetch: not available

### Composer.EVENT_HTTP_ERROR
Triggered when the request fails, e.g. due to a network error. HTTP status codes
that indicate an error do not trigger this event.  
XMLHttpRequest: `error`  
Fetch: rejected promise

### Composer.EVENT_HTTP_END
Triggered when the request is completed, regardless of any errors or successful
completion.  
XMLHttpRequest: `loadend`  
Fetch: promise settlement

## Error
The runtime supports application-wide event management for runtime errors to
implement event-related application logic, for example, for logging or error
output. 

```javascript
Composer.listen(Composer.EVENT_ERROR, function(event, error) {
    ...
});
```

### Composer.EVENT_ERROR
The error event is triggered for unhandled runtime errors. Syntax errors that
prevent JavaScript from being executed generally cannot trigger the error event.



- - -
&#9665; [Resource Bundle](message.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [API Extension](extensions.md) &#9655;
