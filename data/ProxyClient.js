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
	var jsonPointer = require('../lib/jsonPointer');
	var Registration = require('../dom/Registration');

	function ProxyClient(identify, invoker) {
		this.id = identify;
		this.invoker = typeof invoker === 'function' ? invoker : this._defaultInvoker;
	}

	ProxyClient.prototype = {
		get: function(path) {
			return jsonPointer.getValue(this.data, path, this.data);
		},

		set: function(data) {
			this.data = jsonPatch.snapshot(data);
		},

		diff: function(shadow) {
			if(!this._hasChanged) {
				return;
			}
			this._hasChanged = false;
			return jsonPatch.diff(shadow, this.data, this.id);
		},

		patch: function(patch) {
			this.data = jsonPatch.patch(patch, this.data);
		},

		proxy: function(mediator) {
			var self = this;
			return createProxy(function(target, method, args) {
				var result = self.invoker(target, method, args, self.data);

				self.data = preferResult(self.data, result);
				self._hasChanged = true;
				self.changed();
				return result;
			}, function(method) {
				return /^[^_]/.test(method);
			}, mediator);
		},

		_defaultInvoker: function(target, method, args, data) {
			args.unshift(data);
			return target[method].apply(target, args);
		},

		changed: function() {}
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
