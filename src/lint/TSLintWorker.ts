'use strict';

import * as fs from 'fs';
import * as path from 'path';

import * as Linter from 'tslint';

import * as mc from 'manticore';

mc.registerTask(function lint(params: any, callback: (err: Error, res: any) => void) {
	mc.assertType(params, 'object', 'params');
	mc.assertType(params.filePath, 'string', 'params.filePath');
	mc.assertType(params.options, 'object', 'params.options');

	fs.exists(params.filePath, (exist) => {
		if (!exist) {
			return callback(null, null);
		}
		fs.readFile(params.filePath, 'utf8', (err, contents) => {
			if (err) {
				callback(err, null);
				return;
			}
			let linter = new Linter(params.filePath, contents, params.options);
			let result = linter.lint();

			result.output = result.output.split('\n').reduce((memo: string[], line: string) => {
				if (line !== '') {
					memo.push(line + '\n');
				}
				return memo;
			}, []).join('');

			callback(err, result);
		});
	});
});
