/**
 * I/O interfaces and functions for UI components.
 * The namespace ui.io is created at the end with the macro #export.
 */
const io = {

    /**
     * Creates a download for a BLOB that was created at runtime.
     * @param blob
     * @param filename
     */    
    save(blob, filename) {
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        window.setTimeout((link) => {
            const event = new MouseEvent("click", {
                bubbles:false, cancelable:true});
            link.dispatchEvent(event);
        }, 0, link);
    }            
}

#export io@ui;