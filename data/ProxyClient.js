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

	function ProxyClient() {}

	ProxyClient.prototype = {
		set: function(data) {
			this._shadow = data;
			this.data = jsonPatch.snapshot(data);
		},

		update: function(changes) {
			this._shadow = jsonPatch.patch(changes, this._shadow);
			this.data = jsonPatch.patch(changes, this.data);
		},

		sync: function() {
			var d = jsonPatch.diff(this._shadow, this.data);
			this._shadow = jsonPatch.patch(d, this._shadow);
			return d;
		},

		proxy: function(mediator) {
			var self = this;
			return createProxy(function(target, method, args) {
				var result = target[method].apply(target, [self.data].concat(args));

				self.data = preferResult(self.data, result);
				self.hint(self);
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
