"use strict";

require( 'Prototype' );
var Sprintf = require( 'sprintf-js' ).sprintf;

//ported from https://github.com/Perennials/providerkit-core-php/blob/master/src/utils/TimeUtils.php

const MillisecsPerSecond = 1000;
const MillisecsPerMinute = 60 * MillisecsPerSecond;
const MillisecsPerHour = 60 * MillisecsPerMinute;
const MillisecsPerDay = 24 * MillisecsPerHour;

var DefStrings = {
	Long: {
		year: 'year',
		years: 'years',
		month: 'month',
		months: 'months',
		day: 'day',
		days: 'days',
		hour: 'hour',
		hours: 'hours',
		minute: 'minute',
		minutes: 'minutes',
		second: 'second',
		seconds: 'seconds',
		millisecond: 'millisecond',
		milliseconds: 'milliseconds',
	},
	Short: {
		year: 'y',
		years: 'y',
		month: 'm',
		months: 'm',
		day: 'd',
		days: 'd',
		hour: 'h',
		hours: 'h',
		minute: 'min',
		minutes: 'min',
		second: 's',
		seconds: 's',
		millisecond: 'ms',
		milliseconds: 'ms',
	}
};

var DefFormat = {
	Short: '%d %s',
	Long: '%d %s %d %s'
};

/**
A compilation of time related functions.

@author Borislav Peev <borislav.asdf@gmail.com>
*/
class TimeUtils {
	/**
	Returns the time difference between two dates as string.

	For example "1 year 2 months", "1 minute 3 seconds", "10 hours".

	@param int|Date
	@param int|Date
	@param Object 
	```js
	{
		// If false the return value will contain only the most significant time unit.
		Precise: Boolean,
		// {@see sprintf()} format string for long format. The default is '%d %s %d %s'.
		LongFormat: String,
		// {@see sprintf()} format string for short format. The default is '%d %s'.
		ShortFormat: String
		Strings: Object|'short'
	}
	```
	@return string
	*/
	static timeAgoFormat ( date2, date1, options ) {

		if ( date2 instanceof Date ) {
			data2 = date2.valueOf();
		}
		
		if ( date1 instanceof Date ) {
			date1 = date1.valueOf();
		}

		if ( date1 instanceof Object ) {
			options = date1;
			date1 = null;
		}

		var precise = options ? options.Precise || true : true;
		var format_long = options ? options.LongFormat || DefFormat.Long : DefFormat.Long;
		var format_short = options ? options.ShortFormat || DefFormat.Short : DefFormat.Short;
		var strings = options ? options.Strings || DefStrings.Long : DefStrings.Long;
		if ( strings == 'short' ) {
			strings = DefStrings.Short;
		}
		var r = TimeUtils.timeAgo( date2, date1, precise );
		if ( !precise || r.length < 4 ) {
			return Sprintf( format_short, r[ 0 ], strings[ r[ 1 ] ] );
		}
		else {
			return Sprintf( format_long, r[ 0 ], strings[ r[ 1 ] ], r[ 2 ], strings[ r[ 3 ] ] );
		}
	}

	/**
	Returns the time difference between two dates as array.

	For example "[1, 'year', 2, 'months']", "[1, 'minute', 2, 'seconds']", "[10, 'hours']".

	@param int|Date
	@param int|Date
	@param bool if false the return value will contain only the most significant time unit, i.e. the length of the array will always be 2.
	@return array
	*/
	static timeAgo ( date2, date1, precise /*= true*/ ) {

		if ( date2 instanceof Date ) {
			data2 = date2.valueOf();
		}

		if ( date1 instanceof Date ) {
			date1 = date1.valueOf();
		}

		precise = precise || true;
		var year2 = new Date( date2 ).getYear();
		var month2 = new Date( date2 ).getMonth();
		if ( !(date1 > 0) ) {
			var year1 = year2;
			var month1 = month2;
			var date1 = 0;
		}
		else {
			var year1 = new Date( date1 ).getYear();
			var month1 = new Date( date1 ).getMonth();
		}
		var years = year2 - year1;
		var months = years > 0 ? 12 - month1 + month2 : month2 - month1;
		if ( months >= 12 ) {
			++years;
			months -= 12;
		}

		var i1 = 0;
		var n1 = null;
		var i2 = 0;
		var n2 = null;

		if ( years >= 1 ) {
			i1 = years;
			i2 = months;
			n1 = 'year';
			n2 = 'month';
		}
		else {

			var diff = date2 - date1;

			var days = Math.floor( diff / MillisecsPerDay );

			if ( months >= 1 && days >= 28 ) {
				//months' length vary so we cant calculate the days without calendar knowledge
				i1 = months;
				n1 = 'month';
			}
			else {
				if ( days >= 1 ) {
					var rest = diff % MillisecsPerDay;
					var hours = Math.floor( rest / MillisecsPerHour );
					i1 = days;
					i2 = hours;
					n1 = 'day';
					n2 = 'hour';
				}
				else {
					var hours = Math.floor( diff / MillisecsPerHour );
					if ( hours >= 1 ) {
						var rest = diff % MillisecsPerHour;
						var minutes = Math.floor( rest / MillisecsPerMinute );
						i1 = hours;
						i2 = minutes;
						n1 = 'hour';
						n2 = 'minute';
					}
					else {
						var minutes = Math.floor( diff / MillisecsPerMinute );
						if ( minutes >= 1 ) {
							var rest = diff % MillisecsPerMinute;
							var seconds = Math.floor( rest / MillisecsPerSecond );
							i1 = minutes;
							i2 = seconds;
							n1 = 'minute';
							n2 = 'second';
						}
						else {
							var seconds = Math.floor( diff / MillisecsPerSecond );
							if ( seconds >= 1 ) {
								var rest = diff % MillisecsPerSecond;
								var milliseconds = rest;
								i1 = seconds;
								i2 = milliseconds;
								n1 = 'second';
								n2 = 'millisecond';
							}
							else {
								i1 = diff;
								if ( i1 < 1 ) {
									i1 = 1;
								}
								n1 = 'millisecond';
							}
						}
					}
				}
			}
		}

		if ( i1 > 1 ) {
			n1 += 's';
		}
		if ( i2 > 1 ) {
			n2 += 's';
		}

		if ( !precise || i2 == 0 ) {
			return [ i1, n1 ];
		}
		else {
			return [ i1, n1, i2, n2 ];
		}
	}
}

TimeUtils.static( {
	DefStrings: DefStrings,
	DefFormat: DefFormat
} );

module.exports = TimeUtils;