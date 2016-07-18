'use strict';

import * as Promise from 'bluebird';

import File from '../file/File';
import {ITestOptions} from '../test/ITestOptions';
import TestSuiteBase from '../suite/TestSuiteBase';

let endTestDts = /\w-tests?(\.es6)?\.tsx?$/i;

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
export default class TestEval extends TestSuiteBase {

	constructor(options: ITestOptions) {
		super(options, 'Typing tests', 'Failed tests');
	}
}
