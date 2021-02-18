'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var parse = _interopDefault(require('date-fns/parse'));
var timezoneSupport = require('timezone-support');
var parseFormat = require('timezone-support/dist/parse-format');
var lookupConvert = require('timezone-support/dist/lookup-convert');
var formatDate = _interopDefault(require('date-fns/format'));

/** @module date-fns */
/**
 * @category Common Helpers
 * @summary Convert the date from the given time zone to the local time.
 *
 * @description
 * Converts the given date from the given time zone to the local time and returns it as a new `Date` object.
 * Getters for local time parts of the input `Date` object (getFullYear, getMonth, ...) will be assumed to
 * return time in the given time zone.
 *
 * The time zone has to be specified as a canonical name from the [IANA time zone list]{@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones}.
 *
 * @param {Date|String|Number} argument - the value to convert
 * @param {Object} options - the object with options
 * @param {String} options.timeZone - the canonical name of the source time zone
 * @returns {Date} the parsed date in the local time zone
 *
 * @example
 * // Convert the time in the New York time zone to the local time:
 * const date = new Date(2018, 8, 2, 10, 0)
 * const result = convertToLocalTime(date, { timeZone: 'America/New_York' })
 * // Returns { date: Date, zone: { abbreviation: 'EDT', offset: -360 }
 * // The date will be "2018-09-02T16:00:00Z".
 */

function convertToLocalTime(argument, options) {
  var date = parse(argument);
  var timeZone = timezoneSupport.findTimeZone(options.timeZone);

  var _getUTCOffset = timezoneSupport.getUTCOffset(date, timeZone),
      offset = _getUTCOffset.offset;

  offset = date.getTimezoneOffset() - offset;
  return new Date(date.getTime() - offset * 60 * 1000);
}

/** @module date-fns */
/**
 * @category Common Helpers
 * @summary Convert the date from the local time to the given time zone.
 *
 * @description
 * Converts the given date from the local time to the given time zone and returns a new `Date` object, which has its local time set to it.
 * The returned `Date` object should not be used form comparisons or other computations. Only the its getters for the
 * local time parts can be used (getFullYear, getMonth, ...).
 *
 * The time zone has to be specified as a canonical name from the [IANA time zone list]{@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones}.
 *
 * @param {Date|String|Number} argument - the value to convert
 * @param {Object} options - the object with options
 * @param {String} options.timeZone - the canonical name of the target time zone
 * @returns {Date} the parsed date in the target time zone
 *
 * @example
 * // Convert the current local time to the New York time zone:
 * const result = convertToTimeZone(new Date(), { timeZone: 'America/New_York' })
 * Returns { date: Date, zone: { abbreviation: 'EST', offset: -300 }
 */

function convertToTimeZone(argument, options) {
  var date = parse(argument);
  var timeZone = timezoneSupport.findTimeZone(options.timeZone);

  var _getUTCOffset = timezoneSupport.getUTCOffset(date, timeZone),
      offset = _getUTCOffset.offset;

  offset -= date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000);
}

