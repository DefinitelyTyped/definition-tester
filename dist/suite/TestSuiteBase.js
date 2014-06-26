'use strict';
var path = require('path');
var Promise = require('bluebird');
var Timer = require('../util/Timer');
var TscTest = require('../tsc/TscTest');
var TestQueue = require('../test/TestQueue');
/////////////////////////////////
// Base class for test suite
/////////////////////////////////
var TestSuiteBase = (function () {
    function TestSuiteBase(options, testSuiteName, errorHeadline) {
        this.timer = new Timer();
        this.testResults = [];
        this.printErrorCount = true;
        this.options = options;
        this.testSuiteName = testSuiteName;
        this.errorHeadline = errorHeadline;
        this.queue = new TestQueue(options.concurrent);
    }
    TestSuiteBase.prototype.filterTargetFiles = function (files) {
        throw new Error('please implement this method');
    };
    TestSuiteBase.prototype.start = function (targetFiles, testCallback) {
        var _this = this;
        this.timer.start();
        return this.filterTargetFiles(targetFiles).then(function (targetFiles) {
            // tests get queued for multi-threading
            return Promise.all(targetFiles.map(function (targetFile) {
                return _this.runTest(targetFile).then(function (result) {
                    testCallback(result);
                });
            }));
        }).then(function () {
            _this.timer.end();
            return _this;
        });
    };
    TestSuiteBase.prototype.runTest = function (targetFile) {
        var _this = this;
        return this.queue.run(new TscTest(this, targetFile, {
            tscPath: path.join(this.options.dtPath, '_infrastructure', 'tests', 'typescript'),
            tscVersion: this.options.tscVersion
        })).then(function (result) {
            _this.testResults.push(result);
            return result;
        });
    };
    Object.defineProperty(TestSuiteBase.prototype, "okTests", {
        get: function () {
            return this.testResults.filter(function (r) {
                return r.success;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestSuiteBase.prototype, "ngTests", {
        get: function () {
            return this.testResults.filter(function (r) {
                return !r.success;
            });
        },
        enumerable: true,
        configurable: true
    });
    return TestSuiteBase;
})();
module.exports = TestSuiteBase;
