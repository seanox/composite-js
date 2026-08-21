/**
 * Text functions for UI components.
 * The namespace ui.text is created at the end with the macro #export.
 */
const text = {
        
    /**
     * Formatted according to the data type and the currently used language
     * setting. Optionally a meta object can be passed to the style, e.g. for
     * formatting numbers (decimal places, precision, ...).
     * @param value
     * @param style
     */    
    format(value, style) {
        if (!isNaN(value))
            return new Intl.NumberFormat(DataSource.locale, style).format(value);
        return String(value);
    }        
}

#export text@ui;