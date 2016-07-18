'use strict';

import * as path from 'path';
import * as Promise from 'bluebird';

import {ITestSuite} from './ITestSuite';

import File from '../file/File';

import Timer from '../util/Timer';

import TscTest from '../tsc/TscTest';
import TestQueue from '../test/TestQueue';
import TestResult from '../test/TestResult';
import {ITestOptions} from '../test/ITestOptions';

import {ITestReporter} from '../reporter/ITestReporter';

/////////////////////////////////
// Base class for test suite
/////////////////////////////////
export default class TestSuiteBase implements ITestSuite {
	testSuiteName: string;
	errorHeadline: string;
	options: ITestOptions;

	timer: Timer = new Timer();
	testResults: TestResult[] = [];
	testReporter: ITestReporter;
	printErrorCount = true;
	queue: TestQueue;

	constructor(options: ITestOptions, testSuiteName: string, errorHeadline: string) {
		this.options = options;
		this.testSuiteName = testSuiteName;
		this.errorHeadline = errorHeadline;
		this.queue = new TestQueue(options.concurrent);
	}

	public start(targetFiles: File[], testCallback: (result: TestResult) => void): Promise<ITestSuite> {
		this.timer.start();

		// tests get queued for multi-threading
		return Promise.map(targetFiles, (targetFile: File) => {
			return this.runTest(targetFile).then((result) => {
				testCallback(result);
			});
		}).then(() => {
			this.timer.end();
			return this;
		});
	}

	public runTest(targetFile: File): Promise<TestResult> {
		return this.queue.run(new TscTest(this, targetFile, {
			tscPath: this.options.tscPath
		})).then((result) => {
			this.testResults.push(result);
			return result;
		});
	}

	public get okTests(): TestResult[] {
		return this.testResults.filter((r) => {
			return r.success;
		});
	}

	public get ngTests(): TestResult[] {
		return this.testResults.filter((r) => {
			return !r.success;
		});
	}
}
