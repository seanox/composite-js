require("moduleB");
(require("moduleB"), require("moduleB"));
(require("moduleB"), require("moduleB"), require("moduleB"));

require("moduleC");
  
require("moduleB");
// io/moduleY does not exist.
// With the macro, a non-existent module causes an error, unlike when loading
// composites, where JS modules are optional.
try {require("io/moduleY");
} catch (error) {
    _error_collector.push(String(error));
}

if (window['moduleB$count'] === undefined)
    window['moduleB$count'] = 0;
window['moduleB$count'] = window['moduleB$count'] +1;
