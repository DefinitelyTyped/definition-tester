/// <reference path="_ref.d.ts" />

import os = require('os');
import path = require('path');

import opt = require('optimist');
import Promise = require('bluebird');
import findup = require('findup-sync');

import Const = require('./Const');
import util = require('./util/util');
import TestRunner = require('./test/TestRunner');

var testerPkgPath = path.resolve(findup('package.json', {cwd: process.cwd()}));

var optimist = opt(process.argv);
optimist.boolean('single-thread');

optimist.string('tsc-version');
optimist.default('tsc-version', Const.DEFAULT_TSC_VERSION);

optimist.boolean('changes');
optimist.default('changes', true);

optimist.boolean('headers');
optimist.default('headers', true);

optimist.boolean('tests');
optimist.default('tests', true);

optimist.boolean('lint');
optimist.default('lint', false);

optimist.boolean('tscparams');
optimist.default('tscparams', false);

optimist.default('print-files', false);
optimist.default('print-refmap', false);

optimist.string('path');
optimist.default('path', process.cwd());

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

Promise.onPossiblyUnhandledRejection((reason) => {
	console.error('onPossiblyUnhandledRejection');
	console.dir(reason);
	throw reason;
});

var testFull = (process.env['TRAVIS_BRANCH'] ? /\w\/full$/.test(process.env['TRAVIS_BRANCH']) : false);

new TestRunner({
	testerPath: util.fixPath(path.dirname(testerPkgPath)),
	dtPath: util.fixPath(dtPath),
	concurrent: (argv['single-thread'] ? 1 : Math.round(cpuCores * .75)),
	tscVersion: argv['tsc-version'],
	tslintConfig: path.join(path.dirname(testerPkgPath), 'conf', 'tslint.json'),

	changes: (testFull ? false : argv['changes']),
	tests: argv['tests'],
	lint: argv['lint'],
	headers: argv['headers'],
	tscparams: argv['changes'],

	debug: argv['debug'],
	printFiles: argv['print-files'],
	printRefMap: argv['print-refmap']
}).run().then((success) => {
	if (!success) {
		process.exit(1);
	}
}).catch((err) => {
	throw err;
});
