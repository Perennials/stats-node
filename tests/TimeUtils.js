"use strict";

var TimeUtils = require( '../TimeUtils' );

Unitest( 'TimeUtils.timeAgo()', function ( test ) {

	test.eq( TimeUtils.timeAgoFormat( 60*1000 ), '1 minute' );
	test.eq( TimeUtils.timeAgoFormat( 60*1000+30*1000 ), '1 minute 30 seconds' );
	test.eq( TimeUtils.timeAgoFormat( 30*1000+500 ), '30 seconds 500 miliseconds' );

} );