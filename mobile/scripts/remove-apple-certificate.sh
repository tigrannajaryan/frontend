#!/usr/bin/env bash
echo "Removing certificate"
rm $TRAVIS_BUILD_DIR/mobile/ios-cert/distribution.p12
security delete-keychain ios_signing_temp.keychain