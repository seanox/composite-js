&#9665; [Getting Started](getting-started.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Markup](markup.md) &#9655;
- - -

# Expression Language
The expression language embeds JavaScript in composite-js markup. Expressions
can access browser APIs and application objects available in their execution
scope.

## Contents Overview
- [Expressions](#expressions)
  - [Values](#values)
  - [Function Calls](#function-calls)
  - [Declarations](#declarations)
  - [Combination](#combination)
  - [Delimiters](#delimiters)
  - [Line Breaks](#line-breaks)
- [Markup Extensions for Expressions](#markup-extensions-for-expressions)
- [JavaScript API](#javascript-api)
- [Notes](#notes)

## Expressions
Expressions use `{{...}}` to embed JavaScript in markup within text nodes and
attributes of the `<body>` element, excluding the contents of `<style>` and
`<script>` elements.

Text outside of expressions can be combined in attributes and text nodes.

```html
<p>Today is {{Calendar.weekday}} and it's {{Clock.time}}.</p>
```

Standalone value expressions supply their JavaScript value to the surrounding
markup; interpolation produces text.

The surrounding markup determines how results are rendered:

| Context                       | Example                              | Result                     |
|-------------------------------|--------------------------------------|----------------------------|
| Text node                     | `{{undefined}}` or `{{null}}`        | No output                  |
| Ordinary attribute            | `title="{{undefined}}"`              | Attribute removed          |
| Ordinary attribute            | `title="{{null}}"`                   | Attribute value `"null"`   |
| Mixed attribute interpolation | `title="before {{undefined}} after"` | `"before undefined after"` |
| Content instruction           | `output="{{}}"` or `import="{{}}"`   | Text `"undefined"`         |

Runtime instructions such as [condition](markup.md#condition) and [iterate](
    markup.md#iterate) apply their own value requirements.

Empty expressions are removed from text nodes and mixed interpolation. A
standalone empty value expression evaluates to `undefined`.

Synchronous execution errors are logged with the expression context, and their
thrown values are processed as results rather than propagated. Errors can
therefore appear in rendered output. Promises are not awaited, and later
rejections are not handled.

For execution scope and shared state, see [Declarations](#declarations). Prefer
side-effect-free rendering expressions; initialize application modules in
[composite scripts](architecture.md#view).

### Values
The examples assume that `Example` is available to the expression. Local
composite-script bindings are not exposed automatically; see [expose](
    scripting.md#expose) and [Scopes](architecture.md#scopes).

```text
{{Example.object.field}}
```

```html
<input id="ExampleInput" value="Hello World!">
{{document.getElementById("ExampleInput").value}}
```

Bare element-ID names may resolve through browser named access; they are not a
composite-js expression feature.

### Function Calls
```text
{{Example.getData()}}
```

If a property may be absent and no output is acceptable:

```text
{{attempt(() => Example.object.optional.value)}}
```

[`attempt(callback)`](scripting.md#attempt) is automatically available in
expressions. It returns the callback's result or `undefined` on a synchronous
error, without logging. Use it only when a missing result is acceptable.

### Declarations
In text nodes, `{{name: expression}}` creates or sets a variable in the view
scope without producing output. The identifier uses `_ a-z A-Z 0-9`, cannot
start with a digit, and must be followed immediately by the colon. This
declaration syntax belongs to composite-js, not to JavaScript variable
declarations.

```html
{{label: Example.object.field}}
<p>{{label}}</p>
```

Subsequent expressions can read `label` by name. Declarations are evaluated
again when their text nodes are rendered; they are not one-time initialization
statements.

Ordinary attributes do not support declaration expressions. The [iterate](
    markup.md#iterate) instruction uses this syntax for its temporary iteration
variable rather than a persistent view scope declaration.

> [!IMPORTANT]
> __View Scope Variables:__ These are shared across the running page, not
> isolated per composite or global JavaScript bindings. Bare-name reassignment
> affects only the current evaluation; use `view.name` for persistent
> assignments. Mutations of referenced objects can persist. Access persistent
> application state through `application`; see the [Scope overview](
>     architecture.md#scopes).

### Combination
Encode markup-sensitive characters as required by HTML or XML, for example
`&amp;&amp;`:

```html
{{label: Example.enabled &amp;&amp; Example.ready ? Example.title.toUpperCase() : ''}}
```

### Delimiters
In markup, a match starts at `{{` and ends at the first subsequent `}}`.
JavaScript strings, comments, template literals, and backslashes do not mask
this boundary. For example, `\{{value}}` evaluates the expression and retains
the preceding backslash. Unmatched `{{` and stray `}}` remain ordinary text.

To include `}}` in a JavaScript string, write `\}\}`. Separate adjacent
structural closing braces with whitespace:

```text
{{"\}\}"}}
{{({outer: {value: 3} }).outer.value}}
```

These expressions produce `}}` and `3`. JavaScript interprets the string
escapes; the runtime does not decode them or parse nested expressions.

### Line Breaks
Line breaks are preserved. Expressions execute in strict mode and may contain
multiple statements; their result is the final expression value. A top-level
`return` is not supported.

```text
{{
    const amount = 2; // Number of items
    amount * 3
}}
```

The expression evaluates to `6`.

## Markup Extensions for Expressions
These optional, case-sensitive markup extensions provide markup-friendly
spellings for JavaScript operators. Normal JavaScript operators are also
supported. Composer translates the extensions in complete markup expressions
before evaluation; direct calls to `Expression.eval` expect JavaScript
operators.

| Extension | JavaScript |
|-----------|------------|
| `:and`    | `&&`       |
| `:div`    | `/`        |
| `:empty`  | `!`        |
| `:eeq`    | `===`      |
| `:eq`     | `==`       |
| `:ge`     | `>=`       |
| `:gt`     | `>`        |
| `:le`     | `<=`       |
| `:lt`     | `<`        |
| `:mod`    | `%`        |
| `:ne`     | `!=`       |
| `:nee`    | `!==`      |
| `:not`    | `!`        |
| `:or`     | `\|\|`     |

An extension must be bounded by whitespace or the beginning/end of the
expression body. `a :and b` and `:not value` are replaced; `a:and b`,
`:not(value)`, and `:AND value` are not. `foo :and value` is an expression using
an extension, not a declaration of `foo`.

Replacement is textual and also applies inside strings, comments, regular
expressions, and template literals: `{{'a :and b'}}` produces `a && b`. To
retain that sequence in a string, use `{{'a \u003aand b'}}`, which produces
`a :and b`. Replacement applies to source text, not evaluated string results.
Bare words such as `and`, `not`, or `empty` are ordinary JavaScript identifiers.
`:empty` means `!`, not a collection-size test.

The [Combination](#combination) example can also use these extensions:

```text
{{label: Example.enabled :and Example.ready ? Example.title.toUpperCase() : ''}}
```

## Notes
After runtime bootstrap, [release](markup.md#release) hides an element until
rendering completes. To hide it before bootstrap, include
`[release] { display: none !important; }` in the document's initial styles.

```html
<h1 release>{{'Hello World!'}}</h1>
```

For attributes the browser processes before rendering, such as an image's `src`,
use an [@-attribute](markup.md#-attributes) template:

```html
<img @src="{{Example.imageUrl}}" alt="">
```

Text-node expressions render plain text, not HTML. [output](markup.md#output)
replaces the element's content on each render; [import](markup.md#import)
inserts content once and is then consumed. Both instructions can interpret
strings as HTML:

```html
<p>{{'<strong>Hello</strong>'}}</p>
<p output="{{'<strong>Hello</strong>'}}"></p>
```

Use text-node interpolation for external or user-provided text rather than
inserting it as [executable markup](architecture.md#trust-boundary).

For DataSource locators and localized text, see [DataSource](
    datasource.md#locator) and [Messages](message.md).



- - -
&#9665; [Getting Started](getting-started.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Markup](markup.md) &#9655;
