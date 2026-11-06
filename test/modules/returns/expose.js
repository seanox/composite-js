window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "expose"}));
const moduleReturnHidden = "private";
const ModuleReturnLocal = {
    moduleReturnValue: 42,
    nested: {count: 1},
    describe() {return "exported module";}
};
expose(ModuleReturnLocal);
({ignored: true});