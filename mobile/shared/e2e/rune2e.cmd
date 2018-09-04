@echo off
rem This script runs E2E tests if this is not a production build

rem Go to project's root dir
cd %~dp0\..\..

if "%MB_ENV%" == "prod" (
  echo Skipping all E2E tests in production build.
) else (
  set TEST_HEADLESS=1
  set NODE_PRESERVE_SYMLINKS=1
  node_modules\.bin\protractor
)