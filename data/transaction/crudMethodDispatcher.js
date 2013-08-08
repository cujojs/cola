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

	var methodMap, undef;

	methodMap = {
		'new': 'create',
		'updated': 'update',
		'deleted': 'remove'
	}

	return function crudMethodDispatcher(object, operation, args) {
		var method = methodMap[operation];

		if(method && typeof object[method] === 'function') {
			return object[method].apply(object, args);
		}

		return undef;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
