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
 * was important to isolate the execution of the scripts so that internal
 * methods and constants cannot be accessed unintentionally.
 *
 * see also: https://seanox.github.io/composite-js/manuals/scripting.html
 *           https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    compliant("Scripting");
    compliant(null, window.Scripting = {

        /**
         * Executes a composite script. As a special feature, composite script
         * supports macros.
         *
         * Macros are based on a keyword starting with a hash symbol followed by
         * arguments separated by spaces. Macros end with the next line break, a
         * semicolon or with the end of the file.
         *
         * #import    loads modules as composite script resources from the
         *            module directory
         * #export    makes variables, constants and functions of the isolated
         *            module scope usable in the global scope, optionally in a
         *            namespace declared with an @ symbol
         * #use       creates the passed namespaces if they do not already exist
         * (?...)     tolerant expression, a macro with a different syntax, the
         *            enclosed logic is executed fault-tolerantly and
         *            corresponds to the value false in case of an error, except
         *            for syntax errors
         *
         * @param {string} script
         * @param {string} [url] Optional sourceURL
         * @returns {*} the return value from the script
         *
         * see also: https://seanox.github.io/composite-js/manuals/scripting.html#macros
         *           https://seanox.github.io/composite-js/manuals/expression.html
         */
        eval(...variants) {

            let [url, script] = variants.length > 1
                    ? variants : [undefined, variants[0]];

            if (typeof script !== "string"
                    || (url && typeof url !== "string"))
                throw new TypeError("Invalid data type");

            // Performance is important here.
            // The implementation parses and replaces macros in one pass.

            // It was important to exclude literals and comments.
            // - ignore: /*...*/
            // - ignore: //...([\r\n]|$)
            // - ignore: '...'
            // - ignore: "..."
            // - ignore: `...`
            // - detect: (^|\W)#(import|export|use)\s+...(\W|$)
            // - detect: \(\s*\?...\)

            let pattern;
            let brackets;
            for (let cursor = 0; cursor < script.length; cursor++) {
                let digit = script.charAt(cursor);
                if (cursor >= script.length
                        && !pattern)
                    continue;

                // The macro for the tolerant logic is a bit more complicated,
                // because round brackets have to be counted here. Therefore the
                // parsing runs parallel to the other macros. In addition, the
                // syntax is undefined by optional whitepsaces between ( and ?).

                if (brackets < 0) {
                    if (digit === "?") {
                        brackets = 1;
                        let macro = "_tolerate(()=>";
                        script = script.substring(0, cursor) + macro + script.substring(cursor +1);
                        cursor += macro.length;
                        continue;
                    }
                    if (!digit.match(/\s/))
                        brackets = 0;
                }

                if (digit === "\\") {
                    cursor++
                    continue;
                }

                if (pattern) {
                    if (pattern === script.substring(cursor, cursor + pattern.length)
                            || (pattern === "\n" && digit === "\r"))
                        pattern = null;
                    continue;
                }

                switch (digit) {
                    case "/":
                        digit = script.charAt(cursor +1);
                        if (digit === "/")
                            pattern = "\n";
                        if (digit === "*")
                            pattern = "*/";
                        continue;

                    case "(":
                        if (brackets > 0)
                            brackets++;
                        else brackets = -1;
                        continue;

                    case ")":
                        if (brackets <= 0)
                            continue;
                        if (--brackets > 0)
                            continue;
                        let macro = ")";
                        script = script.substring(0, cursor) + macro + script.substring(cursor);
                        cursor += macro.length;
                        continue;

                    case "\'":
                    case "\"":
                    case "\`":
                        pattern = digit;
                        continue;

                    case "#":
                        let string = script.substring(cursor -1, cursor +10);
                        let match = string.match(/(^|\W)(#(?:import|export|use))\s/);
                        if (match) {
                            let macro = match[2];
                            for (let offset = cursor +macro.length; offset <= script.length; offset++) {
                                string = script.charAt(offset);
                                if (!string.match(/[;\r\n]/)
                                        && offset < script.length)
                                    continue;

                                let parameters = script.substring(cursor +macro.length, offset).trim();

                                switch (macro) {
                                    case "#import":
                                        if (!parameters.match(/^(\w+(\/\w+)*)(\s+(\w+(\/\w+)*))*$/))
                                            throw new Error(("Invalid macro: #import " + parameters).trim());
                                        const imports = parameters.split(/\s+/).map(entry => "\"" + entry + "\"");
                                        macro = "_import(...[" + imports.join(",") + "])";
                                        break;

                                    case "#export":
                                        const exports = [];
                                        const pattern = /^([_a-z]\w*)(?:@((?:[_a-z]\w*)(?:\.[_a-z]\w*)*))?$/i;
                                        parameters.split(/\s+/).forEach(entry => {
                                            const match = entry.match(pattern);
                                            if (!match)
                                                throw new Error(("Invalid macro: #export " + parameters).trim());
                                            parameters = [match[1], "\"" + match[1] + "\""];
                                            if (match[2])
                                                parameters.push("\"" + match[2] + "\"");
                                            exports.push("[" + parameters.join(",") + "]");
                                        });
                                        macro = "_export(...[" + exports.join(",") + "])";
                                        break;

                                    case "#use":
                                        if (!parameters.match(/^([_a-z]\w*)(\.[_a-z]\w*)*(\s+([_a-z]\w*)(\.[_a-z]\w*)*)*$/i))
                                            throw new Error(("Invalid macro: #use " + parameters).trim());
                                        const uses = parameters.split(/\s+/).map(entry => "\"" + entry + "\"");
                                        macro = "_use(...[" + uses.join(",") + "])";
                                        break;
                                }

                                script = script.substring(0, cursor -1) + (match[1] || "")
                                    + macro + script.substring(offset);
                                cursor += macro.length;
                                break;
                            }
                        }
                        continue;

                    default:
                        continue;
                }
            }

            return this.run(url ? script + "\n\n//# sourceURL=" + url + "\n" : script);
        },

        /**
         * Executes a script in a separate function scope with the selected
         * context values and helper functions explicitly provided as arguments.
         *
         * Note: This provides neither a secure sandbox nor proper isolation,
         * and it does not prevent access to global variables.
         *
         * @param {string} script
         * @returns {*} return value of the script, if available
         */
        run(script) {
            if (typeof script !== "string")
                throw new TypeError("Invalid data type");
            if (!script.trim())
                return;
            return Function(
                ...Object.keys(Composer.render.context),
                "_import", "_export", "_use", "_tolerate",
                '"use strict"; return eval(arguments[arguments.length - 1]);'
            )(
                ...Object.values(Composer.render.context),
                _import, _export, _use, _tolerate,
                script
            );
        }
    });

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

    const _tolerate = (invocation) => {
        try {return invocation.call(window);
        } catch (error) {
            return false;
        }
    };
})();