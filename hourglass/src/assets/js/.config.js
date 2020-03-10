import moment from "moment";

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

let Config = {
    importantDate: {
        F: {
            start: [2019, 9, 4],
            end: [2019, 12, 4],
            readingWeekStart: [2019, 11, 4]
        },
        W: {
            start: [2020, 1, 6],
            end: [2020, 4, 2],
            readingWeekStart: [2020, 2, 17]
        },
        Y: {
            start: [2019, 9, 4],
            end: [2020, 4, 2],
            readingWeekStart1: [2019, 11, 4],
            readingWeekStart2: [2020, 2, 17]
        }
    },
    functions: {
        getDateOfNextDay: function (date, day) {
            switch (day) {
                case 'MO':
                    day = 1;
                    break;
                case 'TU':
                    day = 2;
                    break;
                case 'WE':
                    day = 3;
                    break;
                case 'TH':
                    day = 4;
                    break;
                case 'FR':
                    day = 5;
                    break;
                default:
                    break
            }
            date = new Date(date[0], date[1] - 1, date[2]);
            var dayOfDate = date.getDay()
            var diff = day - dayOfDate;
            if (diff < 0) {
                diff += 7
            }
            let resultDate = date.addDays(diff)
            return [resultDate.getFullYear(), resultDate.getMonth() + 1, resultDate.getDate()]
        },
        getDateTimeString: function (date) {
            date = moment().year(date[0]).month(date[1] - 1).date(date[2]).add('1', 'd');
            return date.format("YYYYMMDDT230000") + 'Z'
        }
    }
};

export default Config