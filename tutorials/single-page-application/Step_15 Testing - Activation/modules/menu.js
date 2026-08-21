// Modules (Composite-JavaScript) use their own scope. Variables and constants
// created and used here are not accessible outside and must be exported for use
// in the global scope, for which the macro #export is used.
//
// The JavaScript models correspond to the DOM hierarchy and are based on the
// declared ID attributes: #menu -> #language -> event(s)
const menu = {
    language: {
        onClick(event) {
            DataSource.localize(event.target.id);
        }
    }
}

#export menu;