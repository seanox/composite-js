"use strict";

const path = require("node:path");
const fs = require("node:fs");
const {once} = require("node:events");
const {
    createServer,
    DEFAULT_DOCUMENT,
    DEFAULT_PROTOCOL,
    DEFAULT_ADDRESS,
    DEFAULT_PORT
} = require("./server");

const PATTERN_USER_AGENT_HEADLESS_CHROME = /\bHeadlessChrome\//g;
const PATTERN_TEST_CASES = /<script\b[^>]*\btype\s*=\s*(["'])text\/test-cases\1[^>]*>([\s\S]*?)<\/script>/i;
const PATTERN_WHITESPACE = /\s+/;
const PATTERN_HTML_TEST = /^[^/\\]+\.html$/i;
const DEFAULT_TIMEOUT = 30000;

const browserEngines = () => {
    const {chromium, firefox, webkit} = require("playwright");
    return {blink: chromium, gecko: firefox, webkit};
};

// Optional browser customizations:
// - UserAgent: The engine detection expects as Chrome, not HeadlessChrome
const browserContextOptions = async browser => {
    if (browser.browserType().name() !== "chromium")
        return {};
    const page = await browser.newPage();
    try {
        const userAgent = await page.evaluate(() => navigator.userAgent);
        return {userAgent: userAgent.replace(PATTERN_USER_AGENT_HEADLESS_CHROME, "Chrome/")};
    } finally {
        await page.close();
    }
};

const discoverTests = docRootDefaultDocument => {
    const index = fs.readFileSync(docRootDefaultDocument, "utf8");
    const declared = index.match(PATTERN_TEST_CASES)?.[2] || "";
    return [...new Set(declared.trim().split(PATTERN_WHITESPACE)
        .filter(test => test && !test.startsWith("*")))];
};

const runTest = async (browser, test, timeout, url, contextOptions = {}, routePrefix = "") => {
    if (typeof url !== "string"
            || !url)
        throw new TypeError(`Invalid server URL: ${url}`);
    const context = await browser.newContext(contextOptions);
    const output = [];
    let startCount = 0;
    let rejectTestEventFailure;
    let resolveTestResult;
    let timer;
    const testEventFailure = new Promise((_, reject) => {
        rejectTestEventFailure = reject;
    });
    const testResult = new Promise(resolve => {
        resolveTestResult = resolve;
    });
    try {
        const page = await context.newPage();
        page.on("console", message => {
            output.push(`[${message.type()}] ${message.text()}`);
        });
        page.on("page-error", error => {
            output.push(`[page-error] ${error.message}`);
        });
        await page.exposeBinding("__playwrightTestEvent", (_source, event, tasks, faults) => {
            if (event === "start") {
                startCount++;
                output.push(`[test-start] #${startCount}`);
                if (startCount > 1)
                    rejectTestEventFailure(new Error("Unexpected test start status"));
                return;
            }
            if (event !== "finish")
                return;
            if (!Number.isSafeInteger(tasks)
                    || tasks < 0
                    || !Number.isSafeInteger(faults)
                    || faults < 0) {
                rejectTestEventFailure(new Error("Unexpected test finished status"));
                return;
            }
            const result = {tasks, faults};
            output.push(`[test-finish] ${tasks} tasks, ${faults} faults`);
            resolveTestResult(result);
        });
        await page.addInitScript(bindingName => {
            if (window !== window.top)
                return;
            window.addEventListener("testStart", () =>
                window[bindingName]("start"));
            window.addEventListener("testFinish", event =>
                window[bindingName]("finish", event.detail.queue.size, event.detail.queue.faults));
        }, "__playwrightTestEvent");
        const execution = async () => {
            const response = await page.goto(`${url}${routePrefix}/${encodeURIComponent(test)}`, {
                waitUntil: "load", timeout
            });
            if (!response
                    || !response.ok())
                throw new Error(`Navigation failed: HTTP ${response?.status() || "no response"}`);
            const result = await testResult;
            if (result.faults) {
                const error = new Error(`${result.faults} test fault(s) detected`);
                error.result = result;
                throw error;
            }
            return result;
        };
        return await Promise.race([
            execution(),
            testEventFailure,
            new Promise((resolve, reject) => {
                timer = setTimeout(() => reject(new Error(`Test did not finish within ${timeout} ms`)), timeout);
            })
        ]);
    } catch (error) {
        error.output = output.join("\n");
        throw error;
    } finally {
        clearTimeout(timer);
        await context.close();
    }
};

const configuration = (env = process.env) => {
    const timeout = Number(env.TEST_TIMEOUT || DEFAULT_TIMEOUT);
    if (!Number.isSafeInteger(timeout) || timeout <= 0 || timeout > 2147483647)
        throw new Error(`Invalid timeout: ${timeout}`);
    const selected = (env.TEST_ENGINES || "blink,gecko,webkit").split(",").map(value => value.trim());
    if (selected.some(engine => !["blink", "gecko", "webkit"].includes(engine)))
        throw new Error(`Invalid engines: ${env.TEST_ENGINES}`);
    const docRoot = path.resolve(env.TEST_SERVER_DOCROOT || path.join(__dirname, "..", "..", "test"));
    const defaultDocument = env.TEST_SERVER_DEFAULT_DOCUMENT || DEFAULT_DOCUMENT;
    return {
        reportDirectory: path.resolve(env.TEST_REPORT_DIR || env.RESULTS_DIR || path.join(__dirname, "results")),
        tempDirectory: path.resolve(__dirname, env.TEST_TEMP_DIR || "./tmp"),
        server: {
            docRoot,
            docRootDefaultDocument: path.join(docRoot, defaultDocument),
            protocol: env.TEST_SERVER_PROTOCOL || DEFAULT_PROTOCOL,
            address: env.TEST_SERVER_ADDRESS || DEFAULT_ADDRESS,
            port: Number(env.TEST_SERVER_PORT || DEFAULT_PORT),
            defaultDocument
        },
        timeout,
        engines: [...new Set(selected)]
    };
};

const main = async ({env = process.env, runtime, serverFactory = createServer} = {}) => {
    const config = configuration(env);
    process.env.TMPDIR = config.tempDirectory;
    process.env.TMP = config.tempDirectory;
    process.env.TEMP = config.tempDirectory;
    const {engines, ...testRuntime} = runtime || {
        engines: browserEngines(),
        discoverTests,
        browserContextOptions,
        runTest
    };
    const results = [];
    let server;
    let failed = false;
    try {
        fs.mkdirSync(config.tempDirectory, {recursive: true});
        const availableFiles = fs.readdirSync(config.server.docRoot, {withFileTypes: true})
            .filter(file => file.isFile())
            .map(file => file.name);
        const availableTests = new Set(availableFiles.filter(file => PATTERN_HTML_TEST.test(file)));
        const tests = testRuntime.discoverTests(config.server.docRootDefaultDocument)
            .filter(test => availableTests.has(test)
                && test !== config.server.defaultDocument);
        if (!tests.length)
            throw new Error(`Missing test files in ${config.server.docRootDefaultDocument}`);
        for (const file of ["composite-js-testing.js", "composite-js-debug-testing.js"])
            if (!availableFiles.includes(file))
                throw new Error(`Missing test file: ${file}`);
        server = serverFactory({root: config.server.docRoot, ...config.server});
        const listening = once(server, "listening");
        server.listen({port: config.server.port, host: config.server.address});
        await listening;
        const address = server.address();
        if (!address
                || typeof address === "string")
            throw new Error("Unable to determine test server address");
        const host = config.server.address.includes(":") ? `[${config.server.address}]` : config.server.address;
        const url = `${config.server.protocol}://${host}:${address.port}`;
        for (const engine of config.engines) {
            let browser;
            try {
                browser = await engines[engine].launch({headless: true, timeout: config.timeout});
                const contextOptions = await testRuntime.browserContextOptions(browser);
                for (const test of tests) {
                    const start = Date.now();
                    try {
                        const result = await testRuntime.runTest(browser, test, config.timeout, url, contextOptions);
                        results.push({engine, test, ...result, duration: Date.now() - start, status: "passed"});
                        console.log(`[${engine}] ${test}: ${result.tasks} task(s), 0 faults`);
                    } catch (error) {
                        failed = true;
                        results.push({engine, test, ...(error.result || {}), duration: Date.now() - start, status: "failed",
                            error: error.message, output: error.output});
                        console.error(`[${engine}] ${test}: ${error.message}\n${error.output || ""}`);
                    }
                }
            } catch (error) {
                failed = true;
                results.push({engine, status: "failed", error: error.message});
                console.error(`[${engine}] ${error.stack || error}`);
            } finally {
                if (browser)
                    await browser.close();
            }
        }
        const failures = results.filter(result => result.status === "failed").length;
        console.log(`[runner] Finished: ${results.length - failures} passed, ${failures} failed`);
    } catch (error) {
        failed = true;
        results.push({status: "failed", error: error.message});
        throw error;
    } finally {
        try {
            if (server && server.listening)
                await new Promise((resolve, reject) => {
                    server.closeAllConnections();
                    server.close(error => error ? reject(error) : resolve());
                });
        } finally {
            fs.mkdirSync(config.reportDirectory, {recursive: true});
            fs.writeFileSync(path.join(config.reportDirectory, "results.json"), JSON.stringify(results, null, 2) + "\n");
        }
    }
    return {results, failed};
};

if (require.main === module)
    main()
        .then(({failed}) => {
            if (failed)
                process.exitCode = 1;
        })
        .catch(error => {
            console.error(error.stack || error);
            process.exitCode = 1;
        });

module.exports = {
    configuration,
    main,
    discoverTests,
    browserContextOptions,
    runTest
};
