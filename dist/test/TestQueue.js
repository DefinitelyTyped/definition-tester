var Promise = require('bluebird');
/////////////////////////////////
// Parallel execute Tests
/////////////////////////////////
var TestQueue = (function () {
    function TestQueue(concurrent) {
        this.queue = [];
        this.active = [];
        this.concurrent = Math.max(1, concurrent);
    }
    // add to queue and return a promise
    TestQueue.prototype.run = function (test) {
        var _this = this;
        var defer = Promise.defer();
        // add a closure to queue
        this.queue.push(function () {
            // run it
            var p = test.run();
            p.then(defer.resolve.bind(defer), defer.reject.bind(defer));
            p.finally(function () {
                var i = _this.active.indexOf(test);
                if (i > -1) {
                    _this.active.splice(i, 1);
                }
                _this.step();
            });
            // return it
            return test;
        });
        this.step();
        // defer it
        return defer.promise;
    };
    TestQueue.prototype.step = function () {
        while (this.queue.length > 0 && this.active.length < this.concurrent) {
            // console.log([this.queue.length, this.active.length, this.concurrent]);
            this.active.push(this.queue.pop().call(null));
        }
    };
    return TestQueue;
})();
module.exports = TestQueue;
