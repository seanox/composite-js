"use strict";

const path = require("node:path");
const fs = require("node:fs");
const {once} = require("node:events");
const {parseArgs, format} = require("node:util");
const os = require("node:os");

const {
    createCoverageRecorder
} = require("./coverage.js");
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

const _browserEngines = () => {
    const {chromium, firefox, webkit} = require("playwright");
    return {blink: chromium, gecko: firefox, webkit};
};

// Optional browser customizations:
// - UserAgent: The engine detection expects as Chrome, not HeadlessChrome
// - UserAgent: Marking as Playwright
const _browserContextOptions = async browser => {
    const page = await browser.newPage();
    try {
        let userAgent = await page.evaluate(() => navigator.userAgent);
        if (browser.browserType().name() === "chromium")
            userAgent = userAgent.replace(PATTERN_USER_AGENT_HEADLESS_CHROME, "Chrome/");
        return {userAgent: `${userAgent} Playwright`};
    } finally {
        await page.close();
    }
};

const _discoverTests = docRootDefaultDocument => {
    const index = fs.readFileSync(docRootDefaultDocument, "utf8");
    const declared = index.match(PATTERN_TEST_CASES)?.[2] || "";
    return [...new Set(declared.trim().split(PATTERN_WHITESPACE)
        .filter(test => test && !test.startsWith("*")))];
};

const _runTest = async (context, url, timeout, coverage = false) => {
    const output = [];
    let startCount = 0;
    let coverageStarted = false;
    let timer;
    const {
        promise: testResult,
        resolve: resolveTestResult,
        reject: rejectTestResult
    } = Promise.withResolvers();
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
                    rejectTestResult(new Error("Unexpected test start"));
                return;
            }
            if (event !== "finish")
                return;
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
        if (coverage) {
            await coverage.start(page);
            coverageStarted = true;
        }
        const execution = async () => {
            const navigation = page.goto(url, {
                waitUntil: "load", timeout
            }).then(response => {
                if (!response
                        || !response.ok())
                    throw new Error(`Unexpected response status: ${response?.status() || "no response"}`);
            });
            const [, result] = await Promise.all([navigation, testResult]);
            if (result.faults) {
                const error = new Error(`${result.faults} test fault(s) detected`);
                error.result = result;
                throw error;
            }
            return result;
        };
        return await Promise.race([
            execution(),
            new Promise((resolve, reject) => {
                timer = setTimeout(() =>
                    reject(new Error(`Timeout after ${timeout} ms`)), timeout);
            })
        ]);
    } catch (error) {
        error.output = output.join(os.EOL);
        throw error;
    } finally {
        clearTimeout(timer);
        try {
            if (coverageStarted)
                await coverage.stop();
        } finally {
            await context.close();
        }
    }
};

const _configuration = (options = {}) => {
    const timeout = Number(options.timeout ?? DEFAULT_TIMEOUT);
    if (!Number.isSafeInteger(timeout)
            || timeout <= 0
            || timeout > 60 *60 *1000)
        throw new Error(`Invalid timeout: ${timeout || "[empty]"}`);
    const engine = (options.engine ?? "").toLowerCase();
    if (!["blink", "gecko", "webkit"].includes(engine))
        throw new Error(`Invalid engine: ${engine || "[empty]"}`);
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

process.on("uncaughtException", (error, origin) => {
    console.error("[error]", {
        message: error.message, stack: error.stack, origin,
    });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[error]", {
        reason: reason instanceof Error ? reason.stack : reason,
    });
});

