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

	var createProxy = require('../lib/proxy');
	var atomically = require('../lib/atomically');
	var injectArgument = require('./transaction/injectArgument');

	return function createDataEditor(doc, controller, observer) {
		return createProxy(
			transactionInterceptor(doc, observer, injectArgument()),
			transactionPointcut, controller);
	}


	function transactionPointcut(method) {
		return /^[^_]/.test(method);
	}

	function transactionInterceptor(datasource, observer, injector) {
		return function(obj, method, args) {
			return atomically(function(data) {

				var correlate = injector(data, obj, args);
				var result = obj[method].apply(obj, args);

				return correlate(result);
			}, datasource).spread(observer);
		};
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
