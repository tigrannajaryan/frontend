#!/usr/bin/env bash

# This scripts performs checks and sets webapp_changesdetected=1 variable
# in VSTS if it decides that it is neccessary to build the webapp.
# If the variable is not set to 1 then VSTS is configured to skip
# all subsequent build steps using Custom Condition in the following form
#   and(succeeded(), eq(variables['webapp_changesdetected'], '1'))

# The base branch to check changes against
BASE_BRANCH_NAME="develop"

# The directory to check the changes in. Any changes outside
# this directroy will not trigger the build.
APP_DIR='webapp'

# BUILD_SOURCEBRANCH env variable is set by VSTS

echo "Building branch $BUILD_SOURCEBRANCH"

# First check if we are on the base branch ("develop" branch).
# If yes then always build, don't check the changes.
#
# TODO #1: this is not actually the best approach since it still
# results in unnecessary builds if any commit to base branch is made.
# It would be better to check the commits on base branch starting
# from the last successful build of base branch and if these commits
# include changes in our directory then only in that case allow the build.
# However I do not yet see an easy way to know which commit was the last
# successful build of base branch. This is work for future.
#
# TODO #2: check the behavior for "master" branch and make sure it is
# what we want. I only tested "develop" branch and assumed it is the only
# base branch and ignored for now the fact that also have "master" branch.

if [[ "${BUILD_SOURCEBRANCH}" = "refs/heads/${BASE_BRANCH_NAME}" ]]; then
    echo "On ${BUILD_SOURCEBRANCH} branch, always build, don't check what is changed."
    echo "##vso[task.setvariable variable=webapp_changesdetected]1"
    exit 0
fi


# Checks commits on the branch that is being built and sees if the changes
# compared to the base branch are in the webapp directory.
# If yes then the build is needed.
# This ensures that feature branch commits do not result in unneccessary builds.
# (but does not help with commits to base branch - see TODO comment above).

changes=( `git diff --name-only origin/${BASE_BRANCH_NAME}...HEAD -- $APP_DIR` )
echo Changes in ${APP_DIR} are $changes

if [[ ${#changes[@]} -eq 0 ]]; then
    echo No changes detected in $APP_DIR. Build will be skipped.
    echo "##vso[task.setvariable variable=webapp_changesdetected]0"
else
    echo Changes detected in $APP_DIR:
    echo $changes
    echo "##vso[task.setvariable variable=webapp_changesdetected]1"
fi
