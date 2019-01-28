#!/usr/bin/env bash
echo "Saving node_modules for use in next build phase"

export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$AWS_SECURE_KEY"
NODE_MODULES_ARCHIVE_FILENAME=$TRAVIS_BUILD_NUMBER-$APP_TYPE-$MB_ENV-node_modules.tar.gz
sudo pip install awscli
cd $TRAVIS_BUILD_DIR/mobile/$APP_TYPE
tar -zcf $TRAVIS_BUILD_DIR/mobile/$NODE_MODULES_ARCHIVE_FILENAME node_modules
aws s3 cp $TRAVIS_BUILD_DIR/mobile/$NODE_MODULES_ARCHIVE_FILENAME s3://made-travis-cache/node-modules-cache/$NODE_MODULES_ARCHIVE_FILENAME
