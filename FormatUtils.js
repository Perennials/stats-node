"use strict";

//ported from https://github.com/Perennials/providerkit-core-php/blob/master/src/utils/FormatUtils.php

/**
A compilation of formating related functions.

@author Borislav Peev <borislav.asdf@gmail.com>
*/
class FormatUtils {

	/**
	Converts a size in bytes to a bigger scale of bytes (e.g. KB, MB, etc). The scale will be automatically determined.

	@param int the size in bytes
	@param string a definitive unit
	@param string the return string format.
	See {@see sprintf()}; it will receive two arguments- one float and one string for the unit.
	The default format is '%01.2f %s'
	@param bool whether to use SI (1000 bytes in KB) units or IEC (1024 bytes in a Kib)
	@return string the default is something like "3.45 MB" (two points precision)
	@author this function comes from the net and is refactored by bobef
	*/
	static formatBytes ( bytes, forceunit /*= null*/, /*format = null,*/ si /*= true*/ ) {
		// Format string
		// if ( format === null ) {
		// 	format = '%01.2f %s';
		// }

		si = si || true;

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
		if ( power = units.indexOf( forceunit ) < 0 ) {
			power = (bytes > 0) ? Math.floor( Math.log( bytes, mod ) ) : 0;
		}

		return `${ (bytes / Math.pow( mod, power )).toPrecision( 2 ) } ${ units[ power ] }`;
		// return sprintf( format, bytes / pow( mod, power ), units[ power ] );
	}
}

module.exports = FormatUtils;