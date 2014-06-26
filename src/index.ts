/// <reference path="_ref.d.ts" />

import os = require('os');
import path = require('path');

import opt = require('optimist');
import Promise = require('bluebird');
import findup = require('findup-sync');

import Const = require('./Const');
import TestRunner = require('./test/TestRunner');

var testerPkgPath = findup('package.json', {cwd: process.cwd()});

var optimist = opt(process.argv);
optimist.default('try-without-tscparams', false);
optimist.default('single-thread', false);
optimist.default('tsc-version', Const.DEFAULT_TSC_VERSION);

optimist.default('test-changes', false);
optimist.default('lint-changes', false);
optimist.default('skip-tests', false);
optimist.default('print-files', false);
optimist.default('print-refmap', false);
optimist.default('path', process.cwd());

optimist.string('path');
optimist.boolean('help');
optimist.boolean('debug');
optimist.describe('help', 'print help');
optimist.alias('h', 'help');

var argv: any = optimist.argv;

if (argv['debug']) {
	var sms: any;
	try {
		sms = require('source-map-support');
	}
	catch (e) {

	}
	if (sms) {
		sms.install();
	}
	Promise.longStackTraces();
}

var dtPath = path.resolve(argv['path']);
var cpuCores = os.cpus().length;

if (argv.help) {
	optimist.help();
	process.exit(0);
}

var testFull = (process.env['TRAVIS_BRANCH'] ? /\w\/full$/.test(process.env['TRAVIS_BRANCH']) : false);

new TestRunner({
	testerPath: testerPkgPath,
	dtPath: dtPath,
	concurrent: (argv['single-thread'] ? 1 : Math.round(cpuCores * .75)),
	tscVersion: argv['tsc-version'],
	tslintConfig: path.join(testerPkgPath, 'conf', 'tslint.json'),
	testChanges: (testFull ? false : argv['test-changes']), // allow magic branch
	lintChanges: (testFull ? false : argv['lint-changes']), // allow magic branch
	skipTests: argv['skip-tests'],
	printFiles: argv['print-files'],
	printRefMap: argv['print-refmap'],
	findNotRequiredTscparams: argv['try-without-tscparam']
}).run().then((success) => {
	if (!success) {
		process.exit(1);
	}
}).catch((err) => {
	throw err;
});
