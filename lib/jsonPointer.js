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

	return {
		getValue: getValue,
		setValue: setValue,
		remove: remove,
		find: find
	};

	function getValue(x, path, defaultValue) {
		var pointer = find(x, path);

		return pointer ? pointer.target[pointer.key] : defaultValue;
	}

	function setValue(x, path, value) {
		var pointer = find(x, path);
		if(pointer) {
			pointer.target[pointer.key] = value;
		}
	}

	function remove(x, path) {
		var pointer = find(x, path);
		if(pointer) {
			delete pointer.target[pointer.key];
		}
	}

	function find(x, path) {
		if(path == null) {
			return;
		}

		if(path[0] === '/') {
			path = path.slice(1);
		}

		path = path.split('/');

		var i, len = path.length;

		if(len === 0) {
			return;
		}

		if(len === 1) {
			return { target: x, key: path[0] };
		}

		for(i=0, len=len-1; i<len; i++) {
			x = x[path[i]];
		}

		return { target: x, key: path[len] };
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
