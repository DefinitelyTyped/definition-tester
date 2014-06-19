/// <reference path="../_ref.d.ts" />

import File = require('../file/File');
import exec = require('../util/exec');

import ITest = require('../test/ITest');
import TestResult = require('../test/TestResult');
import ITscExecOptions = require('../tsc/ITscExecOptions');
import ITestSuite = require('../suite/ITestSuite');

import Tsc = require('../tsc/Tsc');

/////////////////////////////////
// Single test
/////////////////////////////////
class TscTest implements ITest {
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
			var testResult = new TestResult();
			testResult.hostedBy = this.suite;
			testResult.targetFile = this.tsfile;

			testResult.stdout = execResult.stdout;
			testResult.stderr = execResult.stderr;
			testResult.exitCode = execResult.exitCode;

			return testResult;
		});
	}
}

export = TscTest;
