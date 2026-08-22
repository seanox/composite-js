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

The language is selected automatically from the browser language setting. If
that language is not supported, the language declared as `default` is used.
JavaScript can change the language and locale at runtime with
`DataSource.localize()` — see [Locales](datasource.md#locales).

After loading the application, Messages are available as an associative array.
They can be used directly in JavaScript and in markup expressions.

```javascript
const title = Messages["contact.title"];
```
```javascript
const title = messages.contact.title;
```
```html
<h1 output="{{Messages['contact.title']}}"/>
```
```html
<h1 output="{{messages.contact.title}}"/>
```

Messages can contain placeholders that are populated at runtime with
`Messages.populate(label, ...values)`. The label is used as a template with
placeholders. Values are passed as a list with spread notation. Each placeholder
is a number that refers to a position in the value list.


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
<h1 output="{{Messages.populate('welcome', 'Mr.', 'Doe', 'with extended user rights')}}"/>
```
```javascript
const welcome = Messages.populate("welcome", "Mr.", "Doe", "with extended user rights");
```

Placeholders can be used multiple times. Excess placeholders or placeholders for
which no value has been specified are removed from the generated message.



- - -
&#9665; [DataSource](datasource.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#runtime)
&nbsp;&nbsp;&nbsp;&nbsp; [Events](events.md) &#9655;
