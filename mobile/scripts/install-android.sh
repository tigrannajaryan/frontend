#!/usr/bin/env bash

# Generally, Travis's OSX environment does not support Android builds.
# We're going to abuse it and install all dependencies from scratch.
# This script will install Java8 (later versions are not officially
# supported by Cordova, so we'll need to downgrade), gradle, Android
# SDK and build tools

echo "Installing Android pre-requisites"

mkdir -p ~/.android || true
touch ~/.android/repositories.cfg

# install Java and Gradle
brew tap caskroom/versions || true
brew cask install caskroom/versions/java8

# The code below should set up the proper JAVA_HOME path but for some reason
# when we do `cordova build android --release` we see
# JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-11.0.1.jdk/Contents/Home.
# TODO: investigate and understand why it doesn’t work.
# export JAVA_HOME=`/usr/libexec/java_home -v 1.8`

brew install gradle

# install Android SDK
mkdir -p $TRAVIS_BUILD_DIR/$ANDROID_SDK
cd $TRAVIS_BUILD_DIR/$ANDROID_SDK
wget -nv https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip
unzip -qq sdk-tools-linux-4333796.zip

# install build tools auto-accepting Android licenses
echo y | $TRAVIS_BUILD_DIR/$ANDROID_SDK/tools/bin/sdkmanager "build-tools;$ANDROID_BUILD_TOOLS_VERSION" "platforms;android-28" > /dev/null
