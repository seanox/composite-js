"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const v8ToIstanbul = require("v8-to-istanbul");
const {mergeScriptCovs} = require("@bcoe/v8-coverage");
const MagicString = require("magic-string");
const {Bundle} = MagicString;

const _readSourceMapMetaInfo = (coverageFile) => {
    const content = fs.readFileSync(coverageFile, "utf8");
    const get = (name) => {
        const match = content.match(
            new RegExp(`^\\s*//#\\s*${name}=(.*)$`, "m")
        );
        return match?.[1]?.trim() ?? null;
    };
    return {
        source: path.resolve(coverageFile),
        url: get("sourceMappingURL"),
        directory: get("sourceMappingDirectory"),
        files: (get("sourceMappingFiles") ?? "")
            .split(/\s+/)
            .filter(Boolean)
    };
};

const _createSourceMap = (coverageMetaInfo) => {
    const bundle = new Bundle({separator: ""});
    for (const file of coverageMetaInfo.files) {
        const sourcePath = path.resolve(coverageMetaInfo.directory, file);
        const content = fs.readFileSync(sourcePath, "utf8");
        bundle.addSource({
            filename: path.relative(coverageMetaInfo.directory, sourcePath).split(path.sep).join("/"),
            content: new MagicString(content),
        });
    }
    const map = bundle.generateMap({
        file: path.basename(coverageMetaInfo.source),
        includeContent: true,
        hires: true,
    });
    const mappingFile = path.resolve(
        path.dirname(coverageMetaInfo.source),
        coverageMetaInfo.url
    );
    const sourceMap = JSON.parse(map.toString());
    sourceMap.sources = sourceMap.sources.map(source =>
        path.resolve(coverageMetaInfo.directory, source).split(path.sep).join("/"));
    fs.writeFileSync(mappingFile, JSON.stringify(sourceMap));
    return sourceMap;
};

const _mergeCoverageEntries = entries => {
    const scripts = new Map();
    for (const entry of entries) {
        if (typeof entry.source !== "string")
            throw new Error("Missing JavaScript source in coverage entry");
        let captures = scripts.get(entry.source);
        if (!captures) {
            captures = [];
            scripts.set(entry.source, captures);
        }
        captures.push(entry);
    }
    return [...scripts.entries()].map(([source, captures]) => ({
        source,
        functions: mergeScriptCovs(captures).functions
    }));
};

const _countCoverage = counts => {
    const values = Object.values(counts).flat();
    const covered = values.filter(count => count > 0).length;
    return {
        covered,
        total: values.length
    };
};

const _formatCoverage = ({covered, total}) => total > 0
    ? `${covered}/${total} (${(covered / total * 100).toFixed(1)}%)` : "n/a";

const _createCoverageMarkdown = coverage => {
    const files = Object.entries(coverage).map(([source, report]) => ({
        source,
        lines: _countCoverage(report.s),
        functions: _countCoverage(report.f),
        branches: _countCoverage(report.b)
    }));
    const total = files.reduce((result, file) => {
        for (const metric of ["lines", "functions", "branches"]) {
            result[metric].covered += file[metric].covered;
            result[metric].total += file[metric].total;
        }
        return result;
    }, {
        lines: {covered: 0, total: 0},
        functions: {covered: 0, total: 0},
        branches: {covered: 0, total: 0}
    });
    const rows = files.map(file =>
        `| \`${path.basename(file.source).replace(/`/g, "\\`").replace(/\|/g, "\\|")}\` `
            + `| ${_formatCoverage(file.lines)} `
            + `| ${_formatCoverage(file.functions)} `
            + `| ${_formatCoverage(file.branches)} |`
    );
    return [
        "# Code Coverage",
        "",
        "| Source | Lines | Functions | Branches |",
        "| --- | ---: | ---: | ---: |",
        `| __Total__ | ${_formatCoverage(total.lines)} `
            + `| ${_formatCoverage(total.functions)} `
            + `| ${_formatCoverage(total.branches)} |`,
        ...rows,
        "",
        "Lines are derived from V8 coverage and include comments and blank lines.",
        ""
    ].join(os.EOL);
};

const _createCoverageLcov = report => {
    const records = [];
    for (const file of Object.values(report)) {
        // PROJECT-SPECIFIC WORKAROUND: The execution/working directory is
        // ./test and is relative to the project root, as is the ./source
        // directory. The problem is that codecov requires relative paths to the
        // project root in the LCOV file, but the runner is running in the test
        // directory.
        records.push("TN:", `SF:${file.path.split(path.sep).slice(-2).join(path.sep)}`);
        const functions = Object.entries(file.fnMap).map(([id, functionMapping]) => ({
            name: `${functionMapping.name || "(anonymous)"}_${id}`.replace(/[\r\n]+/g, " "),
            line: functionMapping.decl.start.line,
            count: file.f[id]
        }));
        for (const fn of functions)
            records.push(`FN:${fn.line},${fn.name}`);
        for (const fn of functions)
            records.push(`FNDA:${fn.count},${fn.name}`);
        records.push(
            `FNF:${functions.length}`,
            `FNH:${functions.filter(fn => fn.count > 0).length}`
        );
        const lines = {};
        for (const [id, statement] of Object.entries(file.statementMap)) {
            const line = statement.start.line;
            lines[line] = Math.max(lines[line] ?? 0, file.s[id]);
        }
        for (const [line, count] of Object.entries(lines))
            records.push(`DA:${line},${count}`);
        records.push(
            `LF:${Object.keys(lines).length}`,
            `LH:${Object.values(lines).filter(count => count > 0).length}`
        );
        let branchesFound = 0;
        let branchesHit = 0;
        for (const [id, branch] of Object.entries(file.branchMap)) {
            for (const [index, count] of file.b[id].entries()) {
                records.push(`BRDA:${branch.line},${id},${index},${count}`);
                branchesFound++;
                if (count > 0)
                    branchesHit++;
            }
        }
        records.push(`BRF:${branchesFound}`, `BRH:${branchesHit}`, "end_of_record");
    }
    return records.concat("").join(os.EOL);
};

