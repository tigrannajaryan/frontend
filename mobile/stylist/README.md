# Introduction
MadeBeauty Stylist App.

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
