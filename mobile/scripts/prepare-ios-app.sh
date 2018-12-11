#!/usr/bin/env bash

# set initial build number with respect to previous VSTS builds
export IOS_BUILD_NUMBER="$TRAVIS_BUILD_NUMBER"
echo "Preparing build $IOS_BUILD_NUMBER"

cd mobile/$APP_TYPE

echo "--Creating www folder"
mkdir www || true

echo "--Running cordova build to prepare iOS project."
npm install -g cordova@8.0.0

# save sentry properties before we start adding/removing plugins
cp sentry.properties sentry.properties.bak

# Prepare plugins
# Make sure config.xml is original (previous Android build most likely touched it)
git checkout -- config.xml

# Make sure cache directory exists
CACHE_DIR=$TRAVIS_BUILD_DIR/.cache/$APP_TYPE/$MB_ENV
mkdir -p $CACHE_DIR

PLUGINS_CACHED_ZIP=$CACHE_DIR/plugins_ios.zip

if diff config.xml $CACHE_DIR/config.xml >/dev/null ; then
  echo config.xml is unchanged, use plugins cache
  unzip -q $PLUGINS_CACHED_ZIP
else
  echo config.xml is different, do not use plugins cache
  cp config.xml $CACHE_DIR
fi

# Remove and add platform; before_platform_rm hook will update
# application name, description, version and ios bundle id
./node_modules/ionic/bin/ionic cordova platform rm ios || true
./node_modules/ionic/bin/ionic cordova platform add ios || true

# Zip and store plugins in the cache
rm $PLUGINS_CACHED_ZIP || true
zip -r -qdgds 10m --symlinks $PLUGINS_CACHED_ZIP plugins
ls -al $CACHE_DIR

# re-add sentry-cordova, adding it with cordova directly
echo "Re-adding sentry-cordova"
# remove plugin compltetely; this will also remove sentry-wizard
# dependancy, so we'll need to re-add it after plugin removal
cordova plugin remove sentry-cordova || true
# add sentry-wizard back; we're going to need it to stripe out unnecessary
# architectures from final build
npm install @sentry/wizard@0.10.2
./node_modules/@sentry/wizard/dist/bin.js --skip-connect -i cordova --uninstall true --quiet
SENTRY_SKIP_WIZARD=true cordova plugin add sentry-cordova@0.10.2 ||true
# run sentry-wizard; it will add a post-build phase to Xcode source
# to remove simulator architectures (required for AppStore submission)
./node_modules/@sentry/wizard/dist/bin.js --skip-connect -i cordova --uninstall false --quiet

# restore sentry.properties previously overridden by sentry-wizard
cp sentry.properties.bak sentry.properties

# generate xcode source
./node_modules/ionic/bin/ionic cordova prepare ios --prod

echo "--Patching build config to remove standard signing credentials"
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build.xcconfig
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build-release.xcconfig

# install missing pods - required for Firebase FCM

echo "Installing pods"

sudo gem install cocoapods
cd platforms/ios
pod install || true
