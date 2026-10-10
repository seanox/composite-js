"use strict";

const path = require("node:path");
const fs = require("node:fs");
const {once} = require("node:events");
const {parseArgs, format} = require("node:util");
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
const DEFAULT_TEMP_DIR = "./tmp";

const _console_error = console.error;
console.error = (...variants) => {
    _console_error(`\x1b[33m${format(...variants).trim()}\x1b[0m`);
};

const _console_log = console.log;
console.log = (...variants) => {
    _console_log(format(...variants).replace(/^(\[\w+\]\s)(.*)$/, "$1\x1b[32m$2\x1b[0m"));
};

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
        throw new TypeError(`Invalid server URL: ${url || "<empty>"}`);
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
        page.on("pageerror", error => {
            output.push(`[error] ${error.message}`);
        });
        await page.exposeBinding("__playwrightTestEvent", (_source, event, tasks, faults) => {
            if (event === "start") {
                startCount++;
                if (startCount > 1)
                    rejectTestEventFailure(new Error("Unexpected test start"));
                return;
            }
            if (event !== "finish")
                return;
            if (!Number.isSafeInteger(tasks)
                    || tasks < 0
                    || !Number.isSafeInteger(faults)
                    || faults < 0) {
                rejectTestEventFailure(new Error("Unexpected test finished"));
                return;
            }
            const result = {tasks, faults};
            resolveTestResult(result);
        });
        await page.addInitScript(bindingName => {
            if (window !== window.top)
                return;
            window.addEventListener("testStart", () =>
                window[bindingName]("start"));
            window.addEventListener("testFinish", event =>
                window[bindingName]("finish", event.testFinish.queue.size, event.testFinish.queue.faults));
        }, "__playwrightTestEvent");
        const execution = async () => {
            const response = await page.goto(`${url}${routePrefix}/${encodeURIComponent(test)}`, {
                waitUntil: "load", timeout
            });
            if (!response
                    || !response.ok())
                throw new Error(`Unexpected response status: ${response?.status() || "no response"}`);
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
                timer = setTimeout(() => reject(new Error(`Timeout after ${timeout} ms`)), timeout);
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

const configuration = (options = {}) => {
    const timeout = Number(options.timeout ?? DEFAULT_TIMEOUT);
    if (!Number.isSafeInteger(timeout)
            || timeout <= 0
            || timeout > 60 *60 *1000)
        throw new Error(`Invalid timeout: ${timeout || "<empty>"}`);
    const engine = options.engine ?? "";
    if (!["blink", "gecko", "webkit"].includes(engine))
        throw new Error(`Invalid engine: ${engine || "<empty>"}`);
    const docRoot = path.resolve(options.server?.docRoot ?? __dirname);
    const defaultDocument = options.server?.defaultDocument ?? DEFAULT_DOCUMENT;
    return {
        tempDirectory: path.resolve(__dirname, options.tempDirectory ?? DEFAULT_TEMP_DIR),
        server: {
            docRoot,
            docRootDefaultDocument: path.join(docRoot, defaultDocument),
            protocol: options.server?.protocol ?? DEFAULT_PROTOCOL,
            address: options.server?.address ?? DEFAULT_ADDRESS,
            port: Number(options.server?.port ?? DEFAULT_PORT),
            defaultDocument
        },
        timeout,
        engine
    };
};

const main = async ({config, runtime, serverFactory = createServer} = {}) => {
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
        const url = `${config.server.protocol}://${config.server.address}:${config.server.port}`;
        let browser;
        try {
            browser = await engines[config.engine].launch({headless: true, timeout: config.timeout});
            const contextOptions = await testRuntime.browserContextOptions(browser);
            for (const test of tests) {
                const start = Date.now();
                try {
                    const result = await testRuntime.runTest(browser, test, config.timeout, url, contextOptions);
                    results.push({engine: config.engine, test, ...result, duration: Date.now() - start, status: "passed"});
                    console.log(`[${config.engine}] ${test}: ${result.tasks} task(s), 0 faults`);
                } catch (error) {
                    failed = true;
                    results.push({engine: config.engine, test, ...(error.result || {}), duration: Date.now() - start, status: "failed",
                        error: error.message, output: error.output});
                    console.error(`[${config.engine}] ${test}: ${error.message}\n${error.output || ""}`);
                }
            }
        } catch (error) {
            failed = true;
            results.push({engine: config.engine, status: "failed", error: error.message});
            console.error(`[${config.engine}] ${error.stack || error}`);
        } finally {
            if (browser)
                await browser.close();
        }
        const failures = results.filter(result => result.status === "failed").length;
        console.log(`[${config.engine}] Finished: ${results.length - failures} passed, ${failures} failed`);
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
        }
    }
    return {results, failed};
};

const parseCommandLine = (args = process.argv.slice(2)) => {
    const {values} = parseArgs({
        args,
        options: {
            "runner-timeout": {type: "string", short: "t"},
            "runner-engine": {type: "string", short: "e"},
            "server-docroot": {type: "string", short: "d"},
            "server-default-document": {type: "string"},
            "server-protocol": {type: "string"},
            "server-address": {type: "string", short: "a"},
            "server-port": {type: "string", short: "p"}
        }
    });

    return {
        timeout: values["runner-timeout"],
        engine: values["runner-engine"],
        server: {
            docRoot: values["server-docroot"],
            defaultDocument: values["server-default-document"],
            protocol: values["server-protocol"],
            address: values["server-address"],
            port: values["server-port"]
        }
    };
};

if (require.main === module)
    main({config: configuration(parseCommandLine())})
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
