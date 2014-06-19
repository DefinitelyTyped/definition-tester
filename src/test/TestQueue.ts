/// <reference path="../_ref.d.ts" />

import Promise = require('bluebird');

import ITest = require('./ITest');
import TestResult = require('./TestResult');

/////////////////////////////////
// Parallel execute Tests
/////////////////////////////////
class TestQueue {

	private queue: Function[] = [];
	private active: ITest[] = [];
	private concurrent: number;

	constructor(concurrent: number) {
		this.concurrent = Math.max(1, concurrent);
	}

	// add to queue and return a promise
	run(test: ITest): Promise<TestResult> {
		var defer = Promise.defer<TestResult>();
		// add a closure to queue
		this.queue.push(() => {
			// run it
			var p = test.run();
			p.then(defer.resolve.bind(defer), defer.reject.bind(defer));
			p.finally(() => {
				var i = this.active.indexOf(test);
				if (i > -1) {
					this.active.splice(i, 1);
				}
				this.step();
			});
			// return it
			return test;
		});
		this.step();
		// defer it
		return defer.promise;
	}

	private step(): void {
		while (this.queue.length > 0 && this.active.length < this.concurrent) {
			// console.log([this.queue.length, this.active.length, this.concurrent]);
			this.active.push(this.queue.pop().call(null));
		}
	}
}

export = TestQueue;
