'use strict';
var fs = require('fs');
var Promise = require('bluebird');
var globMod = require('glob');
var referenceTagExp = /\/\/\/[ \t]*<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
exports.endsWith = endsWith;
function extractReferenceTags(source) {
    var ret = [];
    var match;
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
exports.extractReferenceTags = extractReferenceTags;
function glob(pattern, opts) {
    return new Promise(function (resolve, reject) {
        globMod(pattern, opts || {}, function (err, files) {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}
exports.glob = glob;
function fileExists(target) {
    return new Promise(function (resolve, reject) {
        fs.exists(target, function (bool) {
            resolve(bool);
        });
    });
}
exports.fileExists = fileExists;
function readFile(target) {
    return new Promise(function (resolve, reject) {
        fs.readFile(target, 'utf-8', function (err, contents) {
            if (err) {
                reject(err);
            } else {
                resolve(contents);
            }
        });
    });
}
exports.readFile = readFile;
