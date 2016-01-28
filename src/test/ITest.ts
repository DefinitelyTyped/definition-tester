import * as Promise from 'bluebird';
import TestResult from './TestResult';

export interface ITest {
	run(): Promise<TestResult>;
}
