'use strict';

import * as path from 'path';
import * as Promise from 'bluebird';
import * as findup from 'findup-sync';

import * as exec from '../util/exec';
import * as util from '../util/util';

import {ITscExecOptions} from './ITscExecOptions';

export default class Tsc {
	static useJsx = /\.tsx$/i;

	public static run(tsfile: string, options: ITscExecOptions): Promise<exec.ExecResult> {
		let tscPath = options.tscPath;
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
			let command = `node ${tscPath} --target es6 --module commonjs --experimentalDecorators --allowUnreachableCode --allowUnusedLabels `;
			if (Tsc.useJsx.test(tsfile)) {
				command += '--jsx react ';
			}
			if (options.useTscParams && tsParamsExist) {
				command += `@${tsfile}.tscparams`;
			} else if (options.checkNoImplicitAny) {
				command += '--noImplicitAny';
			}
			return exec.exec(command, [tsfile]);
		});
	}
}
