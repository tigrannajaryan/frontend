#!/usr/bin/env bash
echo "Removing certificate"
rm mobile/stylist/ios-cert/distribution.p12
security delete-keychain ios_signing_temp.keychain