# AGENTS.md

## Project Overview
Seanox composite-js is a browser-native application runtime for building
single-page applications (SPAs) and micro-frontends.

HTML defines views and composites, JavaScript provides application logic, and
CSS provides presentation. Applications are composed dynamically in the browser
without an application compilation step and are served from a web server.
The runtime itself has a build process for distributable bundles.

Keep the runtime architecture-neutral: applications may use MVC, MVCS, MVVM or
other architectures, but the runtime must not depend on any of them.

## Project Structure and Starting Points
Paths below are relative to the repository root.

| Path                                  | Responsibility                                                   |
|:--------------------------------------|:-----------------------------------------------------------------|
| `sources/`                            | Authoritative browser runtime source                             |
| `release/`                            | Generated bundles; do not edit manually                          |
| `test/`                               | HTML test pages, fixtures, helpers and generated test bundles    |
| `test/playwright/`                    | Node.js test runner, HTTP server and coverage tooling            |
| `development/build.xml`               | Ant build targets, source order, minification and bundle linting |
| `development/package.json`            | Build dependencies: ESLint and UglifyJS                          |
| `development/eslint.config.js`        | ES2015 syntax constraint for runtime bundles                     |
| `.github/actions/compose/action.yaml` | CI build setup and composition command                           |
| `.github/workflows/playwright.yaml`   | Browser installation and three-engine test matrix                |
| `manuals/`                            | Architecture, public API and testing documentation               |
| `tutorials/`                          | Executable application examples                                  |
| `server/`                             | Supporting development server infrastructure                     |
| `README.md`, `CHANGES`                | Public overview, requirements and change history                 |

Use this source map to locate the relevant implementation and manual:

| Source in `sources/` | Responsibility                                            | Manual in `manuals/`                     |
|:---------------------|:----------------------------------------------------------|:-----------------------------------------|
| `extension.js`       | Shared browser/API extensions and compatibility helpers   | `extensions.md`                          |
| `locator.js`         | Resource locator handling                                 | `datasource.md`                          |
| `datasource.js`      | XML data, XPath, XSLT and locale-aware resources          | `datasource.md`                          |
| `scripting.js`       | Script evaluation, execution contexts and object exposure | `scripting.md`                           |
| `expression.js`      | Expression evaluation                                     | `expression.md`                          |
| `composer.js`        | DOM realization, resources, scopes, binding and lifecycle | `composite.md`, `markup.md`, `events.md` |
| `messages.js`        | Resource bundles and localized messages                   | `datasource.md`                          |
| `reactive.js`        | Reactive objects and rendering dependencies               | `composite-binding.md`                   |
| `routing.js`         | Declarative navigation, permissions and interceptors      | `routing.md`                             |
| `test.js`            | Browser Test and Assert APIs; testing bundles only        | `test.md`                                |

For cross-cutting changes, start with `manuals/architecture.md`, then trace the
affected source, callers, tests and API documentation. If documentation and
implementation disagree, investigate rather than treating either as proof of
the intended behavior.

## Compatibility and Coding Conventions
- Runtime sources and generated bundles must remain ECMAScript 6
  (ES2015)-compatible. The build uses `ecmaVersion: 2015`; do not introduce
  newer syntax such as optional chaining, nullish coalescing or object spread.
  Use existing ES2015 patterns such as `Object.assign`.
- Consider API availability separately from syntax. Preserve support for Blink,
  Gecko, Goanna and WebKit; reuse compatibility helpers before adding new ones.
- Development tooling may use newer JavaScript. Use Node.js 24 or newer for
  Playwright, as required by `test/playwright/package.json`; CI uses Node.js 24.
- Prefer native browser APIs, readable JavaScript and existing shared helpers.
  Do not add frameworks, TypeScript, transpilation requirements or significant
  dependencies without explicit approval.
- Follow the surrounding naming and formatting. Preserve public APIs, error
  handling and the existing global namespace registration patterns.
- Keep changes focused; do not refactor unrelated code or silently suppress
  failures.

## Architectural Invariants
- Preserve composite identity, namespace boundaries, resource resolution and
  lifecycle. A composite, its resources, its script and its application module
  are distinct concepts; do not conflate them with ECMAScript modules.
- Keep HTML, application logic and CSS responsibilities separate. Do not
  introduce implicit dependencies between unrelated composites.
- Preserve view/application scopes and the non-persistent execution context
  used by expressions and composite scripts. Check both evaluation paths when
  changing scope resolution or scripting behavior.
- Preserve explicit object exposure, composite binding, reactive dependencies
  and asynchronous DOM rendering. Avoid unnecessary evaluation and rendering.
- Preserve declarative routing, nested view flows, permission checks,
  interceptors and navigation history.
- Preserve the immutable XML DataSource model, XPath/XSLT semantics, resource
  caching, locale handling and resource bundles.

### Application Trust Boundary
Composite scripts, expressions and executable markup are trusted application
code and execute with application privileges. The application context is a
resource boundary, not a JavaScript sandbox. Do not treat dynamic evaluation as
accidental or introduce untrusted input as executable content. See
`manuals/architecture.md`, section "Trust Boundary".

## Build and Generated Artifacts
The build requires Node.js/npm, a JDK and Apache Ant on `PATH`. CI uses Java 11;
see `.github/actions/compose/action.yaml` for the reference setup.

From the repository root:

```text
ant -f development compose
```

`compose` installs the dependencies in `development/package.json`, concatenates
sources in the order defined by `development/build.xml`, minifies with UglifyJS,
and lints production and testing bundles with the ES2015 configuration.
Preserve the source order and all generated variants when changing the build:

