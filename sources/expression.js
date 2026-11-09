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
 *     USAGE
 *     ----
 * Direct evaluation for custom extensions:
 *
 *     Expression.eval({value: 7}, "{{value}}");
 *     // {variable: undefined, result: 7}
 *     Expression.eval({value: 7}, "{{name: value}}");
 *     // {variable: "name", result: 7}
 *
 * Composer handles markup extraction, interpolation, markup extensions for
 * expressions, and view scope bindings; direct calls perform none of these
 * steps.
 *
 * The outer {{...}} frame is required; surrounding whitespace is allowed.
 * Direct value expressions allow internal delimiter sequences. An internal
 * }} prevents declaration recognition, leaving variable undefined. To retain
 * declaration recognition, escape closing delimiter characters in strings
 * or separate adjacent structural closing braces with whitespace. Preserve
 * string escapes with String.raw or doubled backslashes when constructing
 * the expression string in JavaScript.
 *
 * See eval's JSDoc for signatures, return values, caching, and error behavior.
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
         * Executes a framed expression and returns {variable, result}.
         * The variable name is undefined unless the expression declares one.
         * An optional identifier caches the variable name and prepared script,
         * but not the result or execution context.
         * Reusing an identifier retains the original script while it is cached;
         * use a different identifier when the source changes.
         *
         * Execution errors are handled uniformly, whether they occur during
         * script interpretation or are explicitly thrown by the expression.
         * Instead of propagating them, the function logs and returns the
         * original thrown values.
         * There is no separate error status: result alone cannot distinguish
         * a thrown value from the same normally returned value.
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
         * @returns {{variable: (string|undefined), result: *}}
         *     New object with both properties present. The variable name may
         *     be undefined; result retains the original value unchanged,
         *     including errors as ordinary result values
         * @throws {Error} In case of invalid data types
         * @throws {SyntaxError} If the outer {{...}} frame is missing
         */
        eval(...variants) {

            // To reduce the number of executed instructions, the common
            // argument-binding cases are handled directly.
            let identifier, context, expression;
            if (variants[0] !== null
                    && typeof variants[0] === "object"
                    && typeof variants[1] === "string")
                [context, expression] = variants;
            else if (typeof variants[0] === "string"
                    && variants[1] !== null
                    && typeof variants[1] === "object"
                    && typeof variants[2] === "string")
                [identifier, context, expression] = variants;
            else Arguments.bind(variants, [
                {context: [Object], script: [String]},
                {url: [String], context: [Object], script: [String]}
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

            try {return {variable, result: Scripting.eval(context, script)};
            } catch (error) {
                console.error(error, ("Error in expression: " + script).trim());
                return {variable, result: error};
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