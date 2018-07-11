#!/usr/bin/env bash

# This script checks files changed in $TRAVIS_COMMIT_RANGE against
# shared folders and $APP_TYPE env variable (which is either "client" or "stylist".
# If a file in the commit range belongs to shared folder or build's folder - the
# script will return error code 1, hence passing control to the actual build script.
# The build phase result in this case will depend on success or failure of the actual
# build script which runs after this one from .travis.yml configuration.
# If the commit range's changes are outside of both shared folders and application
# folder, script terminates with error code 0 (success) which prevents actual
# build script from running, and marks build step as successfully finished.

MOBILE_FOLDER=mobile
SHARED_FOLDERS=("scripts" "shared")

CHANGE_SCOPE=`git diff --name-only "$TRAVIS_COMMIT_RANGE"`

for CHANGED_ENTITY in $CHANGE_SCOPE; do
    for SHARED_FOLDER in "${SHARED_FOLDERS[@]}"; do
        if [[ $CHANGED_ENTITY = "$MOBILE_FOLDER/$SHARED_FOLDER"* ]]; then
            echo "$CHANGED_ENTITY belongs to shared folder $MOBILE_FOLDER/$SHARED_FOLDER. Build MUST be triggered"
            exit 1
        fi
    done
    if [[ $CHANGED_ENTITY = "$MOBILE_FOLDER/$APP_TYPE"* ]]; then
        echo "$CHANGED_ENTITY belongs to shared folder $MOBILE_FOLDER/$APP_TYPE. Build MUST be triggered"
        exit 1
    fi
done

echo "No changes shared folders or to $MOBILE_FOLDER/$APP_TYPE; build will be SKIPPED"
exit 0
