/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
"use strict";

	/**
	 * @constructor
	 * @param obj {Object}
	 * @param options {Object}
	 */
	function ObjectAdapter(obj, options) {

		this._obj = obj;
		this._options = options;

	}

	ObjectAdapter.prototype = {

		update: function (item) {
			var p, obj;
			// don't replace item in case we got a partial object
			obj = this._obj;
			for (p in item) {
				obj[p] = item[p];
			}
		},

		getOptions: function () {
			return this._options;
		}

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter.  Returns true if the object is of type 'object'.
	 * @param obj
	 * @returns {Boolean}
	 */
	ObjectAdapter.canHandle = function (obj) {
		// this seems close enough to ensure that instanceof works.
		// a RegExp will pass as a valid prototype, but I am not sure
		// this is a bad thing even if it is unusual.
		return Object.prototype.toString.call(obj) == '[object Object]';
	};

	return ObjectAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));