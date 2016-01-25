'use strict';

import path = require('path');
import Promise = require('bluebird');
import findup = require('findup-sync');

import exec = require('../util/exec');
import util = require('../util/util');

import ITscExecOptions = require('./ITscExecOptions');

class Tsc {
	static useJsx = /\.tsx$/i;
	static useEs6 = /\.es6\.tsx?$/i;

	public static run(tsfile: string, options: ITscExecOptions): Promise<exec.ExecResult> {
		var tscPath = options.tscPath;
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
			if (Tsc.useJsx.test(tsfile)) {
				command += '--jsx react ';
			}
			if (Tsc.useEs6.test(tsfile)) {
				command += '--target es6 ';
			}
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
