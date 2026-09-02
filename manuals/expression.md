&#9665; [Getting Started](getting-started.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Markup](markup.md) &#9655;
- - -

# Expression Language
The expression language provides access to client-side JavaScript and to the
application modules in _composite-js_. Expressions support the JavaScript API
and additional keywords for arithmetic and logical operators.

```
{{'Hello World!'}}
```

The expression language can be used in markup from the HTML element `BODY`. It
can be used as free text and in attributes. The content of the HTML elements
`STYLE` and `SCRIPT` is not supported.

During rendering, the composer interprets the expression syntax `{{...}}`.
Inside an expression, the character sequences `{{` and `}}` must be escaped as
`\{\{` and `\}\}`.

## Contents Overview
- [Elements](#elements)
  - [Text](#text)
  - [Literal](#literal)
  - [Keyword](#keyword)
  - [Value](#value)
  - [Method](#method)
  - [Logic](#logic)
- [Expressions](#expressions)
  - [Value-Expression](#value-expression)
  - [Method-Expression](#method-expression)
  - [Element-Expression](#element-expression)
  - [Variable-Expression](#variable-expression)
  - [Combination](#combination)
  - [(?...) tolerate](#-tolerate)
- [Notes](#notes)

## Elements
An expression is a set of words. The words are classified by their
characteristics.

```
+-------------------------------------------------------------+
|            Words (all elements of an expression)            |
+--------+----------------------------------------------------+
|  Text  |                     Expression                     |
|        +-----------+----------------------------------------+
|        |  Literal  |                 Script                 |
|        |           +-----------+----------------------------+
|        |           |  Keyword  |           Others           |
|        |           |           +---------+----------+-------+
|        |           |           |  Value  |  Method  | Logic |
+--------+-----------+-----------+---------+----------+-------+
```

### Text
Text is not a regular expression element. It occurs in attributes when the
expression language is combined with text.

```html
<p output="Today is {{Calendar.weekday}} and it's {{Clock.time}}."></p>
```

### Literal
Literals are text embedded in an expression with single, double or backtick
quotation marks. They support the usual control characters and escape sequences.

```
{{'Hello World!'}}
{{"Hello World!"}}
{{`Hello World!`}}
```

### Keyword
The following standard JavaScript syntax keywords are supported in the
expression language:

```
true
false
null
instanceof
typeof
undefined
new
```

The JavaScript syntax for the expression language has been extended with these
keywords to support valid markup:

| Keyword | Function                  |
|---------|---------------------------|
| `and`   | `&&`                      |
| `div`   | `/`                       |
| `empty` | `!`                       |
| `eeq`   | `===`                     |
| `eq`    | `==`                      |
| `ge`    | `>=`                      |
| `gt`    | `> `                      |
| `le`    | `<=`                      |
| `lt`    | `<`                       |
| `mod`   | `%`                       |  
| `ne`    | `!=`                      |
| `nee`   | `!==`                     |
| `not`   | `!`                       |  
| `or`    | <code>&#124;&#124;</code> |

### Value
Anything that is not a literal or keyword is potentially a value. A Value
represents an object property or variable. Object properties are accessed
directly or through a corresponding getter. If neither an object property nor a
variable can be determined, a method or other logic is assumed.

### Method
Everything that is not literal, keyword and value is potentially a method. If no
method can be determined, other logic is assumed.

### Logic
Everything that is not literal, keyword, value and method is potentially
executable logic.

## Expressions
Different expression types can be combined.

Expressions output all values except the value `undefined`. The string
`undefined` is interpreted as normal text.

### Value-Expression
Outputs a [value](#value) — the value of an object property or a variable.

```
{{Example.object.field}}
```

### Method-Expression
Calls a [method](#method) and outputs its return value.

```
{{Example.getData()}}
```

### Element-Expression
If a variable starts with `#` in an expression, this variable refers to an HTML
element with the same ID. If no matching HTML element can be found, the value of
the variable corresponds to `undefined`.

```
{{#ExampleElement.value}}

<input type="text" id="ExampleElement"/>
```

More complex IDs that do not contain only word characters (`_ a-z A-Z 0-9`) can
be enclosed in square brackets.

```
{{#[ExampleElement:1].value}}

<input type="text" id="ExampleElement:1"/>
```

### Variable-Expression
The expression language can create and set variables in the page scope at
runtime. The expression must start with the variable name (identifier), which
uses the word characters `_ a-z A-Z 0-9` and is separated from the expression by
a colon.

```
{{foo:1 +2 +3 + 'x hello'}}
```

Creates or sets the value for variable `foo` in the page scope with `6x hello`.

The expression corresponds to the JavaScript syntax:
    `var foo = 1 +2 +3 + 'x hello';`

> [!IMPORTANT]
> __Page Scope:__ Variables can only be used in the markup and are in a separate
> function scope from the rest of the JavaScript. They are intended for output
> and data processing in HTML markup and are not accessible in general
> JavaScript code.

### Combination
All types of expressions can be combined.

```
{{foo:not empty Foo.data and not empty Foo.data.items ? String(Foo.data.items[0].fieldA).substring(2) : ''}}
```

### (?...) tolerate
Expressions are executed like JavaScript and can cause corresponding errors.
Object-based approaches often require checks for specific object levels, which
can make expressions unclear.

For these cases, expressions can use the tolerating syntax `(?...)`. If the
logic inside the brackets causes an error, no error is raised and no output is
written to the browser console. Instead, the brackets represent the value
`false`. Syntax errors are excluded from this tolerating behavior.

```
{{"Expression with an error " + (?object.that.does.not.exist()) + "!"}}
```

## Notes
Expressions are interpreted by the composer during rendering after the page has
loaded. They can therefore be visible during page loading. Use the attribute
[release](markup.md#release) to prevent this.

```html
<h1 release>{{'Hello World!'}}</h1>
```

Alternatively, content can be stored in the DataSource in combination with the
attributes [output](markup.md#output) and [import](markup.md#import).

```css
h1:after {
  content:attr(title)
}
```

```html
<h1 title="{{'Hello World!'}}"/>

<h1 output="{{'Hello World!'}}"/>
<h1 output="{{'xml://example/content'}}"/>
<h1 output="xml://example/content"/>
<h1 output="{{Messages['hello']}}"/>

<h1 import="{{'Hello World!'}}"/>
<h1 import="{{'xml://example/content'}}"/>
<h1 import="xml://example/content"/>
<h1 import="{{Messages['hello']}}"/>
```



- - -
&#9665; [Getting Started](getting-started.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#language)
&nbsp;&nbsp;&nbsp;&nbsp; [Markup](markup.md) &#9655;
