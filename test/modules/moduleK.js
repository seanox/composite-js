// The module is executed in a separate function scope.
// Without an explicit #export, moduleE remains local to that execution and is
// not added to the global (window) scope or accessible from outside this module.
moduleE = {
    test: "E"
};
