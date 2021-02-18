'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var parse = _interopDefault(require('date-fns/parse'));
var timezoneSupport = require('timezone-support');

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

exports.convertToLocalTime = convertToLocalTime;
