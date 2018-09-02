#!/usr/bin/env bash

set -v

SENTRY_URL="https://sentry.io"
SENTRY_FILE_PREFIX="app://"

SENTRY_BUILD_NAME="$TRAVIS_BUILD_NUMBER"

if [[ "$APP_DEVICE_TYPE" == "ios" ]]; then
    echo "Going to upload iOS application sourcemaps"
    FILE_PATH="$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/platforms/ios/www/build"
    SENTRY_RELEASE="$IOS_APP_BUNDLE_ID-$APP_VERSION_NUMBER"
elif [[ "$APP_DEVICE_TYPE" == "android" ]]; then
    echo "Going to upload iOS application sourcemaps"
    FILE_PATH="$TRAVIS_BUILD_DIR/mobile/$APP_TYPE/platforms/android/app/src/main/assets/www/build"
    SENTRY_RELEASE="$ANDROID_APP_BUNDLE_ID-$APP_VERSION_NUMBER"
else
    echo "App device type is unset; exiting"
    exit 1
fi

# create sentry release (this operation is idempotent, so it's ok to call
# it multiple times
curl --request POST \
     --url https://sentry.io/api/0/projects/madebeauty/mobile-stylist-staging/releases/ \
     --header "Authorization: $SENTRY_AUTH_TOKEN" \
     --form "version=$SENTRY_RELEASE"

find "$FILE_PATH" \( -name "*.js" -o -name "*.js.map" \) -print0 |
    while IFS= read -r -d $'\0' file_name; do
        file_label=$(basename "$file_name")
        file_upload_label="$SENTRY_FILE_PREFIX/$file_label"
        if [[ $file_label == *js && -f "$file_label.map" ]]; then
            source_map_link="//# sourceMappingURL=$SENTRY_FILE_PREFIX/$file_label.map"
            echo "Manually adding source map info link  $source_map_link to the end of $file_label"
            grep "$source_map_link" "$file_name" || echo -e "\n$source_map_link" >> "$file_name"
        fi
        echo "Uploading $file_name as $file_label"
        curl --request POST \
             --url "$SENTRY_URL/api/0/projects/$SENTRY_ORGANIZATION/$SENTRY_PROJECT/releases/$SENTRY_RELEASE/files/" \
             --header "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
             --form name="$file_upload_label" \
             --form dist="$SENTRY_BUILD_NAME" \
             -F file="@$file_name"
    done

