#!/usr/bin/env bash

set -ev
echo "Installing provisioning profiles"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp mobile/ios-cert/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/