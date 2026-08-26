// Composite scripts are executed in an isolated module scope. Variables and
// constants created and used here are not accessible outside and must be
// exported for use in the global scope, for which the macro #export is used.
//
// The application module contact is used reactively. Thus, elements consuming
// in the view are automatically updated with changes to the values of the
// contact object and the deliberate call from the composer, e.g. with the
// attribute render is not necessary.
const contact = ({

    name: null,
    email: null,
    subject: null,
    comment: null,

    locationLink: {
        onClick(event) {
            alert("click event on ${event.target.id}");
            return false;
        }
    },
    phoneLink: {
        onClick() {
            alert("click event on ${event.target.id}");
            return false;
        }
    },
    mailLink: {
        onClick() {
            alert("click event on ${event.target.id}");
            return false;
        }
    }
}).reactive();

#export contact;