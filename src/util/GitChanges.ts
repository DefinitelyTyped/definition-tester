/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Git = require('git-wrapper');
import Promise = require('bluebird');

class GitChanges {

	private git: Git;
	private options: {[key: string]: any} = {};
	private exec: (cmd: string, opts: Object, arg: string[]) => Promise<string>;

	constructor(dtPath: string) {
		var dir = path.join(dtPath, '.git');
		if (!fs.existsSync(dir)) {
			throw new Error('cannot locate git-dir: ' + dir);
		}
		this.options['git-dir'] = dir;

		this.git = new Git(this.options);
		this.exec = (cmd: string, opts: Object, arg: string[]) => {
			return new Promise<string>((resolve, reject) => {
				this.git.exec(cmd, opts, arg, (err: Error, msg: string) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(msg);
					}
				});
			});
		};
	}

	public readChanges(): Promise<string[]> {
		var opts = {};
		var args = ['--name-only HEAD~1'];
		return this.exec('diff', opts, args).then((msg: string) => {
			return msg.replace(/^\s+/, '').replace(/\s+$/, '').split(/\r?\n/g);
		});
	}
}

export = GitChanges;
