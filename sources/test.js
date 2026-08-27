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

        window["Test"] = {

            /** Pattern for all accepted events */
            get PATTERN_EVENT() {return /^[a-z]+$/;},

            /** Constants of events */
            get EVENT_FINISH() {return "finish";},
            get EVENT_INTERRUPT() {return "interrupt";},
            get EVENT_PERFORM() {return "perform";},
            get EVENT_RESPONSE() {return "response";},
            get EVENT_RESUME() {return "resume";},
            get EVENT_START() {return "start";},
            get EVENT_SUSPEND() {return "suspend";},

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
                if (!event.match(Test.PATTERN_EVENT))
                    throw new Error("Invalid event");
                
                event = event.toLowerCase();
                if (!_listeners.has(event)
                        && !Array.isArray(_listeners.get(event)))
                    _listeners.set(event, []);
                _listeners.get(event).push(callback);
            },
            
            /**
             * Internal method to trigger an event. All callback functions for
             * this event are called. If the script is in a frame, at the parent
             * object it will also try to trigger this method. The parent object
             * is always triggered after the current object. If an error occurs
             * when calling the current object, the parent object is not
             * triggered.
             * @param {string} event  see Test.EVENT_***
             * @param {Object} status meta-object with information about the
             *     test execution
             */
            fire(event, status) {
                
                if (typeof Test.worker === "object")
                    Test.worker.status = event;

                if (typeof Test.worker === "object"
                        && typeof Test.worker.monitor === "object"
                        && typeof Test.worker.monitor[event] === "function")
                    try {Test.worker.monitor[event](status);
                    } catch (error) {
                        console.error(error);
                    }

                event = (event || "").trim();
                if (!event)
                    return;
                const listeners = _listeners.get(event.toLowerCase());
                if (Array.isArray(listeners))
                    listeners.forEach(callback =>
                        callback(event, status));

                if (parent && parent !== window)
                    try {parent.Test.fire(event, status);
                    } catch (error) {
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
                
                if (typeof meta == null
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
                
                if (Test.worker !== undefined)
                    return;

                if (meta && meta.auto
                        && (document.readyState === "loading"
                            || document.readyState === "interactive")) {
                    if (Test.start.auto === undefined) {
                        Object.defineProperty(Test.start, "auto", {
                            value: true
                        });  
                        window.addEventListener("load", () =>
                            Test.start(meta));
                    }
                    return;
                }

                const numerical = (number, text) =>
                    `${number} ${text}${number !== 1 ? "s" : ""}`;

                Test.worker = {};

                // Test.worker.output
                // Output to be used for all messages and errors
                Test.worker.output = (meta && meta.output) || console;
                
                // Test.worker.monitor
                // Monitoring of test processing
                Test.worker.monitor = (meta && meta.monitor) || {
                    start(status) {
                        Test.worker.output.log(`${Test.TIMESTAMP} Test is started`
                                + `, ${numerical(status.queue.size, "task")} in the queue`);
                    },
                    suspend(status) {
                        Test.worker.output.log(`${Test.TIMESTAMP} Test is suspended`
                                + `, ${numerical(status.queue.length, "task")} still outstanding`);
                    },
                    resume(status) {
                        Test.worker.output.log(`${Test.TIMESTAMP} Test is continued`
                                + `, ${numerical(status.queue.size, "task")} in the queue`);
                    },
                    interrupt(status) {
                        Test.worker.output.log(`${Test.TIMESTAMP} Test is interrupted`
                                + `\n\t${numerical(status.queue.size -status.queue.progress, "task")} still outstanding`
                                + `\n\t${numerical(status.queue.faults, "fault")} were detected`
                                + `\n\ttotal time ${Date.now() -status.queue.timing} ms`);
                    },
                    perform(status) {
                    },
                    response(status) {
                        const timing = Date.now() -status.task.timing;
                        if (status.task.error)
                            Test.worker.output.error(`${Test.TIMESTAMP} Test task ${status.task.title} ${status.task.error.message}`);
                        else Test.worker.output.log(`${Test.TIMESTAMP} Test task ${status.task.title} was successful (${timing} ms)`);
                    },
                    finish(status) {
                        Test.worker.output.log(`${Test.TIMESTAMP} Test is finished`
                                + `\n\t${numerical(status.queue.size, "task")} were performed`
                                + `\n\t${numerical(status.queue.faults, "fault")} were detected`
                                + `\n\ttotal time ${Date.now() -status.queue.timing} ms`);
                    }            
                };

                // Test.worker.queue
                // Queue of currently running test tasks
                Test.worker.queue = Test.worker.queue || {timing:false, stack:[], size:0, lock:false, progress:0, faults:0};
                if (Test.worker.queue.stack.length <= 0) {
                    Test.worker.queue.stack = Array.from(_stack);
                    Test.worker.queue.size = Test.worker.queue.stack.length;
                    Test.worker.queue.timing = Date.now();
                }
                
                // Test.worker.timeout
                // Timer for controlling test tasks with timeout
                Test.worker.timeout = window.setInterval(() => {
                
                    if (Test.worker.status === Test.EVENT_SUSPEND)
                        return;
                    
                    if (Test.worker.task === undefined
                            || !Test.worker.task.running
                            || !Test.worker.queue.lock)
                        return;

                    const task = Test.worker.task;
                    if (!task.timeout
                            || task.timeout > Date.now())
                        return;
                    
                    task.duration = Date.now() -task.timing;
                    task.error = new Error(`Timeout occurred, expected ${task.timeout} ms but was ${task.duration} ms`);
                    Test.fire(Test.EVENT_RESPONSE, Test.status());
                    Test.worker.queue.faults++;
                    Test.worker.queue.lock = false;
                }, 25);
                
                // Test.worker.interval
                // Timer for processing the queue
                Test.worker.interval = window.setInterval(() => {

                    if (Test.worker.status === Test.EVENT_SUSPEND)
                        return;
                    
                    if (!Test.worker.queue.lock
                            && Test.worker.queue.progress <= 0)
                        Test.fire(Test.EVENT_START, Test.status());
                    
                    if (Test.worker.queue.lock)
                        return;
                    
                    if (Test.worker.queue.stack.length > 0) {
                        Test.worker.queue.lock = true;
                        Test.worker.queue.progress++;
                        const meta = Test.worker.queue.stack.shift();
                        let timeout = false;
                        if ((meta.timeout || 0) > 0)
                            timeout = Date.now() +meta.timeout;

                        Test.worker.task = {title:null, meta, running:true, timing:Date.now(), timeout, duration:false, error:null};
                        Test.worker.task.title = "#" + meta.serial;
                        if (typeof meta.name === "string"
                                && meta.name.trim().length > 0)
                            Test.worker.task.title += " " + meta.name.replace(/[\x00-\x20]+/g, " ").trim();
                        Test.fire(Test.EVENT_PERFORM, Test.status());
                        Composer.asynchronous(() => {
                            const task = Test.worker.task;
                            try {task.meta.test();
                            } catch (error) {
                                task.error = error;
                                if (!task.error.message
                                        || !task.error.message.trim())
                                    task.error.message = "failed";
                            } finally {
                                if (task.meta.expected) {
                                    if (task.error) {
                                        if (typeof task.meta.expected === "function"
                                                && task.error instanceof(task.meta.expected))
                                            task.error = null;
                                        if (typeof task.meta.expected === "object"
                                                && task.meta.expected instanceof(RegExp)
                                                && String(task.error).match(task.meta.expected))
                                            task.error = null;
                                    } else task.error = Error("Assert error expected failed");
                                }
                                task.running = false;
                                task.duration = Date.now() -task.timing;
                                if (task.timeout
                                        && task.timeout < Date.now()
                                        && !task.error) {
                                    task.error = new Error(`Timeout occurred, expected ${task.meta.timeout} ms but was ${task.duration} ms`);
                                    Test.fire(Test.EVENT_RESPONSE, Test.status());
                                    Test.worker.queue.faults++;
                                }
                                if (!task.error
                                        || !String(task.error.message).match(/^Timeout occurred/)) {
                                    if (task.error)
                                        Test.worker.queue.faults++;
                                    Test.fire(Test.EVENT_RESPONSE, Test.status());
                                }
                                Test.worker.queue.lock = false;
                            }
                        });
                        return;
                    }
                    
                    window.clearTimeout(Test.worker.interval);
                    window.clearTimeout(Test.worker.timeout);
                    Test.fire(Test.EVENT_FINISH, Test.status());
                    delete Test.worker;
                }, 25);
            },

            /**
             * Suspends the current test run, which can be continued from the
             * current test with Test.resume().
             * @throws {Error} An error occurs in the following cases:
             *     - No worker is present or cannot be suspended
             */
            suspend() {
                if (Test.worker === undefined)
                    throw new Error("Suspend is not available"); 
                Test.fire(Test.EVENT_SUSPEND, Test.status());
            },
            
            /** 
             * Continues the test run if it was previously suspended.
             * @throws {Error} An error occurs in the following cases:
             *     - No worker is present or cannot be resumed
             */
            resume() {
                if (Test.worker === undefined
                        || Test.worker.status !== Test.EVENT_SUSPEND)
                    throw new Error("Resume is not available"); 
                Test.fire(Test.EVENT_RESUME, Test.status());
            },
            
            /**
             * Interrupts the current test run and discards all outstanding
             * tests. The test run can be restarted with Test.start().
             * @throws {Error} An error occurs in the following cases:
             *     - No worker is present or cannot be interrupted
             */
            interrupt() {
                if (Test.worker === undefined)
                    throw new Error("Interrupt is not available"); 
                window.clearTimeout(Test.worker.interval);
                window.clearTimeout(Test.worker.timeout);
                Test.fire(Test.EVENT_INTERRUPT, Test.status());
                delete Test.worker;
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

                const status = {};
                if (typeof Test.worker === "object"
                        && typeof Test.worker.task === "object") {
                    status.task = {};
                    Object.defineProperty(status.task, "title", {
                        value: Test.worker.task.title,
                        enumerable: true
                    });
                    Object.defineProperty(status.task, "meta", {
                        value: Test.worker.task.meta,
                        enumerable: true
                    });
                    Object.defineProperty(status.task, "running", {
                        value: Test.worker.task.running,
                        enumerable: true
                    });
                    Object.defineProperty(status.task, "timing", {
                        value: Test.worker.task.timing,
                        enumerable: true
                    });
                    Object.defineProperty(status.task, "timeout", {
                        value: Test.worker.task.timeout,
                        enumerable: true
                    });
                    Object.defineProperty(status.task, "duration", {
                        value: Test.worker.task.duration,
                        enumerable: true
                    });
                    Object.defineProperty(status.task, "error", {
                        value: Test.worker.task.error,
                        enumerable: true
                    });
                }
                
                if (typeof Test.worker === "object"
                        && typeof Test.worker.queue === "object") {
                    status.queue = {};
                    Object.defineProperty(status.queue, "timing", {
                        value: Test.worker.queue.timing,
                        enumerable: true
                    });
                    Object.defineProperty(status.queue, "size", {
                        value: Test.worker.queue.size,
                        enumerable: true
                    });
                    Object.defineProperty(status.queue, "length", {
                        value: Test.worker.queue.stack.length,
                        enumerable: true
                    });
                    Object.defineProperty(status.queue, "progress", {
                        value: Test.worker.queue.progress,
                        enumerable: true
                    });
                    Object.defineProperty(status.queue, "lock", {
                        value: Test.worker.queue.lock,
                        enumerable: true
                    });
                    Object.defineProperty(status.queue, "faults", {
                        value: Test.worker.queue.faults,
                        enumerable: true
                    });
                }
                
                if (status.task === undefined
                        && status.queue === undefined)
                    return false;
                return status;
            }    
        };

        /** Backlog of created/registered test tasks */
        const _stack = new Set();

        /** Map with events and their registered listeners */
        const _listeners = new Map();

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
             * object. If an error occurs when calling the current object, the
             * parent object is not triggered.
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

                _output[level] += Array.from(variants).join(", ");
                if (output)
                    output(...variants);
                _listeners.forEach((callback) =>
                    callback(...([level, ...variants])));
                if (!parent
                        || parent === window
                        || !parent.console
                        || typeof parent.console.forward !== "function")
                    return;
                parent.console.forward(...(Array.from(arguments).slice(0, 2)));
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
            this.trigger("input");
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
                            if (index > assert.values.length)
                                return "[null]";
                            match = String(assert.values[index]);
                            match = match.replace(/\s*[\r\n]+\s*/g, " "); 
                            return match;
                        });
                    });
                    
                    let message = "expected {1} but was {2}";
                    if (assert.message !== null) {
                        assert.message = assert.message.trim();
                        if (assert.message)
                            message = assert.message;
                    }
                    message = "{0} failed, " + message;
                    message = message.replace(/\{(\d+)\}/g, (match, index) => {
                        if (index > variants.length)
                            return "[null]";
                        match = String(variants[index]);
                        match = match.replace(/\s*[\r\n]+\s*/g, " "); 
                        return match;                
                    });
                    return new Error(message);
                }};

                parameters = Array.from(parameters || []);
                if (parameters.length > size)
                    assert.message = parameters.shift();
                while (parameters.length > 0)
                    assert.values.push(parameters.shift());
    
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
                if (assert.values[0] === assert.values[1])
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
                if (assert.values[0] !== assert.values[1])
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