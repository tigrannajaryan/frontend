#!/usr/bin/env bash

set -evx

echo "Running INSTALL phase"
cd $TRAVIS_BUILD_DIR/mobile

# explicitly set headless chrome version; Linux distros on Travis have 2 concurrent
# versions - stable and beta, and stable is default. We need beta to run with protractor.
sudo rm /etc/alternatives/google-chrome
sudo ln -s /usr/bin/google-chrome-beta /etc/alternatives/google-chrome
make -j 8 build-$APP_TYPE LOG=yes

# save node_modules for subsequent use - only if it's not a pull request
# TODO: add check for non-pr
$TRAVIS_BUILD_DIR/mobile/scripts/save-node-cache.sh