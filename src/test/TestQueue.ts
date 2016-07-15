'use strict';

import * as Promise from 'bluebird';

import {ITest} from './ITest';
import TestResult from './TestResult';

class TestRunItem {

	test: ITest;
	attempts: number = 0;
	defer: Promise.Resolver<TestResult>;

	constructor(test: ITest) {
		this.test = test;
		this.defer = Promise.defer<TestResult>();
	}
}

/////////////////////////////////
// Parallel execute Tests
/////////////////////////////////
export default class TestQueue {

	private retries: TestRunItem[] = [];
	private queue: TestRunItem[] = [];
	private active: TestRunItem[] = [];
	private concurrent: number;
	private maxConcurrent: number;
	private maxRetry: number = 3;

	constructor(concurrent: number) {
		this.maxConcurrent = Math.max(1, concurrent);
		this.concurrent = this.maxConcurrent;
	}

	// add to queue and return a promise
	run(test: ITest): Promise<TestResult> {
		let item = new TestRunItem(test);
		this.queue.push(item);
		this.check();
		return item.defer.promise;
	}

	private check(): void {
		while (this.queue.length > 0 && this.active.length < this.concurrent) {
			this.step();
		}
		// when done go for retries
		if (this.queue.length === 0 && this.active.length === 0 && this.retries.length > 0) {
			this.queue = this.retries;
			this.retries = [];
			// lower the concurrency (fight out-of-memory errors)
			this.concurrent = Math.max(1, this.concurrent / 2);
			// check again
			this.check();
		}
	}

	private step(): void {
		let item = this.queue.pop();
		item.attempts++;
		item.test.run().then((res) => {
			// see if we can retry
			if (!res.success && item.attempts < this.maxRetry) {
				if (res.diagnostics.length && res.diagnostics.some(d => /^Killed/.test(d))) {
					this.retries.push(item);
					return;
				}
			}
			res.attempts = item.attempts;
			item.defer.resolve(res);
		}).catch((err) => {
			item.defer.reject(err);
		}).finally(() => {
			let i = this.active.indexOf(item);
			if (i > -1) {
				this.active.splice(i, 1);
			}
			process.nextTick(() => {
				this.check();
			});
		});
		this.active.push(item);
	}
}
