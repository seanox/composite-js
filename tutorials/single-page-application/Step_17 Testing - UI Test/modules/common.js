// Because the modules are loaded at runtime and only when used, they are not
// normally shown as a source in the browser development tools. But for
// debugging this is mandatory. The console output can also offer an entry
// point. This also uses the macro #module and writes the following text to the
// console. The source of the output can then become in the development tool and
// supports debugging in the usual way. If necessary, the console output in the
// browser must be set to the "Verbose" level so that console.debug is output.
#module common;

/**
 * Forced redirection to #home for invalid paths. The subsequent is important
 * because the render process is not yet complete at this point and the targets
 * in the DOM do not yet exist, which means that Routing.locate(path) may not
 * yet be able to locate anything.
 */
Routing.customize("#", (oldHash, newHash) => {
    Composite.asynchronous((path) => {
        const locate = Routing.locate(path);
        if (locate == null
                || locate === "#")
            Routing.route("#home");
    }, newHash);
});

/**
 * Creates an object based on data-structures.
 * The method is intended for deserialization.
 * Supported data types: XMLDocument / Node
 * @param  data
 * @return the created object
 */
compliant("Object.parse");
compliant(null, Object.parse = (data) => {

    let append = (object, name, value) => {
        if (value === null)
            return;
        if (object[name]) {
            if (object[name].constructor != Array)
                object[name] = [object[name]];
            object[name][object[name].length] = value;
        } else object[name] = value;
    };

    if (data instanceof Node) {

        if (data.nodeType == 9)
            return Object.parse(data.documentElement);
        if (data.nodeType != 1)
            return null;

        let meta = {text:null, data:null};
        for (let node of data.childNodes) {
            if (node.nodeType == 1) {
                meta = false;
                break;
            } else if (node.nodeType == 3) {
                meta.text = (meta.text || "") + node.nodeValue;
            } else if (node.nodeType == 4) {
                meta.data = (meta.data || "") + node.nodeValue;
            }
        }

        if (meta && meta.data != null)
            return meta.data;
        if (meta && meta.text != null)
            return meta.text;

        let object = {};
        for (let attribute of data.attributes)
            append(object, attribute.name, attribute.value);
        for (let child of data.childNodes)
            append(object, child.nodeName, Object.parse(child));
        return object;
    }

    throw new TypeError("Unsupported data type");
});

// UI test is loaded as a module
#import test;