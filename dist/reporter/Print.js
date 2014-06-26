var os = require('os');
/////////////////////////////////
// All the common things that we print are functions of this class
/////////////////////////////////
var Print = (function () {
    function Print(version) {
        this.version = version;
        this.WIDTH = 77;
    }
    Print.prototype.init = function (typings, tests, tsFiles) {
        this.typings = typings;
        this.tests = tests;
        this.tsFiles = tsFiles;
    };
    Print.prototype.out = function (s) {
        process.stdout.write(s);
        return this;
    };
    Print.prototype.repeat = function (s, times) {
        return new Array(times + 1).join(s);
    };
    Print.prototype.printChangeHeader = function () {
        this.out('=============================================================================\n');
        this.out('                    \33[36m\33[1mDefinitelyTyped Diff Detector 0.1.0\33[0m \n');
        this.out('=============================================================================\n');
    };
    Print.prototype.printHeader = function (options) {
        var totalMem = Math.round(os.totalmem() / 1024 / 1024) + ' mb';
        var freemem = Math.round(os.freemem() / 1024 / 1024) + ' mb';
        this.out('=============================================================================\n');
        this.out('                    \33[36m\33[1mDefinitelyTyped Test Runner 0.5.0\33[0m\n');
        this.out('=============================================================================\n');
        this.out(' \33[36m\33[1mTypescript version:\33[0m ' + this.version + '\n');
        this.out(' \33[36m\33[1mTypings           :\33[0m ' + this.typings + '\n');
        this.out(' \33[36m\33[1mTests             :\33[0m ' + this.tests + '\n');
        this.out(' \33[36m\33[1mTypeScript files  :\33[0m ' + this.tsFiles + '\n');
        this.out(' \33[36m\33[1mTotal Memory      :\33[0m ' + totalMem + '\n');
        this.out(' \33[36m\33[1mFree Memory       :\33[0m ' + freemem + '\n');
        this.out(' \33[36m\33[1mCores             :\33[0m ' + os.cpus().length + '\n');
        this.out(' \33[36m\33[1mConcurrent        :\33[0m ' + options.concurrent + '\n');
    };
    Print.prototype.printSuiteHeader = function (title) {
        var left = Math.floor((this.WIDTH - title.length) / 2) - 1;
        var right = Math.ceil((this.WIDTH - title.length) / 2) - 1;
        this.out(this.repeat('=', left)).out(' \33[34m\33[1m');
        this.out(title);
        this.out('\33[0m ').out(this.repeat('=', right)).printBreak();
    };
    Print.prototype.printDiv = function () {
        this.out('-----------------------------------------------------------------------------\n');
    };
    Print.prototype.printBoldDiv = function () {
        this.out('=============================================================================\n');
    };
    Print.prototype.printErrorsHeader = function () {
        this.out('=============================================================================\n');
        this.out('                    \33[34m\33[1mErrors in files\33[0m \n');
        this.out('=============================================================================\n');
    };
    Print.prototype.printErrorsForFile = function (testResult) {
        this.out('----------------- For file:' + testResult.targetFile.filePathWithName);
        if (testResult.stderr) {
            this.printBreak().out(testResult.stderr).printBreak();
        } else {
            this.printBreak().out('no stderr content').printBreak();
        }
    };
    Print.prototype.printBreak = function () {
        this.out('\n');
        return this;
    };
    Print.prototype.clearCurrentLine = function () {
        this.out('\r\33[K');
        return this;
    };
    Print.prototype.printSuccessCount = function (current, total) {
        var arb = (total === 0) ? 0 : (current / total);
        this.out(' \33[36m\33[1mSuccessful      :\33[0m \33[32m\33[1m' + (arb * 100).toFixed(2) + '% (' + current + '/' + total + ')\33[0m\n');
    };
    Print.prototype.printFailedCount = function (current, total) {
        var arb = (total === 0) ? 0 : (current / total);
        this.out(' \33[36m\33[1mFailure         :\33[0m \33[31m\33[1m' + (arb * 100).toFixed(2) + '% (' + current + '/' + total + ')\33[0m\n');
    };
    Print.prototype.printTypingsWithoutTestsMessage = function () {
        this.out(' \33[36m\33[1mTyping without tests\33[0m\n');
    };
    Print.prototype.printTotalMessage = function () {
        this.out(' \33[36m\33[1mTotal\33[0m\n');
    };
    Print.prototype.printElapsedTime = function (time, s) {
        this.out(' \33[36m\33[1mElapsed time    :\33[0m ~' + time + ' (' + s + 's)\n');
    };
    Print.prototype.printSuiteErrorCount = function (errorHeadline, current, total, warn) {
        if (typeof warn === "undefined") { warn = false; }
        var arb = (total === 0) ? 0 : (current / total);
        this.out(' \33[36m\33[1m').out(errorHeadline).out(this.repeat(' ', 16 - errorHeadline.length));
        if (warn) {
            this.out(': \33[31m\33[1m' + (arb * 100).toFixed(2) + '% (' + current + '/' + total + ')\33[0m\n');
        } else {
            this.out(': \33[33m\33[1m' + (arb * 100).toFixed(2) + '% (' + current + '/' + total + ')\33[0m\n');
        }
    };
    Print.prototype.printSubHeader = function (file) {
        this.out(' \33[36m\33[1m' + file + '\33[0m\n');
    };
    Print.prototype.printWarnCode = function (str) {
        this.out(' \33[31m\33[1m<' + str.toLowerCase().replace(/ +/g, '-') + '>\33[0m\n');
    };
    Print.prototype.printLine = function (file) {
        this.out(file + '\n');
    };
    Print.prototype.printElement = function (file) {
        this.out(' - ' + file + '\n');
    };
    Print.prototype.printElement2 = function (file) {
        this.out('    - ' + file + '\n');
    };
    Print.prototype.printTypingsWithoutTestName = function (file) {
        this.out(' - \33[33m\33[1m' + file + '\33[0m\n');
    };
    Print.prototype.printTypingsWithoutTest = function (withoutTestTypings) {
        var _this = this;
        if (withoutTestTypings.length > 0) {
            this.printTypingsWithoutTestsMessage();
            this.printDiv();
            withoutTestTypings.forEach(function (t) {
                _this.printTypingsWithoutTestName(t);
            });
        }
    };
    Print.prototype.printTestComplete = function (testResult) {
        var reporter = testResult.hostedBy.testReporter;
        if (testResult.success) {
            reporter.printPositiveCharacter(testResult);
        } else {
            reporter.printNegativeCharacter(testResult);
        }
    };
    Print.prototype.printSuiteComplete = function (suite) {
        this.printBreak();
        this.printDiv();
        this.printElapsedTime(suite.timer.asString, suite.timer.time);
        this.printSuccessCount(suite.okTests.length, suite.testResults.length);
        this.printFailedCount(suite.ngTests.length, suite.testResults.length);
    };
    Print.prototype.printTests = function (adding) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Testing');
        this.printDiv();
        var keys = Object.keys(adding);
        if (keys.length > 0) {
            keys.sort().map(function (src) {
                _this.printLine(adding[src].filePathWithName);
                return adding[src];
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printQueue = function (files) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Queued for testing');
        this.printDiv();
        if (files.length > 0) {
            files.forEach(function (file) {
                _this.printLine(file.filePathWithName);
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printTestAll = function () {
        this.printDiv();
        this.printSubHeader('Ignoring changes, testing all files');
    };
    Print.prototype.printTestInternal = function () {
        this.printDiv();
        this.printSubHeader('Infrastructure change detected, testing all files');
    };
    Print.prototype.printFiles = function (files) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Files');
        this.printDiv();
        if (files.length > 0) {
            files.forEach(function (file) {
                _this.printLine(file.filePathWithName);
                file.references.forEach(function (file) {
                    _this.printElement(file.filePathWithName);
                });
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printMissing = function (index, refMap) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Missing references');
        this.printDiv();
        var keys = Object.keys(refMap);
        if (keys.length > 0) {
            keys.sort().forEach(function (src) {
                var ref = index.getFile(src);
                _this.printLine('\33[31m\33[1m' + ref.filePathWithName + '\33[0m');
                refMap[src].forEach(function (file) {
                    _this.printElement(file.filePathWithName);
                });
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printAllChanges = function (paths) {
        var _this = this;
        this.printSubHeader('All changes');
        this.printDiv();
        if (paths.length > 0) {
            paths.sort().forEach(function (line) {
                _this.printLine(line);
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printRelChanges = function (changeMap) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Interesting files');
        this.printDiv();
        var keys = Object.keys(changeMap);
        if (keys.length > 0) {
            keys.sort().forEach(function (src) {
                _this.printLine(changeMap[src].filePathWithName);
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printRemovals = function (changeMap) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Removed files');
        this.printDiv();
        var keys = Object.keys(changeMap);
        if (keys.length > 0) {
            keys.sort().forEach(function (src) {
                _this.printLine(changeMap[src].filePathWithName);
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    Print.prototype.printRefMap = function (index, refMap) {
        var _this = this;
        this.printDiv();
        this.printSubHeader('Referring');
        this.printDiv();
        var keys = Object.keys(refMap);
        if (keys.length > 0) {
            keys.sort().forEach(function (src) {
                var ref = index.getFile(src);
                _this.printLine(ref.filePathWithName);
                refMap[src].forEach(function (file) {
                    _this.printLine(' - ' + file.filePathWithName);
                });
            });
        } else {
            this.printLine(' no files listed here');
        }
    };
    return Print;
})();
module.exports = Print;