| Bundle in `release/`                                                 | Purpose                                |
|:---------------------------------------------------------------------|:---------------------------------------|
| `composite-js.js`, `composite-js-max.js`                             | Production, minified and unminified    |
| `composite-js-debug-max.js`                                          | Unminified debug runtime               |
| `composite-js-testing.js`, `composite-js-testing-max.js`             | Testing, minified and unminified       |
| `composite-js-debug-testing.js`, `composite-js-debug-testing-max.js` | Debug testing, minified and unminified |

Debug variants expose internal variables for debugging and related tests; they
are not interchangeable with production bundles.

**Build side effects:** `compose` deletes and recreates matching
`release/composite-js*.js` files, overwrites the generated test bundles and
`test/composite-js.tests`, and also removes `development/node_modules` and
`development/package-lock.json`. Check for existing changes and concurrent use
before running it. If this would destroy another user's work or dependencies
in use, ask first or use an isolated worktree.

The build copies these two required bundles into `test/`:
- `composite-js-testing.js`
- `composite-js-debug-testing.js`

After runtime source changes, regenerate them before browser tests; existing
bundles may be stale. Never fix generated files instead of their source.

For direct build-tool work, install dependencies with `npm install` from
`development/` when needed. There are no npm scripts in that package.
Do not use `release` or `publish` for routine validation: `release` also updates
change metadata and tutorial artifacts, while `publish` publishes to npm.
Both require explicit authorization.

## Testing
### Setup
After preparing current test bundles, run these commands from
`test/playwright/` using Node.js 24 or newer:

```text
npm install
npx playwright install chromium firefox webkit
```

Install only the browsers needed for focused work. On Linux systems missing
browser OS dependencies, use `npx playwright install --with-deps` with the
selected browser names, as CI does. This installs system packages and may need
elevated privileges; obtain approval where required. `npm install` alone does
not install browser binaries.

### Running Browser Tests
Run from `test/playwright/`:

```text
node runner.js -p 8001 -e blink -d ..
node runner.js -p 8002 -e gecko -d ..
node runner.js -p 8003 -e webkit -d ..
```

The runner starts and stops its own HTTP server, bound to loopback by default;
do not start another server on the same port. Use separate free ports for
concurrent runs. Engine arguments are `blink`, `gecko`, `webkit`; Playwright
installation names are `chromium`, `firefox`, `webkit`.

For a focused run, add `-f` with a quoted filename or glob:

```text
node runner.js -p 8001 -e blink -d .. -f "composer_*.html"
```

`-d` is the test document root, relative to the command's working directory.
`-f` filters filenames in that root, not nested directories or individual test
tasks. The runner discovers top-level `.html` pages other than `index.html`
that contain a recognized runtime script tag; see `PATTERN_TEST_SCRIPTS` in
`runner.js`. Both required testing bundles must be present even for a filtered
run. No matching pages is an error, not a successful empty test run.

### Test Requirements
- Add tests for new functionality, preferably before implementation (test-driven
  development) where feasible, including relevant edge cases.
- Add regression tests for bug fixes that reproduce the original issue and
  verify that it is fixed.
- Follow neighboring test and fixture conventions; do not rename unrelated
  pages or helpers. Consult `manuals/test.md` for the Test/Assert APIs.
- Reuse existing page setup with `Test.activate()`, `Test.create(...)` and
  `Test.start()`. Let the Test API emit the `testStart` and `testFinish` events
  expected by the runner; do not simulate completion manually.
- Cover observable behavior, edge cases, errors, asynchronous execution and DOM
  lifecycle; do not weaken tests merely to make an implementation pass.
- Start with the affected pages and engine, then cover Chromium, Firefox and
  WebKit for runtime behavior changes. Consider Goanna separately; it is not a
  Playwright engine and passing Firefox does not establish Goanna compatibility.
- Confirm that intended pages and tasks actually ran. Investigate nonzero
  exit codes, test faults and timeouts instead of assuming success.
- Documentation-only changes need no runtime build or browser suite; verify
  referenced paths, commands and claims against the repository.

## Documentation
- Update the relevant manuals for public behavior changes, including error
  behavior and compatibility implications.
- Keep examples executable and consistent with the actual API; update tutorials
  when existing examples become outdated.
- Use established project terminology and update `CHANGES` when appropriate.
- When build/test commands or paths change, update this guide and the related
  CI configuration so local and CI instructions remain consistent.

## Working Rules for AI Agents
### Before making changes
1. Inspect `git status` and the relevant diff. Preserve existing staged,
   unstaged and untracked work; do not reset, clean, overwrite or stage it.
2. Inspect the relevant implementation, dependencies, tests and manuals.
   Establish intended behavior and identify browser/API compatibility risks.
3. Choose the smallest complete change using existing mechanisms. Clarify
   ambiguous behavior or conflicting local changes before editing.
4. Before changing implementation code, follow the test-first requirements above.

### After making changes
1. Review the complete task diff, including any generated output. Check for
   unrelated changes, unintended API shifts and ES2015 incompatibilities.
2. Run the relevant validation described above and update related documentation.
3. Remove only temporary artifacts created by this task. Leave unrelated work
   and pre-existing generated changes intact.
4. Report the outcome and any validation that was blocked or not executed,
   including the reason. Do not claim browser coverage that was not run.

### Permissions
Without additional confirmation:
- Read and inspect project files.
- Analyze architecture and dependencies.
- Modify files required by the requested task.
- Add or update relevant tests and documentation.
- Run focused tests and static checks.

Require explicit authorization before:
- Committing or pushing changes.
- Publishing releases or packages.
- Deleting substantial project content.
- Introducing significant new dependencies.
- Performing destructive operations.
- Making intentional breaking API changes.

## External Links
- [AGENTS.md best practices](https://gist.github.com/0xfauzi/7c8f65572930a21efa62623557d83f6e)
