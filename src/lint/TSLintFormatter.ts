'use strict';

import fs = require('fs');
import Lint = require('tslint');
import {RuleFailure} from 'tslint/lib/language/rule/rule';

var longStr = '>----------------------------------------------------------------------';

function point(chars: number): string {
	if (longStr.length < chars) {
		for (var i = 0; i < chars + 10; i++) {
			longStr += '-';
		}
	}
	return longStr.substr(0, chars - 1) + '^';
}

export class Formatter {

	public format(failures: RuleFailure[]): string {
		var output: string[] = [];

		if (failures.length > 0) {
			var file = failures[0].getFileName();
			var lines = fs.readFileSync(file, 'utf8').split(/\r?\n/g);

			output.push('');
			output.push('');
			output.push('> ' + file);
			output.push('');

			for (var i = 0; i < failures.length; i++) {
				var failure = failures[i];
				var failureString = failure.getFailure();
				var ruleName = failure.getRuleName();

				var lineAndCharacter = failure.getStartPosition().getLineAndCharacter();
				var line = lineAndCharacter.line + 1;
				var character = lineAndCharacter.character + 1;

				output.push('[' + ruleName + '] ' + failureString + ' at line ' + line + ', character ' + character + ':');
				output.push('');
				output.push(lines[lineAndCharacter.line].replace(/\t/g, '    '));
				output.push(point(character));
				output.push('\n');
			}
		}
		return output.join('\n');
	}
}
