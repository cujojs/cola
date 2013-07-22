/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {

	var classRx, trimLeadingRx, splitClassNamesRx;

	classRx = '(\\s+|^)(classNames)(\\b(?![\\-_])|$)';
	trimLeadingRx = /^\s+/;
	splitClassNamesRx = /(\b\s+\b)|(\s+)/g;

	return {
		add: addClass,
		remove: removeClass
	};

	function addClass (className, str) {
		var newClass;

		if(!className) {
			return str;
		}

		newClass = removeClass(className, str);

		if(newClass && className) {
			newClass += ' ';
		}

		return newClass + className;
	}

	function removeClass (removes, tokens) {
		var rx;

		if (!removes) {
			return tokens;
		}

		// convert space-delimited tokens with bar-delimited (regexp `or`)
		removes = removes.replace(splitClassNamesRx,
			function (m, inner, edge) {
				// only replace inner spaces with |
				return edge ? '' : '|';
			}
		);

		// create one-pass regexp
		rx = new RegExp(classRx.replace('classNames', removes), 'g');

		// remove all tokens in one pass (wish we could trim leading
		// spaces in the same pass! at least the trim is not a full
		// scan of the string)
		return tokens.replace(rx, '').replace(trimLeadingRx, '');
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
