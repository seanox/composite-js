&#9665; [Test](test.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#development)
- - -

# Maintenance

## Contents Overview
- [Automation and Build](#automation-and-build)
- [Server](#server)
  - [Firewall](#firewall)
- [Playground](#playground)
- [Test](#test)
  - [Playwright Tests](#playwright-tests)
  - [Coverage Review](#coverage-review)
  - [Browsers for Testing](#browsers-for-testing)
  - [Procedure](#procedure)
- [Release](#release)
  - [GitHub](#github)
  - [npmjs.com](#npmjscom)
  - [cdn.jsdelivr.net](#cdnjsdelivrnet)

## Automation and Build
For automation and build processes, the project uses [Apache Ant](
    https://ant.apache.org/) as its automation tool. The build script
`build.xml` is located in `./development` and is usually run from the project
root directory.

```bash
ant -f ./development/build.xml
```

The script can also be executed from the `./development` directory by
referencing the script directly:

```bash
ant -f build.xml
```

The build file can also be invoked from any other working directory if `-f` is
given a path that resolves to `development/build.xml` from there. The project
root is derived from the build file's location, not the current working
directory.

## Server
The project contains a completely preconfigured web server, which can be started
and also terminated most simply by command line from the project directory with
the included Ant script.

```
ant -f ./development/build.xml start
ant -f ./development/build.xml stop
```

The following important addresses are configured:

| Adresse                          | Usage                           |
|----------------------------------|---------------------------------|
| http://127.0.0.1:8000/playground | Playground                      |
| http://127.0.0.1:8000/           | Test environment                |
| http://127.0.0.1:8000/benchmarks | Test environment for benchmarks |
| http://127.0.0.1:8000/tutorials  | Tutorials                       |

Logging is configured to use the command line for output.

The web server is configured via `./server/devwex.ini`. Changes take effect
immediately and the web server restarts automatically.

### Firewall
- Windows Defender Firewall (add a rule)
- Name: Seanox Development TCP 8000
- Protocol Type: TCP
- Local Port: 8000
- Remote Port: all
- Remote IP Address: subnet

Creation of the rule via command line:

```
set rule_name=Seanox Development TCP 8000
netsh advfirewall firewall delete rule name="%rule_name%"
netsh advfirewall firewall add rule^
    name="%rule_name%"^
    dir=in protocol=tcp localport=8000 localip=any^
    remoteip=localsubnet profile=any action=allow
```

For more details see here:

```
netsh advfirewall firewall delete rule -?
```

## Playground
Playground is used for quick testing and bug analysis with the current sources,
even without creating a build, because the components are used individually as a
link.

http://127.0.0.1:8000/playground

To use it, the [server](#server) must be started.

## Test
Testing covers four complementary areas: Playwright tests, manual browser tests,
performance benchmarks and code coverage. Ant provides targets to prepare the
test bundles used for these checks.

```bash
ant -f ./development/build.xml compose
ant -f ./development/build.xml compose-max
ant -f ./development/build.xml compose-coverage
```

- __compose__ prepares the environment for testing with the standard build
- __compose-max__ prepares the environment for testing with an unminified build
  including comments
- __compose-coverage__ prepares a coverage-enabled test bundle for the
  Playwright coverage run described below; it depends on __compose-max__

The __compose__ and __compose-max__ tasks can be combined with the task _start_
for manual testing.

### Playwright Tests
After preparing the test bundles above, run the tests locally from
`./test/playwright` with Node.js 24 or newer. Install the dependencies and
browser binaries once:

```bash
npm install
npx playwright install chromium firefox webkit
```

The runner starts its own local server. Run it for each supported engine. Using
different ports is only recommended if the runners are to run in parallel. By
default, all servers use port 8000.

```bash
node runner.js -p 8001 -e blink -d ..
node runner.js -p 8002 -e gecko -d ..
node runner.js -p 8003 -e webkit -d ..
```

To run selected test pages, use `-f` with a filename glob. It filters page
filenames in the document root selected by `-d`, not individual test tasks:

```bash
node runner.js -e blink -d .. -f "composer_*.html"
```

### Coverage Review
Coverage is collected with Playwright on Blink (Chromium). From the project
root, prepare the coverage-enabled test bundle:

```bash
ant -f ./development/build.xml compose-coverage
```

Then, from `./test/playwright`, run the Playwright tests with Blink:

```bash
node runner.js -e blink -d ..
```

The runner writes `test/composite-js-testing.md` with total and per-file line,
function and branch coverage, as well as `test/composite-js-testing.lcov`.
Coverage is collected from discovered test pages that load
`composite-js-testing.js`. Review the report before a release, especially
uncovered code in changed runtime paths, and address relevant test gaps. No
fixed project-wide coverage threshold is configured.

### Browsers for Testing
The following browser list and procedure apply to the additional manual checks
before a release. These checks complement Playwright by verifying visual
rendering and browser behavior in real browser installations, especially across
different devices and hardware configurations. Playwright WebKit tests do not
replace testing native Safari on macOS or iOS.

| Engine | Download                                                         |
| ------ |------------------------------------------------------------------| 
| Blink  | https://portableapps.com/apps/internet/google_chrome_portable    |
| Gecko  | https://portableapps.com/apps/internet/firefox_portable          |
| Goanna | https://www.palemoon.org/download.shtml                          |
| WebKit | not available, native integration required e.g. Safari iOS/MacOS |

Overview of engines  
https://en.wikipedia.org/wiki/Comparison_of_browser_engines

For testing, the latest stable releases of the relevant browser engines
available at the time of the release must be used for these manual checks.

### Procedure
- Prepare the manual test environment and start the server
  `ant -f ./development/build.xml compose start`
- Run the manual test suite
  http://127.0.0.1:8000/  
- Run the active benchmarks at the following URL, assess the results against
  previous measurements and record the values for the new version in
  `test/benchmarks/README.md`
  http://127.0.0.1:8000/benchmarks
- Browser to be tested, based on prevalence  
  Google Chrome, Firefox, Pale Moon, Safari, Safari iOS

For consistent results, use a fresh private/incognito window and close unrelated
tabs or applications to reduce cache and background-activity effects. JIT
warm-up may still affect benchmark timings.

## Release

> [!IMPORTANT]
> __Check the validity/expiration date of the NPM_AUTOMATION_TOKEN__

### GitHub
- Check that all ToDo's are done
- Finalize `CHANGES` and `README.md`
- Update the tutorials and create a release there too
- Run the Playwright tests for Blink, Gecko and WebKit
- Generate and review the Blink coverage report as described in
  [Coverage Review](#coverage-review)
- Complete the manual tests in the latest stable relevant browsers and run and
  assess the active benchmarks as described in [Procedure](#procedure)
- Create a release
  ```bash
  ant -f ./development/build.xml release 
  ```
- Publish the release with a tag
- Create a release in GitHub for the tag and add the assets
- Publish the release in npmjs.com
  ```bash
  ant -f ./development/build.xml publish 
  ```
  
### npmjs.com

> [!NOTE]
> Manual execution is not required.

- Go to the project directory
- Update the file `package.json`
- Log in with your credentials: `npm login`
- Publish the version: `npm publish --access public`
- In case the old version should be deprecated:  
  e.g. `npm deprecate seanox/composite-js@"< 2.0.0" "WARNING: This version has been updated to 2.0.0."`

### cdn.jsdelivr.net
Nothing needs to be changed here, the content is synchronized with npmjs.com.



- - -
&#9665; [Test](test.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#development)
