const moduleA = {
    test: "A"
};

var moduleB = {
    test: "B"
};

let moduleC = {
    test: "C"
};

window["moduleF"] = {
    test: "F"
};

Namespace.use()["moduleG"] = {
    test: "G"
};

Namespace.use("moduleH");
