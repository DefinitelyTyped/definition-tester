'use strict';

import * as os from 'os';
import * as path from 'path';

import * as opt from 'optimist';
import * as Promise from 'bluebird';
import * as findup from 'findup-sync';

import * as util from './util/util';
import TestRunner from './test/TestRunner';

Promise.longStackTraces();

let testerPkgPath = path.resolve(findup('package.json', { cwd: process.cwd() }));

let optimist = opt(process.argv);
optimist.boolean('single-thread');

optimist.boolean('changes');
optimist.default('changes', false);

optimist.boolean('dry');
optimist.default('dry', false);

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

optimist.string('tsc-path');
try {
	let tscDir = path.dirname(require.resolve('typescript'));
	let tscPath = path.join(tscDir, 'tsc.js');
	optimist.default('tsc-path', tscPath);
} catch (e) {
}

optimist.boolean('debug');
optimist.describe('help', 'print help');
optimist.alias('h', 'help');

let argv: any = optimist.argv;

if (argv['debug']) {
	let sms: any;
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

let dtPath = util.fixPath(path.resolve(argv['path']));
let cpuCores = os.cpus().length;

if (argv.help) {
	optimist.help();
	process.exit(0);
}

Promise.onPossiblyUnhandledRejection((reason) => {
	console.error('Error: Promise.possiblyUnhandledRejection:');
	console.dir(reason);
	throw reason;
});

let testFull = (process.env['TRAVIS_BRANCH'] ? /\w\/full$/.test(process.env['TRAVIS_BRANCH']) : false);

new TestRunner({
	testerPath: util.fixPath(path.dirname(testerPkgPath)),
	dtPath: dtPath,
	concurrent: (argv['single-thread'] ? 1 : Math.round(cpuCores * .75)),
	tscPath: argv['tsc-path'],
	tslintConfig: path.join(path.dirname(testerPkgPath), 'conf', 'tslint.json'),

	changes: (testFull ? false : argv['changes']),
	tests: argv['dry'] ? false : argv['tests'],
	lint: argv['dry'] ? false : argv['lint'],
	headers: argv['dry'] ? false : argv['headers'],
	tscparams: argv['dry'] ? false : argv['tscparams'],

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
