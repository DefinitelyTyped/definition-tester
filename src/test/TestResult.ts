'use strict';

import File from '../file/File';
import {ITestSuite} from '../suite/ITestSuite';
import {ITscExecOptions} from '../tsc/ITscExecOptions';
import * as ts from 'typescript';

/////////////////////////////////
// Test results
/////////////////////////////////
export default class TestResult {
	hostedBy: ITestSuite;
	targetFile: File;
	diagnostics: string[];
	attempts: number = 1;

	public get success(): boolean {
		return this.diagnostics.length === 0;
	}
}
