/////////////////////////////////
// Default test reporter
/////////////////////////////////
var DefaultTestReporter = (function () {
    function DefaultTestReporter(print) {
        this.print = print;
        this.index = 0;
    }
    DefaultTestReporter.prototype.printPositiveCharacter = function (testResult) {
        this.print.out('\33[36m\33[1m' + '.' + '\33[0m');
        this.index++;
        this.printBreakIfNeeded(this.index);
    };
    DefaultTestReporter.prototype.printNegativeCharacter = function (testResult) {
        this.print.out('x');
        this.index++;
        this.printBreakIfNeeded(this.index);
    };
    DefaultTestReporter.prototype.printBreakIfNeeded = function (index) {
        if (index % this.print.WIDTH === 0) {
            this.print.printBreak();
        }
    };
    return DefaultTestReporter;
})();
module.exports = DefaultTestReporter;
