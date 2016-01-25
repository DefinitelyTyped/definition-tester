'use strict';

import * as Promise from 'bluebird';
import * as child_process from 'child_process';

export class ExecResult {
	error: Error;
	exitCode: number;
	stdout = '';
	stderr = '';
}

export function exec(filename: string, cmdLineArgs: string[]): Promise<ExecResult> {
	return new Promise<ExecResult>((resolve: (result: ExecResult) => void, reject: (error: any) => void) => {
		let result = new ExecResult();
		result.exitCode = null;

		let cmdLine = filename + ' ' + cmdLineArgs.join(' ');

		let cp = child_process.exec(cmdLine, {maxBuffer: 1 * 1024 * 1024}, (error: ErrorCode, stdout: Buffer, stderr: Buffer) => {
			result.error = error;
			result.stdout = String(stdout);
			result.stderr = String(stderr);
			result.exitCode = (error ? error.code : 0);
			resolve(result);
		});
		cp.on('error', (error: Error) => {
			result.error = error;
			result.stdout = 'child_process.exec error: ' + error;
			result.exitCode = 1;
			resolve(result);
		});
	});
}
