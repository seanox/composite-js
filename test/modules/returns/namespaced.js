window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "namespaced"}));
const ModuleReturnNamespaced = {
    moduleReturnNamedValue: 7,
    nested: {count: 1}
};
expose(ModuleReturnNamespaced, "ModuleReturnPublication.branch");
({ignored: true});
