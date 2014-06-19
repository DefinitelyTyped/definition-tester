/// <reference path='../_ref.d.ts' />

'use strict';

import path = require('path');
import Promise = require('bluebird');
import findup = require('findup-sync');

import Const = require('../Const');

import exec = require('../util/exec');
import util = require('../util/util');

import ITscExecOptions = require('./ITscExecOptions');

class Tsc {

	public static run(tsfile: string, options: ITscExecOptions): Promise<exec.ExecResult> {
		var tscPath: string = path.join(options.tscPath, (options.tscVersion || Const.DEFAULT_TSC_VERSION), 'tsc.js');

		if (typeof options.checkNoImplicitAny === 'undefined') {
			options.checkNoImplicitAny = true;
		}
		if (typeof options.useTscParams === 'undefined') {
			options.useTscParams = true;
		}

		return Promise.all([
			util.fileExists(tsfile),
			util.fileExists(tscPath)
		]).spread((tsfileExists: boolean, tscPathExists: boolean) => {
			if (!tsfileExists) {
				throw new Error(tsfile + ' does not exist');
			}
			if (!tscPathExists) {
				throw new Error(tscPath + ' does not exist');
			}
			return util.fileExists(tsfile + '.tscparams');
		}).then(tsParamsExist => {
			var command = 'node ' + tscPath + ' --module commonjs ';
			if (options.useTscParams && tsParamsExist) {
				command += '@' + tsfile + '.tscparams';
			}
			else if (options.checkNoImplicitAny) {
				command += '--noImplicitAny';
			}
			return exec.exec(command, [tsfile]);
		});
	}
}

export = Tsc;
