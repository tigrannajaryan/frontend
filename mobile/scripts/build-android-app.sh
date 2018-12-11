#!/usr/bin/env bash

set -evx

echo "Starting Android build"

cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE

# Prepare plugins

# Make sure cache directory exists
CACHE_DIR=$TRAVIS_BUILD_DIR/.cache/$APP_TYPE/$MB_ENV
mkdir -p $CACHE_DIR

PLUGINS_CACHED_ZIP=$CACHE_DIR/plugins_android.zip

if diff config.xml $CACHE_DIR/config.xml >/dev/null ; then
  echo config.xml is unchanged, use plugins cache
  unzip -q $PLUGINS_CACHED_ZIP
else
  echo config.xml is different, do not use plugins cache
  cp config.xml $CACHE_DIR
fi

./node_modules/ionic/bin/ionic cordova platform rm android
./node_modules/ionic/bin/ionic cordova platform add android@7.1.0

# Zip and store plugins in the cache
rm $PLUGINS_CACHED_ZIP || true
zip -r -qdgds 10m --symlinks $PLUGINS_CACHED_ZIP plugins
ls -al $CACHE_DIR

./node_modules/ionic/bin/ionic cordova build android --release --verbose --prod

# Before deploying, zipalign and sign application; see more
# details about it at https://developer.android.com/studio/publish/app-signing,
# section "Build an unsigned APK and sign it manually"

cd $TRAVIS_BUILD_DIR/mobile
ZIPALIGN="$ANDROID_HOME/build-tools/$ANDROID_BUILD_TOOLS_VERSION/zipalign"
APKSIGNER="$ANDROID_HOME/build-tools/$ANDROID_BUILD_TOOLS_VERSION/apksigner"
KEYSTORE="android-cert/madebeauty-client-release-key.jks"
GOOGLE_PLAY_ACCESS_JSON="android-cert/google-play-access.json"

APK_PATH="$APP_TYPE/platforms/android/app/build/outputs/apk/release"

# decrypt keystore to extract signing key from
openssl aes-256-cbc -K $encrypted_6ee4fcd63dba_key -iv $encrypted_6ee4fcd63dba_iv -in $KEYSTORE.enc -out $KEYSTORE -d

# zipalign and sign package
$ZIPALIGN -v -p 4 $APK_PATH/app-release-unsigned.apk $APK_PATH/app-release-unsigned-aligned.apk || true
$APKSIGNER sign --ks $KEYSTORE --ks-pass pass:some-dummy-pass --out $APK_PATH/app-release.apk $APK_PATH/app-release-unsigned-aligned.apk

echo "signing done"
ls -FAls $APK_PATH
