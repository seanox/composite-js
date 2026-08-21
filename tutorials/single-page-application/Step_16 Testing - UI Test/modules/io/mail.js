const mail = {
    send(meta) {
        const mail = `mailto:${meta.recipient}`
            + `?cc=${meta.sender}`
            + `&subject=${encodeURIComponent((meta.subject || "").trim())}`
            + `&body=${encodeURIComponent((meta.content || "").trim())}`;
        const iframe = document.createElement("iframe");
        iframe.src = mail;
        const workspace = document.getElementById("workspace");
        workspace.appendChild(iframe);
        setTimeout(() => {
            workspace.innerHTML = "";
        }, 250);
    }
}

// Modules all have their own private scope of validity. They must be made
// known in the global scope of validity so that they can be used externally.
// The macro #export is used for this purpose. As an argument, the name of the
// object to be exported is required. Optionally, a namespace under which the
// object is to be made known can be defined by separating it with the @ symbol.
//    see also https://github.com/seanox/aspect-js/blob/master/manual/scripting.md#export
#export mail@io;