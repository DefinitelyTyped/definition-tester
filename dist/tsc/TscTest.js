var TestResult = require('../test/TestResult');
var Tsc = require('../tsc/Tsc');
/////////////////////////////////
// Single test
/////////////////////////////////
var TscTest = (function () {
    function TscTest(suite, tsfile, options) {
        this.suite = suite;
        this.tsfile = tsfile;
        this.options = options;
    }
    TscTest.prototype.run = function () {
        var _this = this;
        return Tsc.run(this.tsfile.fullPath, this.options).then(function (execResult) {
            var testResult = new TestResult();
            testResult.hostedBy = _this.suite;
            testResult.targetFile = _this.tsfile;
            testResult.stdout = execResult.stdout;
            testResult.stderr = execResult.stderr;
            testResult.exitCode = execResult.exitCode;
            return testResult;
        });
    };
    return TscTest;
})();
module.exports = TscTest;
