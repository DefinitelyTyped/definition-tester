/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import mc = require('manticore');
import Promise = require('bluebird');

import File = require('../file/File');
import util = require('../util/util');

import ITestOptions = require('../test/ITestOptions');
import TestResult = require('../test/TestResult');
import TestSuiteBase = require('../suite/TestSuiteBase');
import ITestSuite = require('../suite/ITestSuite');

var endDts = /\w\.d\.ts$/;

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
class TSLintSuite extends TestSuiteBase {

	pool: mc.IPool;
	tslint: any;

	constructor(options: ITestOptions) {
		super(options, 'Linting', 'Found some lint');
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return endDts.test(file.filePathWithName);
		}));
	}

	public start(targetFiles: File[], testCallback: (result: TestResult) => void): Promise<ITestSuite> {
		this.pool = mc.createPool({
			worker: require.resolve('./TSLintWorker'),
			concurrent: this.options.concurrent,
			paralel: 2,
			attempt: 3
		});
		return util.readJSON(this.options.tslintConfig).then((config) => {
			this.tslint = {
				configuration: config,
				formatter: path.resolve(this.options.testerPath, 'dist', 'lint', 'TSLintFormatter')
			};
			return super.start(targetFiles, testCallback);
		});
	}

	public runTest(targetFile: File): Promise<TestResult> {
		return this.pool.run('lint', {
			filePath: targetFile.fullPath,
			options: this.tslint
		}).then((res: any) => {
			var testResult = new TestResult();
			testResult.hostedBy = this;
			testResult.targetFile = targetFile;

			if (!res) {
				testResult.stderr = 'bad result for ' + targetFile.filePathWithName;
				testResult.exitCode = 1;
			}
			else if (res.failureCount > 0 && res.output) {
				testResult.stderr = res.output;
				testResult.exitCode = 1;
			}
			this.testResults.push(testResult);

			// convert to our promise type
			return Promise.resolve(testResult);
		});
	}
}

export = TSLintSuite;
