&#9665; [Resource Bundle](message.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#events)
&nbsp;&nbsp;&nbsp;&nbsp; [API Extension](extensions.md) &#9655;
- - -

# Events
Seanox composite-js provides events for extensions and for notifying the
application about runtime state changes during the Composite lifecycle.

## Contents Overview
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

## Rendering
The following events occur during rendering. The current selector is passed to
the callback method, which can influence the selector and the corresponding
element, but not the rendering.

```javascript
Composer.listen(Composer.EVENT_RENDER_***, function(event, selector) {
    ...
});
```

### Composer.EVENT_RENDER_START
The event occurs when rendering starts. Processing starts after the event.

### Composer.EVENT_RENDER_NEXT
The event occurs during recursive rendering iteration when another element
starts rendering during a render cycle. Processing starts after the event.

### Composer.EVENT_RENDER_END
The event occurs after rendering has ended. Processing ends before the event.

## Composite Binding
The following events occur during composite binding. As with the rendering
events, the current selector is passed to the callback method, which can
influence the selector and the corresponding element, but not the binding.

```javascript
Composer.listen(Composer.EVENT_MOUNT_***, function(event, selector) {
    ...
});
```

### Composer.EVENT_MOUNT_START
The event occurs when binding starts. Processing starts after the event.

### Composer.EVENT_MOUNT_NEXT
The event occurs during recursive binding iteration when another element starts
binding during a render cycle. Processing starts after the event.

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
The runtime supports application-wide event management for HTTP requests to
implement request-related application logic, for example, for logging or
spinners.

The events are described independently of the request API. Currently, only
requests via XMLHttpRequest are captured. For each event, the corresponding
XMLHttpRequest event is named as a reference.

The callback method is passed the event of the underlying request, not the
request object itself. With XMLHttpRequest, this is a `ProgressEvent` whose
property `target` contains the corresponding XMLHttpRequest.

```javascript
Composer.listen(Composer.EVENT_HTTP_***, function(event, payload) {
    ...
});
```

The events are also triggered by the requests with which the runtime loads the
outsourced resources of the composites. These requests are synchronous and
therefore do not dispatch the events `loadstart` and `progress`, and the
`readyState` values 2 (`HEADERS_RECEIVED`) and 3 (`LOADING`) are skipped, so
`Composer.EVENT_HTTP_START` and `Composer.EVENT_HTTP_PROGRESS` do not occur for
them. A spinner is of no use here anyway, because the browser cannot repaint
during a synchronous request.

### Composer.EVENT_HTTP_START
Triggered when a request to load data is started.  
XMLHttpRequest: `loadstart`

### Composer.EVENT_HTTP_PROGRESS
Triggered periodically when a request receives further data.  
XMLHttpRequest: `progress`

### Composer.EVENT_HTTP_RECEIVE
Triggered when the status of the request/response changes.  
XMLHttpRequest: `readystatechange`

### Composer.EVENT_HTTP_LOAD
Triggered when a resource is loaded. This also applies to HTTP status codes that
indicate an error, because the transfer itself was successful.  
XMLHttpRequest: `load`

### Composer.EVENT_HTTP_ABORT
Triggered when the loading of a resource is aborted.  
XMLHttpRequest: `abort`

### Composer.EVENT_HTTP_TIMEOUT
Triggered when the loading of a resource is aborted because the maximum loading
time has been exceeded.  
XMLHttpRequest: `timeout`

### Composer.EVENT_HTTP_ERROR
Triggered when the request fails, e.g. due to a network error. HTTP status codes
that indicate an error do not trigger this event.  
XMLHttpRequest: `error`

### Composer.EVENT_HTTP_END
Triggered when the request is completed, regardless of any errors or successful
completion.  
XMLHttpRequest: `loadend`

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
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#events)
&nbsp;&nbsp;&nbsp;&nbsp; [API Extension](extensions.md) &#9655;
