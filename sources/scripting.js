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
 * can itself load other composite scripts through the global API. Because in
 * the end everything is based on a simple eval command, it was important to
 * execute the scripts in a separate function scope so that internal methods and
 * constants cannot be accessed unintentionally.
 *
 * see also: https://seanox.github.io/composite-js/manuals/scripting.html
 *           https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    const PATTERN_IMPORT = /^\w+(\/\w+)*$/;

    const PATTERN_NAMESPACE = /^([_a-z]\w*)(\.[_a-z]\w*)*$/i;

    compliant("Scripting");
    compliant(null, window.Scripting = {

        /**
         * Executes a composite script as JavaScript, optionally appending a
         * sourceURL for browser developer tools.
         *
         * The function uses variable parameters and has the following
         * signatures:
         *
         *     function(context, script)
         *     function(url, context, script)
         *     function(url, context, script, debug)
         *
         * @param {string} [url] Optional sourceURL
         * @param {object} context Execution context containing values
         *     available to the script
         * @param {string} script
         * @param {boolean} [debug=false] Return the script without executing it
         * @returns {*} the return value from the script
         * @throws {Error} In case of invalid data types or syntax.
         *
         * see also: https://seanox.github.io/composite-js/manuals/scripting.html#global-api
         *           https://seanox.github.io/composite-js/manuals/expression.html
         */
        eval(...variants) {

            let {url, context, script, debug = false} = Arguments.bind(variants, [
                {context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String], debug: [Boolean]}
            ]);

            script = url ? script + "\n\n//# sourceURL=" + url + "\n" : script;
            return debug ? script : this.run(context, script);
        },

        /**
         * Executes a script in a separate function scope with the selected
         * context values explicitly provided as arguments. The script source is
         * supplied through a fresh internal this object per invocation.
         * The shared global namespace provides the public scripting API.
         *
         * Note: This provides neither a secure sandbox nor proper isolation,
         * and it does not prevent access to global variables.
         *
         * @param {object} context Execution context containing values
         *     available to the script
         * @param {string} script
         * @returns {*} return value of the script, if available
         * @throws {Error} In case of invalid data types or syntax.
         */
        run(context, script) {

            if (typeof context !== "object")
                throw new TypeError("Invalid context: " + typeof context)
            if (typeof script !== "string")
                throw new TypeError("Invalid script: " + typeof script)

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

            _cache.delete(signature);
            _cache.set(signature, execute);

            return execute.call({script}, ...Object.values(context));
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

    /** Cache (signature/execution wrapper) */
    const _cache = new Map();

    if (typeof global === "undefined")
        compliant("global", {});
    if (global === null
            || typeof global !== "object")
        throw new TypeError("Invalid global: " + (global === null ? "null" : typeof global));

    /**
     * Imports a module from the module directory, without the .js extension.
     * @param {string} path Module path
     * @throws {TypeError} If the argument is not a string
     * @throws {Error} In case of an invalid path or resource loading failure
     */
    compliant("global.import");
    compliant(null, global.import = (path) => {
        if (typeof path !== "string")
            throw new TypeError("Invalid import: " + typeof path);
        if (!path.match(PATTERN_IMPORT))
            throw new Error("Invalid import: " + path);
        Composer.load(Composer.MODULES + "/" + path + ".js", true);
    });

    /**
     * Exposes a value at a dot-separated path rooted at window.
     * Parent namespaces use Namespace.use; occupied targets cause errors,
     * except for DOM entries. Namespace and assignment errors propagate.
     * @param {*} value Value to expose
     * @param {string} path Full target path, including the exposed name
     * @throws {Error} In case of an invalid path, namespace or occupied target
     */
    compliant("global.expose");
    compliant(null, global.expose = (value, path) => {

        "use strict";

        if (typeof path !== "string")
            throw new TypeError("Invalid expose path: " + typeof path);
        if (!path.match(PATTERN_NAMESPACE))
            throw new Error("Invalid expose path: " + path);

        const levels = path.split(".");
        const name = levels.pop();
        const context = Namespace.use(window, ...levels);

        const lookup = context[name];
        if (name in context
                && !(lookup instanceof Element)
                && !(lookup instanceof HTMLCollection))
            throw new Error("Context for expose is already in use: " + path);
        context[name] = value;
    });

    /**
     * Creates a namespace if it does not already exist.
     * Uses Namespace.use with window as the explicit root; errors propagate.
     * @param {string} use Dot-separated namespace
     * @throws {TypeError} If the argument is not a string
     * @throws {Error} If the namespace is invalid
     */
    compliant("global.use");
    compliant(null, global.use = (use) => {
        if (typeof use !== "string")
            throw new TypeError("Invalid use: " + typeof use);
        if (!use.match(PATTERN_NAMESPACE))
            throw new Error("Invalid use: " + use);
        Namespace.use(window, use);
    });
})();