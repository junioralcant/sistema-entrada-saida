'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function charCodeToInt(charCode) {
  if (charCode > 96) {
    return charCode - 87;
  } else if (charCode > 64) {
    return charCode - 29;
  }

  return charCode - 48;
}

function unpackBase60(string) {
  var parts = string.split('.');
  var whole = parts[0];
  var fractional = parts[1] || '';
  var multiplier = 1;
  var start = 0;
  var out = 0;
  var sign = 1; // handle negative numbers

  if (string.charCodeAt(0) === 45) {
    start = 1;
    sign = -1;
  } // handle digits before the decimal


  for (var i = start, length = whole.length; i < length; ++i) {
    var num = charCodeToInt(whole.charCodeAt(i));
    out = 60 * out + num;
  } // handle digits after the decimal
  // istanbul ignore next


  for (var _i = 0, _length = fractional.length; _i < _length; ++_i) {
    var _num = charCodeToInt(fractional.charCodeAt(_i));

    multiplier = multiplier / 60;
    out += _num * multiplier;
  }

  return out * sign;
}

function arrayToInt(array) {
  for (var i = 0, length = array.length; i < length; ++i) {
    array[i] = unpackBase60(array[i]);
  }
}

function intToUntil(array, length) {
  for (var i = 0; i < length; ++i) {
    array[i] = Math.round((array[i - 1] || 0) + array[i] * 60000);
  }

  array[length - 1] = Infinity;
}

function mapIndices(source, indices) {
  var out = [];

  for (var i = 0, length = indices.length; i < length; ++i) {
    out[i] = source[indices[i]];
  }

  return out;
}

function unpack(string) {
  var data = string.split('|');
  var offsets = data[2].split(' ');
  var indices = data[3].split('');
  var untils = data[4].split(' ');
  arrayToInt(offsets);
  arrayToInt(indices);
  arrayToInt(untils);
  intToUntil(untils, indices.length);
  var name = data[0];
  var abbreviations = mapIndices(data[1].split(' '), indices);
  var population = data[5] | 0;
  offsets = mapIndices(offsets, indices);
  return {
    name: name,
    abbreviations: abbreviations,
    offsets: offsets,
    untils: untils,
    population: population
  };
}

var zones;
var names;
var links;
var instances;

function populateTimeZones(_ref) {
  var zoneData = _ref.zones,
      linkData = _ref.links;
  zones = {};
  names = zoneData.map(function (packed) {
    var name = packed.substr(0, packed.indexOf('|'));
    zones[name] = packed;
    return name;
  });
  links = linkData.reduce(function (result, packed) {
    var _packed$split = packed.split('|'),
        name = _packed$split[0],
        alias = _packed$split[1];

    result[alias] = name;
    return result;
  }, {});
  instances = {};
}

function listTimeZones() {
  return names.slice();
}

function findTimeZone(alias) {
  var name = links[alias] || alias;
  var timeZone = instances[name];

  if (!timeZone) {
    var packed = zones[name];

    if (!packed) {
      throw new Error("Unknown time zone \"" + name + "\".");
    }

    timeZone = instances[name] = unpack(packed);
  }

  return timeZone;
}

function getUnixTimeFromUTC(_ref) {
  var year = _ref.year,
      month = _ref.month,
      day = _ref.day,
      hours = _ref.hours,
      minutes = _ref.minutes,
      _ref$seconds = _ref.seconds,
      seconds = _ref$seconds === void 0 ? 0 : _ref$seconds,
      _ref$milliseconds = _ref.milliseconds,
      milliseconds = _ref$milliseconds === void 0 ? 0 : _ref$milliseconds;
  return Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds);
}

function getDateFromTime(_ref2) {
  var year = _ref2.year,
      month = _ref2.month,
      day = _ref2.day,
      hours = _ref2.hours,
      minutes = _ref2.minutes,
      _ref2$seconds = _ref2.seconds,
      seconds = _ref2$seconds === void 0 ? 0 : _ref2$seconds,
      _ref2$milliseconds = _ref2.milliseconds,
      milliseconds = _ref2$milliseconds === void 0 ? 0 : _ref2$milliseconds;
  return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
}

function getUTCTime(date) {
  var year = date.getUTCFullYear();
  var month = date.getUTCMonth() + 1;
  var day = date.getUTCDate();
  var dayOfWeek = date.getUTCDay();
  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var seconds = date.getUTCSeconds() || 0;
  var milliseconds = date.getUTCMilliseconds() || 0;
  return {
    year: year,
    month: month,
    day: day,
    dayOfWeek: dayOfWeek,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    milliseconds: milliseconds
  };
}

function getLocalTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var dayOfWeek = date.getDay();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds() || 0;
  var milliseconds = date.getMilliseconds() || 0;
  return {
    year: year,
    month: month,
    day: day,
    dayOfWeek: dayOfWeek,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    milliseconds: milliseconds
  };
}

