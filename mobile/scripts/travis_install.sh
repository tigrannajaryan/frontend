#!/usr/bin/env bash

set -evx

echo "Running INSTALL phase"
cd $TRAVIS_BUILD_DIR/mobile
make -j 8 build-$APP_TYPE LOG=yes

# temporary hotfix - generate sentry properties file

cat > $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/sentry.properties << EOL
defaults.url=https://sentry.io/
defaults.org=$SENTRY_ORGANIZATION
defaults.project=$SENTRY_PROJECT
auth.token=$SENTRY_AUTH_TOKEN
cli.executable=node_modules/@sentry/cli/bin/sentry-cli
EOL