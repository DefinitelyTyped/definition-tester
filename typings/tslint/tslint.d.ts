// Type definitions for tslint 0.4.0
// Project: https://github.com/palantir/tslint
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module 'tslint' {
	class Linter {
		constructor(filepath: string, contents: string, options: Linter.Options);

		lint(): Linter.Result;
	}
	module Linter {

		interface Result {
			failureCount: number;
			output: string;
		}

		interface Options {
			formatter?: FormatterStatic;
			outputFile?: string;
			configuration?: Linter.Configuration;
		}

		interface Configuration {
			rules: Linter.Rules;
		}

		interface Formatter {
			format(failures: RuleFailure[]): string;
		}

		interface FormatterStatic {
			new(): Formatter;
		}

		interface RuleFailure {
			getFileName(): string;
			getRuleName() : string;

			getStartPosition(): RuleFailurePosition;
			getEndPosition(): RuleFailurePosition;

			getFailure(): string;
			toJson(): any;
		}

		interface RuleFailurePosition {
			getPosition(): number;
			getLineAndCharacter(): LineCharacter;
		}

		interface LineCharacter {
			line(): number;
			character(): number;
		}

		interface Rules {
			"ban": any[];
			"class-name": boolean;
			"comment-format": any[];
			"curly": boolean;
			"eofline": boolean;
			"forin": boolean;
			"indent": any[];
			"interface-name": boolean;
			"jsdoc-format": boolean;
			"label-position": boolean;
			"label-undefined": boolean;
			"max-line-length": any[];
			"no-arg": boolean;
			"no-bitwise": boolean;
			"no-console": any[];
			"no-construct": boolean;
			"no-debugger": boolean;
			"no-duplicate-key": boolean;
			"no-duplicate-variable": boolean;
			"no-empty": boolean;
			"no-eval": boolean;
			"no-string-literal": boolean;
			"no-trailing-comma": boolean;
			"no-trailing-whitespace": boolean;
			"no-unused-expression": boolean;
			"no-unused-variable": boolean;
			"no-unreachable": boolean;
			"no-use-before-declare": boolean;
			"no-var-requires": boolean;
			"one-line": any[];
			"quotemark": any[];
			"radix": boolean;
			"semicolon": boolean;
			"triple-equals": any[];
			"typedef":any[];
			"typedef-whitespace": any[];
			"use-strict": any[];
			"variable-name": boolean;
			"whitespace": any[];
		}
	}

export = Linter;
}
