window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "composite"}));
const ModuleReturnCompositeLocal = {moduleReturnCompositeValue: "composite"};
expose(ModuleReturnCompositeLocal);