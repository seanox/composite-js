/**
 * Spinner functions for UI components.
 * The namespace ui.spinner is created at the end with the macro #export.
 */
const spinner = {
    enabled() {
        const spinner = document.querySelector("#spinner\\@ui");
        spinner.setAttribute("enabled", "true");
    },
    disable() {
        const spinner = document.querySelector("#spinner\\@ui");
        if (spinner.hasAttribute("enabled"))
            spinner.removeAttribute("enabled");
    }
}

// The spinner is registered for the change from the URL hash.
//     see also https://github.com/seanox/composite-js/blob/master/manual/events.md#events
// As modules are only loaded once, we do not need to check anything else.

// Due to the reflow and repaint of the browser, a very early event such as
// popstate must be used for activation so that the changes to the spinner
// attribute take effect before the change from the hash.

// Because everything is very fast, you can use network throttling in the
// browser to see the spinner.

// The event popstate occurs when the active history entry changes, i.e. also
// when the link to the current page is clicked. In this case, rendering is not
// triggered and the EVENT_RENDER_END event does not occur. This is why the
// history change is activated when the spinner is enabled.
let location = window.location.hash;
window.addEventListener("popstate", (event) => {
    if (window.location.hash === location)
        return;
    spinner.enabled();
    location = window.location.hash;
});
Composer.listen(Composer.EVENT_RENDER_END, (event) => {
    Composer.asynchronous(() => {
        spinner.disable();
    });
});

#export spinner@ui;