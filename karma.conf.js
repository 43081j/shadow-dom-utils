process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      {pattern: 'dist/test.js', type: 'module'}
    ],
    reporters: ['progress'],
    browsers: ['ChromeHeadless'],
    singleRun: false,
    autoWatch: true
  })
}
