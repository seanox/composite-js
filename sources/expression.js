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
 * The Expression Language (EL) provides access to the client-side JavaScript
 * API, enhanced with additional keywords for arithmetic and logical operators.
 *
 * see also: https://seanox.github.io/composite-js/manuals/expression.html
 */
(() => {

    "use strict";

    compliant("Expression");
    compliant(null, window.Expression = {

        /**
         * Interprets the passed expression. In case of an error, the error is
         * returned and no error is thrown. A serial can be specified
         * optionally. The serial is an alias for caching compiled expressions.
         * Without, the expressions are always compiled. The function uses
         * variable parameters and has the following signatures:
         *
         *     function(expression)
         *     function(serial, expression)
         *
         * @param {string} [serial] Optional serial for caching expressions
         * @param {string} expression Expression to be interpreted.
         * @returns {*} The return value of the interpreted expression, or an
         *     error if an error has occurred
         * @throws {Error} In case of invalid data types or syntax.
         */
        eval(...variants) {

            let expression;
            if (variants.length > 1)
                expression = String(variants[1]);
            else if (variants.length > 0)
                expression = String(variants[0]);

            let serial;
            if (variants.length > 1
                    && variants[0])
                serial = String(variants[0]);

            let script = serial ? _cache.get(serial) : null;
            if (!script)
                script = _parse(TYPE_MIXED, expression);
            if (serial)
                _cache.set(serial, script);

            try {return Scripting.run(script);
            } catch (error) {
                console.error(error.message + "\n\t" + script);
                return new Error(error.message + " in " + script);
            }
        }
    });

    /** Cache (expression/script) */
    const _cache = new Map();

    const TYPE_MIXED   = 0;
    const TYPE_LITERAL = 1;
    const TYPE_TEXT    = 2;
    const TYPE_SCRIPT  = 3;

    const KEYWORDS = ["and", "&&", "or", "||", "not", "!",
        "eq", "==", "eeq", "===", "ne", "!=", "nee", "!==", "lt", "<", "gt", ">", "le", "<=", "ge", ">=", "empty", "!",
        "div", "/", "mod", "%"];

    const PATTERN_KEYWORDS = new RegExp("(^|[^\\w\\.])("
            + KEYWORDS.filter((keyword, index) => index % 2 === 0).join("|")
            + ")(?=[^\\w\\.]|$)", "ig");

    const _fill = (expression, patches) =>
        expression.replace(/[\t\r](\d+)\n/g, (match, id) => patches[id]);

    /**
     * Analyzes expression parts and creates JavaScript from them.
     * Created scripts can be cached and reused.
     * @param {number} type Parser mode (TYPE_*)
     * @param {string} expression Expression to analyze
     * @param {Array} [patches=[]] Patches to apply
     * @returns {string} The created JavaScript
     * @throws {Error} In case of an error in the expression structure
     */
    const _parse = (type, expression, patches = []) => {

        switch (type) {

            case TYPE_MIXED:

                // replace all line breaks and merge them with a space, so the
                // characters CR\r and LF\n can be used as internal markers
                expression = expression.replace(/[\r\n]/g, " ").trim();

                let structure = expression;

                // find all places that contain scripts
                structure = structure.replace(/\{\{(.*?)\}\}/g,
                    (match, script) => _parse(TYPE_SCRIPT, script, patches));

                // find all places outside the detected script replacements at
                // the beginning ^...\r and between \n...\r and at the end \n...$
                structure = structure.replace(/((?:[^\n]+$)|(?:[^\n]+(?=\r)))/g,
                    (match, text) => _parse(TYPE_TEXT, text, patches));

                // if everything is replaced, the expression must have the
                // following structure, deviations are syntax errors
                if (!structure.match(/^(\r(\d+)\n)*$/))
                    throw Error("Error in the expression structure\n\t" + expression);

                const mixed = !expression.startsWith("{{")
                        || !expression.endsWith("}}")
                        || expression.substring(2).includes("{{")
                        || expression.substring(0, expression.length -2).includes("}}");

                // placeholders must be filled, since they were created
                // recursively, they do not have to be filled recursively
                structure = structure.replace(/(?:\r(\d+)\n)/g,
                    (match, placeholder) => mixed
                        ? "\r(" + patches[placeholder] + ")\n"
                        : "\r" + patches[placeholder] + "\n");

                // masked quotation marks will be restored.
                structure = structure.replace(/\r\\u0022\n/g, '\\"');
                structure = structure.replace(/\r\\u0027\n/g, "\\'");
                structure = structure.replace(/\r\\u0060\n/g, "\\`");

                // splices still need to be made scriptable
                structure = structure.replace(/(\n\r)+/g, " + ");
                structure = structure.replace(/(^\r)|(\n$)/g, "");

                // CR/LF of markers must be removed so that the end of line is not
                // interpreted as separation of commands or logic: a\nb == a;b
                structure = structure.replace(/[\r\n]+/g, " ");

                return structure

            case TYPE_TEXT:

                expression = "\"" + expression + "\"";

            case TYPE_LITERAL:

                patches.push(expression);
                return "\r" + (patches.length -1) + "\n";

            case TYPE_SCRIPT:

                expression = expression.trim();
                if (!expression)
                    return "";

                // Mask escaped quotes (single and double) so that they are not
                // mistakenly found by the parser as delimiting string/phrase.
                // rule: search for an odd number of slashes followed by quotes
                expression = expression.replace(/(^|[^\\])((?:\\{2})*)(\\\")/g, "$1$2\r\\u0022\n");
                expression = expression.replace(/(^|[^\\])((?:\\{2})*)(\\\')/g, "$1$2\r\\u0027\n");
                expression = expression.replace(/(^|[^\\])((?:\\{2})*)(\\\`)/g, "$1$2\r\\u0060\n");

                // Replace all literals "..." / '...' / `...` with placeholders.
                // This simplifies analysis because text can contain anything
                // and the parser would have to constantly distinguish between
                // logic and text. If the literals are replaced by numeric
                // placeholders, only logic remains. Important is a flexible
                // processing, because the order of ', " and ` is not defined.
                expression = expression.replace(/((['\"\`])[.\s\S]*?\2)/g,
                    (match, literal) => _parse(TYPE_LITERAL, literal, patches));

                // without literals, tabs have no relevance and can be replaced
                // by spaces, and we have and additional internal marker
                expression = expression.replace(/\t+/g, " ");

                // mapping of keywords to operators
                // IMPORTANT: KEYWORDS ARE CASE-INSENSITIVE
                //     and  &&        empty  !         div  /
                //     eq   ==        eeq    ===       ge   >=
                //     gt   >         le     <=        lt   <
                //     mod  %         ne     !=        nee  !==
                //     not  !         or     ||
                expression = expression.replace(PATTERN_KEYWORDS, (match, group1, group2) =>
                    group1 + KEYWORDS[KEYWORDS.indexOf(group2.toLowerCase()) +1]
                );

                // Keywords must be replaced by placeholders so that they are
                // not interpreted as variables. Keywords are case-insensitive.
                expression = expression.replace(/(^|[^\w\.])(true|false|null|undefined|new|instanceof|typeof)(?=[^\w\.]|$)/ig,
                    (match, group1 = "", group2 = "") =>
                        group1 + group2.toLowerCase());

                // element expressions are translated into JavaScript
                //
                //     #element -> document.getElementById(element)
                //     #[element] -> document.getElementById(element)
                //     #[element//expression//] -> document.getElementById(element + expression)
                //
                // The version with square brackets is for more complex element
                // IDs that do not follow the JavaScript syntax for variables.
                //
                // The order is important because the complex element ID, if the
                // target uses unique identifiers, may contain a # that should
                // not be misinterpreted.
                expression = expression.replace(/#\[([^\[\]]*)\]/g,
                    (match, element) => {
                        element = element.replace(/\/{2}([.\s\S]*?)\/{2}/g, "\"+($1)+\"");
                        patches.push(_fill("document.getElementById(\"" + element + "\")", patches));
                        return "\r" + (patches.length -1) + "\n";
                });
                expression = expression.replace(/#([_a-z]\w*)/ig,
                    (match, element) => {
                        patches.push(_fill("document.getElementById(\"" + element + "\")", patches));
                        return "\r" + (patches.length -1) + "\n";
                });

                // (?...) tolerates the enclosed code. If an error occurs there,
                // the expression will be false, but will not cause the error
                // itself. This is convenient if you want check/use references
                // or variables that do not yet exist or errors of methods are
                // to be suppressed.

                // To avoid complicated parsing of round brackets, bracket
                // expressions that have no other round bracket expressions are
                // iteratively replaced by placeholders \t...\n. At the end
                // there should be no more brackets.

                if (expression.match(/\(\s*\?/)) {
                    for (let counts = -1; counts < patches.length;) {
                        counts = patches.length;
                        expression = expression.replace(/(\([^\(\)]*\))/g, match => {
                            match = match.replace(/^\( *\?+ *([.\s\S]*?) *\)$/, (match, logic) =>
                                "_tolerate(()=>(" + logic + "))");
                            patches.push(_fill(match, patches));
                            return "\t" + (patches.length -1) + "\n";
                        });
                    }
                }

                // small optimization by merging spaces
                expression = expression.replace(/ {2,}/g, " ");

                patches.push(_fill(expression, patches));
                return "\r" + (patches.length -1) + "\n";

            default:
                throw new Error("Unexpected script type");
        }
    };
})();