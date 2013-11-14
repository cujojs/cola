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

	return function createProxy(handler, matcher, obj) {
		var proxy = Object.create(obj);

		for(var p in obj) {
			if (typeof obj[p] === 'function' && matcher(p, obj)) {
				proxy[p] = createInterceptor(handler, obj, p);
			}
		}

		return proxy;
	};

	function createInterceptor(handler, obj, method) {
		return function() {
			return handler(obj, method, Array.prototype.slice.call(arguments));
		};
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

