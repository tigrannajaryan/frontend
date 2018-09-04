# This script continuously runs E2E tests, which is nice for checking the stability of the tests.
cd ..

i=1
while true;
do
  echo
  echo "===========> Starting iteration $i"
  TEST_HEADLESS=1 NODE_PRESERVE_SYMLINKS=1 ./node_modules/.bin/protractor
  if [ $? -ne 0 ] ; then
    echo "Tests failed"
    exit
  fi
  i=$((i+1))
done
