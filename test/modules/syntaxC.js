require("syntaxA");
require("syntaxB");
require("syntaxC");
require("syntaxD");
require("syntax");

const x1 = () => {throw new Error("xxx");}

const c1 = attempt(() => xxx.xxx.xxx);
const c2 = attempt(() => x1());

Object.assign(window, expose({c1}));
Object.assign(window, expose({c2}));
