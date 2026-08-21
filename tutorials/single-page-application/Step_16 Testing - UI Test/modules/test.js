// The Test API is intended for unit testing, but it can also be used for UI
// testing. By default, the Test API is included in all distributions, including
// the productive one, and therefore the API must be consciously activated.
//   see also https://github.com/seanox/aspect-js/blob/master/manual/test.md
Test.activate();

// Important: In this example, we deviate slightly from the concept with the
// test queue and use our own sequence. The test queue is good for unit testing
// in relation to methods and components. For the sequence with interactions on
// the concurrent user interface, the approach with the interval-based sequence
// is simpler.

// First, we build a sequence/queue in which we describe all interactions as
// tasks and which are then processed one by one sequentially. The possibly
// unusual notation "(() => {...})();" creates a private scope for private
// variables. The method compliant helps us to avoid unintentionally overwriting
// standard JavaScript objects.
(() => {
    const _queue = [];
    const _interval = window.setInterval(() => {
        if (_queue.length <= 0)
            return;
        if (_interval.timing !== undefined
                && _interval.timing >= Date.now())
            return;
        try {_queue.shift()();
        } catch (error) {
            window.clearInterval(_interval);
            throw error;
        }
    }, 250);
    compliant("Sequence");
    compliant(null, window.Sequence = {
        push(...tasks) {
            _queue.push(...tasks);
        },
        interrupt() {
            _interval.timing >= Date.now() +250;
        }
    });
})();

// Now we can describe the interactions in the user interface.
// Test 1: We try out the behavior when navigating via the browser URL.
Sequence.push(...[
    () => window.location.href = "#projects",
    () => window.location.href = "#project#2",
    () => window.location.href = "#project#2xx",
    () => window.location.href = "#eco",
    () => window.location.href = "#about",
    () => window.location.href = "#about#nix",
    () => window.location.href = "#person#2",
    () => window.location.href = "#person#2xx",
    () => window.location.href = "#contact",
    () => window.location.href = "#nix",
    () => window.location.href = "#nix#nix",
    () => window.location.href = "#nix#nix#nix"
]);

// Test 1: _hashChangeCollector collects the change of the routs
const _hashChangeCollector = [];
window.addEventListener("hashchange", (event) => {
    const oldHash = event.oldURL.match("#.*$");
    const newHash = event.newURL.match("#.*$");
    _hashChangeCollector.push(`${oldHash} -> ${newHash}`);
});

// Test 1: The idea is that we can create templates as pattern and then compare
// them. To prevent the templates bloating the JS code, we outsource them as
// text files and load them for the test. For this, we expand the test API.
// test API.
Test.loadTempalte = (tempalte) => {
    const request = new XMLHttpRequest();
    request.open("GET", tempalte, false);
    request.send(null);
    if (request.status === 200)
        return request.responseText;
    throw new Error("File not found");
}

// Test 1: Now we can compare the expected behavior.
// We also put the test in the sequence.
Sequence.push(...[
    () => {
        const pattern = Test.loadTempalte("modules/test-1.txt").trim();
        const compare = _hashChangeCollector.join("\r\n").trim();
        Assert.assertSame(compare, pattern);
        console.log("Test 1 successful");
    }
]);

// Test 2: We try out the behavior when navigating via menu.
// We need the _hashChangeCollector again, so it must be emptied.
// At the end of the test.
Sequence.push(...[
    () => _hashChangeCollector.length = 0,
    () => document.querySelector("#menu > div > div > a:nth-child(2)").click(),
    () => document.querySelector("#menu > div > div > a:nth-child(3)").click(),
    () => document.querySelector("#menu > div > div > a:nth-child(4)").click(),
    () => document.querySelector("#menu > div > div > a:nth-child(5)").click(),
    () => document.querySelector("#menu > div > a").click(),
    () => {
        const pattern = Test.loadTempalte("modules/test-2.txt").trim();
        const compare = _hashChangeCollector.join("\r\n").trim();
        Assert.assertSame(compare, pattern);
        console.log("Test 2 successful");
    }
]);

// Test 3: Test of the validation when entering in the contact form.
const _validationCollector = [];
const _validateTest = (selector, text) => {
    document.querySelector(selector).typeValue(text);
    Composite.asynchronous(() => {
        let result = "";
        const fields = ["#name", "#email", "#subject", "#comment", "form"];
        for (let selector of fields) {
            const element = document.querySelector("#contact " + selector);
            result += ` ${selector}:${!!element.validationMessage}`;
        }
        _validationCollector.push(result.trim());
    })
};

Sequence.push(...[
    () => DataSource.localize("en"),
    () => Composite.render(document.body),
    () => window.location.href = "#contact",
    () => _validateTest("#contact #name", " Simon Sommer "),
    () => _validateTest("#contact #name", "Simon Sommer"),
    () => _validateTest("#contact #email", "simon.sommer"),
    () => _validateTest("#contact #email", "simon.sommer@example.local"),
    () => _validateTest("#contact #subject", " Test "),
    () => _validateTest("#contact #subject", "Test"),
    () => _validateTest("#contact #comment", " Test "),
    () => _validateTest("#contact #email", "simon.sommer"),
    () => _validateTest("#contact #email", "simon.sommer@example.local"),
    () => _validateTest("#contact #email", "simon.sommer"),
    () => {
        const element = document.querySelector("#submit");
        element.click();
        _validationCollector.push(!!element.validationMessage);
    },
    () => {
        const pattern = Test.loadTempalte("modules/test-3.txt").trim();
        const compare = _validationCollector.join("\r\n").trim();
        Assert.assertSame(compare, pattern);
        console.log("Test 3 successful");
        alert("All tests passed successfully");
    }
]);

let _active;
Composite.listen(Composite.EVENT_RENDER_END, () => {
    if (Routing.location === "#home")
        _active = true;
    if (!_active)
        return;
    Sequence.interrupt();
});
