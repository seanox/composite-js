window.dispatchEvent(new CustomEvent("moduleReturnExecution", {detail: "loaded"}));
expose({moduleReturnLoadedValue: "direct"});
