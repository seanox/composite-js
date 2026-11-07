require("syntaxA");
require("syntaxB");
require("syntaxC");
require("syntaxD");
require("syntax");

const x1 = () => {throw new Error("xxx");}

const b1 = attempt(() => xxx.xxx.xxx);
const b2 = attempt(() => x1());

Object.assign(window, expose({b1}));
Object.assign(window, expose({b2}));