const _createCoverageReport = async (coverageFile, coverageMetaInfo, sourceMap) => {
    const entries = JSON.parse(fs.readFileSync(coverageFile, "utf8"));
    const result = {};
    for (const entry of _mergeCoverageEntries(entries)) {
        const converter = v8ToIstanbul(coverageMetaInfo.source, 0, {
            source: entry.source,
            sourceMap: {sourcemap: sourceMap}
        });
        await converter.load();
        converter.applyCoverage(entry.functions);
        Object.assign(result, converter.toIstanbul());
    }
    return result;
};

const createCoverageRecorder = (engine, coverageFile) => {
    if (String(engine).toLowerCase() !== "blink")
        return;
    if (!coverageFile
            || !fs.existsSync(coverageFile)
            || !fs.statSync(coverageFile).isFile())
        return;
    const coverageMetaInfo = _readSourceMapMetaInfo(coverageFile);
    if (!coverageMetaInfo.url
            || !coverageMetaInfo.directory
            || coverageMetaInfo.files.length <= 0)
        return;
    if (!fs.existsSync(coverageMetaInfo.directory)
            || !fs.statSync(coverageMetaInfo.directory).isDirectory())
        throw new Error(`Invalid coverage directory: ${coverageMetaInfo.directory}`);

    const sourceMap = _createSourceMap(coverageMetaInfo);
    const exportBase = path.join(
        path.dirname(coverageFile),
        path.parse(coverageFile).name
    );
    const exportMarkdownFile = `${exportBase}.md`;
    const exportLcovFile = `${exportBase}.lcov`;
    const exportCoverageFile = `${exportBase}.coverage`;
    let coverageEntries = [];
    fs.writeFileSync(exportCoverageFile, JSON.stringify(coverageEntries, null, 2));
    let coverageReport;

    let activeSession;
    let activePage;

    const _readCoverageReport = async () => {
        if (coverageEntries.length <= 0)
            return;
        if (!coverageReport)
            coverageReport = _createCoverageReport(
                exportCoverageFile,
                coverageMetaInfo,
                sourceMap
            );
        return coverageReport;
    };

    const exportMarkdown = async () => {
        const report = await _readCoverageReport();
        if (!report)
            return;
        fs.writeFileSync(exportMarkdownFile, _createCoverageMarkdown(report));
        return exportMarkdownFile;
    };

    const exportLcov = async () => {
        const report = await _readCoverageReport();
        if (!report)
            return;
        fs.writeFileSync(exportLcovFile, _createCoverageLcov(report));
        return exportLcovFile;
    };

    const start = async (page) => {
        if (activeSession)
            throw new Error("Invalid page state");
        const session = await page.context().newCDPSession(page);
        try {
            await Promise.all([
                session.send("Profiler.enable"),
                session.send("Debugger.enable"),
                session.send("Debugger.setSkipAllPauses", {skip: true})
            ]);
            await session.send("Profiler.startPreciseCoverage", {
                callCount: true,
                detailed: true
            });
        } catch (error) {
            try {
                await session.detach();
            } catch (cleanupError) {
                throw new AggregateError([error, cleanupError], "Failed to start coverage");
            }
            throw error;
        }
        activeSession = session;
        activePage = page;
    };

    const stop = async () => {
        if (!activeSession || !activePage)
            throw new Error("Invalid page state");
        const session = activeSession;
        const page = activePage;
        activeSession = undefined;
        activePage = undefined;
        try {
            const {result} = await session.send("Profiler.takePreciseCoverage");
            await session.send("Profiler.stopPreciseCoverage");
            const entries = [];
            for (const entry of result) {
                if (!entry.url)
                    continue;
                const scriptPath = entry.url.split(/[?#]/, 1)[0].replace(/\\/g, "/");
                if (scriptPath.slice(scriptPath.lastIndexOf("/") + 1)
                        !== path.basename(coverageFile))
                    continue;
                const {scriptSource} = await session.send("Debugger.getScriptSource", {
                    scriptId: entry.scriptId
                });
                entries.push({
                    pageUrl: page.url(),
                    url: entry.url,
                    source: scriptSource,
                    functions: entry.functions
                });
            }
            if (entries.length <= 0)
                throw new Error(`Missing coverage data for ${path.basename(coverageFile)}`);
            const combinedEntries = coverageEntries.concat(entries);
            fs.writeFileSync(exportCoverageFile, JSON.stringify(combinedEntries, null, 2));
            coverageEntries = combinedEntries;
            coverageReport = undefined;
            return exportCoverageFile;
        } finally {
            await session.detach();
        }
    };

    return {
        start,
        stop,
        exportMarkdown,
        exportLcov
    };
};

module.exports = {
    createCoverageRecorder
};
