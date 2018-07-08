#!/usr/bin/env bash

set -ev

echo "Running INSTALL phase"
cd $TRAVIS_BUILD_DIR/mobile
make -j 8 build-$APP_TYPE LOG=yes
