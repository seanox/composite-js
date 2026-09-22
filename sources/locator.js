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
 * Locator for addressing resources within composite-js. Based on URL syntax, it
 * identifies logical application resources by schema, absolute path, and
 * optional query, but does not represent a complete URL. It is used to resolve
 * XML, XSLT, and raw resources consistently.
 */
(() => {

    "use strict";

    const SCHEMA_XML = "xml";
    const SCHEMA_XSLT = "xslt";
    const SCHEMA_RAW = "raw";

    const PATTERN_PATH = /^\/[^\u0000-\u001f\/?#]+(?:\/[^\u0000-\u001f\/?#]+)*$/;

    const _decode = value => {
        while (true) {
            const decoded = decodeURIComponent(value);
            if (decoded === value)
                return value;
            value = decoded;
        }
    };

    const _normalize_path = value => {
        const parts = [];
        _decode(value).replace(/^\/+/, "").split("/").forEach(part => {
            if (!part || part === ".")
                return;
            if (part === "..")
                parts.pop();
            else parts.push(part);
        });
        return "/" + parts.join("/");
    };

    compliant("Locator");
    compliant(null, window.Locator = {

        get SCHEMA_XML() {return SCHEMA_XML;},
        get SCHEMA_XSLT() {return SCHEMA_XSLT;},
        get SCHEMA_RAW() {return SCHEMA_RAW;},

        /**
         * Parses and normalizes a supported locator string or URL.
         * The optional target restricts the accepted schema.
         *
         *     Locator.parse(locator);
         *     Locator.parse(target, locator);
         *
         * @param {string|URL} target Target schema or locator
         * @param {string|URL} [value] Locator when a target is specified
         * @returns {{uri:string, schema:string, path:string, query:string|undefined}}
         *     Parsed locator meta-object
         * @throws {Error} In case of invalid locator syntax
         */
        parse(...variants) {

            let {target, locator: value} = Arguments.bind(variants, [
                {locator: [String, URL]},
                {target: [String], locator: [String, URL]}
            ]);
            const hasTarget = target !== undefined;
            if (hasTarget) {
                target = target.trim().toLowerCase();
            }
            let source = value;
            if (value instanceof URL) {
                source = value.href;
                if (!value.search
                        && value.hash)
                    source = source.substring(0, source.length - value.hash.length);
            }

            if (typeof source !== "string"
                    || !source.trim())
                throw new Error(`Invalid locator: ${String(value)}`);

            const match = source.match(/^([a-z][a-z0-9+.-]*):/i);
            if (!match)
                throw new Error(`Invalid locator: ${source}`);
            const schema = match && match[1].toLowerCase();
            if (![SCHEMA_XML, SCHEMA_XSLT, SCHEMA_RAW].includes(schema))
                throw new Error(`Unsupported schema: ${schema || source}`);
            if (hasTarget
                    && schema !== target)
                throw new Error(`Invalid ${target} locator: ${source}`);

            const tail = source.substring(match[0].length);
            if (!tail.startsWith("/"))
                throw new Error(`Invalid locator: ${source}`);
            const separator = schema === SCHEMA_XML
                ? tail.indexOf("?") : tail.search(/[?#]/);
            const resource = separator < 0
                ? tail : tail.substring(0, separator);
            const path = _normalize_path(resource);
            if (path === "/"
                    || !PATTERN_PATH.test(path))
                throw new Error(`Invalid locator: ${source}`);
            const query = separator >= 0
                ? _decode(tail.substring(separator + 1)) : undefined;
            const uri = `${schema}:${path}${schema === SCHEMA_XML && query
                ? `?${query}` : ""}`;

            return Object.freeze({uri, schema, path, query});
        }
    });
})();
