'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var TSLintTest = require('./TSLintTest');
var TestSuiteBase = require('../suite/TestSuiteBase');
var endDts = /\w\.d\.ts$/;
/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
var TSLintSuite = (function (_super) {
    __extends(TSLintSuite, _super);
    function TSLintSuite(options) {
        _super.call(this, options, 'Linting', 'Found some lint');
    }
    TSLintSuite.prototype.filterTargetFiles = function (files) {
        return Promise.resolve(files.filter(function (file) {
            return endDts.test(file.filePathWithName);
        }));
    };
    TSLintSuite.prototype.runTest = function (targetFile) {
        var _this = this;
        return this.queue.run(new TSLintTest(this, targetFile, this.options.tslintConfig)).then(function (result) {
            _this.testResults.push(result);
            return result;
        });
    };
    return TSLintSuite;
})(TestSuiteBase);
module.exports = TSLintSuite;
