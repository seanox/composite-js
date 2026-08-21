/**
 * Utilities for XML interfaces.
 * The namespace io.xml is created at the end with the macro #export.
 */
const xml = {
        
    /**
     * Creates a JavaScript data object based on an XMLDocument or Node.
     * @param  data
     * @return the create JavaScript data object
     */
    deserialize(data) {

        let append = (name, value) => {
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
                return deserialize(data.documentElement);   
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
                append(attribute.name, attribute.value);
            for (let child of data.childNodes)
                append(child.nodeName, deserialize(child));
            return object;
        }
        
        throw new TypeError("Unsupported data type");            
    }
}

#export xml@io;