/// <reference path="../bluebird/bluebird.d.ts" />

declare module 'git-wrapper' {
	// stub
	class Git {
		constructor(opts: Git.Options);
		exec(cmd :string, opts: Object, arg: string[], callback: (err: Error, res: string) => void): void;
	}
	module Git {
		interface Options {
			'git-dir'?: string;
		}
	}
	export = Git;
}
