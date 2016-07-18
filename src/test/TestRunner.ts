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

import * as util from '../util/util';
import Timer from '../util/Timer';
import GitChanges from '../util/GitChanges';

import {ITestSuite} from '../suite/ITestSuite';

import EvalSuite from '../tsc/EvalSuite';
import SyntaxSuite from '../tsc/SyntaxSuite';
import TscparamsSuite from '../tsc/TscparamsSuite';

import TSLintSuite from '../lint/TSLintSuite';

import HeaderSuite from '../header/HeaderSuite';

function isEntryPointFile(file: util.FullPath) : boolean {
	const name = path.basename(file);
	return name === 'index.d.ts' || name === `${path.basename(path.dirname(file))}.d.ts`;
}

/////////////////////////////////
// The main class to kick things off
/////////////////////////////////
export default class TestRunner {
	private timer: Timer;
	private suites: ITestSuite[] = [];

	public changes: GitChanges;
	public index: FileIndex;
	public print: Print;

	constructor(private options: ITestOptions) {
		this.index = new FileIndex(options);
		this.changes = new GitChanges(options.dtPath);

		let tscVersion = 'unknown';
		try {
			let tscPackagePath = path.resolve(options.tscPath, '../../package.json');
			let json = fs.readFileSync(tscPackagePath, { encoding: 'utf8' });
			let data = JSON.parse(json);
			tscVersion = data.version;
		} catch (e) {
		}
		this.print = new Print(tscVersion);

		if (options.debug) {
			console.dir(options);
		}
	}

	public addSuite(suite: ITestSuite): void {
		this.suites.push(suite);
	}

	private getTestsToRun(): Promise<util.TsConfigFullPath[]> {
		return new Promise<util.TsConfigFullPath[]>(resolve => {
			if (this.options.changes) {
				this.changes.readChanges().done((changes => {
					// Every changed file adds its parent folder to the
					// list of things to run
					const changedFolders: {[name: string]: boolean } = {};
					changes.forEach(ch => {
						changedFolders[path.dirname(ch)] = true;
					});
					resolve(Object.keys(changedFolders).map(s => path.join(s, 'tsconfig.json') as util.TsConfigFullPath));
				}));
			} else {
				// Just go with all config files
				resolve(this.index.findFilesByName(/^tsconfig\.json$/i) as Promise<util.TsConfigFullPath[]>);
			}
		});
	}
	private getTsFiles(): Promise<util.FullPath[]> {
		return new Promise<util.FullPath[]>(resolve => {
			if (this.options.changes) {
				this.changes.readChanges().done((changes => {
					// Every changed file adds its parent folder to the
					// list of things to run
					const changedFolders: {[name: string]: boolean } = {};
					changes.forEach(ch => {
						changedFolders[path.dirname(ch)] = true;
					});
					const a: Promise<util.FullPath[]>[] = Object.keys(changedFolders).map(s => this.index.findFilesByName(/\w\.d\.ts$/));
					const b: Promise<util.FullPath[][]> = Promise.all(a);
					resolve(b.then(results => results.reduce((memo, results) => memo.concat(results), [])));
				}));
			} else {
				// Just go with all config files
				resolve(this.index.findFilesByName(/\w\.d\.ts$/) as Promise<util.FullPath[]>);
			}
		});
	}

	public run(): Promise<boolean> {
		this.timer = new Timer();
		this.timer.start();

		return new Promise<boolean>(resolve => {
			this.getTestsToRun().done(testsToRun => {
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
				this.runTests(testsToRun.map(test => File.fromFullPath(test))).then(() => {
					// success yes/no?
					return !this.suites.some((suite) => {
						return suite.ngTests.length !== 0;
					});
				});
			});
		});
	}

	private runTests(files: File[]): Promise<void> {
		let syntaxChecking = new SyntaxSuite(this.options);
		let headers = new HeaderSuite(this.options);
		let linter = new TSLintSuite(this.options);

		return new Promise<void>(resolve => {
			this.print.init(files.length, files.length);
			this.print.printHeader(this.options);

			if (this.options.tests) {
				this.addSuite(syntaxChecking);
			}
			if (this.options.lint) {
				this.addSuite(linter);
			}
			if (this.options.headers) {
				this.addSuite(headers);
			}

			return Promise.reduce(this.suites, (count: number, suite: ITestSuite) => {
				suite.testReporter = suite.testReporter || new DefaultReporter(this.print);

				this.print.printSuiteHeader(suite.testSuiteName);
				if (suite.testSuiteName === 'Header format') {
					this.getTsFiles().done(tsFiles => {
						return suite.start((tsFiles.filter(isEntryPointFile)).map(test => File.fromFullPath(test)), (testResult) => {
							this.print.printTestComplete(testResult);
						}).then((suite) => {
							this.print.printSuiteComplete(suite);
							return count++;
						});
					});
				}
				else {
					return suite.start(files, (testResult) => {
						this.print.printTestComplete(testResult);
					}).then((suite) => {
						this.print.printSuiteComplete(suite);
						return count++;
					});
				}

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
        let typings: string[];
        let withoutTestTypings: string[];
		if (testEval) {
			let existsTestTypings: string[] = Lazy(testEval.testResults).map((testResult) => {
				return testResult.targetFile.containingFolderPath;
			}).reduce((a: string[], b: string) => {
				return a.indexOf(b) < 0 ? a.concat([b]) : a;
			}, []);

			typings = Lazy(files).map((file) => {
				return file.containingFolderPath;
			}).reduce((a: string[], b: string) => {
				return a.indexOf(b) < 0 ? a.concat([b]) : a;
			}, []);

			withoutTestTypings = typings.filter((typing) => {
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
