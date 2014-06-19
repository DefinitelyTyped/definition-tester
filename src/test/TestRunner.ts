/// <reference path="../_ref.d.ts" />

import path = require('path');
import assert = require('assert');

import Lazy = require('lazy.js');
import Promise = require('bluebird');

import Const = require('../Const');
import Print = require('../reporter/Print');
import DefaultReporter = require('../reporter/DefaultReporter');

import File = require('../file/File');
import FileIndex = require('../file/FileIndex');

import ITestOptions = require('./ITestOptions');
import TestResult = require('./TestResult');

import Timer = require('../util/Timer');
import GitChanges = require('../util/GitChanges');

import ITestSuite = require('../suite/ITestSuite');

import EvalSuite = require('../tsc/EvalSuite');
import SyntaxSuite = require('../tsc/SyntaxSuite');
import TscparamsSuite = require('../tsc/TscparamsSuite');

import TSLintSuite = require('../lint/TSLintSuite');

import HeaderSuite = require('../header/HeaderSuite');

/////////////////////////////////
// The main class to kick things off
/////////////////////////////////
class TestRunner {
	public dtPath: string;
	public options: ITestOptions;

	private timer: Timer;
	private suites: ITestSuite[] = [];

	public changes: GitChanges;
	public index: FileIndex;
	public print: Print;

	constructor(dtPath: string, options?: ITestOptions) {
		this.dtPath = dtPath;

		this.options = options;
		this.options.findNotRequiredTscparams = !!this.options.findNotRequiredTscparams;

		this.index = new FileIndex(this.dtPath, this.options);
		this.changes = new GitChanges(dtPath);

		this.print = new Print(this.options.tscPath);
	}

	public addSuite(suite: ITestSuite): void {
		this.suites.push(suite);
	}

	private changedInternals(changes: string[]): boolean {
		var keysWords = [
			'_infrastructure',
			'package.json',
			'tslint.json',
		];
		return changes.some((fileName) => {
			return keysWords.some((keyWord) => {
				return fileName.indexOf(keyWord) > -1;
			});
		});
	}

	public run(): Promise<boolean> {
		this.timer = new Timer();
		this.timer.start();

		this.print.printChangeHeader();

		// only includes .d.ts or -tests.ts or -test.ts or .ts
		return this.index.readIndex().then(() => {
			return this.changes.readChanges();
		}).then((changes: string[]) => {
			this.print.printAllChanges(changes);

			return this.index.collectDiff(changes).then(() => {
				this.print.printRemovals(this.index.removed);
				this.print.printRelChanges(this.index.changed);

				return this.index.parseFiles();
			}).then(() => {
				if (this.options.printRefMap) {
					this.print.printRefMap(this.index, this.index.refMap);
				}
				if (Lazy(this.index.missing).some((arr: any[]) => arr.length > 0)) {
					this.print.printMissing(this.index, this.index.missing);
					this.print.printBoldDiv();

					// bail
					return Promise.resolve(false);
				}
				if (this.options.printFiles) {
					this.print.printFiles(this.index.files);
				}

				return this.index.collectTargets().then((targets: File[]) => {
					// check overrides
					if (this.changedInternals(changes)) {
						this.print.printTestInternal();
						return this.runTests(this.index.files);
					}
					else if (this.options.testChanges) {
						this.print.printQueue(targets);
						return this.runTests(targets);
					}
					else {
						this.print.printTestAll();
						return this.runTests(this.index.files);
					}
				}).then(() => {
					// success yes/no?
					return !this.suites.some((suite) => {
						return suite.ngTests.length !== 0;
					});
				});
			});
		});
	}

	private runTests(files: File[]): Promise<void> {
		return Promise.attempt(() => {
			assert(Array.isArray(files), 'files must be array');

			var syntaxChecking = new SyntaxSuite(this.options);
			var testEval = new EvalSuite(this.options);
			var linter = new TSLintSuite(this.options, this.dtPath, path.join(this.dtPath, 'tslint.json'));
			var headers = new HeaderSuite(this.options, this.dtPath);

			var filters = [];
			// don't mess with this ordering
			filters.push(syntaxChecking.filterTargetFiles(files));
			filters.push(testEval.filterTargetFiles(files));
			filters.push(headers.filterTargetFiles(files));
			// filters.push(linter.filterTargetFiles(files));

			if (!this.options.findNotRequiredTscparams) {
				this.addSuite(syntaxChecking);
				this.addSuite(testEval);
				this.addSuite(headers);
				// this.addSuite(linter);
			}
			else {
				this.addSuite(new TscparamsSuite(this.options, this.print));
			}

			return Promise.all(filters);

		}).spread((syntaxFiles: File[], testFiles: File[]) => {

			this.print.init(syntaxFiles.length, testFiles.length, files.length);
			this.print.printHeader(this.options);

			return Promise.reduce(this.suites, (count: number, suite: ITestSuite) => {
				suite.testReporter = suite.testReporter || new DefaultReporter(this.print);

				this.print.printSuiteHeader(suite.testSuiteName);

				if (this.options.skipTests) {
					this.print.printWarnCode('skipped test');
					return Promise.resolve(count++);
				}

				return suite.start(files, (testResult) => {
					this.print.printTestComplete(testResult);
				}).then((suite) => {
					this.print.printSuiteComplete(suite);
					return count++;
				});
			}, 0);
		}).then((count) => {
			this.timer.end();
			this.finaliseTests(files);
		});
	}

	private finaliseTests(files: File[]): void {
		var testEval: EvalSuite = Lazy(this.suites).filter((suite) => {
			return (suite instanceof EvalSuite);
		}).first();

		if (testEval) {
			var existsTestTypings: string[] = Lazy(testEval.testResults).map((testResult) => {
				return testResult.targetFile.dir;
			}).reduce((a: string[], b: string) => {
				return a.indexOf(b) < 0 ? a.concat([b]) : a;
			}, []);

			var typings: string[] = Lazy(files).map((file) => {
				return file.dir;
			}).reduce((a: string[], b: string) => {
				return a.indexOf(b) < 0 ? a.concat([b]) : a;
			}, []);

			var withoutTestTypings: string[] = typings.filter((typing) => {
				return existsTestTypings.indexOf(typing) < 0;
			});

			this.print.printDiv();
			this.print.printTypingsWithoutTest(withoutTestTypings);
		}

		this.print.printDiv();
		this.print.printTotalMessage();

		this.print.printDiv();
		this.print.printElapsedTime(this.timer.asString, this.timer.time);

		this.suites.filter((suite: ITestSuite) => {
			return suite.printErrorCount;
		}).forEach((suite: ITestSuite) => {
			this.print.printSuiteErrorCount(suite.errorHeadline, suite.ngTests.length, suite.testResults.length);
		});
		if (testEval) {
			this.print.printSuiteErrorCount('Without tests', withoutTestTypings.length, typings.length, true);
		}

		this.print.printDiv();

		if (this.suites.some((suite) => {
			return suite.ngTests.length !== 0;
		})) {
			this.print.printErrorsHeader();

			this.suites.filter((suite) => {
				return suite.ngTests.length !== 0;
			}).forEach((suite) => {
				suite.ngTests.forEach((testResult: TestResult) => {
					this.print.printErrorsForFile(testResult);
				});
				this.print.printBoldDiv();
			});
		}
	}
}

export = TestRunner;
