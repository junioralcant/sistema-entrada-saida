'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var formattingTokens = /(\[[^[]*\])|([-:/.()\s]+)|(A|a|YYYY|YY?|MM?|DD?|d|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g;

var match1 = /\d/; // 0 - 9

var match2 = /\d\d/; // 00 - 99

var match3 = /\d{3}/; // 000 - 999

var match4 = /\d{4}/; // 0000 - 9999

var match1to2 = /\d\d?/; // 0 - 99

var matchUpperAMPM = /[AP]M/;
var matchLowerAMPM = /[ap]m/;
var matchSigned = /[+-]?\d+/; // -inf - inf

var matchOffset = /[+-]\d\d:?\d\d/; // +00:00 -00:00 +0000 or -0000

var matchAbbreviation = /[A-Z]{3,4}/; // CET

var parseTokenExpressions = {};
var parseTokenFunctions = {};
var parsers = {};

function correctDayPeriod(time) {
  var afternoon = time.afternoon;

  if (afternoon !== undefined) {
    var hours = time.hours;

    if (afternoon) {
      if (hours < 12) {
        time.hours += 12;
      }
    } else {
      if (hours === 12) {
        time.hours = 0;
      }
    }

    delete time.afternoon;
  }
}

function makeParser(format) {
  var array = format.match(formattingTokens);

  if (!array) {
    throw new Error("Invalid format: \"" + format + "\".");
  }

  var length = array.length;

  for (var i = 0; i < length; ++i) {
    var token = array[i];
    var regex = parseTokenExpressions[token];
    var parser = parseTokenFunctions[token];

    if (parser) {
      array[i] = {
        regex: regex,
        parser: parser
      };
    } else {
      array[i] = token.replace(/^\[|\]$/g, '');
    }
  }

  return function (input) {
    var time = {};

    for (var _i = 0, start = 0; _i < length; ++_i) {
      var _token = array[_i];

      if (typeof _token === 'string') {
        if (input.indexOf(_token, start) !== start) {
          var part = input.substr(start, _token.length);
          throw new Error("Expected \"" + _token + "\" at character " + start + ", found \"" + part + "\".");
        }

        start += _token.length;
      } else {
        var _regex = _token.regex,
            _parser = _token.parser;

        var _part = input.substr(start);

        var match = _regex.exec(_part);

        if (!match || match.index !== 0) {
          throw new Error("Matching \"" + _regex + "\" at character " + start + " failed with \"" + _part + "\".");
        }

        var value = match[0];

        _parser.call(time, value);

        start += value.length;
      }
    }

    correctDayPeriod(time);
    return time;
  };
}

function addExpressionToken(token, regex) {
  parseTokenExpressions[token] = regex;
}

function addParseToken(tokens, property) {
  if (typeof tokens === 'string') {
    tokens = [tokens];
  }

  var callback = typeof property === 'string' ? function (input) {
    this[property] = +input;
  } : property;

  for (var _iterator = tokens, _isArray = Array.isArray(_iterator), _i2 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i2 >= _iterator.length) break;
      _ref = _iterator[_i2++];
    } else {
      _i2 = _iterator.next();
      if (_i2.done) break;
      _ref = _i2.value;
    }

    var token = _ref;
    parseTokenFunctions[token] = callback;
  }
}

function offsetFromString(string) {
  var parts = string.match(/([+-]|\d\d)/g);
  var minutes = +(parts[1] * 60) + +parts[2];
  return minutes === 0 ? 0 : parts[0] === '+' ? -minutes : minutes;
}

addExpressionToken('A', matchUpperAMPM);
addParseToken(['A'], function (input) {
  this.afternoon = input === 'PM';
});
addExpressionToken('a', matchLowerAMPM);
addParseToken(['a'], function (input) {
  this.afternoon = input === 'pm';
});
addExpressionToken('S', match1);
addExpressionToken('SS', match2);
addExpressionToken('SSS', match3);

var _loop = function _loop(token, factor) {
  addParseToken(token, function (input) {
    this.milliseconds = +input * factor;
  });
};

for (var token = 'S', factor = 100; factor >= 1; token += 'S', factor /= 10) {
  _loop(token, factor);
}

