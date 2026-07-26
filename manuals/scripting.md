&#9665; [Markup](markup.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#scripting)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite](composite.md) &#9655;
- - -

# Scripting
Seanox aspect-js uses Composite JavaScript, a JavaScript dialect for browsers
extended with a small set of [macros](#macros).

Composite JavaScript is executed directly in an isolated runtime scope rather
than as a script element. Variables, constants and functions declared in a
module are local to that module and are not automatically available in the
global scope or in other modules. The [macros](#macros) provide language
extensions for tasks such as importing modules, exporting declarations and
creating namespaces.

## Contents Overview
- [Embedded Composite-JavaScript](#embedded-composite-javascript)
- [Modules](#modules)
- [Macros](#macros)
  - [#export](#export)
  - [#import](#import)
  - [#module](#module)
  - [#use](#use)
  - [(?...) tolerate](#-tolerate)
- [Debugging](#debugging)

## Embedded Composite JavaScript
Embedded scripting has specific runtime behavior. Standard scripts are executed
automatically by the browser and independently of rendering. Markup for rendering
therefore supports the additional script type `composite/javascript`. It uses
normal JavaScript, but the browser does not recognize it as `text/javascript`
and does not execute it directly. The renderer recognizes the JavaScript code
and executes it in every relevant render cycle. This allows SCRIPT elements to
be combined with other composite attributes to control execution.

```html
<script type="composite/javascript">
    ...
</script>
```

## Modules
Modules are part of the composite concept. Composite resources (JS, CSS, HTML)
can be outsourced to the module directory and loaded at runtime. This allows
modules to be outsourced to the module directory and loaded at runtime,
supporting modular deployment of platform and modules in micro-frontends.

Modules can also be used in JavaScript without composites. The logic is stored
in individual files in the module directory and, if necessary, in further
subdirectories.

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

The modules are then loaded programmatically with `Compoiste.include(...)`,
`Compoiste.load(...)` or preferably with the macro [#import](#import).

__When calling modules, the file extension is omitted.__

```javascript
#import moduleA moduleB
#import example/moduleE example/moduleF
```

## Macros
Macros are a meta-syntax that fits into the existing JavaScript syntax. They are
abbreviated notations for common JavaScript statements.

### #export
Composite JavaScript is executed directly in an isolated runtime scope rather
than as a script element. Variables, constants and functions declared in a
module are local to that module and are not automatically available in the
global scope or in other modules.

The `#export` macro makes selected variables, constants and functions available
in the global scope. It expects a space-separated list of names that extends to
the end of the line or the next semicolon.

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
The macro loads one or separated by spaces several (Composite-)JavaScript
modules from the module directory. JavaScript modules are loaded only once, no
matter if directly via [#import](#import) or indirectly as a resource to a
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

### #module
This macro has been implemented as an aid for debugging. It expects text to the
end of the line or to the next semicolon, which is output in the browser
console in the debug level.

```javascript
#module some text;
```

As a special feature, the string expression syntax of JavaScript is also
supported, which allows the use of variables.

```javascript
const value = "Hallo Welt!";
#module some more complex text: ${value} ... ${1 + 2};
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
Resources and modules, including JavaScript, are loaded only at runtime. The
browser therefore does not know the sources and does not show the modules in the
developer tools. This is relevant for breakpoints. The entry point into the
JavaScript must be accessed through the browser console. The console output also
contains a link to the output source. This link opens the module source code in
the debugger, where breakpoints can be used. Since modules are loaded
dynamically at runtime, they are not initially available  in the developer tools
of the browser.

Modules should generate console output for debugging. This can be done manually
via the `console` object or with the macro [#module](#module).

```javascript
#module example;
...
```



- - -
&#9665; [Markup](markup.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#scripting)
&nbsp;&nbsp;&nbsp;&nbsp; [Composite](composite.md) &#9655;
