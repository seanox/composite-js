const a = Reactive({
    text: {
        value: "-a-"
    }
});

global.expose(a, "nsX.a");
