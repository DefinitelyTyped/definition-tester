'use strict';
/////////////////////////////////
// Timer.start starts a timer
// Timer.end stops the timer and sets asString to the pretty print value
/////////////////////////////////
var Timer = (function () {
    function Timer() {
        this.time = 0;
        this.asString = '<not-started>';
    }
    Timer.prototype.start = function () {
        this.time = 0;
        this.startTime = this.now();
        this.asString = '<started>';
    };
    Timer.prototype.now = function () {
        return Date.now();
    };
    Timer.prototype.end = function () {
        this.time = (this.now() - this.startTime) / 1000;
        this.asString = Timer.prettyDate(this.startTime, this.now());
    };
    Timer.prettyDate = function (date1, date2) {
        var diff = ((date2 - date1) / 1000);
        var day_diff = Math.floor(diff / 86400);
        if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
            return null;
        }
        return (day_diff === 0 && (diff < 60 && (diff + ' seconds') || diff < 120 && '1 minute' || diff < 3600 && Math.floor(diff / 60) + ' minutes' || diff < 7200 && '1 hour' || diff < 86400 && Math.floor(diff / 3600) + ' hours') || day_diff === 1 && 'Yesterday' || day_diff < 7 && day_diff + ' days' || day_diff < 31 && Math.ceil(day_diff / 7) + ' weeks');
    };
    return Timer;
})();
module.exports = Timer;
