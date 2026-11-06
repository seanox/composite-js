window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "parent"}));
const child = require("module-return/child");
expose({parentValue: "parent", child});
