'use strict';

import * as path from 'path';
import * as util from '../util/util';

export default class File {
	private constructor(
		public fullPath: util.FullPath,
		public extension = path.extname(fullPath),
		public fileNameWithoutExtension = path.basename(fullPath, extension),
		public fileNameWithExtension = path.basename(fullPath),
		public containingFolderPath = path.dirname(fullPath)) {
	}

	public static fromFullPath(fullPath: util.FullPath) {
		return new File(fullPath);
	}

	public static fromPathAndFilename(folderPath: string, fileName: string) {
		return File.fromFullPath(path.join(folderPath, fileName) as util.FullPath);
	}

	toString(): string {
		return `[File ${this.fullPath}]`;
	}
}
