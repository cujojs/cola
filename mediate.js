/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var when, most, createProxy, injectArgument, observe;

	when = require('when');
	most = require('most');
	createProxy = require('./lib/proxy');
	injectArgument = require('./data/transaction/injectArgument');
	observe = require('./data/transaction/observe');

	return function mediate(datasource, controller, observer, options) {
		var pointcut, injector;

		if(!options) {
			options = {};
		}

		// TODO: Instead of pointcut, accept a capability mapping object
		injector = options.injector || injectArgument();
		pointcut = options.pointcut || transactionPointcut;

		if(observer) {
			datasource = observe(observer, datasource);
		}

		refresh();
		return createProxy(transactionInterceptor(datasource, injector), pointcut, controller);

		function refresh() {
			return when(datasource.fetch(), function(data) {
				return Array.isArray(data)
					? most.fromArray(data) : most.of(data);
			}).then(function(stream) {
				stream.each(observer.add);
			});
		}
	};

	function transactionPointcut(method) {
		return /^[^_]/.test(method);
	}

	function transactionInterceptor(datasource, injector) {
		return function(obj, method, args) {
			return when(datasource.fetch(), function(data) {
				var diff, correlate;

				diff = datasource.metadata.diff(data);
				correlate = injector(data, obj, args);

				var result = obj[method].apply(obj, args);
				return when(result, updateTransaction);

				function updateTransaction(result) {
					return datasource.update(diff(correlate(result))).yield(result);
				}
			});
		};
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
