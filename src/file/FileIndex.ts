/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import glob = require('glob');
import Lazy = require('lazy.js');
import Promise = require('bluebird');

import util = require('../util/util');

import File = require('./File');
import IFileDict = require('./IFileDict');
import IFileArrDict = require('./IFileArrDict');

import ITestOptions = require('../test/ITestOptions');

var tsExp = /\.ts$/;

/////////////////////////////////
// Track all files in the repo: map full path to File objects
/////////////////////////////////
class FileIndex {

	files: File[];
	fileMap: IFileDict;
	refMap: IFileArrDict;
	options: ITestOptions;
	changed: IFileDict;
	removed: IFileDict;
	missing: IFileArrDict;

	constructor(options: ITestOptions) {
		this.options = options;
	}

	private checkAcceptFile(fileName: string): boolean {
		var ok = tsExp.test(fileName);
		ok = ok && fileName.indexOf('_infrastructure/') < 0;
		ok = ok && fileName.indexOf('node_modules/') < 0;
		ok = ok && /^[a-z]/i.test(fileName);
		return ok;
	}

	public hasFile(target: string): boolean {
		return target in this.fileMap;
	}

	public getFile(target: string): File {
		if (target in this.fileMap) {
			return this.fileMap[target];
		}
		return null;
	}

	public setFile(file: File): void {
		if (file.fullPath in this.fileMap) {
			throw new Error('cannot overwrite file');
		}
		this.fileMap[file.fullPath] = file;
	}

	public readIndex(): Promise<void> {
		this.fileMap = Object.create(null);

		return Promise.promisify(glob).call(glob, '**/*.ts', {
			cwd: this.options.dtPath
		}).then((filesNames: string[]) => {
			this.files = Lazy(filesNames).filter((fileName) => {
				return this.checkAcceptFile(fileName);
			}).map((fileName: string) => {
				var file = new File(this.options.dtPath, fileName);
				this.fileMap[file.fullPath] = file;
				return file;
			}).toArray();
		});
	}

	public collectDiff(changes: string[]): Promise<void> {
		return new Promise<void>((resolve) => {
			// filter changes and bake map for easy lookup
			this.changed = Object.create(null);
			this.removed = Object.create(null);

			Lazy(changes).filter((full) => {
				return this.checkAcceptFile(full);
			}).uniq().each((local) => {
				var full = path.resolve(this.options.dtPath, local);
				var file = this.getFile(full);
				if (!file) {
					// TODO figure out what to do here
					// what does it mean? deleted?ss
					file = new File(this.options.dtPath, local);
					this.setFile(file);
					this.removed[full] = file;
				}
				else {
					this.changed[full] = file;
				}
			});
			resolve(null);
		});
	}

	public parseFiles(): Promise<void> {
		return this.loadReferences(this.files).then(() => {
			return this.getMissingReferences();
		});
	}

	private getMissingReferences(): Promise<void> {
		return Promise.attempt(() => {
			this.missing = Object.create(null);

			Lazy(this.removed).keys().each((removed) => {
				if (removed in this.refMap) {
					this.missing[removed] = this.refMap[removed];
				}
			});
		});
	}

	private loadReferences(files: File[]): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			var queue = files.slice(0);
			var active: File[] = [];
			var max = 50;
			var next = () => {
				if (queue.length === 0 && active.length === 0) {
					resolve(null);
					return;
				}
				// queue parallel
				while (queue.length > 0 && active.length < max) {
					var file = queue.pop();
					active.push(file);
					this.parseFile(file).then((file) => {
						active.splice(active.indexOf(file), 1);
						next();
					}).catch((err) => {
						queue = [];
						active = [];
						reject(err);
					});
				}
			};
			next();
		}).then(() => {
			// bake reverse reference map (referenced to referrers)
			this.refMap = Object.create(null);

			Lazy(files).each((file) => {
				Lazy(file.references).each((ref) => {
					this.addToRefMap(ref.fullPath, file);
				});
			});
		});
	}

	private addToRefMap(fullPath: string, file: File): void {
		if (fullPath in this.refMap) {
			this.refMap[fullPath].push(file);
		}
		else {
			this.refMap[fullPath] = [file];
		}
	}

	// TODO replace with a stream?
	private parseFile(file: File): Promise<File> {
		return util.readFile(file.fullPath).then((content: string) => {
			file.references = Lazy(util.extractReferenceTags(content)).map((ref: string) => {
				return path.resolve(path.dirname(file.fullPath), ref);
			}).reduce((memo: File[], ref: string) => {
				if (ref in this.fileMap) {
					memo.push(this.fileMap[ref]);
				}
				else {
					console.log(' not mapped? -> ' + ref);
					// console.log(Object.keys(this.fileMap).join('\n'));
				}
				return memo;
			}, []);
			// return the object
			return file;
		});
	}

	public collectTargets(): Promise<File[]> {
		return new Promise<File[]>((resolve) => {
			// map out files linked to changes
			// - queue holds files touched by a change
			// - pre-fill with actually changed files
			// - loop queue, if current not seen:
			//    - add to result
			//    - from refMap queue all files referring to current

			var result: IFileDict = Object.create(null);
			var queue = Lazy<File>(this.changed).values().toArray();

			while (queue.length > 0) {
				var next = queue.shift();
				var fp = next.fullPath;
				if (result[fp]) {
					continue;
				}
				result[fp] = next;
				if (fp in this.refMap) {
					var arr = this.refMap[fp];
					for (var i = 0, ii = arr.length; i < ii; i++) {
						// just add it and skip expensive checks
						queue.push(arr[i]);
					}
				}
			}
			resolve(Lazy<File>(result).values().toArray());
		});
	}
}

export = FileIndex;
