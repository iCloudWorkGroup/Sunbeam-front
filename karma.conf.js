// Karma configuration
// Generated on Mon Apr 23 2018 11:30:36 GMT+0800 (中国标准时间)
var webpack = require('webpack'),
unitConfig = require('./webpack.unit');

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'test/unit/**/*.spec.js'
        ],

        // list of files to exclude
        exclude: ['src/lib/*.js'],
        webpack: unitConfig,
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/unit/**/*.spec.js': ['webpack']
        },
        reporters: ['progress', 'coverage-istanbul'],
        coverageIstanbulReporter: {
            reports: ['text-summary', 'html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // 'ChromeHeadless'
        browsers: ['Chrome'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
        browserDisconnectTimeout: 20000,
        browserNoActivityTimeout: 20000,
        browserConsoleLogOptions: {
            level: 'log',
            terminal: true
        }
    })
}