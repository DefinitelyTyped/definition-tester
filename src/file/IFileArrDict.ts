import File = require('./File');

interface IFileArrDict {
	[fullPath: string]: File[];
}

export = IFileArrDict;
