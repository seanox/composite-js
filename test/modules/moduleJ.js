// Modules are loaded only once.
// Even if an error occurs during the first call.
// Therefore, second calls must be ignored.
try {global.include("nix/nix/nix");
} catch (error) {
    _error_collector.push(String(error));
}

try {global.include("nix/nix/nix");
} catch (error) {
    _error_collector.push(String(error));
}

// Since the resource has already been called, this must run without error here,
// since the call is now ignored, even if the call was previously responded to
// with status 404.
global.include("nix/nix/nix");