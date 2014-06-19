/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

import File = require('../file/File');
import Timer = require('../util/Timer');

import TestResult = require('../test/TestResult');
import ITestReporter = require('../reporter/ITestReporter');

/////////////////////////////////
// The interface for test suite
/////////////////////////////////
interface ITestSuite {
	testSuiteName: string;
	errorHeadline: string;
	filterTargetFiles(files: File[]): Promise<File[]>;

	start(targetFiles: File[], testCallback: (result: TestResult, index: number) => void): Promise<ITestSuite>;

	testResults: TestResult[];
	okTests: TestResult[];
	ngTests: TestResult[];
	timer: Timer;

	testReporter: ITestReporter;
	printErrorCount: boolean;
}

export = ITestSuite;
