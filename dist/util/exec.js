/// <reference path="../_ref.d.ts" />
'use strict';
var Promise = require('bluebird');
var child_process = require('child_process');
var ExecResult = (function () {
    function ExecResult() {
        this.stdout = '';
        this.stderr = '';
    }
    return ExecResult;
})();
exports.ExecResult = ExecResult;
function exec(filename, cmdLineArgs) {
    return new Promise(function (resolve, reject) {
        var result = new ExecResult();
        result.exitCode = null;
        var cmdLine = filename + ' ' + cmdLineArgs.join(' ');
        var cp = child_process.exec(cmdLine, { maxBuffer: 1 * 1024 * 1024 }, function (error, stdout, stderr) {
            result.error = error;
            result.stdout = String(stdout);
            result.stderr = String(stderr);
            result.exitCode = (error ? error.code : 0);
            resolve(result);
        });
        cp.on('error', function (error) {
            result.error = error;
            result.stdout = 'child_process.exec error: ' + error;
            result.exitCode = 1;
            resolve(result);
        });
    });
}
exports.exec = exec;
