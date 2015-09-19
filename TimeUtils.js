"use strict";

//ported from https://github.com/Perennials/providerkit-core-php/blob/master/src/utils/TimeUtils.php

const MilisecsPerDay = 24 * 60 * 60 * 1000;
const MilisecsPerHour = 60 * 60 * 1000;
const MilisecsPerMinute = 60 * 1000;

/**
A compilation of time related functions.

@author Borislav Peev <borislav.asdf@gmail.com>
*/
class TimeUtils {
	/**
	Returns the time difference between two dates as string.

	For example "1 year 2 months", "1 minute 3 seconds", "10 hours".

	@param int
	@param int
	@param bool if false the return value will contain only the most significant time unit
	@param string {@see sprintf()} format string for long format. The default is '%d %s %d %s'.
	@param string {@see sprintf()} format string for short format. The default is '%d %s'.
	@return string
	*/
	static timeAgoFormat ( date2, date1, precise /*= true, format_long = null, format_short = null*/ ) {
		precise = precise || true;
		// format_long = format_long || null;
		// format_short = format_short || null;
		var r = TimeUtils.timeAgo( date2, date1, precise );
		// if ( format_long === null ) {
		// 	format_long = '%d %s %d %s';
		// }
		// if ( format_short === null ) {
		// 	format_short = '%d %s';
		// }
		if ( !precise || r.length < 4 ) {
			return `${r[0]} ${r[1]}`;
			// return sprintf( format_short, r[ 0 ], r[ 1 ] );
		}
		else {
			return `${r[0]} ${r[1]} ${r[2]} ${r[3]}`;
			// return sprintf( format_long, r[ 0 ], r[ 1 ], r[ 2 ], r[ 3 ] );
		}
	}

	/**
	Returns the time difference between two dates as array.

	For example "[1, 'year', 2, 'months']", "[1, 'minute', 2, 'seconds']", "[10, 'hours']".

	@param int
	@param int
	@param bool if false the return value will contain only the most significant time unit, i.e. the length of the array will always be 2.
	@return array
	*/
	static timeAgo ( date2, date1, precise /*= true*/ ) {
		precise = precise || true;
		var year2 = new Date( date2 ).getYear();
		var month2 = new Date( date2 ).getMonth();
		if ( date1 === null ) {
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

			var days = Math.floor( diff / MilisecsPerDay );

			if ( months >= 1 && days >= 28 ) {
				//months' length vary so we cant calculate the days without calendar knowledge
				i1 = months;
				n1 = 'month';
			}
			else {
				if ( days >= 1 ) {
					var rest = diff % MilisecsPerDay;
					var hours = Math.floor( rest / MilisecsPerHour );
					i1 = days;
					i2 = hours;
					n1 = 'day';
					n2 = 'hour';
				}
				else {
					var hours = Math.floor( diff / MilisecsPerHour );
					if ( hours >= 1 ) {
						var rest = diff % MilisecsPerHour;
						var minutes = Math.floor( rest / MilisecsPerMinute );
						i1 = hours;
						i2 = minutes;
						n1 = 'hour';
						n2 = 'minute';
					}
					else {
						var minutes = Math.floor( diff / MilisecsPerMinute );
						if ( minutes >= 1 ) {
							var seconds = diff % MilisecsPerMinute;
							i1 = minutes;
							i2 = seconds;
							n1 = 'minute';
							n2 = 'second';
						}
						else {
							i1 = diff;
							if ( i1 < 1 ) {
								i1 = 1;
							}
							n1 = 'second';
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

module.exports = TimeUtils;