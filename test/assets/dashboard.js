(() => {
    "use strict";

    const testingScript = document.querySelector('script[src*="composite-js-testing.js"]');
    if (!testingScript)
        throw new Error("Unable to locate composite-js-testing.js");
    const manifestFile = testingScript.getAttribute("manifest");
    if (!manifestFile)
        throw new Error("Unable to locate dashboard manifest");

    const testingDirectory = testingScript.src
            .replace(/[?#].*$/, "")
            .replace(/[^/]*$/, "");

    const benchmarkMode = manifestFile === "composite-js.benchmarks";

    let progressElement;
    let outputElement;
    let iframeElement;

    let queue;
    let faults;
    let activeTest;

    const benchmarks = [];

    const attachProgress = testCases => {
        const fragment = document.createDocumentFragment();
        queue = testCases.trim().split(/\s+/);
        queue = queue.filter(entry => !entry.match(/^\*/));
        if (!queue.length)
            throw new Error("No test cases found in " + manifestFile);
        queue.forEach(entry => {
            const item = document.createElement("div");
            item.dataset.test = entry;
            item.innerHTML = `${entry}<br><meter></meter> <span>-</span>/<span>-</span>`;
            fragment.appendChild(item);
        });
        progressElement.appendChild(fragment);
        progressElement.addEventListener("click", (event) => {
            const target = event.target.closest('#progress > div');
            if (!target)
                return;
            const targetName = target.dataset.test;
            if (event.ctrlKey
                    || event.shiftKey) {
                const targetUrl = testingDirectory + targetName;
                const targetWindow = window.open(targetUrl, '_extern_test');
                if (targetWindow)
                    targetWindow.focus();
                return;
            }
            faults = false;
            outputElement.innerHTML = '';
            loadTest(targetName);
        });
    };

    const attachTestListeners = () => {

        Test.activate();

        Test.listen(Test.EVENT_START, (event, status) => {
            outputMessage("info",
                    `Start of ${locateTest()}\r\n\t${status.queue.size} tests found`);
        });

        Test.listen(Test.EVENT_PERFORM, (event, status) => {
            performTest(event, status);
        });

        Test.listen(Test.EVENT_FINISH, (event, status) => {

            performTest(event, status);
            if (queue.length <= 0) {
                if (faults)
                    outputMessage("error", "Some of the tests failed.");
                else outputMessage("info", "All tests were successful.");
                if (benchmarks.length) {
                    if (benchmarkMode)
                        outputMessage("info",
                                "Benchmark for " + compliant.version + " with " + locateEngine()
                                + "\r\n---\r\n"
                                + formatBenchmarkSummary()
                                + "\r\n\r\n---\r\n\r\n");
                    else outputMessage("info", "Benchmark summary\r\n\t"
                            + benchmarks.map(benchmark => benchmark.value.padStart(7)).join("\r\n\t"));
                }
            } else loadTest(queue.shift());

            window.focus();
            document.body.focus();

            const test = locateTestElement();
            if (test && !test.className) {
                test.scrollIntoView(false);
                test.className = "progress";
            }
        });

        Test.listen(Test.EVENT_INTERRUPT, (event, status) => {
            outputMessage("warn", "Interrupt of " + locateTest());
            performTest(event, status);
            if (queue.length > 0)
                loadTest(queue.shift());
        });

        console.listen((event, ...variants) => {

            if (event == null)
                return;

            let message = variants.join(", ");
            event = (event || "").trim();
            if (event.match(/^error$/i))
                if (!String(message).match(/^[a-z]+,[\w\s]+\d{4}\s\d{2}:\d{2}:\d{2}\s[a-z]+\s+Test/i))
                    event = "warn";
            message = message.replace(/^[a-z]+,[\w\s]+\d{4}\s\d{2}:\d{2}:\d{2}\s[a-z]+\s+/i, "");
            outputMessage(event, message);

            const match = message.match(/Benchmark(?:\s+\d+)?:\s*(\d+)\s*(ms)/i);
            if (match)
                benchmarks.push({
                    test: locateTest(),
                    value: match[1] + " " + match[2]
                });
        });
    };

    window.addEventListener("load", () => {
        progressElement = document.querySelector("#progress");
        outputElement = document.querySelector("#output");
        iframeElement = document.querySelector("#frame iframe");
        attachTestListeners();
        try {
            const request = new XMLHttpRequest();
            request.open("GET", testingDirectory + manifestFile, false);
            request.send();
            if (request.status < 200
                    || request.status >= 300)
                throw new Error("HTTP " + request.status + " " + request.statusText);
            attachProgress(request.responseText);
            loadTest(queue.shift());
        } catch (error) {
            outputMessage("error",
                    "Unable to load " + manifestFile + ": " + error.message);
        }
    });

    const locateTest = () => {
        return activeTest;
    };

    const locateTestElement = () => {
        const test = locateTest();
        for (let index = 0; index < progressElement.children.length; index++) {
            const element = progressElement.children[index];
            if (element.dataset.test === test)
                return element;
        }
        throw new Error("Unable to locate progress for " + test);
    };

    const locateEngine = () => {
        if (navigator.engine !== "webkit")
            return navigator.engine;
        const userAgent = navigator.userAgent;
        if (!/iPhone|iPad|iPod/i.test(userAgent))
            return navigator.engine;
        return navigator.engine + " (iOS)";
    };

    const formatBenchmarkSummary = () => {
        const summary = [];
        const names = benchmarks.map(benchmark =>
            benchmark.test.replace(/^.*[\/\\]/, ""));
        const nameWidth = Math.max.apply(null, names.map(name => name.length));
        for (let index = 0; index < benchmarks.length; index++) {
            const benchmark = benchmarks[index];
            const name = names[index];
            summary.push(name + " ".repeat(nameWidth - name.length)
                    + "  " + benchmark.value.padStart(8));
        }
        return summary.join("\r\n");
    };

    const loadTest = (test) => {
        const name = test || queue.shift();
        activeTest = name;
        outputMessage("info", "Loading " + name);
        iframeElement.setAttribute("src",
                testingDirectory + name + (test ? "" : "?" + Date.now()));
    };

    const performTest = (event, status) => {
        const test = locateTestElement();
        test.scrollIntoView(false);

        const meter = test.querySelector("meter");
        meter.max = status.queue.size;
        meter.value = status.queue.progress;
        test.querySelector("span").textContent = status.queue.progress;
        test.querySelector("span + span").textContent = status.queue.faults;
        test.className = status.queue.faults ? "failed" : "successful";
        if (status.queue.faults)
            faults = true;
    };

    const outputMessage = (level, message) => {
        if (!message)
            return;
        const output = document.createElement("pre");
        output.className = level;
        output.textContent = String(message).trim();
        outputElement.appendChild(output);
        outputElement.scrollTop = outputElement.scrollHeight;
    };
})();
