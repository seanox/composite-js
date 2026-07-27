/**
 * Seanox aspect-js, application runtime for single-page applications
 * Copyright (C) 2025 Seanox Software Solutions
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
 *
 *     DESCRIPTION
 *     ----
 *
 * The presentation of the page can be organized in Seanox aspect-js in views,
 * which are addressed via paths (routes). For this purpose, the routing
 * supports a hierarchical directory structure based on the IDs of the nested
 * composites in the markup. The routing then controls the visibility and
 * permission for accessing the views via paths - the so-called view flow. For
 * the view flow and the permission, the routing actively uses the DOM to insert
 * and remove the views depending on the situation.
 *
 *
 *     TERMS
 *     ----
 *
 *         Page
 *         ----
 * In a single page application, the page is the elementary framework and
 * runtime environment of the entire application.
 *
 *         View
 *         ----
 * A view is the primary projection of models/components/content. This
 * projection can contain additional substructures in the form of views and
 * sub-views. Views can be static, always shown, or controlled by path and
 * permissions. Paths address the complete chain of nested views and shows the
 * parent views in addition to the target view.
 *
 *         View Flow
 *         ----
 * View flow describes the access control and the sequence of views. The routing
 * provides interfaces, events, permission concepts and interceptors with which
 * the view flow can be controlled and influenced.
 *
 *         Paths
 *         ----
 * Paths are used for navigation, routing and controlling the view flow. The
 * target can be a view or a function if using interceptors. For SPAs
 * (single-page applications), the anchor part of the URL is used for navigation
 * and routes.
 *
 * Similar to a file system, absolute and relative paths are also supported
 * here. Paths consist of case-sensitive words that only use 7-bit ASCII
 * characters above the space character. Characters outside this range are URL
 * encoded. The words are separated by the hash character (#).
 *
 * Repeated use of the separator (#) allows jumps back in the path to be mapped.
 * The number of repetitions indicates the number of returns in the direction of
 * the root.
 */
