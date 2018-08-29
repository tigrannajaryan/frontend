exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: process.env.TEST_HEADLESS ? ["--headless", "--disable-gpu", "--window-size=800,600"] : ['--no-sandbox'],
      mobileEmulation: {
        deviceName: 'iPhone 7'
      }
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4201/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function () {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });

    require('connect')().use(require('serve-static')('www')).listen(4201);
  },
  onPrepare() {
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({
      verbosity: 3,
      color: true,
      showStack: true
    }));
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      savePath: process.env.JUNIT_REPORT_PATH || 'e2e',
      outputFile: process.env.JUNIT_REPORT_NAME,
      consolidateAll: true
    }));
  }
};
