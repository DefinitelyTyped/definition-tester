'use strict';

import File from '../file/File';
import {ITestSuite} from '../suite/ITestSuite';
import {ITscExecOptions} from '../tsc/ITscExecOptions';

/////////////////////////////////
// Test results
/////////////////////////////////
export default class TestResult {
	hostedBy: ITestSuite;
	targetFile: File;

	stdout: string = '';
	stderr: string = '';
	exitCode: number = 0;
	attempts: number = 1;

	public get success(): boolean {
		return this.exitCode === 0;
	}
}
