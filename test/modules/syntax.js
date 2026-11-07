require("syntaxA");
require("syntax");

const x1 = () => {throw new Error("xxx");}

const _1 = attempt(() => xxx.xxx.xxx);
const _2 = attempt(() => x1());

Object.assign(window, expose({_1}));
Object.assign(window, expose({_2}));

const _3 = attempt(() => xxx.xxx.xxx);
const _4 = attempt(() =>  x1());
const _5 = attempt(() =>
    xxx.xxx.xxx);
const _6 = attempt(() =>
    x1());

Object.assign(window, expose({_3}));
Object.assign(window, expose({_4}));
Object.assign(window, expose({_5}));
Object.assign(window, expose({_6}));
