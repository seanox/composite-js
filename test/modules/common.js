(() => {
    compliant("navigator.engine");
    let _engine = null;
    if (navigator.userAgent.match(/Mozilla\/[\d\.]+ \(.*\) AppleWebKit\/[\d\.]+ \(KHTML, like Gecko\).* Safari\/[\d\.]+/i))
        _engine = "webkit";
    if (navigator.userAgent.match(/Mozilla\/[\d\.]+ \(.*\) AppleWebKit\/[\d\.]+ \(KHTML, like Gecko\).* Chrome\/[\d\.]+/i))
        _engine = "blink";
    if (navigator.userAgent.match(/Mozilla\/[\d\.]+ \(.*\) Gecko\/[\d\.]+/i))
        _engine = "gecko";
    if (navigator.userAgent.match(/Mozilla\/[\d\.]+ \(.*\) Gecko\/[\d\.]+ Goanna\/[\d\.]+/i))
        _engine = "goanna";
    if (_engine)
        Object.defineProperty(navigator, "engine", {
            value: _engine
        });

    compliant("navigator.playwright");
    const _playwright = /\s+\bPlaywright\b/i.test(navigator.userAgent);
    Object.defineProperty(navigator, "playwright", {
        value: _playwright
    });

    compliant("Test.read");
    compliant(null, Test.read = (content) => {
        const request = new XMLHttpRequest();
        request.overrideMimeType("text/plain");
        if (content)
            if (content.match(/\?/))
                content += "&" + Date.now();
            else content += "?" + Date.now();
        request.open("GET", content, false);
        request.send();
        if (request.status !== 200)
            throw new Error("HTTP status " + request.status + " for " + request.responseURL);
        return request.responseText;
    });

    compliant("String.prototype.simplify");
    compliant(null, String.prototype.simplify = function() {
        return this.trim().replace(/\t/g, "    ")
            .replace(/(\r\n)|(\n\r)|[\r\n]/gm, "\n")
            .replace(/(^ +)|( +$)/gm, "")
            .replace(/\s*\n+\s*\n+/g, "\n")
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<");
    });

    compliant("console.test");
    compliant(null, console.test = (content) => {
        console.test.count = (console.test.count || 0) +1;
        console.log(`script: #${console.test.count}`);
        console.log(`<script type="text/test">\n${String(content || "").simplify()}\n<\/script>`);
    });

    // Assert becomes available only in the unit test by activating the Test API
    if (typeof Assert !== "undefined") {

        compliant("Assert.assertSameText");
        compliant(null, Assert.assertSameText = (expected, actual) => {
            Assert.assertEquals(String(expected || "").simplify(), String(actual || "").simplify());
        });

        compliant("Assert.assertSameTo");
        compliant(null, Assert.assertSameTo = (selector, actual) => {
            const element = document.querySelector(selector);
            const content = element.innerHTML;
            Assert.assertEquals(content.simplify(), String(actual || "").simplify());
        });

        compliant("Assert.assertIn");
        compliant(null, Assert.assertIn = (...variants) => {
            const assert = Assert.create(variants, 2);
            if (assert.values[0].includes(assert.values[1]))
                return;
            assert.values[0] = "[" + assert.values[0].join(", ") + "]";
            throw assert.error("Assert.assertIn", "in {0}", "{1}");
        });
    }
})();