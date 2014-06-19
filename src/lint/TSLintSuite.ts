/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

import File = require('../file/File');
import util = require('../util/util');

import TSLintTest = require('./TSLintTest');

import ITestOptions = require('../test/ITestOptions');
import TestResult = require('../test/TestResult');
import TestSuiteBase = require('../suite/TestSuiteBase');

var endDts = /\w\.d\.ts$/;

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
class TSLintSuite extends TestSuiteBase {
	constructor(options: ITestOptions) {
		super(options, 'Linting', 'Found some lint');
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return endDts.test(file.filePathWithName);
		}));
	}

	public runTest(targetFile: File): Promise<TestResult> {
		return this.queue.run(new TSLintTest(this, targetFile, this.options.tslintConfig)).then((result) => {
			this.testResults.push(result);
			return result;
		});
	}
}

export = TSLintSuite;
