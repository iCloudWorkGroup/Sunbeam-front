// Karma configuration
// Generated on Mon Apr 23 2018 11:30:36 GMT+0800 (中国标准时间)
var webpackcfg = require('./webpack.unit');  

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    plugins: [
        'karma-jasmine',
        'karma-chrome-launcher',
        'karma-webpack',
        'karma-sourcemap-loader',
        'karma-coverage-istanbul-reporter'
    ],

    // list of files / patterns to load in the browser
    files: [
        'test/*.spec.js'
    ],

    // list of files to exclude
    exclude: [
    ],
    webpack: webpackcfg,
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'test/*.spec.js' : ['webpack', 'sourcemap']
    },


    reporters: ['coverage-istanbul'],

    coverageIstanbulReporter: {
        reports: ['html', 'text-summary'],
        dir: 'coverage/',
        fixWebpackSourcePaths: true,
        skipFilesWithNoCoverage: true,
        'report-config': {
            html: {
                subdir: 'html'
            }
        }
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
    // 'PhantomJS'
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
