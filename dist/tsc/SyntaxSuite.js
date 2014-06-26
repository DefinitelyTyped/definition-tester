'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var TestSuiteBase = require('../suite/TestSuiteBase');
var endDts = /\w\.d\.ts$/;
/////////////////////////////////
// .d.ts syntax inspection
/////////////////////////////////
var SyntaxChecking = (function (_super) {
    __extends(SyntaxChecking, _super);
    function SyntaxChecking(options) {
        _super.call(this, options, 'Syntax checking', 'Syntax error');
    }
    SyntaxChecking.prototype.filterTargetFiles = function (files) {
        return Promise.resolve(files.filter(function (file) {
            return endDts.test(file.filePathWithName);
        }));
    };
    return SyntaxChecking;
})(TestSuiteBase);
module.exports = SyntaxChecking;
