'use strict';

import TestResult from '../test/TestResult';

/////////////////////////////////
// Test reporter interface
// for example, . and x
/////////////////////////////////
export interface ITestReporter {
	printPositiveCharacter(testResult: TestResult): void;
	printNegativeCharacter(testResult: TestResult): void;
}
