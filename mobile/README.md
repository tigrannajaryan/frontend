# Introduction
MadeBeauty mobile apps.

# Directory Structure

The repository has the following structure:
```
/mobile    - mobile apps
  /client  - Client app (To be created)
  /stylist - Stylist app
  /shared  - shared code for mobile apps
```

/client and /stylist directories are set up very similarly. When there are differences
they are described in README.md files in each of this directories.

# Prerequisites

- node v8.11.1 or newer LTS
- npm 5.6.0 or newer

# Building and Running

## Full build of both apps

To build both mobile apps using parallel build do this in `mobile` directory: `make -j8`.
If running under Windows install GnuWin32 and use this command `make -j8 "MAKE=make -j8"` instead.

Note that we use several symlinks which are automatically created by `make` command. Here is the
list of symlinks if you want to set them up manually:

mobile\client\src\app\shared -> mobile\shared

To clean use `make clean`.

## Building and running one app

The following commands must be run inside /client or /stylist directories.

- run `npm install` to install node modules.
- run `npm run ionic:serve`. This command will build the app, start a
local dev server for dev/testing and open the app in your default browser.

To build only run `npm run build`.

## Build environments

The apps can be built for different environments (e.g. production or local).
The environments are defined in `environments/environment.*.ts` files.
Certain settings such as backend URL, feature flags, etc are defined in these
files.

The default environment is `environment.default.ts`.

To build non-default environment define MB_ENV env variable before building, e.g.
`MB_ENV=local npm run build-full`

Note that `environment.local.ts` is deliberately not checked in to git so that
you can create your own local copy and modify it as you need.

## Debugging in VS Code

- Open /stylist or /client directory in VS code (or open /mobile/mobile-apps.code-workspace to have both apps)
- Run `npm run ionic:serve -- -b` to build the app and start the server.
- Choose debug configuration "Run in Chrome against localhost"
- Press F5. This should open the app in Chrome and attach debugger to it.
  You should be able to set and hit breakpoints in *.ts files in VS Code.

## Running on the device

To build and run on connected iOS device use command `ionic cordova run ios --device`

# Tests

## Unit tests

- run `npm test` to build and run Karma unit tests.

To debug the tests in VS Code use "Attach to Karma Chrome" debugging configuration and run this config
to attach to Chrome running Karma tests, set any breakpoints and reload the Karma page to
trigger the breakpoints.

To run the tests in headless mode (e.g. for CI) use `npm run test-headless`.

## End to end tests

Both Client and Stylist apps have E2E tests in their e2e sub-directories. The tests
launch the app in Chrome browser and use Protractor/Selenium WebDriver to drive the app.
To run the tests do `npm run e2e-test` (note that that app must be already built before that).

You can debug E2E tests in VS Code. There is "Run e2e tests" debug configuration defined.
It runs the tests with normal (visible) browser and you can set breakpoints in test and
also inspect browser elements. This makes it much easier to diagnose test failures.
You can also run a single test file by providing "--specs" flag (see launch.json for example).
Diagnosing E2E test failures in headless browser mode without breakpoints is more difficult.

# Coding guidelines

Follow Angular Style Guide: https://angular.io/guide/styleguide

# Code generating

Generate new page’s files (module, component and styles):
```sh
echo PAGE_NAME | xargs -I % sh -c 'ionic generate page %; mv src/pages/% src/app/%'
```
