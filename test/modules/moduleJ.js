// Modules are loaded only once.
// Even if an error occurs during the first call.
// Therefore, second calls must be ignored.
try {require("nix/nix/nix");
} catch (error) {
    _error_collector.push(String(error));
}

try {require("nix/nix/nix");
} catch (error) {
    _error_collector.push(String(error));
}

// Since the resource has already been called, this must run without error here,
// since the call is now ignored, even if the call was previously responded to
// with status 404.
require("nix/nix/nix");