(() => {
    "use strict";

    let pending = null;

    const observe = (event, selector) => {
        const measurement = pending;
        if (!measurement || measurement.event !== event)
            return;
        const nodes = Array.isArray(selector) ? selector : [selector];
        if (!nodes.some(node => node instanceof Node
                && (node === measurement.root || measurement.root.contains(node))))
            return;

        measurement.end = performance.now();
        window.clearTimeout(measurement.quiet);
        // Let queued renders and MutationObserver cleanup finish before
        // checking the DOM. The task boundary itself is not part of the
        // measured time.
        measurement.quiet = window.setTimeout(() => {
            try {
                measurement.verify();
                measurement.finish(null, measurement.end - measurement.start);
            } catch (error) {
                measurement.finish(error);
            }
        }, 0);
    };

    Composer.listen(Composer.EVENT_RENDER_END, observe);
    Composer.listen(Composer.EVENT_DOM_REMOVED, observe);

    window.Benchmark = {
        measure(root, action, verify, event = Composer.EVENT_RENDER_END) {
            if (pending)
                throw new Error("Overlapping benchmark measurements");
            return new Promise((resolve, reject) => {
                const measurement = {root, event, verify};
                measurement.finish = (error, elapsed) => {
                    window.clearTimeout(measurement.timeout);
                    window.clearTimeout(measurement.quiet);
                    pending = null;
                    if (error)
                        reject(error);
                    else resolve(elapsed);
                };
                measurement.timeout = window.setTimeout(() =>
                    measurement.finish(new Error("Benchmark timed out waiting for " + event)), 30000);
                pending = measurement;
                measurement.start = performance.now();
                try {action();
                } catch (error) {
                    measurement.finish(error);
                }
            });
        },

        remove(root) {
            return this.measure(root, () => root.remove(), () =>
                Assert.assertFalse(root.isConnected), Composer.EVENT_DOM_REMOVED);
        },

        items(count, offset = 0) {
            return Array.from({length: count}, (_, index) => ({value: offset + index}));
        },

        verifyItems(root, count, expected) {
            const items = root.querySelectorAll("span");
            Assert.assertEquals(count, items.length);
            items.forEach((item, index) =>
                Assert.assertEquals(String(expected(index)), item.textContent));
        },

        async cycle(state, count) {
            const root = document.createElement("div");
            root.style.display = "none";
            root.innerHTML = "<span>{{state.value}}</span>".repeat(count);
            try {
                const mount = await this.measure(root, () => document.body.appendChild(root),
                    () => this.verifyItems(root, count, () => state.value));
                const update = await this.measure(root, () => state.value++,
                    () => this.verifyItems(root, count, () => state.value));
                const remove = await this.remove(root);
                return {mount, update, remove};
            } finally {
                if (root.isConnected)
                    await this.remove(root);
            }
        },

        report(name, elapsed) {
            Assert.assertTrue(Number.isFinite(elapsed) && elapsed >= 0);
            const message = `Benchmark: ${elapsed.toFixed(0)} ms (${name})`;
            console.log(message);
            document.querySelector("#duration").appendChild(
                document.createTextNode(message + "\n"));
        },

        run(callback) {
            Test.activate();
            window.addEventListener("load", () => {
                window.setTimeout(async () => {
                    let failure = null;
                    try {await callback();
                    } catch (error) {
                        failure = error;
                        document.querySelector("#duration").textContent = "ERROR: " + error.message;
                    }
                    Test.create({test() {
                        if (failure)
                            throw failure;
                    }});
                    Test.start();
                }, 0);
            }, {once: true});
        }
    };
})();
