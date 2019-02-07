#!/usr/bin/env bash

set -evx

# set initial build number with respect to previous VSTS builds
export IOS_BUILD_NUMBER="$TRAVIS_BUILD_NUMBER"

# restore plugins from previous builds and install dependencies
$TRAVIS_BUILD_DIR/mobile/scripts/restore-node-cache-plugins.sh
cd $TRAVIS_BUILD_DIR/mobile
make preinstall-$APP_TYPE
npm install -g cordova@8.0.0


# Remove and add platform; before_platform_rm hook will update
cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE
# application name, description, version and ios bundle id
./node_modules/ionic/bin/ionic cordova platform rm ios || true
./node_modules/ionic/bin/ionic cordova platform add ios || true


# TODO: The sorcery related to Sentry below is an old hack, which we need
# TODO: to patch XCode config file - to stripe out i386 architecture files.
# TODO: If we find a way to do that manually without removing/adding Sentry -
# TODO: we will save another 3-5 minutes on the build.

# >> start of Sentry black magic
# First, we must generate the properties files
$TRAVIS_BUILD_DIR/mobile/scripts/generate-sentry-properties.sh
cp $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/sentry.properties $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/sentry.properties.bak
# Then we remove plugin completely; this will also remove sentry-wizard
# dependency, so we'll need to re-add it after plugin removal
cordova plugin remove sentry-cordova || true
# add sentry-wizard back; we're going to need it to stripe out unnecessary
# architectures from final build
npm install @sentry/wizard@0.10.2
./node_modules/@sentry/wizard/dist/bin.js --skip-connect -i cordova --uninstall true --quiet
SENTRY_SKIP_WIZARD=true cordova plugin add sentry-cordova@0.10.2 || true
# run sentry-wizard; it will add a post-build phase to Xcode source
# to remove simulator architectures (required for AppStore submission)
./node_modules/@sentry/wizard/dist/bin.js --skip-connect -i cordova --uninstall false --quiet
cp $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/sentry.properties.bak $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/sentry.properties
# << end of Sentry black magic

# generate xcode source
./node_modules/ionic/bin/ionic cordova prepare ios --prod


# patch release.xcconfig to remove standard signing credentials that Cordova heedlessly injects
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build.xcconfig
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build-release.xcconfig

# install missing pods - required for Firebase FCM support
sudo gem install cocoapods
cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/platforms/ios
pod install || true

# install developer profile and certificates
cd $TRAVIS_BUILD_DIR
# restore encrypted distribution certificate file
openssl aes-256-cbc -K $encrypted_d801e47d7db5_key -iv $encrypted_d801e47d7db5_iv -in $TRAVIS_BUILD_DIR/mobile/ios-cert/distribution.p12.enc -out $TRAVIS_BUILD_DIR/mobile/ios-cert/distribution.p12 -d
$TRAVIS_BUILD_DIR/mobile/scripts/install-apple-profile.sh
# import distribution certificate to local keychain (required for XCode signing)
IOS_DISTRIBUTION_CERT_PASSWORD="$IOS_DISTRIBUTION_CERT_PASSWORD" $TRAVIS_BUILD_DIR/mobile/scripts/install-apple-certificate.sh

# actually build ios app
EXTRA_CONFIG_FILE=$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/platforms/ios/cordova/build-release.xcconfig
echo "Building mobile app (quietly)"
xcodebuild -quiet -workspace "$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/platforms/ios/$IOS_APP_NAME.xcworkspace" -scheme "$IOS_APP_NAME" archive -sdk $IOS_SDK -configuration Release -archivePath "$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/ios_build/$IOS_SDK/$IOS_APP_NAME" CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY="$IOS_CODE_SIGN_IDENTITY" PROVISIONING_PROFILE=$IOS_PROVISIONING_PROFILE_ID -xcconfig $EXTRA_CONFIG_FILE

# create export config and embed provisioning profile
/usr/libexec/PlistBuddy -c "Clear" _XcodeTaskExportOptions.plist
/usr/libexec/PlistBuddy -c "Add method string app-store" _XcodeTaskExportOptions.plist
/usr/libexec/PlistBuddy -c "Add signingStyle string manual" _XcodeTaskExportOptions.plist
/usr/libexec/PlistBuddy -c "Add provisioningProfiles dict" _XcodeTaskExportOptions.plist
/usr/libexec/PlistBuddy -c "Add provisioningProfiles:$IOS_APP_BUNDLE_ID string $IOS_PROVISIONING_PROFILE" _XcodeTaskExportOptions.plist

# export app
echo "Exporting mobile app binary (quietly)"
xcodebuild -quiet -exportArchive -archivePath "$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/ios_build/$IOS_SDK/$IOS_APP_NAME.xcarchive" -exportPath "$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/ios_build/$IOS_SDK/$IOS_APP_NAME-export" -exportOptionsPlist _XcodeTaskExportOptions.plist

# save collected plugins for future use
$TRAVIS_BUILD_DIR/mobile/scripts/save-plugins.sh
