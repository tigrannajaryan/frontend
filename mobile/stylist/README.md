# Introduction
MadeBeauty Stylist App.

# Prerequisites

- node v8.11.1 or newer LTS
- npm 5.6.0 or newer

# Local setup and installation

- run `npm install` to install node modules.
- run `npm run ionic:serve`. This command will build the app, start a
local dev server for dev/testing and open the app in your default browser.

To build only run `npm run build`.

# Build environments

The app can be built for different environments (e.g. production or local).
The environments are defined in `environments/environment.*.ts` files.
Certain settings such as backend URL, feature flags, etc are defined in these
files.

The default environment is `environment.default.ts`.

To build non-default environment define MB_ENV env variable before building, e.g.
`MB_ENV=local npm run build-full`

# Coding guidelines

Follow Angular Style Guide: https://angular.io/guide/styleguide

# Code generating

Generate new page’s files (module, component and styles):
```sh
echo PAGE_NAME | xargs -I % sh -c 'ionic generate page %; mv src/pages/% src/app/%'
```

# Debugging in VS Code

- run `npm run ionic:serve -- -b` to build the app and start the server.
- open `/mobile/stylist` directory in VS code.
- Press F5. This should open the app in Chrome and attach
debugger to it. You should be able to set and hit breakpoints
in *.ts files in VS Code.

# Running tests

- run `npm test` to build and run Karma unit tests.

To debug the tests use "Attach to Karma Chrome" debugging configuration and run this config
to attach to Chrome running Karma tests, set any breakpoints and reload the Karma page to
trigger the breakpoints.

To run the tests in headless mode (e.g. for CI) use `npm run test-headless`.
Note: to run successfully on VSTS this requires Hosted VS2017 agent.

# Running E2E tests

- run `npm run build-and-e2e` to build and run Protractor end to end tests.

To debug the tests use "Debug e2e tests" debugging configuration in VS Code.

# Android App

## Prerequisites

- Following instructions for Android Devices here: https://ionicframework.com/docs/intro/deploying/

- set ANDROID_HOME env variable to the directory where you installed Android SDK
(this is usually "$HOME/Android/Sdk" on Linux).

- Go to `$ANDROID_HOME/tools/bin` directory, run `./sdkmanager --licenses` and accept all licenses.

- Install Gradle (for Ubuntu do `apt install gradle`)

## Building and running

To build and run on Android emulator or connected Android device
use command `ionic cordova run android --device`

It is also possible to run the app on the device from VS Code and have full
debugging experience. Use "Run android on device" VS Code debug configuration.
Note that you will need to install Cordova plugin for VS Code first:
https://marketplace.visualstudio.com/items?itemName=vsmobile.cordova-tools