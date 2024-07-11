// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts


const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  exclude:
    ['./src/**/protractorCalendar.e2e-spec.ts', './src/**/projectRoles.e2e-spec.ts'],
  specs:
    ['./src/**/team.e2e-spec.ts'],
  multiCapabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        args: ["--headless", '--no-sandbox'],
        binary: "/usr/bin/google-chrome-stable"
      },
      seleniumAddress: 'http://localhost:4444/wd/hub',
    },
  ],
  SELENIUM_PROMISE_MANAGER: false,
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 50000,
    print: function () { }
  },
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, '../tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};