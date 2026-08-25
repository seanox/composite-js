&#9665; [Expression Language](expression.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#markup)
&nbsp;&nbsp;&nbsp;&nbsp; [Scripting](scripting.md) &#9655;
- - -

# Markup
Markup is the declarative layer of _composite-js_. Structure, runtime functions,
and the binding to the application modules are declared in HTML instead of being
programmed, based on attributes, the expression language, embedded scripting,
and options for customization.

## Contents Overview
- [Attributes](#attributes)
  - [composite](#composite)
  - [condition](#condition)
  - [events](#events)
  - [id](#id)
  - [import](#import)
  - [interval](#interval)
  - [iterate](#iterate)
  - [message](#message)
  - [output](#output)
  - [release](#release)
  - [render](#render)
  - [route](#route)
  - [validate](#validate)
- [@-Attributes](#-attributes) 
- [Expression Language](#expression-language)
- [Scripting](#scripting)
- [Customizing](#customizing)
  - [Tag](#tag)
  - [Selector](#selector)
  - [Interceptor](#interceptor)
  - [Parameters](#parameters)
- [Runtime Hardening](#runtime-hardening)

## Attributes
In _composite-js_, the declarative approach is implemented with attributes. They
can be used and combined in all HTML elements starting with the HTML element
`BODY`. Attribute values can be static or dynamic through the expression
language. If an attribute contains an expression, the
[composer](architecture.md#composer) updates the value with each render cycle
based on the initial expression.

### composite
Marks an element in the markup as a [composite](composite.md#composite). A
composite requires an identifier, which together with the attribute forms the
composite ID.

```html
<article id="example" composite>
  ...
</article>
```

The resources of a composite (markup, CSS, JS) can be [outsourced](
    composite.md#resources) to the module directory based on the composite ID
and are loaded at runtime when the composite is used.

Composites are also the basis for [composite binding](
    composite-binding.md#composite-binding). It connects HTML elements in the
markup (view) with the corresponding application module. The view as
presentation and user interface for interactions remains decoupled from the
application module. Application modules provide the data, state and behavior
that are exposed to the view through composite binding. Binding links views and
application modules bidirectionally based on the composite IDs, so no manual
wiring between HTML elements and application module is required.

Details on the use of composites are described in the chapters
[Composite](composite.md#composite) and [Composite Binding](
    composite-binding.md#composite-binding).

### condition
As a condition, the attribute specifies whether an element remains contained in
the DOM. The expression specified as the value must explicitly return `true` to
retain the element. If the return value is different, the element is temporarily
removed from the DOM and can be reinserted later by refreshing the __parent
element__ if the expression returns `true`.

```html
<article condition="{{example.visible}}">
  ...
</article>
```

When combined with the attribute [interval](#interval), it should be noted that
when the element is removed from the DOM, the associated timer is also
terminated. If the element is added back to the DOM with a later refresh, a new
timer starts, so it is not continued.

```html
<article interval="{{1000}}" condition="{{example.visible}}">
  ...
</article>
```

The use of the condition attribute in combination with embedded JavaScript is
possible as SCRIPT element with the type `composite/javascript` as composite
script, because here the composer has control over the script execution and not
the browser.

```html
<script type="composite/javascript" condition="{{example.visible}}">
    ...
</script>
```

Details about using embedded JavaScript are described in chapter [Scripting](
    #scripting).

### events
Binds one or more [events](https://www.w3.org/TR/DOM-Level-3-Events) to an HTML
element. This allows for event-driven synchronization of HTML elements with the
corresponding properties of the application module, validation of synchronized
data (see [validate](#validate)) and event-driven control and refreshing of
other HTML elements (see [render](#render)).

As with all attributes, the expression language can be used here. However, the
value is read only once, when the HTML element is analysed for the first time,
and is then cached for composite binding. Later changes at runtime have no
effect.

```html
<span id="output1">{{#text1.value}}</span>
<input id="text1" type="text"
    events="input change" render="#output1"/>
```

The example synchronously refreshes the HTML element _output1_ with the events
_Input_ or _Change_ at the HTML element _text1_. The input value of _text1_ is
output synchronously with _output1_.

```javascript
const example = {
    validate(element, value) {
        return true;
    },
    text1: ""
};
```

```html
<form id="example" composite>
  <input id="text1" type="text"
      validate events="input change"/>
  <input type="submit" value="submit"
      validate events="click"/>
</form>
```

The example combines the attributes `events` and `validate`. The input value
from the composite field _text1_ is transferred to the property of the same name
in the application module only if the event _Input_ or _Change_ occurs.

### id
The ID (identifier) has a central role in _composite-js_. It is the basis for
[composite binding](composite-binding.md#composite-binding) and is used by
[routing](routing.md#routing) for [views](routing.md#view) in the [view flow](
    routing.md#view-flow) and as a destination for paths.

As with all attributes, the expression language can be used. However, due to
composite binding, the value is read only once, when the HTML element is
analysed for the first time, and is then cached. Later changes at runtime have
no effect.

### import
Loads the content for the HTML element at runtime and inserts it as inner HTML.
The behavior is similar to the [output](#output) attribute, except that the
import is done once and the import attribute is removed after successful
loading. As value one or more elements are supported as NodeList or Array, as
well as absolute or relative URLs to a remote resource and also the [DataSource
    URL (locator)](datasource.md#locator) for transformed content from the
[DataSource](datasource.md).

The import attribute can be combined with the condition attribute and will then
only be executed if the condition is `true`.

```javascript
const example = {
    publishForm() {
        const form = document.createElement("form");
        const label = document.createElement("label");
        label.textContent = "Input";
        form.appendChild(label);
        const input = document.createElement("input");
        input.value = "123";
        input.type = "text";
        form.appendChild(input);
        const submit = document.createElement("input");
        submit.type = "submit";
        form.appendChild(submit);
        return form;
    },
    publishImg() {
        const img = document.createElement("img");
        img.src = "https://raw.githubusercontent.com/seanox/composite-js/master/test/resources/smile.png";
        return img;
    }
};
```

```html
<article import="{{example.publishImg()}}">
  loading image...
</article>
<article import="{{example.publishForm()}}">
  loading form...
</article>
```

Example of importing a remote resource using the HTTP method GET.

```html
<article import="{{'https://raw.githubusercontent.com/seanox/composite-js/master/test/resources/import_c.htmlx'}}">
  loading resource...
</article>

<article import="https://raw.githubusercontent.com/seanox/composite-js/master/test/resources/import_c.htmlx">
  loading resource...
</article>
```

Example of importing via DataSource-URL. If only one URL is specified, the URI
for data and transformation are derived from it. 

```html
<article import="{{'xml://example/content'}}">
  loading resource...
</article>

<article import="xml://example/content">
  loading resource...
</article>

<article import="xml://example/content?count(//item)">
    loading resource...
</article>
```

Example of importing a DataSource-URL with a specific data URL (locator) and
transformation URL. As a value, the data URL (locator of the XML file) and the
transformation URL (locator of the XSLT template) are is specified, separated by
a blank character. 

```html
<article import="{{'xml://example/data + xslt://example/style'}}">
  loading resource...
</article>

<article import="xml://example/data + xslt://example/style">
  loading resource...
</article>

<article import="xml://example/data + xslt">
    loading resource...
</article>
```

If only _xslt_ is specified without a locator, a corresponding XSLT locator with
the same name is derived from the XML locator.

When inserting content from the DataSource, the type of JavaScript blocks is
automatically changed to `composite/javascript` and only executed by the
composite. This results in JavaScript being executed depending on the enclosing
condition attribute.

### interval
Activates an interval-controlled refresh of the HTML element without the need to
actively trigger the refresh. The interval uses the inner HTML as a template
from which updated content is generated and inserted with each interval cycle.
The attribute expects milliseconds as value, which can also be formulated as
expression, where invalid values cause console output. Processing is
asynchronous but not parallel. Processing will start after the specified time
when a previously started JavaScript procedure has finished. Therefore, the
interval should be understood as timely but not exact. The interval starts
refreshing automatically and ends when:
- the element no longer exists in the DOM
- the condition attribute is used that is not true

```html
<span interval="1000">
  ...
</span>

<span interval="{{1000 +500}}">
  ...
</span>
```

The interval attribute can be used for HTML elements and complex HTML
constructs. For example, the SPAN element is updated every 1000ms. An active
interval reacts dynamically to DOM changes. It starts automatically when the
HTML element is added to the DOM and ends when it is removed from the DOM. This
makes the interval attribute controllable in combination with the condition
attribute.

```html
<span interval="1000" condition="{{example.isVisible()}}">
  ...
</span>
```

For example, interval and a variable expression can implement a permanent
counter.

```html
{{counter:0}}
<p interval="1000">
  {{counter:parseInt(counter) +1}}
  {{counter}}
</p>
```

It is also possible to use the interval attribute in combination with embedded
JavaScript as a composite script.

```html
<script type="composite/javascript" interval="1000">
    ...
</script>
```

### iterate
Iterative output is based on lists, enumerations and arrays. If an HTML element
is declared as iterative, the inner HTML is used as a template from which
updated content is generated and inserted as inner HTML with each render cycle.
The attribute value expects a [variable expression](
    expression.md#variable-expression). It creates a meta-object that allows
access to the iteration in the template. The variable expression
`iterate={{tempA:example.list}}` creates the meta-object
`tempA = {item, index, data}`.

```javascript
const example = {
    months: ["Spring", "Summer", "Autumn", "Winter"]
};
```

```html
<select iterate={{months:example.months}}>
  <option value="{{months.index}}">
    {{months.item}}
  </option>
</select>
```

> [!NOTE]
> If arrays are used with reactive objects, iterate accesses the arrays
> directly. If the array is a list of values, value changes also change the
> array and trigger re-rendering of the iterate. To change values at runtime
> without triggering re-rendering of the iterate, the array must contain objects
> with the values. Setting the value in the objects does not change the array
> itself and therefore does not trigger re-rendering.
> 
> Alternatively, the length of the array can also be passed to the iterate. It
> then generates a list of values with the index without accessing the elements.
> The index can then be used by the expression within the iterate to access the
> array.

```html
<select iterate={{months:example.months.length}}>
  <option value="{{months.index}}">
    {{example.months[months.index]}}
  </option>
</select>
```

If the value for an iterator is a positive number, a list of values from 0 to
(number -1) is used. If the value is negative, a descending list of values is
used from (number +1) to 0.

### message
Message is an optional part of [Validation](#validate) and is used for text and
error output in case of an unconfirmed validation. This requires a combination
with the attributes [validate](#validate) and [events](#events). 

```html
<form id="example" composite>
  <input id="email" type="text" placeholder="email address"
      pattern="^\w+([\w\.\-]*\w)*@\w+([\w\.\-]*\w{2,})$"
      validate message="Valid e-mail address required"
      events="input change" render="#example"/>
  <input type="submit" value="submit" validate events="click"/>
</form>
```

```html
<form id="example" composite>
  <input id="email" type="text" placeholder="email address"
      pattern="^\w+([\w\.\-]*\w)*@\w+([\w\.\-]*\w{2,})$"
      validate message="{{Messages['example.email.validation.message']}}"
      events="input change" render="#example"/>
  <input type="submit" value="submit" validate events="click"/>
</form>
```

### output
Sets for the HTML element the value or result of its expression as inner HTML.
The behavior is similar to the [import](#import) attribute, except that the
output is updated with each render cycle. It supports the same values and the
same combination with the condition attribute.

The following examples use the application module from [import](#import).

```html
<article output="{{example.publishImg()}}">
  loading image...
</article>
<article output="{{example.publishForm()}}">
  loading form...
</article>
```

Example of outputting a remote resource using the HTTP method GET.

```html
<article import="{{'https://raw.githubusercontent.com/seanox/composite-js/master/test/resources/import_c.htmlx'}}">
  loading resource...
</article>

<article import="https://raw.githubusercontent.com/seanox/composite-js/master/test/resources/import_c.htmlx">
  loading resource...
</article>
```

Example of outputting via DataSource-URL. If only one URL is specified, the URI
for data and transformation are derived from it.

```html
<article output="{{'xml://example/content'}}">
  loading resource...
</article>

<article output="xml://example/content">
  loading resource...
</article>

<article output="xml://example/content?count(//item)">
    loading resource...
</article>
```

Example of outputting a DataSource-URL with a specific data URL (locator) and
transformation URL, as described for [import](#import).

```html
<article output="{{'xml://example/data + xslt://example/style'}}">
  loading resource...
</article>

<article output="xml://example/data + xslt://example/style">
  loading resource...
</article>

<article output="xml://example/data + xslt">
    loading resource...
</article>
```

The derivation of the XSLT locator and the handling of JavaScript blocks are the
same as for [import](#import).

### release
Inverse indicator that an HTML element was rendered. The composer removes this
attribute when an HTML element is rendered. This effect can be used for CSS to
show elements only in rendered state. A corresponding CSS rule is automatically
added to the HEAD when the page is loaded. 

```html
<span release>{{'Show me after rendering.'}}</span>
```

### render
The attribute requires the combination with the [events](#events) attribute.
Together they define which targets are refreshed by the composer with which
occurring events. The expected value is one or more space-separated CSS or Query
selectors that define the targets.

```javascript
const example = {
    _status1: 0,
    getStatus1() {
        return ++example._status1;
    },
    _status2: 0,
    getStatus2() {
        return ++example._status2;
    },
    _status3: 0,
    getStatus3() {
        return ++example._status3;
    }
};
```

```html
Target #1:
<span id="outputText1">{{example.status1}}</span>
Events: Wheel
<input id="text1" type="text"
    events="wheel"
    render="#outputText1, #outputText2, #outputText3"/>

Target #2:
<span id="outputText2">{{example.status2}}</span>
Events: MouseDown KeyDown
<input id="text1" type="text"
    events="mousedown keydown"
    render="#outputText2, #outputText3"/>

Target #3:
<span id="outputText3">{{example.status3}}</span>
Events: MouseUp KeyUp
<input id="text1" type="text"
    events="mouseup keyup"
    render="#outputText3"/>

```

The example contains 3 input fields with different events (`events`) and targets
(`render`), each of which represents an incremental text output and reacts to
corresponding events.

__Alternatively, [reactive rendering](reactive.md) can be used, where changes in
the data objects trigger a partial update of the view.__

### route
The route attribute marks a composite as a path-addressable destination in the
[view flow](routing.md#view-flow) and includes it in the path-based control of
visibility and in the internal permission concept of [routing](
    routing.md#routing), which uses such composites as [views](routing.md#view).
The attribute can be used in the BODY tag and otherwise only in combination with
the attribute composite.

```html
<article id="example" composite route>
  ...
</article>
```

> [!NOTE]
> The attribute route is not a core attribute of the composite. It is added as a
> custom attribute by the [routing](routing.md#view) and is listed here for
> completeness.

[Learn more](routing.md#view)

### validate
The attribute `validate` requires the attribute `events`. Together they define
and control synchronization between the markup of a composite and the
corresponding application module. A property with the same name must exist in
the application module as the synchronization target.

Validation works in two steps and starts with standard HTML5 validation. If this
does not detect deviations from the expected result or no HTML5 validation is
specified, the validation of the application module is used. This requires a
corresponding validate method `boolean validate(element, value)` and an element
embedded in a composite.

Validation directly affects synchronization and the browser default action. It
can use four return states: `true`, `not true`, `text`, `undefined/void`.

#### true
Validation was successful. No error is shown and the browser default action is
used. If possible, the value is synchronized.

#### not true and not undefined/void
The validation failed and an error is shown. The return value indicates that the
default behavior (action) should not be executed by the browser and is thus
blocked.

#### text
The validation has failed with an error message. If the error message is empty,
the message from the message attribute is used as an alternative.

#### undefined/void
Validation failed and an error is shown. Without a return value, the default
behavior (action) is executed by the browser. This behavior is important for
validating input fields, for example, so that the input reaches the user
interface.

__Validation works strictly by default. This means that the validation must
explicitly be `true` and only then is the input data of the HTML elements
synchronized with the application module. This protects against invalid data in
the application module which may then be reflected in the view. If attribute
`validate` is declared as `optional`, this behaviour can be specifically
deactivated and the input data is then always synchronized with the application
module. The effects of validation are then only optional.__

```html
<form id="example" composite>
  <input id="text1" type="text" placeholder="e-mail address"
      validate="optional" events="input change" render="#example"/>
  example.text1: {{example.text1}}
  <input type="submit" value="submit" validate events="click"/>
</form>
```

By default, validation message are shown as a native browser toolbox for the
input element. The corresponding message is set via the attribute of the same
name. If custom validation and output need to be implemented, this behavior can
be changed by redirecting the message to an attribute of the input element. For
this purpose, the message, which at this point also includes the return value of
expressions, must begin as follows: `@<attribute>:`.

A general strategy or standard implementation for error output is deliberately
not provided, as this is too strict in most cases and can be implemented
individually as a central solution.

```css
input[type='text']:not([fault]) {
    background:#EEEEFF;
    border-color:#7777AA;
}
input[type='text'][fault=''] {
    background:#EEFFEE;
    border-color:#77AA77;
}
input[type='text'][fault]:not([fault='']) {
    background:#FFEEEE;
    border-color:#AA7777;
}
```

```javascript
const example = {
    validate(element, value) {
        const PATTERN_EMAIL_SIMPLE = /^\w+([\w\.\-]*\w)*@\w+([\w\.\-]*\w{2,})$/;
        const test = PATTERN_EMAIL_SIMPLE.test(value);
        return test || ("Invalid " + element.getAttribute("placeholder"));
    },
    text1: ""
};
```

```html
<form id="example" composite>
  <input id="text1" type="text" placeholder="e-mail address"
      validate message="@fault:Wrong e-mail address"
      events="input change" render="#example"/>
  example.text1: {{example.text1}}
  <input type="submit" value="submit" validate events="click"/>
</form>
```

In this example, the input field expects an e-mail address. The value is checked
continuously during the input and in case of an invalid value an error message
is written into the attribute `fault`, or in case of a valid value the content
is deleted from the attribute `fault`. Below the input field is the control
output of the corresponding property in the application module. This property is
only synchronized if the validate method returns the value `true`.

## @-Attributes
Expressions are resolved by the composer only during rendering, after the page
has been loaded and initially displayed by the browser. This is a problem for
HTML elements whose attributes the browser already interprets before rendering
-- for example the src attribute of the img tag. For these cases @-attributes
can be used. These work like templates for attributes. The composer will resolve
their value and then add the attributes of the same name to the element. After
that, they behave like all other attributes, including being updated by the
composer during rendering if the attributes contain expressions.

```html
<img @src="{{...}}"/>
```

## Expression Language
The expression language can be used in the markup as free text and in the
attributes of the HTML elements. JavaScript and CSS elements are excluded. The
expression language is not supported here. When used as free text, pure text
(plain text) is always generated as output. The addition of markup, especially
HTML code, is not possible and is only supported with the attributes `output`
and `import`.

```html
<article title="{{example.title}}">
  {{'Hello World!'}}
  ...
</article>
```

Details about syntax and usage are described in chapter [Expression Language](
    expression.md).

## Scripting
Markup for rendering supports the additional script type `composite/javascript`.
The browser does not recognize it as `text/javascript` and does not execute it
directly, so the composer controls the execution and can combine it with
declarative attributes such as `condition` and `interval`.

```html
<script type="composite/javascript">
    ...
</script>
```

Details about the runtime behavior and about composite script including modules
are described in chapter [Scripting](scripting.md#scripting).

## Customizing

### Tag
Custom HTML elements (tags) can take over the complete rendering on their own
responsibility. They are implemented as a callback that is executed before the
standard rendering, and its return value decides who remains responsible for the
element: only the return value `false` (not void, not empty) ends the rendering,
so that the callback alone is responsible. With any other return value, the
composer continues with its standard functions.

```javascript
Composer.customize("foo", function(element) {
    ...
});
```

```html
<article>
  <foo/>
</article>
```

### Selector
Selectors work similarly to custom tags. Unlike custom tags, selectors use a CSS
selector to recognize elements. This selector must address the element from the
parent element. Different selectors with different functions can affect one
element.

Selectors are iterated in order of registration and their callback methods are
executed before the standard rendering. As with custom tags, the return value
decides who remains responsible for the element: only the return value `false`
(not void, not empty) ends the iteration over the remaining selectors and the
rendering, so that the callback alone is responsible. With any other return
value, the iteration continues and the composer finally applies its standard
functions.

```javascript
Composer.customize("a:not([href])", function(element) {
    ...
});

Composer.customize("a.foo", function(element) {
    ...
});
```

```html
<article>
  <a class="foo"></a>
</article>
```

### Interceptor
Interceptors customize rendering by manipulating elements before rendering. They
can change attributes and/or markup before the composer processes them. An
interceptor has no effect on the rendering implementation.

```javascript
Composer.customize(function(element) {
    ...
});
```

### Parameters
`Composer.customize(...)` also accepts configuration parameters instead of a
tag or a selector. Parameters begin with the character `@` and are case
insensitive. The configuration can be done several times, the values are then
merged.

```javascript
Composer.customize("@ATTRIBUTES-STATICS", "action name src type");
```

The following parameters are supported:

| Parameter             | Function                                       |
|-----------------------|------------------------------------------------|
| `@ATTRIBUTES-STATICS` | List of static attributes, see [Runtime Hardening](#runtime-hardening) |

## Runtime Hardening
Seanox composite-js hardens the markup against manipulation at runtime. On the
one hand, hidden markup with a condition is physically removed from the DOM and
on the other hand, the composer observes manipulations of attributes at runtime.
This observation is based on a filter with static attributes. Static attributes
are read when an element is created in the DOM and restored when manipulated
(deleted/changed).

> [!NOTE]
> Runtime hardening is not a security feature. Manipulations are reverted
> afterwards and only for composite-internal and static attributes. It does not
> protect against manipulation with full access to the runtime.

Static attributes are configured with the
[parameter](#parameters) `@ATTRIBUTES-STATICS`. The configuration can be done
several times, the values are then merged, but they cannot be removed. If static
attributes are declared later at runtime, their current values must be captured
for all elements with a complete scan of the DOM.

```javascript
Composer.customize("@ATTRIBUTES-STATICS", "action name src type");
Composer.customize("@Attributes-Statics", "required");
Composer.customize("@attributes-statics", "method action");
...
```

```html
<form method="POST" action="/service">
  <input type="user" name="user"
  <input type="password" name="password"/>
  <input type="submit"/>
</form>
```



- - -
&#9665; [Expression Language](expression.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#markup)
&nbsp;&nbsp;&nbsp;&nbsp; [Scripting](scripting.md) &#9655;
