#import io/material
#import io/xml
#import ui/text
#import ui/xml/table

/** Creation of the XML table for the selector #materials. */
const materials = new (class extends ui.xml.Table {

    /** Constants for the formatting of Density, PEI, TC, DRF */
    get FORMAT_DENSITY() {
        return {style:"decimal"};
    }
    get FORMAT_PEI() {
        return {style:"decimal"};
    }
    get FORMAT_TC() {
        return {style:"decimal", minimumFractionDigits:2, maximumFractionDigits:2};
    }
    get FORMAT_DRF() {
        return {style:"decimal"};
    }

    /**
     * Constructor for creating the XML table for a DOM element.
     * @param selector
     */
    constructor(selector) {
        super(selector);
    }
    
    /**
     * Sorts the data.
     * @param column
     * @param reverse
     */
    sort(column, reverse) {
        this.sorting = {column, reverse};
    }

    /**
     * Renders the output.
     * @return DocumentFragment
     */
    render() {
        return DataSource.transform(io.material.list(), "xslt://modules/materials.xslt", this.sorting || {});
    }
})("#materials");

#export materials;