/* global module */
var path = require("path");
module.exports = function (config) {
    "use strict";
    config.set({
        autoWatch: true,
        singleRun: true,

        frameworks: ["jasmine-jquery", "jasmine"],

        files: [
            {
                pattern: "src/test/fixtures/*.html",
                watched: true,
                included: false,
                served: true
            },

            "node_modules/babel-core/browser-polyfill.js",
            "node_modules/rx/dist/rx.all.min.js",
            "node_modules/mock-applicationmashup/lib/vendor/mockMashupPlatform.js",
            "src/test/js/*.spec.js",
            {
                pattern: "src/images/**/*",
                watched: true,
                included: false,
                served: true
            }
        ],

        proxies: {
            //"/base": "/base/src",
            //"/images": "/base/src/images"
        },

        browsers: ["PhantomJS"],

        preprocessors: {
            "src/test/js/*.spec.js": ["webpack"]
        },

        webpack: {
            // webpack configuration
            module: {
                preLoaders: [
                    // transpile all files except testing sources with babel as usual
                    {
                        test: /\.js$/,
                        exclude: [
                            path.resolve("node_modules/")
                        ],
                        loader: "babel"
                    },
                    // transpile and instrument only testing sources with isparta
                    {
                        test: /\.js$/,
                        include: path.resolve("src/js/"),
                        loader: "isparta"
                    }
                ]
            },
            resolve: {
                modulesDirectories: [
                    "",
                    "src",
                    "node_modules"
                ]
            }
        },

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            noInfo: true
        },

        // https://github.com/usrz/javascript-karma-verbose-reporter ??
        // https://github.com/mlex/karma-spec-reporter ??
        reporters: ["nested", "junit", "coverage"],
        colors: true,

        nestedReporter: {
            color: {
                should: "red",
                browser: "yellow"
            },
            icon: {
                failure: "✘ ",
                indent: "ட ",
                browser: ""
            }
        },

        junitReporter: {
            outputDir: 'build/test-reports'
        },

        coverageReporter: {
            instrumenters: {isparta: require("isparta")},
            instrumenter: {
                "src/js/*.js": "isparta"
            },

            reporters: [
                {
                    type: "cobertura",
                    dir: "build/coverage",
                    subdir: normalizationBrowserName("xml")
                },
                {
                    type: "json",
                    dir: "build/coverage",
                    subdir: normalizationBrowserName("json")
                },
                {
                    type: "html",
                    dir: "build/coverage/",
                    subdir: normalizationBrowserName("html")
                },
                {
                    type: "text-summary"
                },
            ]
        }
    });

    function normalizationBrowserName(extra) {
        return function (browser) {
            return extra;
            // return browser.toLowerCase().split(/[ /-]/)[0] + "/" + extra;
        };
    }
};
