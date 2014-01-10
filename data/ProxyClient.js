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
	var jsonPatch = require('../lib/jsonPatch');

	function ProxyClient(identify) {
		this.id = identify;
	}

	ProxyClient.prototype = {
		set: function(data) {
			this.data = jsonPatch.snapshot(data);
		},

		diff: function(shadow) {
			return jsonPatch.diff(shadow, this.data, this.id);
		},

		patch: function(patch) {
			this.data = jsonPatch.patch(patch, this.data);
		},

		proxy: function(mediator) {
			var self = this;
			return createProxy(function(target, method, args) {
				var result = target[method].apply(target, [self.data].concat(args));

				self.data = preferResult(self.data, result);
				return result;
			}, function(method) {
				return /^[^_]/.test(method);
			}, mediator);
		}
	};

	function preferResult(input, output) {
		var shouldPreferResult;

		if(input !== output) {
			if(input === Object(input) && typeof input.constructor === 'function') {
				shouldPreferResult = output instanceof input.constructor;
			} else {
				shouldPreferResult = typeof output === typeof input;
			}
		}

		return shouldPreferResult ? output : input;
	}

	return ProxyClient;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
