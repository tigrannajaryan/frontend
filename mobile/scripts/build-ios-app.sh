#!/usr/bin/env bash

EXTRA_CONFIG_FILE=mobile/$APP_TYPE/platforms/ios/cordova/build-release.xcconfig

echo "Archiving and exporting iOS app with XCode"

# archive app
xcodebuild -workspace "mobile/$APP_TYPE/platforms/ios/$IOS_APP_NAME.xcworkspace" -scheme "$IOS_APP_NAME" archive -sdk $IOS_SDK -configuration Release -archivePath "ios_build/$IOS_SDK/$IOS_APP_NAME" CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY="$IOS_CODE_SIGN_IDENTITY" PROVISIONING_PROFILE=$IOS_PROVISIONING_PROFILE_ID -xcconfig $EXTRA_CONFIG_FILE

# export app
security cms -D -i "ios_build/$IOS_SDK/$IOS_APP_NAME.xcarchive/Products/Applications/$IOS_APP_NAME.app/embedded.mobileprovision"

# create export config and embed provisioning profile
/usr/libexec/PlistBuddy -c "Clear" _XcodeTaskExportOptions.plist
/usr/libexec/PlistBuddy -c "Add method string app-store" _XcodeTaskExportOptions.plist
security cms -D -i "ios_build/$IOS_SDK/$IOS_APP_NAME.xcarchive/Products/Applications/$IOS_APP_NAME.app/embedded.mobileprovision"
/usr/libexec/PlistBuddy -c "Add signingStyle string manual" _XcodeTaskExportOptions.plist
/usr/libexec/PlistBuddy -c "Add provisioningProfiles dict" _XcodeTaskExportOptions.plist
security cms -D -i "ios_build/$IOS_SDK/$IOS_APP_NAME.xcarchive/Products/Applications/$IOS_APP_NAME.app/embedded.mobileprovision"
/usr/libexec/PlistBuddy -c "Add provisioningProfiles:$IOS_APP_BUNDLE_ID string $IOS_PROVISIONING_PROFILE" _XcodeTaskExportOptions.plist
xcodebuild -exportArchive -archivePath "ios_build/$IOS_SDK/$IOS_APP_NAME.xcarchive" -exportPath "ios_build/$IOS_SDK/$IOS_APP_NAME-export" -exportOptionsPlist _XcodeTaskExportOptions.plist
