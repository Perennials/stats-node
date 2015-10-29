"use strict";

require( 'Prototype' );
var Sprintf = require( 'sprintf-js' ).sprintf;

//ported from https://github.com/Perennials/providerkit-core-php/blob/master/src/utils/FormatUtils.php

class FormatUtils {

	static formatBytes ( bytes, options ) {

		if ( !Object.isObject( options ) ) {
			options = {};
		}
		// Format string
		var format = options.Format;
		if ( !String.isString( options.Format ) ) {
			format = FormatUtils.DefaultFormat.Bytes;
		}

		var si = options.UseSi !== undefined ? options.UseSi : true;
		var forceunit = options.ForceUnit;

		// IEC prefixes (binary)
		if ( si == false || (String.isString( forceunit ) && forceunit.indexOf( 'i' ) >= 0) ) {
			var units = [ 'B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB' ];
			var mod = 1024;
		}
		// SI prefixes (decimal)
		else {
			var units = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];
			var mod = 1000;
		}

		// Determine unit to use
		var power = 0;
		if ( (power = units.indexOf( forceunit )) < 0 ) {
			power = (bytes > 0) ? Math.floor( Math.log( bytes ) / Math.log( mod ) ) : 0;
		}

		return Sprintf( format, bytes / Math.pow( mod, power ), units[ power ] );
	}
}

FormatUtils.static( {
	DefaultFormat: {
		Bytes: '%01.2f %s'
	}
} )

module.exports = FormatUtils;