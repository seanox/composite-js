const exampleE_A1 = "A-AAA";
const exampleE_A2 = {value: "A-BBB"};
const exampleE_A3 = () => {return "A-CCC";};
const exampleE_A4 = "A-DDD";
const exampleE_A5 = "A-EEE";
global.expose(exampleE_A1, "exampleE_A1");
global.expose({exampleE_A2});
global.expose(exampleE_A5, "b.c.d.exampleE_A5");
global.expose(exampleE_A1, "a.b.c.exampleE_A1");

const exampleX_01 = "123\"" + 456 + "789\"";
const exampleX_02 = "123\'" + 456 + "789\'";
const exampleX_03 = "123\"" + 456 + "789\'";
const exampleX_04 = "123\'" + 456 + "789\"";
global.expose(exampleX_01, "exampleX_01");
global.expose({exampleX_02});
global.expose(exampleX_03, "exampleX_03");
global.expose({exampleX_04});

if (true)
    global.expose({exampleE_A3});
if (false)
    global.expose({exampleE_A4});

let exampleE_B1 = "B-AAA";
let exampleE_B2 = {value: "B-BBB"};
let exampleE_B3 = () => {return "B-CCC";};

global.expose({exampleE_B1});
global.expose({exampleE_B2});
global.expose({exampleE_B3});

try {
    global.expose({exampleE_C1});
    global.expose({exampleE_C2});
    global.expose({exampleE_C3});
} catch (error) {
    document.body.innerHTML += "\nX: " + error;
}
