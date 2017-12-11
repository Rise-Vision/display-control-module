/* eslint-disable */
const factory = {};

const RECURRENCE_TYPE = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const DAY_OF_WEEK = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};


const msecInOneDay = 1000 * 60 * 60 * 24;

const _toDate = (d) => {
  let date;
  if (!d) {
    return null;
  }
  else if (d instanceof Date) {
    date = d;
  }
  else {
    date = new Date(d);
  }

  const newDate = new Date();
  newDate.setTime(0);
  newDate.setFullYear(date.getFullYear());
  newDate.setDate(date.getDate());
  newDate.setMonth(date.getMonth());

  return newDate;
};

const _toTime = (d) => {
  let date;
  if (!d) {
    return null;
  }
  else if (d instanceof Date) {
    date = d;
  }
  else {
    date = new Date(d);
  }

  const newDate = new Date();
  newDate.setTime(0);
  newDate.setHours(date.getHours());
  newDate.setMinutes(date.getMinutes());
  newDate.setSeconds(date.getSeconds());

  return newDate;
};

const _daysInMonth = (d) => {
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	// check is leap year
  daysInMonths[1] = (parseInt(d.getYear() % 4) === 0) ? 29 : 28;

  return daysInMonths[d.getMonth()];
};

const _diffDays = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return -1;
  }

  return parseInt((toDate.getTime() - fromDate.getTime()) / msecInOneDay);
};

const _diffMonths = (fromDate, toDate) => {
  return parseInt(((toDate.getYear() - fromDate.getYear()) * 12) + toDate.getMonth() - fromDate.getMonth());
};

const _diffWeeks = (fromDate, toDate) => {
  const days = _diffDays(fromDate, toDate);
  const weeks = (days + fromDate.getDay()) / 7;

  return parseInt(weeks);
};

factory.canPlay = (item, d) => {
  if (!d) {
    d = new Date();
  }

  if (item.useDisplayTime) {
    // cal.setTimeZone(displayTimeZone);
  }
  else {
    // cal.setTimeZone(minutesToTimeZone(Integer.parseInt(timeZone)));
  }

  if (!item.timeDefined || !item.startDate) {
    return true;
  }


  const t = _toTime(d),
    startDate = _toDate(item.startDate),
    endDate = _toDate(item.endDate),
    startTime = _toTime(item.startTime),
    endTime = _toTime(item.endTime);

  d = _toDate(d);

  if (d < startDate) {
    return false;
  }

  if (!item.noEndDate && endDate && d > endDate) {
    return false;
  }

  if (!item.allDay && (startTime != null) && (endTime != null)) {
    if (startTime < endTime) {
      if (t < startTime || t > endTime)
        { return false; }
    } else if (t < startTime && t > endTime)
      { return false; }
  }

  // -------------------------

  const weekday = d.getDay();
  const dayOfMonth = d.getDate();
  if (item.recurrenceFrequency < 1) {
    item.recurrenceFrequency = 1;
  }

  if (item.recurrenceType === RECURRENCE_TYPE.DAILY) {
    const days = _diffDays(startDate, d);

    if (parseInt(days % item.recurrenceFrequency) != 0) {
      return false;
    }
  } else if (item.recurrenceType === RECURRENCE_TYPE.WEEKLY) {
    const weeks = _diffWeeks(startDate, d);
    // unit test the diffWeeks function
//			String utres ='';
//			utres += diffWeeksUnitTest(new Date(110,3,11), new Date(110,3,11)); //year 2010 in Java = 2010
//			utres += diffWeeksUnitTest(new Date(110,3,17), new Date(110,3,17));
//			utres += diffWeeksUnitTest(new Date(110,3,11), new Date(110,3,17));
//			utres += diffWeeksUnitTest(new Date(110,3,10), new Date(110,3,11));
//			utres += diffWeeksUnitTest(new Date(110,3,10), new Date(110,3,17));
//			utres += diffWeeksUnitTest(new Date(110,3,11), new Date(110,3,18));
//			Window.alert(utres);
    if (parseInt(weeks % item.recurrenceFrequency) != 0) {
      return false;
    }

    if (!_isRecurrenceDay(weekday, item.recurrenceDaysOfWeek)) {
      return false;
    }
  } else if (item.recurrenceType === RECURRENCE_TYPE.MONTHLY) {
    const months = _diffMonths(startDate, d);
    if (item.recurrenceAbsolute) {
      if ((item.recurrenceDayOfMonth !== dayOfMonth) || (parseInt(months % item.recurrenceFrequency) !== 0)) {
        return false;
      }
    } else {
      if ((weekday !== item.recurrenceDayOfWeek) || (parseInt(months % item.recurrenceFrequency) !== 0)) {
        return false;
      }
      // check if the last week of the month is selected recurrenceWeekOfMonth = 4
      if (item.recurrenceWeekOfMonth === 4) {
        if (dayOfMonth <= (_daysInMonth(d) - 7)) {
          return false;
        }
      } else if (item.recurrenceWeekOfMonth != parseInt((dayOfMonth - 1) / 7)) {
        return false;
      }
    }
  } else if (item.recurrenceType === RECURRENCE_TYPE.YEARLY) {
    if (item.recurrenceAbsolute) {
      if (!(((d.getMonth() === item.recurrenceMonthOfYear) && (dayOfMonth === item.recurrenceDayOfMonth)))) {
        return false;
      }
    } else {
      if ((weekday !== item.recurrenceDayOfWeek) || (d.getMonth() !== item.recurrenceMonthOfYear)) {
        return false;
      }
      // check if the last week of the month is selected @RecurrenceWeekOfMonth=4
      if (item.recurrenceWeekOfMonth === 4) {
        if ((dayOfMonth <= (_daysInMonth(d) - 7))) {
	        return false;
        }
      } else if (item.recurrenceWeekOfMonth != parseInt((dayOfMonth - 1) / 7)) {
        return false;
      }
    }
  }

  return true;
};

function _isRecurrenceDay(weekday, recurrenceDaysOfWeek) {
  const dayOfWeeklbl = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][weekday];
  const currDayCode = DAY_OF_WEEK[dayOfWeeklbl];

  if (recurrenceDaysOfWeek && recurrenceDaysOfWeek.indexOf(currDayCode) >= 0) {
    return true;
  } else {
    return false;
  }
}

module.exports = factory;
