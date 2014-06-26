'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var TestSuiteBase = require('../suite/TestSuiteBase');
var endTestDts = /\w-tests?\.ts$/i;
/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
var TestEval = (function (_super) {
    __extends(TestEval, _super);
    function TestEval(options) {
        _super.call(this, options, 'Typing tests', 'Failed tests');
    }
    TestEval.prototype.filterTargetFiles = function (files) {
        return Promise.resolve(files.filter(function (file) {
            return endTestDts.test(file.filePathWithName);
        }));
    };
    return TestEval;
})(TestSuiteBase);
module.exports = TestEval;
