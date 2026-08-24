#import ui/spinner
#import ui/table

/**
 * Abstract Table base on XML for UI components.
 * The namespace ui.xml.Table is created at the end with the macro #export.
 */
const Table = class extends ui.Table {
    
    /**
     * Constructor for creating a table for a DOM element.
     * @param selector
     */
    constructor(selector) {
        super(selector);
    }
    
    /**
     * Preparing the table component when docking in the DOM.
     * The data is loaded initially. A spinner is displayed when loading.
     * The data is then rendered by XML transformation and inserted into the DOM.
     * The events for the sort function are registered with the insert.
     */
    dock() {

        ui.spinner.enabled();

        // Docking is synchronous, but loading is asynchronous.
        // This way the page does not block during initial loading and rendering.
        Composer.asynchronous(() => {

            // The data is loaded initially (if necessary).
            this.load();
            
            // The standard sorting is determined and applied.
            // To do this, the table must be rendered temporarily without
            // sorting so that the sortable fields can be determined.
            let sorting = null;
            let fragment = this.render();
            let nodes = Array.from(fragment.querySelectorAll("thead"));
            if (nodes.length <= 0)
                throw new Error("Invalid table structure: thead is missing");
            let column = fragment.querySelector("thead *.sortable.sortable-default[id]");
            if (column) {
                column = (column.getAttribute("id") || "").trim();
                if (column) {
                    sorting = {column, reverse:false}
                    this.sort(sorting.column, sorting.reverse);
                }
            }

            let output = table => {
                Composer.asynchronous(() => {
                    document.querySelector(table.selector).appendChild(table.render(), true);
                    Composer.asynchronous(() => {
                        // The table header is searched for sortable elements.
                        // These are all elements with the class attribute sortable.
                        // The default order is defined by sortable-default.
                        let nodes = Array.from(document.querySelectorAll(table.selector + " thead"));
                        if (nodes.length <= 0)
                            throw new Error("Invalid table structure: thead is missing");

                        const callback = (event) => {
                            if (event.type === "keydown"
                                    && event.key !== "Enter")
                                return;
                            if (!event.target
                                    || !event.target.hasAttribute("id")
                                    || !event.target.classList.contains("sortable"))
                                return;
                            let column = event.target;
                            if (!column || (column.getAttribute("id") || "").trim().length <= 0)
                                column = document.querySelector(table.selector + " thead *.sortable.sortable-default[id]");
                            if (!column)
                                return;
                            column = (column.getAttribute("id") || "").trim();
                            if (!column)
                                return;
                            if (!sorting
                                    || sorting.column != column)
                                sorting = {column, reverse:false}
                            else sorting.reverse = !sorting.reverse;
                            table.sort(sorting.column, sorting.reverse);
                            output(table);
                        };

                        // A keydown and click event listener is assigned to all
                        // detected elements. Both events trigger the sorting
                        // and re-rendering process.
                        for (let thead of nodes) {
                            thead.addEventListener("keydown", callback);
                            thead.addEventListener("click", callback);
                        }
                    });
                });
            };

            output(this);

            ui.spinner.disable();
        });
    }
}

#export Table@ui.xml;