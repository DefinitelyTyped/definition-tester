'use strict';
var path = require('path');
var File = (function () {
    function File(baseDir, filePathWithName) {
        this.references = [];
        // why choose?
        this.baseDir = baseDir;
        this.filePathWithName = filePathWithName;
        this.ext = path.extname(this.filePathWithName);
        this.file = path.basename(this.filePathWithName, this.ext);
        this.dir = path.dirname(this.filePathWithName);
        this.fullPath = path.join(this.baseDir, this.dir, this.file + this.ext);
    }
    File.prototype.toString = function () {
        return '[File ' + this.filePathWithName + ']';
    };
    return File;
})();
module.exports = File;
