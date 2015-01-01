'use strict';

import path = require('path');
import Promise = require('bluebird');

import ITestSuite = require('./ITestSuite');

import File = require('../file/File');

import Timer = require('../util/Timer');

import TscTest = require('../tsc/TscTest');
import TestQueue = require('../test/TestQueue');
import TestResult = require('../test/TestResult');
import ITestOptions = require('../test/ITestOptions');

import ITestReporter = require('../reporter/ITestReporter');

/////////////////////////////////
// Base class for test suite
/////////////////////////////////
class TestSuiteBase implements ITestSuite {
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

	public filterTargetFiles(files: File[]): Promise<File[]> {
		throw new Error('please implement this method');
	}

	public start(targetFiles: File[], testCallback: (result: TestResult) => void): Promise<ITestSuite> {
		this.timer.start();

		return this.filterTargetFiles(targetFiles).then((targetFiles) => {
			// tests get queued for multi-threading
			return Promise.map(targetFiles, (targetFile: File) => {
				return this.runTest(targetFile).then((result) => {
					testCallback(result);
				});
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

export = TestSuiteBase;
