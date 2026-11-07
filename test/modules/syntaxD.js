require("syntaxA");
require("syntaxB");
require("syntaxC");
require("syntaxD");
require("syntax");

const x1 = () => {throw new Error("xxx");}

const d1 = attempt(() => xxx.xxx.xxx);
const d2 = attempt(() => x1());

Object.assign(window, expose({d1}));
Object.assign(window, expose({d2}));
