import File = require('./File');

interface IFileDict {
	[fullPath: string]: File;
}

export = IFileDict;
