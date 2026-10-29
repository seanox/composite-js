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
 * are based on ECMAScript/JavaScript enriched with macros. In addition,
 * composite script can be loaded at runtime and can itself load other composite
 * scripts. Because in the end everything is based on a simple eval command, it
 * was important to execute the scripts in a separate function scope so that
 * internal methods and constants cannot be accessed unintentionally.
 *
 * see also: https://seanox.github.io/composite-js/manuals/scripting.html
 *           https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    const PATTERN_EVAL_MACRO_MATCH = /^[^\S\r\n]*#(import|export|use)(?!\w)([^\r\n]*)(?=\r?$)/gm;
    const PATTERN_EVAL_MACRO_IMPORT = /^(\w+(\/\w+)*)(\s+(\w+(\/\w+)*))*$/;
    const PATTERN_EVAL_MACRO_EXPORT = /^([_a-z]\w*)(?:@((?:[_a-z]\w*)(?:\.[_a-z]\w*)*))?$/i;
    const PATTERN_EVAL_MACRO_USE = /^([_a-z]\w*)(\.[_a-z]\w*)*(\s+([_a-z]\w*)(\.[_a-z]\w*)*)*$/i;

    compliant("Scripting");
    compliant(null, window.Scripting = {

        /**
         * Executes a composite script. As a special feature, composite script
         * supports macros.
         *
         * Macros begin at the start of a line -- optionally after a space --
         * and end at the next line break or at the end of the file. They are
         * replaced regardless of the surrounding JavaScript context.
         *
         * #import    loads modules as composite script resources from the
         *            module directory
         * #export    makes variables, constants and functions of the separate
         *            function scope usable in the global scope, optionally in a
         *            namespace declared with an @ symbol
         * #use       creates the passed namespaces if they do not already exist
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
         * @param {boolean} [debug=false] Optional debug
         * @returns {*} the return value from the script
         * @throws {Error} In case of invalid data types or syntax.
         *
         * see also: https://seanox.github.io/composite-js/manuals/scripting.html#macros
         *           https://seanox.github.io/composite-js/manuals/expression.html
         */
        eval(...variants) {

            let {url, context, script, debug = false} = Arguments.bind(variants, [
                {context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String], debug: [Boolean]}
            ]);

            script = script.replace(PATTERN_EVAL_MACRO_MATCH,
                (line, name, parameters) => {
                    const index = parameters.indexOf("//");
                    const comment = index < 0 ? "" : parameters.substring(index).trim();
                    parameters = parameters.substring(0,
                        index < 0 ? parameters.length : index).trim();
                    if (parameters.includes("/*"))
                        throw new SyntaxError("Unexpected Token: " + line.trim());

                    let macro;
                    switch (name) {
                        case "import":
                            if (!parameters.match(PATTERN_EVAL_MACRO_IMPORT))
                                throw new Error(("Invalid macro: #import " + parameters).trim());
                            const imports = parameters.split(/\s+/).map(
                                entry => "\"" + entry + "\"");
                            macro = "this.import(...[" + imports.join(",") + "])";
                            break;

                        case "export":
                            const exports = [];
                            parameters.split(/\s+/).forEach(entry => {
                                const match = entry.match(PATTERN_EVAL_MACRO_EXPORT);
                                if (!match)
                                    throw new Error(("Invalid macro: #export " + parameters).trim());
                                parameters = [match[1], "\"" + match[1] + "\""];
                                if (match[2])
                                    parameters.push("\"" + match[2] + "\"");
                                exports.push("[" + parameters.join(",") + "]");
                            });
                            macro = "this.export(...[" + exports.join(",") + "])";
                            break;

                        case "use":
                            if (!parameters.match(PATTERN_EVAL_MACRO_USE))
                                throw new Error(("Invalid macro: #use " + parameters).trim());
                            const uses = parameters.split(/\s+/).map(
                                entry => "\"" + entry + "\"");
                            macro = "this.use(...[" + uses.join(",") + "])";
                            break;
                    }
                    return macro + ";" + (comment ? " " + comment : "");
                });

             script = url ? script + "\n\n//# sourceURL=" + url + "\n" : script;
             return debug ? script : this.run(context, script);
        },

        /**
         * Executes a script in a separate function scope with the selected
         * context values explicitly provided as arguments. Internal helpers and
         * the script are supplied through a fresh this object per invocation;
         * its properties are implementation details, not a public API.
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

            return execute.call(
                {import: _import, export: _export, use: _use, script},
                ...Object.values(context)
            );
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

    const _import = (...imports) => {
        // Because it is an internal method, an additional validation of the
        // imports as data structure was omitted.
        imports.forEach(include =>
            Composer.load(Composer.MODULES + "/" + include + ".js", true));
    };

    const _export = (...exports) => {
        // Because it is an internal method, an additional validation of the
        // exports as data structure was omitted.
        exports.forEach(parameters => {
            let context = window;
            (parameters[2] ? parameters[2].split(/\./) : []).forEach(parameter => {
                if (typeof context[parameter] === "undefined")
                    context[parameter] = {};
                context = context[parameter]
            });

            const lookup = context[parameters[1]];
            if (typeof lookup !== "undefined"
                    && !(lookup instanceof Element)
                    && !(lookup instanceof HTMLCollection))
                throw new Error("Context for export is already in use: "
                    + parameters[1] + (parameters[2] ? "@" + parameters[2] : ""));
            context[parameters[1]] = parameters[0];
        });
    }

    const _use = (...uses) => {
        uses.forEach(use => Namespace.use(use));
    }
})();