#!/usr/bin/env bash

set -ev

mobile/scripts/deploy-ios-app.sh

# only deploy if it's client app build
if [[ $APP_TYPE = "client" ]]; then
    mobile/scripts/deploy-android-app.sh
fi
