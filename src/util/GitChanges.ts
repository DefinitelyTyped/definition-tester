'use strict';

import * as path from 'path';
import * as Git from 'git-wrapper';
import * as Promise from 'bluebird';
import * as util from './util';

export default class GitChanges {

	private dtPath: string;

	constructor(dtPath: string) {
		this.dtPath = dtPath;
	}

	public readChanges(): Promise<util.FullPath[]> {
		let dir = path.join(this.dtPath, '.git');

		return util.fileExists(dir).then((exists) => {
			if (!exists) {
				throw new Error('cannot locate git-dir: ' + dir);
			}
			return new Promise<util.FullPath[]>((resolve: (result: util.FullPath[]) => void, reject: (error: any) => void) => {
				let args = ['--name-only HEAD~1'];
				let opts = {};
				let git = new Git({
					'git-dir': dir
				});
				git.exec('diff', opts, args, (err: Error, msg: string) => {
					if (err) {
						reject(err);
					} else {
						resolve(msg.replace(/^\s+/, '').replace(/\s+$/, '').split(/\r?\n/g) as util.FullPath[]);
					}
				});
			});
		});
	}
}
