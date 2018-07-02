#!/usr/bin/env bash
set -e
echo "Deploying to TestFlight"
fastlane pilot upload -u $FASTLANE_USER -i "ios_build/$IOS_SDK/$IOS_APP_NAME-export/$IOS_APP_NAME.ipa" -a $IOS_APP_BUNDLE_ID --changelog "$TRAVIS_COMMIT_MESSAGE" --skip_waiting_for_build_processing $FASTLANE_SKIP_WAITING --distribute_external $FASTLANE_DISTRIBUTE_EXTERNAL --groups "$FASTLANE_EXTERNAL_GROUP_LIST"