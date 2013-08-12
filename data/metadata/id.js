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

	var defaultId;

	from.property = property;
	from.default = defaultId = property('id');

	return from;

	function property(idProperty) {
		return function(object) {
			return object[idProperty];
		};
	}

	function from(id) {
		if(typeof id === 'function') {
			return id;
		}

		if(typeof id === 'string') {
			return property(id);
		}

		return defaultId;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
