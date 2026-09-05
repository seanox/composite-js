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
     *     compliant("Object.prototype.ordinal");
     *     compliant(null, Object.prototype.ordinal = function() {...}
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
     * Comparable to packages in other programming languages, namespaces can be
     * used for hierarchical structuring of components, resources and business
     * logic. Although packages are not a feature of JavaScript, they can be
     * mapped at the object level by concatenating objects into an object tree.
     * Here, each level of the object tree forms a namespace, which can also be
     * considered a domain.
     *
     * As is typical for the identifiers of objects, namespaces so use word
     * characters, means letters, numbers and underscores separated by a dot. As
     * a special feature, arrays are also supported. If a layer in the namespace
     * uses an integer, this layer is used as an array.
     */
    compliant("Namespace");
    compliant(null, window.Namespace = {

        /** Pattern for the namespace separator */
        get PATTERN_NAMESPACE_SEPARATOR() {return /\./;},

        /** Pattern for a valid namespace level at the beginning */
        get PATTERN_NAMESPACE_LEVEL_START() {return /^[_a-z\$][\w\$]*$/i;},

        /** Pattern for a valid namespace level */
        get PATTERN_NAMESPACE_LEVEL() {return /^[\w\$]+$/;},

        /**
         * Creates a namespace to the passed object, strings and numbers, if the
         * namespace contains arrays and the numbers can be used as index.
         * Levels of the namespace levels are separated by a dot. Levels can as
         * fragments also contain dots. Without arguments the global namespace
         * window is returned.
         *
         * The method has the following various signatures:
         *     Namespace.use();
         *     Namespace.use(string);
         *     Namespace.use(string, ...string|number);
         *     Namespace.use(object);
         *     Namespace.use(object, ...string|number);
         *
         * @param {...(string|number|object)} levels Levels of the namespace
         * @returns {object} The created or already existing object (level)
         * @throws {Error} In case of invalid data types or syntax
         */
        use(...levels) {

            if (levels.length <= 0)
                return window;

            _filter(...levels);

            let offset = levels.length;
            let namespace = null;
            if (levels.length > 0
                    && typeof levels[0] === "object")
                namespace = levels.shift();
            offset -= levels.length;

            levels = levels.join(".");
            levels.split(Namespace.PATTERN_NAMESPACE_SEPARATOR).forEach((level, index, array) => {

                const pattern = index === 0 && namespace === null
                        ? Namespace.PATTERN_NAMESPACE_LEVEL_START : Namespace.PATTERN_NAMESPACE_LEVEL;
                if (!level.match(pattern))
                    throw new Error(`Invalid namespace at level ${index +1}${level && level.trim() ? ": " + level.trim() : ""}`);

                // Composites use IDs which causes corresponding DOM objects
                // (Element) in the global namespace if there are no
                // corresponding application modules. Because namespaces are
                // based on data objects, if an element appears, we assume that
                // a data object does not exist and the recursive search is
                // aborted as unsuccessful.

                if (index === 0
                        && namespace === null) {
                    namespace = _populate(namespace, level);
                    if (namespace !== undefined
                            && !(namespace instanceof Element))
                        return;
                    namespace = window;
                }

                const item = _populate(namespace, level);
                const type = typeof item;
                if (type !== "undefined"
                        && type !== "object")
                    throw new TypeError(`Invalid namespace type at level ${index +1 +offset}: ${type}`);
                if (item === undefined
                        || item === null
                        || item instanceof Element)
                    if (index < array.length -1
                            && array[index +1].match(/^\d+$/))
                        namespace[level] = [];
                    else namespace[level] = {};
                namespace = _populate(namespace, level);
            });

            return namespace;
        },
            
        /**
         * Creates a namespace with an initial value to the passed object,
         * strings and numbers, if the namespace contains arrays and the numbers
         * can be used as index. Levels of the namespace levels are separated by
         * a dot. Levels can as fragments also contain dots. Namespace and value
         * are required.
         *
         * The method has the following various signatures:
         *     Namespace.create(string, value);
         *     Namespace.create(string, ...string|number, value);
         *     Namespace.create(object, value);
         *     Namespace.create(object, ...string|number, value);
         *
         * @param {...(string|number|object)} levels Levels of the namespace
         * @param {*} value Value to initialize/set
         * @returns {object} The created or already existing object (level)
         * @throws {Error} In case of invalid data types or syntax
         */
        create(...levels) {
            if (levels.length < 2)
                throw new Error("Invalid namespace for creation: Namespace and/or value is missing");
            const value = levels.pop();
            levels = _filter(...levels);
            const level = levels.pop();
            const namespace = Namespace.use(...levels);
            if (namespace === null)
                return null;
            namespace[level] = value;
            return _populate(namespace, level);
        },
            
        /**
         * Resolves a namespace and returns the determined object(-level).
         * If the namespace does not exist, undefined is returned.
         *
         * The method has the following various signatures:
         *     Namespace.lookup();
         *     Namespace.lookup(string);
         *     Namespace.lookup(string, ...string|number);
         *     Namespace.lookup(object);
         *     Namespace.lookup(object, ...string|number);
         *
         * @param {...(string|number|object)} levels Levels of the namespace
         * @returns {object|undefined} The determined object(-level)
         * @throws {Error} In case of invalid data types or syntax
         */
        lookup(...levels) {

            if (levels.length <= 0)
                return window;

            _filter(...levels);

            let offset = levels.length;
            let namespace = null;
            if (levels.length > 0
                    && typeof levels[0] === "object")
                namespace = levels.shift();
            offset -= levels.length;

            levels = levels.join(".");
            levels = levels.split(Namespace.PATTERN_NAMESPACE_SEPARATOR);
            for (let index = 0; index < levels.length; index++) {

                const level = levels[index];

                const pattern = index +offset === 0
                        ? Namespace.PATTERN_NAMESPACE_LEVEL_START : Namespace.PATTERN_NAMESPACE_LEVEL;
                if (!level.match(pattern))
                    throw new Error(`Invalid namespace at level ${index +1 +offset}${level && level.trim() ? ": " + level.trim() : ""}`);

                // Composites use IDs which causes corresponding DOM objects
                // (Element) in the global namespace if there are no
                // corresponding application modules. Because namespaces are
                // based on data objects, if an element appears, we assume that
                // a data object does not exist and the recursive search is
                // aborted as unsuccessful.

                if (index === 0
                        && namespace === null) {
                    namespace = _populate(namespace, level);
                    if (namespace !== undefined)
                        continue;
                    namespace = window;
                }

                namespace = _populate(namespace, level);
                if (namespace === undefined
                        || namespace === null)
                    return namespace;

                if (namespace instanceof Element)
                    return undefined;
            }

            return namespace;
        },
        
        /**
         * Checks whether a namespace exists based on the passed object, strings
         * and numbers, if the namespace contains arrays and the numbers can be
         * used as index. Levels of the namespace chain are separated by a dot.
         * Levels can also be fragments that contain dots. Without arguments,
         * false is returned.
         *
         * The method has the following various signatures:
         *     Namespace.exists();
         *     Namespace.exists(string);
         *     Namespace.exists(string, ...string|number);
         *     Namespace.exists(object);
         *     Namespace.exists(object, ...string|number);
         *
         * @param {...(string|number|object)} levels Levels of the namespace
         * @returns {boolean} True if the namespace exists
         */
        exists(...levels) {
            if (levels.length < 1)
                return false;
            return Object.usable(Namespace.lookup(...levels));
        }
    });

    const _filter = (...levels) => {
        const chain = [];
        levels.forEach((level, index) => {
            if (index === 0
                    && typeof level !== "object"
                    && typeof level !== "string")
                throw new TypeError(`Invalid namespace at level ${index +1}: ${typeof level}`);
            if (index === 0
                    && level === null)
                throw new TypeError(`Invalid namespace at level ${index +1}: null`);
            if (index > 0
                    && typeof level !== "string"
                    && typeof level !== "number")
                throw new TypeError(`Invalid namespace at level ${index +1}: ${typeof level}`);
            level = typeof level === "string"
                ? level.split(Namespace.PATTERN_NAMESPACE_SEPARATOR) : [level];
            chain.push(...level);
        });
        return chain;
    };

    const _populate = (namespace, level) => {
        if (namespace && namespace !== window)
            return namespace[level];
        try {return eval(`typeof ${level} !== "undefined" ? ${level} : undefined`);
        } catch (error) {
            if (error instanceof ReferenceError
                    && namespace === window)
                return window[level];
            throw error;
        }
    }

    /**
     * Enhancement of the JavaScript API
     * Modifies the method to support node and nodes as NodeList and Array. If
     * the option exclusive is used, existing children will be removed first.
     * @param {(Node|NodeList|Array)} node Node(s) to be modified
     * @param {boolean} [exclusive=false] True, removes existing children
     */
    const _appendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(node, exclusive) {
        if (exclusive)
            this.innerHTML = "";
        if (node instanceof Node)
            return _appendChild.call(this, node);
        if (Array.isArray(node)
                || node instanceof NodeList
                || (Symbol && Symbol.iterator
                        && node && typeof node[Symbol.iterator])) {
            node = Array.from(node);
            for (let loop = 0; loop < node.length; loop++)
                _appendChild.call(this, node[loop]);
            return node;
        }
        return _appendChild.call(this, node);
    };

    /**
     * Enhancement of the JavaScript API
     * Adds a static function to create an alphanumeric unique (U)UID with fixed
     * size. The quality of the ID is dependent of the length.
     * @param {number} [size=16] Optional size of the unique ID
     * @returns {string} The generated alphanumeric unique ID
     */
    compliant("Math.unique");
    compliant(null, Math.unique = (size) => {
        size = size || 16;
        if (size < 0)
            size = 16;
        let unique = "";
        for (let loop = 0; loop < size; loop++) {
            const random = Math.floor(Math.random() * Math.floor(26));
            if ((Math.floor(Math.random() *Math.floor(26))) % 2 === 0)
                unique += String(random % 10);
            else unique += String.fromCharCode(65 +random);
        }
        return unique;
    });

    /**
     * Enhancement of the JavaScript API
     * Adds a static function to create a time based alphanumeric serial that is
     * chronologically sortable as text and contains the time and a counter if
     * serial are created at the same time.
     * @returns {string} The generated time-based alphanumeric serial
     */
    compliant("Math.serial");
    compliant(null, Math.serial = () =>
        _serial.toString());
    const _offset = -946684800000;
    const _serial = {timing:Date.now() + _offset, number:0,
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
     * Adds a capitalize function to the String objects.
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
     * Adds an uncapitalize function to the String objects.
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
     * Adds a function for encoding the string objects in hexadecimal code.
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
     * Adds a function that parses hexadecimal chunks from String values.
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
     * Adds a method for encoding Base64.
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
     * Adds a method for decoding Base64.
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
     * Adds an HTML encode function to the String objects.
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
     * Adds a method for calculating a hash value.
     * @returns {string} The calculated hash value
     */
    compliant("String.prototype.hashCode");
    compliant(null, String.prototype.hashCode = function() {
        let hash = 0;
        let hops = 0;
        for (let loop = 0; loop < this.length; loop++) {
            const temp = 31 *hash +this.charCodeAt(loop);
            if (!Number.isSafeInteger(temp)) {
                hops++;
                hash = Number.MAX_SAFE_INTEGER -hash +this.charCodeAt(loop);
            } else hash = temp;
        }
        hash = Math.abs(hash).toString(36);
        hash = hash.length.toString(36) + hash;
        hash = (hash + hops.toString(36)).toUpperCase();
        return hash;
    });

    /**
     * Enhancement of the JavaScript API
     * Adds a decoding of slash sequences (control characters).
     * @returns {string} The decoded string with processed control characters
     */
    compliant("String.prototype.unescape");
    compliant(null, String.prototype.unescape = function() {
        let text = this
            .replace(/\r/g, "\\r")
            .replace(/\n/g, "\\n")
            .replace(/^(["'])/, "\$1")
            .replace(/([^\\])((?:\\{2})*)(?=["'])/g, "$1$2\\");
        return eval(`"${text}"`);
    });

    /**
     * Enhancement of the JavaScript API
     * Adds a property to get the UID for the window instance.
     * @returns {string} The unique identifier (UID) for the window instance
     */
    compliant("window.serial");
    Object.defineProperty(window, "serial", {
        value: Math.serial()
    });

    /**
     * Enhancement of the JavaScript API
     * Adds a property to get the context path. The context path is a part of
     * the request URI and can be compared with the current working directory.
     * The context path does not end with a slash and can be empty if the
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
     * Adds a method to combine paths to a new one. The result will always start
     * with a slash but ends without it.
     * @param {...string} paths Paths to be combined
     * @returns {string} The combined path.
     */
    compliant("window.location.combine");
    compliant(null, window.location.combine = (...paths) =>
        "/" + paths.join("/")
            .replace(/[\/\\]+/g, "/")
            .replace(/(^\/+)|(\/+$)/g, ""));
})();
