#!/usr/bin/env bash
set -e
echo "Installing distribution certificate"

openssl pkcs12 -in mobile/ios-cert/distribution.p12 -nokeys -passin pass:$IOS_DISTRIBUTION_CERT_PASSWORD | openssl x509 -noout -fingerprint
openssl pkcs12 -in mobile/ios-cert/distribution.p12 -nokeys -passin pass:$IOS_DISTRIBUTION_CERT_PASSWORD | openssl x509 -noout -subject

security create-keychain -p some_dummy_password ios_signing_temp.keychain
security set-keychain-settings -lut 7200 ios_signing_temp.keychain
security unlock-keychain -p some_dummy_password ios_signing_temp.keychain
security import mobile/ios-cert/distribution.p12 -P $IOS_DISTRIBUTION_CERT_PASSWORD -A -t cert -f pkcs12 -k ios_signing_temp.keychain
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k some_dummy_password ios_signing_temp.keychain

security list-keychain -d user
security list-keychain -d user -s ios_signing_temp.keychain login.keychain-db
security list-keychain -d user