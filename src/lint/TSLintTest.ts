/// <reference path="../_ref.d.ts" />

import path = require('path');
import File = require('../file/File');
import exec = require('../util/exec');

import ITest = require('../test/ITest');
import TestResult = require('../test/TestResult');

import Linter = require('tslint');

import TSLintSuite = require('./TSLintSuite');
import Formatter = require('./TSLintFormatter');

// dummy to fool bugged compiler optimisation
[Formatter];

/////////////////////////////////
// Single test
/////////////////////////////////
class TSLintTest implements ITest {
	suite: TSLintSuite;
	tsfile: File;
	configFile: string;

	constructor(suite: TSLintSuite, tsfile: File, configFile?: string) {
		this.suite = suite;
		this.tsfile = tsfile;
		this.configFile = configFile;
	}

	public run(): Promise<TestResult> {
		var bin = path.resolve(this.suite.dtPath, 'node_modules', 'tslint', 'bin', 'tslint-cli.js');
		var args = [
			bin,
			'--file', this.tsfile.filePathWithName,
			'--config', this.configFile,
			'--format', path.resolve(this.suite.dtPath, '_infrastructure', 'tests', 'build', 'lint', 'Formatter')
		];
		return exec.exec('node', args).then((execResult: exec.ExecResult) => {
			var testResult = new TestResult();
			testResult.hostedBy = this.suite;
			testResult.targetFile = this.tsfile;

			testResult.stdout = execResult.stdout;
			testResult.stderr = execResult.stderr;
			testResult.exitCode = execResult.exitCode;

			// console.log(testResult.stdout);

			return testResult;
		});
	}
}

export = TSLintTest;
