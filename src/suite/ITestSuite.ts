'use strict';

import * as Promise from 'bluebird';

import File from '../file/File';
import Timer from '../util/Timer';

import TestResult from '../test/TestResult';
import {ITestReporter} from '../reporter/ITestReporter';

/////////////////////////////////
// The interface for test suite
/////////////////////////////////
export interface ITestSuite {
	testSuiteName: string;
	errorHeadline: string;

	start(targetFiles: File[], testCallback: (result: TestResult, index: number) => void): Promise<ITestSuite>;

	testResults: TestResult[];
	okTests: TestResult[];
	ngTests: TestResult[];
	timer: Timer;

	testReporter: ITestReporter;
	printErrorCount: boolean;
}
