&#9665; [Markup](markup.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite](composite.md) &#9655;
- - -

# Scripting
Seanox composite-js uses composite script, an extension of standard ECMAScript
that provides a small set of [macros](#macros) for browser-based module
execution.

Composite script is used for the JavaScript resources in the module directory.
It is executed directly in an isolated module scope rather than as a script
element. Variables, constants and functions declared in a module remain local to
that module and are not automatically available in the global scope or in other
modules. The [macros](#macros) provide language extensions for tasks such as
loading further JavaScript resources, exporting declarations and creating
namespaces.

## Contents Overview
- [Embedded Composite Script](#embedded-composite-script)
- [Modules](#modules)
- [Macros](#macros)
  - [#export](#export)
  - [#import](#import)
  - [#use](#use)
  - [(?...) tolerate](#-tolerate)
- [Debugging](#debugging)

## Embedded Composite Script
Embedded scripting has specific runtime behavior. Standard scripts are executed
automatically by the browser and independently of rendering. Markup for
rendering therefore supports the additional script type `composite/javascript`.
It uses normal JavaScript, but the browser does not recognize it as
`text/javascript` and does not execute it directly. The composer recognizes the
JavaScript code and executes it in every relevant render cycle. This allows
SCRIPT elements to be combined with declarative attributes such as `condition`
to control execution.

```html
<script type="composite/javascript">
    ...
</script>
```

## Modules
The module directory contains Composite modules, each grouping the resources of
a Composite. A JavaScript resource within a Composite module is called a
[Composite script](composite.md#javascript) and provides the application module.

JavaScript resources in the module directory can also exist independently of a
Composite. These are referred to informally as modules and can be used without
composites. The logic is stored in individual files in the module directory and,
if necessary, in further subdirectories.

The resources of a Composite (JS, CSS, HTML) can be outsourced to the module
directory and loaded at runtime, which supports the modular deployment of
platform and modules in micro-frontends.

```
+ modules
  + example
    - moduleE.js
    - moduleF.js
    - ...
  - moduleA.js
  - moduleB.js
  - ...
- index.html
```

The modules are then loaded programmatically with `Composer.include(...)`,
`Composer.load(...)` or preferably with the macro [#import](#import).

__When calling modules, the file extension is omitted.__

```javascript
#import moduleA moduleB
#import example/moduleE example/moduleF
```

## Macros
Macros are a meta-syntax that fits into the existing JavaScript syntax. They are
abbreviated notations for common JavaScript statements.

### #export
Composite script is executed directly in an isolated module scope rather than as
a script element. Variables, constants and functions declared in a module are
local to that module and are not automatically available in the global scope or
in other modules.

The `#export` macro makes selected variables, constants and functions available
in the global scope. Objects that participate in Composite binding must be
exported in this way. The macro expects a space-separated list of names that
extends to the end of the line or the next semicolon.

```javascript
const connector = {
    ...
};

const utilities = {
    ...
};

#export connector utilities;
```

Export names can include namespaces so that the elements are added there
explicitly.

```javascript
const connector = {
    ...
};

const utilities = {
    ...
};

#export connector@io.example utilities@io.example;
```

### #import
The macro loads one or several modules implemented as Composite script resources
from the module directory. Modules are loaded only once, regardless of whether
they are loaded directly via `#import` or indirectly as a resource of a
composite.

__When calling modules, the file extension is omitted.__

```javascript
#import moduleA
#import moduleA moduleB moduleC
```

It should be noted that the macro will result in an error if the server state is
different from 200. Since the macro integrates into the general JavaScript
syntax, the error can be caught as usual with try-catch.

```javascript
try {#import moduleA;
} catch (error) {
    ...    
}    
```

In the module directory subdirectories are also supported, which is represented
in the module names by the slash.

```javascript
#import example/io/connector;
```

### #use
The macro expects one or more space-separated namespaces to be created at the
object level if they do not already exist.

```javascript
#use a
#use a b c
#use a.b.c d.e.f g.h.i
```

### (?...) tolerate
The tolerating syntax `(?...)` is a special macro. If the logic inside the
brackets causes an error, no error is raised and no output is written to the
browser console. Instead, the brackets represent the value `false`. Syntax
errors are excluded from this tolerating behavior.

```javascript
const value = (?object.that.does.not.exist());
```

## Debugging
When loading Composite Scripts, the Runtime automatically appends a `sourceURL`
directive mapping the evaluated script to its original module path:

```javascript
//# sourceURL=/modules/example/module.js
```

This allows browser DevTools to expose the dynamically executed script as a
source in the sources panel. Composite scripts can therefore be opened,
searched, and debugged with breakpoints and the Debugger like regular JavaScript
sources.



- - -
&#9665; [Markup](markup.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite](composite.md) &#9655;
