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
 * 
 *     DESCRIPTION
 *     ----
 * (Resource)Messages is a static DataSource extension for internationalization
 * and localization, based on key-value/label-value data in the locales.xml of
 * the DataSource. After loading, the labels are available as associative array
 * Messages and as object tree messages (the dot in the keys is the indicator of
 * the levels in the tree). Messages is always available; messages exists when
 * labels are loaded.
 *
 * see also: https://seanox.github.io/composite-js/manuals/message.html
 */
(() => {

    "use strict";

    compliant("messages");
    compliant(null, window.messages = {});
    compliant("Messages");
    compliant(null, window.Messages = {});

    const _datasource = [DataSource.data];

    const _localize = DataSource.localize;

    const _load = (data) => {
        const map = new Map();
        const xpath = "/locales/" + DataSource.locale + "/label";
        const result = data.evaluate(xpath, data, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        for (let node; node = result.iterateNext();) {
            const key = (node.getAttribute("key") || "").trim();
            if (!map.has(key)) {
                const value = ((node.getAttribute("value") || "").trim()
                    || (node.textContent || "").trim()).unescape();
                map.set(key, value);
            }
        }
        new Map([...map.entries()].sort()).forEach((value, key) => {
            const match = key.match(/^(?:((?:\w+\.)*\w+)\.)*(\w+)$/);
            if (match) {
                // In order for the object tree to branch from each level, each
                // level must be an object. Therefore, an anonymous object is
                // used for the level, which returns the actual text via
                // Object.prototype.toString().
                const namespace = "messages" + (match[1] ? "." + match[1] : "");
                if (!Namespace.exists(namespace, match[2]))
                    Object.defineProperty(Namespace.use(namespace), match[2], {
                        value: {toString() {return value;}}
                    });
                if (!Namespace.exists("Messages", key))
                    Object.defineProperty(Namespace.use("Messages"), key, {
                        value
                    });
            }
        });
    };

    DataSource.localize = (locale) => {

        _localize(locale);

        delete window.messages;
        delete window.Messages;

        window.Messages = {
            populate(label, ...values) {
                let text = Messages[label] || "";
                for (let index = 0; index < values.length; index++)
                    text = text.replace(new RegExp("\\{" + index + "\\}", "g"), values[index]);
                return text.replace(/\{\d+\}/g, "");
            }
        }

        _datasource.forEach(data => _load(data));
    };

    // Messages are based on DataSources. To initialize, DataSource.localize()
    // must be overwritten and loading of the key-value pairs is embedded.
    if (DataSource.data
            && DataSource.locale
            && DataSource.locales
            && DataSource.locales.includes(DataSource.locale))
        DataSource.localize(DataSource.locale);

    Composer.listen(Composer.EVENT_MODULE_LOAD, (event, context, module) => {
        const request = new XMLHttpRequest();
        request.open("GET", Composer.MODULES + "/" + module + ".xml", false);
        request.send();
        if (request.status !== 200)
            return;
        const data = new DOMParser().parseFromString(request.responseText,"application/xml");
        _datasource.push(data);
        _load(data);
   });
})();