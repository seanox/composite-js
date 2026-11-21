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
  - [Markup Encoding](#markup-encoding)
  - [Delimiters](#delimiters)
  - [Line Breaks](#line-breaks)
- [Markup Extensions for Expressions](#markup-extensions-for-expressions)
- [JavaScript API](#javascript-api)

## Expressions
Expressions use `{{...}}` to embed JavaScript in markup within text nodes and
attributes of the &lt;body&gt; element, excluding the contents of &lt;style&gt;
and &lt;script&gt; elements.

Text outside of expressions can be combined in attributes and text nodes.

```html
<p>Today is {{Calendar.weekday}} and it's {{Clock.time}}.</p>
```

Standalone value expressions supply their JavaScript value to the surrounding
markup; interpolation produces text.

The surrounding markup determines how results are rendered:

| Context                       | Example                              | Result                                     |
|-------------------------------|--------------------------------------|--------------------------------------------|
| Text node                     | `{{undefined}}` or `{{null}}`        | No output                                  |
| Ordinary attribute            | `title="{{undefined}}"`              | Attribute removed                          |
| Ordinary attribute            | `title="{{null}}"`                   | Attribute value `"null"`                   |
| Mixed attribute interpolation | `title="before {{undefined}} after"` | Attribute value `"before undefined after"` |
| Content instruction           | `output="{{}}"` or `import="{{}}"`   | Text `"undefined"`                         |

Text-node expressions render plain text, not HTML.

Empty expressions are removed from text nodes and mixed interpolation. A
standalone empty value expression evaluates to `undefined`.

Errors thrown during expression evaluation are logged with the expression
context and used as expression results.

For ordinary dynamic attributes, including [@-attribute templates](
    markup.md#-attributes), a standalone expression's result is passed unchanged
to `setAttribute()` and the property assignment under the target attribute name.
composite-js does not convert the result to a string or interpret `"true"` and
`"false"` as Booleans. The browser's DOM APIs and property setters perform their
own conversions. If text is required explicitly, use an expression such as
`{{String(example.value)}}`. Mixed interpolation remains text.

`undefined` is the only special case: composite-js removes the target attribute
and restores the browser default of its property. For each reset, it creates a
temporary element in the same document, with the same tag and namespace, outside
the DOM. No attributes or children are copied from the target: an input reference
does not inherit `type`, `min` or `max`. The value of the reference's property
under the target attribute name is assigned unchanged to the target property.
The target attribute remains removed even if its setter recreates it or throws.
The expression remains available for later render cycles.

This is the default of a fresh, unconfigured element, not a saved initial value
or an application-specific default. Native setter conversions and attribute
reflection still apply. For example, a user-edited text input is reset to `""`,
and a manually changed checkbox's `checked` property is reset to `false`.

HTML attributes and DOM properties are distinct. Their names are not
automatically translated: `readonly` is an attribute name, while `readOnly` is
the native property name. Boolean HTML attributes act through presence, not
their text. Use `readonly="{{example.locked ? '' : undefined}}"` to control that
attribute's presence. `checked="{{false}}"` assigns Boolean `false` to the
current `checked` property, but can retain `checked="false"` in the markup;
`checked="{{'false'}}"` passes a nonempty string and the native setter makes the
current property `true`.

Errors from attribute conversion, property assignment or obtaining the reference
default are logged and reported through `Composer.EVENT_ERROR` by the renderer.
Writes are not transactional: changes already made by the browser or a setter
are not rolled back, except that the target attribute remains removed on an
`undefined` reset.

This general contract does not replace the rules of runtime instructions such as
`condition`, `interval`, `validate`, `output` or `import`, nor the initial
processing of metadata such as `id`, `events` and static attributes.

### Values
The examples assume that `Example` is available to the expression. Local
composite-script bindings are not exposed automatically; see [expose](
    scripting.md#expose) and [scopes](architecture.md#scopes).

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
error, without logging.

### Declarations
In text nodes, `{{name: expression}}` creates or sets a variable in the view
scope without producing output. Names follow the usual ASCII naming pattern
for JavaScript variables. The colon must immediately follow the name.

```html
{{label: Example.object.field}}
<p>{{label}}</p>
```

Subsequent expressions can read `label` by name. Declarations are evaluated
again when their text nodes are rendered; they are not one-time initialization
statements.

> [!IMPORTANT]
> __View Scope Variables:__ These are shared across the running page, not
> isolated per composite or global JavaScript bindings. Bare-name reassignment
> affects only the current evaluation; use `view.name` for persistent
> assignments. Mutations of referenced objects can persist. Access persistent
> application state through `application`; see the [scope overview](
>     architecture.md#scopes).

### Markup Encoding
Expressions in HTML or XML source follow the encoding rules of the surrounding
markup. The browser resolves character references before expression evaluation;
for example, `&amp;&amp;` becomes JavaScript's `&&`:

```html
{{label: example.enabled &amp;&amp; example.ready ? example.title.toUpperCase() : ''}}
```

### Delimiters
In markup, a match starts at `{{` and ends at the first subsequent `}}`.
JavaScript strings, comments, template literals, and backslashes do not mask
this boundary. For example, `\{{value}}` evaluates the expression and retains
the preceding backslash. Unmatched `{{` and stray `}}` remain ordinary text.

To include `}}` in a JavaScript string, write `\}\}`. Separate adjacent
structural closing braces with whitespace:

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
These optional, case-sensitive extensions belong to markup, not JavaScript.
Within `{{...}}`, the spellings below are textually replaced with JavaScript
operators before evaluation, without interpreting the enclosed code.

| Equality | JavaScript | Relational | JavaScript | Logical  | JavaScript | Arithmetic | JavaScript |
| -------- | ---------- | ---------- | ---------- | -------- | ---------- | ---------- | ---------- |
| `:eq`    | `==`       | `:gt`      | `>`        | `:and`   | `&&`       | `:div`     | `/`        |
| `:eeq`   | `===`      | `:ge`      | `>=`       | `:or`    | `\|\|`     | `:mod`     | `%`        |
| `:ne`    | `!=`       | `:lt`      | `<`        | `:not`   | `!`        |            |            |
| `:nee`   | `!==`      | `:le`      | `<=`       | `:empty` | `!`        |            |            |

An extension must be bounded by whitespace or the beginning/end of the
expression body. `a :and b` and `:not value` are replaced; `a:and b`,
`:not(value)`, and `:AND value` are not. `foo :and value` is an expression using
an extension, not a declaration of `foo`.

Usage example

```text
{{label: example.enabled :and example.ready ? example.title.toUpperCase() : ''}}
```



- - -
&#9665; [Getting Started](getting-started.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Markup](markup.md) &#9655;
