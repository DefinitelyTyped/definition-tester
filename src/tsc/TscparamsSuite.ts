'use strict';

import * as Promise from 'bluebird';

import Print from '../reporter/Print';
import File from '../file/File';
import * as util from '../util/util';

import TestSuiteBase from '../suite/TestSuiteBase';

import TscTest from '../tsc/TscTest';
import TestResult from '../test/TestResult';
import {ITestOptions} from '../test/ITestOptions';

import {ITestReporter} from '../reporter/ITestReporter';

/////////////////////////////////
// Try compile without .tscparams
// It may indicate that it is compatible with --noImplicitAny maybe...
/////////////////////////////////
export default class TsdparamsSuite extends TestSuiteBase {
	testReporter: ITestReporter;
	printErrorCount = false;
	print: Print;

	constructor(options: ITestOptions, print: Print) {
		super(options, 'Find not required .tscparams files', 'New arrival!');
	}

	public runTest(targetFile: File): Promise<TestResult> {
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
