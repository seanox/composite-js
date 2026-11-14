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
 * Expressions evaluate prepared JavaScript and return its value together with
 * an optional variable name. Parsing, markup extraction, rendering, and
 * operator aliases belong to Composer.
 *
 *     USAGE
 *     ----
 * Direct evaluation for custom extensions:
 *
 *     Expression.eval({value: 7}, "value");
 *     // {variable: undefined, result: 7}
 *     Expression.eval({value: 7}, "variable", "value");
 *     // {variable: "variable", result: 7}
 *
 * The script is JavaScript without an outer {{...}} frame. Direct calls do not
 * interpret markup delimiters, declarations, or operator aliases, and do not
 * bind the returned variable. Prepared scripts can be reused with different
 * execution contexts; neither contexts nor evaluation results are retained.
 *
 * See eval's JSDoc for the signatures, return values, and error behavior.
 *
 * see also: https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    "use strict";

    compliant("Expression");
    compliant(null, window.Expression = {

        /**
         * Executes a prepared expression and returns {variable, result}.
         * The optional variable name is passed through without binding it.
         * Scripts, execution contexts, and results are not cached here.
         *
         * Execution errors are handled uniformly, whether they occur during
         * script interpretation or are explicitly thrown by the expression.
         * Instead of propagating them, the function logs and returns the
         * original thrown values.
         * There is no separate error status: result alone cannot distinguish
         * a thrown value from the same normally returned value.
         *
         * The signatures are distinguished by argument count:
         *
         *     function(context, script)
         *     function(context, variable, script)
         *
         * The three-argument signature also accepts an undefined variable.
         *
         * @param {object} context Execution context containing values
         *     available to the expression
         * @param {string} [variable] Optional variable name returned unchanged
         * @param {string} script Prepared JavaScript without markup delimiters
         * @returns {{variable: (string|undefined), result: *}}
         *     New object with both properties present. The variable name may
         *     be undefined; result retains the original value unchanged,
         *     including errors as ordinary result values
         * @throws {TypeError} In case of invalid argument count or data types
         */
        eval(...variants) {

            if (variants.length < 2)
                if (variants.length < 1)
                    throw new TypeError("Invalid context: undefined");
                else throw new TypeError("Invalid script: undefined");
            const [context, variable, script] = variants.length === 2
                ? [variants[0], undefined, variants[1]]
                : variants;

            if (context === null
                    || typeof context !== "object")
                throw new TypeError("Invalid context: " + typeof context);
            if (typeof script !== "string")
                throw new TypeError("Invalid script: " + typeof script);
            if (variable !== undefined
                    && typeof variable !== "string")
                throw new TypeError("Invalid variable: " + typeof variable);

            try {return {variable, result: Scripting.eval(context, script)};
            } catch (error) {
                console.error(error, ("Error in expression: " + script).trim());
                return {variable, result: error};
            }
        }
    });
})();