var path = require('path');
var exec = require('../util/exec');
var TestResult = require('../test/TestResult');
var Formatter = require('./TSLintFormatter');
// dummy to fool bugged compiler optimisation
[Formatter];
/////////////////////////////////
// Single test
/////////////////////////////////
var TSLintTest = (function () {
    function TSLintTest(suite, tsfile, configFile) {
        this.suite = suite;
        this.tsfile = tsfile;
        this.configFile = configFile;
    }
    TSLintTest.prototype.run = function () {
        var _this = this;
        var bin = path.resolve(this.suite.options.testerPath, 'node_modules', 'tslint', 'bin', 'tslint-cli.js');
        var args = [
            bin,
            '--file', this.tsfile.filePathWithName,
            '--config', this.configFile,
            '--format', path.resolve(this.suite.options.testerPath, 'dist', 'lint', 'Formatter')
        ];
        return exec.exec('node', args).then(function (execResult) {
            var testResult = new TestResult();
            testResult.hostedBy = _this.suite;
            testResult.targetFile = _this.tsfile;
            testResult.stdout = execResult.stdout;
            testResult.stderr = execResult.stderr;
            testResult.exitCode = execResult.exitCode;
            // console.log(testResult.stdout);
            return testResult;
        });
    };
    return TSLintTest;
})();
module.exports = TSLintTest;
