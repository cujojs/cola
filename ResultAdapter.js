/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {

	"use strict";

	var ObjectAdapter, when;

	ObjectAdapter = require('./ObjectAdapter');
	when = require('when');

	/**
	 * Manages a single object, which is the resolution value of obj.
	 * @constructor
	 * @param obj {Object|Promise}
	 * @param options {Object}
	 */
	function ResultAdapter(obj, options) {
		ObjectAdapter.call(this, obj, options);
	}

	ResultAdapter.prototype = {

		update: makePromiseAware(ObjectAdapter.prototype.update),

		getOptions: ObjectAdapter.prototype.getOptions

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter.  Returns true if the object is a promise or
	 * ObjectAdapter.canHandle returns true;
	 *
	 * WARNING: Testing for a promise is NOT sufficient, since the promise
	 * may result to something that this adapter cannot handle.
	 *
	 * @param obj
	 * @returns {Boolean}
	 */
	ResultAdapter.canHandle = function (obj) {
		return when.isPromise(obj) || ObjectAdapter.canHandle(obj);
	};

	return ResultAdapter;

	/**
	 * Returns a new function that will delay execution of the supplied
	 * function until this._obj has resolved.
	 *
	 * @param func {Function} original function
	 * @return {Promise}
	 */
	function makePromiseAware(func) {
		return function() {
			var self, args;

			self = this;
			args = Array.prototype.slice.call(arguments);

			return when(this._obj, function() {
				return func.apply(self, args);
			});
		}
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));