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
 * General extension of the JavaScript API.
 *
 * see also: https://seanox.github.io/composite-js/manuals/extension.html
 */
(() => {

    "use strict";

    /**
     * Compliant takes over the task that the existing JavaScript API can be
     * manipulated in a controlled way. Controlled means that errors occur when
     * trying to overwrite existing objects and functions. Originally, the
     * mechanism was removed after loading the page, but the feature has proven
     * to be convenient for the other components of composite-js and therefore
     * remains.
     *
     * In the code, the method is used in an unconventional form.
     *
     *     compliant("Composer");
     *     compliant(null, window.Composer = {...});
     *     compliant("Object.prototype.serial");
     *     compliant(null, Object.defineProperty(Object.prototype, "serial", {...});
     *
     * This is only for the IDE so that syntax completion has a chance there.
     * This syntax will be simplified and corrected in the build process for the
     * releases.
     *
     * @param {string|null} context Context of object or function to manipulate
     *     If null, only the payload is returned.
     * @param {*} payload Payload to assign to the context
     * @returns {*} Assigned payload
     * @throws {Error} If the compliant function or context is already exists
     */
    if (window.compliant !== undefined)
        throw new Error("JavaScript incompatibility detected for: compliant");
    window.compliant = (context, payload) => {
        if (context === null
                || context === undefined)
            return payload;
        if (new Function(`return typeof ${context}`)() !== "undefined")
            throw new Error("JavaScript incompatibility detected for: " + context);
        if (context.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/))
            context = `window["${context}"]`;
        return eval(`${context} = payload`);
    };

    /**
     * Property to get the version of Seanox composite-js.
     * @returns {string} The version of Seanox composite-js
     */
    Object.defineProperty(compliant, "version", {
        value: "0.0.0", writable: false, configurable: false, enumerable: true
    });

    /**
     * Enhancement of the JavaScript API
     * Static function to create a time based alphanumeric serial identifier
     * that is chronologically sortable as text and contains the time and a
     * counter if serial are created at the same time.
     * @returns {string} The generated time-based serial identifier
     */
    compliant("Math.serial");
    compliant(null, Math.serial = () => _serial.toString());
    const _offset = -946684800000;
    const _serial = {
        timing: Date.now() + _offset,
        number: 0,
        toString() {
            const timing = Date.now() + _offset;
            this.number = this.timing === timing ? this.number +1 : 0;
            this.timing = timing;
            const serial = this.timing.toString(36);
            const number = this.number.toString(36);
            return (serial.length.toString(36) + serial
                + number.length.toString(36) + number).toUpperCase();
        }};

    /**
     * Enhancement of the JavaScript API
     * Add a time based alphanumeric serial identifier for the window instance
     * that is chronologically sortable as text and contains the time and a
     * counter if serial are created at the same time.
     *
     * Window.serial must be defined before Object.prototype.serial because the
     * own property on window takes precedence during property lookup.
     *
     * @returns {string} The generated time-based serial identifier
     */
    compliant("window.serial");
    Object.defineProperty(window, "serial", {
        value: (() => {
            const serial = Math.serial();
            return () => serial;
        })()
    });

    /**
     * Automatically binds arguments to the first matching named signature
     * pattern, using the signature's argument names and types to determine the
     * mapping. Signatures are matched in order, first by argument count and
     * then by argument types. Values beyond the signature length are ignored.
     * @param {Array} values Values to bind
     * @param {Array<Object>} signatures Ordered signatures with allowed types
     * @returns {Object} Frozen values assigned to the signature names
     * @throws {TypeError} In case of invalid definitions, no signature with
     * the effective count, or a positional type mismatch
     */
    compliant("Arguments");
    compliant(null, window.Arguments = {
        bind(values, signatures) {

            if (!Array.isArray(values))
                throw new TypeError(`Invalid values: ${typeof values}`);
            if (!Array.isArray(signatures))
                throw new TypeError(`Invalid signatures: ${typeof signatures}`);

            const signatureNames = signatures.map(signature => {
                if (signature === null
                        || typeof signature !== "object")
                    throw new TypeError(`Invalid signature: ${typeof signature}`);
                const names = Object.keys(signature);
                names.forEach(name => {
                    const types = signature[name];
                    if (!Array.isArray(types))
                        throw new TypeError("Invalid argument types");
                    types.forEach(type => {
                        if (typeof type !== "function")
                            throw new TypeError("Invalid argument type");
                    });
                });
                return names;
            });

            const maximum = signatureNames.reduce((length, names) =>
                Math.max(length, names.length), 0);
            const length = Math.min(values.length, maximum);
            let candidates = signatureNames.map((names, index) =>
                ({names, signature: signatures[index]}))
                .filter(candidate => candidate.names.length === length);

            if (candidates.length === 0) {
                const name = signatureNames[0] && signatureNames[0][0];
                if (name === undefined)
                    throw new TypeError("Invalid arguments");
                const value = values[0];
                const type = value === null ? "null"
                    : value instanceof Element ? "Element"
                    : typeof value === "object"
                            && typeof value.constructor === "function"
                            && value.constructor.name
                        ? value.constructor.name : typeof value;
                throw new TypeError(`Invalid ${name}: ${type}`);
            }

            for (let index = 0; index < length; index++) {
                const name = candidates[0].names[index];
                const value = values[index];
                candidates = candidates.filter(candidate =>
                    candidate.signature[candidate.names[index]]
                        .some(type => {
                            if (type === String)
                                return typeof value === "string";
                            if (type === Number)
                                return typeof value === "number";
                            if (type === Boolean)
                                return typeof value === "boolean";
                            if (type === Function)
                                return typeof value === "function";
                            if (type === Object)
                                return value !== null && typeof value === "object";
                            return value instanceof type;
                        }));
                if (candidates.length === 0) {
                    const type = value === null ? "null"
                        : value instanceof Element ? "Element"
                        : typeof value === "object"
                                && typeof value.constructor === "function"
                                && value.constructor.name
                            ? value.constructor.name : typeof value;
                    throw new TypeError(`Invalid ${name}: ${type}`);
                }
            }

            const result = {};
            candidates[0].names.forEach((name, index) =>
                result[name] = values[index]);
            return Object.freeze(result);
        }
    });

    const PATTERN_OBJECT_PATH_TOKEN = /\0[1-9]\d*\0/;
    const PATTERN_OBJECT_PATH_TOKEN_RESTORE = /\0([1-9]\d*)\0/g;
    const PATTERN_OBJECT_PATH_NULL = /\0/g;
    const PATTERN_OBJECT_PATH_NULL_RESTORE = /\0[0]\0/g;
    const PATTERN_OBJECT_PATH_LITERAL = new RegExp([
        /"(?:\\[\s\S]|[^"\\])*"/,
        /'(?:\\[\s\S]|[^'\\])*'/,
        /`(?:\\[\s\S]|[^`\\])*`/
    ].map(pattern => pattern.source).join("|"), "g");
    const PATTERN_OBJECT_PATH_BRACKET_WHITESPACE = /\[\s+|\s+\]/g;
    const PATTERN_OBJECT_PATH_BRACKET_OPEN = /\[/g;
    const PATTERN_OBJECT_PATH_IDENTIFIER = /[A-Za-z_$][A-Za-z0-9_$]*/;
    const PATTERN_OBJECT_PATH_INDEX = /\d+/;
    const PATTERN_OBJECT_LITERAL = /^["'`]/;
    const PATTERN_OBJECT_INDEX_ZEROS = /^0+(?=\d)/;
    const PATTERN_OBJECT_IDENTIFIER = new RegExp(`^${PATTERN_OBJECT_PATH_IDENTIFIER.source}$`);
    const PATTERN_OBJECT_ARRAY_INDEX = /^\[\d+\]$/;

    // Validation / Identifier-oriented grammar - Basic Rules:
    // - Identifiers are the default: object.property
    // - Numeric indices are an exception: object[123]
    // - Literals allow any property name: object["123abc"]
    // - Brackets allow alternative addressing: object[property]
    // - Invalid identifiers must be written as literals: object["\u00F6"]
    const PATTERN_OBJECT_PATH_PART = new RegExp("(?:" + [
        PATTERN_OBJECT_PATH_IDENTIFIER,
        PATTERN_OBJECT_PATH_TOKEN
    ].map(pattern => pattern.source).join("|") + ")");
    const PATTERN_OBJECT_PATH_BRACKET = new RegExp("\\[(?:" + [
        PATTERN_OBJECT_PATH_IDENTIFIER,
        PATTERN_OBJECT_PATH_INDEX,
        PATTERN_OBJECT_PATH_TOKEN
    ].map(pattern => pattern.source).join("|") + ")\\]");
    const PATTERN_OBJECT_PATH = new RegExp("^(?:" + [
        PATTERN_OBJECT_PATH_PART,
        PATTERN_OBJECT_PATH_BRACKET
    ].map(pattern => pattern.source).join("|") + ")(?:" + [
        `\\.${PATTERN_OBJECT_PATH_PART.source}`,
        PATTERN_OBJECT_PATH_BRACKET.source
    ].join("|") + ")*$");

    /**
     * Splits an identifier-oriented path into property and array-access
     * parts: a[1] becomes ["a", "[1]"]. Brackets and literal delimiters are
     * preserved for later distinction of numeric indices and associative keys.
     * Literal contents are decoded once, after validation and splitting.
     * @param {string} path Object path to split
     * @returns {Array<string>} Ordered property and array-access parts
     */
    const _object_path_split = (path) => {

        if (typeof path !== "string")
            throw new TypeError(`Invalid object path: ${typeof path}`);

        const tokens = ["\0"];
        const mask = text => `\0${tokens.push(text) - 1}\0`;
        const restore = text => text.replace(PATTERN_OBJECT_PATH_TOKEN_RESTORE,
            (match, index) => {
                const literal = tokens[index];
                const content = literal.slice(1, -1)
                    .replace(PATTERN_OBJECT_PATH_NULL_RESTORE, "\0").unescape();
                return literal.charAt(0) + content + literal.charAt(0);
            });
        const value = path
            .replace(PATTERN_OBJECT_PATH_NULL, "\0" + "0" + "\0")
            .replace(PATTERN_OBJECT_PATH_LITERAL,
                literal => mask(literal))
            .replace(PATTERN_OBJECT_PATH_BRACKET_WHITESPACE,
                match => match.trim());

        if (!PATTERN_OBJECT_PATH.test(value))
            throw new SyntaxError(`Invalid object path: ${path}`);

        return value
            .replace(PATTERN_OBJECT_PATH_BRACKET_OPEN, ".[")
            .split(".")
            .filter(Boolean)
            .map(restore);
    };

    const _object_node_assert = (value, levels) => {
        const type = value === null ? "null" : typeof value;
        if (type !== "object") {
            const path = levels.reduce((path, level) => {
                const bracket = level.charAt(0) === "[";
                let name = bracket ? level.slice(1, -1) : level;
                if (PATTERN_OBJECT_LITERAL.test(name))
                    name = JSON.stringify(name.slice(1, -1));
                return path + (path && !bracket ? "." : "")
                    + (bracket ? `[${name}]` : name);
            }, "");
            throw new TypeError(`Unsupported object node: ${path || "<root>"} (${type})`);
        }
    };

    /**
     * Resolves or ensures an object tree below an explicit or implicit root.
     *
     * - Path: identifiers, brackets, decoded literals; undefined = omitted.
     * - Keys: unquoted decimal indices normalized as strings (no rounding);
     *   quoted keys preserved.
     * - Implicit root: bare identifier via indirect eval
     *   (global scope, including global const/let bindings, no closure access),
     *   window fallback if undefined; brackets/literals address window only.
     *   Local/module bindings are not resolved; missing root = undefined.
     * - Traversed nodes: non-null objects, including arrays.
     * - Readonly: ignore value; no creation/assignment; any leaf type allowed;
     *   missing nodes = undefined.
     * - Ensure (!readonly, value === undefined): reuse nodes; create [] before
     *   unquoted numeric indices, otherwise {}; end node must be an object.
     * - Assign (!readonly, value !== undefined): explicit root + path required;
     *   ensure intermediates, overwrite leaf, return value unchanged.
     *
     * @param {boolean} readonly Resolve without creating or assigning nodes
     * @param {string|object|undefined} [root] Root object or implicit-root path
     * @param {string} [path] Complete path below the root
     * @param {*} [value] Value to assign; ignored in readonly mode
     * @returns {*} Resolved or ensured node, assigned value, or undefined
     * @throws {Error} In case of invalid arguments, paths, nodes, global
     *     resolution or native property access and assignment errors
     */
    const _object_tree = (readonly, root, path, value) => {

        if (!readonly
                && value !== undefined) {
            if (root === undefined)
                throw new TypeError("Missing argument: root");
            if (path === undefined)
                throw new TypeError("Missing argument: path");
        } else value = undefined;

        const explicit = typeof root === "object";
        if (value !== undefined && !explicit)
            throw new TypeError(`Invalid object root: ${typeof root}`);
        let object = explicit ? root : undefined;
        if (!explicit && root !== undefined) {
            if (path !== undefined)
                throw new TypeError(`Invalid object root: ${typeof root}`);
            path = root;
        }
        const levels = path === undefined ? [] : _object_path_split(path);
        const keys = levels.map(level => {
            const bracket = level.charAt(0) === "[";
            const name = bracket ? level.slice(1, -1) : level;
            if (PATTERN_OBJECT_LITERAL.test(name))
                return name.slice(1, -1);
            return bracket ? name.replace(PATTERN_OBJECT_INDEX_ZEROS, "") : name;
        });

        if (!explicit) {
            if (levels.length === 0)
                return undefined;
            const name = keys[0];
            if (PATTERN_OBJECT_IDENTIFIER.test(levels[0]))
                object = (0, eval)(`typeof ${name} === "undefined" ? undefined : ${name}`);
            if (object === undefined)
                object = window[name];
        } else _object_node_assert(object, []);

        for (let index = explicit ? 0 : 1; index < levels.length; index++) {
            if (object === undefined && value === undefined)
                return undefined;
            _object_node_assert(object, levels.slice(0, index));
            const level = keys[index];
            if (value !== undefined && index === levels.length -1) {
                object[level] = value;
                return value;
            }
            let item = object[level];
            if (!readonly && item === undefined) {
                object[level] = PATTERN_OBJECT_ARRAY_INDEX.test(levels[index +1]) ? [] : {};
                item = object[level];
            }
            object = item;
        }
        if (!readonly && object !== undefined)
            _object_node_assert(object, levels);
        return object;
    };

    /**
     * Enhancement of the JavaScript API
     * Ensures an object tree below an existing root and returns its last level.
     *
     * - Path: identifiers, brackets and decoded string literals.
     * - Root: without an explicit root, an initial bare identifier is resolved
     *   globally, including global const/let bindings in classic scripts;
     *   local/module bindings are not resolved. If undefined, use the window
     *   property instead. Initial brackets/literals address window only.
     *   Pass window explicitly to create a new global root.
     * - Traversal: non-null objects, including arrays; existing nodes are reused.
     * - Ensure (value === undefined): create missing branches as arrays before
     *   unquoted numeric indices, otherwise as ordinary objects.
     * - Assign (value !== undefined): explicit root and complete path required;
     *   create missing intermediates only and overwrite the end value.
     * - Return: last object/array or assigned value unchanged; undefined for a
     *   missing implicit root or an argumentless call.
     * - Arguments: undefined path and value are treated as omitted.
     *
     * The method has the following various signatures:
     *     Object.use();
     *     Object.use(string);
     *     Object.use(object);
     *     Object.use(object, string);
     *     Object.use(undefined, string);
     *     Object.use(object, string, value);
     *
     * @param {string|object|undefined} [root] Root object or implicit-root path
     * @param {string} [path] Complete path below the root
     * @param {*} [value] Value to assign; undefined only ensures the structure
     * @returns {*} The object at the last level or the assigned value
     * @throws {Error} In case of invalid arguments, paths, nodes, global
     *     resolution or native property access and assignment errors
     */
    compliant("Object.use");
    compliant(null, Object.use = function(root, path, value) {
        return _object_tree(false, root, path, value);
    });

    /**
     * Enhancement of the JavaScript API
     * Resolves an object path without creating or assigning nodes.
     *
     * - Path: identifiers, brackets and decoded string literals.
     * - Root: without an explicit root, an initial bare identifier is resolved
     *   globally, including global const/let bindings in classic scripts;
     *   local/module bindings are not resolved. If undefined, use the window
     *   property instead. Initial brackets/literals address window only.
     * - Traversal: non-null objects, including arrays; end values may have any
     *   type. No nodes are created or assigned.
     * - Return: end value unchanged; undefined for a missing implicit root,
     *   missing node or an argumentless call.
     * - Arguments: an undefined path is treated as omitted.
     *
     * The method has the following various signatures:
     *     Object.lookup();
     *     Object.lookup(string);
     *     Object.lookup(object);
     *     Object.lookup(object, string);
     *     Object.lookup(undefined, string);
     *
     * @param {string|object|undefined} [root] Root object or implicit-root path
     * @param {string} [path] Complete path below the root
     * @returns {*} The resolved value
     * @throws {Error} In case of invalid arguments, paths, nodes, global
     *     resolution or native property access errors
     */
    compliant("Object.lookup");
    compliant(null, Object.lookup = function(root, path) {
        return _object_tree(true, root, path);
    });

    /**
     * Enhancement of the JavaScript API
     * Checks whether Object.lookup resolves a usable value.
     * Equivalent to Object.usable(Object.lookup(root, path)).
     * A usable value is neither undefined nor null; false, zero, NaN and empty
     * strings are usable. This is not a property-presence or truthiness check.
     * Path syntax, root resolution and traversal follow Object.lookup,
     * including global const/let bindings in classic scripts, but not local
     * bindings.
     *
     * - No nodes are created or assigned.
     * - An undefined path is treated as omitted.
     * - Without arguments, false is returned.
     * - Object.lookup errors propagate.
     *
     * The method has the following various signatures:
     *     Object.exists();
     *     Object.exists(string);
     *     Object.exists(object);
     *     Object.exists(object, string);
     *     Object.exists(undefined, string);
     *
     * @param {string|object|undefined} [root] Root object or implicit-root path
     * @param {string} [path] Complete path below the root
     * @returns {boolean} True if the resolved value is neither undefined nor null
     * @throws {Error} In case of invalid arguments, paths, nodes, global
     *     resolution or native property access errors
     */
    compliant("Object.exists");
    compliant(null, Object.exists = function(root, path) {
        return Object.usable(Object.lookup.apply(Object, arguments));
    });

    /**
     * Enhancement of the JavaScript API
     * Checks whether a value is usable, without object-path resolution.
     * A usable value is neither undefined nor null; false, zero, NaN and empty
     * strings are usable.
     *
     * - This is not a truthiness check.
     * - Without arguments, false is returned.
     *
     * The method has the following various signatures:
     *     Object.usable();
     *     Object.usable(value);
     *
     * @param {*} [object] Value to check; not restricted to objects
     * @returns {boolean} True if the value is neither undefined nor null
     */
    compliant("Object.usable");
    compliant(null, Object.usable = (object) =>
        object !== undefined && object !== null);

    const _sequence =  {symbol:Symbol(), value:0};

    /**
     * Enhancement of the JavaScript API
     * Function that returns the unique identifier (UID) of an object instance,
     * generated lazily on first invocation and immutable thereafter. Analogous
     * to a serial number, it provides a unique runtime identifier for the object instance.
     */
    compliant("Object.prototype.uid");
    compliant("Object.prototype.serial");
    compliant(null, Object.prototype.serial = function() {
        if (this.uid === undefined)
            Object.defineProperty(this, "uid", {
                value: ++_sequence.value
            });
        return this.uid;
    });

    /**
     * Enhancement of the JavaScript API
     * Creates a literal pattern for the specified text. Metacharacters or escape
     * sequences in the text thus lose their meaning.
     * @param {string} text Text to be literalized
     * @returns {string|null} Literal pattern for the specified text, or null if
     *     the text is not usable
     */
    compliant("RegExp.quote");
    compliant(null, RegExp.quote = (text) => {
        if (!Object.usable(text))
            return null;
        return String(text).replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
    });

    /**
     * Enhancement of the JavaScript API
     * Function to capitalize the first character of a string.
     * @returns {string} String with the first character capitalized
     */
    compliant("String.prototype.capitalize");
    compliant(null, String.prototype.capitalize = function() {
        if (this.length <= 0)
            return this;
        return this.charAt(0).toUpperCase() + this.slice(1);
    });

    /**
     * Enhancement of the JavaScript API
     * Function to uncapitalize the String objects.
     * @returns {string} The string with the first character uncapitalized
     */
    compliant("String.prototype.uncapitalize");
    compliant(null, String.prototype.uncapitalize = function() {
        if (this.length <= 0)
            return this;
        return this.charAt(0).toLowerCase() + this.slice(1);
    });

    /**
     * Enhancement of the JavaScript API
     * Function to encode a string as hexadecimal.
     * Each character is represented by its hexadecimal character code.
     * @returns {string} The hexadecimal encoded string
     */
    compliant("String.prototype.encodeHex");
    compliant(null, String.prototype.encodeHex = function() {
        let result = "";
        if (this.length <= 0)
            return "";
        for (let loop = 0; loop < this.length; loop++) {
            let digit = Number(this.charCodeAt(loop)).toString(16).toUpperCase();
            while (digit.length < 2)
                digit = "0" + digit;
            result += digit;
        }
        return "0x" + result;
    });

    /**
     * Enhancement of the JavaScript API
     * Function to decode a hexadecimal string.
     * The string must start with the hexadecimal prefix 0x.
     * @returns {string} The decoded string
     * @throws {Error} In case of a malformed hexadecimal character sequence.
     */
    compliant("String.prototype.decodeHex");
    compliant(null, String.prototype.decodeHex = function() {
        let text = this;
        if (this.length <= 0)
            return "";
        if (!text.match(/^0x/))
            throw new Error("Malformed hexadecimal character sequence");
        text = text.substring(2);
        let result = "";
        for (let loop = 0; loop < text.length; loop += 2)
            result += String.fromCharCode(parseInt(text.substring(loop, loop +2), 16));
        return result;
    });

    /**
     * Enhancement of the JavaScript API
     * Function to encode a string using Base64.
     * @returns {string} The Base64 encoded string.
     * @throws {Error} In case of a malformed character sequence.
     */
    compliant("String.prototype.encodeBase64");
    compliant(null, String.prototype.encodeBase64 = function() {
        try {
            return btoa(encodeURIComponent(this).replace(/%([0-9A-F]{2})/g,
                (match, code) =>
                    String.fromCharCode("0x" + code)));
        } catch (error) {
            throw new Error("Malformed character sequence");
        }
    });

    /**
     * Enhancement of the JavaScript API
     * Function to decode a Base64 encoded string.
     * @returns {string} The decoded string.
     * @throws {Error} In case of a malformed character sequence
     */
    compliant("String.prototype.decodeBase64");
    compliant(null, String.prototype.decodeBase64 = function() {
        try {
            return decodeURIComponent(atob(this).split("").map((code) =>
                "%" + ("00" + code.charCodeAt(0).toString(16)).slice(-2)).join(""));
        } catch (error) {
            throw new Error("Malformed character sequence");
        }
    });

    /**
     * Enhancement of the JavaScript API
     * Function to encode a string for use as HTML content.
     * @returns {string} The HTML encoded string
     */
    compliant("String.prototype.encodeHtml");
    compliant(null, String.prototype.encodeHtml = function() {
        const element = document.createElement("div");
        element.textContent = this;
        return element.innerHTML;
    });

    /**
     * Enhancement of the JavaScript API
     * Function to calculate a 32-bit hash value for a string.
     * @returns {string} The calculated hash value
     */
    compliant("String.prototype.hashCode");
    compliant(null, String.prototype.hashCode = function() {
        let hash = 0;
        for (let loop = 0; loop < this.length; loop++)
            hash = (Math.imul(31, hash) + this.charCodeAt(loop)) | 0;
        hash = (hash >>> 0).toString(36);
        return (hash.length.toString(36) + hash).toUpperCase();
    });

    const PATTERN_UNESCAPE_OCTAL = /([0-7]{1,3})/;
    const PATTERN_UNESCAPE_HEX = /x([0-9A-Fa-f]{2})/;
    const PATTERN_UNESCAPE_CODEPOINT = /u\{([0-9A-Fa-f]{1,6})\}/;
    const PATTERN_UNESCAPE_UNICODE = /u([0-9A-Fa-f]{4})/;
    const PATTERN_UNESCAPE_SYMBOL = /([\s\S]|$)/;
    const PATTERN_UNESCAPE = new RegExp("\\\\(?:" + [
        PATTERN_UNESCAPE_OCTAL,
        PATTERN_UNESCAPE_HEX,
        PATTERN_UNESCAPE_CODEPOINT,
        PATTERN_UNESCAPE_UNICODE,
        PATTERN_UNESCAPE_SYMBOL
    ].map(pattern => pattern.source).join("|") + ")", "g");

    /**
     * Enhancement of the JavaScript API
     * Decodes escape sequences once, without reinterpreting decoded characters.
     * @returns {string} The decoded string with processed control characters
     * @throws {SyntaxError} In case of malformed numeric or trailing escapes
     * @throws {RangeError} In case of a Unicode code point above U+10FFFF
     */
    compliant("String.prototype.unescape");
    compliant(null, String.prototype.unescape = function() {
        return this.replace(PATTERN_UNESCAPE,
            (match, octal, hexdecimal, codepoint, unicode, symbol) => {
                if (octal !== undefined)
                    return String.fromCharCode(Number.parseInt(octal, 8));
                if (hexdecimal !== undefined
                        || unicode !== undefined)
                    return String.fromCharCode(Number.parseInt(hexdecimal || unicode, 16));
                if (codepoint !== undefined) {
                    const value = Number.parseInt(codepoint, 16);
                    if (value > 0x10FFFF)
                        throw new RangeError(`Invalid unicode codepoint: U+${codepoint}`);
                    return String.fromCodePoint(value);
                }
                if (symbol === "x"
                        || symbol === "u"
                        || symbol === "")
                    throw new SyntaxError(`Invalid escape sequence: ${match}`);
                const index = "bfnrtv".indexOf(symbol);
                return index < 0 ? symbol : "\b\f\n\r\t\v".charAt(index);
            });
    });

    /**
     * Enhancement of the JavaScript API
     * Property to get the context path. The context path is a part of the
     * request URI and can be compared with the current working directory. The
     * context path does not end with a slash and can be empty if the
     * application is located directly under the main domain of the server.
     * @returns {string} The context path of the request URI.
     */
    compliant("window.location.contextPath");
    Object.defineProperty(window.location, "contextPath", {
        value: ((location) =>
            location.substring(0, location.lastIndexOf("/"))
        )(window.location.pathname)
    });

    /**
     * Enhancement of the JavaScript API
     * Function to combine paths to a new one. The result will always start with
     * a slash but ends without it.
     * @param {...string} paths Paths to be combined
     * @returns {string} The combined path.
     */
    compliant("window.location.combine");
    compliant(null, window.location.combine = (...paths) =>
        "/" + paths.join("/")
            .replace(/[\/\\]+/g, "/")
            .replace(/(^\/+)|(\/+$)/g, ""));
})();
