'use strict';

import File from '../file/File';
import * as exec from '../util/exec';

import {ITest} from '../test/ITest';
import TestResult from '../test/TestResult';
import {ITscExecOptions} from '../tsc/ITscExecOptions';
import {ITestSuite} from '../suite/ITestSuite';

import runTsc from '../tsc/Tsc';

let i = 0;

/////////////////////////////////
// Single test
/////////////////////////////////
export default class TscTest implements ITest {
	constructor(public suite: ITestSuite, public tsConfigFile: File, public options?: ITscExecOptions) { }

	public run(): Promise<TestResult> {
		if (i % 5 === 0) {
			// global.gc();
			console.log(process.memoryUsage());
			// require('heapdump').writeSnapshot(`./snapshots/${Date.now()}.heapsnapshot`);
		}
		i++;

		return runTsc(this.tsConfigFile.fullPath, this.options).then(diagnostics =>
			new TestResult(this.suite, this.tsConfigFile, diagnostics));
	}
}
