'use strict';
var path = require('path');
var Promise = require('bluebird');
var Const = require('../Const');
var exec = require('../util/exec');
var util = require('../util/util');
var Tsc = (function () {
    function Tsc() {
    }
    Tsc.run = function (tsfile, options) {
        var tscPath = path.join(options.tscPath, (options.tscVersion || Const.DEFAULT_TSC_VERSION), 'tsc.js');
        if (typeof options.checkNoImplicitAny === 'undefined') {
            options.checkNoImplicitAny = true;
        }
        if (typeof options.useTscParams === 'undefined') {
            options.useTscParams = true;
        }
        return Promise.all([
            util.fileExists(tsfile),
            util.fileExists(tscPath)
        ]).spread(function (tsfileExists, tscPathExists) {
            if (!tsfileExists) {
                throw new Error(tsfile + ' does not exist');
            }
            if (!tscPathExists) {
                throw new Error(tscPath + ' does not exist');
            }
            return util.fileExists(tsfile + '.tscparams');
        }).then(function (tsParamsExist) {
            var command = 'node ' + tscPath + ' --module commonjs ';
            if (options.useTscParams && tsParamsExist) {
                command += '@' + tsfile + '.tscparams';
            } else if (options.checkNoImplicitAny) {
                command += '--noImplicitAny';
            }
            return exec.exec(command, [tsfile]);
        });
    };
    return Tsc;
})();
module.exports = Tsc;
