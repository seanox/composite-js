window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "child"}));
expose({moduleReturnChildValue: "child"});
