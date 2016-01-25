'use strict';

import * as Promise from 'bluebird';

import File from '../file/File';
import TestSuiteBase from '../suite/TestSuiteBase';
import {ITestOptions} from '../test/ITestOptions';

let endDts = /\w\.d\.ts$/;

/////////////////////////////////
// .d.ts syntax inspection
/////////////////////////////////
export default class SyntaxChecking extends TestSuiteBase {

	constructor(options: ITestOptions) {
		super(options, 'Syntax checking', 'Syntax error');
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return endDts.test(file.filePathWithName);
		}));
	}
}
