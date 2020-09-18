const _datetimeUtils = {
    /**
     * 格式成2012-10-15 12:13:14格式的字符串
     */
    formatFullTime: function(t) {
        var str = '';
        str = str + t.getFullYear() + '-' + this.format2Char(t.getMonth() + 1) + '-' + this.format2Char(t.getDate());
        str = str + ' ' + this.format2Char(t.getHours()) + ':' + this.format2Char(t.getMinutes()) + ':' + this.format2Char(t.getSeconds());
        return str;
    },

    /**
     * 格式成2012-10-15格式的字符串
     */
    formatDateTime: function(t) {
        var str = '';
        str = str + t.getFullYear() + '-' + this.format2Char(t.getMonth() + 1) + '-' + this.format2Char(t.getDate());
        return str;
    },

    /**
     * 将20141013的日期字符串转成2014-10-13格式
     * @param dateStr
     */
    formatDate2: function(dateStr) {
        if (dateStr) {
            var arr = [];
            arr.push(dateStr.substring(0, 4));
            arr.push(dateStr.substring(4, 6));
            arr.push(dateStr.substring(6, 8));
            return arr.join('-');
        }
    },

    /**
     * 将2014-10-13的日期字符串转成2014年10月13日格式
     * @param dateStr
     */
    formatDate3: function(dateStr) {
        if (dateStr) {
            var arr = dateStr.split("-");
            return arr[0] + "年" + arr[1] + "月" + arr[2] + "日";
        }
    },

    /**
     * 格式成YYYYMMDDHHmmss格式的字符串
     */
    formatNumberTime: function(t) {
        var str = '';
        str = str + t.getFullYear() + this.format2Char(t.getMonth() + 1) + this.format2Char(t.getDate());
        str = str + this.format2Char(t.getHours()) + this.format2Char(t.getMinutes()) + this.format2Char(t.getSeconds());
        return str;
    },

    /**
     * 解析格式如'2012-10-15 12:13:14'的字符串
     */
    parseTime: function(str) {
        var dayArr = str.split(' ')[0].split('-');
        var timeArr = str.split(' ')[1].split(':');
        var t = new Date();
        t.setMilliseconds(0);
        t.setSeconds(Number(timeArr[2]));
        t.setMinutes(Number(timeArr[1]));
        t.setHours(Number(timeArr[0]));
        t.setDate(Number(dayArr[2]));
        t.setMonth(Number(dayArr[1]) - 1);
        t.setFullYear(Number(dayArr[0]));
        return t;
    },

    /**
     * 解析格式如'2012-10-15'的字符串
     * @param str
     */
    parseDate: function(str) {
        //str = '2015-10-31'
        var dayArr = str.split('-');
        var t = new Date();
        t.setDate(Number(dayArr[2]));
        t.setMonth(Number(dayArr[1]) - 1);
        t.setFullYear(Number(dayArr[0]));
        return t;
    },

    /**
     * 根据日期周几数值
     * @param dateStr
     * @returns
     */
    getWeekNumByDateStr: function(dateStr) {
        if (dateStr.length > 10) {
            dateStr = dateStr.substring(0, 10);
        }
        var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
        var day = weekDay[myDate.getDay()];
        return day;
    },

    /**
     * 根据日期星期几字符
     * @param dateStr
     * @returns
     */
    getWeekStrByDateStr: function(dateStr) {
        var weekNum = getWeekNumByDateStr(dateStr);
        switch (weekNum) {
            case '周日':
                return '星期日';
            case '周一':
                return '星期一';
            case '周二':
                return '星期二';
            case '周三':
                return '星期三';
            case '周四':
                return '星期四';
            case '周五':
                return '星期五';
            case '周六':
                return '星期六';
        }
    },

    /**
     * 根据日期周几字符
     * @param dateStr
     * @returns
     */
    getWeekStrByDateStr2: function(dateStr) {
        var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
        var day = weekDay[myDate.getDay()];
        return day;
    },

    getWeekStrByDate: function(date) {
        var weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        var day = weekDay[date.getDay()];
        return day;
    },

    getWeekStrByDate2: function(date) {
        var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        var day = weekDay[date.getDay()];
        return day;
    },

    /**
     * 把数字格式为两位如1到01
     * @param num
     * @returns
     */
    format2Char: function(num) {
        var str = String(num);
        if (str && str.length == 1) {
            return '0' + str;
        }
        return str;
    },

    /**
     * 判断是否是历史天
     * 判断 '2012-10-05'是当天、历史天、或将来天
     * 当天返回0，历史天返回-1，将来天返回1
     */
    isWhichDay: function(dateStr) {
        if (dateStr.length > 10) {
            dateStr = dateStr.substring(0, 10);
        }
        dateStr = dateStr + ' 10:00:00';
        var historyDay = this.parseTime(dateStr);

        var today = new Date();
        today.setMilliseconds(0);
        today.setSeconds(0);
        today.setMinutes(0);
        today.setHours(10);

        var vs = today.getTime() - historyDay.getTime();
        if (vs > 0) {
            return -1;
        } else if (vs == 0) {
            return 0;
        } else {
            return 1;
        }
    },

    /*
     * 根据date对象返回年月日格式的字符串
     */
    getYMDStrofDate: function(d) {
        if (d) {
            var monthStr = String(d.getMonth() + 1);
            monthStr = monthStr.length == 1 ? '0' + monthStr : monthStr;
            var dateStr = String(d.getDate());
            dateStr = dateStr.length == 1 ? '0' + dateStr : dateStr;
            return d.getFullYear() + '-' + monthStr + '-' + dateStr;
        }
    },

    /**
     * 比较格式如2012-10-15 12:13:14的两个时间的大小
     * 1 > 2, 返回1，等于，返回0， 小于，返回-1
     * @param time1
     * @param time2
     */
    compareTimeStr: function(time1, time2) {
        var t1 = this.parseTime(time1).getTime();
        var t2 = this.parseTime(time2).getTime();
        if (t1 > t2) {
            return 1;
        } else if (t1 < t2) {
            return -1;
        } else {
            return 0;
        }
    },

    /**
     * 获得当前时间
     * @param flag 0返回时间的数字组合 1以时间格式返回
     * @returns {String} 
     */
    GetCurrentTime: function(flag) {
        var currentTime = "";
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
        if (month < 10) {
            month = "0" + month.toString();
        }
        var date = myDate.getDate();
        if (date < 10) {
            date = "0" + date.toString();
        }
        var hour = myDate.getHours();
        if (hour < 10) {
            hour = "0" + hour.toString();
        }
        var minute = myDate.getMinutes();
        if (minute < 10) {
            minute = "0" + minute.toString();
        }
        var second = myDate.getSeconds();
        if (second < 10) {
            second = "0" + second.toString();
        }
        if (flag == "0") //返回时间的数字组合
        {
            currentTime = year.toString() + month.toString() + date.toString() + hour.toString() + minute.toString() + second.toString();
        } else if (flag == "1") //以时间格式返回
        {
            currentTime = year.toString() + "-" + month.toString() + "-" + date.toString() + " " + hour.toString() + ":" + minute.toString() + ":" + second.toString();
        }
        return currentTime;
    },
    /**
     * 获得当前
     * @param flag 0返回时间的数字组合 1以时间格式返回
     * @returns {String} 
     */
    GetTimeNine: function() {
        var currentTime = "";
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
        if (month < 10) {
            month = "0" + month.toString();
        }
        var date = myDate.getDate();
        if (date < 10) {
            date = "0" + date.toString();
        }
        var hour = myDate.getHours();
        if (hour < 10) {
            hour = "0" + hour.toString();
        }
        var minute = myDate.getMinutes();
        if (minute < 10) {
            minute = "0" + minute.toString();
        }
        var second = myDate.getSeconds();
        if (second < 10) {
            second = "0" + second.toString();
        }
        currentTime = year.toString() + "-" + month.toString() + "-" + date.toString();

        return currentTime;
    },
    /**
     * 获得当前
     * @param flag 0返回时间的数字组合 1以时间格式返回
     * @returns {String} 
     */
    GetNewDate: function() {
        var currentTime = "";
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
        if (month < 10) {
            month = "0" + month.toString();
        }
        var date = myDate.getDate();
        if (date < 10) {
            date = "0" + date.toString();
        }
        var hour = myDate.getHours();
        if (hour < 10) {
            hour = "0" + hour.toString();
        }
        var minute = myDate.getMinutes();
        if (minute < 10) {
            minute = "0" + minute.toString();
        }
        var second = myDate.getSeconds();
        if (second < 10) {
            second = "0" + second.toString();
        }
        currentTime = year.toString() + month.toString() + date.toString();

        return currentTime;
    },
    /**
     * 得到下几天时间
     * @param dd
     * @returns {String}
     */
    getNextDayDate: function(AddDayCount, dd) {
        var date = new Date(dd);
        date = +date + 1000 * 60 * 60 * 24 * (AddDayCount);
        date = new Date(date);
        return date;
    },

    /**
     * 得到下几天时间
     * @param dd
     * @returns {String}
     */
    getNextDay: function(AddDayCount, dd) {
        var date = new Date(dd);
        date = +date + 1000 * 60 * 60 * 24 * (AddDayCount);
        date = new Date(date);
        var y = date.getFullYear();
        var m = date.getMonth() + 1; //获取当前月份的日期 
        var d = date.getDate();
        var dateStr = "";
        //格式化
        if (d < 10) {
            d = "0" + d;
        }
        if (m < 10) {
            m = "0" + m;
        }
        dateStr = y + "-" + m + "-" + d;
        return dateStr;

    },

    compateDay: function(nowTime, lastTime, nextTime) {
        if (lastTime <= nowTime && lastTime <= nextTime) {
            return true;
        } else {
            return false;
        }

    },

    stringToDate: function(date, format) {
        if (typeof date == 'string') {
            date = this.parseTime(date);
        }
        date = new Date(date);
        var map = {
            "M": date.getMonth() + 1, //月份 
            "d": date.getDate(), //日 
            "h": date.getHours(), //小时 
            "m": date.getMinutes(), //分 
            "s": date.getSeconds(), //秒 
            "q": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
            var v = map[t];
            if (v !== undefined) {
                if (all.length > 1) {
                    v = '0' + v;
                    v = v.substr(v.length - 2);
                }
                return v;
            } else if (t === 'y') {
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    },

    compareDate: function(d1, d2) {
        return ((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))));
    },

    DateMinus: function(sDate, mDate) {　　
        var sdate = new Date(sDate.replace(/-/g, "/"));
        var mDate = new Date(mDate.replace(/-/g, "/"));　　
        var days = mDate.getTime() - sdate.getTime();　　
        var day = parseInt(days / (1000 * 60 * 60 * 24));　　
        return day;
    },

    datedifference: function(sDate1, sDate2) { //sDate1和sDate2是2006-12-18格式  
        var dateSpan,
            tempDate,
            iDays;
        sDate1 = Date.parse(sDate1);
        sDate2 = Date.parse(sDate2);
        dateSpan = sDate2 - sDate1;
        dateSpan = Math.abs(dateSpan);
        iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
        return iDays
    },

    /**
     * 获取当前月的第一天
     */
    getCurrentMonthFirst: function(date) {
        if (!date) {
            date = new Date();
        }
        date.setDate(1);
        return date;
    },
    /**
     * 获取当前月的最后一天
     */
    getCurrentMonthLast: function(date) {
        if (!date) {
            date = new Date();
        }
        var currentMonth = date.getMonth();
        var nextMonth = ++currentMonth;
        var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
        var oneDay = 1000 * 60 * 60 * 24;
        return new Date(nextMonthFirstDay - oneDay);
    },

    //获取当前时间，格式YYYY-MM-DD
    //把字符串日期转为日期
    ConvertStrToDate: function(datetimeStr) {
        var mydateint = Date.parse(datetimeStr); //数值格式的时间
        if (!isNaN(mydateint)) {
            var mydate = new Date(mydateint);
            return mydate;
        }
        var mydate = new Date(datetimeStr); //字符串格式时间
        var monthstr = mydate.getMonth() + 1;
        if (!isNaN(monthstr)) { //转化成功
            return mydate;
        } //字符串格式时间转化失败
        var dateParts = datetimeStr.split(" ");
        var dateToday = new Date();
        var year = dateToday.getFullYear();
        var month = dateToday.getMonth();
        var day = dateToday.getDate();
        if (dateParts.length >= 1) {
            var dataPart = dateParts[0].split("-"); //yyyy-mm-dd  格式时间             
            if (dataPart.length == 1) {
                dataPart = dateParts[0].split("/"); //yyyy/mm/dd格式时间
            }
            if (dataPart.length == 3) {
                year = Math.floor(dataPart[0]);
                month = Math.floor(dataPart[1]) - 1;
                day = Math.floor(dataPart[2]);
            }
        }
        if (dateParts.length == 2) { //hh:mm:ss格式时间
            var timePart = dateParts[1].split(":"); //hh:mm:ss格式时间
            if (timePart.length == 3) {
                var hour = Math.floor(timePart[0]);
                var minute = Math.floor(timePart[1]);
                var second = Math.floor(timePart[2]);
                return new Date(year, month, day, hour, minute, second);
            }
        } else {
            return new Date(year, month, day);
        }
    },

    //获取服务器时间
    getServerDate: function() {
        return new Date($.ajax({ async: false }).getResponseHeader("Date"));

    }


}