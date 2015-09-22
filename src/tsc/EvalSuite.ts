/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

import File = require('../file/File');
import ITestOptions = require('../test/ITestOptions');
import TestSuiteBase = require('../suite/TestSuiteBase');

var endTestDts = /\w-tests?(\.es6)?\.tsx?$/i;

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
class TestEval extends TestSuiteBase {

	constructor(options: ITestOptions) {
		super(options, 'Typing tests', 'Failed tests');
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return endTestDts.test(file.filePathWithName);
		}));
	}
}

export = TestEval;
