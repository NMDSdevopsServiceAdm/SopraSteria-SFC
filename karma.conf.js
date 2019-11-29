// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports = function (config) {
  process.env.CHROME_BIN = require('puppeteer').executablePath()
  process.env.NO_PROXY = 'localhost, 0.0.0.0/4201, 0.0.0.0/9876';
  process.env.no_proxy = 'localhost, 0.0.0.0/4201, 0.0.0.0/9876';
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '/fecoverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['HeadlessChrome'],
    customLaunchers: {
      HeadlessChrome: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox']
        }
    },
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    singleRun: true,
  	browserNoActivityTimeout: 100000
  });
};
