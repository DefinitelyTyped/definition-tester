interface ITestOptions {
	testerPath: string;
	dtPath: string;
	concurrent: number;
	tscVersion: string;
	tslintConfig: string;

	changes: boolean;
	tests: boolean;
	lint: boolean;
	headers: boolean;
	tscparams: boolean;

	debug: boolean;
	printFiles: boolean;
	printRefMap: boolean;
}

export = ITestOptions;
