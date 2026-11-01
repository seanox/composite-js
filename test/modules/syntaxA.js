global.include("syntaxA");
global.include("syntax");

const x1 = () => {throw new Error("xxx");}

const a1 = tryout(() => xxx.xxx.xxx);
const a2 = tryout(() => x1());

global.expose({a1});
global.expose({a2});
