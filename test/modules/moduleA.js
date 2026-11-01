global.include("moduleB");
global.include("moduleB"); global.include("moduleB");
(global.include("moduleB"), global.include("moduleB"), global.include("moduleB"));

global.include("moduleA");
// io/moduleY does not exist.
// With the macro, a non-existent module causes an error, unlike when loading
// composites, where JS modules are optional.
try {global.include("io/moduleY");
} catch (error) {
    _error_collector.push(String(error));
}

if (window['moduleA$count'] === undefined)
    window['moduleA$count'] = 0;
window['moduleA$count'] = window['moduleA$count'] +1;
