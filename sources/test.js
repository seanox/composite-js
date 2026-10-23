/**
 * Seanox composite-js, application runtime for single-page applications
 * Copyright (C) 2026 Seanox Software Solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 *     DESCRIPTION
 *     ----
 * Test is an API and a modular part of composite-js for implementing and
 * executing integration tests. Tests can be organized as tasks, scenarios and
 * suites. The smallest component is called task because `case` is a JavaScript
 * keyword.
 *
 * The Test API is optional part of composite-js but must be activated
 * explicitly, because it changes error handling and console output and extends
 * parts of the JavaScript API for testing.
 *
 *     Test.activate();
 *
 * see also: https://seanox.github.io/composite-js/manuals/test.html
 */
(() => {

    "use strict";

    const PATTERN_EVENT = /^(?:test[A-Z][A-Za-z0-9]*|[a-z]+)$/;

    const EVENT_FINISH = "testFinish";
    const EVENT_INTERRUPT = "testInterrupt";
    const EVENT_PERFORM = "testPerform";
    const EVENT_RESPONSE = "testResponse";
    const EVENT_RESUME = "testResume";
    const EVENT_START = "testStart";
    const EVENT_SUSPEND = "testSuspend";

    compliant("Test");
    compliant(null, window.Test = {

        /**
         * Activates the test API. The method can be called multiple times, but
         * is ignored after the first call. A later deactivation of the test API
         * is not possible.
         */
        activate() {
            _activate();
        }
    });

    const _activate = () => {

        const _composer_fire = Composer.fire;
        Composer.fire = function(event, ...variants) {
            const type = (event || "").trim();
            if (type) {
                const customEvent = new CustomEvent(type);
                customEvent[type] = Object.assign({}, ...variants);
                window.dispatchEvent(customEvent);
            }
            return _composer_fire.call(this, event, ...variants);
        };

        window["Test"] = {

            /** Pattern for all accepted events */
            get PATTERN_EVENT() {return PATTERN_EVENT;},

            /** Constants of events */
            get EVENT_FINISH() {return EVENT_FINISH;},
            get EVENT_INTERRUPT() {return EVENT_INTERRUPT;},
            get EVENT_PERFORM() {return EVENT_PERFORM;},
            get EVENT_RESPONSE() {return EVENT_RESPONSE;},
            get EVENT_RESUME() {return EVENT_RESUME;},
            get EVENT_START() {return EVENT_START;},
            get EVENT_SUSPEND() {return EVENT_SUSPEND;},

            /** Constants for a current timestamp */
            get TIMESTAMP() {return new Date().toUTCString();},

            /** 
             * Activates the test API. The method can be called multiple times,
             * but is ignored after the first call. A later deactivation of the
             * test API is not possible.
             */
            activate() {
            },
                            
            /**
             * Registers a callback function for test events.
             * @param {string} event see Test.EVENT_***
             * @param {function} callback callback function
             * @throws {Error} An error occurs in the following cases:
             *     - event is not valid or is not supported
             *     - callback function is not implemented correctly
             *       or does not exist
             */
            listen(event, callback) {
                
                if (typeof event !== "string"
                        || typeof callback !== "function")
                    throw new TypeError("Invalid data type");
                if (!event.match(PATTERN_EVENT))
                    throw new Error("Invalid event");
                
                event = event.toLowerCase();
                if (!_listeners.has(event)
                        && !Array.isArray(_listeners.get(event)))
                    _listeners.set(event, []);
                _listeners.get(event).push(callback);
            },
            
            /**
             * Internal method to trigger an event. All callback functions for
             * this event are captured and delivered synchronously, including
             * nested events. Listener errors are reported asynchronously.
             * If the script is in a frame, the parent object is triggered after
             * the current object.
             * @param {string} event  see Test.EVENT_***
             * @param {Object} status meta-object with information about the
             *     test execution
             */
            fire(event, status) {
                event = (event || "").trim();
                if (!event)
                    return;

                const worker = _worker;
                if (worker)
                    worker.status = event;

                const callbacks = [];
                const monitorEvent = event.replace(/^test([A-Z])/, (match, letter) =>
                    letter.toLowerCase()).toLowerCase();
                const monitor = worker && worker.monitor;
                const callback = monitor && monitor[monitorEvent];
                if (typeof callback === "function")
                    callbacks.push(() => {
                        try {callback.call(monitor, status);
                        } catch (error) {
                            console.error(error);
                        }
                    });

                const customEvent = new CustomEvent(event);
                customEvent[event] = status;
                callbacks.push(() => window.dispatchEvent(customEvent));

                const listeners = _listeners.get(event.toLowerCase());
                if (Array.isArray(listeners))
                    callbacks.push(...listeners.map(callback =>
                        () => callback(event, status)));

                const context = parentContext("Test");
                const forward = context && context.fire;
                if (typeof forward === "function")
                    callbacks.push(() => forward.call(context, event, status));
                for (const callback of callbacks)
                    try {callback();
                    } catch (error) {
                        Composer.asynchronous(() => {throw error;});
                    }
            },
            
            /**
             * Creates and registers a test task. A test task is a function or
             * object with the required meta information for performing and a
             * test method to be executed.
             * 
             *     structure of meta: {name:..., test:..., timeout:..., expected:..., ignore:...}
             *     
             * name        optional name of the test task
             * test        an implemented method to be executed as a test
             * timeout     maximum runtime of the test task in milliseconds
             *             Exceeding this limit will cause the test to fail.
             *             A value greater than 0 is expected, otherwise the
             *             timeout is ignored.
             * expected    if you want to test for the occurrence of an error
             *             The error must occur if the test is successful.
             *             An error constructor/function or a RegExp is expected
             *             as value.
             * ignore      true, if the test is to be ignored
             *
             * @param {Object} meta
             *
             * Details are described in the documentation:
             * https://seanox.github.io/composite-js/manuals/test.html#task
             */
            create(meta) {
                
                if (meta == null
                        || typeof meta !== "object")
                    throw new TypeError("Invalid object type");

                if (typeof meta.test !== "function")
                    return;
                
                if (meta.ignore !== undefined
                        && meta.ignore === true)
                    return;
                
                if (_stack.has(meta))
                    return;

                _stack.add(meta);
                const stack = Array.from(_stack);
                Object.defineProperty(meta, "serial", {
                    value: Math.max(stack.length, stack.length > 1 ? stack[stack.length -2].serial +1 : 1)
                });       
            },

            /**
             * Starts the test run. The execution of the tests can optionally be
             * configured with the start by passing a meta-object. The
             * parameters in the meta-object are optional and cannot be changed
             * when the test are running. Only with the next start can new
             * parameters be passed as meta-objects.
             *
             *     structure of meta: {auto:..., output:..., monitor:...}
             *
             * auto       true, the start is triggered when the page is loaded
             *            If the page is already loaded, the parameter auto is
             *            ignored and the start is executed immediately.
             * output     object for outputting messages and errors, with the
             *            methods log and error
             *            If not specified, the console object is used.
             * monitor    object that monitors the test procedure and is
             *            informed about the various cycles during execution,
             *            with the methods start, suspend, resume, interrupt,
             *            perform, response and finish, each called with the
             *            current status
             *            If not specified, the internal monitor is used with a
             *            simple console output.
             *
             * @param {Object} [meta]
             *
             * Details are described in the documentation:
             * https://seanox.github.io/composite-js/manuals/test.html#configuration
             */
            start(meta) {
                
                if (_worker !== undefined)
                    return;

                if (meta && meta.auto
                        && (document.readyState === "loading"
                            || document.readyState === "interactive")) {
                    if (!_autostart) {
                        _autostart = true;
                        window.addEventListener("load", () =>
                            Test.start(meta));
                    }
                    return;
                }

                const numerical = (number, text) =>
                    `${number} ${text}${number !== 1 ? "s" : ""}`;

                const worker = {
                    paused: false,
                    interrupted: false,
                    started: false,
                    output: (meta && meta.output) || console,
                    queue: {timing:Date.now(), stack:Array.from(_stack), size:_stack.size, lock:false, progress:0, faults:0}
                };
                worker.queue.size = worker.queue.stack.length;
                _worker = worker;

                // Monitoring of test processing
                worker.monitor = (meta && meta.monitor) || {
                    start(status) {
                        worker.output.log(`${Test.TIMESTAMP} Test is started`
                                + `, ${numerical(status.queue.size, "task")} in the queue`);
                    },
                    suspend(status) {
                        worker.output.log(`${Test.TIMESTAMP} Test is suspended`
                                + `, ${numerical(status.queue.length, "task")} still outstanding`);
                    },
                    resume(status) {
                        worker.output.log(`${Test.TIMESTAMP} Test is continued`
                                + `, ${numerical(status.queue.size, "task")} in the queue`);
                    },
                    interrupt(status) {
                        worker.output.log(`${Test.TIMESTAMP} Test is interrupted`
                                + `\n\t${numerical(status.queue.size -status.queue.progress, "task")} still outstanding`
                                + `\n\t${numerical(status.queue.faults, "fault")} were detected`
                                + `\n\ttotal time ${Date.now() -status.queue.timing} ms`);
                    },
                    perform(status) {
                    },
                    response(status) {
                        const timing = Date.now() -status.task.timing;
                        if (status.task.error)
                            worker.output.error(`${Test.TIMESTAMP} Test task`
                                + ` ${status.task.title}`
                                + ` ${String(status.task.error.message || "unknown error").trim()}`);
                        else worker.output.log(`${Test.TIMESTAMP} Test task ${status.task.title} was successful (${timing} ms)`);
                    },
                    finish(status) {
                        worker.output.log(`${Test.TIMESTAMP} Test is finished`
                                + `\n\t${numerical(status.queue.size, "task")} were performed`
                                + `\n\t${numerical(status.queue.faults, "fault")} were detected`
                                + `\n\ttotal time ${Date.now() -status.queue.timing} ms`);
                    }
                };

                const isCurrent = () =>
                    _worker === worker && !worker.interrupted;

                const scheduleTask = task => {
                    if (!isCurrent()
                            || worker.paused
                            || task.started
                            || task.scheduled)
                        return;

                    task.scheduled = true;
                    Composer.asynchronous(() => {
                        task.scheduled = false;
                        if (!isCurrent()
                                || worker.paused
                                || task.started)
                            return;

                        task.started = true;
                        task.timing = Date.now();
                        task.timeout = (Number(task.meta.timeout) || 0) > 0
                                ? task.timing +Number(task.meta.timeout)
                                : false;

                        let result;
                        try {result = task.meta.test();
                        } catch (error) {
                            completeTask(worker, task, true, error);
                            return;
                        }
                        Promise.resolve(result).then(
                            () => completeTask(worker, task),
                            error => completeTask(worker, task, true, error));
                    });
                };

                worker.timeout = window.setInterval(() => {
                    if (!isCurrent())
                        return;

                    const task = worker.task;
                    if (!task
                            || !task.started
                            || task.completed
                            || !task.timeout
                            || task.timeout > Date.now())
                        return;

                    const duration = Date.now() -task.timing;
                    completeTask(worker, task, true,
                        new Error(`Timeout occurred, expected ${task.meta.timeout} ms but was ${duration} ms`), true);
                }, 25);

                worker.interval = window.setInterval(() => {
                    if (!isCurrent()
                            || worker.paused)
                        return;

                    if (!worker.started) {
                        worker.started = true;
                        Test.fire(EVENT_START, createStatus(worker));
                        if (!isCurrent()
                                || worker.paused)
                            return;
                    }

                    if (worker.queue.lock) {
                        if (worker.task)
                            scheduleTask(worker.task);
                        return;
                    }

                    if (worker.queue.stack.length > 0) {
                        worker.queue.lock = true;
                        worker.queue.progress++;
                        const taskMeta = worker.queue.stack.shift();
                        worker.task = {
                            title: "#" +taskMeta.serial,
                            meta: taskMeta,
                            running: true,
                            timing: Date.now(),
                            timeout: false,
                            duration: false,
                            error: null,
                            started: false,
                            scheduled: false,
                            completed: false
                        };
                        if (typeof taskMeta.name === "string"
                                && taskMeta.name.trim().length > 0)
                            worker.task.title += " " +taskMeta.name.replace(/[\x00-\x20]+/g, " ").trim();
                        Test.fire(EVENT_PERFORM, createStatus(worker));
                        scheduleTask(worker.task);
                        return;
                    }

                    window.clearInterval(worker.interval);
                    window.clearInterval(worker.timeout);
                    worker.finished = true;
                    Test.fire(EVENT_FINISH, createStatus(worker));
                    if (_worker === worker)
                        _worker = undefined;
                }, 25);
            },

            /**
             * Suspends the current test run, which can be continued from the
             * current test with Test.resume().
             * @throws {Error} An error occurs in the following cases:
             *     - No worker is present or cannot be suspended
             */
            suspend() {
                const worker = _worker;
                if (worker === undefined
                        || worker.interrupted
                        || worker.paused)
                    throw new Error("Suspend is not available"); 
                worker.paused = true;
                Test.fire(EVENT_SUSPEND, createStatus(worker));
            },
            
            /** 
             * Continues the test run if it was previously suspended.
             * @throws {Error} An error occurs in the following cases:
             *     - No worker is present or cannot be resumed
             */
            resume() {
                const worker = _worker;
                if (worker === undefined
                        || worker.interrupted
                        || !worker.paused)
                    throw new Error("Resume is not available"); 
                worker.paused = false;
                Test.fire(EVENT_RESUME, createStatus(worker));
            },
            
            /**
             * Interrupts the current test run and discards all outstanding
             * tests. The test run can be restarted with Test.start().
             * @throws {Error} An error occurs in the following cases:
             *     - No worker is present or cannot be interrupted
             */
            interrupt() {
                const worker = _worker;
                if (worker === undefined
                        || worker.interrupted)
                    throw new Error("Interrupt is not available"); 
                worker.interrupted = true;
                window.clearInterval(worker.interval);
                window.clearInterval(worker.timeout);
                if (worker.task) {
                    worker.task.running = false;
                    worker.task.scheduled = false;
                }
                worker.queue.lock = false;
                Test.fire(EVENT_INTERRUPT, createStatus(worker));
                if (_worker === worker)
                    _worker = undefined;
            },

            /**
             * Makes a snapshot of the status of the current test. The status
             * contains details of the current task and the queue. The details
             * are read-only and cannot be changed. If no test is executed,
             * false is returned.
             *  
             *     structure of details: {task:..., queue:...}
             *     
             * task.title      title of the test task    
             * task.meta       meta information about the test itself name,
             *                 test, timeout, expected, serial
             * task.running    indicator when the test task is in progress
             * task.timing     start time from the test task in milliseconds
             * task.timeout    optional, the time in milliseconds when a timeout
             *                 is expected
             * task.duration   total execution time of the test task in
             *                 milliseconds, is set with the end of the test
             *                 task
             * task.error      optional, if an unexpected error (also assert
             *                 error) has occurred, which terminated the test
             *                 task
             * 
             * queue.timing    start time in milliseconds 
             * queue.size      original queue length
             * queue.length    number of outstanding tests
             * queue.progress  number of tests performed     
             * queue.lock      indicator when a test is performed and the queue
             *                 is waiting
             * queue.faults    number of detected faults 
             * 
             * @returns {object} an object with status information, otherwise false
             */
            status() {
                return createStatus(_worker);
            }
        };

        const parentContext = name => {
            if (!parent || parent === window)
                return;
            try {return parent[name];
            } catch (error) {
                if (error.name !== "SecurityError")
                    throw error;
            }
        };

        const isCurrentWorker = worker =>
            _worker === worker && !worker.interrupted;

        const createStatus = worker => {
            const status = {};
            if (worker && typeof worker.task === "object") {
                status.task = {};
                ["title", "meta", "running", "timing", "timeout", "duration", "error"]
                    .forEach(name => Object.defineProperty(status.task, name, {
                        value: worker.task[name],
                        enumerable: true
                    }));
            }
            if (worker && typeof worker.queue === "object") {
                status.queue = {};
                [
                    ["timing", worker.queue.timing],
                    ["size", worker.queue.size],
                    ["length", worker.queue.stack.length],
                    ["progress", worker.queue.progress],
                    ["lock", worker.queue.lock],
                    ["faults", worker.queue.faults]
                ].forEach(([name, value]) => Object.defineProperty(status.queue, name, {
                    value,
                    enumerable: true
                }));
            }
            if (status.task === undefined
                    && status.queue === undefined)
                return false;
            return status;
        };

        const errorText = value => {
            try {return String(value);
            } catch (error) {
                return "Unprintable thrown value";
            }
        };

        const normalizeError = value => {
            try {
                if (value instanceof Error) {
                    if (String(value.message || "").trim())
                        return value;
                }
            } catch (error) {
            }

            let message;
            if (value != null
                    && (typeof value === "object" || typeof value === "function"))
                try {
                    if (value.message != null)
                        message = String(value.message).trim();
                } catch (error) {
                }
            if (!message) {
                message = errorText(value).trim();
                if (!message)
                    message = "failed";
            }
            return new Error(message);
        };

        const matchesExpected = (expected, value) => {
            if (typeof expected === "function")
                try {return value instanceof expected;
                } catch (error) {
                    return false;
                }
            try {
                if (expected instanceof RegExp)
                    return errorText(value).match(expected) !== null;
            } catch (error) {
                return false;
            }
            return false;
        };

        const completeTask = (worker, task, thrown = false, value = undefined, timedOut = false) => {
            if (!isCurrentWorker(worker)
                    || worker.task !== task
                    || task.completed)
                return;

            task.completed = true;
            task.running = false;
            task.duration = Date.now() -task.timing;
            if (timedOut)
                task.error = normalizeError(value);
            else if (thrown) {
                if (!task.meta.expected
                        || !matchesExpected(task.meta.expected, value))
                    task.error = normalizeError(value);
            } else if (task.meta.expected)
                task.error = new Error("Assert error expected failed");

            if (!task.error
                    && task.timeout
                    && task.timeout < Date.now())
                task.error = taskTimeoutError(task);

            if (task.error)
                worker.queue.faults++;
            worker.queue.lock = false;
            Test.fire(EVENT_RESPONSE, createStatus(worker));
        };

        const taskTimeoutError = task =>
            new Error(`Timeout occurred, expected ${task.meta.timeout} ms but was ${task.duration} ms`);

        /** Backlog of created/registered test tasks */
        const _stack = new Set();

        /** Map with events and their registered listeners */
        const _listeners = new Map();

        /** Currently running worker instance */
        let _worker;

        /** Flag for automatic launch when the page loads */
        let _autostart = false;

        (() => {

            // Redirection of the console level INFO, ERROR, WARN, LOG when
            // using tests. The outputs are buffered for analysis and listeners
            // can be implemented whose callback method is called at console
            // outputs.

            /** Cache for analyzing console output */
            const _output = {log:"", warn:"", error:"", info:""};

            console.output = {
                get log()   {return _output.log;},
                get warn()  {return _output.warn;},
                get error() {return _output.error;},
                get info()  {return _output.info;}
            };

            /** Clears the cache from the console output. */
            console.output.clear = () => {
                _output.log   = "";
                _output.warn  = "";
                _output.error = "";
                _output.info  = "";
            };

            /** Set of registered listeners for occurring console outputs. */
            const _listeners = new Set();

            /**
             * Registers a callback function for console output.
             * @param {function} callback callback function
             */
            console.listen = function(callback) {
                if (typeof callback !== "function")
                    throw new TypeError("Invalid data type");
                _listeners.add(callback);
            };

            /**
             * General method for redirecting console levels. If the script is
             * in a frame, at the parent object it will also try to trigger this
             * method. The parent object is always triggered after the current
             * object. Captured callbacks are delivered synchronously, including
             * nested output. Listener errors are logged directly to the original
             * console to avoid recursive error notifications.
             * @param {string} level
             * @param {Array} variants
             * @param {Object} [output]
             */
            console.forward = function(level, variants, output = null) {

                if (typeof level !== "string")
                    throw new TypeError("Invalid data type");
                if (output != null
                        && typeof output !== "function")
                    throw new TypeError("Invalid data type");

                variants = Array.from(variants);
                _output[level] += variants.join(", ");
                const callbacks = Array.from(_listeners, callback =>
                    () => callback(level, ...variants));
                if (output)
                    callbacks.unshift(() => output(...variants));
                const context = parentContext("console");
                const forward = context && context.forward;
                if (typeof forward === "function")
                    callbacks.push(() => forward.call(context, level, variants));
                for (const callback of callbacks)
                    try {callback();
                    } catch (error) {
                        Composer.asynchronous(() => _error(error));
                    }
            };

            /** Redirect for the level: LOG */
            const _log = console.log;
            console.log = function(...variants) {
                console.forward("log", variants, _log);
            };

            /** Redirect for the level: WARN */
            const _warn = console.warn;
            console.warn = function(...variants) {
                console.forward("warn", variants, _warn);
            };

            /** Redirect for the level: ERROR */
            const _error = console.error;
            console.error = function(...variants) {
                console.forward("error", variants, _error);
            };

            /** Redirect for the level: INFO */
            const _info = console.info;
            console.info = function(...variants) {
                console.forward("info", variants, _info);
            };

            /** In case of an error, it is forwarded to the console. */
            window.addEventListener("error", (event) => {
                if (parent && parent !== window)
                    console.forward("error", ((...variants) => variants)(event.message), null);
            });
        })();

        /**
         * Enhancement of the JavaScript API
         * The following events are triggered during simulation:
         *     focus, keydown, keyup, input
         * @param {string} value simulated input value
         * @param {boolean} [clear] false suppresses emptying before input
         */
        compliant("Element.prototype.typeValue");
        compliant(null, Element.prototype.typeValue = function(value, clear = true) {

            if (value != null
                    && typeof value !== "string")
                throw new TypeError("Invalid data type");
            if (typeof clear !== "boolean")
                throw new TypeError("Invalid data type");

            this.focus();
            if (clear !== false)
                this.value = "";
            const element = this;
            value = (value || "").split("");
            value.forEach((digit) => {
                element.trigger("keydown");
                element.value = (element.value || "") + digit;
                element.trigger("keyup");
            });
            this.trigger("input", true);
        });

        /**
         * Enhancement of the JavaScript API
         * Adds a method that creates a plain string for an element.
         * @returns {string} plain string for an element
         */
        compliant("Element.prototype.toPlainString");
        compliant(null, Element.prototype.toPlainString = function() {
            return this.outerHTML;
        });

        /**
         * Enhancement of the JavaScript API
         * Adds a method that creates a plain string for a node.
         * @returns {string} plain string for a node
         */
        compliant("Node.prototype.toPlainString");
        compliant(null, Node.prototype.toPlainString = function() {
            return (new XMLSerializer()).serializeToString(this);
        });

        /**
         * Enhancement of the JavaScript API
         * Adds a method that creates a plain string for an object.
         * @returns {string} plain string for an object
         */
        compliant("Object.prototype.toPlainString");
        compliant(null, Object.prototype.toPlainString = function() {
            if (this != null
                    && typeof this[Symbol.iterator] === 'function')
                return JSON.stringify([...this]);
            return JSON.stringify(this);
        });

        /**
         * Enhancement of the JavaScript API
         * Adds a method to trigger an event for elements.
         * @param {string} event type of event
         * @param {boolean} [bubbles] deciding whether the event should bubble
         *     up through the event chain or not
         * @param {boolean} [cancel] defining whether the event can be canceled
         */
        compliant("Element.prototype.trigger");
        compliant(null, Element.prototype.trigger = function(event, bubbles = false, cancel = true) {

            if (typeof event !== "string"
                    || typeof bubbles !== "boolean"
                    || typeof cancel !== "boolean")
                throw new TypeError("Invalid data type");

            this.dispatchEvent(new Event(event, {bubbles:bubbles, cancelable:cancel}));
        });

        /**
         * A set of assertion methods useful for writing tests.
         * Only failed assertions are recorded.
         * These methods can be used directly:
         *     Assert.assertEquals(...);
         */
        compliant("Assert");
        compliant(null, window.Assert = {
                
            /**
             * Creates a new assertion based on an array of variant parameters.
             * Size defines the number of test values. If more parameters are
             * passed, the first must be the message.
             * @param {*} parameters
             * @param {number} size
             */
            create(parameters, size) {

                if (typeof size !== "number")
                    throw new TypeError("Invalid data type");

                const assert = {message:null, values:[], error(...variants) {
                    variants.forEach((parameter, index, array) => {
                        array[index] = String(parameter).replace(/\{(\d+)\}/g, (match, index) => {
                            if (index >= assert.values.length)
                                return "[null]";
                            match = String(assert.values[index]);
                            match = match.replace(/\s*[\r\n]+\s*/g, " "); 
                            return match;
                        });
                    });
                    
                    let message = "expected {1} but was {2}";
                    if (assert.message !== null) {
                        assert.message = String(assert.message).trim();
                        if (assert.message)
                            message = assert.message;
                    }
                    message = "{0} failed, " + message;
                    message = message.replace(/\{(\d+)\}/g, (match, index) => {
                        if (index >= variants.length)
                            return "[null]";
                        match = String(variants[index]);
                        match = match.replace(/\s*[\r\n]+\s*/g, " "); 
                        return match;                
                    });
                    return new Error(message);
                }};

                parameters = Array.from(parameters || []);
                let [message, values] = parameters.length > size
                        ? [parameters[0], parameters.slice(1)]
                        : [null, parameters];
                assert.message = message;
                assert.values = values;
    
                return assert;
            },
            
            /**
             * Asserts that a value is true.
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, value) 
             *     function(value)
             *
             * @param {string} [message] message
             * @param {*} value assertion value
             * @throws {Error} If the assertion failed
             */       
            assertTrue(...variants) {
                const assert = Assert.create(variants, 1);
                if (assert.values[0] === true)
                    return;
                throw assert.error("Assert.assertTrue", "true", "{0}");
            },
            
            /**
             * Asserts that a value is false.
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, value) 
             *     function(value)
             *
             * @param {string} [message] message
             * @param {*} value assertion value
             * @throws {Error} If the assertion failed
             */      
            assertFalse(...variants) {
                const assert = Assert.create(variants, 1);
                if (assert.values[0] === false)
                    return;
                throw assert.error("Assert.assertFalse", "false", "{0}");
            },
    
            /**
             * Asserts that two values are equals.
             * Difference between equals and same: === / == or !== / !=
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, compare, actual)
             *     function(compare, actual)
             *
             * @param {string} [message] message
             * @param {*} compare unexpected assertion value
             * @param {*} value unexpected assertion value
             * @throws {Error} If the assertion failed
             */     
            assertEquals(...variants) {
                const assert = Assert.create(variants, 2);
                if (assert.values[0] === assert.values[1])
                    return;
                throw assert.error("Assert.assertEquals", "{0}", "{1}");
            },

            /**
             * Asserts that two values are not equals.
             * Difference between equals and same: === / == or !== / !=
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, compare, actual)
             *     function(compare, actual)
             *
             * @param {string} [message] message
             * @param {*} compare unexpected assertion value
             * @param {*} value unexpected assertion value
             * @throws {Error} If the assertion failed
             */      
            assertNotEquals(...variants) {
                const assert = Assert.create(variants, 2);
                if (assert.values[0] !== assert.values[1])
                    return;
                throw assert.error("Assert.assertNotEquals", "not {0}", "{1}");
            },
    
            /**
             * Asserts that two values are the same.
             * Difference between equals and same: === / == or !== / !=
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, compare, actual)
             *     function(compare, actual)
             *
             * @param {string} [message] message
             * @param {*} compare unexpected assertion value
             * @param {*} value unexpected assertion value
             * @throws {Error} If the assertion failed
             */      
            assertSame(...variants) {
                const assert = Assert.create(variants, 2);
                if (assert.values[0] == assert.values[1])
                    return;
                throw assert.error("Assert.assertSame", "{0}", "{1}");
            },
            
            /**
             * Asserts two values are not the same.
             * Difference between equals and same: === / == or !== / !=
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, compare, actual)
             *     function(compare, actual)
             *
             * @param {string} [message] message
             * @param {*} compare unexpected assertion value
             * @param {*} value unexpected assertion value
             * @throws {Error} If the assertion failed
             */
            assertNotSame(...variants) {
                const assert = Assert.create(variants, 2);
                if (assert.values[0] != assert.values[1])
                    return;
                throw assert.error("Assert.assertNotSame", "not {0}", "{1}");
            },

            /**
             * Asserts that a value is undefined.
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, value)
             *     function(value)
             *
             * @param {string} [message] message
             * @param {*} value assertion value
             * @throws {Error} If the assertion failed
             */
            assertUndefined(...variants) {
                const assert = Assert.create(variants, 1);
                if (assert.values[0] === undefined)
                    return;
                throw assert.error("Assert.assertUndefined", "undefined", "{0}");
            },

            /**
             * Asserts that a value is not undefined.
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, value)
             *     function(value)
             *
             * @param {string} [message] message
             * @param {*} value assertion value
             * @throws {Error} If the assertion failed
             */
            assertNotUndefined(...variants) {
                const assert = Assert.create(variants, 1);
                if (assert.values[0] !== undefined)
                    return;
                throw assert.error("Assert.assertNotUndefined", "not undefined", "{0}");
            },

            /**
             * Asserts that a value is null.
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, value) 
             *     function(value)
             *
             * @param {string} [message] message
             * @param {*} value assertion value
             * @throws {Error} If the assertion failed
             */
            assertNull(...variants) {
                const assert = Assert.create(variants, 1);
                if (assert.values[0] === null)
                    return;
                throw assert.error("Assert.assertNull", "null", "{0}");
            },
    
            /**
             * Asserts that a value is not null.
             * If the assertion is false, an error with message is thrown.
             *
             * The method has the following various signatures:
             *     function(message, value) 
             *     function(value) 
             *
             * @param {string} [message] message
             * @param {*} value assertion value
             * @throws {Error} If the assertion failed
             */
            assertNotNull(...variants) {
                const assert = Assert.create(variants, 1);
                if (assert.values[0] !== null)
                    return;
                throw assert.error("Assert.assertNotNull", "not null", "{0}");
            },
    
            /**
             * Fails a test with an optional message.
             *
             * The method has the following various signatures:
             *     function(message) 
             *     function() 
             *
             * @param {*} [message] error message
             * @throws {Error} Assertion failed
             */
            fail(message) {
                if (message != null)
                    message = String(message).trim();
                throw new Error(`Assert.fail${message ? ", " + message : ""}`);
            }      
        });
    }
})();