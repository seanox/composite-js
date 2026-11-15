&#9665; [Events](events.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [Test](test.md) &#9655;
- - -

# API Extensions
The runtime extends the browser's JavaScript API with the functions and
properties described below.

## Contents Overview
- [Arguments](#arguments)
  - [Arguments.bind](#argumentsbind)
- [Math](#math)
  - [Math.serial](#mathserial)
- [Object](#object)
  - [Object.prototype.serial](#objectprototypeserial)
  - [Object.lookup](#objectlookup)
  - [Object.exists](#objectexists)
  - [Object.use](#objectuse)
  - [Object.usable](#objectusable)
- [RegExp](#regexp)
  - [RegExp.quote](#regexpquote)
- [String](#string)
  - [String.prototype.capitalize](#stringprototypecapitalize)
  - [String.prototype.uncapitalize](#stringprototypeuncapitalize)
  - [String.prototype.encodeHex](#stringprototypeencodehex)
  - [String.prototype.decodeHex](#stringprototypedecodehex)
  - [String.prototype.encodeBase64](#stringprototypeencodebase64)
  - [String.prototype.decodeBase64](#stringprototypedecodebase64)
  - [String.prototype.encodeHtml](#stringprototypeencodehtml)
  - [String.prototype.hashCode](#stringprototypehashcode)
  - [String.prototype.unescape](#stringprototypeunescape)
- [window](#window)
  - [window.serial](#windowserial)
  - [window.compliant](#windowcompliant)
  - [window.compliant.version](#windowcompliantversion)
  - [window.location.combine](#windowlocationcombine)
  - [window.location.contextPath](#windowlocationcontextpath)

## Arguments

### Arguments.bind
`Arguments.bind(values, signatures)` maps positional argument values to named
parameters using the first matching signature. It returns a new, shallow-frozen
object; referenced objects are neither copied nor frozen.

Both arguments must be arrays. Each signature maps parameter names to arrays of
allowed types. Parameter positions follow `Object.keys(signature)` order.

```javascript
const options = Arguments.bind(["items", 10], [
    {name: [String]},
    {name: [String], limit: [Number]}
]);
// returns {name: "items", limit: 10}, frozen
```

Only signatures with the effective argument count are considered: the smaller of
`values.length` and the longest signature's parameter count. Surplus values
beyond that maximum are ignored. Missing values are not filled in, and type
mismatches do not cause a retry with a shorter signature. An empty signature
`{}` supports calls with no values.

Among signatures with that count, the first matching signature wins; more
specific types do not receive priority. Type checks do not coerce values:

| Allowed type                                    | Accepted values                                                           |
|-------------------------------------------------|---------------------------------------------------------------------------|
| `String`, `Number`, `Boolean`                   | Corresponding primitives, including `NaN` for `Number`; not boxed values. |
| `Function`                                      | Functions.                                                                |
| `Object`                                        | Non-null objects, including arrays; not functions.                        |
| Other types, such as `Array`, `Date`, `Element` | Values accepted by `instanceof` for that type.                            |

Invalid definitions, missing matching argument counts and type mismatches throw
`TypeError`. All signature definitions are validated before matching. An empty
type list accepts no value; an empty signatures array matches no call.

## Math

### Math.serial
Creates a time based alphanumeric serial identifier that is chronologically
sortable as text and contains the time and a counter if serial are created at
the same time.

```javascript
Math.serial()
// returns string e.g. "89BFASDV910"
```

## Object
`Object.lookup`, `Object.exists` and `Object.use` address namespaces as object
trees. They share the same arguments: an optional object or array root and a
single complete string path, for example `Object.lookup(model,
"items[0].name")`. Variadic path fragments are not supported.

The supported signatures are `method()`, `method(path)`, `method(root)`,
`method(root, path)` and `method(undefined, path)`. A defined path requires an
object/array root or `undefined` and must be a string. An `undefined` path is
treated as omitted. `lookup` and `exists` ignore arguments after the path. `use`
additionally supports `Object.use(root, path, value)`, which requires an
explicit non-null object/array root and a valid path, and ignores arguments
after the value. In the assignment form, missing `root` and `path` arguments are
checked first and throw `TypeError` with `Missing argument: root` or `Missing
argument: path`. An `undefined` value is treated as omitted: `use` ensures the
object structure without assigning `undefined`.

| Method                         | Operation                                                     | Result                                                                             |
|--------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------|
| [Object.lookup](#objectlookup) | Read without mutation.                                        | Resolved value of any type, or `undefined`.                                        |
| [Object.use](#objectuse)       | Ensure a structure, or assign a value below an explicit root. | Last object/array, assigned value, or `undefined` if the implicit root is missing. |
| [Object.exists](#objectexists) | Check for a value other than `null`/`undefined`.              | Boolean; not a property-presence or truthiness test.                               |

__Prefer an explicit root in application code.__ Resolution then stays on that
object, without global lookup or publication. Without a root, or with
`undefined` as the root argument, the first fragment determines the search:

| Initial fragment            | Root resolution                                                                                     |
|-----------------------------|-----------------------------------------------------------------------------------------------------|
| `App`                       | Global name, including `const`/`let` in classic scripts; if `undefined`, fall back to `window.App`. |
| `[App]`, `["App"]`, `"App"` | `window.App` only, without lexical name lookup.                                                     |

Local function and ES-module bindings require an explicit root. Remaining
fragments always use property access, including inherited properties. Accessing
a global `const`/`let` binding before its initialization throws
`ReferenceError`; there is no fallback to `window` in that case. Passing only an
object/array returns it from `lookup`/`use`, and `true` from `exists`. Without
arguments, or with only `undefined`, the results are `undefined`, `undefined`
and `false`, respectively.

__Paths are an addressing grammar, not JavaScript expressions:__

| Path notation                                  | Meaning                                                       |
|------------------------------------------------|---------------------------------------------------------------|
| `a.b`                                          | ASCII identifiers matching `[A-Za-z_$][A-Za-z0-9_$]*`.        |
| `a[property]`                                  | Fixed key `"property"`, not a variable.                       |
| `items[007]`                                   | Numeric key `"7"`, normalized without rounding.               |
| `items["007"]`                                 | Exact string key `"007"`.                                     |
| `a["-1"]`, `a["child.name"]`, `a."child.name"` | Literal keys; single quotes and backticks are also supported. |

Literals allow any string key, including Unicode and empty keys. Escapes are
decoded once; decoded dots/brackets stay inside the key. Backticks do not
interpolate. Whitespace is allowed only inside literals and bracket padding.
`[-1]`, `[1.5]`, `items.7` and numeric path arguments are invalid. Beyond the
native array-index range, numeric keys are ordinary array properties and do not
change `length`.

The complete path is validated before traversal or mutation. Required branches
must be non-null objects or arrays; DOM objects are supported and functions
cannot serve as branches. Invalid arguments/branches throw `TypeError`, invalid
paths or malformed escapes throw `SyntaxError`, and out-of-range Unicode escapes
throw `RangeError`.

### Object.prototype.serial
Returns the object's `uid`. If `uid` is `undefined`, generates a numeric
identifier from a runtime-local counter and stores it using
`Object.defineProperty`. A newly created property is non-enumerable,
non-writable and non-configurable. Native property-definition errors propagate.

An existing `uid` value other than `undefined`, including an inherited value, is
returned unchanged; its uniqueness and immutability are not enforced. Native
property-definition errors propagate, for example when creating a UID on a
non-extensible object after `Object.freeze` or `Object.seal`.

```javascript
const object1 = {};
const object2 = {};

object1.serial() != object2.serial();

const element1 = document.createElement("a");
const element2 = element1.cloneNode(true);

element1.serial() != element2.serial();
```

### Object.lookup
Reads a path without changing the tree. The end value is returned unchanged,
including arrays, primitives, functions and `null`. A missing root or branch
returns `undefined`; traversing through an incompatible value throws.

```javascript
const model = {items: [{name: "example"}], keys: {"x\ny": 1}};
Object.lookup(model, "items[000].name");
// returns "example"
Object.lookup(model, "missing.child");
// returns undefined; no mutation
Object.lookup(model, 'keys["x\\ny"]');
// returns 1; splitter decodes the escape
Object.lookup(model, 'keys["x\ny"]');
// returns 1; JavaScript already decoded it
```

### Object.exists
Equivalent to `Object.usable(Object.lookup(root, path))`: only `null` and
`undefined` produce `false`; `false`, `0` and `""` produce `true`. This is
__not__ an `in`/own-property check or a Boolean conversion. Lookup errors
propagate; no objects are created.

```javascript
const settings = {enabled: false, theme: null};
Object.exists(settings, "enabled");
// returns true
Object.exists(settings, "theme");
// returns false, although the property is present
"theme" in settings;
// returns true
Object.exists(settings, "missing");
// returns false
```

### Object.use
Without a value, or with `undefined`, an __ensure operation__, not just a
lookup: creates missing structure below an existing root and returns the last
object/array reference. Existing containers are reused, never converted or
overwritten with a different type.

A missing container becomes `[]` if the __next fragment__ is an unquoted
all-digit index; otherwise it becomes `{}`. Quoted numeric keys do not request
arrays. A missing last level is always `{}`; an existing last level must be a
non-null object or array.

```javascript
const root = {};
const details = Object.use(root, "items[007].details");
// creates root.items as [], root.items[7] and its details as {}
details === root.items[7].details; // true
Object.use(root, 'named["007"]["-1"]');
// creates {} containers and preserves the literal keys
```

An implicit root must already exist: `Object.use("MissingApp.settings")` returns
`undefined` if `MissingApp` is absent. To create a global root, pass `window`
explicitly: `Object.use(window, "NewApp.settings")`. No lexical bindings are
created. Native assignment errors propagate, including writes to frozen
containers or missing indexed `window` properties, which represent child frames
rather than writable array slots.

With a value other than `undefined`, `Object.use(root, path, value)` creates
missing intermediate branches, assigns `value` to the final key using normal
strict-mode JavaScript assignment, and returns `value` unchanged. The root must
be an explicit non-null object or array, and the path must be a valid nonempty
string. An implicit or `undefined` root is not allowed in this mode.

All defined values are accepted, including `null`, `false`, `0`, `""` and
functions. Existing end values are overwritten; intermediate objects/arrays are
reused without conversion, and incompatible intermediate values still throw. The
final property is not read before assignment, so setters receive the value once
without an intermediate placeholder. Native assignment errors propagate.

```javascript
const root = {};
Object.use(root, "a.b.c[10]", "a");
// returns "a"; c is [], c[10] is "a"
Object.use(root, 'named["a"]', 10);
// returns 10; named is {}, named.a is 10
Object.use(root, "a.b.c[11]", undefined);
// ensures and returns {} at c[11]
Object.use(root, "named", false);
// overwrites the final object with false
```

### Object.usable
Checks a value directly, without resolving an object path. Returns `false` only
for `null` and `undefined`, including an argumentless call. All other values
return `true`, including `false`, `0`, `NaN` and `""`.

```javascript
Object.usable();
// returns false
Object.usable(null);
// returns false
Object.usable(false);
// returns true
Object.usable(0);
// returns true
Object.usable("");
// returns true
Object.usable("missing");
// returns true; the string is not looked up
```

## RegExp

### RegExp.quote
Creates a literal pattern for the specified text. Metacharacters or escape
sequences in the text thus lose their meaning. Returns `null` for `null` or
`undefined`; other values are converted to strings before escaping.

```javascript
RegExp.quote("only a text with a + b (as an example)");
// returns string "only a text with a \+ b \(as an example\)"
```

## String

### String.prototype.capitalize
Converts the first character to uppercase, leaving the rest unchanged.

```javascript
("hello world").capitalize();
// returns string "Hello world"
```

### String.prototype.uncapitalize
Converts the first character to lowercase, leaving the rest unchanged.

```javascript
("Hello World").uncapitalize();
// returns string "hello World"
```

### String.prototype.encodeHex
Encodes each UTF-16 code unit as uppercase hexadecimal with at least two digits
and prefixes the result with `0x`. An empty string returns `""`.

This is neither UTF-8 encoding nor fixed-width UTF-16 encoding. Code units above
`0xFF` do not round-trip through [decodeHex](#stringprototypedecodehex).

```javascript
("hello world").encodeHex();
// returns string "0x68656C6C6F20776F726C64"

("\u20AC").encodeHex();
// returns string "0x20AC"
```

### String.prototype.decodeHex
Reads the characters after the `0x` prefix in groups of up to two hexadecimal
digits, converting each group to one character. These values are not interpreted
as UTF-8 or UTF-16 sequences.

An empty string returns `""`. Nonempty input without the case-sensitive `0x`
prefix throws `Error("Malformed hexadecimal character sequence")`. The remaining
content is not fully validated; do not use this method to validate hex input.

```javascript
("0x68656C6C6F20776F726C64").decodeHex();
// returns string "hello world"

("0x20AC").decodeHex();
// returns string "\u0020\u00AC", not "\u20AC"
```

### String.prototype.encodeBase64
Encodes the string as UTF-8 text in Base64. Malformed Unicode input, such as an
unpaired surrogate, throws `Error("Malformed character sequence")`.

```javascript
("hello world").encodeBase64();
// returns string "aGVsbG8gd29ybGQ="
```

### String.prototype.decodeBase64
Decodes Base64 containing UTF-8 text. Invalid Base64 or invalid UTF-8 data
throws `Error("Malformed character sequence")`; this is not a decoder for
arbitrary binary data.

```javascript
("aGVsbG8gd29ybGQ=").decodeBase64();
// returns string "hello world"
```

### String.prototype.encodeHtml
Escapes the string for use as text in HTML markup by assigning it to a temporary
element's `textContent` and returning its `innerHTML`. Quotes are not escaped;
this is not an encoder for HTML attribute values, JavaScript or URLs.

```javascript
("<hello world> & abc").encodeHtml();
// returns string "&lt;hello world&gt; &amp; abc"
```

### String.prototype.hashCode
Calculates an alphanumeric hash value for the string.

```javascript
("hello world").hashCode();
// returns string "B1OQGUCARUTF1"
```

### String.prototype.unescape
Decodes control, octal, hexadecimal, and Unicode escape sequences, including
four-digit Unicode escapes and Unicode code point escapes. Supported numeric
forms are `\0` to `\777` (one to three octal digits), `\xHH`, `\uHHHH`, and
`\u{H}` (one to six hexadecimal digits).

Decoding happens once from left to right. Each `\\` pair becomes one literal
backslash; decoded characters are not interpreted as another escape sequence.
Unknown simple escapes such as `\q` yield the escaped character (`q`). Malformed
hexadecimal or Unicode escapes and a trailing unpaired backslash throw
`SyntaxError`. Unicode code points above U+10FFFF throw `RangeError`.

```javascript
("a\\tb").unescape();
// returns string "a\tb" (one tab character)

("\\u0041").unescape();
// returns string "A"

("\\x5cn").unescape();
// returns the literal backslash followed by "n", not a newline
```

## window

### window.serial
Returns the time-based alphanumeric identifier generated for this window when
the runtime loads. Every call returns the same string, using the format of
[Math.serial](#mathserial).

```javascript
window.serial()
// returns string e.g. "89BFASDV910"
```

### window.compliant
`window.compliant(context, payload)` assigns `payload` to the JavaScript target
specified by `context` and returns the assigned value. If the target already
resolves to a value other than `undefined`, it throws `Error("JavaScript
incompatibility detected for: " + context)`. An existing property with value
`undefined` can be assigned.

A simple identifier publishes a property on `window`. For nested targets, the
parent object must already exist; missing parents and native assignment errors
propagate.

```javascript
window.compliant("example", {});
window.compliant("example.variable", "...");
window.compliant("example.object", {});
window.compliant("example.function", (param1, param2, param3) => {});
```

The target is evaluated as JavaScript, not parsed with the
[Object path grammar](#object). Use application-defined targets, not untrusted
input.

With `null` or `undefined` as `context`, the method simply returns `payload`
without assigning it. An omitted payload is `undefined`; assigning it does not
reserve the target against subsequent calls.

### window.compliant.version
Property to get the version of Seanox composite-js.

```javascript
window.compliant.version
// returns a string containing the runtime version
```

### window.location.combine
Combines text elements to a path. The method has an optimizing effect in the use
of slash and backslash. The result always starts with a slash and has no
trailing slash, except when the result is the root path `/`.

```javascript
window.location.combine("a", "b", "c")
// returns string "/a/b/c"

window.location.combine("/")
// returns string "/"
```

### window.location.contextPath
Context path captured from `window.location.pathname` when the runtime loads:
the pathname before its last slash. It is empty for a page directly under the
server root and is not recomputed after navigation through the History API.

```javascript
window.location.contextPath
// returns string e.g. /apps/test for URL https://example.local/apps/test/index.html
```



- - -
&#9665; [Events](events.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [Test](test.md) &#9655;
