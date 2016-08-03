'use strict';

import * as path from 'path';
import * as mc from 'manticore';
import * as Promise from 'bluebird';

import File from '../file/File';
import * as util from '../util/util';

import {ITestOptions} from '../test/ITestOptions';
import TestResult from '../test/TestResult';
import TestSuiteBase from '../suite/TestSuiteBase';
import {ITestSuite} from '../suite/ITestSuite';

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
export default class TSLintSuite extends TestSuiteBase {

	pool: mc.IPool;
	tslint: any;

	constructor(options: ITestOptions) {
		super(options, 'Linting', 'Found some lint');
	}

	public start(targetFiles: File[], testCallback: (result: TestResult) => void): Promise<ITestSuite> {
		this.pool = mc.createPool({
			worker: require.resolve('./TSLintWorker'),
			concurrent: this.options.concurrent,
			paralel: 2,
			attempts: 3
		});
		return util.readJSON(this.options.tslintConfig).then((config) => {
			this.tslint = {
				configuration: config,
				rulesDirectory: path.join(__dirname, 'customRules')
			};
			return super.start(targetFiles, testCallback);
		});
	}

	public runTest(targetFile: File): Promise<TestResult> {
		return this.pool.run('lint', {
			filePath: targetFile.fullPath,
			options: this.tslint
		}).then((res: any) => {
			let diagnostics: string[] = [];
			if (!res) {
				diagnostics = [`bad result for ${targetFile.fullPath}`];
			} else if (res.failureCount > 0 && res.output) {
				diagnostics = [res.output];
			}
			let testResult = new TestResult(this, targetFile, diagnostics);
			this.testResults.push(testResult);

			// convert to our promise type
			return Promise.resolve(testResult);
		});
	}
}
