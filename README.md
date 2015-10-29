Stats
=====
A module for collecting runtime stats and presenting (formatting) them properly.

```sh
npm install https://github.com/Perennials/stats-node/tarball/master
```

<!-- MarkdownTOC -->

- [API](#api)
	- [Stats](#stats)
		- [Methods](#methods)
			- [.startTimer()](#starttimer)
			- [.endTimer()](#endtimer)
			- [.saveTimer()](#savetimer)
			- [.addTimer()](#addtimer)
			- [.setStat()](#setstat)
			- [.addStat()](#addstat)
			- [.getStat()](#getstat)
			- [.setUnit()](#setunit)
			- [.getUnit()](#getunit)
			- [.getCount()](#getcount)
			- [.getAverage()](#getaverage)
			- [.saveAverage()](#saveaverage)
			- [.getStats()](#getstats)
	- [FormatUtils](#formatutils)
		- [Methods](#methods-1)
			- [FormatUtils.formatBytes()](#formatutilsformatbytes)
	- [TimeUtils](#timeutils)
		- [Methods](#methods-2)
			- [.timeAgoFormat()](#timeagoformat)
			- [.timeAgo()](#timeago)
- [Authors](#authors)

<!-- /MarkdownTOC -->


API
---

### Stats
A class that collects runtime stats, each having a unique name.

Stats can have an unit assigned to them so they can be formatted accordingly.
Formatting functionality is provided for time and byte units.

```js
var Stats = require( 'Stats' );
```

Nesting and summing timers:

```js
var stats = new Stats();
stats.startTimer();
for ( ... ) {
	func1();
	stats.startTimer();
	func2();
	// measure the sum of the time of all calls to func2()
	stats.addTimer( 'My.Inner.Thingie' );
}
// measure the time taken for the for last loop (not the sum)
stats.saveTimer( 'My.Outer.Loop' );

console.log( stats.getStats() );
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

console.log( stats.getStats() );
```

Named, async timers:

```js
var stats = new Stats();
var sql = new Sql();

// we can use regular names (string, int) or objects
stats.startTimer( sql );
sql.execute( function () {
	stats.saveTimer( sql, 'SQL.Timing' );
	stats.setStat( 'SQL.Text', sql.getText() );

	console.log( stats.getStats() );
} );
```

#### Methods

##### .startTimer()
Starts a new timer.

Nameless timers are stacked. I.e. you can call `startTimer()` again before the
previous timer was flushed with `endTimer()` Each `startTimer()` call must be
matched by a call to [`endTimer()`](#endtimer) or [`saveTimer()`](#savetimer).
This can be used only for synchronous applications.

Timers have millisecond precision.

Returns the timestamp when the timer was started (`Date.now()`).

```js
.startTimer(
	name:String|Number|Object|undefined
) : Number;
```

##### .endTimer()
Stops the timer started by the last [`startTimer()`](#starttimer) call.

Returns the elapsed time in milliseconds.

```js
.stopTimer(
	name:String|Number|Object|undefined
) : Number;
```

##### .saveTimer()
Stops the timer started by the last [`startTimer()`](#starttimer) call and saves its value to the list of stats.

`stat` is the name of the stat under which the timer value will be saved.
The `name` parameter is passed directly to `endTimer()` and the return value is the same.

```js
.saveTimer(
	name:String|Number|Object,
	stat:String
) : Number;
```

```js
.saveTimer(
	stat:String
) : Number;
```

##### .addTimer()
Stops the timer started by the last [`startTimer()`](#starttimer) call and adds its value to existing value in the list of stats.

`stat` is the name of the stat under which the timer value will be saved (added).
The `name` parameter is passed directly to `endTimer()` and the return value is the same.

```js
.addTimer(
	name:String|Number|Object,
	stat:String
) : Number;
```

```js
.addTimer(
	stat:String
) : Number;
```

##### .setStat()
Writes a value in the list of maintained stats.

If such stat already exists it is replaced.
`stat` is the name of the stat under which the timer value will be saved.
`unit` is optional unit of the value. The list of known units that will be
formatted properly includes `b` for bytes and `ms` for millliseconds.

```js
.setStat(
	stat:String,
	value:mixed,
	unit:String|undefined
) : mixed;
```

##### .addStat()
Adds to the value of existing property in the list of maintained stats.

If the property doesn't exist this is the identical to
[`setStat()`](#setstat). This should be called only on scalable (i.e. int,
float) stats. The also maintains the 'count' of how many times it was called,
i.e. how many times a value was added, making possible to find the average
(see [`getCount()`](#getcount)).

`stat` is the name of the stat under which the timer value will be saved.
`unit` is optional unit of the value. The list of known units that will be
formatted properly includes `b` for bytes and `ms` for millliseconds.

```js
.addStat(
	stat:String,
	value:mixed,
	unit:String|undefined
) : mixed;
```

##### .getStat()
Retrieves the value of stored property in the list of maintained stats.

```js
.addStat(
	stat:String
) : mixed|undefined;
```

##### .setUnit()
Sets (or changes) the unit of a property in the list of maintained stats.

```js
.addStat(
	stat:String,
	unit:String
) : String;
```

##### .getUnit()
Retrieves the unit of a property.

```js
.getUnit(
	stat:String
) : String|undefined;
```

##### .getCount()
Retrieves the 'count' of a stat in the list of maintained stats.

'count' means how many times [`addStat()`](#addstat) was called for this
property. The 'count' for stats created by [`setStat()`](#setstat) is 1.

Returns 0 if the property doesn't exist.

```js
.getCount(
	stat:String
) : Number;
```

##### .getAverage()
Retrieves the average for a stat.

This is for stats that are made of several [`addStat()`](#addstat) calls.

```js
.getAverage(
	stat:String
) : Number|undefined;
```

##### .saveAverage()
Saves the average value of a stat in a separate stat.

This is for stats that are made of several [`addStat()`](#addstat) calls.

```js
.saveAverage(
	stat:String,
	newname:String
) : Number|undefined;
```

##### .getStats()
Retrieves the list of stats.

Stats that have an unit specified are formated accordingly to be more readable.

Supported units are:

- `b`: bytes, formated as "1.5 MB", "2.12 KB", etc.
- `ms`: milliseconds, formated as "1.123456 s", "3 minutes 1 second", "5 days 3 hours".
- other units are just appended with a space to the value.

Returns a mapping where the key is the name of the stat and the value is its value.

```js
.getStats(
	options:Object|undefined
) : Object;
```

`options` can be given to specify the formating of known units. It can be an object like

```js
{
	Bytes: Object,
	Time: Object
}
```

The defaults are comming from `Stats.DefaultFormatting`. `Bytes` is passed to
`FormatUtils.formatBytes()` and `Time` is passed to
`TimeUtils.timeAgoFormat()`.

### FormatUtils
A collection of static methods for formatting units and similar.
This is used internally by the `Stats` class.

#### Methods

##### FormatUtils.formatBytes()
Converts a size in bytes to a bigger scale of bytes (e.g. KB, MB, etc). The
scale will be automatically determined.

```js
FormatUtils.formatBytes(
	bytes:Number,
	options:Object|undefined
) : String;
```

`options` takes the following format:

```js
{
	// sprintf style format string, defaults to FormatUtils.DefaultFormat.Bytes
	// it will receive two arguments- one float and one string for the unit.
	// The default format is '%01.2f %s'
	Format: String,

	// force an output unit
	// for IEC it could be 'B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'
	// for SI it could be 'B', 'KB', 'MB', 'GB', 'TB', 'PB'
	ForceUnit: Boolean,

	// whether to use SI (1000 bytes in KB) units or IEC (1024 bytes in a Kib)
	// this will be infered from ForceUnit
	UseSi: Boolean

}
```

### TimeUtils
A collection of static methods for formatting time.
This is used internally by the `Stats` class.

#### Methods

##### .timeAgoFormat()
Returns the time difference between two dates as formatted string.

For example `1 year 2 months`, `1 minute 3 seconds`, `10 hours`.

If `date1` is omitted the number of milliseconds repsented by `date2` will be
treated as the difference between `date2` and `date1`.

```js
TimeUtils.timeAgoFormat(
	date2:Number|Date,
	date1:Number|Date|undefined,
	options:Object
) : String;
```

`options` takes the following format:

```js
{
	// If false the return value will contain only the most significant time unit (i.e. short format).
	Precise: Boolean,

	// sprintf format string for long format. The default is '%d %s %d %s'.
	LongFormat: String,

	// sprintf format string for short format. The default is '%d %s'.
	ShortFormat: String,

	// This provides support for translating the time interval names.
	// The defaults are 'year', 'month', 'day', etc. If 'short' is passed the default will be 'y', 'm', 'd', etc.
	Strings: Object|'short'
}
```

##### .timeAgo()
Returns the time difference between two dates as array.

For example `[1, 'year', 2, 'months']`, `[1, 'minute', 2, 'seconds']`, `[10, 'hours']`.

If `date1` is omitted the number of milliseconds repsented by `date2` will be
treated as the difference between `date2` and `date1`.

```js
TimeUtils.timeAgo(
	date2:Number|Date,
	date1:Number|Date|undefined,
	options:Object
) : String;
```

`options` takes the following format:

```js
{
	// If false the return value will contain only the most significant time unit (i.e. short format).
	Precise: Boolean
}
```


Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)
