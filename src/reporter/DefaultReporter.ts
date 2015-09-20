/// <reference path="../_ref.d.ts" />

import ITestReporter = require('../reporter/ITestReporter');
import TestResult = require('../test/TestResult');
import Print = require('./Print');

/////////////////////////////////
// Default test reporter
/////////////////////////////////
class DefaultTestReporter implements ITestReporter {

	index = 0;

	constructor(public print: Print) {
	}

	public printPositiveCharacter(testResult: TestResult) {
		if (testResult.attempts > 1) {
			this.print.out('\33[36m\33[1m' + testResult.attempts + '\33[0m');
		}
		else {
			this.print.out('\33[36m\33[1m' + '.' + '\33[0m');
		}
		this.index++;
		this.printBreakIfNeeded(this.index);
	}

	public printNegativeCharacter( testResult: TestResult) {
		this.print.out('x');
		this.index++;
		this.printBreakIfNeeded(this.index);
	}

	private printBreakIfNeeded(index: number) {
		if (index % this.print.WIDTH === 0) {
			this.print.printBreak();
		}
	}
}

export = DefaultTestReporter;
