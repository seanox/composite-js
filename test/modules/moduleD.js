const moduleA = {
    test: "A"
};

var moduleB = {
    test: "B"
};

let moduleC = {
    test: "C"
};

Object.use(window, "moduleF", {
    test: "F"
});

Object.use(window, "moduleG", {
    test: "G"
});

Object.use(window, "moduleH");
