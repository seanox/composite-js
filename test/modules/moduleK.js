// The module is executed in a separate function scope.
// Without an explicit #export, moduleE is not added to the global scope and is
// therefore not accessible from outside this module.
moduleE = {
    test: "E"
};
