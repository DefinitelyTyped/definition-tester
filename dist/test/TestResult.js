/////////////////////////////////
// Test results
/////////////////////////////////
var TestResult = (function () {
    function TestResult() {
    }
    Object.defineProperty(TestResult.prototype, "success", {
        get: function () {
            return this.exitCode === 0;
        },
        enumerable: true,
        configurable: true
    });
    return TestResult;
})();
module.exports = TestResult;
