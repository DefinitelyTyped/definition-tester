'use strict';

import * as os from 'os';

import File from '../file/File';
import {IFileDict as FileDict} from '../file/IFileDict';
import {IFileArrDict as FileArrDict} from '../file/IFileArrDict';
import FileIndex from '../file/FileIndex';

import TestResult from '../test/TestResult';
import {ITestSuite} from '../suite/ITestSuite';
import {ITestOptions} from '../test/ITestOptions';

/////////////////////////////////
// All the common things that we print are functions of this class
/////////////////////////////////
export default class Print {

	WIDTH = 77;

	typings: number;
	tsFiles: number;

	constructor(public version: string) {

	}

	public init(tsFiles: number, typings: number) {
		this.typings = typings;
		this.tsFiles = tsFiles;
	}

	public out(s: any): Print {
		process.stdout.write(s);
		return this;
	}

	public repeat(s: string, times: number): string {
		return new Array(times + 1).join(s);
	}

	public printHeader(options: ITestOptions) {
		let totalMem = Math.round(os.totalmem() / 1024 / 1024) + ' mb';
		let freemem = Math.round(os.freemem() / 1024 / 1024) + ' mb';

		this.out('=============================================================================\n');
		this.out('                    \x1B[36m\x1B[1mDefinitelyTyped Test Runner 2.0.0\x1B[0m\n');
		this.out('=============================================================================\n');
		this.out(` \x1B[36m\x1B[1mTypescript version:\x1B[0m ${this.version}\n`);
		this.out(` \x1B[36m\x1B[1mTypings           :\x1B[0m ${this.typings}\n`);
		this.out(` \x1B[36m\x1B[1mTypeScript files  :\x1B[0m ${this.tsFiles}\n`);
		this.out(` \x1B[36m\x1B[1mTotal Memory      :\x1B[0m ${totalMem}\n`);
		this.out(` \x1B[36m\x1B[1mFree Memory       :\x1B[0m ${freemem}\n`);
		this.out(` \x1B[36m\x1B[1mCores             :\x1B[0m ${os.cpus().length}\n`);
		this.out(` \x1B[36m\x1B[1mConcurrent        :\x1B[0m ${options.concurrent}\n`);
	}

	public printSuiteHeader(title: string) {
		let left = Math.floor((this.WIDTH - title.length) / 2) - 1;
		let right = Math.ceil((this.WIDTH - title.length) / 2) - 1;
		this.out(this.repeat('=', left)).out(' \x1B[34m\x1B[1m');
		this.out(title);
		this.out('\x1B[0m ').out(this.repeat('=', right)).printBreak();
	}

	public printDiv() {
		this.out('-----------------------------------------------------------------------------\n');
	}

	public printBoldDiv() {
		this.out('=============================================================================\n');
	}

	public printErrorsHeader() {
		this.out('=============================================================================\n');
		this.out('                    \x1B[34m\x1B[1mErrors in files\x1B[0m \n');
		this.out('=============================================================================\n');
	}

