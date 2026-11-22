&#9665; [DataSource](datasource.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [Events](events.md) &#9655;
- - -

# Resource Bundle (Messages/i18n/l10n)
(Resource)Messages is a static [DataSource](datasource.md) extension for
internationalization (i18n), localization (l10n) and client-related texts. It
uses key-value or label-value data stored in `locales.xml` in the DataSource
directory.

```
+ data
  + de...
  + en...
  - locales.xml
+ modules
+ resources
- index.html
```

The elements for supported languages, locales and/or clients (tenants) are
organized as sets in this file. Each set defines the key-value pairs as label
entries. Clients (tenants) are used like locales and are not mentioned
separately below.

```xml
<?xml version="1.0"?>
<locales>
  <de>
    <label key="contact.title" value="Kontakt"/>
    <label key="contact.development.title">Entwicklung</label>
    ...
  </de>
  <en default="true">
    <label key="contact.title" value="Contact"/>
    <label key="contact.development.title">Development</label>
    ...
  </en>
</locales>
```

Label values are taken from the non-empty `value` attribute, otherwise from the
element's text content. Surrounding whitespace is removed and JavaScript-style
escape sequences such as `\n` are decoded. Keys are case-sensitive and consist
of dot-separated ASCII identifier segments matching `[_A-Za-z$][_A-Za-z0-9$]*`.
Keys that do not match this pattern or cannot be represented in the object tree
are reported with `console.warn` and skipped while loading continues.

The language is selected automatically from the browser's preferred languages,
also considering the base language of regional settings. If no supported
language matches, the language declared as `default` is used, or the first
locale if no default is declared. JavaScript can change the language and locale
at runtime with `DataSource.localize("de")` -- see [Locales](
    datasource.md#locales). Only locales declared in `data/locales.xml` are
accepted; an unavailable locale causes an error.

If a key occurs more than once in a resource, the last occurrence in that
resource is used. Labels from later-loaded module resources can also replace
earlier values. Only labels of the selected locale are loaded; missing labels do
not fall back to another locale.

Modules can also provide locales/messages as XML resources alongside their other
resources, for example `modules/contact.xml` for the composite `contact`. These
files use the same `<locales>` structure and are loaded when the module's
resources are first included, including at runtime. The data-directory messages
are loaded first; later-loaded modules can replace values with the same key.

After loading the application, labels are available through the global objects
`Messages` and `messages`. `Messages` provides string values by key; `messages`
provides an object tree whose levels correspond to dots in the keys. Its label
objects convert to the message text when used as strings. Both can be used
directly in JavaScript and in markup expressions.

```javascript
const title = Messages["contact.title"];
```
```javascript
const title = String(messages.contact.title);
```
```html
<h1 output="{{Messages['contact.title']}}"></h1>
```
```html
<h1 output="{{messages.contact.title}}"></h1>
```

`DataSource.localize(...)` rebuilds both objects for the selected locale,
including messages from already loaded modules. Previously stored references
still refer to the old objects or texts.

The identifier pattern does not make every key safe. Keys such as `populate`
and `toString` can collide with methods used by the flat `Messages` API or the
`messages` object tree. Avoid these names; collision handling remains a
limitation.

Messages can contain placeholders that are populated at runtime with
`Messages.populate(label, ...values)`. The `label` argument is the message key;
its text is used as a template and the method returns the populated string.
Values are passed as individual arguments. Each placeholder is a number in
braces that refers to a zero-based position in the value list: `{0}` refers to
the first value. Indices use canonical decimal notation; for example, `{01}` is
not replaced.


```xml
<?xml version="1.0"?>
<locales>
  <en default="true">
    <label key="welcome">
      Welcome {0} {1}, you are logged in as {2}.    
    </label>        
  </en>
</locales>
```
```html
<h1 output="{{Messages.populate('welcome', 'Mr.', 'Doe', 'with extended user rights')}}"></h1>
```
```javascript
const welcome = Messages.populate("welcome", "Mr.", "Doe", "with extended user rights");
```

Placeholders can be used multiple times. Placeholders for which no value has
been specified are removed from the generated message; unused values are
ignored. Substituted values are treated as data and are not processed as
placeholders again. A missing key returns `undefined` from `Messages[key]`;
`Messages.populate(...)` returns an empty string for a missing label.



- - -
&#9665; [DataSource](datasource.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [Events](events.md) &#9655;
