interface ITestOptions {
	dtPath: string;
	testerPath: string;
	tscVersion: string;
	tslintConfig: string;
	concurrent?: number;
	testChanges?: boolean;
	lintChanges?: boolean;
	skipTests?: boolean;
	printFiles?: boolean;
	printRefMap?: boolean;
	findNotRequiredTscparams?: boolean;
}

export = ITestOptions;
