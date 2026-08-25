&#9665; [API Extensions](extensions.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#development)
&nbsp;&nbsp;&nbsp;&nbsp; [Maintenance](maintenance.md) &#9655;
- - -

# Test
The Test API supports implementation and execution of integration and unit
tests. It can be used for suites, scenarios and single test cases.

As a modular part of _composite-js_, the Test API is included in all testing
releases. Because it changes error handling and console output, it must be
activated explicitly at runtime.

```javascript
Test.activate();

Test.create({test() {
    ...
}});

Test.start();
```

## Contents Overview
- [Task](#task)
  - [name](#name)
  - [test](#test-1)
  - [timeout](#timeout)
  - [expected](#expected)
  - [ignore](#ignore)
- [Scenario](#scenario)
- [Suite](#suite)
- [Assert](#assert)
  - [assertTrue](#asserttrue)
  - [assertFalse](#assertfalse)
  - [assertEquals](#assertequals)
  - [assertNotEquals](#assertnotequals)
  - [assertSame](#assertsame)
  - [assertNotSame](#assertnotsame)
  - [assertNull](#assertnull)
  - [assertNotNull](#assertnotnull)
  - [assertUndefined](#assertundefined)
  - [assertNotUndefined](#assertnotundefined)
  - [fail](#fail)
- [Configuration](#configuration)
  - [auto](#auto)
  - [output](#output)
  - [monitor](#monitor)
- [Output](#output-1)
  - [Forwarding](#forwarding)
  - [Buffer](#buffer)
  - [Listener](#listener)
- [Monitoring](#monitoring)
- [Control](#control)
- [Events](#events)
- [Extension](#extension)

## Task
The smallest component in an integration test is called _task_ because _case_ is
a JavaScript keyword. A task can be implemented alone, but is always used in a
scenario.

Task is primarily a meta-object.

```
{name:..., test:..., timeout:..., expected:..., ignore:...}
```

### name
Optional name of the test task.

### test
An implemented method to be executed as a test.

### timeout
Optional maximum runtime of the test item in milliseconds. Exceeding this limit
causes the test to fail. A value greater than 0 is expected; otherwise the
timeout is ignored.

### expected
Optional definition for expected errors. The error must occur for the test to be
successful. The value must be an error object or a RegExp.

### ignore
Optional `true` if the test is to be ignored.

## Scenario
A scenario is a sequence of test cases (tasks).

```javascript
Test.activate();

Test.create({test() {
    Assert.assertTrue(true);
}});
Test.create({name:"example", timeout:1000, test() {
    Assert.assertTrue(true);
}});
Test.create({expected: Error, test() {
    throw new Error();
}});
Test.create({expected: /^My Error/i, test() {
    throw new Error("My Error");
}});
Test.create({ignore:true, test() {
    Assert.assertTrue(true);
}});

Test.start();
```

## Suite
A suite is a bundle of test cases, scenarios and other suites. A suite often
consists of different files that represent a complex test. A cascade of files
allows the test to start in any file and place. This supports integration tests
on different levels and with different complexity.

## Assert
Test cases are implemented with assertions. The Test API provides elementary
assertions, and additional assertions can be implemented. If an assertion is not
`true`, an error is thrown, optionally with an individual error message.

__The methods use different signatures, which are described in the examples
below. Each assertion accepts an optional error message as the first argument.__

### assertTrue
Asserts that a value is `true`.

```javascript
Assert.assertTrue(true);
Assert.assertTrue("message", true);
```

### assertFalse
Asserts that a value is `false`, as negation of `Assert.assertTrue(...)`.

```javascript
Assert.assertFalse(false);
Assert.assertFalse("message", false);
```

### assertEquals
Asserts that two values are equal.

```javascript
Assert.assertEquals(expected, value);
Assert.assertEquals("message", expected, value);
```

### assertNotEquals
Asserts that two values are not equal, as negation of `Assert.assertEquals(...)`.

```javascript
Assert.assertNotEquals(unexpected, value);
Assert.assertNotEquals("message", unexpected, value);
```

### assertSame
Asserts that two values are the same.

```javascript
Assert.assertSame(expected, value);
Assert.assertSame("message", expected, value);
```

### assertNotSame
Asserts that two values are not the same, as negation of
`Assert.assertSame(...)`.

```javascript
Assert.assertNotSame(unexpected, value);
Assert.assertNotSame("message", unexpected, value);
```

> [!NOTE]
> Equals compares with `===` and `!==`, same with `==` and `!=`. Same therefore
> applies type coercion, whereas equals requires both type and value to match.

### assertNull
Asserts that a value is `null`.

```javascript
Assert.assertNull(null);
Assert.assertNull("message", null);
```

### assertNotNull
Asserts that a value is not `null`, as negation of `Assert.assertNull(...)`.

```javascript
Assert.assertNotNull("value");
Assert.assertNotNull("message", "value");
```

### assertUndefined
Asserts that a value is `undefined`.

```javascript
Assert.assertUndefined(undefined);
Assert.assertUndefined("message", undefined);
```

### assertNotUndefined
Asserts that a value is not `undefined`, as negation of `Assert.assertUndefined(...)`.

```javascript
Assert.assertNotUndefined("value");
Assert.assertNotUndefined("message", "value");
```

### fail
Fails a test with an optional message.

```javascript
Assert.fail();
Assert.fail("message");
```

## Configuration
Optionally, the Test API can be configured with each start. A meta-object is
expected as parameter. The configuration contained in it is partially adopted
and the unknown is ignored.

```javascript
Test.start({auto: boolean, output: {...}, monitor: {...}});
```

### auto
Option that triggers the start when loading the page. If the page is already
loaded, the parameter _auto_ is ignored and the start is executed immediately.

```javascript
Test.start({auto: true});
```

### output
Function or object for outputting messages and errors. If not specified, console
object is used.

```javascript
Test.start({output: {
    log(message) {
        ...
    },
    error(message) {
        ...
    }
}});
```

### monitor
Monitors the progress of the test and is informed of the various steps and
statuses during execution. The monitor can also be used for data output, for
example, to redirect the output to a DOM element. The monitor is optional.
Without this, the console is used to output information about the test process.

```javascript
Test.start({monitor: {
    start(status) {
        // The method is called with the start.
    },
    suspend(status) {
        // The method is called with suspension.
    },
    resume(status) {
        // The method is called when the test run is stopped and will be
        // continued later.
    },
    interrupt(status) {
        // The method is called if you want to abort the test run.
        // The test run cannot then be resumed.
    },
    perform(status) {
        // The method is called before a test task is performed.
    },
    response(status) {
        // The method is called when a test task has been performed.
        // Here you can find the result of the test task.
    },
    finish(status) {
        // The method is called when all test tasks have been completed.
    }
}});
```

The current status is passed to all monitor methods as an meta-object. The
status contains details of the current task and the queue. The details are
read-only and cannot be changed.

```javascript
{
    task: {
        title:
            title of the test task,
        meta:
            meta information about the test itself (name, test,
            timeout, expected, serial),
        running:
            indicator when the test task is in progress
        timing:
            start time from the test task in milliseconds
        timeout:
            optional, the time in milliseconds when a timeout is
            expected
        duration:
            total execution time of the test task in milliseconds, is
            set with the end of the test task
        error:
            optional, if an unexpected error (also assertion error) has
            occurred, which terminated the test task
    },
    queue: {
        timing:
            start time in milliseconds,
        size:
            original queue length,
        length:
            number of outstanding tests,
        progress:
            number of tests performed,
        lock:
            indicator when a test is performed and the queue is waiting,
        faults:
            number of detected faults
    }
}
```

## Output
As a development tool, browsers provide console output that can be used to log
information, for which different channels or levels are supported:  
    _LOG_, _WARN_, _ERROR_, _INFO_

```javascript
console.log(message);
console.warn(message);
console.error(message);
console.info(message);
```

To be able to include console output in tests, the activated Test API supports
forwarding, listeners and buffers for console output.

### Forwarding
The forwarding runs completely in the background and distributes the output to
the browser console output and to the components of the Test API. In the case of
(I)Frames, the output is forwarded to enclosing or superordinate window-objects
and is accessible there via buffer and listener with an activated Test API.

### Buffer
When the Test API is enabled, the console object of the JavaScript API is
extended by the buffer _output_. The buffer contains caches for the levels:
_LOG_, _WARN_, _ERROR_ and _INFO_ as well as methods for emptying.

```javascript
const log   = console.output.log;
const warn  = console.output.warn;
const error = console.output.error;
const info  = console.output.info;

console.output.clear();
```

### Listener
Callback methods can be established as listeners for console output.

```javascript
console.listen(function(level, ...parameters) {
    const message = parameters[0];
    ...
});
```

The callback methods are then called at each console output and the log level is
passed as the first parameter. The additional number of parameters is variable
and depends on the initial call of the corresponding console methods. Which
often makes it easier to use the spread syntax `...`.

## Monitoring
Monitoring is configured with the monitor of the Test API and is informed of the
various steps and statuses during execution.

Details about configuration and usage are described in chapter
[Configuration - monitor](#monitor).

## Control
The test progress and the execution of the tests can be controlled by the Test
API.

```javascript
Test.start();
Test.start({auto: boolean});
```

The start can be done manually or, when using [auto](#auto), by loading the
page.

```javascript
Test.suspend();
```

Suspends the current test execution, which can be continued from the current
test with `Test.resume()`.

```javascript
Test.resume();
```

Continues the test execution if it was stopped before.

```javascript
Test.interrupt();
```

Interrupts the current test run and discards all outstanding tests.  
The test run can be restarted with `Test.start()`.

```javascript
Test.status();
```

Returns a snapshot of the status of the current test, with the same structure as
the status passed to the [monitor](#monitor). If no test is executed, false is
returned.

## Events
Events and their callback methods are another way of monitoring test execution.
The callback methods are registered at the Test API for corresponding events and
then work similar to the monitor.

List of available events:

```javascript
Test.EVENT_INTERRUPT
Test.EVENT_PERFORM
Test.EVENT_RESPONSE
Test.EVENT_RESUME
Test.EVENT_START
Test.EVENT_SUSPEND
```

Examples of use:

```javascript
Test.listen(Test.EVENT_START, function(event, status) {
    ...
});

Test.listen(Test.EVENT_PERFORM, function(event, status) {
    ...
});

Test.listen(Test.EVENT_FINISH, function(event, status) {
    ...
});
```

## Extension
The Test API also activates extensions of the JavaScript API.

### Element

#### Element.prototype.typeValue
Method that simulates keyboard input for element objects.  
The following events are triggered during simulation: 
    focus, keydown, keyup, change

```html
<form action="/api/example" method="POST">
  <input type="text" id="inputText"/>
  <input type="submit"/> 
</form>
```

```javascript
document.querySelector("#inputText").typeValue("Hello World!");
```

The method will overwrite an existing value in the element by default. However,
if the simulated input is to be added, overwriting can be deactivated with the
`clear` parameter.

```javascript
document.querySelector("#inputText").typeValue("Hello World!", false);
```

#### Element.prototype.toPlainString
Method that creates a simple string for an element object.  
The string is based on `Element.prototype.outerHTML`.

```html
<form action="/api/example" method="POST">
  <input type="text" id="inputText"/>
  <input type="submit"/> 
</form>
```

```javascript
console.log(document.querySelector("form").toPlainString());
```

Output:

```
<form xmlns="http://www.w3.org/1999/xhtml" action="/api/example" method="POST">
  <input type="text" id="inputText"/>
  <input type="submit"/> 
</form>
```

#### Element.prototype.trigger
Method to trigger an event for an element with the optional parameters `bubbles`
(default: `false`) and `cancelable` (default: `true`).

```javascript
document.querySelector("#button").trigger("click");
document.querySelector("#button").trigger("click", true);
document.querySelector("#button").trigger("click", true, false);
```

### Node

#### Node.prototype.toPlainString
Method that creates a simple string for a node object.  
The string is based on `XMLSerializer.serializeToString(node)`.

```javascript
const text = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
         + "<note>"
         + "  <to>Tove</to>"
         + "  <from>Jani</from>"
         + "  <heading>Reminder</heading>"
         + "  <body>Don't forget me this weekend!</body>"
         + "</note>";

const parser = new DOMParser();
const xml = parser.parseFromString(text, "text/xml");

const nodes = xml.evaluate("/note", xml, null, XPathResult.ANY_TYPE, null);
const result = nodes.iterateNext();
console.log(result.toPlainString());
```

Output:

```
<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>
```

### Object

#### Object.prototype.toPlainString
Method that creates a simple string for an object.  
The string is based on `JSON.stringify(object)`.

```javascript
const example = {a:1, b:2, c() {return;}};
console.log(example.toPlainString());
```

Output:

```
{"a":1,"b":2}
```



- - -
&#9665; [API Extensions](extensions.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#development)
&nbsp;&nbsp;&nbsp;&nbsp; [Maintenance](maintenance.md) &#9655;
