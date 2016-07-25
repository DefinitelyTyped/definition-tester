'use strict';

import * as child_process from 'child_process';
import * as path from 'path';
import * as Promise from 'bluebird';
import * as util from './util';

export default class GitChanges {
	private dtPath: string;

	constructor(dtPath: string) {
		this.dtPath = dtPath;
	}

	private readChanges(): Promise<util.FullPath[]> {
		let dir = path.join(this.dtPath, '.git');

		return util.fileExists(dir).then((exists) => {
			if (!exists) {
				throw new Error('cannot locate git-dir: ' + dir);
			}
			return new Promise<util.FullPath[]>((resolve: (result: util.FullPath[]) => void, reject: (error: any) => void) => {
				child_process.exec('git diff --name-only HEAD~1', { cwd: this.dtPath }, (err, stdout, stderr) => {
					if (err) {
						reject(err);
					} else {
						const msg = <string> <any> stdout;
						resolve(msg.trim().split(/\r?\n/g) as util.FullPath[]);
					}
				});
			});
		});
	}

	public readChangedFolders(): Promise<string[]> {
		return this.readChanges().then(changes => {
			return util.filterMapAsync(util.unique(changes.map(path.dirname)), folder => {
				if (folder === '.') {
					return undefined;
				}
				const full = path.join(this.dtPath, folder);
				return util.fileExists(full).then(exists => exists ? full : undefined);
			});
		});
	}
}
