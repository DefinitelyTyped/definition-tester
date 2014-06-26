var os = require('os');
var path = require('path');
var sms = require('source-map-support');
var opt = require('optimist');
var Promise = require('bluebird');
var findup = require('findup-sync');
var Const = require('./Const');
var TestRunner = require('./test/TestRunner');
var testerPkgPath = findup('package.json', { cwd: process.cwd() });
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
var argv = optimist.argv;
if (argv['debug']) {
    sms.install();
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
    testChanges: (testFull ? false : argv['test-changes']),
    lintChanges: (testFull ? false : argv['lint-changes']),
    skipTests: argv['skip-tests'],
    printFiles: argv['print-files'],
    printRefMap: argv['print-refmap'],
    findNotRequiredTscparams: argv['try-without-tscparam']
}).run().then(function (success) {
    if (!success) {
        process.exit(1);
    }
}).catch(function (err) {
    throw err;
});