const main = async ({config, runtime, serverFactory = createServer} = {}) => {

    process.env.TMPDIR = config.tempDirectory;
    process.env.TMP = config.tempDirectory;
    process.env.TEMP = config.tempDirectory;
    const {engines, ...testRuntime} = runtime || {
        engines: _browserEngines(),
        discoverTests: _discoverTests,
        browserContextOptions: _browserContextOptions,
        runTest: _runTest
    };

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

    const server = serverFactory({root: config.server.docRoot, ...config.server});
    const serverListening = once(server, "listening");
    server.listen({port: config.server.port, host: config.server.address});
    await serverListening;

    const coverageFile = path.join(config.server.docRoot, "composite-js-testing.js");
    const coverageRecorder = createCoverageRecorder(config.engine, coverageFile);
    if (coverageRecorder)
        console.info(`[${config.engine}] Coverage for: ${coverageFile}`);

    const results = [];
    try {
        const server = `${config.server.protocol}://${config.server.address}:${config.server.port}`;
        const browser = await engines[config.engine].launch({
            headless: true, timeout: config.timeout});
        try {
            const contextOptions = await testRuntime.browserContextOptions(browser);
            for (const test of tests) {
                const start = Date.now();
                try {
                    const context = await browser.newContext(contextOptions || {});
                    const url = `${server}/${encodeURIComponent(test)}`;
                    const coverage = coverageRecorder
                            && fs.readFileSync(path.join(config.server.docRoot, test), "utf8")
                                .includes("composite-js-testing.js") ? coverageRecorder : false;
                    const result = await testRuntime.runTest(context, url, config.timeout, coverage);
                    results.push({engine: config.engine, test, ...result, duration: Date.now() -start, status: "passed"});
                    console.log(`[${config.engine}] ${test}: ${result.tasks} task(s), 0 faults`);
                } catch (error) {
                    results.push({
                        engine: config.engine,
                        test,
                        ...(error.result || {}),
                        duration: Date.now() -start,
                        status: "failed",
                        error: error.message,
                        output: error.output});
                    console.error(`[${config.engine}] ${test}: ${error.message}${os.EOL}${error.output || ""}`);
                }
            }
        } catch (error) {
            results.push({engine: config.engine, status: "failed", error: error.message});
            console.error(`[${config.engine}] ${error.stack || error}`);
        } finally {
            if (browser)
                await browser.close();
        }
        if (coverageRecorder) {
            try {
                const markdownFile = await coverageRecorder.exportMarkdown();
                if (markdownFile)
                    console.info(`[${config.engine}] Coverage report: ${markdownFile}`);
                const lcovFile = await coverageRecorder.exportLcov();
                if (lcovFile)
                    console.info(`[${config.engine}] Coverage report: ${lcovFile}`);
            } catch (error) {
                results.push({
                    engine: config.engine,
                    status: "failed",
                    error: `Coverage export failed: ${error.message}`
                });
                console.error(`[${config.engine}] Coverage export failed: ${error.stack || error}`);
            }
        }
        const failures = results.filter(result => result.status === "failed").length;
        const channel = failures ? console.error : console.log;
        channel(`[${config.engine}] Finished: ${results.length -failures} passed, ${failures} failed`);
    } finally {
        if (server && server.listening)
            await new Promise((resolve, reject) => {
                server.closeAllConnections();
                server.close(error => error ? reject(error) : resolve());
            });
    }

    const failures = results.filter(result => result.status === "failed");
    return {results, failed: failures.length > 0};
};

const _parseCommandLine = (args = process.argv.slice(2)) => {
    const {values} = parseArgs({
        args,
        options: {
            "runner-engine": {type: "string", short: "e"},
            "runner-timeout": {type: "string", short: "t"},
            "server-protocol": {type: "string"},
            "server-address": {type: "string", short: "a"},
            "server-port": {type: "string", short: "p"},
            "server-docroot": {type: "string", short: "d"},
            "server-default-document": {type: "string"}
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

// Usage:
//     node runner.js [options]
//
// Options:
//     -e, --runtime-engine <engine>
//           browser engine (blink, gecko, webkit)
//     -t, --runtime-timeout <ms>
//           timeout in milliseconds
//     -d, --server-docroot <path>
//           document root
//         --server-default-document <file name>
//           standard document
//     -a, --server-address <address>
//           server address
//     -p, --server-port <port>
//           server port
//
// Examples:
//     cd test/playwright
//     npm install
//     npx playwright install chromium
//     node runner.js -p 8001 -e blink -d ..
//
//     cd test/playwright
//     npm install
//     npx playwright install firefox
//     node runner.js -p 8002 -e gecko -d ..
//
//     cd test/playwright
//     npm install
//     npx playwright install webkit
//     node runner.js -p 8003 -e webkit -d ..
//
// Update Playwright Version
//     ./composite-js/test/playwright/package.json
//     ./composite-js/test/playwright/Dockerfile

if (require.main === module)
    main({config: _configuration(_parseCommandLine())})
        .then(({failed}) => {
            if (failed)
                process.exitCode = 1;
        })
        .catch(error => {
            console.error(error.stack || error);
            process.exitCode = 1;
        });

module.exports = {
    main
};