/** @module date-fns */
/**
 * @category Common Helpers
 * @summary Parse the date string and convert it to the local time.
 *
 * @description
 * Returns the date parsed from the date string using the given format string and converts the parsed date to the local time.
 *
 * The following tokens are recognized in the format string:
 *
 * | Token  | Input example    | Description                       |
 * |--------|------------------|-----------------------------------|
 * | `YY`   | 18               | Two-digit year                    |
 * | `YYYY` | 2018             | Four-digit year                   |
 * | `M`    | 1-12             | Month, beginning at 1             |
 * | `MM`   | 01-12            | Month, 2-digits                   |
 * | `D`    | 1-31             | Day of month                      |
 * | `DD`   | 01-31            | Day of month, 2-digits            |
 * | `H`    | 0-23             | Hours                             |
 * | `HH`   | 00-23            | Hours, 2-digits                   |
 * | `h`    | 1-12             | Hours, 12-hour clock              |
 * | `hh`   | 01-12            | Hours, 12-hour clock, 2-digits    |
 * | `m`    | 0-59             | Minutes                           |
 * | `mm`   | 00-59            | Minutes, 2-digits                 |
 * | `s`    | 0-59             | Seconds                           |
 * | `ss`   | 00-59            | Seconds, 2-digits                 |
 * | `S`    | 0-9              | Hundreds of milliseconds, 1-digit |
 * | `SS`   | 00-99            | Tens of milliseconds, 2-digits    |
 * | `SSS`  | 000-999          | Milliseconds, 3-digits            |
 * | `z`    | EST              | Time zone abbreviation            |
 * | `Z`    | -5:00            | Offset from UTC, 2-digits         |
 * | `ZZ`   | -0500            | Compact offset from UTC, 2-digits |
 * | `A`    | AM PM            | Post or ante meridiem, upper-case |
 * | `a`    | am pm            | Post or ante meridiem, lower-case |
 *
 * To escape characters in the format string, wrap them in square brackets (e.g. `[G]`). Punctuation symbols (-:/.()) do not need to be wrapped.
 *
 * @param {String} dateString - the string to parse
 * @param {String} formatString - the custom format to parse the date from
 * @returns {Date} the parsed date in the local time zone
 *
 * @example
 * // Parse string '11.2.2014 11:30:30' to date in Berlin:
 * const result = parseFromTimeZone('11.2.2014 11:30:30', 'D.M.YYYY H:mm:ss')
 * // Returns Tue Feb 11 2014 10:30:30 UTC
 *
 * @example
 * // Parse string '02/11/2014 11:30:30' to date, New York time:
 * const result = parseFromString('02/11/2014 11:30:30 AM GMT-0500 (EDT)',
 *   'MM/DD/YYYY h:mm:ss.SSS A [GMT]ZZ (z)')
 * // Returns Tue Feb 11 2014 16:30:30 UTC
 */

function parseFromString(dateString, formatString) {
  var time = parseFormat.parseZonedTime(dateString, formatString);
  return lookupConvert.convertTimeToDate(time);
}

/** @module date-fns */
/**
 * @category Common Helpers
 * @summary Parse the date string and convert it from the specified time zone to the local time.
 *
 * @description
 * Returns the date parsed from the date string, optionally using the given format string, and convert the parsed date from the given time zone to the local time.
 *
 * If the format string is omitted, the date string will be parsed by `date-fns/parse`, which supports extended ISO 8601 formats.
 *
 * The following tokens are recognized in the format string:
 *
 * | Token  | Input example    | Description                       |
 * |--------|------------------|-----------------------------------|
 * | `YY`   | 18               | Two-digit year                    |
 * | `YYYY` | 2018             | Four-digit year                   |
 * | `M`    | 1-12             | Month, beginning at 1             |
 * | `MM`   | 01-12            | Month, 2-digits                   |
 * | `D`    | 1-31             | Day of month                      |
 * | `DD`   | 01-31            | Day of month, 2-digits            |
 * | `H`    | 0-23             | Hours                             |
 * | `HH`   | 00-23            | Hours, 2-digits                   |
 * | `h`    | 1-12             | Hours, 12-hour clock              |
 * | `hh`   | 01-12            | Hours, 12-hour clock, 2-digits    |
 * | `m`    | 0-59             | Minutes                           |
 * | `mm`   | 00-59            | Minutes, 2-digits                 |
 * | `s`    | 0-59             | Seconds                           |
 * | `ss`   | 00-59            | Seconds, 2-digits                 |
 * | `S`    | 0-9              | Hundreds of milliseconds, 1-digit |
 * | `SS`   | 00-99            | Tens of milliseconds, 2-digits    |
 * | `SSS`  | 000-999          | Milliseconds, 3-digits            |
 * | `z`    | EST              | Time zone abbreviation            |
 * | `Z`    | -5:00            | Offset from UTC, 2-digits         |
 * | `ZZ`   | -0500            | Compact offset from UTC, 2-digits |
 * | `A`    | AM PM            | Post or ante meridiem, upper-case |
 * | `a`    | am pm            | Post or ante meridiem, lower-case |
 *
 * To escape characters in the format string, wrap them in square brackets (e.g. `[G]`). Punctuation symbols (-:/.()) do not need to be wrapped.
 *
 * The time zone has to be specified as a canonical name from the [IANA time zone list]{@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones}.
 *
 * @param {String} dateString - the string to parse
 * @param {String} [formatString] - the custom format to parse the date from
 * @param {Object} options - the object with options
 * @param {0 | 1 | 2} [options.additionalDigits=2] - the additional number of digits in the extended year format
 * @param {String} options.timeZone - the canonical name of the source time zone
 * @returns {Date} the parsed date in the local time zone
 *
 * @example
 * // Parse string '2014-02-11 11:30:30 AM' to date, New York time:
 * const result = parseFromTimeZone('2014-02-11 11:30:30',
 *   { timeZone: 'America/New_York' })
 * // Returns Tue Feb 11 2014 16:30:30 UTC
 *
 * @example
 * // Parse string '11.2.2014 11:30:30' to date, Berlin time:
 * const result = parseFromTimeZone('11.2.2014 11:30:30',
 *   'D.M.YYYY H:mm:ss', { timeZone: 'Europe/Berlin' })
 * // Returns Tue Feb 11 2014 10:30:30 UTC
 *
 * @example
 * // Parse string '+02014101', if the additional number of digits
 * // in the extended year format is 1, Madrid time:
 * var result = parseFromTimeZone('+02014101',
 *   { additionalDigits: 1, timeZone: 'Europe/Madrid' })
 * //=> Fri Apr 10 2014 22:00:00 UTC
 */

