"use strict";

const fs = require("node:fs");
const {isIP} = require("node:net");
const http = require("node:http");
const path = require("node:path");

const STATUS_OK = Object.freeze([200, "OK"]);
const STATUS_BAD_REQUEST = Object.freeze([400, "Bad request"]);
const STATUS_NOT_FOUND = Object.freeze([404, "Not found"]);
const STATUS_METHOD_NOT_ALLOWED = Object.freeze([405, "Method not allowed"]);
const STATUS_INTERNAL_SERVER_ERROR = Object.freeze([500, "Internal server error"]);

const DEFAULT_DOCUMENT = "index.html";
const DEFAULT_PROTOCOL = "http";
const DEFAULT_ADDRESS = "127.0.0.1";
const DEFAULT_PORT = 8000;

const isLoopbackAddress = address => typeof address === "string"
        && (address === "localhost"
                || address === "::1"
                || (isIP(address) === 4
                        && Number(address.split(".")[0]) === 127));

const isValidDefaultDocument = document => typeof document === "string"
        && /^[\w.-]+$/.test(document)
        && document !== "."
        && document !== "..";

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xsl": "application/xslt+xml; charset=utf-8",
    ".xslt": "application/xslt+xml; charset=utf-8",
    ".xml": "application/xml; charset=utf-8"
};

const isWithin = (directory, file) => {
    const relative = path.relative(directory, file);
    return relative === ""
            || (!relative.startsWith(`..${path.sep}`)
                    && relative !== ".."
                    && !path.isAbsolute(relative));
};

const respond = (request, response, [status, message], headers = {}) => {
    const content = Buffer.from(message);
    response.writeHead(status, message, {
        "Content-Length": content.length,
        "Content-Type": "text/plain; charset=utf-8",
        ...headers
    });
    response.end(request.method === "HEAD" ? undefined : content);
};

const serveFile = async (request, response, root, pathname, defaultDocument) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.includes("..")
            || pathname.includes("\\")
            || pathname.includes("\0"))
        return respond(request, response, STATUS_NOT_FOUND);

    let file = path.resolve(root, ...segments);
    if (!isWithin(root, file))
        return respond(request, response, STATUS_NOT_FOUND);

    let details;
    try {
        details = await fs.promises.stat(file);
        if (details.isDirectory()) {
            file = path.join(file, defaultDocument);
            details = await fs.promises.stat(file);
        }
    } catch (error) {
        if (error.code === "ENOENT"
                || error.code === "ENOTDIR")
            return respond(request, response, STATUS_NOT_FOUND);
        throw error;
    }

    if (!details.isFile())
        return respond(request, response, STATUS_NOT_FOUND);

    file = await fs.promises.realpath(file);
    if (!isWithin(root, file))
        return respond(request, response, STATUS_NOT_FOUND);

    response.writeHead(...STATUS_OK, {
        "Content-Length": details.size,
        "Content-Type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Last-Modified": details.mtime.toUTCString()
    });
    if (request.method === "HEAD")
        return response.end();

    const stream = fs.createReadStream(file);
    stream.once("error", error => {
        console.error(`[server] ${error.message}`);
        if (response.headersSent)
            response.destroy();
        else respond(request, response, STATUS_INTERNAL_SERVER_ERROR);
    });
    stream.pipe(response);
};

const createServer = ({
    root,
    virtualMapping = {},
    defaultDocument = DEFAULT_DOCUMENT,
    protocol = DEFAULT_PROTOCOL,
    address = DEFAULT_ADDRESS,
    port = DEFAULT_PORT
} = {}) => {
    if (!isValidDefaultDocument(defaultDocument))
        throw new TypeError("Invalid default document");
    if (!isLoopbackAddress(address))
        throw new Error("Invalid server address");
    if (protocol !== "http")
        throw new Error("Invalid server protocol");
    if (!Number.isInteger(port) || port < 0 || port > 65535)
        throw new Error("Invalid server port");
    const directory = root ? fs.realpathSync(root) : null;
    if (!virtualMapping || typeof virtualMapping !== "object" || Array.isArray(virtualMapping))
        throw new TypeError("Invalid virtual mapping object");
    for (const [route, page] of Object.entries(virtualMapping))
        if (!route.startsWith("/")
                || (typeof page !== "string"
                        && typeof page !== "function"))
            throw new TypeError("Invalid virtual mapping");

    const handleError = (request, response, error) => {
        console.error(`[server] ${error.stack || error}`);
        if (!response.headersSent)
            respond(request, response, STATUS_INTERNAL_SERVER_ERROR);
        else response.destroy();
    };

    return http.createServer((request, response) => {
        if (request.method !== "GET"
                && request.method !== "HEAD")
            return respond(request, response, STATUS_METHOD_NOT_ALLOWED, {Allow: "GET, HEAD"});

        let pathname;
        try {
            const queryStart = request.url.indexOf("?");
            const requestPath = queryStart < 0 ? request.url : request.url.slice(0, queryStart);
            if (!requestPath.startsWith("/"))
                return respond(request, response, STATUS_BAD_REQUEST);
            pathname = decodeURIComponent(requestPath);
        } catch {
            return respond(request, response, STATUS_BAD_REQUEST);
        }

        if (Object.hasOwn(virtualMapping, pathname)) {
            const page = virtualMapping[pathname];
            if (typeof page === "function")
                return Promise.resolve().then(() => page(request, response))
                    .catch(error => handleError(request, response, error));
            response.writeHead(...STATUS_OK, {
                "Content-Length": Buffer.byteLength(page),
                "Content-Type": contentTypes[path.extname(pathname)] || "application/octet-stream"
            });
            return response.end(request.method === "HEAD" ? undefined : page);
        }

        if (!directory)
            return respond(request, response, STATUS_NOT_FOUND);

        serveFile(request, response, directory, pathname, defaultDocument)
            .catch(error => handleError(request, response, error));
    });
};

module.exports = {
    createServer,
    DEFAULT_DOCUMENT,
    DEFAULT_PROTOCOL,
    DEFAULT_ADDRESS,
    DEFAULT_PORT
};
