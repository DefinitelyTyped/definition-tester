'use strict';

import * as Promise from 'bluebird';

import File from '../file/File';
import TestSuiteBase from '../suite/TestSuiteBase';
import {ITestOptions} from '../test/ITestOptions';

/////////////////////////////////
// .d.ts syntax inspection
/////////////////////////////////
export default class SyntaxChecking extends TestSuiteBase {

	constructor(options: ITestOptions) {
		super(options, 'Syntax checking', 'Syntax error');
	}

}
