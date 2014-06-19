import Promise = require('bluebird');
import TestResult = require('./TestResult');

interface ITest {
	run(): Promise<TestResult>;
}

export = ITest;
