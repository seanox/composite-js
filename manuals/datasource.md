&#9665; [Routing](routing.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#datasource)
&nbsp;&nbsp;&nbsp;&nbsp; [Resource Bundle](message.md) &#9655;
- - -

# DataSource
DataSource is an immutable XML data source for static application data. It
combines structured XML storage with multilingual data separation, optional
aggregation and transformations through XPath and XSLT. The concept combines
characteristics of a read-only database and a content management system for
application-provided data accessed through queries and transformations.

## Contents Overview
- [Data Storage](#data-storage)
- [Locales](#locales)
- [Locator](#locator)
- [XPath and XPath Functions](#xpath-and-xpath-functions)
- [fetch](#fetch)
- [transform](#transform)
- [collect](#collect)
- [Notes](#notes)

## Data Storage
By default, the data storage is located in `./data` relative to the application
directory. It contains the supported languages as subdirectories. Each language
contains its own content. Redundant data/fields and additional subdirectories
belong to the concept. DataSource primarily uses XML files. XSLT transformations
are optional.

```
+ data
  + de
    - fileA.xml
    - fileA.xslt
    + directory...
    ...
  + en
    - fileA.xml
    - fileA.xslt
    + directory...
    ...
  + locales.xml
+ modules
+ resources
+ index.html
```

The data storage can be changed via `DataSource.DATA`. 

## Locales
The supported languages are organized in locales in the `locales.xml` file.

```xml
<?xml version="1.0"?>
<locales>
  <de/>
  <en default="true"/>
</locales>
```

The language is selected automatically from the browser language setting. If
that language is not supported, the language declared as `default` is used.

At runtime, JavaScript can change the language with the locale. Only locales
available in the DataSource are accepted. Other values cause an error when the
method is called.

```javascript
DataSource.localize("de");
```

The current language can be retrieved via `DataSource.locale`.
`DataSource.locales` returns all available languages as an array that starts
with the language declared as default.

## Locator
Data in the data storage is addressed through a locator URL (`xml://...` or
`xslt://...`). Single and double slashes are supported. A locator can be used
contextually or explicitly.

- __Contextual Locator__: Uses an absolute path without a file extension
  relative to the DataSource directory and does not contain a locale (language 
  specification) in the path. The locale is determined automatically based on
  the browser's language setting or, if not supported, the default locale from
  the `locales.xml` in the DataSource data storage.

- __Explicit Locator__: Uses a fully qualified URL with a file extension
  (`xml://....xml` or `xslt://....xslt`). This locator addresses an absolute
  path based on the current URL and is not enriched with the locale.

Each locator starts with a protocol that corresponds to the file extension in
the data storage. __Only lowercase letters are accepted here__, because
deriving the corresponding file extension is too time-consuming when uppercase
and lowercase letters are combined.

```
xml://fileA -> ./data/en/fileA.xml
xslt://fileA -> ./data/en/fileA.xslt

xml://data/en/foo/fileA.xml -> ./data/en/foo/fileA.xml
xslt://data/en/foo/fileA.xslt -> ./data/en/foo/fileA.xslt
```

## XPath and XPath Functions
DataSource uses XPath and XPath functions as a functional query language.
Locators and transformations support this language and provide dynamic data
access. __The following documentation uses the term XPath for XPath and XPath
functions.__

For more information about XPath please read:
https://www.w3schools.com/xml/xpath_intro.asp.

XPath can be added only to XML locators, separated by a question mark.

```
xml://fileA?//*/@title

xml://data/en/foo/fileA.xml?//*/@title
```

The return value depends on the XPath and can be boolean, number, string,
NodeList, or null. When querying nodes using XPath, nodes are always returned.
This also includes attributes and text nodes.

Attributes are returned as nodes with the name _attribute_. The name and value
of the addressed attribute are represented in the node as attributes _name_ and
_value_.

```
<attribute name="name of the attribute" value="value of the attribute"/>
```

Text nodes are also returned as nodes, but then with the name _text_. The
value of the addressed text node is then the content of the node.

```
<text>content of the text node</text>
```

## fetch
Fetches data for a locator as _XMLDocument_ or, when using XPath, as _boolean_,
_number_, _string_, _NodeList_ or _null_. XPath node queries return nodes,
including attributes and text nodes, as described in
[XPath and XPath Functions](#xpath-and-xpath-functions).

```javascript
const document = DataSource.fetch("xml://paper");

const data = DataSource.fetch("xml://paper?//*/@price");
```

## transform
XSLT (1.0) transformation of XML data provides another way to create dynamic
data and content. This can already be done with the locator-based fetch method.
If direct access to the XMLDocument is required, use the transform method. It
accepts XMLDocument and locators, also in combination.

```javascript
DataSource.transform("xml://paper", "xslt://article");
```

The stylesheet specification is optional when using XML locators. Without it,
the stylesheet is derived from the XML locators.

```javascript
DataSource.transform("xml://paper");
```

A meta-object with data for the XSLT processor can be passed to the
transformation and used in the XSLT stylesheet.

```javascript
DataSource.transform("xml://paper", {...});
DataSource.transform("xml://paper", "xslt://article", {...});
```

The XML locator also supports XPath for transformation. The collected data is
stored in an artificial XMLDocument with the root element _data_, which is used
as the basis for the transformation.

```javascript
DataSource.transform("xml://paper?//*/@price");
DataSource.transform("xml://paper?//*/@price", "xslt://article");
DataSource.transform("xml://paper?//*/@price", {...});
DataSource.transform("xml://paper?//*/@price", "xslt://article", {...});
```

During transformation, a new XMLDocument is created. Its structure depends on
the browser and XSLT processor. By default, the root entity is returned as a
node. The option `raw` changes this behavior. If `raw` is `true`, the original
XMLDocument is returned.

JavaScript elements are also handled. Their type is changed automatically to
`composite/javascript` so that they are not executed during embedding, but are
interpreted by the renderer. This is important when using [condition](
    markup.md#condition).

Text creation/output during transformation has another special behavior. The
XSLT Processor always generates XML-valid text output. Any XML syntax in text is
escaped automatically, which makes markup generation difficult. The attribute
`escape` can be used in XML and/or XSLT files for this case. It expects the
values `yes`, `on`, `true` or `1`. These values cancel or undo automatic
escaping.

```xml
<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>
  <xsl:template match="/">
    <header>
      <h1>Title</h1>
    </header>
    <article escape="on">
      <xsl:value-of select="/content"/>
    </article>
  </xsl:template>
</xsl:stylesheet>
```

```xml
<?xml version="1.0"?>
<article escape="on">
  <![CDATA[
  <p>
    Seanox aspect-js is a browser-native application runtime for single-page
    applications (SPAs) and micro-frontends.
  </p>
  <a href="https://github.com/seanox/aspect-js">read more</a>
  ]]>
</article>
```

## collect
Content from multiple XML files can be collected and concatenated into a new
XMLDocument. The contents are combined under one collector with a configurable
name.

As an example, 3 XML files: paper.xml, envelope.xml, pen.xml

```xml
<?xml version="1.0"?>
<article>
  <id>100</id>
  <description>Paper</description>
  <price>1.00</price>
</article>

<?xml version="1.0"?>
<article>
  <id>200</id>
  <description>Envelope</description>
  <price>2.00</price>
</article>

<?xml version="1.0"?>
<article>
  <id>300</id>
  <description>Pen</description>
  <price>3.00</price>
</article>
```

Collecting with the standard collector.

```javascript
DataSource.collect("xml://paper", "xml://envelope", "xml://pen");
```

```xml
<?xml version="1.0"?>
<collector>
  <article>
    <id>100</id>
    <description>Paper</description>
    <price>1.00</price>
  </article>
  <article>
    <id>200</id>
    <description>Envelope</description>
    <price>2.00</price>
  </article>
  <article>
    <id>300</id>
    <description>Pen</description>
    <price>3.00</price>
  </article>
</collector>
```

Collecting with an own _articles_ collector.

```javascript
DataSource.collect("articles", "xml://paper", "xml://envelope", "xml://pen");
```

```xml
<?xml version="1.0"?>
<articles>
  <article>
    <id>100</id>
    <description>Paper</description>
    <price>1.00</price>
  </article>
  <article>
    <id>200</id>
    <description>Envelope</description>
    <price>2.00</price>
  </article>
  <article>
    <id>300</id>
    <description>Pen</description>
    <price>3.00</price>
  </article>
</articles>
```

## Notes
The DataSource can also be used directly in the markup with the attributes
[import](markup.md#import) and [output](markup.md#output).

```html
<article import="xml://example/content">
  loading resource...
</article>

<article import="xml://example/data + xslt://example/style">
  loading resource...
</article>

<article output="xml://example/content">
  loading resource...
</article>

<article output="xml://example/data + xslt://example/style">
  loading resource...
</article>
```



- - -
&#9665; [Routing](routing.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#datasource)
&nbsp;&nbsp;&nbsp;&nbsp; [Resource Bundle](message.md) &#9655;
>