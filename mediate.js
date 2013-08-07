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

	var when, meld, injectArgument, observe;

	when = require('when');
	meld = require('meld');
	injectArgument = require('./data/transaction/injectArgument');
	observe = require('./data/transaction/observe');

	return function mediate(datasource, controller, observer, options) {
		var pointcut, injector, aspect;

		if(!options) {
			options = {};
		}

		// TODO: Instead of pointcut, accept a capability mapping object
		injector = options.injector || injectArgument();
		pointcut = options.pointcut || /^[^_]/;

		datasource = observe(observer, datasource);

		aspect = meld.around(controller, pointcut, transactionAdvice);

		return {
			destroy: aspect.remove,
			refresh: refresh
		};

		function refresh() {
			return when(datasource.fetch(), function(data) {
				return observer.set(data);
			});
		}

		function transactionAdvice(joinpoint) {
			return when(datasource.fetch(), function(data) {
				var diff, correlate, result, next;

				diff = datasource.metadata.diff(data);
				correlate = injector(data, joinpoint.target, joinpoint.args);

				result = when(joinpoint.proceedApply(joinpoint.args));

				next = result.then(updateTransaction);

				if(typeof datasource.commit === 'function') {
					next = next.then(commitTransaction);
				}

				return next.yield(result);

				function updateTransaction(result) {
					return datasource.update(diff(correlate(result)));
				}

				function commitTransaction() {
					return datasource.commit();
				}
			});
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
