"use strict";

//ported from https://github.com/Perennials/providerkit-core-php/blob/master/src/utils/Debug.php

var TimeUtils = require( './TimeUtils' );
var FormatUtils = require( './FormatUtils' );

class Stats {

	constructor () {
		this._timerStack = [];
		this._timers = new WeakMap();
		this._timers2 = {};
		this._stats = {};
		this._counts = {};
		this._units = {};
	}

	startTimer ( name ) {
		var time = Date.now();
		if ( name instanceof Object ) {
			this._timers.set( name, time );
		}
		else if ( name ) {
			this._timers2[ name ] = time;
		}
		else {
			this._timerStack.push( time );
		}
		return time;
	}

	endTimer ( name ) {
		var time = Date.now();
		if ( name instanceof Object ) {
			return time - this._timers.get( name );
		}
		else if ( name ) {
			return time - this._timers2[ name ];
		}
		else {
			return time - this._timerStack.pop();
		}
	}

	saveTimer ( name, stat ) {
		var t = undefined;
		if ( stat !== undefined ) {
			t = this.endTimer( name );
		}
		else {
			stat = name;
			t = this.endTimer();
		}
		this.setStat( stat, t, 'ms' );
		return t;
	}

	addTimer ( name, stat ) {
		var t = undefined;
		if ( stat !== undefined ) {
			t = this.endTimer( name );
		}
		else {
			stat = name;
			t = this.endTimer();
		}
		this.addStat( stat, t, 'ms' );
		return t;
	}

	setStat ( stat, value, unit ) {
		this._stats[ stat ] = value;
		this._counts[ stat ] = 1;
		if ( unit !== undefined ) {
			this._units[ stat ] = unit;
		}
		return value;
	}

	addStat ( stat, value, unit ) {
		if ( this._stats[ stat ] === undefined ) {
			this._stats[ stat ] = value;
			this._counts[ stat ] = 1;
		}
		else {
			this._stats[ stat ] += value;
			++this._counts[ stat ];
		}
		if ( unit !== undefined ) {
			this._units[ stat ] = unit;
		}
		return this._stats[ stat ];
	}

	getStat ( stat ) {
		return this._stats[ stat ];
	}

	setUnit ( stat, unit ) {
		return this._units[ stat ] = unit;
	}

	getUnit ( stat ) {
		return this._units[ stat ];
	}

	getCount ( stat ) {
		return this._counts[ stat ] || 0;
	}

	getAverage ( stat ) {
		v = this.getStat( stat );
		n = this.getCount( stat );
		if ( n > 0 ) {
			return v / n;
		}
		else {
			return undefined;
		}
	}

	saveAverage ( stat, newname ) {
		a = this.getAverage( stat );
		if ( a !== undefined ) {
			return this.setStat( newname, a, this.getUnit( stat ) );
		}
		else {
			return undefined;
		}
	}

	getStats ( options ) {
		options = options || Stats.DefaultFormatting;
		var timeOptions = options.Time || Stats.DefaultFormatting.Time;
		var byteOptions = options.Byte || Stats.DefaultFormatting.Byte;
		var ret = {};
		var stats = this._stats;
		for ( var k in stats ) {
			var v = stats[ k ];
			var u = this.getUnit( k );
			if ( u == 'b' ) {
				v = FormatUtils.formatBytes( v, byteOptions );
			}
			else if ( u == 'ms' ) {
				if ( v > 6000 ) {
					v = TimeUtils.timeAgoFormat( v, timeOptions );
				}
				else {
					v = ( v / 1000 ) + ' s';
				}
			}
			else if ( u !== undefined ) {
				v = v + ' ' + u;
			}
			ret[ k ] = v;
		}
		var keys = Object.keys( ret ).sort();
		var sortedRet = {};
		for ( var i = 0, iend = keys.length; i < iend; ++i ) {
			var key = keys[ i ];
			sortedRet[ key ] = ret[ key ];
		}

		return sortedRet;
	}

}

Stats.static( {
	DefaultFormatting: {
		Bytes: undefined,
		Time: { Precise: true }
	}
} );

module.exports = Stats;