/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import Git = require('git-wrapper');
import Promise = require('bluebird');
import util = require('./util');

class GitChanges {

	private dtPath: string;

	constructor(dtPath: string) {
		this.dtPath = dtPath;
	}

	public readChanges(): Promise<string[]> {
		var dir = path.join(this.dtPath, '.git');

		return util.fileExists(dir).then((exists) => {
			if (!exists) {
				throw new Error('cannot locate git-dir: ' + dir);
			}
			return new Promise<string[]>((resolve, reject) => {
				var args = ['--name-only HEAD~1'];
				var opts = {};
				var git = new Git({
					'git-dir': dir
				});
				git.exec('diff', opts, args, (err: Error, msg: string) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(msg.replace(/^\s+/, '').replace(/\s+$/, '').split(/\r?\n/g));
					}
				});
			});
		});
	}
}

export = GitChanges;
