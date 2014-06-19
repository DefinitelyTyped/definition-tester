interface ITestOptions {
	tscPath: string;
	concurrent?: number;
	testChanges?: boolean;
	lintChanges?: boolean;
	skipTests?: boolean;
	printFiles?: boolean;
	printRefMap?: boolean;
	findNotRequiredTscparams?: boolean;
}

export = ITestOptions;
