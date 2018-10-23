#!/usr/bin/env bash

set -ev

mobile/scripts/deploy-ios-app.sh

# TEMPORARILY DISABLE ANDROID BUILD
# mobile/scripts/deploy-android-app.sh
