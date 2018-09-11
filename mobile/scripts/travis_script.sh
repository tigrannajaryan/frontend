#!/usr/bin/env bash

set -ev

# if this is a pull request - just exit, we don't want to build actual
# apps during PR builds
if [[ $TRAVIS_PULL_REQUEST != "false" ]]; then
    echo "Skipping actual mobile apps build on a pull request"
    exit 0
fi

# if app type is client - install android pre-requisites
if [[ $APP_TYPE = "client" ]]; then
    $TRAVIS_BUILD_DIR/mobile/scripts/install-android.sh
    export PATH=${PATH}:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
fi


cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE

echo "--Creating www folder"
mkdir www || true
npm install -g cordova@8.0.0

# build Android app only for the Client app

if [[ $APP_TYPE = "client" ]]; then
    export APP_BUNDLE_ID=$ANDROID_APP_BUNDLE_ID
    $TRAVIS_BUILD_DIR/mobile/scripts/build-android-app.sh
fi

# prepare and build iOS app

export APP_BUNDLE_ID=$IOS_APP_BUNDLE_ID

cd $TRAVIS_BUILD_DIR
# restore encrypted distribution certificate file
openssl aes-256-cbc -K $encrypted_d801e47d7db5_key -iv $encrypted_d801e47d7db5_iv -in mobile/ios-cert/distribution.p12.enc -out mobile/ios-cert/distribution.p12 -d
mobile/scripts/install-apple-profile.sh
# import distribution certificate to local keychain (required for XCode signing)
IOS_DISTRIBUTION_CERT_PASSWORD="$IOS_DISTRIBUTION_CERT_PASSWORD" mobile/scripts/install-apple-certificate.sh
# run cordova prepare and patch/amend necessary assets
mobile/scripts/prepare-ios-app.sh
# actually build, archive and export iOS application
mobile/scripts/build-ios-app.sh