function parseFromTimeZone(dateString, formatString, options) {
  if (typeof formatString !== 'string') {
    options = formatString;
    formatString = undefined;
  }

  var _options = options,
      timeZone = _options.timeZone;
  timeZone = timezoneSupport.findTimeZone(timeZone);

  if (formatString) {
    var time = parseFormat.parseZonedTime(dateString, formatString);
    var unixTime = timezoneSupport.getUnixTime(time, timeZone);
    return new Date(unixTime);
  }

  var date = parse(dateString, options);

  var _getUTCOffset = timezoneSupport.getUTCOffset(date, timeZone),
      offset = _getUTCOffset.offset;

  offset -= date.getTimezoneOffset();
  return new Date(date.getTime() + offset * 60 * 1000);
}

/** @module date-fns */
/**
 * @category Common Helpers
 * @summary Format the date in the specified time zone.
 *
 * @description
 * Returns the formatted date string in the given format, after converting it to the given time zone.
 *
 * The input date will be converted to the given time zone by default, using its UTC timestamp.
 * If the local time in the input date is already in the given time zone, set `options.convertTimeZone`
 * to `false`. Otherwise the date will be considered in local time and converted.
 *
 * The time zone has to be specified as a canonical name from the [IANA time zone list]{@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones}.
 *
 * The following tokens are recognized in the format string:
 *
 * | Unit                    | Token | Result examples                  |
 * |-------------------------|-------|----------------------------------|
 * | Month                   | M     | 1, 2, ..., 12                    |
 * |                         | Mo    | 1st, 2nd, ..., 12th              |
 * |                         | MM    | 01, 02, ..., 12                  |
 * |                         | MMM   | Jan, Feb, ..., Dec               |
 * |                         | MMMM  | January, February, ..., December |
 * | Quarter                 | Q     | 1, 2, 3, 4                       |
 * |                         | Qo    | 1st, 2nd, 3rd, 4th               |
 * | Day of month            | D     | 1, 2, ..., 31                    |
 * |                         | Do    | 1st, 2nd, ..., 31st              |
 * |                         | DD    | 01, 02, ..., 31                  |
 * | Day of year             | DDD   | 1, 2, ..., 366                   |
 * |                         | DDDo  | 1st, 2nd, ..., 366th             |
 * |                         | DDDD  | 001, 002, ..., 366               |
 * | Day of week             | d     | 0, 1, ..., 6                     |
 * |                         | do    | 0th, 1st, ..., 6th               |
 * |                         | dd    | Su, Mo, ..., Sa                  |
 * |                         | ddd   | Sun, Mon, ..., Sat               |
 * |                         | dddd  | Sunday, Monday, ..., Saturday    |
 * | Day of ISO week         | E     | 1, 2, ..., 7                     |
 * | ISO week                | W     | 1, 2, ..., 53                    |
 * |                         | Wo    | 1st, 2nd, ..., 53rd              |
 * |                         | WW    | 01, 02, ..., 53                  |
 * | Year                    | YY    | 00, 01, ..., 99                  |
 * |                         | YYYY  | 1900, 1901, ..., 2099            |
 * | ISO week-numbering year | GG    | 00, 01, ..., 99                  |
 * |                         | GGGG  | 1900, 1901, ..., 2099            |
 * | AM/PM                   | A     | AM, PM                           |
 * |                         | a     | am, pm                           |
 * |                         | aa    | a.m., p.m.                       |
 * | Hour                    | H     | 0, 1, ... 23                     |
 * |                         | HH    | 00, 01, ... 23                   |
 * |                         | h     | 1, 2, ..., 12                    |
 * |                         | hh    | 01, 02, ..., 12                  |
 * | Minute                  | m     | 0, 1, ..., 59                    |
 * |                         | mm    | 00, 01, ..., 59                  |
 * | Second                  | s     | 0, 1, ..., 59                    |
 * |                         | ss    | 00, 01, ..., 59                  |
 * | 1/10 of second          | S     | 0, 1, ..., 9                     |
 * | 1/100 of second         | SS    | 00, 01, ..., 99                  |
 * | Millisecond             | SSS   | 000, 001, ..., 999               |
 * | Timezone abbreviation   | z     | CET, CEST, EST, EDT, ...         |
 * | Timezone offset to UTC  | Z     | -01:00, +00:00, ... +12:00       |
 * |                         | ZZ    | -0100, +0000, ..., +1200         |
 * | Seconds timestamp       | X     | 512969520                        |
 * | Milliseconds timestamp  | x     | 512969520900                     |
 *
 * The characters wrapped in square brackets are escaped.
 *
 * The result may vary by locale.
 *
 * @param {Date|String|Number} argument - the original date
 * @param {String} formatString - the string of formatting tokens
 * @param {Object} options - the object with options
 * @param {Object} [options.locale=enLocale] - the locale object
 * @param {String} options.timeZone - the canonical name of the target time zone
 * @param {String} [options.convertTimeZone=true] - if the date should be converted to the given time zone before formatting
 * @returns {String} the formatted date string
 *
 * @example
 * // Represent midnight on 11 February 2014, UTC in middle-endian format, New York time:
 * var result = formatToTimeZone(
 *   new Date(Date.UTC(2014, 1, 11)),
 *   'MM/dd/yyyy h:mm A [GMT]Z (z)',
 *   { timeZone: 'America/New_York' }
 * )
 * // Returns '02/10/2014 7:00 PM GMT-0500 (EST)'
 *
 * @example
 * // Represent noon on 2 July 2014 in Esperanto, Madrid time:
 * var locale = require('date-fns/locale/eo')
 * var result = formatToTimeZone(
 *   new Date(2014, 6, 2, 12),
 *   "HH:mm, do 'de' MMMM yyyy (Zz)",
 *   { locale, timeZone: 'Europe/Madrid', convertTimeZone: false }
 * )
 * // Returns '12:00, 2-a de julio 2014 (+02:00 CEST)'
 */

