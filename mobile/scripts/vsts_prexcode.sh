cd mobile/stylist
echo "--Creating www folder"
mkdir www || true

echo "--Running cordova build to prepare iOS project."
npm install -g cordova xml2js

# Remove and re-add cordova-plugin-facebook4 to update app id / name
./node_modules/ionic/bin/ionic cordova plugin rm cordova-plugin-facebook4 || true
./node_modules/ionic/bin/ionic cordova plugin add cordova-plugin-facebook4 --save --variable APP_ID="$FB_APP_ID" --variable APP_NAME="$FB_APP_NAME"

# Remove and add platform; before_platform_rm hook will update
# application name, description, version and ios bundle id
./node_modules/ionic/bin/ionic cordova platform rm ios || true
./node_modules/ionic/bin/ionic cordova platform add ios || true

# generate xcode source
./node_modules/ionic/bin/ionic cordova prepare ios

echo "--Patching build config to remove standard signing credentials"
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build.xcconfig
sed -i.bak /CODE_SIGN_IDENTITY.*/d platforms/ios/cordova/build-release.xcconfig

