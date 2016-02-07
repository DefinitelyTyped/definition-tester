'use strict';

import * as path from 'path';

export default class File {
	baseDir: string;
	filePathWithName: string;
	dir: string;
	file: string;
	ext: string;
	fullPath: string;
	references: File[] = [];

	constructor(baseDir: string, filePathWithName: string) {
		// why choose?
		this.baseDir = baseDir;
		this.filePathWithName = filePathWithName;
		this.ext = path.extname(this.filePathWithName);
		this.file = path.basename(this.filePathWithName, this.ext);
		this.dir = path.dirname(this.filePathWithName);
		this.fullPath = path.join(this.baseDir, this.dir, this.file + this.ext);
	}

	toString(): string {
		return `[File ${this.filePathWithName}]`;
	}
}
