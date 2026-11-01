global.include("syntaxA");
global.include("syntaxB");
global.include("syntaxC");
global.include("syntaxD");
global.include("syntax");

const x1 = () => {throw new Error("xxx");}

const c1 = tryout(() => xxx.xxx.xxx);
const c2 = tryout(() => x1());

global.expose({c1});
global.expose({c2});
