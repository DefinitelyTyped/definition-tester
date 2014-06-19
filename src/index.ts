/// <reference path="_ref.d.ts" />

import os = require('os');
import path = require('path');

import sms = require('source-map-support');
import opt = require('optimist');
import Promise = require('bluebird');
import findup = require('findup-sync');

import Const = require('./Const');
import TestRunner = require('./test/TestRunner');

interface PackageJSON {
	scripts: {[key: string]: string};
}

var pkgPath = findup('package.json');

var optimist = opt(process.argv);
optimist.default('try-without-tscparams', false);
optimist.default('single-thread', false);
optimist.default('tsc-version', Const.DEFAULT_TSC_VERSION);

optimist.default('test-changes', false);
optimist.default('lint-changes', false);
optimist.default('skip-tests', false);
optimist.default('print-files', false);
optimist.default('print-refmap', false);
optimist.default('path', path.resolve(path.dirname(pkgPath), '..', '..'));

optimist.string('path');
optimist.boolean('help');
optimist.boolean('debug');
optimist.describe('help', 'print help');
optimist.alias('h', 'help');

var argv: any = optimist.argv;

if (argv['debug']) {
	sms.install();
	Promise.longStackTraces();
}

var dtPath = path.resolve(argv['path']);
var cpuCores = os.cpus().length;
var testerPath = path.dirname(pkgPath);

if (argv.help) {
	optimist.help();

	var pkg: PackageJSON = require(pkgPath);

	console.log('Scripts:');
	console.log('');
	Object.keys(pkg.scripts).forEach((key) => {
		console.log('   $ npm run ' + key);
	});
	process.exit(0);
}

var testFull = (process.env['TRAVIS_BRANCH'] ? /\w\/full$/.test(process.env['TRAVIS_BRANCH']) : false);

new TestRunner({
	testerPath: testerPath,
	dtPath: dtPath,
	concurrent: (argv['single-thread'] ? 1 : Math.round(cpuCores * .75)),
	tscVersion: argv['tsc-version'],
	tslintConfig: path.join(testerPath, 'conf', 'tslint.json'),
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
