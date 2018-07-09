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

To build non-default environment define BB_ENV env variable before building, e.g.
`BB_ENV=local npm run build-full`

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

# Known Issues
- Errors about missing modules are shown when starting up the application:
You need to create a symlink alias. Type the following to the command line or terminal:

`mklink /D PROJECT_ROOT\mobile\stylist\src\app\shared PROJECT_ROOT\mobile\shared` - for Windows;

`ln -s PROJECT_ROOT\mobile\shared PROJECT_ROOT\mobile\stylist\src\app\shared` - for MacOS and Linux;

- node-sass shows show you the following error message while setting up the project:

`Error: ENOENT: no such file or directory, scandir 'PROJECT_ROOT/mobile/stylist/node_modules/node-sass/vendor'`

To fix this problem you should run the following commands:

`node PROJECT_ROOT/mobile/stylist/node_modules/node-sass/scripts/install.js`

`npm rebuild node-sass`

- Unsupported npm version gives you an error while installing node_modules similar to the following:

`17166 error code EINTEGRITY`

`17167 error sha512-W2Cr4iDg3EHANbuOqjobJtYhHrptIEJ7mBQZTqp3qh1fSRm2yNcnt8sgmfqbotl2Qh2nCKb3qLVv3v8v3DoRkw== integrity checksum failed when using sha512: wanted sha512-W2Cr4iDg3EHANbuOqjobJtYhHrptIEJ7mBQZTqp3qh1fSRm2yNcnt8sgmfqbotl2Qh2nCKb3qLVv3v8v3DoRkw== but got sha512-EctwPdNttbuuucRR7WdmXgsST4gcnOFPt5CDc+TpCggVrlvnhNfyJ4h8jYAiwkWe0fpyu8rgJfHLIXQB1U1c9Q==. (661037 bytes)`

`17168 verbose exit [ 1, true ]`

To fix the issue - update npm version.

- Register user returns error message:

`API request POST http://betterbeauty.local:8000/api/v1/auth/register failed: {"headers":{"normalizedNames":{},"lazyUpdate":null,"headers":{}},"status":0,"statusText":"Unknown Error","url":null,"ok":false,"name":"HttpErrorResponse","message":"Http failure response for (unknown url): 0 Unknown Error","error":{"isTrusted":true}}`

To fix this issue create a file `environment.local.ts` in `app/src/environments` and fill it with the content:

`export const ENV = {`
`  // apiUrl: 'http://betterbeauty.local:8000/api/v1/', // local backend`
`  apiUrl: 'https://admindev.betterbeauty.io/api/v1/', // staging url`
`  production: false,`
`  version: '_DEV_'`
`};`

Then restart server:

`npm run ionic:serve`

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
