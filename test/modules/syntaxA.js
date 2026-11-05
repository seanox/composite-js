require("syntaxA");
require("syntax");

const x1 = () => {throw new Error("xxx");}

const a1 = attempt(() => xxx.xxx.xxx);
const a2 = attempt(() => x1());

Object.assign(window, expose({a1}));
Object.assign(window, expose({a2}));
