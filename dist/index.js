var os = require('os');
var path = require('path');
var sms = require('source-map-support');
var opt = require('optimist');
var Promise = require('bluebird');
var findup = require('findup-sync');
var Const = require('./Const');
var TestRunner = require('./test/TestRunner');
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
var argv = optimist.argv;
if (argv['debug']) {
    sms.install();
    Promise.longStackTraces();
}
var dtPath = path.resolve(argv['path']);
var cpuCores = os.cpus().length;
var testerPath = path.dirname(pkgPath);
if (argv.help) {
    optimist.help();
    var pkg = require(pkgPath);
    console.log('Scripts:');
    console.log('');
    Object.keys(pkg.scripts).forEach(function (key) {
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
