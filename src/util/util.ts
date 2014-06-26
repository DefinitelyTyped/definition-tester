/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import Lazy = require('lazy.js');
import Promise = require('bluebird');
import globMod = require('glob');

var referenceTagExp = /\/\/\/[ \t]*<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

export function endsWith(str: string, suffix: string) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function extractReferenceTags(source: string): string[] {
	var ret: string[] = [];
	var match: RegExpExecArray;

	if (!referenceTagExp.global) {
		throw new Error('referenceTagExp RegExp must have global flag');
	}
	referenceTagExp.lastIndex = 0;

	while ((match = referenceTagExp.exec(source))) {
		if (match.length > 0 && match[1].length > 0) {
			ret.push(match[1]);
		}
	}
	return ret;
}

export function glob(pattern: string, opts?: globMod.IOptions): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		globMod(pattern, opts || {}, (err: Error, files: string[]) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

export function fileExists(target: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.exists(target, (bool: boolean) => {
			resolve(bool);
		});
	});
}

export function readFile(target: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(target, 'utf-8', (err: Error, contents: string) => {
			if (err) {
				reject(err);
			} else {
				resolve(contents);
			}
		});
	});
}
