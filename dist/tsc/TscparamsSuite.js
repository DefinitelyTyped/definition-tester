'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var util = require('../util/util');
var TestSuiteBase = require('../suite/TestSuiteBase');
var TscTest = require('../tsc/TscTest');
/////////////////////////////////
// Try compile without .tscparams
// It may indicate that it is compatible with --noImplicitAny maybe...
/////////////////////////////////
var TsdparamsSuite = (function (_super) {
    __extends(TsdparamsSuite, _super);
    function TsdparamsSuite(options, print) {
        var _this = this;
        _super.call(this, options, 'Find not required .tscparams files', 'New arrival!');
        this.printErrorCount = false;
        this.print = print;
        this.testReporter = {
            printPositiveCharacter: function (testResult) {
                _this.print.clearCurrentLine().printTypingsWithoutTestName(testResult.targetFile.filePathWithName);
            },
            printNegativeCharacter: function (testResult) {
            }
        };
    }
    TsdparamsSuite.prototype.filterTargetFiles = function (files) {
        return Promise.filter(files, function (file) {
            return util.fileExists(file.fullPath + '.tscparams');
        });
    };
    TsdparamsSuite.prototype.runTest = function (targetFile) {
        var _this = this;
        this.print.clearCurrentLine().out(targetFile.filePathWithName);
        return this.queue.run(new TscTest(this, targetFile, {
            tscVersion: this.options.tscVersion,
            useTscParams: false,
            checkNoImplicitAny: true
        })).then(function (result) {
            _this.testResults.push(result);
            _this.print.clearCurrentLine();
            return result;
        });
    };
    Object.defineProperty(TsdparamsSuite.prototype, "ngTests", {
        get: function () {
            // Do not show ng test results
            return [];
        },
        enumerable: true,
        configurable: true
    });
    return TsdparamsSuite;
})(TestSuiteBase);
module.exports = TsdparamsSuite;