function formatToTimeZone(argument, formatString, options) {
  var date = parse(argument);
  var timeZone = options.timeZone,
      convertTimeZone = options.convertTimeZone;
  timeZone = timezoneSupport.findTimeZone(timeZone);
  timeZone = timezoneSupport.getUTCOffset(date, timeZone);

  if (convertTimeZone !== false) {
    var offset = timeZone.offset - date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
  }

  formatString = formatTimeZoneTokens(formatString, timeZone);
  return formatDate(date, formatString, options);
}

function padToTwoDigits(number) {
  return number > 9 ? number : "0" + number;
}

function formatTimeZoneOffset(offset, separator) {
  var sign;

  if (offset <= 0) {
    offset = -offset;
    sign = '+';
  } else {
    sign = '-';
  }

  var hours = padToTwoDigits(Math.floor(offset / 60));
  var minutes = padToTwoDigits(offset % 60);
  return sign + hours + separator + minutes;
}

function formatTimeZoneTokens(format, timeZone) {
  return format.replace(/z|ZZ?/g, function (match) {
    switch (match) {
      case 'z':
        return "[" + timeZone.abbreviation + "]";

      case 'Z':
        return formatTimeZoneOffset(timeZone.offset, ':');

      default:
        // 'ZZ'
        return formatTimeZoneOffset(timeZone.offset, '');
    }
  });
}

exports.convertToLocalTime = convertToLocalTime;
exports.convertToTimeZone = convertToTimeZone;
exports.parseFromString = parseFromString;
exports.parseFromTimeZone = parseFromTimeZone;
exports.formatToTimeZone = formatToTimeZone;
