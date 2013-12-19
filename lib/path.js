/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function() {

	var separator = '/';

	return {
		join: join,
		split: split,
		trim: trim,
		rooted: rooted,
		isAbsolute: isAbsolute
	};

	function join(head, tail) {
		if(!head) {
			return tail;
		}
		if(!tail) {
			return head;
		}

		return head + rooted(tail);
	}

	function split(path) {
		if(path[0] === separator) {
			path = path.slice(1);
		}

		return path.split(separator);
	}

	function isAbsolute(path) {
		return path != null && path[0] === separator;
	}

	function rooted(path) {
		return path == null || path[0] === separator ? path : separator + path;
	}

	function trim(path, prefix) {
		var trimmed = path.slice(0, prefix.length);
		return trimmed === prefix ? path.slice(prefix.length) : path;
	}


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
