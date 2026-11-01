global.include("moduleB");
(global.include("moduleB"), global.include("moduleB"));
(global.include("moduleB"), global.include("moduleB"), global.include("moduleB"));

global.include("io/moduleX");
  
global.include("moduleC");
// io/moduleY does not exist.
// With the macro, a non-existent module causes an error, unlike when loading
// composites, where JS modules are optional.
try {global.include("io/moduleY");
} catch (error) {
    _error_collector.push(String(error));
}

if (window['moduleC$count'] === undefined)
    window['moduleC$count'] = 0;
window['moduleC$count'] = window['moduleC$count'] +1;
