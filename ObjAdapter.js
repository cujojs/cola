/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {
	"use strict";

	var makeWatchable;

	makeWatchable = require('./Watchable');

	/**
	 * @constructor
	 * @param obj {Object}
	 * @returns {Watchable}
	 */
	function ObjAdapter(obj) {

		this._watchable = makeWatchable(obj);

		// set blank bindings
		this.setBindings({});
	}

	ObjAdapter.prototype = {

		watch: function (name, callback) {
			return this._watchable.watch(name, callback);
		},

		watchAll: function (callback) {
			return this._watchable.watch('*', callback);
		},

		set: function (name, value) {
			// note: this has an intended side-effect: watchers will
			// be notified.
			this._watchable.set(name, value);
		},

		/**
		 * Sets the binding info for this object.
		 * TODO: do something with these bindings
		 * @param bindings
		 */
		setBindings: function (bindings) {
			this._bindings = bindings;
		}

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter.  Returns true if the object is of type 'object'.
	 * @param obj
	 * @returns {Boolean}
	 */
	ObjAdapter.canHandle = function (obj) {
		// this seems close enough to ensure that instanceof works.
		// a RegExp will pass as a valid prototype, but I am not sure
		// this is a bad thing even if it is unusual.
		return obj && typeof obj == 'object';
	};

	return ObjAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));