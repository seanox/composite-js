// For the HTML element with the ID error, the browser automatically creates a
// corresponding HTML element in JavaScript. However, we want our own that uses
// Reactive so that we don't have to worry about updating the view.
const error = Reactive({
    message: null,
    exists() {
        return !!(this.message || "").trim();
    }
});

// Composite scripts use their own isolated module scope. Variables and
// constants that are created and used here are not accessible outside and must
// be exported for use in the global scope, using the #export macro.
#export error;

Composer.listen(Composer.EVENT_ERROR, function(event, error) {
    window.error.message = error.message;
});

Object.defineProperty(Array.prototype, "empty", {
    get() {
        return this.length <= 0;
    }
});