/// <reference path='../_ref.d.ts' />

'use strict';

import Promise = require('bluebird');

import Const = require('../Const');

import exec = require('../util/exec');
import util = require('../util/util');

import ITscExecOptions = require('./ITscExecOptions');

class Tsc {
	public static run(tsfile: string, options: ITscExecOptions): Promise<exec.ExecResult> {

		return Promise.attempt<boolean>(() => {
			options = options || {};

			if (typeof options.checkNoImplicitAny === 'undefined') {
				options.checkNoImplicitAny = true;
			}
			if (typeof options.useTscParams === 'undefined') {
				options.useTscParams = true;
			}
			return util.fileExists(tsfile);
		}).then((exists) => {
			if (!exists) {
				throw new Error(tsfile + ' does not exist');
			}
			return util.fileExists(options.tscPath);
		}).then((exists) => {
			if (!exists) {
				throw new Error(options.tscPath + ' does not exist');
			}
			return util.fileExists(tsfile + '.tscparams');
		}).then(exists => {
			var command = 'node ' + options.tscPath + ' --module commonjs';
			if (options.useTscParams && exists) {
				command += '@' + tsfile + '.tscparams';
			}
			else if (options.checkNoImplicitAny) {
				command += '--noImplicitAny';
			}
			return exec.exec(command, [tsfile]);
		});
	}
}

export  = Tsc;
