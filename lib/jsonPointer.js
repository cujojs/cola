/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var path = require('./path');

	return {
		getValue: getValue,
		setValue: setValue,
		add: add,
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

	function add(x, path, value) {
		var pointer = find(x, path);
		if(pointer) {
			if(Array.isArray(pointer.target)) {
				pointer.target.splice(parseInt(pointer.key, 10), 0, value);
			}
			pointer.target[pointer.key] = value;
		}
	}

	function remove(x, path) {
		var pointer = find(x, path);
		if(pointer) {
			if(Array.isArray(pointer.target)) {
				pointer.target.splice(parseInt(pointer.key, 10), 1);
			} else {
				delete pointer.target[pointer.key];
			}
		}
	}

	function find(x, p) {
		if(!p || p === '/') {
			return;
		}

		p = path.split(p);

		var i, len = p.length;

		if(len === 0) {
			return;
		}

		if(len === 1) {
			return { target: x, key: p[0] };
		}

		for(i=0, len=len-1; i<len; i++) {
			x = x[p[i]];
		}

		return { target: x, key: p[len] };
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
