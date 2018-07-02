#!/usr/bin/env bash
set -e
echo "Installing provisioning profile"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp mobile/stylist/ios-cert/madefinalappstore.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/