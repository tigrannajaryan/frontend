@echo off
rem This scripts performs checks and sets mobileapp_changesdetected=1 variable
rem in VSTS if it decides that it is neccessary to build the webapp.
rem If the variable is not set to 1 then VSTS is configured to skip
rem all subsequent build steps using Custom Condition in the following form
rem   and(succeeded(), eq(variables['mobileapp_changesdetected'], '1'))

rem The base branch to check changes against
set BASE_BRANCH_NAME=develop

rem The directory to check the changes in. Any changes outside
rem this directroy will not trigger the build.
set APP_DIR=mobile

rem BUILD_SOURCEBRANCH env variable is set by VSTS

echo Building branch %BUILD_SOURCEBRANCH%

rem First check if we are on the base branch ("develop" branch).
rem If yes then always build, don't check the changes.

rem TODO #1: this is not actually the best approach since it still
rem results in unnecessary builds if any commit to base branch is made.
rem It would be better to check the commits on base branch starting
rem from the last successful build of base branch and if these commits
rem include changes in our directory then only in that case allow the build.
rem However I do not yet see an easy way to know which commit was the last
rem successful build of base branch. This is work for future.

rem TODO #2: check the behavior for "master" branch and make sure it is
rem what we want. I only tested "develop" branch and assumed it is the only
rem base branch and ignored for now the fact that also have "master" branch.

if "%BUILD_SOURCEBRANCH%"=="refs/heads/%BASE_BRANCH_NAME%" (
    echo On %BUILD_SOURCEBRANCH% branch, always build, don't check what is changed.
    echo ##vso[task.setvariable variable=mobileapp_changesdetected]1
    exit 0
)


rem Checks commits on the branch that is being built and sees if the changes
rem compared to the base branch are in the webapp directory.
rem If yes then the build is needed.
rem This ensures that feature branch commits do not result in unneccessary builds.
rem (but does not help with commits to base branch - see TODO comment above).

for /f %%i in ('git diff --name-only origin/%BASE_BRANCH_NAME%...HEAD -- %APP_DIR%') do set changes=%%i
echo Changes in %APP_DIR% are %changes%

if "%changes%"=="" (
    echo No changes detected in %APP_DIR%. Build will be skipped.
    echo ##vso[task.setvariable variable=mobileapp_changesdetected]0
) else (
    echo Changes detected in %APP_DIR%:
    echo %changes%
    echo ##vso[task.setvariable variable=mobileapp_changesdetected]1
)
