&#9665; [Resource Bundle](message.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#events)
&nbsp;&nbsp;&nbsp;&nbsp; [API Extension](extensions.md) &#9655;
- - -

# Events
Seanox aspect-js provides events for extensions and for notifying the
application about runtime environment states.

## Contents Overview
- [Rendering](#rendering)
  - [Composite.EVENT_RENDER_START](#compositeevent_render_start)
  - [Composite.EVENT_RENDER_NEXT](#compositeevent_render_next)
  - [Composite.EVENT_RENDER_END](#compositeevent_render_end)
- [View-Module Binding](#view-module-binding)
  - [Composite.EVENT_MOUNT_START](#compositeevent_mount_start)
  - [Composite.EVENT_MOUNT_NEXT](#compositeevent_mount_next)
  - [Composite.EVENT_MOUNT_END](#compositeevent_mount_end)
- [Modules]
  - [Composite.EVENT_MODULE_LOAD](#compositeevent_module_load)
  - [Composite.EVENT_MODULE_DOCK](#compositeevent_module_dock)
  - [Composite.EVENT_MODULE_READY](#compositeevent_module_ready)
  - [Composite.EVENT_MODULE_UNDOCK](#compositeevent_module_undock)
- [HTTP](#http)
  - [Composite.EVENT_HTTP_START](#compositeevent_http_start)
  - [Composite.EVENT_HTTP_PROGRESS](#compositeevent_http_progress)
  - [Composite.EVENT_HTTP_RECEIVE](#compositeevent_http_receive)
  - [Composite.EVENT_HTTP_LOAD](#compositeevent_http_load)
  - [Composite.EVENT_HTTP_ABORT](#compositeevent_http_abort)
  - [Composite.EVENT_HTTP_TIMEOUT](#compositeevent_http_timeout)
  - [Composite.EVENT_HTTP_ERROR](#compositeevent_http_error)
  - [Composite.EVENT_HTTP_END](#compositeevent_http_end)
- [Error](#error)
  - [Composite.EVENT_ERROR](#compositeevent_error)

## Rendering
The following events occur during rendering. The current selector is passed to
the callback method. The method can influence the selector and the corresponding
element, but not the rendering.

```javascript
Composite.listen(Composite.EVENT_RENDER_***, function(event, selector) {
    ...
});
```

### Composite.EVENT_RENDER_START
The event occurs when rendering starts. Processing starts after the event.

### Composite.EVENT_RENDER_NEXT
The event occurs during recursive rendering iteration when another element
starts rendering during a render cycle. Processing starts after the event.

### Composite.EVENT_RENDER_END
The event occurs after rendering has ended. Processing ends before the event.

## View-Module Binding
The following events occur during View-Module Binding (binding). The current
selector is passed to the callback method. The method can influence the selector
and the corresponding element, but not the binding.

```javascript
Composite.listen(Composite.EVENT_MOUNT_***, function(event, selector) {
    ...
});
```

### Composite.EVENT_MOUNT_START
The event occurs when binding starts. Processing starts after the event.

### Composite.EVENT_MOUNT_NEXT
The event occurs during recursive binding iteration when another element starts
binding during a render cycle. Processing starts after the event.

### Composite.EVENT_MOUNT_END
The event occurs after binding has ended. Processing ends before the event.

## Modules
The following events occur during the use of application modules (modules).

### Composite.EVENT_MODULE_LOAD
Occurs when a module is initially loaded. If a module is loaded and unloaded
multiple times at runtime, this event will occur only once. The callback method
is passed the trigger and the determined module. Triggers can be HTML elements,
if modules are addressed via markup, or they can be strings, if modules are
addressed programmatically in JavaScript.

```javascript
Composite.listen(Composite.EVENT_MODULE_***, function(event, context, module) {
    ...
});
```

### Composite.EVENT_MODULE_DOCK
Occurs after the markup of a module is added to the DOM and the dock method is
executed. The callback method is passed the event and a meta-object with
information about the module.

```javascript
Composite.listen(Composite.EVENT_MODULE_DOCK, function(event, meta) {
    ...
});
```

### Composite.EVENT_MODULE_READY
TODO:

### Composite.EVENT_MODULE_UNDOCK
Occurs after the markup of a module is removed from the DOM and the undock
method is executed. The callback method is passed the event and a meta-object
with information about the module.

```javascript
Composite.listen(Composite.EVENT_MODULE_UNDOCK, function(event, context, module) {
    ...
});
```

## HTTP
The Composite API supports application-wide event management for HTTP requests.
This can implement request-related application logic, e.g. for logging or
spinners.

The events are described independently of the request API. Currently, only
requests via XMLHttpRequest are captured. For each event, the corresponding
XMLHttpRequest event is named as a reference.

The callback method is passed the event of the underlying request, not the
request object itself. With XMLHttpRequest, this is a `ProgressEvent` whose
property `target` contains the corresponding XMLHttpRequest.

```javascript
Composite.listen(Composite.EVENT_HTTP_***, function(event, payload) {
    ...
});
```

The events are also triggered by the requests with which the application runtime
(runtime) loads the outsourced resources of the composites. These requests are
synchronous. Synchronous requests do not dispatch the events `loadstart` and
`progress`, and the states 2 and 3 are skipped. Therefore
`Composite.EVENT_HTTP_START` and `Composite.EVENT_HTTP_PROGRESS` do not occur
for them. A spinner is of no use here anyway, because the browser cannot repaint
during a synchronous request.

### Composite.EVENT_HTTP_START
Triggered when a request to load data is started.  
XMLHttpRequest: `loadstart`

### Composite.EVENT_HTTP_PROGRESS
Triggered periodically when a request receives further data.  
XMLHttpRequest: `progress`

### Composite.EVENT_HTTP_RECEIVE
Triggered when the status of the request/response changes.  
XMLHttpRequest: `readystatechange`

### Composite.EVENT_HTTP_LOAD
Triggered when a resource is loaded. The event is also triggered for HTTP status
codes that indicate an error, because the transfer itself was successful.  
XMLHttpRequest: `load`

### Composite.EVENT_HTTP_ABORT
Triggered when the loading of a resource is aborted.  
XMLHttpRequest: `abort`

### Composite.EVENT_HTTP_TIMEOUT
Triggered when the loading of a resource is aborted because the maximum loading
time has been exceeded.  
XMLHttpRequest: `timeout`

### Composite.EVENT_HTTP_ERROR
Triggered when the request fails, e.g. due to a network error. HTTP status codes
that indicate an error do not trigger this event.  
XMLHttpRequest: `error`

### Composite.EVENT_HTTP_END
Triggered when the request is completed, regardless of any errors or successful
completion.  
XMLHttpRequest: `loadend`

## Error
The Composite API supports application-wide event management for runtime errors
to implement event-related application logic, for example, for logging or error
output. 

```javascript
Composite.listen(Composite.EVENT_ERROR, function(event, Error) {
    ...
});
```

### Composite.EVENT_ERROR
The error event is triggered for unhandled runtime errors. Syntax errors that
prevent JavaScript from being executed generally cannot trigger the error event.



- - -
&#9665; [Resource Bundle](message.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#events)
&nbsp;&nbsp;&nbsp;&nbsp; [API Extension](extensions.md) &#9655;
