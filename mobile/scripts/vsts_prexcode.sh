cd mobile/stylist
echo "--Creating www folder"
mkdir www

echo "--Running cordova build to prepare iOS project."
npm install -g cordova
./node_modules/ionic/bin/ionic cordova platform add ios || true
./node_modules/ionic/bin/ionic cordova prepare ios

echo "--Patching build config to remove standard signing credentials"
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build.xcconfig
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build-release.xcconfig

echo "--Patching iOS build number"
# Technically, this is a lame approach. Right way to do that would be to set property
# 'ios-CFBundleVersion={build_number}' in config.xml before running 'cordova prepare'.
# That would require to write an extra hook, so I'll keep it for later time.
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $IOS_BUILD_NUMBER" platforms/ios/$IOS_APP_NAME/$IOS_APP_NAME-Info.plist
