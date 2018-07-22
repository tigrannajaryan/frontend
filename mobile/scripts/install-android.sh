#!/usr/bin/env bash

# Generally, Travis's OSX environment does not support Android builds.
# We're going to abuse it and install all dependencies from scratch.
# This script will install Java8 (later versions are not officially
# supported by Cordova, so we'll need to downgrade), gradle, Android
# SDK and build tools

echo "Installing Android pre-requisites"
set -ev

ANDROID_SDK=android_sdk

# install Java and Gradle
brew tap caskroom/versions
brew cask install java8
brew install gradle
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home

# install Android SDK
mkdir -p $TRAVIS_BUILD_DIR/$ANDROID_SDK
cd $TRAVIS_BUILD_DIR/$ANDROID_SDK
wget -nv https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip
unzip -qq sdk-tools-linux-4333796.zip

export ANDROID_HOME="$TRAVIS_BUILD_DIR/$ANDROID_SDK"
export PATH=${PATH}:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools

# install build tools auto-accepting Android licenses
echo y | tools/bin/sdkmanager "build-tools;28.0.1" "platforms;android-28"
