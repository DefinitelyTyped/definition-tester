'use strict';

import * as fs from 'fs';
import * as Lint from 'tslint';
import {RuleFailure} from 'tslint/lib/language/rule/rule';

let longStr = '>----------------------------------------------------------------------';

function point(chars: number): string {
	if (longStr.length < chars) {
		for (let i = 0; i < chars + 10; i++) {
			longStr += '-';
		}
	}
	return longStr.substr(0, chars - 1) + '^';
}

export default class Formatter {

	public format(failures: RuleFailure[]): string {
		let output: string[] = [];

		if (failures.length > 0) {
			let file = failures[0].getFileName();
			let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/g);

			output.push('');
			output.push('');
			output.push(`> ${file}`);
			output.push('');

			for (let i = 0; i < failures.length; i++) {
				let failure = failures[i];
				let failureString = failure.getFailure();
				let ruleName = failure.getRuleName();

				let lineAndCharacter = failure.getStartPosition().getLineAndCharacter();
				let line = lineAndCharacter.line + 1;
				let character = lineAndCharacter.character + 1;

				output.push(`[${ruleName}] ${failureString} at line ${line}, character ${character}:`);
				output.push('');
				output.push(lines[lineAndCharacter.line].replace(/\t/g, '    '));
				output.push(point(character));
				output.push('\n');
			}
		}
		return output.join('\n');
	}
}
