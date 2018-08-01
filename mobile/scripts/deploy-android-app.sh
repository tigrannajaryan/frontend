#!/usr/bin/env bash

GOOGLE_PLAY_ACCESS_JSON=android-cert/google-play-access.json
APK_PATH="$APP_TYPE/platforms/android/app/build/outputs/apk/release"

echo "Deploying Android app"

set -ev

cd $TRAVIS_BUILD_DIR/mobile

# decrypt google.play access key
openssl aes-256-cbc -K $encrypted_895f6a0cdc53_key -iv $encrypted_895f6a0cdc53_iv -in $GOOGLE_PLAY_ACCESS_JSON.enc -out $GOOGLE_PLAY_ACCESS_JSON -d

# generate fastlane config
rm -rf $APP_TYPE/platforms/android/fastlane || true
mkdir $APP_TYPE/platforms/android/fastlane

# auto-generate fastlane general config file
cat > $APP_TYPE/platforms/android/fastlane/Appfile << EOL
json_key_file("../../../android-cert/google-play-access.json")
package_name("$ANDROID_APP_BUNDLE_ID")
EOL

# auto-generate fastlane upload configuration
cat > $APP_TYPE/platforms/android/fastlane/Fastfile << EOL
default_platform(:android)

platform :android do
  lane :deploy do
    upload_to_play_store(
        apk: 'app/build/outputs/apk/release/app-release.apk',
        track: 'internal',
        skip_upload_metadata: true,
        skip_upload_images: true,
        skip_upload_screenshots: true,
        track_promote_to: 'internal',
        rollout: '1'
    )
  end
end
EOL

# actually upload .apk to internal track
cd $APP_TYPE/platforms/android
fastlane supply init
fastlane deploy