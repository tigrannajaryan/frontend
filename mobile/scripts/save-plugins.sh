#!/usr/bin/env bash

# if it's a pull request - we don't want to save plugins state; just exit
if [[ $TRAVIS_PULL_REQUEST != "false" ]]; then
    exit 0
fi
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$AWS_SECURE_KEY"
PLUGIN_ARCHIVE_FILENAME=$APP_TYPE-$MB_ENV-$TRAVIS_OS_NAME-plugins.tar.gz

echo "Saving plugin cache"
cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE

# phonegap-plugin-push and cordova-support-google-services cannot be cached;
# we need to remove them from plugins before saving
./node_modules/ionic/bin/ionic cordova plugin rm phonegap-plugin-push || true
./node_modules/ionic/bin/ionic cordova plugin rm cordova-support-google-services || true

tar -zcf $TRAVIS_BUILD_DIR/mobile/$PLUGIN_ARCHIVE_FILENAME plugins
aws s3 cp $TRAVIS_BUILD_DIR/mobile/$PLUGIN_ARCHIVE_FILENAME s3://made-travis-cache/plugin-cache/$PLUGIN_ARCHIVE_FILENAME
