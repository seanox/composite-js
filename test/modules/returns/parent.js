window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "parent"}));
const child = require("returns/child");
expose({parentValue: "parent", child});
