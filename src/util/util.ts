'use strict';

import * as fs from 'fs';
import * as Lazy from 'lazy.js';
import * as Promise from 'bluebird';
import * as globMod from 'glob';
var grace_fs = require('graceful-fs');

let referenceTagExp = /\/\/\/[ \t]*<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

export type FullPath = string & { 'is full path': any};
export type TsConfigFullPath = FullPath & { 'is config file': any};

export function endsWith(str: string, suffix: string) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function extractReferenceTags(source: string): string[] {
	let ret: string[] = [];
	let match: RegExpExecArray;

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
	return new Promise<string[]>((resolve: (result: string[]) => void, reject: (error: any) => void) => {
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
	return new Promise<boolean>((resolve: (result: boolean) => void, reject: (error: any) => void) => {
		fs.exists(target, (bool: boolean) => {
			resolve(bool);
		});
	});
}

export function readFile(target: string): Promise<string> {
	return new Promise<string>((resolve: (result: string) => void, reject: (error: any) => void) => {
		grace_fs.readFile(target, 'utf-8', (err: Error, contents: string) => {
			if (err) {
				reject(err);
			} else {
				resolve(contents);
			}
		});
	});
}

export function readJSON(target: string): Promise<string> {
	return readFile(target).then((contents) => {
		return JSON.parse(contents);
	});
}

export function fixPath(str: string): string {
	return str.replace(/^[a-z]:/i, (s: string) => {
		return s.toLowerCase();
	});
}
