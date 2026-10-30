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
 * Expressions evaluate JavaScript enclosed in {{...}}, including optional
 * variable declarations. Markup extraction, rendering, and operator aliases
 * belong to Composer.
 *
 * see also: https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    "use strict";

    /** Cache of variable names and prepared expression scripts */
    const _cache = new Map();

    const PATTERN_EXPRESSION_DECLARATION =
        /^\s*\{\{\s*((?:_*[a-zA-Z]|_\w*)\w*):\s*(([^}]|(}(?!})))*?)\s*\}\}\s*$/;

    compliant("Expression");
    compliant(null, window.Expression = {

        /**
         * Executes a framed expression and returns [variable, result].
         * The variable name is undefined unless the expression declares one.
         * An optional identifier caches the variable name and prepared script,
         * but not the result or execution context.
         *
         * Execution errors are handled uniformly, whether they occur during
         * script interpretation or are explicitly thrown by the expression.
         * Instead of propagating such errors, the function returns them as
         * values.
         *
         * The function uses variable parameters and has the following
         * signatures:
         *
         *     function(context, expression)
         *     function(identifier, context, expression)
         *
         * @param {string} [identifier] Optional identifier for caching
         * @param {object} context Execution context containing values
         *     available to the expression
         * @param {string} expression JavaScript expression enclosed in {{...}}
         * @returns {Array} Tuple containing the optional variable name and
         *     result, including errors as ordinary result values
         * @throws {Error} In case of invalid data types
         * @throws {SyntaxError} If the outer {{...}} frame is missing
         */
        eval(...variants) {

            const {identifier, context, expression} = Arguments.bind(variants, [
                {context: [Object], expression: [String]},
                {identifier: [String], context: [Object], expression: [String]}
            ]);

            const source = expression.trim();
            if (!source.startsWith("{{")
                    || !source.endsWith("}}"))
                throw new SyntaxError("Invalid expression: " + expression);

            let [variable, script] = (identifier ? _cache.get(identifier) : null) || [];
            if (script === undefined) {
                const declaration = source.match(PATTERN_EXPRESSION_DECLARATION);
                variable = declaration ? declaration[1] : undefined;
                script = (declaration ? declaration[2] : source.substring(2, source.length -2)).trim();
            }
            if (identifier) {
                _cache.delete(identifier);
                _cache.set(identifier, [variable, script]);
            }

            try {return [variable, Scripting.run(context, script)];
            } catch (error) {
                if (!(error instanceof Error))
                    error = new Error(error);
                error.message = (String(error.message).trim() + " in " + script).trim();
                console.error(String(error));
                return [variable, error];
            }
        },

        /**
         * Removes cached expression scripts until the cache size is <= size.
         * @param {number} size Maximum number of cached scripts.
         */
        prune(size) {
            size = Math.max(0, size);
            while (_cache.size > size)
                _cache.delete(_cache.keys().next().value);
        }
    });
})();