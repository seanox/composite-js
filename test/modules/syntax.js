global.include("syntaxA");
global.include("syntax");

const x1 = () => {throw new Error("xxx");}

const _1 = tryout(() => xxx.xxx.xxx);
const _2 = tryout(() => x1());

global.expose({_1});
global.expose({_2});

const _3 = tryout(() => xxx.xxx.xxx);
const _4 = tryout(() =>  x1());
const _5 = tryout(() =>
    xxx.xxx.xxx);
const _6 = tryout(() =>
    x1());

global.expose({_3});
global.expose({_4});
global.expose({_5});
global.expose({_6});
