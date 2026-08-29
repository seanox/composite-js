&#9665; [Test](test.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#development)
- - -

# Maintenance

## Contents Overview
- [Automation and Build](#automation-and-build)
- [Server](#server)
- [Playground](#playground)
- [Test](#test)
  - [Firewall](#firewall)
  - [Browsers for Testing](#browsers-for-testing)
  - [Procedure](#procedure)
- [Release](#release)
  - [GitHub](#github)
  - [npmjs.com](#npmjscom)
  - [cdn.jsdelivr.net](#cdnjsdelivrnet)

## Automation and Build
For automation and build processes, the project uses [Apache Ant](
    https://ant.apache.org/) as its automation tool. The build script
`build.xml` is located in `./development` and is designed to be executed from
the project root directory.

```bash
ant -f ./development/build.xml
```

The script can also be executed from the `./development` directory by
referencing the script directly:

```bash
ant -f build.xml
```

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
Before a release, all tests in all relevant browser engines must run
successfully.

The test environment can be prepared in two variants:

```bash
ant -f ./development/build.xml compile
ant -f ./development/build.xml compile-max
```

- __compile__ prepares the environment for testing with the standard build
- __compile-max__ prepares the environment for testing with an unminified build
  including comments

Both tasks can be combined with the task _start_.

### Browsers for Testing
| Engine | Download                                                            |
| ------ |---------------------------------------------------------------------| 
| Blink  | https://portableapps.com/apps/internet/google_chrome_portable       |
| Gecko  | https://portableapps.com/apps/internet/firefox_portable             |
| Goanna | https://www.palemoon.org/download.shtml                             |
| WebKit | not available, native integration required<br>e.g. Safari iOS/MacOS |

Overview of engines  
https://en.wikipedia.org/wiki/Comparison_of_browser_engines

For testing, the latest stable releases of the relevant browser engines
available at the time of the release must be used.

### Procedure
- Create a release and start the server
  `ant -f ./development/build.xml compile start`
- URLs to be tested
  http://127.0.0.1:8000/  
  http://127.0.0.1:8000/benchmarks
- Broweser to be tested, based on prevalence  
  MS Edge, Google Chrome, Firefox, Pale Moon, Safari, Safari iOS

## Release

> > [!IMPORTANT]
> __Check the validity/expiration date of the NPM_AUTOMATION_TOKEN__

### GitHub
- Check that all ToDo's are done
- Run all tests in all Engines (Blink, Gecko, Goanna, WebKit)
- Finalize `CHANGES` and `README.md`
- Create a release
- Publish the release with a tag
- Create a release in GitHub for the tag
- Update the tutorials and create a release there too

### npmjs.com
- Go to the project directory
- Update the file `package.json`
- Log in with your credentials: `npm login`
- Publish the version: `npm publish --access public`
- In case the old version should be deprecated:  
  e.g. `npm deprecate seanox/aspect-js@"< 1.4.0" "WARNING: This version has been updated to 1.4.0."`

### cdn.jsdelivr.net
Nothing needs to be changed here, the content is synchronized with npmjs.com.



- - -
&#9665; [Test](test.md)
&nbsp;&nbsp;&nbsp;&nbsp; &#8801; [Table of Contents](README.md#development)
