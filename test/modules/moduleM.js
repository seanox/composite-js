const exampleE_A1 = "A-AAA";
const exampleE_A2 = {value: "A-BBB"};
const exampleE_A3 = () => {return "A-CCC";};
expose({exampleE_A1, exampleE_A2, exampleE_A3});
expose({exampleE_A1}, "exampleE_A1");

const moduleM = {
    exampleE_A1,
    exampleE_A2,
    exampleE_A3,
    exampleX_01: "123\"" + 456 + "789\'"
};
expose(moduleM, "moduleM");
expose(moduleM, "a.b.c");
