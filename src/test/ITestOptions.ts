export interface ITestOptions {
	testerPath: string;
	dtPath: string;
	concurrent: number;
	tscPath?: string;
	tslintConfig: string;

	/** Set to true to run only changed files */
	changes: boolean;
	tests: boolean;
	/** Set to true to run the linting suite */
	lint: boolean;
	headers: boolean;
	tscparams: boolean;

	debug: boolean;
	printFiles: boolean;
	printRefMap: boolean;
}