	public trimTravis(str: string): string {
		return String(str).replace(/^\/home\/travis\/build\/[\w\-\.]+\/[\w\-\.]+\//gm, '');
	}

	public printErrorsForFile(testResult: TestResult) {
		this.out(`----------------- For file:${testResult.targetFile.fullPath}`);
		if (testResult.diagnostics) {
			this.printBreak().out(this.trimTravis(testResult.diagnostics.join('\r\n'))).printBreak();
		} else {
			this.printBreak().out('no stderr content').printBreak();
		}
	}

	public printBreak(): Print {
		this.out('\n');
		return this;
	}

	public clearCurrentLine(): Print {
		this.out('\r\x1B[K');
		return this;
	}

	public printSuccessCount(current: number, total: number) {
		let arb = (total === 0) ? 0 : (current / total);
		this.out(` \x1B[36m\x1B[1mSuccessful      :\x1B[0m \x1B[32m\x1B[1m${(arb * 100).toFixed(2)}% (${current}/${total})\x1B[0m\n`);
	}

	public printFailedCount(current: number, total: number) {
		let arb = (total === 0) ? 0 : (current / total);
		this.out(` \x1B[36m\x1B[1mFailure         :\x1B[0m \x1B[31m\x1B[1m${(arb * 100).toFixed(2)}% (${current}/${total})\x1B[0m\n`);
	}

	public printTypingsWithoutTestsMessage() {
		this.out(' \x1B[36m\x1B[1mTyping without tests\x1B[0m\n');
	}

	public printTotalMessage() {
		this.out(' \x1B[36m\x1B[1mTotal\x1B[0m\n');
	}

	public printElapsedTime(time: string, s: number) {
		this.out(` \x1B[36m\x1B[1mElapsed time    :\x1B[0m ~${time} (${s}s)\n`);
	}

	public printSuiteErrorCount(errorHeadline: string, current: number, total: number, warn: boolean = false) {
		let arb = (total === 0) ? 0 : (current / total);
		this.out(' \x1B[36m\x1B[1m').out(errorHeadline).out(this.repeat(' ', 16 - errorHeadline.length));
		if (warn) {
			this.out(`: \x1B[31m\x1B[1m${(arb * 100).toFixed(2)}% (${current}/${total})\x1B[0m\n`);
		} else {
			this.out(`: \x1B[33m\x1B[1m${(arb * 100).toFixed(2)}% (${current}/${total})\x1B[0m\n`);
		}
	}

	public printSubHeader(file: string) {
		this.out(` \x1B[36m\x1B[1m${file}\x1B[0m\n`);
	}

	public printWarnCode(str: string) {
		this.out(` \x1B[31m\x1B[1m<${str.toLowerCase().replace(/ +/g, '-')}>\x1B[0m\n`);
	}

	public printLine(file: string) {
		this.out(`${file}\n`);
	}

	public printElement(file: string) {
		this.out(` - ${file}\n`);
	}

	public printElement2(file: string) {
		this.out(`    - ${file}\n`);
	}

	public printTypingsWithoutTestName(file: string) {
		this.out(` - \x1B[33m\x1B[1m${file}\x1B[0m\n`);
	}

	public printTypingsWithoutTest(withoutTestTypings: string[]) {
		if (withoutTestTypings.length > 0) {
			this.printTypingsWithoutTestsMessage();

			this.printDiv();
			withoutTestTypings.forEach((t) => {
				this.printTypingsWithoutTestName(t);
			});
		}
	}

	public printTestComplete(testResult: TestResult): void {
		let reporter = testResult.hostedBy.testReporter;
		if (testResult.success) {
			reporter.printPositiveCharacter(testResult);
		} else {
			reporter.printNegativeCharacter(testResult);
		}
	}

	public printSuiteComplete(suite: ITestSuite): void {
		this.printBreak();

		this.printDiv();
		this.printElapsedTime(suite.timer.asString, suite.timer.time);
		this.printSuccessCount(suite.okTests.length, suite.testResults.length);
		this.printFailedCount(suite.ngTests.length, suite.testResults.length);
	}

	public printTests(adding: FileDict): void {
		this.printDiv();
		this.printSubHeader('Testing');
		this.printDiv();

		let keys = Object.keys(adding);
		if (keys.length > 0) {
			keys.sort().map((src) => {
				this.printLine(adding[src].fullPath);
				return adding[src];
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printQueue(files: File[]): void {
		this.printDiv();
		this.printSubHeader('Queued for testing');
		this.printDiv();

		if (files.length > 0) {
			files.forEach((file) => {
				this.printLine(file.fullPath);
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printTestAll(): void {
		this.printDiv();
		this.printSubHeader('Ignoring changes, testing all files');
	}

	public printTestInternal(): void {
		this.printDiv();
		this.printSubHeader('Infrastructure change detected, testing all files');
	}

	public printFiles(files: File[]): void {
		this.printDiv();
		this.printSubHeader('Files');
		this.printDiv();

		if (files.length > 0) {
			files.forEach((file) => {
				this.printLine(file.fullPath);
				/*
				file.references.forEach((file) => {
					this.printElement(file.filePathWithName);
				});
				*/
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printMissing(index: FileIndex, refMap: FileArrDict): void {
		this.printDiv();
		this.printSubHeader('Missing references');
		this.printDiv();

		let keys = Object.keys(refMap);
		if (keys.length > 0) {
			keys.sort().forEach((src) => {
				let ref = index.getFile(src);
				this.printLine(`\x1B[31m\x1B[1m${ref.fullPath}\x1B[0m`);
				refMap[src].forEach((file) => {
					this.printElement(file.fullPath);
				});
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printAllChanges(paths: string[]): void {
		this.printSubHeader('All changes');
		this.printDiv();

		if (paths.length > 0) {
			paths.sort().forEach((line) => {
				this.printLine(line);
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printRelChanges(changeMap: FileDict): void {
		this.printDiv();
		this.printSubHeader('Interesting files');
		this.printDiv();

		let keys = Object.keys(changeMap);
		if (keys.length > 0) {
			keys.sort().forEach((src) => {
				this.printLine(changeMap[src].fullPath);
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printRemovals(changeMap: FileDict): void {
		this.printDiv();
		this.printSubHeader('Removed files');
		this.printDiv();

		let keys = Object.keys(changeMap);
		if (keys.length > 0) {
			keys.sort().forEach((src) => {
				this.printLine(changeMap[src].fullPath);
			});
		} else {
			this.printLine(' no files listed here');
		}
	}

	public printRefMap(index: FileIndex, refMap: FileArrDict): void {
		this.printDiv();
		this.printSubHeader('Referring');
		this.printDiv();

		let keys = Object.keys(refMap);
		if (keys.length > 0) {
			keys.sort().forEach((src) => {
				let ref = index.getFile(src);
				this.printLine(ref.fullPath);
				refMap[src].forEach((file) => {
					this.printLine(` - ${file.fullPath}`);
				});
			});
		} else {
			this.printLine(' no files listed here');
		}
	}
}
