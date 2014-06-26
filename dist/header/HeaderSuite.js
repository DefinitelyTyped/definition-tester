'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var DH = require('definition-header');
var util = require('../util/util');
var TestResult = require('../test/TestResult');
var TestSuiteBase = require('../suite/TestSuiteBase');
var isDef = /^[\w\.-]+[\\\/][\w\.-]+\.d\.ts$/;
/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
var HeaderSuite = (function (_super) {
    __extends(HeaderSuite, _super);
    function HeaderSuite(options) {
        _super.call(this, options, 'Header format', 'Invalid header');
    }
    HeaderSuite.prototype.filterTargetFiles = function (files) {
        return Promise.resolve(files.filter(function (file) {
            return isDef.test(file.filePathWithName);
        }));
    };
    HeaderSuite.prototype.runTest = function (targetFile) {
        var _this = this;
        return util.readFile(targetFile.fullPath).then(function (content) {
            var testResult = new TestResult();
            testResult.hostedBy = _this;
            testResult.targetFile = targetFile;
            if (DH.isPartial(content)) {
                testResult.exitCode = 0;
            } else {
                var result = DH.parse(content);
                if (result.success) {
                    testResult.exitCode = 0;
                } else {
                    testResult.exitCode = 1;
                    testResult.stderr = '\n' + result.details;
                }
            }
            _this.testResults.push(testResult);
            return testResult;
        });
    };
    return HeaderSuite;
})(TestSuiteBase);
module.exports = HeaderSuite;
