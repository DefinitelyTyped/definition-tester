'use strict';

import * as path from 'path';
import * as Lazy from 'lazy.js';
import * as Promise from 'bluebird';

import * as util from '../util/util';

import File from './File';
import {IFileDict} from './IFileDict';
import {IFileArrDict} from './IFileArrDict';

import {ITestOptions} from '../test/ITestOptions';

/////////////////////////////////
// Track all files in the repo: map full path to File objects
/////////////////////////////////
export default class FileIndex {
	files: File[];
	fileMap: IFileDict;
	refMap: IFileArrDict;
	changed: IFileDict;
	removed: IFileDict;
	missing: IFileArrDict;

	constructor(public options: ITestOptions) {	}

	public findFilesByName(nameRegexp: RegExp): Promise<util.FullPath[]> {
		return new Promise<util.FullPath[]>(resolve => {
			const finish = () => {
				resolve(this.files.filter(f => nameRegexp.test(f.fileNameWithExtension)).map(f => f.fullPath));
			};

			if (this.files) {
				finish();
			} else {
				this.readIndex().then(finish);
			}
		});
	}

	private checkAcceptFile(fileName: string): boolean {
		return (fileName.indexOf('_infrastructure/') < 0) &&
		       (fileName.indexOf('node_modules/') < 0);
	}

	public listIndex(): string[] {
		return Object.keys(this.fileMap);
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
			throw new Error(`cannot overwrite file: ${file.fullPath}`);
		}
		this.fileMap[file.fullPath] = file;
	}

	private readIndex(): Promise<void> {
		this.fileMap = Object.create(null);
		return util.glob('**/*', {
			cwd: this.options.dtPath
		}).then((fileNames: string[]) => {
			this.files = Lazy(fileNames).filter(this.checkAcceptFile).map((fileName: string) => {
				let file = File.fromPathAndFilename(this.options.dtPath, fileName);
				this.fileMap[file.fullPath] = file;
				return file;
			}).toArray();
		}).return();
	}

	public collectDiff(changes: string[]): Promise<void> {
		return new Promise<void>((resolve) => {
			// filter changes and bake map for easy lookup
			this.changed = Object.create(null);
			this.removed = Object.create(null);

			Lazy(changes).filter((full) => {
				return this.checkAcceptFile(full);
			}).uniq().each((local) => {
				let full = util.fixPath(path.resolve(this.options.dtPath, local));
				let file = this.getFile(full);
				if (!file) {
					// TODO figure out what to do here
					// what does it mean? deleted?
					file = File.fromFullPath(full as util.FullPath);
					this.setFile(file);
					this.removed[full] = file;
				} else {
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
		throw new Error('nyi');
		/*
		return new Promise<void>((resolve, reject) => {
			let queue = files.slice(0);
			let active: File[] = [];
			let max = 50;
			let next = () => {
				if (queue.length === 0 && active.length === 0) {
					resolve(null);
					return;
				}
				// queue parallel
				while (queue.length > 0 && active.length < max) {
					let file = queue.pop();
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
		*/
	}

	private addToRefMap(fullPath: string, file: File): void {
		if (fullPath in this.refMap) {
			this.refMap[fullPath].push(file);
		} else {
			this.refMap[fullPath] = [file];
		}
	}

	// TODO replace with a stream?
	/*
	private parseFile(file: File): Promise<File> {
		return util.readFile(file.fullPath).then((content: string) => {
			file.references = Lazy(util.extractReferenceTags(content)).map((ref: string) => {
				return path.resolve(path.dirname(file.fullPath), ref);
			}).reduce((memo: File[], ref: string) => {
				if (ref in this.fileMap) {
					memo.push(this.fileMap[ref]);
				} else {
					console.log(` not mapped? -> ${ref}`);
					// console.log(Object.keys(this.fileMap).join('\n'));
				}
				return memo;
			}, []);
			// return the object
			return file;
		});
	}*/

	public collectTargets(): Promise<File[]> {
		return new Promise<File[]>((resolve: (result: File[]) => void) => {
			// map out files linked to changes
			// - queue holds files touched by a change
			// - pre-fill with actually changed files
			// - loop queue, if current not seen:
			//    - add to result
			//    - from refMap queue all files referring to current

			let result: IFileDict = Object.create(null);
			let queue = Lazy<File>(this.changed).values().toArray();

			while (queue.length > 0) {
				let next = queue.shift();
				let fp = next.fullPath;
				if (result[fp]) {
					continue;
				}
				result[fp] = next;
				if (fp in this.refMap) {
					let arr = this.refMap[fp];
					for (let i = 0, ii = arr.length; i < ii; i++) {
						// just add it and skip expensive checks
						queue.push(arr[i]);
					}
				}
			}
			resolve(Lazy<File>(result).values().toArray());
		});
	}
}
