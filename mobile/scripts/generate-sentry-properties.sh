#!/usr/bin/env bash

# Generate sentry.properties files based on env variables
# set in main travis config

cat > $TRAVIS_BUILD_DIR/mobile/$APP_TYPE/sentry.properties << EOL
defaults.url=https://sentry.io/
defaults.org=$SENTRY_ORGANIZATION
defaults.project=$SENTRY_PROJECT
auth.token=$SENTRY_AUTH_TOKEN
cli.executable=node_modules/@sentry/cli/bin/sentry-cli
EOL
