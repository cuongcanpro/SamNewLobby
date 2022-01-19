WChallengeUtils = {
    shortenNumberToStr: function (x) {
        if(!Number.isInteger(x)) {
            return '';
        }
        var suffix = '';
        if(x >= 1000000000) {
            x = x / 1000000000;
            suffix = 'B';
        } else
        if(x >= 1000000) {
            x = x / 1000000;
            suffix = 'M';
        } else
        if(x >= 1000) {
            x = x/1000;
            suffix = 'K';
        }
        if(x !== Math.round(x)) {
            x = x.toFixed(1);
        } else {
            x = x.toString();
        }
        return x + suffix;
    },
    reduceBigNumber: function (val) {
        if(!Number.isInteger(val)) {
            return 0;
        }
        if (val < 6) {
            return val;
        }
        return 5 + Math.round(Math.sqrt(val));
    }
};