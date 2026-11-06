window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "parent"}));
const child = require("return/child");
expose({parentValue: "parent", child});
