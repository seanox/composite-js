global.include("syntaxA");
global.include("syntaxB");
global.include("syntaxC");
global.include("syntaxD");
global.include("syntax");

const x1 = () => {throw new Error("xxx");}

const b1 = tryout(() => xxx.xxx.xxx);
const b2 = tryout(() => x1());

global.expose({b1});
global.expose({b2});
