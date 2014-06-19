/// <reference path='../_ref.d.ts' />

'use strict';

import Promise = require('bluebird');

import Print = require('../reporter/Print');
import File = require('../file/File');
import util = require('../util/util');

import TestSuiteBase = require('../suite/TestSuiteBase');

import TscTest = require('../tsc/TscTest');
import TestResult = require('../test/TestResult');
import ITestOptions = require('../test/ITestOptions');

import ITestReporter = require('../reporter/ITestReporter');

/////////////////////////////////
// Try compile without .tscparams
// It may indicate that it is compatible with --noImplicitAny maybe...
/////////////////////////////////
class TsdparamsSuite extends TestSuiteBase {
	testReporter: ITestReporter;
	printErrorCount = false;
	print: Print;

	constructor(options: ITestOptions, print: Print) {
		super(options, 'Find not required .tscparams files', 'New arrival!');

		this.print = print;

		this.testReporter = {
			printPositiveCharacter: (testResult: TestResult) => {
				this.print
					.clearCurrentLine()
					.printTypingsWithoutTestName(testResult.targetFile.filePathWithName);
			},
			printNegativeCharacter: (testResult: TestResult) => {
			}
		};
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.filter(files, (file) => {
			return util.fileExists(file.filePathWithName + '.tscparams');
		});
	}

	public runTest(targetFile: File): Promise<TestResult> {
		this.print.clearCurrentLine().out(targetFile.filePathWithName);

		return this.queue.run(new TscTest(this, targetFile, {
			tscPath: this.options.tscPath,
			useTscParams: false,
			checkNoImplicitAny: true
		})).then((result) => {
			this.testResults.push(result);
			this.print.clearCurrentLine();
			return result;
		});
	}

	public get ngTests(): TestResult[] {
		// Do not show ng test results
		return [];
	}
}

export = TsdparamsSuite;
