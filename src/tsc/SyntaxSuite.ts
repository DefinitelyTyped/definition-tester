'use strict';

import Promise = require('bluebird');

import File = require('../file/File');
import TestSuiteBase = require('../suite/TestSuiteBase');
import ITestOptions = require('../test/ITestOptions');

var endDts = /\w\.d\.ts$/;

/////////////////////////////////
// .d.ts syntax inspection
/////////////////////////////////
class SyntaxChecking extends TestSuiteBase {

	constructor(options: ITestOptions) {
		super(options, 'Syntax checking', 'Syntax error');
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return endDts.test(file.filePathWithName);
		}));
	}
}

export = SyntaxChecking;
