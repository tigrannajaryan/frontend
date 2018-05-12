# Introduction
MadeBeauty Client App.

# Prerequisites

- node v8.11.1 or newer LTS
- npm 5.6.0 or newer

# Local setup and installation

- run `npm install` to install node modules.
- run `npm run ionic:serve`. This command will build the app, start a
local dev server for dev/testing and open the app in your default browser.

To build only run `npm run build`.

# Coding guidelines

Follow Angular Style Guide: https://angular.io/guide/styleguide

# Debugging in VS Code

- run `npm run ionic:serve -- -b` to build the app and start the server.
- open `/mobile/client` directory in VS code.
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

