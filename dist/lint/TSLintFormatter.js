var fs = require('fs');
var longStr = '>----------------------------------------------------------------------';
function point(chars) {
    if (longStr.length < chars) {
        for (var i = 0; i < chars + 10; i++) {
            longStr += '-';
        }
    }
    return longStr.substr(0, chars - 1) + '^';
}
var Formatter = (function () {
    function Formatter() {
    }
    Formatter.prototype.format = function (failures) {
        var output = [];
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
                var line = lineAndCharacter.line() + 1;
                var character = lineAndCharacter.character() + 1;
                output.push('>-- ' + character + ', ' + line + ' : ' + failureString + ' (' + ruleName + ')');
                output.push('');
                output.push(lines[lineAndCharacter.line()].replace(/\t/g, '    '));
                output.push(point(character));
                output.push('');
            }
        }
        return output.join('\n');
    };
    return Formatter;
})();
exports.Formatter = Formatter;
