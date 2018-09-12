# Introduction
MadeBeauty Client App.

For general instructinos that apply to our mobile apps see /mobile/README.md

# Building and running

## Android

### Prerequisites

- Following instructions for Android Devices here: https://ionicframework.com/docs/intro/deploying/
- set ANDROID_HOME env variable to the directory where you installed Android SDK (this is usually "$HOME/Android/Sdk" on Linux).
- Go to `$ANDROID_HOME/tools/bin` directory, run `./sdkmanager --licenses` and accept all licenses.
- Install Gradle (for Ubuntu do `apt install gradle`)

### Run on device or emulator

To build and run on Android emulator or connected Android device use command `ionic cordova run android --device`

## iOS

### Prerequisites

- Install latest version of Xcode.
- Install global npm packages: `npm i -g ionic cordova`.

### Emulator

- Run `./node_modules/.bin/cross-env MB_ENV=dev ionic cordova run ios --livereload`.

### Real device

- Add your account to our team account.
- Sign in to your account in Signing section of xcode project General prefs.
- Prepare build by running: `MB_ENV=staging ionic cordova prepare ios`.
- Connect your real device and select it in Xcode devices section.
- Run by pressing the Run btn in xcode.

#### Real device debugging

- on iPhone select Settings –> Safari –> Advanced –> enable JS
- go to Safari, enable Dev tab
- select your device and run debugger (the device should appear in dev tab)
