'use strict';

import File from '../file/File';
import * as exec from '../util/exec';

import {ITest} from '../test/ITest';
import TestResult from '../test/TestResult';
import {ITscExecOptions} from '../tsc/ITscExecOptions';
import {ITestSuite} from '../suite/ITestSuite';

import runTsc from '../tsc/Tsc';

/////////////////////////////////
// Single test
/////////////////////////////////
export default class TscTest implements ITest {
	constructor(public suite: ITestSuite, public tsConfigFile: File, public options?: ITscExecOptions) { }

	public run(): Promise<TestResult> {
		return runTsc(this.tsConfigFile.fullPath, this.options).then(diagnostics =>
			new TestResult(this.suite, this.tsConfigFile, diagnostics));
	}
}
