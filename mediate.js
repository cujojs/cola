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

	var when, most, atomically, createProxy, injectArgument, observe;

	when = require('when');
	most = require('most');
	atomically = require('./lib/atomically');
	createProxy = require('./lib/proxy');
	injectArgument = require('./data/transaction/injectArgument');
	observe = require('./data/transaction/observe');

	mediate.view = mediateView;
	mediate.controller = mediateController;

	return mediate;

	function mediate(view, controller, dataset) {
		dataset = observe(view, dataset);

		return {
			view: mediateView(view, dataset),
			controller: mediateController(controller, dataset)
		};
	}

	function mediateView(view, dataset) {
		return Object.create(view, {
			refresh: {
				value: function() {
					var self = this;
					return when(dataset.fetch(), function(data) {
						return Array.isArray(data)
							? most.fromArray(data) : most.of(data);
					}).then(function(stream) {
						self.set(stream).forEach(noop);
					});
				},
				configurable: true,
				writable: true
			}
		});
	}

	function mediateController(controller, dataset) {
		return createProxy(
			transactionInterceptor(dataset, injectArgument()),
			transactionPointcut, controller);
	}


	function transactionPointcut(method) {
		return /^[^_]/.test(method);
	}

	function transactionInterceptor(datasource, injector) {
		return function(obj, method, args) {
			return atomically(function(data) {

				var correlate = injector(data, obj, args);
				var result = obj[method].apply(obj, args);

				return correlate(result);
			}, datasource);
		};
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
