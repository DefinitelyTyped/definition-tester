'use strict';

import File from '../file/File';
import * as exec from '../util/exec';

import {ITest} from '../test/ITest';
import TestResult from '../test/TestResult';
import {ITscExecOptions} from '../tsc/ITscExecOptions';
import {ITestSuite} from '../suite/ITestSuite';

import Tsc from '../tsc/Tsc';

/////////////////////////////////
// Single test
/////////////////////////////////
export default class TscTest implements ITest {
	suite: ITestSuite;
	tsfile: File;
	options: ITscExecOptions;

	constructor(suite: ITestSuite, tsfile: File, options?: ITscExecOptions) {
		this.suite = suite;
		this.tsfile = tsfile;
		this.options = options;
	}

	public run(): Promise<TestResult> {
		return Tsc.run(this.tsfile.fullPath, this.options).then((execResult: exec.ExecResult) => {
			let testResult = new TestResult();
			testResult.hostedBy = this.suite;
			testResult.targetFile = this.tsfile;

			testResult.stdout = execResult.stdout;
			testResult.stderr = execResult.stderr;
			testResult.exitCode = execResult.exitCode;

			return testResult;
		});
	}
}
