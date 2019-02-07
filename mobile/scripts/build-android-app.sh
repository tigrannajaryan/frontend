#!/usr/bin/env bash

set -evx

echo "Starting Android build"
# generate the properties files
$TRAVIS_BUILD_DIR/mobile/scripts/generate-sentry-properties.sh

# accept license for android SDK
echo yes | sdkmanager "platforms;android-27"

$TRAVIS_BUILD_DIR/mobile/scripts/restore-node-cache-plugins.sh

# restore plugins from previous builds and install dependencies
cd $TRAVIS_BUILD_DIR/mobile
make preinstall-$APP_TYPE

# build application binary
cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE
npm install -g cordova@8.0.0
./node_modules/ionic/bin/ionic cordova platform rm android
./node_modules/ionic/bin/ionic cordova platform add android@7.1.0
./node_modules/ionic/bin/ionic cordova build android --release --verbose --prod

# Before deploying, zipalign and sign application; see more
# details about it at https://developer.android.com/studio/publish/app-signing,
# section "Build an unsigned APK and sign it manually"

cd $TRAVIS_BUILD_DIR/mobile
ZIPALIGN="$ANDROID_HOME/build-tools/$ANDROID_BUILD_TOOLS_VERSION/zipalign"
APKSIGNER="$ANDROID_HOME/build-tools/$ANDROID_BUILD_TOOLS_VERSION/apksigner"
KEYSTORE="$TRAVIS_BUILD_DIR/mobile/android-cert/madebeauty-client-release-key.jks"
GOOGLE_PLAY_ACCESS_JSON="$TRAVIS_BUILD_DIR/mobile/android-cert/google-play-access.json"
APK_PATH="$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/platforms/android/app/build/outputs/apk/release"

# decrypt keystore to extract signing key from
openssl aes-256-cbc -K $encrypted_6ee4fcd63dba_key -iv $encrypted_6ee4fcd63dba_iv -in $KEYSTORE.enc -out $KEYSTORE -d

# zipalign and sign package
$ZIPALIGN -v -p 4 $APK_PATH/app-release-unsigned.apk $APK_PATH/app-release-unsigned-aligned.apk || true
$APKSIGNER sign --ks $KEYSTORE --ks-pass pass:some-dummy-pass --out $APK_PATH/app-release.apk $APK_PATH/app-release-unsigned-aligned.apk

# save collected plugins for future use
$TRAVIS_BUILD_DIR/mobile/scripts/save-plugins.sh
