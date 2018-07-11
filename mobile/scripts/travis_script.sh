#!/usr/bin/env bash

set -ev

cd $TRAVIS_BUILD_DIR
# restore encrypted distribution certificate file
openssl aes-256-cbc -K $encrypted_d801e47d7db5_key -iv $encrypted_d801e47d7db5_iv -in mobile/ios-cert/distribution.p12.enc -out mobile/ios-cert/distribution.p12 -d
mobile/scripts/install-apple-profile.sh
# import distribution certificate to local keychain (required for XCode signing)
IOS_DISTRIBUTION_CERT_PASSWORD="$IOS_DISTRIBUTION_CERT_PASSWORD" mobile/scripts/install-apple-certificate.sh
# run cordova prepare and patch/amend necessary assets
mobile/scripts/prepare-ios-app.sh
# actually build, archive and export iOS application
mobile/scripts/build-ios-app.sh

