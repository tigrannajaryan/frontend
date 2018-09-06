# Introduction
MadeBeauty Client App.

For general instructinos that apply to our mobile apps see /mobile/README.md

# Client App - Android version

## Prerequisites

- Following instructions for Android Devices here: https://ionicframework.com/docs/intro/deploying/

- set ANDROID_HOME env variable to the directory where you installed Android SDK
(this is usually "$HOME/Android/Sdk" on Linux).

- Go to `$ANDROID_HOME/tools/bin` directory, run `./sdkmanager --licenses` and accept all licenses.

- Install Gradle (for Ubuntu do `apt install gradle`)

## Building and running

To build and run on Android emulator or connected Android device
use command `ionic cordova run android --device`
