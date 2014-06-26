'use strict';
var path = require('path');
var Git = require('git-wrapper');
var Promise = require('bluebird');
var util = require('./util');
var GitChanges = (function () {
    function GitChanges(dtPath) {
        this.dtPath = dtPath;
    }
    GitChanges.prototype.readChanges = function () {
        var dir = path.join(this.dtPath, '.git');
        return util.fileExists(dir).then(function (exists) {
            if (!exists) {
                throw new Error('cannot locate git-dir: ' + dir);
            }
            return new Promise(function (resolve, reject) {
                var args = ['--name-only HEAD~1'];
                var opts = {};
                var git = new Git({
                    'git-dir': dir
                });
                git.exec('diff', opts, args, function (err, msg) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg.replace(/^\s+/, '').replace(/\s+$/, '').split(/\r?\n/g));
                    }
                });
            });
        });
    };
    return GitChanges;
})();
module.exports = GitChanges;
