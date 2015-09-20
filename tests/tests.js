"use strict";

require( 'Unitest' ).enable();

if ( process.argv[2] == 'nocolor' ) {
	Unitest.noColor();
}

require( './FormatUtils.js' );
require( './TimeUtils.js' );