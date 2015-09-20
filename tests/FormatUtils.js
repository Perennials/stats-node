"use strict";

var FormatUtils = require( '../FormatUtils' );

Unitest( 'FormatUtils.formatBytes()', function ( test ) {

	test.eq( FormatUtils.formatBytes( 1000*1000 ), '1.00 MB' );
	test.eq( FormatUtils.formatBytes( 1024*1024, null, null, false ), '1.00 MiB' );

} );