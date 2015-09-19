"use strict";

//ported from https://github.com/Perennials/providerkit-core-php/blob/master/src/utils/Debug.php

var TimeUtils = require( './TimeUtils' );
var FormatUtils = require( './FormatUtils' );

/**
A class that keeps track of debug information.

The class manages a list of debug stats, each having a unique name.

Nesting and summing timers:
```js
var stats = new Stats();
stats.startTimer();
for ( ... ) {
	func1();
	stats.startTimer();
	func2();
	stats.addTimer( 'My.Inner.Thingie' ); //measure the sum of the time of all calls to func2()
}
stats.saveTimer( 'My.Outer.Loop' ); //measure the time taken for the for last loop (not the sum)
```

Timers and counting:
```js
var stats = new Stats();
var slowestSQL = null;
var slowestTime = 0;
for ( ... ) {
	stats.startTimer();
	perform_sql_query( sql );
	var last = stats.endTimer();
	if ( last > slowestTime ) {
		slowestTime = last;
		slowestSQL = sql;
	}
	stats.addStat( 'SQL.Queries.Count', 1 );
}
stats.setStat( 'SQL.Slowest.Query', slowestSQL );
stats.setStat( 'SQL.Slowest.Timing', slowestTime );
```

@author Borislav Peev <borislav.asdf@gmail.com>
*/
class Stats {

	constructor () {
		this._timerStack = [];
		this._timers = new WeakMap();
		this._stats = {};
		this._counts = {};
		this._units = {};
	}

	/**
	Starts a new timer.

	Timers are stacked. I.e. you can call startTimer again before the previous timer was flushed with endTimer()
	Each startTimer() call must be matched by a call to {@see endTimer()} or {@see saveTimer()}.
	Timers have microsecond precision.

	@return Number see {@see Date.now()}
	*/
	startTimer ( name ) {
		var time = Date.now();
		if ( name ) {
			this._timers.set( name, time );
		}
		else {
			this._timerStack.push( time );
		}
		return time;
	}

	/**
	Stops the timer started by the last {@see startTimer()} call.

	@return float the time elapsed in seconds (with microseconds precision)
	*/
	endTimer ( name ) {
		var time = Date.now();
		if ( name ) {
			return time - this._timers.get( name );
		}
		else {
			return time - this._timerStack.pop();
		}
	}

	/**
	Stops the timer started by the last {@see startTimer()} call and saves its value to the list of debug stats.

	@param string name for the property under which the elapsed time will be saved
	@return float the time elapsed in seconds (with microseconds precision)
	*/
	saveTimer ( name, stat ) {
		var t = null;
		if ( arguments.length == 2 ) {
			t = this.endTimer( name );
		}
		else {
			stat = name;
			t = this.endTimer();
		}
		this.setStat( stat, t, 'ms' );
		return t;
	}

	/**
	Stops the timer started by the last {@see startTimer()} call and adds its value to existing value in the list of debug stats.

	@see addStat()
	@param string name for the property to which the elapsed time will be added
	@return float the time elapsed in seconds (with microseconds precision)
	*/
	addTimer ( name, stat ) {
		var t = null;
		if ( arguments.length == 2 ) {
			t = this.endTimer( name );
		}
		else {
			stat = name;
			t = this.endTimer();
		}
		this.addStat( stat, t, 'ms' );
		return t;
	}

	/**
	Writes a debug property in the list of maintained stats.

	If such property already exists it is replaced.

	@param string name for the property
	@param mixed value of the stat
	@param string|undefined the unit of the value. see {@see getStats()} for more info units
	@return mixed returns value
	*/
	setStat ( stat, value, unit ) {
		this._stats[ stat ] = value;
		this._counts[ stat ] = 1;
		if ( unit !== undefined ) {
			this._units[ stat ] = unit;
		}
		return value;
	}

	/**
	Adds to the value of existing property in the list of maintained stats.

	If the property doesn't exist this is the identical to {@see setStat()}.
	This should be called only on scalable (i.e. int, float) stats.
	The also maintains the 'count' of how many times it was called,
	i.e. how many times a value was added, making possible to find the average (see {@see getCount()}).

	@param string name for the property
	@param mixed value to be added to the stat
	@param string|undefined the unit of the value. see {@see getStats()} for more info units
	@return mixed the resulting value of the stat
	*/
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
		this._stats[ stat ];
	}

	/**
	Retrieves the value of stored property in the list of maintained stats.

	@param string name of the property to be retrieved
	@return mixed returns null if the property doesn't exist
	*/
	getStat ( stat ) {
		var ret = this._stats[ stat ];
		return ret === undefined ? null : ret;
	}

	/**
	Sets (or changes) the unit of a property in the list of maintained stats.

	@param string name of the property to be changed
	@param string|null the unit of the value. see {@see getStats()} for more info units
	@return mixed returns null if the property doesn't exist
	*/
	setUnit ( stat, unit ) {
		this._units[ stat ] = unit;
	}

	/**
	Retrieves the unit of a property.

	@param string name of the property to be retrieved
	@return string|null
	*/
	getUnit ( stat ) {
		return this._units[ stat ] || null;
	}

	/**
	Retrieves the 'count' of a stat in the list of maintained stats.

	'count' means how many times {@see addStat()} was called for this property.
	The 'count' for stats created by {@see setStat()} is 1.

	@see getAverage()
	@param string name of the property to be retrieved
	@return mixed returns 0 if the property doesn't exist
	*/
	getCount ( stat ) {
		return this._counts[ stat ] || 0;
	}

	/**
	Retrieves the average for a stat.

	This is for stats that are made of several {@see addStat()} calls.

	@param string name of the property to be retrieved
	@return mixed returns null if the property doesn't exist
	*/
	getAverage ( stat ) {
		v = this.getStat( stat );
		n = this.getCount( stat );
		if ( n > 0 ) {
			return v / n;
		}
		else {
			return null;
		}
	}

	/**
	Saves the average value of a stat in a separate stat.

	@param string name of the property to be saved
	@param string new name under which the average will be saved. If it is the same like the name of the property, it will replaced
	@return mixed returns the value of the saved stat or null if the property doesn't exist
	*/
	saveAverage ( stat, newname ) {
		a = this.getAverage( stat );
		if ( a !== null ) {
			return this.setStat( newname, a, this.getUnit( stat ) );
		}
		else {
			return null;
		}
	}

	/**
	Retrieves the list of maitained debug stats.

	Stats that have an unit specified are formated accordingly to be more readable.
	Supported units are:
	```
	'b': bytes, formated as "1.5 MB", "2.12 KB", etc
	's': seconds, formated as "1.123456 s", "3 minutes 1 second", "5 days 3 hours"
	other units are just appended with a space to the value
	```

	@return array AA aray where the key is the name of the stat. The array is sorted by key.
	*/
	getStats () {
		var ret = {};
		var stats = this._stats;
		for ( var k in stats ) {
			var v = stats[ k ];
			var u = this.getUnit( k );
			if ( u == 'b' ) {
				v = FormatUtils.formatBytes( v );
			}
			else if ( u == 'ms' ) {
				if ( v > 6000 ) {
					v = TimeUtils.timeAgoFormat( v, null, true );
				}
				else {
					v = ( v / 1000 ) + ' s';
				}
			}
			else if ( u !== null ) {
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

module.exports = Stats;