addExpressionToken('s', match1to2);
addExpressionToken('ss', match2);
addParseToken(['s', 'ss'], 'seconds');
addExpressionToken('m', match1to2);
addExpressionToken('mm', match2);
addParseToken(['m', 'mm'], 'minutes');
addExpressionToken('H', match1to2);
addExpressionToken('h', match1to2);
addExpressionToken('HH', match2);
addExpressionToken('hh', match2);
addParseToken(['H', 'HH', 'h', 'hh'], 'hours');
addExpressionToken('d', match1);
addParseToken('d', 'dayOfWeek');
addExpressionToken('D', match1to2);
addExpressionToken('DD', match2);
addParseToken(['D', 'DD'], 'day');
addExpressionToken('M', match1to2);
addExpressionToken('MM', match2);
addParseToken(['M', 'MM'], 'month');
addExpressionToken('Y', matchSigned);
addExpressionToken('YY', match2);
addExpressionToken('YYYY', match4);
addParseToken(['Y', 'YYYY'], 'year');
addParseToken('YY', function (input) {
  input = +input;
  this.year = input + (input > 68 ? 1900 : 2000);
});
addExpressionToken('z', matchAbbreviation);
addParseToken('z', function (input) {
  var zone = this.zone || (this.zone = {});
  zone.abbreviation = input;
});
addExpressionToken('Z', matchOffset);
addExpressionToken('ZZ', matchOffset);
addParseToken(['Z', 'ZZ'], function (input) {
  var zone = this.zone || (this.zone = {});
  zone.offset = offsetFromString(input);
});

function parseZonedTime(input, format) {
  var parser = parsers[format];

  if (!parser) {
    parser = parsers[format] = makeParser(format);
  }

  return parser(input);
}

function padToTwo(number) {
  return number > 9 ? number : '0' + number;
}

function padToThree(number) {
  return number > 99 ? number : number > 9 ? '0' + number : '00' + number;
}

function padToFour(number) {
  return number > 999 ? number : number > 99 ? '0' + number : number > 9 ? '00' + number : '000' + number;
}

var padToN = [undefined, undefined, padToTwo, padToThree, padToFour];

function padWithZeros(number, length) {
  return padToN[length](number);
}

var formatTokenFunctions = {};
var formatters = {};

function makeFormatter(format) {
  var array = format.match(formattingTokens);
  var length = array.length;

  for (var i = 0; i < length; ++i) {
    var token = array[i];
    var formatter = formatTokenFunctions[token];

    if (formatter) {
      array[i] = formatter;
    } else {
      array[i] = token.replace(/^\[|\]$/g, '');
    }
  }

  return function (time) {
    var output = '';

    for (var _iterator = array, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var _token = _ref;
      output += typeof _token === 'function' ? _token.call(time) : _token;
    }

    return output;
  };
}

var addFormatToken = function addFormatToken(token, padded, property) {
  var callback = typeof property === 'string' ? function () {
    return this[property];
  } : property;

  if (token) {
    formatTokenFunctions[token] = callback;
  }

  if (padded) {
    formatTokenFunctions[padded[0]] = function () {
      return padWithZeros(callback.call(this), padded[1]);
    };
  }
};

addFormatToken('A', 0, function () {
  return this.hours < 12 ? 'AM' : 'PM';
});
addFormatToken('a', 0, function () {
  return this.hours < 12 ? 'am' : 'pm';
});
addFormatToken('S', 0, function () {
  return Math.floor(this.milliseconds / 100);
});
addFormatToken(0, ['SS', 2], function () {
  return Math.floor(this.milliseconds / 10);
});
addFormatToken(0, ['SSS', 3], 'milliseconds');
addFormatToken('s', ['ss', 2], 'seconds');
addFormatToken('m', ['mm', 2], 'minutes');
addFormatToken('h', ['hh', 2], function () {
  return this.hours % 12 || 12;
});
addFormatToken('H', ['HH', 2], 'hours');
addFormatToken('d', 0, 'dayOfWeek');
addFormatToken('D', ['DD', 2], 'day');
addFormatToken('M', ['MM', 2], 'month');
addFormatToken(0, ['YY', 2], function () {
  return this.year % 100;
});
addFormatToken('Y', ['YYYY', 4], 'year');
addFormatToken('z', 0, function () {
  return this.zone.abbreviation;
});

function addTimeZoneFormatToken(token, separator) {
  addFormatToken(token, 0, function () {
    var offset = -this.zone.offset;
    var sign = offset < 0 ? '-' : '+';
    offset = Math.abs(offset);
    return sign + padWithZeros(Math.floor(offset / 60), 2) + separator + padWithZeros(offset % 60, 2);
  });
}

addTimeZoneFormatToken('Z', ':');
addTimeZoneFormatToken('ZZ', '');

function formatZonedTime(time, format) {
  var formatter = formatters[format];

  if (!formatter) {
    formatter = formatters[format] = makeFormatter(format);
  }

  return formatter(time);
}

exports.parseZonedTime = parseZonedTime;
exports.formatZonedTime = formatZonedTime;
