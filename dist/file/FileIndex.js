'use strict';
var path = require('path');
var Lazy = require('lazy.js');
var Promise = require('bluebird');
var util = require('../util/util');
var File = require('./File');
/////////////////////////////////
// Track all files in the repo: map full path to File objects
/////////////////////////////////
var FileIndex = (function () {
    function FileIndex(options) {
        this.options = options;
    }
    FileIndex.prototype.checkAcceptFile = function (fileName) {
        var ok = /\.ts$/.test(fileName) && /^[a-z]/i.test(fileName);
        ok = ok && fileName.indexOf('_infrastructure/') < 0;
        ok = ok && fileName.indexOf('node_modules/') < 0;
        return ok;
    };
    FileIndex.prototype.listIndex = function () {
        return Object.keys(this.fileMap);
    };
    FileIndex.prototype.hasFile = function (target) {
        return target in this.fileMap;
    };
    FileIndex.prototype.getFile = function (target) {
        if (target in this.fileMap) {
            return this.fileMap[target];
        }
        return null;
    };
    FileIndex.prototype.setFile = function (file) {
        if (file.fullPath in this.fileMap) {
            throw new Error('cannot overwrite file');
        }
        this.fileMap[file.fullPath] = file;
    };
    FileIndex.prototype.readIndex = function () {
        var _this = this;
        this.fileMap = Object.create(null);
        return util.glob('**/*.ts', {
            cwd: this.options.dtPath
        }).then(function (fileNames) {
            _this.files = Lazy(fileNames).filter(function (fileName) {
                return _this.checkAcceptFile(fileName);
            }).map(function (fileName) {
                var file = new File(_this.options.dtPath, fileName);
                _this.fileMap[file.fullPath] = file;
                return file;
            }).toArray();
        }).return();
    };
    FileIndex.prototype.collectDiff = function (changes) {
        var _this = this;
        return new Promise(function (resolve) {
            // filter changes and bake map for easy lookup
            _this.changed = Object.create(null);
            _this.removed = Object.create(null);
            Lazy(changes).filter(function (full) {
                return _this.checkAcceptFile(full);
            }).uniq().each(function (local) {
                var full = path.resolve(_this.options.dtPath, local);
                var file = _this.getFile(full);
                if (!file) {
                    // TODO figure out what to do here
                    // what does it mean? deleted?
                    file = new File(_this.options.dtPath, local);
                    _this.setFile(file);
                    _this.removed[full] = file;
                } else {
                    _this.changed[full] = file;
                }
            });
            resolve(null);
        });
    };
    FileIndex.prototype.parseFiles = function () {
        var _this = this;
        return this.loadReferences(this.files).then(function () {
            return _this.getMissingReferences();
        });
    };
    FileIndex.prototype.getMissingReferences = function () {
        var _this = this;
        return Promise.attempt(function () {
            _this.missing = Object.create(null);
            Lazy(_this.removed).keys().each(function (removed) {
                if (removed in _this.refMap) {
                    _this.missing[removed] = _this.refMap[removed];
                }
            });
        });
    };
    FileIndex.prototype.loadReferences = function (files) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var queue = files.slice(0);
            var active = [];
            var max = 50;
            var next = function () {
                if (queue.length === 0 && active.length === 0) {
                    resolve(null);
                    return;
                }
                while (queue.length > 0 && active.length < max) {
                    var file = queue.pop();
                    active.push(file);
                    _this.parseFile(file).then(function (file) {
                        active.splice(active.indexOf(file), 1);
                        next();
                    }).catch(function (err) {
                        queue = [];
                        active = [];
                        reject(err);
                    });
                }
            };
            next();
        }).then(function () {
            // bake reverse reference map (referenced to referrers)
            _this.refMap = Object.create(null);
            Lazy(files).each(function (file) {
                Lazy(file.references).each(function (ref) {
                    _this.addToRefMap(ref.fullPath, file);
                });
            });
        });
    };
    FileIndex.prototype.addToRefMap = function (fullPath, file) {
        if (fullPath in this.refMap) {
            this.refMap[fullPath].push(file);
        } else {
            this.refMap[fullPath] = [file];
        }
    };
    // TODO replace with a stream?
    FileIndex.prototype.parseFile = function (file) {
        var _this = this;
        return util.readFile(file.fullPath).then(function (content) {
            file.references = Lazy(util.extractReferenceTags(content)).map(function (ref) {
                return path.resolve(path.dirname(file.fullPath), ref);
            }).reduce(function (memo, ref) {
                if (ref in _this.fileMap) {
                    memo.push(_this.fileMap[ref]);
                } else {
                    console.log(' not mapped? -> ' + ref);
                    // console.log(Object.keys(this.fileMap).join('\n'));
                }
                return memo;
            }, []);
            // return the object
            return file;
        });
    };
    FileIndex.prototype.collectTargets = function () {
        var _this = this;
        return new Promise(function (resolve) {
            // map out files linked to changes
            // - queue holds files touched by a change
            // - pre-fill with actually changed files
            // - loop queue, if current not seen:
            //    - add to result
            //    - from refMap queue all files referring to current
            var result = Object.create(null);
            var queue = Lazy(_this.changed).values().toArray();
            while (queue.length > 0) {
                var next = queue.shift();
                var fp = next.fullPath;
                if (result[fp]) {
                    continue;
                }
                result[fp] = next;
                if (fp in _this.refMap) {
                    var arr = _this.refMap[fp];
                    for (var i = 0, ii = arr.length; i < ii; i++) {
                        // just add it and skip expensive checks
                        queue.push(arr[i]);
                    }
                }
            }
            resolve(Lazy(result).values().toArray());
        });
    };
    return FileIndex;
})();
module.exports = FileIndex;
