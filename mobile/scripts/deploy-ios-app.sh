#!/usr/bin/env bash
set -e
echo "Deploying to TestFlight"

# we should not fix fastlane version here, since we really do depend on freshness
# of Fastlane: they follow changes in appStoreConnect
gem install fastlane -v '>= 2.103.1'

fastlane pilot upload -u $FASTLANE_USER -i "$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/ios_build/$IOS_SDK/$IOS_APP_NAME-export/$IOS_APP_NAME.ipa" -a $IOS_APP_BUNDLE_ID --changelog "$TRAVIS_COMMIT_MESSAGE" --skip_waiting_for_build_processing $FASTLANE_SKIP_WAITING --distribute_external $FASTLANE_DISTRIBUTE_EXTERNAL
# deploy build artifacts to Sentry
echo "Deploying source maps to Sentry"
APP_DEVICE_TYPE=ios $TRAVIS_BUILD_DIR/mobile/scripts/upload-sentry-artifacts.sh