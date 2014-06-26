var assert = require('assert');
var Lazy = require('lazy.js');
var Promise = require('bluebird');
var Print = require('../reporter/Print');
var DefaultReporter = require('../reporter/DefaultReporter');
var FileIndex = require('../file/FileIndex');
var Timer = require('../util/Timer');
var GitChanges = require('../util/GitChanges');
var EvalSuite = require('../tsc/EvalSuite');
var SyntaxSuite = require('../tsc/SyntaxSuite');
var TscparamsSuite = require('../tsc/TscparamsSuite');
var TSLintSuite = require('../lint/TSLintSuite');
var HeaderSuite = require('../header/HeaderSuite');
/////////////////////////////////
// The main class to kick things off
/////////////////////////////////
var TestRunner = (function () {
    function TestRunner(options) {
        this.suites = [];
        this.options = options;
        this.options.findNotRequiredTscparams = !!this.options.findNotRequiredTscparams;
        this.index = new FileIndex(this.options);
        this.changes = new GitChanges(this.options.dtPath);
        this.print = new Print(this.options.tscVersion);
    }
    TestRunner.prototype.addSuite = function (suite) {
        this.suites.push(suite);
    };
    TestRunner.prototype.changedInternals = function (changes) {
        var keysWords = [
            '_infrastructure',
            'package.json',
            'tslint.json'
        ];
        return changes.some(function (fileName) {
            return keysWords.some(function (keyWord) {
                return fileName.indexOf(keyWord) > -1;
            });
        });
    };
    TestRunner.prototype.run = function () {
        var _this = this;
        this.timer = new Timer();
        this.timer.start();
        this.print.printChangeHeader();
        // only includes .d.ts or -tests.ts or -test.ts or .ts
        return this.index.readIndex().then(function () {
            return _this.changes.readChanges().catch(function (err) {
                console.dir(err.message);
                return [];
            });
        }).then(function (changes) {
            _this.print.printAllChanges(changes);
            return _this.index.collectDiff(changes).then(function () {
                _this.print.printRemovals(_this.index.removed);
                _this.print.printRelChanges(_this.index.changed);
                return _this.index.parseFiles();
            }).then(function () {
                if (_this.options.printRefMap) {
                    _this.print.printRefMap(_this.index, _this.index.refMap);
                }
                if (Lazy(_this.index.missing).some(function (arr) {
                    return arr.length > 0;
                })) {
                    _this.print.printMissing(_this.index, _this.index.missing);
                    _this.print.printBoldDiv();
                    // bail
                    return Promise.resolve(false);
                }
                if (_this.options.printFiles) {
                    _this.print.printFiles(_this.index.files);
                }
                return _this.index.collectTargets().then(function (targets) {
                    // check overrides
                    if (_this.changedInternals(changes)) {
                        _this.print.printTestInternal();
                        return _this.runTests(_this.index.files);
                    } else if (_this.options.testChanges) {
                        _this.print.printQueue(targets);
                        return _this.runTests(targets);
                    } else {
                        _this.print.printTestAll();
                        return _this.runTests(_this.index.files);
                    }
                }).then(function () {
                    // success yes/no?
                    return !_this.suites.some(function (suite) {
                        return suite.ngTests.length !== 0;
                    });
                });
            });
        });
    };
    TestRunner.prototype.runTests = function (files) {
        var _this = this;
        return Promise.attempt(function () {
            assert(Array.isArray(files), 'files must be array');
            var syntaxChecking = new SyntaxSuite(_this.options);
            var testEval = new EvalSuite(_this.options);
            var linter = new TSLintSuite(_this.options);
            var headers = new HeaderSuite(_this.options);
            var filters = [];
            // don't mess with this ordering
            filters.push(syntaxChecking.filterTargetFiles(files));
            filters.push(testEval.filterTargetFiles(files));
            filters.push(headers.filterTargetFiles(files));
            // filters.push(linter.filterTargetFiles(files));
            if (!_this.options.findNotRequiredTscparams) {
                _this.addSuite(syntaxChecking);
                _this.addSuite(testEval);
                _this.addSuite(headers);
                // this.addSuite(linter);
            } else {
                _this.addSuite(new TscparamsSuite(_this.options, _this.print));
            }
            return Promise.all(filters);
        }).spread(function (syntaxFiles, testFiles) {
            _this.print.init(syntaxFiles.length, testFiles.length, files.length);
            _this.print.printHeader(_this.options);
            return Promise.reduce(_this.suites, function (count, suite) {
                suite.testReporter = suite.testReporter || new DefaultReporter(_this.print);
                _this.print.printSuiteHeader(suite.testSuiteName);
                if (_this.options.skipTests) {
                    _this.print.printWarnCode('skipped test');
                    return Promise.resolve(count++);
                }
                return suite.start(files, function (testResult) {
                    _this.print.printTestComplete(testResult);
                }).then(function (suite) {
                    _this.print.printSuiteComplete(suite);
                    return count++;
                });
            }, 0);
        }).then(function (count) {
            _this.timer.end();
            _this.finaliseTests(files);
        });
    };
    TestRunner.prototype.finaliseTests = function (files) {
        var _this = this;
        var testEval = Lazy(this.suites).filter(function (suite) {
            return (suite instanceof EvalSuite);
        }).first();
        if (testEval) {
            var existsTestTypings = Lazy(testEval.testResults).map(function (testResult) {
                return testResult.targetFile.dir;
            }).reduce(function (a, b) {
                return a.indexOf(b) < 0 ? a.concat([b]) : a;
            }, []);
            var typings = Lazy(files).map(function (file) {
                return file.dir;
            }).reduce(function (a, b) {
                return a.indexOf(b) < 0 ? a.concat([b]) : a;
            }, []);
            var withoutTestTypings = typings.filter(function (typing) {
                return existsTestTypings.indexOf(typing) < 0;
            });
            this.print.printDiv();
            this.print.printTypingsWithoutTest(withoutTestTypings);
        }
        this.print.printDiv();
        this.print.printTotalMessage();
        this.print.printDiv();
        this.print.printElapsedTime(this.timer.asString, this.timer.time);
        this.suites.filter(function (suite) {
            return suite.printErrorCount;
        }).forEach(function (suite) {
            _this.print.printSuiteErrorCount(suite.errorHeadline, suite.ngTests.length, suite.testResults.length);
        });
        if (testEval) {
            this.print.printSuiteErrorCount('Without tests', withoutTestTypings.length, typings.length, true);
        }
        this.print.printDiv();
        if (this.suites.some(function (suite) {
            return suite.ngTests.length !== 0;
        })) {
            this.print.printErrorsHeader();
            this.suites.filter(function (suite) {
                return suite.ngTests.length !== 0;
            }).forEach(function (suite) {
                suite.ngTests.forEach(function (testResult) {
                    _this.print.printErrorsForFile(testResult);
                });
                _this.print.printBoldDiv();
            });
        }
    };
    return TestRunner;
})();
module.exports = TestRunner;
