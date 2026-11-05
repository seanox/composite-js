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
 * Expression language and composite script are two important components. Both
 * evaluate ECMAScript/JavaScript. Composite script can be loaded at runtime and
 * can itself load other composite scripts through injected helper functions.
 * Because everything is based on a simple eval command, scripts execute in a
 * separate function scope so that internal methods and constants cannot be
 * accessed unintentionally.
 *
 * see also: https://seanox.github.io/composite-js/manuals/scripting.html
 *           https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    const PATTERN_REQUIRE = /^\w+(\/\w+)*$/;
    const PATTERN_NAMESPACE = /^[_a-z$][\w$]*(\.[_a-z$][\w$]*)*$/i;

    /**
     * Loads a script module from the module directory, without the .js extension.
     * @param {string} path Module path
     * @throws {TypeError} If the argument is not a string
     * @throws {Error} In case of an invalid path or resource loading failure
     */
    const _require = (path) => {
        if (typeof path !== "string")
            throw new TypeError("Invalid require: " + typeof path);
        if (!path.match(PATTERN_REQUIRE))
            throw new Error("Invalid require: " + path);
        return Composer.load(Composer.MODULES + "/" + path + ".js", true);
    };

    const _expose_collector_stack = [];

    /**
     * Collects an object's own enumerable string keys as flat module exports.
     * An optional namespace also publishes the original object on window,
     * using Object.use to obtain or create its parent namespace.
     * Later calls replace exports with the same keys without merging values.
     * @param {object} object Values to export
     * @param {string} [namespace] Full optional publication path on window
     * @returns {object} The original object
     * @throws {TypeError} If the object or namespace has an invalid type
     * @throws {Error} In case of an invalid namespace or failed assignment
     */
    const _expose = function(object, namespace) {

        "use strict";

        if (object === null
                || typeof object !== "object")
            throw new TypeError("Invalid expose: " + (object === null ? "null" : typeof object));
        if (namespace !== undefined) {
            if (typeof namespace !== "string")
                throw new TypeError("Invalid expose namespace: " + typeof namespace);
            if (!namespace.match(PATTERN_NAMESPACE))
                throw new Error("Invalid expose namespace: " + namespace);
            const levels = namespace.split(".");
            const name = levels.pop();
            const parent = levels.length ? Object.use(window, levels.join(".")) : window;
            parent[name] = object;
        }

        const collector = _expose_collector_stack[_expose_collector_stack.length -1];
        if (collector)
            Object.keys(object).forEach(name =>
                Object.defineProperty(collector, name, {
                    value: object[name], writable: true, enumerable: true, configurable: true
                }));
        return object;
    };

    /**
     * Creates a namespace if it does not already exist.
     * @param {string} use Dot-separated namespace
     * @throws {TypeError} If the argument is not a string
     * @throws {Error} If the namespace is invalid
     */
    const _use = (use) => {
        if (typeof use !== "string")
            throw new TypeError("Invalid use: " + typeof use);
        if (!use.match(PATTERN_NAMESPACE))
            throw new Error("Invalid use: " + use);
        Object.use(window, use);
    };

    /**
     * Invokes a callback synchronously, or returns a non-function unchanged.
     * Callback errors yield undefined; promise rejections are not handled.
     * @param {*} invocation Value or callback invoked with window as this
     * @returns {*} Original value, callback result,
     *     or undefined on callback error
     */
    const _attempt = (invocation) => {
        if (typeof invocation !== "function")
            return invocation
        try {return invocation.call(window);
        } catch (error) {
            return undefined;
        }
    };

    /** Cache (signature/execution wrapper) */
    const _cache = new Map();

    /**
     * Shared internal executor for Composite JavaScript and expressions.
     * Uses the supplied context without adding helper bindings.
     * @param {object} context Execution context containing values
     *     available to the script
     * @param {string} script
     * @returns {*} return value of the script, if available
     * @throws {Error} In case of invalid data types or syntax.
     */
    const _execute = (context, script) => {

        if (context === null
                || typeof context !== "object")
            throw new TypeError("Invalid context: " + typeof context);
        if (typeof script !== "string")
            throw new TypeError("Invalid script: " + typeof script);

        if (!script.trim())
            return;

        // To improve performance, cacheable execution wrappers are used.
        // Unbound wrappers are cached by their ordered context keys.
        // Context values and the internal this object are supplied anew.

        const keys = Object.keys(context);
        const signature = JSON.stringify(keys);

        let execute = _cache.get(signature);
        if (!execute)
            execute = Function(
                ...keys,
                '"use strict"; return eval(this.script);'
            );
        else _cache.delete(signature);
        _cache.set(signature, execute);

        return execute.call({script}, ...Object.values(context));
    };

    compliant("Scripting");
    compliant(null, window.Scripting = {

        /**
         * Evaluates JavaScript and returns its final expression value.
         * Provides attempt but no automatic require, use or expose bindings.
         * Suspends any surrounding export collection during evaluation.
         *
         * The function uses variable parameters and has the following
         * signatures:
         *
         *     function(context, script)
         *     function(url, context, script)
         *
         * @param {string} [url] Optional sourceURL for debugging
         * @param {object} context Execution context containing values
         *     available to the script
         * @param {string} script
         * @returns {*} The expression result
         * @throws {Error} In case of invalid data types or syntax.
         *
         * see also: https://seanox.github.io/composite-js/manuals/scripting.html#script-api
         *           https://seanox.github.io/composite-js/manuals/expression.html
         */
        eval(...variants) {

            let {url, context, script} = Arguments.bind(variants, [
                {context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String]}
            ]);

            const source = url ? "\n\n//# sourceURL=" + url + "\n" : "";

            context = Object.assign(Object.create(null), {
                attempt: _attempt
            }, context);

            _expose_collector_stack.push(undefined);
            try {return _execute(context, script + source);
            } finally {
                _expose_collector_stack.pop();
            }
        },

        /**
         * Executes Composite JavaScript and returns its flat collected exports,
         * or a fresh empty object if no entries are exported. Provides require,
         * use, expose and attempt as local bindings. Context values take
         * precedence over these defaults.
         *
         * The function uses variable parameters and has the following
         * signatures:
         *
         *     function(context, script)
         *     function(url, context, script)
         *
         * @param {string} [url] Optional sourceURL for debugging
         * @param {object} context Execution context containing values
         *     available to the script
         * @param {string} script
         * @returns {object} Collected exports
         * @throws {Error} In case of invalid data types or syntax.
         *
         * see also: https://seanox.github.io/composite-js/manuals/scripting.html#script-api
         */
        run(...variants) {

            let {url, context, script} = Arguments.bind(variants, [
                {context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String]}
            ]);

            const source = url ? "\n\n//# sourceURL=" + url + "\n" : "";

            context = Object.assign(Object.create(null), {
                attempt: _attempt, require: _require, use: _use, expose: _expose
            }, context)

            const exports = {};
            _expose_collector_stack.push(exports);
            try {_execute(context, script + source);
            } finally {
                _expose_collector_stack.pop();
            }
            return exports;
        },

        /**
         * Removes cached execution wrappers until the cache size is <= size.
         * @param {number} size Maximum number of cached execution wrappers.
         */
        prune(size) {
            size = Math.max(0, size);
            while (_cache.size > size)
                _cache.delete(_cache.keys().next().value);
        }
    });
})();