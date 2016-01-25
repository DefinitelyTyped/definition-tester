'use strict';

import TestResult = require('../test/TestResult');

/////////////////////////////////
// Test reporter interface
// for example, . and x
/////////////////////////////////
interface ITestReporter {
	printPositiveCharacter(testResult: TestResult): void;
	printNegativeCharacter(testResult: TestResult): void;
}

export = ITestReporter;