(() => {

    "use strict";

    // Status of the activation of routing
    // The status cannot be changed again after (de)activation and is only set
    // initially when the page is loaded.
    let _routing_active;

    // Task that triggers the hashchange event via a timer if the hashchange
    // event from the browser does not occur. If the browser event occurs as
    // planned, the interrupt is discarded. It concerns Mozilla/Gecko, where the
    // change from / to /# does not trigger a hashchange event.
    let _routing_interrupt;

    // Array with all supported interceptors
    const _interceptors = [];

    // Array with the path history (optimized)
    const _history = [];

    const Browser = {

        /**
         * Returns the current working path. This assumes that the URL contains
         * at least one hash, otherwise the method returns null.
         * @returns {string|null} the current path, otherwise null
         */
        get location() {
            if (window.location.hash !== "")
                return window.location.hash;
            return _locate(window.location.href);
        }
    }

    const _locate = (location) => {
        if (location === null)
            return null;
        const match = location.match(/#.*$/);
        return match ? match[0] : null;
    }

    compliant("Routing");
    compliant(null, window.Routing = {

        /** Constant for attribute route */
        get ATTRIBUTE_ROUTE() {return "route";},

        /**
         * Returns the current working path normalized. This assumes that the
         * URL contains at least one hash, otherwise the method returns null.
         * @returns {string|null} the current path, otherwise null
         */
        get location() {
            let location = Browser.location;
            if (location != null
                    && (/^(#{2,}|[^#])/).test(location)) {
                let parent = "#";
                if (_history.length > 0)
                    parent = _history[_history.length -1];
                return Path.normalize(parent, location);
            }
            return Path.normalize(location);
        },

        /**
         * Returns the current navigation history and automatically recognizes
         * when there are jumps back to previous destinations. In such cases,
         * all subsequent entries are removed to ensure that the history remains
         * consistent and up to date.
         * @returns {string[]} navigation history as array
         */
        get history() {
            return _history;
        },

        /**
         * Routes to the given path. In difference to the forward method, route
         * is not executed directly, instead the change is triggered
         * asynchronous by the location hash.
         * @param {string} path
         */
        route(path) {
            if (path === undefined
                    || (typeof path !== "string"
                            && path !== null))
                throw new TypeError("Invalid data type");
            path = Path.normalize(path);
            if (path === null
                    || path === Browser.location)
                return;
            Composite.asynchronous(path => {
                const event = new Event("hashchange",{bubbles:false, cancelable:true});
                event.oldURL = Browser.location;
                event.newURL = path;
                if (path.startsWith("#"))
                    window.location.hash = path.substring(1);
                else window.location.href = path;
                _routing_interrupt = Composite.asynchronous(event => {
                    if (event.newURL !== Browser.location)
                        window.dispatchEvent(event);
                }, event);
            }, path);
        },
        
        /**
         * Forwards to the given path. In difference to the route method, the
         * forwarding is triggered directly as an event, whereas the route
         * method an asynchronous forwarding by changing the location hash.
         * @param {string} path
         */
        forward(path) {
            if (path === undefined
                    || (typeof path !== "string"
                            && path !== null))
                throw new TypeError("Invalid data type");
            path = Path.normalize(path);
            if (path === null
                    || path === Browser.location)
                return;
            const event = new Event("hashchange",{bubbles:false, cancelable:true});
            event.oldURL = Browser.location;
            event.newURL = path;
            window.dispatchEvent(event);
        },
           
        /**
         * Checks whether routing keeps or removes the composite in the DOM.
         * A matching model can implement permit() and return undefined, true
         * or false.
         *
         * true and false decide directly. If permit() is missing or returns
         * undefined, routing falls back to checking Path.covers(path). Covered means
         * that the specified path must be contained from the root of the
         * current working path.
         *
         * @param {string} path path of the composite
         * @param {string} composite composite ID of the element in the markup
         * @returns {boolean} true if the composite element is approved,
         *     otherwise false
         */
        approve(path, composite) {

            if (typeof path !== "string")
                throw new TypeError("Invalid data type");
            if (typeof composite !== "string")
                throw new TypeError("Invalid data type");

            path = Path.normalize(path);
            if (path === null
                    || path === "#")
                return false;

            composite = composite.match(Composite.PATTERN_COMPOSITE_ID);
            if (!composite)
                return false;

            const model = (composite[1] || "").trim();
            const namespace = (composite[2] || "").replace(/:/g, ".");
            const scope = namespace.length > 0 ? namespace + "." + model : model;

            const object = (function(context, namespace) {
                return namespace.split('.').reduce(function(scope, target) {
                    return scope && scope[target];
                }, context);
            })(window, scope) || (Object.exists(scope) ? Object.use(scope) : undefined);

            if (object == null
                    || typeof object !== "object"
                    || typeof object.permit !== "function")
                return path !== undefined
                    && Path.covers(path);
            const approval = object.permit();
            if (approval === undefined)
                return path !== undefined
                    && Path.covers(path);
            return approval === true;
        },

        /**
         * Add an interceptor. An interceptor consists of a path and an actor.
         * The path can be either a string or a regular expression (RegExp),
         * and the actor must be a function. Interceptors are useful for
         * reacting to paths and possibly influencing the routing in relation to
         * the paths.
         * @param {string|RegExp} path path or route that needs customization.
         *     It can be a string or a regular expression.
         * @param {function} actor function that acts as an interceptor for the
         *     specified path when the specified path is addressed.
         * @throws {TypeError} If the `path` is neither a string nor a RegExp
         */
        customize(path, actor) {
            if (typeof path !== "string"
                    && !(path instanceof RegExp))
                throw new TypeError("Invalid data type");
            if (actor == null
                    || typeof actor !== "function")
                throw new TypeError("Invalid object type");
            _interceptors.push({path:path, actor:actor});
        },

        /**
         * Determines the closest matching location in relation to the closest
         * composite to the current location. If Routing is inactive, the method
         * will be returned undefined.
         * @param {(boolean|Object)} [meta=false] optional true or a metadata
         *     object to be filled; in both cases, a meta-object with locate
         *     and, if available, an array with data is also returned
         * @returns {string|undefined|Object} the resolved location if Routing
         *     is active; otherwise, returns undefined
         */
        locate(meta = false) {
            if (!_routing_active)
                return undefined;
            const location = Routing.location;
            const locate = _lookup(_lookup(location));
            if ((meta == null || typeof meta !== "object")
                    && meta !== true)
                return locate;
            if (typeof meta !== "object")
                meta = {};
            meta.locate = locate;
            meta.data = location.substring(locate.length)
                .replace(/^#+/, "")
                .split(/#+/);
            return meta;
        }
    });

    /**
     * The method accepts a path as a string and determines the corresponding
     * element that is best covered by this path (Path-to-Element). The path can
     * be longer than the actual target, similar to the concepts PATH_TRANSLATED
     * and PATH_INFO in CGI.
     *
     * Alternatively, the method can accept a specific element and determine the
     * corresponding path in the markup (Element-to-Path).
     *
     * @param {string|Element} lookup
     * @returns {string|Element} For Element input: the path as string.
     *     For path input: the matching element or document.body.
     */
     const _lookup = (lookup) => {

        if (lookup instanceof Element) {
            let path = "";
            for (let element = lookup; element; element = element.parentElement) {
                if (!element.hasAttribute(Composite.ATTRIBUTE_COMPOSITE)
                        || !element.hasAttribute(Composite.ATTRIBUTE_ID)
                        || !element.hasAttribute(Routing.ATTRIBUTE_ROUTE))
                    continue;
                const composite = element.getAttribute(Composite.ATTRIBUTE_ID);
                const match = composite.match(Composite.PATTERN_COMPOSITE_ID);
                if (!match)
                    throw new Error(`Invalid composite id${composite ? ": " + composite : ""}`);
                path = "#" + match[1] + path;
            }
            return path || "#";
        }

        const marker = `[${Composite.ATTRIBUTE_COMPOSITE}][${Routing.ATTRIBUTE_ROUTE}]`;
        const path = lookup.split("#").slice(1).map(entry =>
            `[id="${entry}"]${marker},[id^="${entry}@"]${marker}`);
        while (path.length > 0) {
            const element = document.querySelector(path.join(">"));
            if (element instanceof Element)
                return element;
            path.pop();
        }
        return document.body;
    };

    const _render = (element, focus = false) => {
        Composite.render(element);
        if (focus) {
            Composite.asynchronous((element) => {
                if (typeof element.focus === "function")
                    element.focus();
            }, element);
        }
    };

    /**
     * Establishes a listener that detects changes to the URL hash. The method
     * corrects invalid and unauthorized paths by forwarding them to next valid
     * path and organizes partial rendering.
     */
    window.addEventListener("hashchange", (event) => {

        if (_routing_interrupt)
            _routing_interrupt.cancel();

        if (!_routing_active)
            return;

        // Interceptors
        // - order of execution corresponds to the order of registration
        // - all interceptors are always checked and executed if they match
        // - no entry in history
        // - can change the new hash/path, but please use replace
        // - following interceptors use the possibly changed hash/path
        // - on the first explicit false, terminates the logic in hashchange
        const oldHash = _locate(event.oldURL);
        const newHash = _locate(event.newURL);
        for (const interceptor of _interceptors) {
            if (typeof interceptor.path === "string") {
                if (!Path.PATTERN_PATH.test(interceptor.path))
                    continue;
                if (interceptor.path.endsWith("#")) {
                    if (!newHash.startsWith(interceptor.path))
                        continue;
                } else {
                    if (newHash !== interceptor.path
                            && !newHash.startsWith(interceptor.path + "#"))
                        continue;
                }
            } else if (interceptor.path instanceof RegExp) {
                if (!interceptor.path.test(newHash))
                    continue;
            } else continue;
            if (typeof interceptor.actor === "function"
                    && interceptor.actor(oldHash, newHash) === false)
                return;
        }

        const location = Routing.location || "#";
        if (location !== Browser.location) {
            window.location.replace(location);
            return;
        }

        // Maintaining the history.
        // For recursions, the history is discarded after the first occurrence.
        const index = _history.indexOf(location);
        if (index >= 0)
            _history.length = index;
        _history.push(location);

        // Decision matrix
        // - invalid path(s) / undefined, then do nothing
        // - no path match / null, then render body and focus
        // - Composite old and new are the same, then render and focus new
        // - Composite old and new are not equal and one is body, then render
        //   body and focus new
        // - Composite old includes new, then render old and focus new
        // - Composite new includes old, then render new and focus new
        // - Composite old and new unequal, then render old, then render new and
        //   focus new

        const locationOld = Path.normalize(_locate(event.oldURL));
        const locationNew = Path.normalize(_locate(event.newURL));
        const locationMatch = Path.matches(locationOld, locationNew);
        if (locationMatch === undefined)
            return;
        if (locationMatch === null) {
            _render(document.body, true);
            return;
        }
        const locationOldElement = _lookup(locationOld);
        const locationNewElement = _lookup(locationNew);
        if (locationOldElement === locationNewElement) {
            _render(locationNewElement, true);
            return;
        }
        if (locationOldElement === document.body
                || locationNewElement === document.body) {
            _render(document.body);
            Composite.asynchronous((element) => {
                if (typeof element.focus === "function")
                    element.focus();
            }, locationNewElement);
            return;
        }
        if (locationOldElement.contains(locationNewElement)) {
            _render(locationOldElement);
            Composite.asynchronous((element) => {
                if (typeof element.focus === "function")
                    element.focus();
            }, locationNewElement);
            return;
        }
        if (locationNewElement.contains(locationOldElement)) {
            _render(locationNewElement, true);
            return;
        }
        _render(locationOldElement);
        _render(locationNewElement, true);
    });

    /**
     * Rendering filter for all composite elements. The filter causes that for
     * each composite element determined by the renderer, an additional
     * condition is added to the Routing. This condition is used to show and
     * hide the composite elements in the DOM. What happens by physically adding
     * and removing. The elements are identified by the composite ID.
     */
    Composite.customize((element) => {

        if (element instanceof Element
                && element.hasAttribute("route")
                && element.getAttribute("route") !== "")
            console.warn("Ignore value for attribute route");

        if (_routing_active === undefined) {
            // Activates routing during initial rendering when BODY has
            // the route attribute. A non-empty value is ignored with a
            // warning to avoid semantic interpretations like route="off".
            _routing_active = document.body.hasAttribute("route");
            if (document.body.hasAttribute("route")
                    && document.body.getAttribute("route") !== "")
                console.warn("Ignore value for attribute route");

            if (!_routing_active)
                return;

            // Without path, is forwarded to the root. The fact that the
            // interface can be called without a path if it wants to use the
            // routing must be taken into account in the declaration of the
            // markup and in the implementation. This logic is not included
            // here! With path, the event must be triggered initially so that
            // any custom interceptors are addressed with the initial path.
            if (Browser.location) {
                const event = new Event("hashchange",{bubbles:false, cancelable:true});
                event.oldURL = "";
                event.newURL = Browser.location;
                window.dispatchEvent(event);
            } else Routing.route("#");
        }

        if (!_routing_active
                || !(element instanceof Element)
                || !element.hasAttribute(Composite.ATTRIBUTE_COMPOSITE)
                || !element.hasAttribute(Routing.ATTRIBUTE_ROUTE))
            return;

        const composite = (element.getAttribute(Composite.ATTRIBUTE_ID) || '').trim();
        const path = _lookup(element);

        let script = null;
        if (element.hasAttribute(Composite.ATTRIBUTE_CONDITION)) {
            script = element.getAttribute(Composite.ATTRIBUTE_CONDITION).trim();
            if (script.match(Composite.PATTERN_EXPRESSION_CONTAINS))
                script = script.replace(Composite.PATTERN_EXPRESSION_CONTAINS, (match) => {
                    match = match.substring(2, match.length -2).trim();
                    return `{{Routing.approve("${path}", ${composite}") and (${match})}}`;
                });
        }
        if (!script)
            script = `{{Routing.approve("${path}", "${composite}")}}`;
        element.setAttribute(Composite.ATTRIBUTE_CONDITION, script);
    });

    /**
     * Static component for the use of paths (routes). Paths are used for
     * navigation, routing and controlling the view flow. The target can be a
     * view or a function if using interceptors.
     */
    compliant("Path");
    compliant(null, window.Path = {

        // Pattern for a valid path in the 7-bit ASCII range
        get PATTERN_PATH() {return /^#[\x21-\x7E]*$/},

        // Pattern for a string in the 7-bit ASCII range
        get PATTERN_ASCII() {return /^[\x21-\x7E]*$/},

        /**
         * Compares two paths and returns the common part. This method compares
         * path and compare. If the paths match, the method returns the common
         * part of the paths. If there is no match, null is returned. When
         * trying with paths without content (null and empty string), the method
         * will not return a value.
         * @param {string} path
         * @param {string} compare
         * @returns {undefined|null|string}
         */
        matches(path, compare) {

            if (path === undefined
                    || (typeof path !== "string"
                            && path !== null)
                    || compare === undefined
                    || (typeof compare !== "string")
                            && compare !== null)
                throw new TypeError("Invalid data type");

            if (path == null
                    || path.length <= 0
                    || compare == null
                    || compare.length <= 0)
                return;
            path = path.split(/(?=#)/);
            compare = compare.split(/(?=#)/);
            const length = Math.min(path.length, compare.length);
            for (let index = 0; index < length; index++) {
                if (path[index] !== compare[index]) {
                    path.length = index;
                    break;
                }
            }
            return path.join("") || null;
        },

        /**
         * Checks whether the specified path is covered by the current working
         * path. Covered means that the specified path must be contained from
         * the root of the current working path. This assumes that the URL
         * contains at least one hash, otherwise the method returns false.
         * @param {string} path to be checked
         * @returns {boolean} true if the path is covered by the current path
         */
        covers(path) {

            if (path === undefined
                    || (typeof path !== "string")
                            && path !== null)
                throw new TypeError("Invalid data type");

            path = Path.normalize(path);
            if (!Routing.location
                    || path == null
                    || path.trim() === "")
                return false;
            if (path === "#")
                return true;
            return (Routing.location + "#").startsWith(path + "#");
        },

        /**
         * Normalizes a path. Paths consist of words that only use 7-bit ASCII
         * characters above the space character. The words are separated by the
         * hash character (#). There are absolute and relative paths:
         *
         * - Absolute Paths start with the root, represented by a leading
         *   hash sign (#).
         *
         * - Relative Paths are based on the current path and begin with either
         *   a word or a return. Return jumps also use the hash sign, whereby
         *   the number of repetitions indicates the number of return jumps. If
         *   the URL does not contain at least one hash and therefore has no
         *   working path, the root path is used as the working path.
         *
         * The return value is always a balanced canonical path, starting with
         * the root.
         *
         * Examples (root #x#y#z):
         *
         *    #a#b#c#d#e##f   #a#b#c#d#f
         *    #a#b#c#d#e###f  #a#b#c#f
         *    ###f            #x#f
         *    ####f           #f
         *    empty           #x#y#z
         *    #               #x#y#z
         *    a#b#c           #x#y#z#a#b#c
         *
         * Invalid roots and paths cause an error.
         *
         * The method has the following various signatures:
         *     function(root, path)
         *     function(root, path, ...)
         *     function(path)
         *
         * @param {string} [root] optional, otherwise current location is used
         * @param {string} path to normalize
         * @returns {string} the normalize path
         * @throws {Error} An error occurs in the following cases:
         *     - Invalid root and/or path
         */
        normalize(...variants) {

            if (variants == null
                    || variants.length <= 0)
                return null;

            if (variants.length === 1
                    && variants[0] == null)
                return null;

            variants.every(item => {
                if (item == null
                        || typeof item === "string")
                    return true;
                throw new TypeError("Invalid data type");
            });

            variants = variants.filter((item, index) =>
                item != null
                    && item.trim() !== ""
                    && !(index > 0 && item === "#"));

            variants.forEach(item => {
                if (!Path.PATTERN_ASCII.test(item))
                    throw new Error(`Invalid path element: ${item}`)});

            variants = ((paths) =>
                paths.map((item, index) => {
                    item = item == null ? "" : item.trim()
                    item = item.replace(/([^#])#$/, '$1');
                    if (index > 0 && item.startsWith('#'))
                        return item.substring(1);
                    return item;
                })
            )(variants);

            let location = Browser.location;
            if (location == null
                    || location.trim() === "")
                location = "#";
            if (variants.length > 0
                    && variants[0] == null)
                variants[0] = location;
            if (variants.length > 0
                    && !variants[0].startsWith('#'))
                variants.unshift(location);
            if (variants.length <= 0)
                variants.unshift(location);

            let path = variants.join("#");
            if (path.startsWith("##"))
                path = location + path;

            if (!path.match(Path.PATTERN_PATH))
                throw new Error(`Invalid path${String(path).trim() ? ": " + path : ""}`);

            const pattern = /#[^#]+#{2}/;
            while (path.match(pattern))
                path = path.replace(pattern, "#");
            path = "#" + path.replace(/(^#+)|(#+)$/g, "");

            return path;
        }
    });
})();