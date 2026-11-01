global.include("syntaxA");
global.include("syntaxB");
global.include("syntaxC");
global.include("syntaxD");
global.include("syntax");

const x1 = () => {throw new Error("xxx");}

const d1 = tryout(() => xxx.xxx.xxx);
const d2 = tryout(() => x1());

global.expose({d1});
global.expose({d2});
