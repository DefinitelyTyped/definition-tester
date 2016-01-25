'use strict';

import * as path from 'path';
import * as Promise from 'bluebird';
import * as DH from 'definition-header';

import File from '../file/File';
import * as util from '../util/util';

import {ITestOptions} from '../test/ITestOptions';
import TestResult from '../test/TestResult';
import TestSuiteBase from '../suite/TestSuiteBase';

let isDef = /^[\w\.-]+[\\\/][\w\.-]+\.d\.ts$/;

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
export default class HeaderSuite extends TestSuiteBase {

	constructor(options: ITestOptions) {
		super(options, 'Header format', 'Invalid header');
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return isDef.test(file.filePathWithName);
		}));
	}

	public runTest(targetFile: File): Promise<TestResult> {
		return util.readFile(targetFile.fullPath).then((content) => {
			let testResult = new TestResult();
			testResult.hostedBy = this;
			testResult.targetFile = targetFile;

			if (DH.isPartial(content)) {
				testResult.exitCode = 0;
			}
			else {
				let result = DH.parse(content);
				if (result.success) {
					testResult.exitCode = 0;
				}
				else {
					testResult.exitCode = 1;
					testResult.stderr = '\n' + result.details;
				}
			}

			this.testResults.push(testResult);

			return testResult;
		});
	}
}
