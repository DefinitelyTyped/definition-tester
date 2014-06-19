/// <reference path="../_ref.d.ts" />

import File = require('../file/File');
import ITestSuite = require('../suite/ITestSuite');
import ITscExecOptions = require('../tsc/ITscExecOptions');

/////////////////////////////////
// Test results
/////////////////////////////////
class TestResult {
	hostedBy: ITestSuite;
	targetFile: File;

	stdout: string;
	stderr: string;
	exitCode: number;

	public get success(): boolean {
		return this.exitCode === 0;
	}
}

export = TestResult;
