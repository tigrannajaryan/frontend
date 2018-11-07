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

## Full build and test of both apps (except native part of builds)

To build both mobile apps using parallel build do this in `mobile` directory: `make -j8`.
If running under Windows install GnuWin32 and use this command `make -j8 "MAKE=make -j8"` instead.

Note that we use several symlinks which are automatically created by `make` command. Here is the
list of symlinks if you want to set them up manually:

mobile/client/src/app/shared -> mobile/shared/code
mobile/client/e2e -> mobile/shared/e2e
mobile/stylist/src/app/shared -> mobile/shared/code
mobile/stylist/e2e -> mobile/shared/e2e

Also mobile/shared/assets directory is copied to mobile/client/src/assets and mobile/shared/src/assets by `make`.

To clean the build use `make clean`.

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

## Android App

### Prerequisites

- Following instructions for Android Devices here: https://ionicframework.com/docs/intro/deploying/

- set ANDROID_HOME env variable to the directory where you installed Android SDK
(this is usually "$HOME/Android/Sdk" on Linux).

- Go to `$ANDROID_HOME/tools/bin` directory, run `./sdkmanager --licenses` and accept all licenses.

- Install Gradle (for Ubuntu do `apt install gradle`)

### Building and running

Go to `stylist` or `client` direcory.

To build and run on Android emulator or connected Android device
use command `ionic cordova run android --device`

It is also possible to run the app on the device from VS Code and have full
debugging experience. Use "Run android on device" VS Code debug configuration.
Note that you will need to install Cordova plugin for VS Code first:
https://marketplace.visualstudio.com/items?itemName=vsmobile.cordova-tools

### Accessing logs while running on the device

To see the logs while running on the device use `adb logcat chromium:V *:S` where adb
is normally located in `/platform-tools` directory of Android SDK.

## iOS App

### Prerequisites

- Install CocoaPods via `sudo gem install cocoapods`

### Building and running

Go to `stylist` or `client` direcory.

To build and run on connected iOS device use command
`SENTRY_SKIP_AUTO_RELEASE=true ionic cordova run ios --device`

If the build fails then you need to manually install the pods. Do this:
```
cd platforms/ios
pod install
```
This will likely be quite slow the first time, so be patient.

If you need to build successfully from scratch (e.g. on CI server) do this instead:
```
ionic cordova add ios
cd platforms/ios
pod install
cd ../..
ionic cordova build ios
```


# Tests

## Unit tests

Run `npm test` to build and run Karma unit tests.

To debug the tests in VS Code use "Attach to Karma Chrome" debugging configuration and run this config
to attach to Chrome running Karma tests, set any breakpoints and reload the Karma page to
trigger the breakpoints.

To run the tests in headless mode (e.g. for CI) use `npm run test-headless`.

## End to end tests

Both Client and Stylist apps have E2E tests in their e2e sub-directories. The tests
launch the app in Chrome browser and use Protractor/Selenium WebDriver to drive the app.
To run the tests do `npm run e2e-test` (note that that app must be already built before that).

You can debug E2E tests in VS Code. There is "Run e2e tests" debug configuration defined both for stylist and client apps.
It runs the tests with normal (visible) browser and you can set breakpoints in test and
also inspect browser elements. This makes it much easier to diagnose test failures.
You can also run a single test file by providing "--specs" flag (see launch.json for example).
Diagnosing E2E test failures in headless browser mode without breakpoints is more difficult.

If you want to run the E2E tests against a local backend make sure to 
set the `apiUrl` in enviornment.local.ts to http://localhost/api/v1/ and build the
app using MB_ENV=local setting (e.g. `MB_ENV=local npm run build`), then run
run the tests with same environment variable, i.e. `MV_ENV=local npm run e2e-test`.
Obviously you need to have the backend up and running locally at locallhost
for this to work (see instructions for running the backend at https://github.com/madebeauty/backend).

# Coding guidelines

Follow Angular Style Guide: https://angular.io/guide/styleguide

# Code generating

Generate new page’s files (module, component and styles):
```sh
echo PAGE_NAME | xargs -I % sh -c 'ionic generate page %; mv src/pages/% src/app/%'
```

# Icons font

We use svg icons converted to font `mb-icon` via https://icomoon.io/app
If you wannt to add some icont to both apps you need:
1) add `frontend/mobile/shared/assets/fonts/mb-icon/MADEicons.json` to https://icomoon.io/app and you will see all icons that we have
2) add icon (use only svg and it sohuld be monocolored), you can simply drag it to all icons (better to add it to the end)
3) rename icon/s that you add (you can use pencil button in toolbar or clicking by generating font in the footer)
4) generate font and download it
5) rename downloaded font to `mb-icon` and replcase it with `frontend/mobile/shared/assets/fonts/mb-icon`
(also each time when you add some icons do not forgot to download JSON from icomoon app and also add it in same folder, we need to do this because we use free version)
6) add styles for new icons to `frontend/mobile/shared/assets/fonts/mb-icon/mb-icon.scss`
and here `frontend/mobile/shared/code/components/mb-icons/mb-icons.component.html` 
