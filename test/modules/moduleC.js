require("moduleB");
(require("moduleB"), require("moduleB"));
(require("moduleB"), require("moduleB"), require("moduleB"));

require("io/moduleX");
  
require("moduleC");
// io/moduleY does not exist.
// With the macro, a non-existent module causes an error, unlike when loading
// composites, where JS modules are optional.
try {require("io/moduleY");
} catch (error) {
    _error_collector.push(String(error));
}

if (window['moduleC$count'] === undefined)
    window['moduleC$count'] = 0;
window['moduleC$count'] = window['moduleC$count'] +1;
