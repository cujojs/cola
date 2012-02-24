/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {
"use strict";

	var Notifier, stopIteration;

	Notifier = require('./Notifier');
	stopIteration = {};

	/**
	 * @constructor
	 * @param obj {Object}
	 * @param options {Object}
	 */
	function ObjectAdapter(obj, options) {

		this._obj = obj;
		this._options = options;
		this._notifier = new Notifier();

	}

	ObjectAdapter.prototype = {

		watch: function (name, callback) {
			return this._notifier.listen(name, callback);
		},

		watchAll: function (callback) {
			return this._notifier.listen('*', callback);
		},

		set: function (name, value) {
			var obj = this._obj;
			if (obj[name] != value) {
				obj[name] = value;
				return notify(this._notifier, value, [name, '*'], name);
			}
		},

		forEach: function (lambda) {
			for (var p in this._obj) {
				lambda(this._obj[p], p);
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

	/**
	 * Calls all listener functions with the details of a modified
	 * property.
	 * @private
	 * @param notifier {Notifier} notifier whose listeners will be notified
	 * @param value the new value of the property that changed
	 * @param signals {String} the listener signals to notify
	 * @param [name] {String} name of the property that changed.  If not supplied, key will be used
	 */
	function notify (notifier, value, signals, name) {
		return notifier.notifyAll(signals, name, value);
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));