function getDateTime(date, options) {
  var _ref3 = options || {},
      useUTC = _ref3.useUTC;

  var extract;

  if (useUTC === true) {
    extract = getUTCTime;
  } else if (useUTC === false) {
    extract = getLocalTime;
  } else {
    throw new Error('Extract local or UTC date? Set useUTC option.');
  }

  return extract(date);
}

function findTransitionIndex(unixTime, timeZone) {
  var untils = timeZone.untils;

  for (var i = 0, length = untils.length; i < length; ++i) {
    if (unixTime < untils[i]) {
      return i;
    }
  }
}

function getTransition(unixTime, timeZone) {
  var transitionIndex = findTransitionIndex(unixTime, timeZone);
  var abbreviation = timeZone.abbreviations[transitionIndex];
  var offset = timeZone.offsets[transitionIndex];
  return {
    abbreviation: abbreviation,
    offset: offset
  };
}

function attachEpoch(time, unixTime) {
  Object.defineProperty(time, 'epoch', {
    value: unixTime
  });
}

function getUTCOffset(date, timeZone) {
  var unixTime = typeof date === 'number' ? date : date.getTime();

  var _getTransition = getTransition(unixTime, timeZone),
      abbreviation = _getTransition.abbreviation,
      offset = _getTransition.offset;

  return {
    abbreviation: abbreviation,
    offset: offset
  };
}

function getZonedTime(date, timeZone) {
  var gotUnixTime = typeof date === 'number';
  var unixTime = gotUnixTime ? date : date.getTime();

  var _getTransition2 = getTransition(unixTime, timeZone),
      abbreviation = _getTransition2.abbreviation,
      offset = _getTransition2.offset;

  if (gotUnixTime || offset) {
    date = new Date(unixTime - offset * 60000);
  }

  var time = getUTCTime(date);
  time.zone = {
    abbreviation: abbreviation,
    offset: offset
  };
  attachEpoch(time, unixTime);
  return time;
}

function getUnixTime(time, timeZone) {
  var zone = time.zone,
      epoch = time.epoch;

  if (epoch) {
    if (timeZone) {
      throw new Error('Both epoch and other time zone specified. Omit the other one.');
    }

    return epoch;
  }

  var unixTime = getUnixTimeFromUTC(time);

  if (zone) {
    if (timeZone) {
      throw new Error('Both own and other time zones specified. Omit the other one.');
    }
  } else {
    if (!timeZone) {
      throw new Error('Missing other time zone.');
    }

    zone = getTransition(unixTime, timeZone);
  }

  return unixTime + zone.offset * 60000;
}

function setTimeZone(time, timeZone, options) {
  if (time instanceof Date) {
    time = getDateTime(time, options);
  } else {
    var _time = time,
        year = _time.year,
        month = _time.month,
        day = _time.day,
        hours = _time.hours,
        minutes = _time.minutes,
        _time$seconds = _time.seconds,
        seconds = _time$seconds === void 0 ? 0 : _time$seconds,
        _time$milliseconds = _time.milliseconds,
        milliseconds = _time$milliseconds === void 0 ? 0 : _time$milliseconds;
    time = {
      year: year,
      month: month,
      day: day,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds
    };
  }

  var unixTime = getUnixTimeFromUTC(time);
  var utcDate = new Date(unixTime);
  time.dayOfWeek = utcDate.getUTCDay();

  var _getTransition3 = getTransition(unixTime, timeZone),
      abbreviation = _getTransition3.abbreviation,
      offset = _getTransition3.offset;

  time.zone = {
    abbreviation: abbreviation,
    offset: offset
  };
  attachEpoch(time, unixTime + offset * 60000);
  return time;
}

function convertTimeToDate(time) {
  var epoch = time.epoch;

  if (epoch !== undefined) {
    return new Date(epoch);
  }

  var _ref = time.zone || {},
      offset = _ref.offset;

  if (offset === undefined) {
    return getDateFromTime(time);
  }

  var unixTime = getUnixTimeFromUTC(time);
  return new Date(unixTime + offset * 60000);
}

function convertDateToTime(date) {
  var time = getLocalTime(date);
  var match = /\(([^)]+)\)$/.exec(date.toTimeString());
  time.zone = {
    abbreviation: match ? match[1] // istanbul ignore next
    : '???',
    offset: date.getTimezoneOffset()
  };
  attachEpoch(time, date.getTime());
  return time;
}

exports.populateTimeZones = populateTimeZones;
exports.listTimeZones = listTimeZones;
exports.findTimeZone = findTimeZone;
exports.getUTCOffset = getUTCOffset;
exports.getZonedTime = getZonedTime;
exports.getUnixTime = getUnixTime;
exports.setTimeZone = setTimeZone;
exports.convertTimeToDate = convertTimeToDate;
exports.convertDateToTime = convertDateToTime;
