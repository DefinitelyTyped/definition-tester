'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';

import * as Lazy from 'lazy.js';
import * as Promise from 'bluebird';

import Print from '../reporter/Print';
import DefaultReporter from '../reporter/DefaultReporter';

import File from '../file/File';
import FileIndex from '../file/FileIndex';

import {ITestOptions} from './ITestOptions';
import TestResult from './TestResult';

import Timer from '../util/Timer';
import GitChanges from '../util/GitChanges';

import {ITestSuite} from '../suite/ITestSuite';

import EvalSuite from '../tsc/EvalSuite';
import SyntaxSuite from '../tsc/SyntaxSuite';
import TscparamsSuite from '../tsc/TscparamsSuite';

import TSLintSuite from '../lint/TSLintSuite';

import HeaderSuite from '../header/HeaderSuite';

/////////////////////////////////
// The main class to kick things off
/////////////////////////////////
export default class TestRunner {
	public options: ITestOptions;

	private timer: Timer;
	private suites: ITestSuite[] = [];

	public changes: GitChanges;
	public index: FileIndex;
	public print: Print;

	constructor(options?: ITestOptions) {
		this.options = options;

		this.index = new FileIndex(this.options);
		this.changes = new GitChanges(this.options.dtPath);

		var tscVersion = 'unknown';
		try {
			var tscPackagePath = path.resolve(this.options.tscPath, '../../package.json');
			var json = fs.readFileSync(tscPackagePath, {encoding: 'utf8'});
			var data = JSON.parse(json);
			tscVersion = data.version;
		} catch (e) {
		}
		this.print = new Print(tscVersion);

		if (this.options.debug) {
			console.dir(this.options);
		}
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
			return this.changes.readChanges().catch((err): string[] => {
				console.dir(err.message);
				return [];
			});
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
					else if (this.options.changes) {
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
		var syntaxChecking = new SyntaxSuite(this.options);
		var testEval = new EvalSuite(this.options);
		var headers = new HeaderSuite(this.options);
		var linter = new TSLintSuite(this.options);
		var tscparams = new TscparamsSuite(this.options, this.print);

		return Promise.attempt(() => {
			assert(Array.isArray(files), 'files must be array');

			var filters: Promise<File[]>[] = [];
			// don't mess with this ordering
			filters.push(syntaxChecking.filterTargetFiles(files));
			filters.push(testEval.filterTargetFiles(files));
			filters.push(headers.filterTargetFiles(files));
			filters.push(linter.filterTargetFiles(files));
			filters.push(tscparams.filterTargetFiles(files));

			return Promise.all(filters);

		}).spread((syntaxFiles: File[], testFiles: File[], headerFiles: File[]) => {

			this.print.init(files.length, syntaxFiles.length, testFiles.length);
			this.print.printHeader(this.options);

			if (this.options.tests) {
				this.addSuite(syntaxChecking);
				this.addSuite(testEval);
			}
			if (this.options.lint) {
				this.addSuite(linter);
			}
			if (this.options.headers) {
				this.addSuite(headers);
			}
			if (this.options.tscparams) {
				this.addSuite(tscparams);
			}

			return Promise.reduce(this.suites, (count: number, suite: ITestSuite) => {
				suite.testReporter = suite.testReporter || new DefaultReporter(this.print);

				this.print.printSuiteHeader(suite.testSuiteName);

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
		let testEval: EvalSuite = Lazy(this.suites).filter((suite) => {
			return (suite instanceof EvalSuite);
		}).first();

		// TODO clean this up
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

		Lazy(this.suites).filter((suite: ITestSuite) => {
			return suite.printErrorCount;
		}).each((suite: ITestSuite) => {
			this.print.printSuiteErrorCount(suite.errorHeadline, suite.ngTests.length, suite.testResults.length);
		});
		if (testEval && withoutTestTypings) {
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
