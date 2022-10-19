const isCI = require('is-ci');

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports = function (config) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
  process.env.NO_PROXY = 'localhost, 0.0.0.0/4201, 0.0.0.0/9876';
  process.env.no_proxy = 'localhost, 0.0.0.0/4201, 0.0.0.0/9876';
  config.set({
    basePath: '',
    frameworks: isCI
      ? ['parallel', 'jasmine', '@angular-devkit/build-angular']
      : ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-junit-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-parallel'),
      require('karma-spec-reporter'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false,
      },
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '/fecoverage'),
      subdir: '.',
      reporters: [{ type: 'lcov' }, { type: 'text-summary' }],
      check: {
        global: {
          statements: 71,
          branches: 49,
          functions: 65,
          lines: 73,
        },
      },
    },
    reporters: ['progress', 'junit', 'spec'],

    specReporter: {
      maxLogLines: 5, // limit number of lines logged per test
      suppressSummary: true, // do not print summary
      suppressErrorSummary: true, // do not print error summary
      suppressFailed: false, // do not print information about failed tests
      suppressPassed: false, // do not print information about passed tests
      suppressSkipped: true, // do not print information about skipped tests
      showBrowser: false, // print the browser for each spec
      showSpecTiming: false, // print the time elapsed for each spec
      failFast: true, // test would finish with error when a first fail occurs
      prefixes: {
        success: '    OK: ', // override prefix for passed tests, default is '✓ '
        failure: 'FAILED: ', // override prefix for failed tests, default is '✗ '
        skipped: 'SKIPPED: ', // override prefix for skipped tests, default is '- '
      },
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !isCI,
    singleRun: isCI,
    browsers: ['HeadlessChrome'],
    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 100000,
    captureTimeout: 140000,
    junitReporter: {
      outputDir: process.env.JUNIT_REPORT_PATH,
      outputFile: process.env.JUNIT_REPORT_NAME,
      useBrowserName: false,
    },
    parallelOptions: {
      executors: 4,
      shardStrategy: 'round-robin',
    },
  });
};
