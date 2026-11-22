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
 * Reactive is the data bridge between application logic and the view. Its proxy
 * exposes the same underlying object and tracks which view consumers read each
 * property during rendering. Changes made through the proxy can trigger partial
 * re-renders of those consumers, including assignments, deletions, property
 * definitions, and array index or length changes. Direct changes to the
 * original object do not trigger updates.
 *
 * Built-in reactivity is intended for plain objects and arrays with primitive
 * values. Nested objects, including values assigned later, are wrapped on first
 * access. Native objects such as Date, Map, Set, WeakMap and WeakSet are not
 * adapted; wrapping them will require the upcoming customize API.
 *
 * Reactive is optional and uses the existing composite-js API.
 *
 * Each original object maps to one free (unbound) proxy, cached in a WeakMap.
 * This mapping does not keep otherwise unreachable objects alive. The proxy and
 * original object share the same data, regardless of where the object appears
 * in the data tree.
 *
 * see also: https://seanox.github.io/composite-js/manuals/reactive.html
 */
(() => {

    "use strict";

    compliant("Reactive");
    compliant(null, window.Reactive = (object) => {
        if (object == null
                || typeof object !== "object")
            throw new TypeError("Invalid object type");
        return _reactive(object);
    });

    let _selector = null;
    Composer.listen(Composer.EVENT_RENDER_START, (event, selector) =>
        _selector = selector);
    Composer.listen(Composer.EVENT_RENDER_NEXT, (event, selector) =>
        _selector = selector);
    Composer.listen(Composer.EVENT_RENDER_END, (event, selector) =>
        _selector = null);

    let _selector_cache = null;
    Composer.listen(Composer.EVENT_MODULE_DOCK, (event, selector) => {
        _selector_cache = _selector;
        _selector = null;
    });
    Composer.listen(Composer.EVENT_MODULE_READY, (event, selector) => {
        _selector = _selector_cache;
        _selector_cache = null;
    });

    /**
     * Enhancement of the JavaScript API
     * Adds a function to create a reactive object to an object instance. If it
     * is already a reactive object, the reference of the instance is returned.
     */
    compliant("Object.prototype.reactive");
    compliant(null, Object.prototype.reactive = function() {
        return _reactive(this);
    });

    /**
     * Proxy is implemented exotically, cannot be inherited and has no
     * prototype. Therefore, this unconventional way with a secret simulated
     * property that is used as an indicator for existing reactive objects
     * instances. The value is not programmatically constant, instead it is
     * defined with the start of the application.
     * https://stackoverflow.com/questions/37714787/can-i-extend-proxy-with-an-es2015-class
     */
    const _secret = Math.serial();

    /**
     * Weak map with the assignment of objects to proxies. The object is the key
     * and the proxy is the value. A feature of WeakMap is that when the key is
     * purged from the garbage collection, the value and thus the proxy is also
     * purged. Thus, this should be an efficient way to manage unbound proxies.
     */
    const _register = new WeakMap();

    /**
     * Shadow map for fast subscription lookup by recipient serial.
     * Proxy notifications are keyed by notification key and proxies are stored
     * in a WeakMap, so neither can be used to find or iterate a recipient's
     * subscriptions. The shadow map maps each serial to the recipient maps
     * containing that recipient: Map(serial, Set(recipients)). Since recipient
     * maps are also keyed by serial, subscriptions can be removed without
     * knowing the notification or key. Serials are used deliberately to avoid
     * keeping DOM references.
     */
    const _shadow = new Map();

    /** Registers the subscription of a recipient in the shadow map. */
    const _shadow_add = (serial, recipients) => {
        let entries = _shadow.get(serial);
        if (entries === undefined) {
            entries = new Set();
            _shadow.set(serial, entries);
        }
        entries.add(recipients);
    };

    /**
     * Removes all subscriptions of a recipient -- in the recipient maps of the
     * affected proxies as well as in the shadow map.
     */
    const _shadow_release = (serial) => {
        const entries = _shadow.get(serial);
        if (entries === undefined)
            return;
        _shadow.delete(serial);
        entries.forEach((recipients) =>
            recipients.delete(serial));
    };

    const _notify = (notifications, key) => {
        Composer.asynchronous((key, notifications) => {
            const recipients = notifications.get(key);
            if (!recipients)
                return;
            for (const recipient of recipients.values()) {
                // Fallback for receivers removed from the DOM without being
                // detected by EVENT_DOM_REMOVED.
                if (!document.body.contains(recipient))
                    _shadow_release(recipient.serial());
                else Composer.render(recipient);
            }
        }, key, notifications);
    };

    const _array_invalidate = (cache, notifications, length, previous) => {
        if (length >= previous)
            return;
        const removed = (key) => {
            if (typeof key !== "string")
                return false;
            const number = Number(key);
            return Number.isInteger(number)
                && number >= length
                && number < previous
                && String(number) === key;
        };
        for (const key of cache.keys())
            if (removed(key))
                cache.delete(key);
        // Reads made before the mutation may still be awaiting their
        // asynchronous subscription registration.
        Composer.asynchronous(() => {
            for (const key of notifications.keys())
                if (removed(key))
                    _notify(notifications, key);
        });
    };

    /**
     * Releases the subscriptions of a node and its children. Because the event
     * passes only the root nodes and implies the child nodes, the subtree must
     * be resolved. The uid of the serial is read directly and not determined
     * via serial(), because serial() assigns a new uid and so nodes without any
     * subscription would be needlessly initialized.
     */
    const _release = (node) => {
        const serial = node.uid;
        if (serial !== undefined)
            _shadow_release(serial);
        if (node.childNodes)
            Array.from(node.childNodes).forEach((node) =>
                _release(node));
    };

    // Subscriptions of removed DOM nodes become obsolete immediately and so
    // they are released with the removal and not only with a later update of a
    // reactive object. The event is fired after rendering and cleanup, moved
    // nodes are not affected, because they were not removed from the DOM.
    Composer.listen(Composer.EVENT_DOM_REMOVED, (event, nodes) =>
        nodes.forEach((node) => _release(node)));

    const _reactive = (object) => {

        if (typeof object !== "object"
                || object === null)
            return object;

        // Proxy remains proxy
        if (object[_secret] !== undefined)
            return object;

        // For all objects, a proxy must be created. Also for proxies, even if
        // proxy in proxy is prevented. Not internally, so it works recursively.
        // Endless loops are prevented with the register.

        if (_register.has(object))
            return _register.get(object);

        const proxy = new Proxy(object, {

            notifications: new Map(),

            cache: new Map(),

            get(target, key) {

                // Proxy is implemented exotically, cannot be inherited and has
                // no prototype. Therefore, this unconventional way with a
                // secret simulated property that is used as an indicator for
                // existing reactive object instances and also contains a
                // reference to the original object.
                if (key === _secret)
                    return target;

                try {

                    let value;

                    // Proxy receiver lets inherited getters track their reads
                    value = _selector ? Reflect.get(target, key, proxy) : target[key];

                    // Proxies are only used for objects, other data types are
                    // returned directly.
                    if (typeof value !== "object"
                            || value === null
                            || value instanceof Node
                            || value instanceof NodeList
                            || value instanceof HTMLCollection)
                        return value;

                    const descriptor = Object.getOwnPropertyDescriptor(target, key);
                    if (descriptor
                            && descriptor.configurable === false
                            && descriptor.writable === false)
                        return value;

                    // Proxy remains proxy
                    if (value[_secret] !== undefined)
                        return value;

                    // A proxy always returns proxies for objects. To decouple
                    // object, proxy and view and to avoid reference to object
                    // tree/level, loose proxies are used. The mapping is based
                    // only on objects not on object level via the register.
                    if (_register.has(value))
                        return _register.get(value)
                    return _reactive(value);

                    // To be economical with resources, proxies are not created
                    // for objects immediately, but only when they are requested
                    // via getter. Therefore, the properties for an object are
                    // not analyzed recursively.

                } finally {

                    // The registration is delayed so that the getting of values
                    // does not block unnecessarily.
                    const selector = _selector;
                    const inherited = selector !== null
                            && !Object.prototype.hasOwnProperty.call(target, key)
                            && key in target;
                    Composer.asynchronous((selector, key, notifications, inherited) => {

                        // Missing properties must also be tracked so that a
                        // later addition can update the rendered consumer.
                        // Inherited properties are not reactive dependencies.
                        if (selector === null
                                || inherited)
                            return;

                        const recipients = notifications.get(key) || new Map();

                        // If the selector as the current rendered element is
                        // already registered as a recipient, then the
                        // registration can be canceled.
                        if (recipients.has(selector.serial()))
                            return;

                        for (const recipient of recipients.values()) {

                            // If the selector as the current rendered element
                            // is already contained in a recipient as the
                            // parent, the selector as a recipient can be
                            // ignored, because the rendering is initiated by
                            // the parent and includes the selector as a child.
                            if (recipient.contains !== undefined
                                    && recipient.contains(selector))
                                return;

                            // If the selector as current rendered element
                            // contains a recipient as parent, the recipient can
                            // be removed, because the selector element will
                            // initiate rendering as parent in the future and
                            // the existing recipient will be rendered as child
                            // automatically.
                            if (selector.contains !== undefined
                                    && selector.contains(recipient))
                                recipients.delete(recipient.serial());
                        }

                        recipients.set(selector.serial(), selector);
                        notifications.set(key, recipients);
                        _shadow_add(selector.serial(), recipients);

                    }, selector, key, this.notifications, inherited);
                }
            },

            set(target, key, value) {

                // Proxy is implemented exotically, cannot be inherited and has
                // no prototype. Therefore, this unconventional way with a
                // secret simulated property that is used as an indicator for
                // existing reactive object instances and also contains a
                // reference to the original object and that can't be changed.
                if (key === _secret)
                    return true;

                // To decouple object, proxy and view, the original objects are
                // always used as value and never the proxies.
                if (typeof value === "object"
                        && value !== null
                        && value[_secret] !== undefined)
                    value = value[_secret];

                // To be economical with resources, proxies are not created for
                // objects immediately, but only when they are explicitly
                // requested via getter.

                // Arrays: An index beyond the end changes the length and a
                // shorter length removes indexes without calling a trap. Both
                // are detected by comparing the state before and after.
                const array = Array.isArray(target);
                const length = array ? target.length : 0;

                try {target[key] = value;
                } finally {

                    if (array && target.length !== length) {
                        _notify(this.notifications, "length");
                        _array_invalidate(this.cache, this.notifications, target.length, length);
                    }

                    // Unwanted recursions due to repeated value assignments:
                    // a = a / a = c = b = a must be avoided so that no infinite
                    // render cycle is initiated. The length of arrays is
                    // compared by its actual state instead.
                    if (!(array && key === "length")
                            && !(this.cache.has(key)
                                && this.cache.get(key) === value)) {
                        this.cache.set(key, value);
                        _notify(this.notifications, key);
                    }
                }

                return true;
            },

            deleteProperty(target, key) {
                const exists = Object.prototype.hasOwnProperty.call(target, key);
                const result = Reflect.deleteProperty(target, key);
                if (result && exists) {
                    this.cache.delete(key);
                    _notify(this.notifications, key);
                }
                return result;
            },

            defineProperty(target, key, descriptor) {
                const array = Array.isArray(target);
                const length = array ? target.length : 0;
                let result = false;
                try {
                    result = Reflect.defineProperty(target, key, descriptor);
                    if (result) {
                        this.cache.delete(key);
                        _notify(this.notifications, key);
                    }
                    return result;
                } finally {
                    if (array && target.length !== length) {
                        if (key !== "length" || !result)
                            _notify(this.notifications, "length");
                        _array_invalidate(this.cache, this.notifications, target.length, length);
                    }
                }
            }
        });

        // On the one hand, the register manages the unbound proxies, on the
        // other hand, it protects against endless recursions.
        _register.set(object, proxy);

        return proxy;
    };
})();